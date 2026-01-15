import type { StateCreator } from 'zustand';
import type { RouteResult, ActionTask } from '@/types';

export interface RouteSlice {
  routeResult: RouteResult | null;
  completedTasks: string[];
  isCalculating: boolean;

  setRouteResult: (result: RouteResult) => void;
  toggleTaskComplete: (taskId: string) => void;
  setIsCalculating: (calculating: boolean) => void;
  resetRoute: () => void;
  getTaskCompletionRate: () => number;
  getPhaseCompletionRate: (phaseIndex: number) => number;
}

export const createRouteSlice: StateCreator<RouteSlice> = (set, get) => ({
  routeResult: null,
  completedTasks: [],
  isCalculating: false,

  setRouteResult: (result) => set({ routeResult: result }),

  toggleTaskComplete: (taskId) =>
    set((state) => ({
      completedTasks: state.completedTasks.includes(taskId)
        ? state.completedTasks.filter((id) => id !== taskId)
        : [...state.completedTasks, taskId],
    })),

  setIsCalculating: (calculating) => set({ isCalculating: calculating }),

  resetRoute: () =>
    set({
      routeResult: null,
      completedTasks: [],
      isCalculating: false,
    }),

  getTaskCompletionRate: () => {
    const { routeResult, completedTasks } = get();
    if (!routeResult) return 0;

    const totalTasks = routeResult.actionPlan.phases.reduce(
      (sum, phase) => sum + phase.tasks.length,
      0
    );

    if (totalTasks === 0) return 0;
    return (completedTasks.length / totalTasks) * 100;
  },

  getPhaseCompletionRate: (phaseIndex) => {
    const { routeResult, completedTasks } = get();
    if (!routeResult || !routeResult.actionPlan.phases[phaseIndex]) return 0;

    const phase = routeResult.actionPlan.phases[phaseIndex];
    const completedInPhase = phase.tasks.filter((task) =>
      completedTasks.includes(task.id)
    ).length;

    if (phase.tasks.length === 0) return 0;
    return (completedInPhase / phase.tasks.length) * 100;
  },
});
