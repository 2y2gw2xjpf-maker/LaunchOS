import type { SavedAnalysis, WizardData, DataSharingTier } from '@/types';
import { saveAnalysis, generateId, getAnalysisCount } from './indexedDB';

const MIGRATION_KEY = 'launchos-migration-v1';
const OLD_STORAGE_KEY = 'launchos-storage';

interface OldStorageFormat {
  selectedTier?: DataSharingTier;
  acknowledgedPrivacy?: boolean;
  wizardData?: WizardData;
  routeResult?: SavedAnalysis['routeResult'];
  completedTasks?: string[];
  methodResults?: SavedAnalysis['valuationResults']['methodResults'];
  berkusFactors?: Record<string, number>;
  scorecardFactors?: Record<string, unknown>;
  vcMethodInput?: Record<string, unknown>;
  comparablesInput?: Record<string, unknown>;
  dcfInput?: Record<string, unknown>;
}

const getInitialWizardData = (tier: DataSharingTier): WizardData => ({
  tier,
  projectBasics: {},
  personalSituation: {},
  goals: {},
  marketAnalysis: {},
  detailedInput: {},
  completedSteps: [],
});

/**
 * Check if migration is needed
 */
export const needsMigration = (): boolean => {
  // If already migrated, skip
  if (localStorage.getItem(MIGRATION_KEY) === 'complete') {
    return false;
  }

  // Check if there's old data to migrate
  const oldData = localStorage.getItem(OLD_STORAGE_KEY);
  if (!oldData) {
    return false;
  }

  try {
    const parsed = JSON.parse(oldData) as OldStorageFormat;
    // Only migrate if there's meaningful data
    return !!(
      parsed.wizardData?.completedSteps?.length ||
      parsed.routeResult ||
      parsed.methodResults?.length
    );
  } catch {
    return false;
  }
};

/**
 * Migrate data from localStorage to IndexedDB
 */
export const migrateFromLocalStorage = async (): Promise<SavedAnalysis | null> => {
  // Check if already migrated
  if (localStorage.getItem(MIGRATION_KEY) === 'complete') {
    return null;
  }

  // Check if there's already data in IndexedDB
  const existingCount = await getAnalysisCount();
  if (existingCount > 0) {
    // Mark as complete and skip
    localStorage.setItem(MIGRATION_KEY, 'complete');
    return null;
  }

  const oldData = localStorage.getItem(OLD_STORAGE_KEY);
  if (!oldData) {
    localStorage.setItem(MIGRATION_KEY, 'complete');
    return null;
  }

  try {
    const parsed = JSON.parse(oldData) as OldStorageFormat;

    // Only migrate if there's meaningful data
    if (
      !parsed.wizardData?.completedSteps?.length &&
      !parsed.routeResult &&
      !parsed.methodResults?.length
    ) {
      localStorage.setItem(MIGRATION_KEY, 'complete');
      return null;
    }

    const tier = parsed.selectedTier || 'minimal';
    const now = new Date().toISOString();

    const migratedAnalysis: SavedAnalysis = {
      id: generateId(),
      name: 'Migrierte Analyse',
      createdAt: now,
      updatedAt: now,
      projectId: null,
      ventureId: null,
      tier,
      wizardData: parsed.wizardData || getInitialWizardData(tier),
      routeResult: parsed.routeResult || null,
      valuationResults: {
        methodResults: parsed.methodResults || [],
        finalResult: null,
      },
      completedTasks: parsed.completedTasks || [],
      taskTimeTracking: [],
      tags: ['migriert'],
      notes: 'Diese Analyse wurde automatisch aus deiner vorherigen Sitzung importiert.',
      isFavorite: false,
    };

    await saveAnalysis(migratedAnalysis);

    // Mark migration as complete
    localStorage.setItem(MIGRATION_KEY, 'complete');

    console.log('[LaunchOS] Migration completed successfully');
    return migratedAnalysis;
  } catch (error) {
    console.error('[LaunchOS] Migration failed:', error);
    // Don't block the app, just mark as complete
    localStorage.setItem(MIGRATION_KEY, 'complete');
    return null;
  }
};

/**
 * Reset migration status (for testing)
 */
export const resetMigration = (): void => {
  localStorage.removeItem(MIGRATION_KEY);
};
