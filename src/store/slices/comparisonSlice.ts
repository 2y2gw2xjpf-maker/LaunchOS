import type { StateCreator } from 'zustand';
import type { SavedAnalysis, SavedComparison, ComparisonMetric } from '@/types';

export interface ComparisonSlice {
  // State
  selectedAnalysisIds: string[];
  comparisonType: 'full' | 'route' | 'valuation';
  savedComparisons: SavedComparison[];

  // Actions
  addToComparison: (analysisId: string) => void;
  removeFromComparison: (analysisId: string) => void;
  clearComparison: () => void;
  setComparisonType: (type: 'full' | 'route' | 'valuation') => void;
  toggleInComparison: (analysisId: string) => void;

  // Comparison History
  saveComparison: (name: string, notes?: string) => SavedComparison;
  loadComparison: (id: string) => void;
  deleteComparison: (id: string) => void;
  getSavedComparisons: () => SavedComparison[];

  // Selectors
  canCompare: () => boolean;
  isInComparison: (analysisId: string) => boolean;
  getComparisonCount: () => number;
}

const MAX_COMPARISON_COUNT = 4;
const MIN_COMPARISON_COUNT = 2;

export const createComparisonSlice: StateCreator<ComparisonSlice, [], [], ComparisonSlice> = (
  set,
  get
) => ({
  // Initial State
  selectedAnalysisIds: [],
  comparisonType: 'full',
  savedComparisons: [],

  // Add analysis to comparison
  addToComparison: (analysisId) => {
    const { selectedAnalysisIds } = get();

    // Don't add if already at max or already included
    if (
      selectedAnalysisIds.length >= MAX_COMPARISON_COUNT ||
      selectedAnalysisIds.includes(analysisId)
    ) {
      return;
    }

    set({ selectedAnalysisIds: [...selectedAnalysisIds, analysisId] });
  },

  // Remove analysis from comparison
  removeFromComparison: (analysisId) => {
    set((s) => ({
      selectedAnalysisIds: s.selectedAnalysisIds.filter((id) => id !== analysisId),
    }));
  },

  // Clear all from comparison
  clearComparison: () => {
    set({ selectedAnalysisIds: [] });
  },

  // Set comparison type
  setComparisonType: (type) => {
    set({ comparisonType: type });
  },

  // Toggle analysis in/out of comparison
  toggleInComparison: (analysisId) => {
    const { selectedAnalysisIds } = get();

    if (selectedAnalysisIds.includes(analysisId)) {
      set({
        selectedAnalysisIds: selectedAnalysisIds.filter((id) => id !== analysisId),
      });
    } else if (selectedAnalysisIds.length < MAX_COMPARISON_COUNT) {
      set({ selectedAnalysisIds: [...selectedAnalysisIds, analysisId] });
    }
  },

  // Check if enough analyses selected for comparison
  canCompare: () => {
    return get().selectedAnalysisIds.length >= MIN_COMPARISON_COUNT;
  },

  // Check if specific analysis is in comparison
  isInComparison: (analysisId) => {
    return get().selectedAnalysisIds.includes(analysisId);
  },

  // Get count of analyses in comparison
  getComparisonCount: () => {
    return get().selectedAnalysisIds.length;
  },

  // Save current comparison to history
  saveComparison: (name, notes) => {
    const { selectedAnalysisIds, savedComparisons } = get();

    if (selectedAnalysisIds.length < MIN_COMPARISON_COUNT) {
      throw new Error('Mindestens 2 Analysen für Vergleich erforderlich');
    }

    const newComparison: SavedComparison = {
      id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name,
      createdAt: new Date().toISOString(),
      analysisIds: [...selectedAnalysisIds],
      notes,
    };

    set({ savedComparisons: [newComparison, ...savedComparisons] });
    return newComparison;
  },

  // Load a saved comparison
  loadComparison: (id) => {
    const { savedComparisons } = get();
    const comparison = savedComparisons.find((c) => c.id === id);

    if (comparison) {
      set({ selectedAnalysisIds: [...comparison.analysisIds] });
    }
  },

  // Delete a saved comparison
  deleteComparison: (id) => {
    set((s) => ({
      savedComparisons: s.savedComparisons.filter((c) => c.id !== id),
    }));
  },

  // Get all saved comparisons
  getSavedComparisons: () => {
    return get().savedComparisons;
  },
});

