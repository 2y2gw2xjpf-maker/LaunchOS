import type { StateCreator } from 'zustand';
import type { SavedAnalysis, Project, WizardData, DataSharingTier, ValuationMethodResult, RouteResult } from '@/types';
import * as db from '@/lib/storage';

// Combined store type for cross-slice access
interface CombinedStoreState {
  // From TierSlice
  selectedTier: DataSharingTier | null;
  acknowledgedPrivacy: boolean;
  // From WizardSlice
  wizardData: WizardData;
  currentStep: number;
  // From RouteSlice
  routeResult: RouteResult | null;
  completedTasks: string[];
  // From ValuationSlice
  methodResults: ValuationMethodResult[];
}

export interface HistorySlice {
  // State
  analyses: SavedAnalysis[];
  projects: Project[];
  activeAnalysisId: string | null;
  isHistoryLoading: boolean;
  searchQuery: string;
  filterTags: string[];
  hasUnsavedChanges: boolean;

  // Actions - Initialization
  initializeHistory: () => Promise<void>;

  // Actions - Analyses
  loadAnalyses: () => Promise<void>;
  startNewAnalysis: () => void;
  setHasUnsavedChanges: (value: boolean) => void;
  saveCurrentAsAnalysis: (
    name: string,
    projectId?: string | null,
    getCurrentState?: () => {
      tier: DataSharingTier;
      wizardData: WizardData;
      routeResult: SavedAnalysis['routeResult'];
      methodResults: SavedAnalysis['valuationResults']['methodResults'];
      completedTasks: string[];
    },
    ventureId?: string | null
  ) => Promise<SavedAnalysis>;
  loadAnalysis: (id: string) => Promise<SavedAnalysis | null>;
  restoreAnalysisToStore: (id: string) => Promise<boolean>;
  updateAnalysis: (id: string, updates: Partial<SavedAnalysis>) => Promise<void>;
  duplicateAnalysis: (id: string, newName?: string) => Promise<SavedAnalysis | null>;
  deleteAnalysis: (id: string) => Promise<void>;
  moveAnalysisToProject: (analysisId: string, projectId: string | null) => Promise<void>;
  toggleAnalysisFavorite: (id: string) => Promise<void>;
  setActiveAnalysis: (id: string | null) => void;
  findAnalysisForVenture: (ventureId: string) => SavedAnalysis | null;

  // Actions - Projects
  loadProjects: () => Promise<void>;
  createProject: (name: string, color?: string, icon?: string) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string, moveAnalysesTo?: string | null) => Promise<void>;
  toggleProjectExpanded: (id: string) => void;
  reorderProjects: (projectIds: string[]) => Promise<void>;

  // Actions - Search/Filter
  setSearchQuery: (query: string) => void;
  setFilterTags: (tags: string[]) => void;

  // Selectors
  getAnalysesByProject: (projectId: string | null) => SavedAnalysis[];
  getFilteredAnalyses: () => SavedAnalysis[];
  getActiveAnalysis: () => SavedAnalysis | null;
  getUngroupedAnalyses: () => SavedAnalysis[];
  getAllTags: () => string[];

  // Dev/Test utilities
  createTestAnalyses: () => Promise<void>;

  // Demo utilities
  loadDemoAnalysis: (ventureId: string) => Promise<boolean>;
}

const DEFAULT_PROJECT_COLORS = [
  '#1e3a5f',
  '#d4af37',
  '#7c9a8a',
  '#e74c3c',
  '#9b59b6',
  '#3498db',
];

// Module-level flag to prevent re-initialization
let _historyInitialized = false;

