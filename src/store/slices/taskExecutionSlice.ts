import type { StateCreator } from 'zustand';
import type {
  TaskExecutionState,
  TaskExecutionPhase,
  RequirementStatus,
  TaskRequirement,
  Assumption,
} from '@/types';
import { TASK_ASSISTANCE_CONFIG } from '@/lib/taskRequirements';

export interface TaskExecutionSlice {
  // Current execution state
  currentTaskExecution: TaskExecutionState | null;

  // History of completed executions
  taskExecutionHistory: TaskExecutionState[];

  // Actions
  startTaskExecution: (taskId: string) => void;
  runInfoCheck: (getContextField: (path: string) => { value: unknown; confidence: number; status: string } | null) => void;
  proceedToGathering: () => void;
  proceedToGeneration: () => void;
  submitForReview: (output: unknown, confidence: number, assumptions?: Assumption[]) => void;
  provideFeedback: (feedback: string) => void;
  approveOutput: () => void;
  cancelExecution: () => void;

  // Getters
  canProceedWithExecution: () => boolean;
  getMissingRequirements: () => TaskRequirement[];
  getCurrentPhase: () => TaskExecutionPhase | null;
}

export const createTaskExecutionSlice: StateCreator<
  TaskExecutionSlice,
  [],
  [],
  TaskExecutionSlice
> = (set, get) => ({
  currentTaskExecution: null,
  taskExecutionHistory: [],

  startTaskExecution: (taskId) => {
    const config = TASK_ASSISTANCE_CONFIG[taskId];
    if (!config) {
      console.error(`No configuration found for task: ${taskId}`);
      return;
    }

    set({
      currentTaskExecution: {
        taskId,
        phase: 'info_check',
        infoCheck: {
          requirements: [],
          overallReadiness: 0,
          canProceed: false,
          canProceedWithWarnings: false,
          blockers: [],
          warnings: [],
        },
        output: {
          content: null,
          confidence: 0,
          assumptions: [],
          sourcesUsed: [],
        },
        review: {
          userFeedback: [],
          iterations: 0,
          approved: false,
        },
      },
    });
  },

  runInfoCheck: (getContextField) => {
    const execution = get().currentTaskExecution;
    if (!execution) return;

    const config = TASK_ASSISTANCE_CONFIG[execution.taskId];
    if (!config) return;

    // Check each requirement
    const requirementStatuses: RequirementStatus[] = config.requirements.map(
      (req) => {
        const field = getContextField(req.contextPath);

        let status: RequirementStatus['status'] = 'missing';
        let confidence = 0;
        let message = '';

        if (field && field.value !== null) {
          if (field.status === 'complete' || field.status === 'verified') {
            status = 'complete';
            confidence = field.confidence;
            message = '✓ Vorhanden';
          } else if (field.status === 'partial') {
            status = 'partial';
            confidence = field.confidence;
            message = 'Teilweise vorhanden - könnte verbessert werden';
          }
        } else {
          status = 'missing';
          confidence = 0;
          message = 'Fehlt - wird für gutes Ergebnis benötigt';
        }

        return {
          requirementId: req.id,
          status,
          currentValue: field?.value,
          confidence,
          message,
        };
      }
    );

    // Calculate overall readiness
    const totalConfidence = requirementStatuses.reduce(
      (sum, r) => sum + r.confidence,
      0
    );
    const overallReadiness = Math.round(
      totalConfidence / requirementStatuses.length
    );

    // Determine blockers and warnings
    const blockers: string[] = [];
    const warnings: string[] = [];

    config.requirements.forEach((req, index) => {
      const status = requirementStatuses[index];

      if (req.importance === 'critical' && status.status === 'missing') {
        blockers.push(
          `"${req.label}" fehlt und ist kritisch für ein gutes Ergebnis`
        );
      } else if (req.importance === 'important' && status.status === 'missing') {
        warnings.push(
          `"${req.label}" fehlt - Ergebnis wird weniger präzise sein`
        );
      } else if (status.status === 'partial') {
        warnings.push(`"${req.label}" ist unvollständig`);
      }
    });

    // Check minimum requirements
    const minReqsMet = config.minimumRequirements.every((reqId) => {
      const status = requirementStatuses.find((r) => r.requirementId === reqId);
      return status && status.status !== 'missing';
    });

    const canProceed =
      blockers.length === 0 &&
      overallReadiness >= config.qualityGate.minConfidenceToStart;

    const canProceedWithWarnings =
      minReqsMet &&
      overallReadiness >= config.qualityGate.minConfidenceToStart * 0.7;

    set({
      currentTaskExecution: {
        ...execution,
        infoCheck: {
          requirements: requirementStatuses,
          overallReadiness,
          canProceed,
          canProceedWithWarnings,
          blockers,
          warnings,
        },
      },
    });
  },

  proceedToGathering: () => {
    set((state) => {
      if (!state.currentTaskExecution) return state;
      return {
        currentTaskExecution: {
          ...state.currentTaskExecution,
          phase: 'info_gathering',
        },
      };
    });
  },

  proceedToGeneration: () => {
    set((state) => {
      if (!state.currentTaskExecution) return state;
      return {
        currentTaskExecution: {
          ...state.currentTaskExecution,
          phase: 'generating',
        },
      };
    });
  },

  submitForReview: (output, confidence, assumptions = []) => {
    set((state) => {
      if (!state.currentTaskExecution) return state;
      return {
        currentTaskExecution: {
          ...state.currentTaskExecution,
          phase: 'reviewing',
          output: {
            ...state.currentTaskExecution.output,
            content: output,
            confidence,
            assumptions,
          },
        },
      };
    });
  },

  provideFeedback: (feedback) => {
    set((state) => {
      if (!state.currentTaskExecution) return state;
      return {
        currentTaskExecution: {
          ...state.currentTaskExecution,
          phase: 'refining',
          review: {
            ...state.currentTaskExecution.review,
            userFeedback: [
              ...state.currentTaskExecution.review.userFeedback,
              feedback,
            ],
            iterations: state.currentTaskExecution.review.iterations + 1,
          },
        },
      };
    });
  },

  approveOutput: () => {
    set((state) => {
      if (!state.currentTaskExecution) return state;

      const completedExecution: TaskExecutionState = {
        ...state.currentTaskExecution,
        phase: 'completed',
        review: {
          ...state.currentTaskExecution.review,
          approved: true,
        },
      };

      return {
        currentTaskExecution: null,
        taskExecutionHistory: [...state.taskExecutionHistory, completedExecution],
      };
    });
  },

  cancelExecution: () => {
    set({ currentTaskExecution: null });
  },

  canProceedWithExecution: () => {
    const execution = get().currentTaskExecution;
    return execution?.infoCheck.canProceed ?? false;
  },

  getMissingRequirements: () => {
    const execution = get().currentTaskExecution;
    if (!execution) return [];

    const config = TASK_ASSISTANCE_CONFIG[execution.taskId];
    if (!config) return [];

    return config.requirements.filter((req) => {
      const status = execution.infoCheck.requirements.find(
        (r) => r.requirementId === req.id
      );
      return status && status.status === 'missing';
    });
  },

  getCurrentPhase: () => {
    return get().currentTaskExecution?.phase ?? null;
  },
});
