import type { StateCreator } from 'zustand';
import type { SavedAnalysis, Project, WizardData, DataSharingTier } from '@/types';
import * as db from '@/lib/storage';

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
    }
  ) => Promise<SavedAnalysis>;
  loadAnalysis: (id: string) => Promise<SavedAnalysis | null>;
  updateAnalysis: (id: string, updates: Partial<SavedAnalysis>) => Promise<void>;
  duplicateAnalysis: (id: string, newName?: string) => Promise<SavedAnalysis | null>;
  deleteAnalysis: (id: string) => Promise<void>;
  moveAnalysisToProject: (analysisId: string, projectId: string | null) => Promise<void>;
  toggleAnalysisFavorite: (id: string) => Promise<void>;
  setActiveAnalysis: (id: string | null) => void;

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
}

const DEFAULT_PROJECT_COLORS = [
  '#1e3a5f',
  '#d4af37',
  '#7c9a8a',
  '#e74c3c',
  '#9b59b6',
  '#3498db',
];

export const createHistorySlice: StateCreator<HistorySlice, [], [], HistorySlice> = (set, get) => ({
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
    set({ isHistoryLoading: true });
    try {
      // Run migration if needed
      if (db.needsMigration()) {
        await db.migrateFromLocalStorage();
      }

      // Load data
      const [analyses, projects] = await Promise.all([
        db.getAllAnalyses(),
        db.getAllProjects(),
      ]);

      set({
        analyses: analyses.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
        projects: projects.sort((a, b) => a.sortOrder - b.sortOrder),
        isHistoryLoading: false,
      });
    } catch (error) {
      console.error('[LaunchOS] Failed to initialize history:', error);
      set({ isHistoryLoading: false });
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
  saveCurrentAsAnalysis: async (name, projectId = null, getCurrentState) => {
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

  // Load a specific analysis
  loadAnalysis: async (id) => {
    const analysis = await db.getAnalysis(id);
    if (analysis) {
      set({ activeAnalysisId: id });
    }
    return analysis || null;
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
});
