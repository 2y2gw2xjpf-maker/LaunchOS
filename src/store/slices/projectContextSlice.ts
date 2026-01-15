import type { StateCreator } from 'zustand';
import type { ProjectContext, InfoField } from '@/types';

// Helper to create empty InfoField
function emptyField<T>(): InfoField<T> {
  return {
    value: null,
    status: 'missing',
    confidence: 0,
    source: 'user_input',
    lastUpdated: null,
  };
}

// Create empty project context
function createEmptyProjectContext(id: string, name: string): ProjectContext {
  const now = new Date().toISOString();
  return {
    id,
    name,
    createdAt: now,
    updatedAt: now,

    core: {
      problemStatement: emptyField(),
      solution: emptyField(),
      targetCustomer: emptyField(),
      uniqueValueProposition: emptyField(),
    },

    market: {
      tam: emptyField(),
      sam: emptyField(),
      som: emptyField(),
      marketTrends: emptyField(),
      competitors: emptyField(),
    },

    business: {
      revenueModel: emptyField(),
      pricingStrategy: emptyField(),
      unitEconomics: emptyField(),
      salesStrategy: emptyField(),
    },

    traction: {
      currentStage: emptyField(),
      users: emptyField(),
      revenue: emptyField(),
      growth: emptyField(),
      keyMilestones: emptyField(),
    },

    team: {
      founders: emptyField(),
      employees: emptyField(),
      advisors: emptyField(),
      keyHires: emptyField(),
    },

    funding: {
      currentRound: emptyField(),
      targetAmount: emptyField(),
      useOfFunds: emptyField(),
      previousFunding: emptyField(),
      runway: emptyField(),
    },

    preferences: {
      investorTypes: emptyField(),
      geographicFocus: emptyField(),
      industryFocus: emptyField(),
      dealBreakers: emptyField(),
    },
  };
}

export interface ProjectContextSlice {
  // Current project context for task assistance
  currentProjectContext: ProjectContext | null;

  // All project contexts
  projectContexts: ProjectContext[];

  // Actions
  createProjectContext: (name: string) => string;
  loadProjectContext: (id: string) => void;
  deleteProjectContext: (id: string) => void;

  // Update a specific field
  updateContextField: <T>(
    path: string,
    value: T,
    source?: InfoField<T>['source'],
    confidence?: number
  ) => void;

  // Get field by path - returns generic InfoField
  getContextField: (path: string) => InfoField<unknown> | null;

  // Calculate overall readiness for a set of requirements
  calculateContextReadiness: (requirementPaths: string[]) => number;

  // Initialize from wizard data
  initializeFromWizardData: (analysisId: string) => void;
}

// Helper to get nested value by path
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return null;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

// Helper to set nested value by path
function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): Record<string, unknown> {
  const result = { ...obj };
  const parts = path.split('.');
  let current: Record<string, unknown> = result;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    current[part] = { ...(current[part] as Record<string, unknown>) };
    current = current[part] as Record<string, unknown>;
  }

  current[parts[parts.length - 1]] = value;
  return result;
}

export const createProjectContextSlice: StateCreator<
  ProjectContextSlice,
  [],
  [],
  ProjectContextSlice
> = (set, get) => ({
  currentProjectContext: null,
  projectContexts: [],

  createProjectContext: (name) => {
    const id = `context_${Date.now()}`;
    const newContext = createEmptyProjectContext(id, name);

    set((state) => ({
      projectContexts: [...state.projectContexts, newContext],
      currentProjectContext: newContext,
    }));

    return id;
  },

  loadProjectContext: (id) => {
    const context = get().projectContexts.find((p) => p.id === id);
    if (context) {
      set({ currentProjectContext: context });
    }
  },

  deleteProjectContext: (id) => {
    set((state) => ({
      projectContexts: state.projectContexts.filter((p) => p.id !== id),
      currentProjectContext:
        state.currentProjectContext?.id === id ? null : state.currentProjectContext,
    }));
  },

  updateContextField: (path, value, source = 'user_input', confidence = 80) => {
    set((state) => {
      if (!state.currentProjectContext) return state;

      const now = new Date().toISOString();
      const newField: InfoField<typeof value> = {
        value,
        status: value !== null && value !== undefined ? 'complete' : 'missing',
        confidence: value !== null && value !== undefined ? confidence : 0,
        source,
        lastUpdated: now,
      };

      const updated = setNestedValue(
        state.currentProjectContext as unknown as Record<string, unknown>,
        path,
        newField
      ) as unknown as ProjectContext;

      updated.updatedAt = now;

      // Update in contexts array
      const projectIndex = state.projectContexts.findIndex(
        (p) => p.id === updated.id
      );
      const newContexts = [...state.projectContexts];
      if (projectIndex >= 0) {
        newContexts[projectIndex] = updated;
      }

      return {
        currentProjectContext: updated,
        projectContexts: newContexts,
      };
    });
  },

  getContextField: (path) => {
    const context = get().currentProjectContext;
    if (!context) return null;

    const value = getNestedValue(
      context as unknown as Record<string, unknown>,
      path
    );
    return value as InfoField<unknown> | null;
  },

  calculateContextReadiness: (requirementPaths) => {
    const context = get().currentProjectContext;
    if (!context) return 0;

    let totalConfidence = 0;
    let count = 0;

    for (const path of requirementPaths) {
      const field = get().getContextField(path);
      if (field) {
        totalConfidence += field.confidence;
        count++;
      }
    }

    return count > 0 ? Math.round(totalConfidence / count) : 0;
  },

  initializeFromWizardData: (analysisId) => {
    // This will be called to initialize context from existing wizard data
    // For now, create a new context
    const id = get().createProjectContext(`Analysis ${analysisId}`);
    console.log('Initialized project context:', id);
  },
});
