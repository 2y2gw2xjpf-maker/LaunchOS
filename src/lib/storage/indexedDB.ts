import { openDB, type IDBPDatabase } from 'idb';
import type { SavedAnalysis, Project } from '@/types';

interface LaunchOSDB {
  analyses: {
    key: string;
    value: SavedAnalysis;
    indexes: {
      'by-project': string | null;
      'by-created': string;
      'by-updated': string;
      'by-favorite': number;
    };
  };
  projects: {
    key: string;
    value: Project;
    indexes: {
      'by-sort-order': number;
    };
  };
}

const DB_NAME = 'launchos-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<LaunchOSDB>> | null = null;

export const getDB = (): Promise<IDBPDatabase<LaunchOSDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<LaunchOSDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create analyses store
        if (!db.objectStoreNames.contains('analyses')) {
          const analysisStore = db.createObjectStore('analyses', { keyPath: 'id' });
          analysisStore.createIndex('by-project', 'projectId');
          analysisStore.createIndex('by-created', 'createdAt');
          analysisStore.createIndex('by-updated', 'updatedAt');
          analysisStore.createIndex('by-favorite', 'isFavorite');
        }

        // Create projects store
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('by-sort-order', 'sortOrder');
        }
      },
    });
  }
  return dbPromise;
};

// ==================== ANALYSIS OPERATIONS ====================

export const saveAnalysis = async (analysis: SavedAnalysis): Promise<void> => {
  const db = await getDB();
  await db.put('analyses', analysis);
};

export const getAnalysis = async (id: string): Promise<SavedAnalysis | undefined> => {
  const db = await getDB();
  return db.get('analyses', id);
};

export const getAllAnalyses = async (): Promise<SavedAnalysis[]> => {
  const db = await getDB();
  return db.getAll('analyses');
};

export const getAnalysesByProject = async (projectId: string | null): Promise<SavedAnalysis[]> => {
  const db = await getDB();
  return db.getAllFromIndex('analyses', 'by-project', projectId);
};

export const getFavoriteAnalyses = async (): Promise<SavedAnalysis[]> => {
  const db = await getDB();
  const all = await db.getAllFromIndex('analyses', 'by-favorite', 1);
  return all.filter((a) => a.isFavorite);
};

export const deleteAnalysis = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('analyses', id);
};

export const deleteAnalysesByProject = async (projectId: string): Promise<void> => {
  const db = await getDB();
  const analyses = await getAnalysesByProject(projectId);
  const tx = db.transaction('analyses', 'readwrite');
  await Promise.all(analyses.map((a) => tx.store.delete(a.id)));
  await tx.done;
};

export const moveAnalysesToProject = async (
  analysisIds: string[],
  targetProjectId: string | null
): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction('analyses', 'readwrite');

  for (const id of analysisIds) {
    const analysis = await tx.store.get(id);
    if (analysis) {
      analysis.projectId = targetProjectId;
      analysis.updatedAt = new Date().toISOString();
      await tx.store.put(analysis);
    }
  }

  await tx.done;
};

// ==================== PROJECT OPERATIONS ====================

export const saveProject = async (project: Project): Promise<void> => {
  const db = await getDB();
  await db.put('projects', project);
};

export const getProject = async (id: string): Promise<Project | undefined> => {
  const db = await getDB();
  return db.get('projects', id);
};

export const getAllProjects = async (): Promise<Project[]> => {
  const db = await getDB();
  const projects = await db.getAllFromIndex('projects', 'by-sort-order');
  return projects;
};

export const deleteProject = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('projects', id);
};

export const reorderProjects = async (projectIds: string[]): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction('projects', 'readwrite');

  for (let i = 0; i < projectIds.length; i++) {
    const project = await tx.store.get(projectIds[i]);
    if (project) {
      project.sortOrder = i;
      project.updatedAt = new Date().toISOString();
      await tx.store.put(project);
    }
  }

  await tx.done;
};

// ==================== UTILITY FUNCTIONS ====================

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const clearAllData = async (): Promise<void> => {
  const db = await getDB();
  const tx1 = db.transaction('analyses', 'readwrite');
  await tx1.store.clear();
  await tx1.done;

  const tx2 = db.transaction('projects', 'readwrite');
  await tx2.store.clear();
  await tx2.done;
};

export const getAnalysisCount = async (): Promise<number> => {
  const db = await getDB();
  return db.count('analyses');
};

export const getProjectCount = async (): Promise<number> => {
  const db = await getDB();
  return db.count('projects');
};

