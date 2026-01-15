import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createTierSlice, type TierSlice } from './slices/tierSlice';
import { createWizardSlice, type WizardSlice } from './slices/wizardSlice';
import { createValuationSlice, type ValuationSlice } from './slices/valuationSlice';
import { createUISlice, type UISlice } from './slices/uiSlice';
import { createRouteSlice, type RouteSlice } from './slices/routeSlice';
import { createHistorySlice, type HistorySlice } from './slices/historySlice';
import { createComparisonSlice, type ComparisonSlice } from './slices/comparisonSlice';
import { createProjectContextSlice, type ProjectContextSlice } from './slices/projectContextSlice';
import { createTaskExecutionSlice, type TaskExecutionSlice } from './slices/taskExecutionSlice';

export type StoreState = TierSlice &
  WizardSlice &
  ValuationSlice &
  UISlice &
  RouteSlice &
  HistorySlice &
  ComparisonSlice &
  ProjectContextSlice &
  TaskExecutionSlice;

export const useStore = create<StoreState>()(
  persist(
    (...a) => ({
      ...createTierSlice(...a),
      ...createWizardSlice(...a),
      ...createValuationSlice(...a),
      ...createUISlice(...a),
      ...createRouteSlice(...a),
      ...createHistorySlice(...a),
      ...createComparisonSlice(...a),
      ...createProjectContextSlice(...a),
      ...createTaskExecutionSlice(...a),
    }),
    {
      name: 'launchos-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Persist only essential data, not UI state
        // Analysis data is now stored in IndexedDB
        selectedTier: state.selectedTier,
        acknowledgedPrivacy: state.acknowledgedPrivacy,
        wizardData: state.wizardData,
        berkusFactors: state.berkusFactors,
        scorecardFactors: state.scorecardFactors,
        vcMethodInput: state.vcMethodInput,
        comparablesInput: state.comparablesInput,
        dcfInput: state.dcfInput,
        methodResults: state.methodResults,
        routeResult: state.routeResult,
        completedTasks: state.completedTasks,
        // UI preferences
        sidebarOpen: state.sidebarOpen,
        activeAnalysisId: state.activeAnalysisId,
        selectedAnalysisIds: state.selectedAnalysisIds,
      }),
    }
  )
);

// Re-export tier configs for convenience
export { TIER_CONFIGS } from './slices/tierSlice';

// Re-export comparison helpers
export { generateComparisonMetrics } from './slices/comparisonSlice';