// ==================== COMPARISON HELPERS ====================

export const generateComparisonMetrics = (analyses: SavedAnalysis[]): ComparisonMetric[] => {
  const metrics: ComparisonMetric[] = [];

  // Route Recommendation
  metrics.push({
    label: 'Empfohlene Route',
    key: 'route',
    values: analyses.map((a) => ({
      analysisId: a.id,
      analysisName: a.name,
      value: a.routeResult?.recommendation || 'N/A',
      displayValue: formatRoute(a.routeResult?.recommendation),
    })),
  });

  // Confidence
  metrics.push({
    label: 'Konfidenz',
    key: 'confidence',
    values: analyses.map((a) => ({
      analysisId: a.id,
      analysisName: a.name,
      value: a.routeResult?.confidence || 0,
      displayValue: `${a.routeResult?.confidence || 0}%`,
    })),
    unit: '%',
    betterDirection: 'higher',
  });

  // Bootstrap Score
  metrics.push({
    label: 'Bootstrap Score',
    key: 'bootstrapScore',
    values: analyses.map((a) => ({
      analysisId: a.id,
      analysisName: a.name,
      value: a.routeResult?.scores.bootstrap || 0,
      displayValue: `${a.routeResult?.scores.bootstrap || 0}`,
    })),
    betterDirection: 'neutral',
  });

  // Investor Score
  metrics.push({
    label: 'Investor Score',
    key: 'investorScore',
    values: analyses.map((a) => ({
      analysisId: a.id,
      analysisName: a.name,
      value: a.routeResult?.scores.investor || 0,
      displayValue: `${a.routeResult?.scores.investor || 0}`,
    })),
    betterDirection: 'neutral',
  });

  // Total Budget (Min)
  metrics.push({
    label: 'Budget (Min)',
    key: 'budgetMin',
    values: analyses.map((a) => ({
      analysisId: a.id,
      analysisName: a.name,
      value: a.routeResult?.actionPlan.totalBudget.min || 0,
      displayValue: formatCurrency(a.routeResult?.actionPlan.totalBudget.min || 0),
    })),
    unit: '€',
    betterDirection: 'lower',
  });

  // Total Budget (Max)
  metrics.push({
    label: 'Budget (Max)',
    key: 'budgetMax',
    values: analyses.map((a) => ({
      analysisId: a.id,
      analysisName: a.name,
      value: a.routeResult?.actionPlan.totalBudget.max || 0,
      displayValue: formatCurrency(a.routeResult?.actionPlan.totalBudget.max || 0),
    })),
    unit: '€',
    betterDirection: 'lower',
  });

  // Duration
  metrics.push({
    label: 'Gesamtdauer',
    key: 'duration',
    values: analyses.map((a) => ({
      analysisId: a.id,
      analysisName: a.name,
      value: a.routeResult?.actionPlan.totalDuration || 'N/A',
      displayValue: a.routeResult?.actionPlan.totalDuration || 'N/A',
    })),
  });

  // Task Completion
  metrics.push({
    label: 'Tasks erledigt',
    key: 'tasksCompleted',
    values: analyses.map((a) => {
      const totalTasks =
        a.routeResult?.actionPlan.phases.reduce((sum, p) => sum + p.tasks.length, 0) || 0;
      const completedTasks = a.completedTasks.length;
      return {
        analysisId: a.id,
        analysisName: a.name,
        value: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        displayValue: `${completedTasks}/${totalTasks}`,
      };
    }),
    betterDirection: 'higher',
  });

  return metrics;
};

// Helpers
const formatRoute = (route?: string): string => {
  const labels: Record<string, string> = {
    bootstrap: 'Bootstrap',
    investor: 'Investor',
    hybrid: 'Hybrid',
  };
  return route ? labels[route] || route : 'N/A';
};

const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M €`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K €`;
  }
  return `${value} €`;
};