// ==================== TEST DATA FUNCTIONS ====================

/**
 * Create test analyses for development/testing
 * Will skip creation if test analyses already exist
 */
export const createTestAnalyses = async (): Promise<SavedAnalysis[]> => {
  // Check if test analyses already exist by name (more reliable than ID)
  const existingAnalyses = await getAllAnalyses();
  const testNames = ['Bootstrap Szenario', 'Investor Szenario', 'Hybrid Szenario'];
  const existingTestAnalyses = existingAnalyses.filter(a =>
    testNames.includes(a.name) || a.id.startsWith('test-') || a.tags?.includes('test')
  );

  if (existingTestAnalyses.length >= 3) {
    console.log('[LaunchOS] Test analyses already exist, skipping creation:', existingTestAnalyses.length);
    return existingTestAnalyses.slice(0, 3); // Return max 3
  }

  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();

  // Use type assertion to work around strict type checking for test data
  // Link to demo ventures for full feature exploration
  const testAnalysis1 = {
    id: `test-${Date.now()}-1`,
    name: 'Bootstrap Szenario',
    createdAt: yesterday,
    updatedAt: yesterday,
    projectId: null,
    ventureId: 'demo-bootstrap-venture', // Linked to Demo Bootstrap Venture
    tier: 'detailed',
    wizardData: {
      tier: 'detailed',
      projectBasics: {},
      personalSituation: {},
      goals: {},
      marketAnalysis: {},
      detailedInput: {},
      completedSteps: [0, 1, 2, 3],
    },
    routeResult: {
      recommendation: 'bootstrap',
      confidence: 78,
      scores: { bootstrap: 82, investor: 45, hybrid: 65 },
      reasons: [],
      actionPlan: {
        route: 'bootstrap',
        phases: [
          {
            title: 'Phase 1: Vorbereitung',
            duration: '2-4 Wochen',
            tasks: [
              { id: 'task-1', title: 'Marktforschung', description: 'Markt analysieren', priority: 'high', estimatedHours: 20 },
              { id: 'task-2', title: 'MVP definieren', description: 'MVP planen', priority: 'high', estimatedHours: 10 },
            ],
            budget: { min: 2500, max: 7500, currency: 'EUR' },
            timePerWeek: { min: 10, max: 20 },
            milestones: ['MVP Launch'],
            resources: [],
          },
        ],
        totalBudget: { min: 5000, max: 15000, currency: 'EUR' },
        totalDuration: '3-6 Monate',
        criticalPath: ['MVP Launch'],
        riskFactors: [],
        successMetrics: [],
      },
      alternativeConsiderations: [],
      warnings: [],
    },
    valuationResults: { methodResults: [], finalResult: null },
    completedTasks: [],
    taskTimeTracking: [],
    tags: ['test'],
    notes: 'Test-Analyse für Bootstrap-Szenario',
    isFavorite: false,
  } as SavedAnalysis;

  const testAnalysis2 = {
    id: `test-${Date.now()}-2`,
    name: 'Investor Szenario',
    createdAt: now,
    updatedAt: now,
    projectId: null,
    ventureId: 'demo-investor-venture', // Linked to Demo Investor Venture
    tier: 'detailed',
    wizardData: {
      tier: 'detailed',
      projectBasics: {},
      personalSituation: {},
      goals: {},
      marketAnalysis: {},
      detailedInput: {},
      completedSteps: [0, 1, 2, 3],
    },
    routeResult: {
      recommendation: 'investor',
      confidence: 85,
      scores: { bootstrap: 35, investor: 88, hybrid: 60 },
      reasons: [],
      actionPlan: {
        route: 'investor',
        phases: [
          {
            title: 'Phase 1: Fundraising',
            duration: '4-8 Wochen',
            tasks: [
              { id: 'task-1', title: 'Pitch Deck erstellen', description: 'Pitch vorbereiten', priority: 'high', estimatedHours: 30 },
              { id: 'task-2', title: 'Investoren recherchieren', description: 'VCs finden', priority: 'high', estimatedHours: 15 },
            ],
            budget: { min: 25000, max: 75000, currency: 'EUR' },
            timePerWeek: { min: 20, max: 40 },
            milestones: ['Seed Runde'],
            resources: [],
          },
        ],
        totalBudget: { min: 50000, max: 150000, currency: 'EUR' },
        totalDuration: '6-12 Monate',
        criticalPath: ['Seed Runde'],
        riskFactors: [],
        successMetrics: [],
      },
      alternativeConsiderations: [],
      warnings: [],
    },
    valuationResults: { methodResults: [], finalResult: null },
    completedTasks: [],
    taskTimeTracking: [],
    tags: ['test'],
    notes: 'Test-Analyse für Investor-Szenario',
    isFavorite: false,
  } as SavedAnalysis;

  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString();

  const testAnalysis3 = {
    id: `test-${Date.now()}-3`,
    name: 'Hybrid Szenario',
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
    projectId: null,
    ventureId: 'demo-hybrid-venture', // Linked to Demo Hybrid Venture
    tier: 'detailed',
    wizardData: {
      tier: 'detailed',
      projectBasics: {},
      personalSituation: {},
      goals: {},
      marketAnalysis: {},
      detailedInput: {},
      completedSteps: [0, 1, 2, 3],
    },
    routeResult: {
      recommendation: 'hybrid',
      confidence: 72,
      scores: { bootstrap: 55, investor: 60, hybrid: 75 },
      reasons: [],
      actionPlan: {
        route: 'hybrid',
        phases: [
          {
            title: 'Phase 1: Bootstrap Start',
            duration: '3-6 Wochen',
            tasks: [
              { id: 'task-1', title: 'MVP entwickeln', description: 'Erstes Produkt bauen', priority: 'high', estimatedHours: 40 },
              { id: 'task-2', title: 'Erste Kunden gewinnen', description: 'Traction aufbauen', priority: 'high', estimatedHours: 25 },
            ],
            budget: { min: 10000, max: 30000, currency: 'EUR' },
            timePerWeek: { min: 15, max: 30 },
            milestones: ['MVP Launch', 'Erste Kunden'],
            resources: [],
          },
        ],
        totalBudget: { min: 20000, max: 60000, currency: 'EUR' },
        totalDuration: '6-9 Monate',
        criticalPath: ['MVP Launch', 'Erste Kunden'],
        riskFactors: [],
        successMetrics: [],
      },
      alternativeConsiderations: [],
      warnings: [],
    },
    valuationResults: { methodResults: [], finalResult: null },
    completedTasks: [],
    taskTimeTracking: [],
    tags: ['test'],
    notes: 'Test-Analyse für Hybrid-Szenario',
    isFavorite: false,
  } as SavedAnalysis;

  await saveAnalysis(testAnalysis1);
  await saveAnalysis(testAnalysis2);
  await saveAnalysis(testAnalysis3);

  console.log('[LaunchOS] Created test analyses:', testAnalysis1.id, testAnalysis2.id, testAnalysis3.id);
  return [testAnalysis1, testAnalysis2, testAnalysis3];
};

