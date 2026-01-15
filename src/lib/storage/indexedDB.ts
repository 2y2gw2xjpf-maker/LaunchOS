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