export const createHistorySlice: StateCreator<HistorySlice & CombinedStoreState, [], [], HistorySlice> = (set, get) => ({
  // Initial State
  analyses: [],
  projects: [],
  activeAnalysisId: null,
  isHistoryLoading: false,
  searchQuery: '',
  filterTags: [],
  hasUnsavedChanges: false,

  // Initialize - load from IndexedDB and run migration
  initializeHistory: async () => {
    // Prevent multiple initializations using module-level flag
    if (_historyInitialized) {
      return;
    }
    _historyInitialized = true;

    set({ isHistoryLoading: true });
    try {
      // Run migration if needed
      if (db.needsMigration()) {
        await db.migrateFromLocalStorage();
      }

      // Load data with timeout
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout loading data')), 5000)
      );

      const dataPromise = Promise.all([
        db.getAllAnalyses(),
        db.getAllProjects(),
      ]);

      const [analyses, projects] = await Promise.race([dataPromise, timeoutPromise]) as [import('@/types').SavedAnalysis[], import('@/types').Project[]];

      console.log('[LaunchOS] History initialized:', { analyses: analyses.length, projects: projects.length });

      set({
        analyses: analyses.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
        projects: projects.sort((a, b) => a.sortOrder - b.sortOrder),
        isHistoryLoading: false,
      });
    } catch (error) {
      console.error('[LaunchOS] Failed to initialize history:', error);
      set({ isHistoryLoading: false, analyses: [], projects: [] });
    }
  },

  // Load all analyses
  loadAnalyses: async () => {
    try {
      const analyses = await db.getAllAnalyses();
      set({
        analyses: analyses.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
      });
    } catch (error) {
      console.error('[LaunchOS] Failed to load analyses:', error);
    }
  },

  // Start a new fresh analysis (clears activeAnalysisId)
  startNewAnalysis: () => {
    set({
      activeAnalysisId: null,
      hasUnsavedChanges: false,
    });
  },

  // Track unsaved changes
  setHasUnsavedChanges: (value) => {
    set({ hasUnsavedChanges: value });
  },

  // Save current state as a new analysis
  saveCurrentAsAnalysis: async (name, projectId = null, getCurrentState, ventureId = null) => {
    const now = new Date().toISOString();
    const state = getCurrentState?.() || {
      tier: 'minimal' as DataSharingTier,
      wizardData: {
        tier: 'minimal' as DataSharingTier,
        projectBasics: {},
        personalSituation: {},
        goals: {},
        marketAnalysis: {},
        detailedInput: {},
        completedSteps: [],
      },
      routeResult: null,
      methodResults: [],
      completedTasks: [],
    };

    const newAnalysis: SavedAnalysis = {
      id: db.generateId(),
      name,
      createdAt: now,
      updatedAt: now,
      projectId,
      ventureId,
      tier: state.tier,
      wizardData: state.wizardData,
      routeResult: state.routeResult,
      valuationResults: {
        methodResults: state.methodResults,
        finalResult: null,
      },
      completedTasks: state.completedTasks,
      taskTimeTracking: [],
      tags: [],
      notes: '',
      isFavorite: false,
    };

    await db.saveAnalysis(newAnalysis);

    set((s) => ({
      analyses: [newAnalysis, ...s.analyses],
      activeAnalysisId: newAnalysis.id,
    }));

    return newAnalysis;
  },

  // Load a specific analysis (just fetches data, doesn't restore to store)
  loadAnalysis: async (id) => {
    const analysis = await db.getAnalysis(id);
    if (analysis) {
      set({ activeAnalysisId: id });
    }
    return analysis || null;
  },

  // Restore analysis state to the store (wizardData, routeResult, etc.)
  restoreAnalysisToStore: async (id) => {
    const analysis = await db.getAnalysis(id);
    if (!analysis) {
      console.warn('[LaunchOS] Analysis not found for restore:', id);
      return false;
    }

    console.log('[LaunchOS] Restoring analysis to store:', analysis.name);

    // Calculate currentStep based on completedSteps
    const completedSteps = analysis.wizardData?.completedSteps || [];
    let currentStep = 0;
    if (analysis.routeResult) {
      // If we have a result, go to the results step (last step)
      currentStep = 4; // Results step
    } else if (completedSteps.length > 0) {
      // Go to the next incomplete step
      currentStep = Math.min(completedSteps.length, 4);
    }

    // Restore all relevant state at once
    set({
      // History state
      activeAnalysisId: id,
      hasUnsavedChanges: false,
      // Tier state
      selectedTier: analysis.tier,
      acknowledgedPrivacy: true,
      // Wizard state
      wizardData: analysis.wizardData,
      currentStep,
      // Route state
      routeResult: analysis.routeResult,
      completedTasks: analysis.completedTasks || [],
      // Valuation state (if we have it)
      methodResults: analysis.valuationResults?.methodResults || [],
    });

    return true;
  },

  // Find the most recent analysis for a venture
  findAnalysisForVenture: (ventureId) => {
    const { analyses } = get();
    // Find analyses for this venture, sorted by updatedAt descending
    const ventureAnalyses = analyses
      .filter((a) => a.ventureId === ventureId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return ventureAnalyses[0] || null;
  },

  // Update an existing analysis
  updateAnalysis: async (id, updates) => {
    const analysis = await db.getAnalysis(id);
    if (!analysis) return;

    const updated: SavedAnalysis = {
      ...analysis,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.saveAnalysis(updated);

    set((s) => ({
      analyses: s.analyses.map((a) => (a.id === id ? updated : a)),
    }));
  },

  // Duplicate an analysis
  duplicateAnalysis: async (id, newName) => {
    const original = await db.getAnalysis(id);
    if (!original) return null;

    const now = new Date().toISOString();
    const duplicated: SavedAnalysis = {
      ...original,
      id: db.generateId(),
      name: newName || `${original.name} (Kopie)`,
      createdAt: now,
      updatedAt: now,
      isFavorite: false,
    };

    await db.saveAnalysis(duplicated);

    set((s) => ({
      analyses: [duplicated, ...s.analyses],
    }));

    return duplicated;
  },

  // Delete an analysis
  deleteAnalysis: async (id) => {
    await db.deleteAnalysis(id);
    set((s) => ({
      analyses: s.analyses.filter((a) => a.id !== id),
      activeAnalysisId: s.activeAnalysisId === id ? null : s.activeAnalysisId,
    }));
  },

  // Move analysis to a project
  moveAnalysisToProject: async (analysisId, projectId) => {
    await db.moveAnalysesToProject([analysisId], projectId);
    set((s) => ({
      analyses: s.analyses.map((a) =>
        a.id === analysisId
          ? { ...a, projectId, updatedAt: new Date().toISOString() }
          : a
      ),
    }));
  },

  // Toggle favorite status
  toggleAnalysisFavorite: async (id) => {
    const analysis = get().analyses.find((a) => a.id === id);
    if (!analysis) return;

    const updated = {
      ...analysis,
      isFavorite: !analysis.isFavorite,
      updatedAt: new Date().toISOString(),
    };

    await db.saveAnalysis(updated);

    set((s) => ({
      analyses: s.analyses.map((a) => (a.id === id ? updated : a)),
    }));
  },

  // Set active analysis
  setActiveAnalysis: (id) => {
    set({ activeAnalysisId: id });
  },

  // Load all projects
  loadProjects: async () => {
    try {
      const projects = await db.getAllProjects();
      set({ projects: projects.sort((a, b) => a.sortOrder - b.sortOrder) });
    } catch (error) {
      console.error('[LaunchOS] Failed to load projects:', error);
    }
  },

  // Create a new project
  createProject: async (name, color, icon) => {
    const { projects } = get();
    const now = new Date().toISOString();
    const colorIndex = projects.length % DEFAULT_PROJECT_COLORS.length;

    const newProject: Project = {
      id: db.generateId(),
      name,
      description: '',
      color: color || DEFAULT_PROJECT_COLORS[colorIndex],
      icon: icon || 'folder',
      createdAt: now,
      updatedAt: now,
      sortOrder: projects.length,
      isExpanded: true,
    };

    await db.saveProject(newProject);

    set((s) => ({
      projects: [...s.projects, newProject],
    }));

    return newProject;
  },

  // Update a project
  updateProject: async (id, updates) => {
    const project = get().projects.find((p) => p.id === id);
    if (!project) return;

    const updated: Project = {
      ...project,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.saveProject(updated);

    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? updated : p)),
    }));
  },

  // Delete a project
  deleteProject: async (id, moveAnalysesTo = null) => {
    // Move analyses to target project (or ungrouped)
    const analysesToMove = get().analyses.filter((a) => a.projectId === id);
    if (analysesToMove.length > 0) {
      await db.moveAnalysesToProject(
        analysesToMove.map((a) => a.id),
        moveAnalysesTo
      );
    }

    await db.deleteProject(id);

    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      analyses: s.analyses.map((a) =>
        a.projectId === id ? { ...a, projectId: moveAnalysesTo } : a
      ),
    }));
  },

  // Toggle project expanded state
  toggleProjectExpanded: (id) => {
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === id ? { ...p, isExpanded: !p.isExpanded } : p
      ),
    }));
  },

  // Reorder projects
  reorderProjects: async (projectIds) => {
    await db.reorderProjects(projectIds);

    set((s) => ({
      projects: projectIds
        .map((id, index) => {
          const project = s.projects.find((p) => p.id === id);
          return project ? { ...project, sortOrder: index } : null;
        })
        .filter((p): p is Project => p !== null),
    }));
  },

  // Search/Filter
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setFilterTags: (tags) => {
    set({ filterTags: tags });
  },

  // Selectors
  getAnalysesByProject: (projectId) => {
    return get().analyses.filter((a) => a.projectId === projectId);
  },

  getFilteredAnalyses: () => {
    const { analyses, searchQuery, filterTags } = get();
    let filtered = analyses;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.notes.toLowerCase().includes(query) ||
          a.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    if (filterTags.length > 0) {
      filtered = filtered.filter((a) =>
        filterTags.some((tag) => a.tags.includes(tag))
      );
    }

    return filtered;
  },

  getActiveAnalysis: () => {
    const { analyses, activeAnalysisId } = get();
    return analyses.find((a) => a.id === activeAnalysisId) || null;
  },

  getUngroupedAnalyses: () => {
    return get().analyses.filter((a) => a.projectId === null);
  },

  getAllTags: () => {
    const { analyses } = get();
    const tagSet = new Set<string>();
    analyses.forEach((a) => a.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  },

  // Create test analyses for development/testing
  createTestAnalyses: async () => {
    try {
      const { analyses: currentAnalyses } = get();
      const testAnalyses = await db.createTestAnalyses();

      // Only add analyses that aren't already in the store
      const existingIds = new Set(currentAnalyses.map(a => a.id));
      const newAnalyses = testAnalyses.filter(a => !existingIds.has(a.id));

      if (newAnalyses.length > 0) {
        set((s) => ({
          analyses: [...newAnalyses, ...s.analyses],
        }));
        console.log('[LaunchOS] Test analyses added to store:', newAnalyses.length);
      } else {
        console.log('[LaunchOS] Test analyses already in store, skipping');
      }
    } catch (error) {
      console.error('[LaunchOS] Failed to create test analyses:', error);
    }
  },

  // Load a demo analysis for a demo venture (ensures it exists and is linked)
  loadDemoAnalysis: async (ventureId: string) => {
    console.log('[LaunchOS] loadDemoAnalysis START for venture:', ventureId);
    try {
      console.log('[LaunchOS] Loading demo analysis for venture:', ventureId);

      // Ensure the demo analysis exists and is linked
      console.log('[LaunchOS] Calling ensureDemoAnalysisLinked...');
      const demoAnalysis = await db.ensureDemoAnalysisLinked(ventureId);
      console.log('[LaunchOS] ensureDemoAnalysisLinked returned:', demoAnalysis ? demoAnalysis.name : 'null');

      if (!demoAnalysis) {
        console.warn('[LaunchOS] Could not find or create demo analysis for:', ventureId);
        return false;
      }

      // Update the analyses in store if needed
      const { analyses } = get();
      const existingInStore = analyses.find(a => a.id === demoAnalysis.id);

      if (!existingInStore) {
        // Add to store
        set((s) => ({
          analyses: [demoAnalysis, ...s.analyses.filter(a => a.id !== demoAnalysis.id)],
        }));
      } else if (existingInStore.ventureId !== ventureId) {
        // Update the ventureId in store
        set((s) => ({
          analyses: s.analyses.map(a =>
            a.id === demoAnalysis.id ? { ...a, ventureId } : a
          ),
        }));
      }

      // Calculate currentStep based on completedSteps
      const completedSteps = demoAnalysis.wizardData?.completedSteps || [];
      let currentStep = 0;
      if (demoAnalysis.routeResult) {
        // If we have a result, go to the results step
        currentStep = 4;
      } else if (completedSteps.length > 0) {
        currentStep = Math.min(completedSteps.length, 4);
      }

      // Restore the analysis state
      set({
        activeAnalysisId: demoAnalysis.id,
        hasUnsavedChanges: false,
        selectedTier: demoAnalysis.tier,
        acknowledgedPrivacy: true,
        wizardData: demoAnalysis.wizardData,
        currentStep,
        routeResult: demoAnalysis.routeResult,
        completedTasks: demoAnalysis.completedTasks || [],
        methodResults: demoAnalysis.valuationResults?.methodResults || [],
      });

      console.log('[LaunchOS] Demo analysis loaded successfully:', demoAnalysis.name, 'currentStep set to:', currentStep);
      return true;
    } catch (error) {
      console.error('[LaunchOS] Failed to load demo analysis:', error);
      console.error('[LaunchOS] Error stack:', error instanceof Error ? error.stack : 'no stack');
      return false;
    }
  },
});