/**
 * Mapping from demo venture IDs to their analysis names
 */
const DEMO_VENTURE_ANALYSIS_MAP: Record<string, string> = {
  'demo-bootstrap-venture': 'Bootstrap Szenario',
  'demo-investor-venture': 'Investor Szenario',
  'demo-hybrid-venture': 'Hybrid Szenario',
};

/**
 * Ensure a demo analysis exists and is linked to its venture
 * Returns the analysis if found/created, null otherwise
 */
export const ensureDemoAnalysisLinked = async (ventureId: string): Promise<SavedAnalysis | null> => {
  const analysisName = DEMO_VENTURE_ANALYSIS_MAP[ventureId];
  if (!analysisName) {
    console.warn('[LaunchOS] Unknown demo venture ID:', ventureId);
    return null;
  }

  console.log('[LaunchOS] ensureDemoAnalysisLinked called for:', ventureId, 'expecting name:', analysisName);

  const allAnalyses = await getAllAnalyses();
  console.log('[LaunchOS] All analyses count:', allAnalyses.length);

  // First, try to find an analysis already linked to this venture
  const linkedAnalysis = allAnalyses.find(a => a.ventureId === ventureId);
  if (linkedAnalysis) {
    console.log('[LaunchOS] Found already linked demo analysis:', linkedAnalysis.name, linkedAnalysis.id);
    return linkedAnalysis;
  }

  // Second, try to find an analysis by name (exact match) and link it
  const matchingByName = allAnalyses.find(a => a.name === analysisName);
  if (matchingByName) {
    console.log('[LaunchOS] Found analysis by name, linking to venture:', matchingByName.name, matchingByName.id);
    const updatedAnalysis: SavedAnalysis = {
      ...matchingByName,
      ventureId,
      updatedAt: new Date().toISOString(),
    };
    await saveAnalysis(updatedAnalysis);
    return updatedAnalysis;
  }

  // Third, look for test analyses that might have slightly different names
  const testAnalyses = allAnalyses.filter(a =>
    a.id.startsWith('test-') ||
    a.tags?.includes('test') ||
    a.name.toLowerCase().includes(analysisName.toLowerCase().split(' ')[0]) // Match first word
  );
  console.log('[LaunchOS] Found test analyses:', testAnalyses.map(a => ({ id: a.id, name: a.name })));

  // Try to match based on scenario type
  const scenarioType = ventureId.replace('demo-', '').replace('-venture', ''); // e.g. 'bootstrap'
  const matchingTest = testAnalyses.find(a =>
    a.name.toLowerCase().includes(scenarioType) ||
    a.routeResult?.recommendation === scenarioType
  );

  if (matchingTest) {
    console.log('[LaunchOS] Found matching test analysis, linking:', matchingTest.name);
    const updatedAnalysis: SavedAnalysis = {
      ...matchingTest,
      ventureId,
      updatedAt: new Date().toISOString(),
    };
    await saveAnalysis(updatedAnalysis);
    return updatedAnalysis;
  }

  // Fourth, force create new test analyses (bypass the existence check by deleting old ones first)
  console.log('[LaunchOS] No matching analysis found, will create fresh test analyses');

  // Delete any old test analyses without ventureId to allow fresh creation
  const oldTestAnalyses = allAnalyses.filter(a =>
    (a.id.startsWith('test-') || a.tags?.includes('test')) && !a.ventureId
  );
  for (const old of oldTestAnalyses) {
    console.log('[LaunchOS] Removing old unlinked test analysis:', old.id, old.name);
    await deleteAnalysis(old.id);
  }

  // Now create fresh ones
  const newTestAnalyses = await forceCreateTestAnalyses();
  const newAnalysis = newTestAnalyses.find(a => a.ventureId === ventureId);

  if (newAnalysis) {
    console.log('[LaunchOS] Created and linked new demo analysis:', newAnalysis.name);
    return newAnalysis;
  }

  console.warn('[LaunchOS] Could not find or create demo analysis for:', ventureId);
  return null;
};

/**
 * Force create test analyses (ignoring existence check)
 */
const forceCreateTestAnalyses = async (): Promise<SavedAnalysis[]> => {
  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString();

  const testAnalysis1 = {
    id: `test-${Date.now()}-1`,
    name: 'Bootstrap Szenario',
    createdAt: yesterday,
    updatedAt: yesterday,
    projectId: null,
    ventureId: 'demo-bootstrap-venture',
    tier: 'detailed',
    wizardData: {
      tier: 'detailed',
      projectBasics: {},
      personalSituation: {},
      goals: {},
      marketAnalysis: {},
      detailedInput: {},
      completedSteps: [0, 1, 2, 3],
    },
    routeResult: {
      recommendation: 'bootstrap',
      confidence: 78,
      scores: { bootstrap: 82, investor: 45, hybrid: 65 },
      reasons: [],
      actionPlan: {
        route: 'bootstrap',
        phases: [
          {
            title: 'Phase 1: Vorbereitung',
            duration: '2-4 Wochen',
            tasks: [
              { id: 'task-1', title: 'Marktforschung', description: 'Markt analysieren', priority: 'high', estimatedHours: 20 },
              { id: 'task-2', title: 'MVP definieren', description: 'MVP planen', priority: 'high', estimatedHours: 10 },
            ],
            budget: { min: 2500, max: 7500, currency: 'EUR' },
            timePerWeek: { min: 10, max: 20 },
            milestones: ['MVP Launch'],
            resources: [],
          },
        ],
        totalBudget: { min: 5000, max: 15000, currency: 'EUR' },
        totalDuration: '3-6 Monate',
        criticalPath: ['MVP Launch'],
        riskFactors: [],
        successMetrics: [],
      },
      alternativeConsiderations: [],
      warnings: [],
    },
    valuationResults: { methodResults: [], finalResult: null },
    completedTasks: [],
    taskTimeTracking: [],
    tags: ['test', 'demo'],
    notes: 'Demo-Analyse für Bootstrap-Szenario',
    isFavorite: false,
  } as SavedAnalysis;

  const testAnalysis2 = {
    id: `test-${Date.now()}-2`,
    name: 'Investor Szenario',
    createdAt: now,
    updatedAt: now,
    projectId: null,
    ventureId: 'demo-investor-venture',
    tier: 'detailed',
    wizardData: {
      tier: 'detailed',
      projectBasics: {},
      personalSituation: {},
      goals: {},
      marketAnalysis: {},
      detailedInput: {},
      completedSteps: [0, 1, 2, 3],
    },
    routeResult: {
      recommendation: 'investor',
      confidence: 85,
      scores: { bootstrap: 35, investor: 88, hybrid: 60 },
      reasons: [],
      actionPlan: {
        route: 'investor',
        phases: [
          {
            title: 'Phase 1: Fundraising',
            duration: '4-8 Wochen',
            tasks: [
              { id: 'task-1', title: 'Pitch Deck erstellen', description: 'Pitch vorbereiten', priority: 'high', estimatedHours: 30 },
              { id: 'task-2', title: 'Investoren recherchieren', description: 'VCs finden', priority: 'high', estimatedHours: 15 },
            ],
            budget: { min: 25000, max: 75000, currency: 'EUR' },
            timePerWeek: { min: 20, max: 40 },
            milestones: ['Seed Runde'],
            resources: [],
          },
        ],
        totalBudget: { min: 50000, max: 150000, currency: 'EUR' },
        totalDuration: '6-12 Monate',
        criticalPath: ['Seed Runde'],
        riskFactors: [],
        successMetrics: [],
      },
      alternativeConsiderations: [],
      warnings: [],
    },
    valuationResults: { methodResults: [], finalResult: null },
    completedTasks: [],
    taskTimeTracking: [],
    tags: ['test', 'demo'],
    notes: 'Demo-Analyse für Investor-Szenario',
    isFavorite: false,
  } as SavedAnalysis;

  const testAnalysis3 = {
    id: `test-${Date.now()}-3`,
    name: 'Hybrid Szenario',
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
    projectId: null,
    ventureId: 'demo-hybrid-venture',
    tier: 'detailed',
    wizardData: {
      tier: 'detailed',
      projectBasics: {},
      personalSituation: {},
      goals: {},
      marketAnalysis: {},
      detailedInput: {},
      completedSteps: [0, 1, 2, 3],
    },
    routeResult: {
      recommendation: 'hybrid',
      confidence: 72,
      scores: { bootstrap: 55, investor: 60, hybrid: 75 },
      reasons: [],
      actionPlan: {
        route: 'hybrid',
        phases: [
          {
            title: 'Phase 1: Bootstrap Start',
            duration: '3-6 Wochen',
            tasks: [
              { id: 'task-1', title: 'MVP entwickeln', description: 'Erstes Produkt bauen', priority: 'high', estimatedHours: 40 },
              { id: 'task-2', title: 'Erste Kunden gewinnen', description: 'Traction aufbauen', priority: 'high', estimatedHours: 25 },
            ],
            budget: { min: 10000, max: 30000, currency: 'EUR' },
            timePerWeek: { min: 15, max: 30 },
            milestones: ['MVP Launch', 'Erste Kunden'],
            resources: [],
          },
        ],
        totalBudget: { min: 20000, max: 60000, currency: 'EUR' },
        totalDuration: '6-9 Monate',
        criticalPath: ['MVP Launch', 'Erste Kunden'],
        riskFactors: [],
        successMetrics: [],
      },
      alternativeConsiderations: [],
      warnings: [],
    },
    valuationResults: { methodResults: [], finalResult: null },
    completedTasks: [],
    taskTimeTracking: [],
    tags: ['test', 'demo'],
    notes: 'Demo-Analyse für Hybrid-Szenario',
    isFavorite: false,
  } as SavedAnalysis;

  await saveAnalysis(testAnalysis1);
  await saveAnalysis(testAnalysis2);
  await saveAnalysis(testAnalysis3);

  console.log('[LaunchOS] Force-created test analyses with ventureIds');
  return [testAnalysis1, testAnalysis2, testAnalysis3];
};

/**
 * Remove duplicate test analyses, keeping only the most recent of each type
 */
export const cleanupDuplicateTestAnalyses = async (): Promise<number> => {
  const existingAnalyses = await getAllAnalyses();
  const testNames = ['Bootstrap Szenario', 'Investor Szenario', 'Hybrid Szenario'];

  let deletedCount = 0;

  for (const name of testNames) {
    // Find all analyses with this name
    const matchingAnalyses = existingAnalyses
      .filter(a => a.name === name)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    // Keep the first (most recent), delete the rest
    for (let i = 1; i < matchingAnalyses.length; i++) {
      await deleteAnalysis(matchingAnalyses[i].id);
      deletedCount++;
    }
  }

  if (deletedCount > 0) {
    console.log('[LaunchOS] Cleaned up', deletedCount, 'duplicate test analyses');
  }

  return deletedCount;
};
