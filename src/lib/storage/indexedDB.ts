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
 * Contains complete, realistic demo data for all wizard steps
 */
const forceCreateTestAnalyses = async (): Promise<SavedAnalysis[]> => {
  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString();

  // Bootstrap Szenario - CodeCraft Studio (No-Code SaaS)
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
      projectBasics: {
        category: 'saas' as const,
        stage: 'live' as const,
        targetCustomer: 'b2b' as const,
        hasRevenue: true,
        monthlyRevenue: 8500,
        revenueGrowthRate: 12,
        hasUsers: true,
        userCount: 450,
        userGrowthRate: 8,
        launchDate: '2024-03-15',
      },
      personalSituation: {
        teamSize: 'cofounders' as const,
        cofoundersCount: 1,
        hasRelevantExperience: true,
        yearsExperience: 5,
        commitment: 'fulltime' as const,
        hoursPerWeek: 50,
        runwayMonths: 18,
        financialSituation: 'comfortable' as const,
        riskTolerance: 6,
        hasOtherIncome: false,
      },
      goals: {
        exitGoal: 'lifestyle' as const,
        growthSpeed: 'moderate' as const,
        controlImportance: 9,
        timeHorizon: '5_years' as const,
        openToInvestors: false,
        openToCoFounders: false,
        prioritizeProfitability: true,
      },
      marketAnalysis: {
        knownCompetitors: ['Bubble', 'Webflow', 'Softr', 'Glide'],
        competitorStrength: 7,
        marketTiming: 'growing' as const,
        marketType: 'fragmented' as const,
        regulatoryComplexity: 2,
        estimatedTAM: 15000000000,
        estimatedSAM: 500000000,
        estimatedSOM: 5000000,
      },
      detailedInput: {
        productDescription: 'CodeCraft Studio ist eine No-Code-Plattform, die es Unternehmen ermöglicht, professionelle Web-Apps in Tagen statt Monaten zu erstellen.',
        mainProblemSolved: 'Hohe Entwicklungskosten und lange Wartezeiten bei der Softwareentwicklung für KMUs',
        uniqueValueProp: 'Kombiniert die Einfachheit von No-Code mit der Flexibilität von Custom Code durch unseren hybriden Editor',
        liveURL: 'https://codecraft-studio.example.com',
        pricingStructure: 'Freemium mit Pro-Plan ab 49€/Monat',
      },
      completedSteps: [0, 1, 2, 3],
    },
    routeResult: {
      recommendation: 'bootstrap',
      confidence: 78,
      scores: { bootstrap: 82, investor: 45, hybrid: 65 },
      reasons: [
        { factor: 'Profitabilität', impact: 'positive' as const, explanation: 'Bereits profitabel mit positivem Cashflow', score: 15 },
        { factor: 'Runway', impact: 'positive' as const, explanation: '18 Monate Runway ohne externe Finanzierung', score: 12 },
        { factor: 'Kontrollwunsch', impact: 'positive' as const, explanation: 'Hoher Wert auf Unabhängigkeit und Kontrolle', score: 10 },
        { factor: 'Wachstumsziel', impact: 'neutral' as const, explanation: 'Moderate Wachstumsziele passen zu Bootstrap', score: 5 },
      ],
      actionPlan: {
        route: 'bootstrap',
        phases: [
          {
            title: 'Phase 1: Profitabilität optimieren',
            duration: '2-3 Monate',
            tasks: [
              { id: 'task-1-1', title: 'Churn-Analyse durchführen', description: 'Identifiziere Gründe für Kundenabwanderung und entwickle Retention-Strategien', priority: 'high' as const, estimatedHours: 20, tools: ['Mixpanel', 'Hotjar'], tips: ['Führe Exit-Interviews durch', 'Analysiere Nutzungsmuster vor Kündigung'] },
              { id: 'task-1-2', title: 'Pricing-Optimierung', description: 'Teste verschiedene Preismodelle und identifiziere optimale Preisstrategie', priority: 'high' as const, estimatedHours: 15, tools: ['Stripe', 'ProfitWell'], tips: ['A/B-Tests mit neuen Nutzern', 'Value-Metrik analysieren'] },
              { id: 'task-1-3', title: 'Upselling-Flows einbauen', description: 'Implementiere automatisierte Upgrade-Prompts basierend auf Nutzungsverhalten', priority: 'medium' as const, estimatedHours: 25, tools: ['Intercom', 'Customer.io'] },
            ],
            budget: { min: 500, max: 2000, currency: 'EUR' },
            timePerWeek: { min: 15, max: 25 },
            milestones: ['Churn-Rate < 5%', 'ARPU +20%'],
            resources: [
              { name: 'ProfitWell', type: 'tool' as const, url: 'https://profitwell.com', cost: 'freemium' as const, description: 'Revenue Analytics für SaaS' },
            ],
          },
          {
            title: 'Phase 2: Organisches Wachstum',
            duration: '3-4 Monate',
            tasks: [
              { id: 'task-2-1', title: 'SEO-Content-Strategie', description: 'Erstelle hochwertige Tutorials und Vergleichsartikel für organischen Traffic', priority: 'high' as const, estimatedHours: 40, tools: ['Ahrefs', 'Surfer SEO'] },
              { id: 'task-2-2', title: 'Community aufbauen', description: 'Starte Discord/Slack Community für Power-User und Feature-Feedback', priority: 'medium' as const, estimatedHours: 20, tools: ['Discord', 'Circle'] },
              { id: 'task-2-3', title: 'Referral-Programm', description: 'Implementiere Empfehlungsprogramm mit Incentives', priority: 'medium' as const, estimatedHours: 15, tools: ['Rewardful', 'FirstPromoter'] },
            ],
            budget: { min: 1000, max: 3000, currency: 'EUR' },
            timePerWeek: { min: 20, max: 30 },
            milestones: ['1000 organische Besucher/Monat', 'Community mit 500 Mitgliedern'],
            resources: [],
          },
        ],
        totalBudget: { min: 5000, max: 15000, currency: 'EUR' },
        totalDuration: '5-7 Monate',
        criticalPath: ['Churn-Reduktion', 'Pricing-Optimierung', 'SEO-Strategie'],
        riskFactors: ['Abhängigkeit von organischem Traffic', 'Wettbewerbsdruck von VC-finanzierten Konkurrenten'],
        successMetrics: ['MRR > 15.000€', 'Churn < 5%', 'CAC Payback < 6 Monate'],
      },
      alternativeConsiderations: ['Hybrid-Ansatz mit Angel-Investment für schnelleres Wachstum möglich'],
      warnings: [],
    },
    valuationResults: { methodResults: [], finalResult: null },
    completedTasks: [],
    taskTimeTracking: [],
    tags: ['test', 'demo'],
    notes: 'Demo-Analyse für Bootstrap-Szenario',
    isFavorite: false,
  } as SavedAnalysis;

  // Investor Szenario - MedTech AI Solutions (HealthTech)
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
      projectBasics: {
        category: 'healthtech' as const,
        stage: 'beta' as const,
        targetCustomer: 'b2b' as const,
        hasRevenue: true,
        monthlyRevenue: 45000,
        revenueGrowthRate: 25,
        hasUsers: true,
        userCount: 12,
        userGrowthRate: 15,
        launchDate: '2023-09-01',
      },
      personalSituation: {
        teamSize: 'small_team' as const,
        cofoundersCount: 2,
        hasRelevantExperience: true,
        yearsExperience: 12,
        commitment: 'fulltime' as const,
        hoursPerWeek: 60,
        runwayMonths: 8,
        financialSituation: 'some_savings' as const,
        riskTolerance: 8,
        hasOtherIncome: false,
      },
      goals: {
        exitGoal: 'acquisition' as const,
        targetExitValue: 50000000,
        growthSpeed: 'aggressive' as const,
        controlImportance: 5,
        timeHorizon: '5_years' as const,
        openToInvestors: true,
        openToCoFounders: false,
        prioritizeProfitability: false,
      },
      marketAnalysis: {
        knownCompetitors: ['Aidoc', 'Zebra Medical', 'Viz.ai', 'Qure.ai'],
        competitorStrength: 8,
        marketTiming: 'growing' as const,
        marketType: 'winner_takes_all' as const,
        regulatoryComplexity: 9,
        estimatedTAM: 45000000000,
        estimatedSAM: 3000000000,
        estimatedSOM: 50000000,
      },
      detailedInput: {
        productDescription: 'MedTech AI analysiert medizinische Bildgebung (CT, MRT, Röntgen) mit KI und liefert Diagnosevorschläge in Sekunden statt Stunden.',
        mainProblemSolved: 'Radiologenmangel und lange Wartezeiten auf Befunde in Krankenhäusern',
        uniqueValueProp: 'Höchste Genauigkeit bei gleichzeitiger CE-Zertifizierung und DSGVO-Konformität für den europäischen Markt',
        liveURL: 'https://medtech-ai.example.com',
        pricingStructure: 'Per-Scan-Pricing ab 2€/Scan, Enterprise-Pakete verfügbar',
      },
      completedSteps: [0, 1, 2, 3],
    },
    routeResult: {
      recommendation: 'investor',
      confidence: 85,
      scores: { bootstrap: 35, investor: 88, hybrid: 60 },
      reasons: [
        { factor: 'Kapitalbedarf', impact: 'positive' as const, explanation: 'Hoher Kapitalbedarf für regulatorische Zulassungen und Enterprise-Sales', score: 18 },
        { factor: 'Marktgröße', impact: 'positive' as const, explanation: 'Milliarden-Markt mit Winner-takes-all Dynamik', score: 15 },
        { factor: 'Wachstumsziel', impact: 'positive' as const, explanation: 'Aggressive Wachstumsziele erfordern Skalierungskapital', score: 12 },
        { factor: 'Exit-Ziel', impact: 'positive' as const, explanation: 'Acquisition-Exit passt zu VC-Finanzierung', score: 10 },
      ],
      actionPlan: {
        route: 'investor',
        phases: [
          {
            title: 'Phase 1: Seed-Runde vorbereiten',
            duration: '2-3 Monate',
            tasks: [
              { id: 'task-1-1', title: 'Pitch Deck erstellen', description: 'Erstelle ein überzeugendes 12-15 Folien Pitch Deck mit Fokus auf Traction und Team', priority: 'critical' as const, estimatedHours: 40, tools: ['Pitch.com', 'Figma'], tips: ['Zeige Unit Economics', 'Betone regulatorische Vorteile'] },
              { id: 'task-1-2', title: 'Financial Model', description: 'Entwickle detailliertes 5-Jahres-Financial-Model mit verschiedenen Szenarien', priority: 'critical' as const, estimatedHours: 30, tools: ['Excel', 'Causal'] },
              { id: 'task-1-3', title: 'Investor-Pipeline aufbauen', description: 'Identifiziere und recherchiere 50+ relevante HealthTech-Investoren', priority: 'high' as const, estimatedHours: 25, tools: ['Crunchbase', 'PitchBook', 'LinkedIn'] },
              { id: 'task-1-4', title: 'Data Room vorbereiten', description: 'Stelle alle relevanten Dokumente für Due Diligence zusammen', priority: 'high' as const, estimatedHours: 20, tools: ['DocSend', 'Notion'] },
            ],
            budget: { min: 5000, max: 15000, currency: 'EUR' },
            timePerWeek: { min: 30, max: 45 },
            milestones: ['Pitch Deck fertig', 'Pipeline mit 50 Investoren', 'Data Room komplett'],
            resources: [
              { name: 'YC Seed Deck Template', type: 'template' as const, url: 'https://ycombinator.com', cost: 'free' as const, description: 'Best-Practice Pitch Deck Vorlage' },
            ],
          },
          {
            title: 'Phase 2: Fundraising',
            duration: '3-4 Monate',
            tasks: [
              { id: 'task-2-1', title: 'Investor-Meetings', description: 'Führe 30-50 Erstgespräche mit qualifizierten Investoren', priority: 'critical' as const, estimatedHours: 60, tips: ['2-3 Meetings pro Tag max', 'Follow-up innerhalb 24h'] },
              { id: 'task-2-2', title: 'Term Sheet verhandeln', description: 'Verhandle Bewertung und Konditionen mit interessierten Investoren', priority: 'critical' as const, estimatedHours: 25, tools: ['Rechtsanwalt'], tips: ['Vergleiche 2-3 Term Sheets', 'Fokus auf Valuation und Board-Sitze'] },
              { id: 'task-2-3', title: 'Due Diligence begleiten', description: 'Beantworte Fragen und stelle zusätzliche Dokumente bereit', priority: 'high' as const, estimatedHours: 30 },
            ],
            budget: { min: 20000, max: 50000, currency: 'EUR' },
            timePerWeek: { min: 35, max: 50 },
            milestones: ['Term Sheet erhalten', '2.5M Seed-Runde geschlossen'],
            resources: [],
          },
        ],
        totalBudget: { min: 50000, max: 150000, currency: 'EUR' },
        totalDuration: '5-7 Monate',
        criticalPath: ['Pitch Deck', 'Investor-Pipeline', 'Term Sheet', 'Closing'],
        riskFactors: ['Regulatorische Verzögerungen', 'Lange Sales-Zyklen im Enterprise-Bereich', 'Hohe Burn-Rate'],
        successMetrics: ['2.5M Seed-Runde', 'Post-Money Valuation > 10M', 'Runway > 18 Monate nach Funding'],
      },
      alternativeConsiderations: ['Grants und Förderungen als ergänzende Finanzierung'],
      warnings: ['CE-Zertifizierung kann länger dauern als geplant'],
    },
    valuationResults: { methodResults: [], finalResult: null },
    completedTasks: [],
    taskTimeTracking: [],
    tags: ['test', 'demo'],
    notes: 'Demo-Analyse für Investor-Szenario',
    isFavorite: false,
  } as SavedAnalysis;

  // Hybrid Szenario - GreenCommute (Mobility)
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
      projectBasics: {
        category: 'marketplace' as const,
        stage: 'mvp' as const,
        targetCustomer: 'b2c' as const,
        hasRevenue: true,
        monthlyRevenue: 3200,
        revenueGrowthRate: 35,
        hasUsers: true,
        userCount: 2800,
        userGrowthRate: 20,
        launchDate: '2024-06-01',
      },
      personalSituation: {
        teamSize: 'cofounders' as const,
        cofoundersCount: 2,
        hasRelevantExperience: true,
        yearsExperience: 7,
        commitment: 'fulltime' as const,
        hoursPerWeek: 55,
        runwayMonths: 10,
        financialSituation: 'some_savings' as const,
        riskTolerance: 7,
        hasOtherIncome: true,
      },
      goals: {
        exitGoal: 'unsure' as const,
        growthSpeed: 'moderate' as const,
        controlImportance: 7,
        timeHorizon: '3_years' as const,
        openToInvestors: true,
        openToCoFounders: true,
        prioritizeProfitability: true,
      },
      marketAnalysis: {
        knownCompetitors: ['Citymapper', 'Moovit', 'Transit', 'Google Maps'],
        competitorStrength: 8,
        marketTiming: 'growing' as const,
        marketType: 'fragmented' as const,
        regulatoryComplexity: 5,
        estimatedTAM: 8000000000,
        estimatedSAM: 800000000,
        estimatedSOM: 10000000,
      },
      detailedInput: {
        productDescription: 'GreenCommute verbindet alle nachhaltigen Mobilitätsoptionen (E-Bikes, E-Scooter, ÖPNV, Carsharing) in einer App und optimiert Routen für minimalen CO2-Ausstoß.',
        mainProblemSolved: 'Fragmentierte Mobilität - Nutzer müssen zwischen 5+ Apps wechseln für eine nachhaltige Fahrt',
        uniqueValueProp: 'Erste App die CO2-Ersparnis trackt und mit Rewards belohnt - Gamification trifft Nachhaltigkeit',
        liveURL: 'https://greencommute.example.com',
        pricingStructure: 'Freemium mit Premium-Abo (4.99€/Monat) für erweiterte Features',
      },
      completedSteps: [0, 1, 2, 3],
    },
    routeResult: {
      recommendation: 'hybrid',
      confidence: 72,
      scores: { bootstrap: 55, investor: 60, hybrid: 75 },
      reasons: [
        { factor: 'Flexibilität', impact: 'positive' as const, explanation: 'Hybrid ermöglicht Traction-Aufbau vor größerer Runde', score: 14 },
        { factor: 'Marktposition', impact: 'positive' as const, explanation: 'Noch keine klare Marktführerschaft - Zeit zum Experimentieren', score: 12 },
        { factor: 'Kontrolle & Wachstum', impact: 'positive' as const, explanation: 'Balanced approach zwischen Kontrolle und Wachstum', score: 10 },
        { factor: 'Runway', impact: 'neutral' as const, explanation: '10 Monate Runway erlauben strategische Finanzierung', score: 8 },
      ],
      actionPlan: {
        route: 'hybrid',
        phases: [
          {
            title: 'Phase 1: Product-Market Fit validieren',
            duration: '2-3 Monate',
            tasks: [
              { id: 'task-1-1', title: 'User Research', description: 'Führe 50+ User-Interviews durch um Kernbedürfnisse zu verstehen', priority: 'critical' as const, estimatedHours: 35, tools: ['Calendly', 'Zoom', 'Notion'] },
              { id: 'task-1-2', title: 'Retention optimieren', description: 'Implementiere Push-Notifications und Habit-Loops', priority: 'high' as const, estimatedHours: 30, tools: ['OneSignal', 'Amplitude'] },
              { id: 'task-1-3', title: 'Kernmetriken definieren', description: 'Setze North Star Metric und Key Metrics Dashboard auf', priority: 'high' as const, estimatedHours: 15, tools: ['Mixpanel', 'Metabase'] },
            ],
            budget: { min: 2000, max: 5000, currency: 'EUR' },
            timePerWeek: { min: 25, max: 35 },
            milestones: ['40% Week-1 Retention', 'Net Promoter Score > 50'],
            resources: [
              { name: 'Superhuman PMF Survey', type: 'template' as const, cost: 'free' as const, description: 'Product-Market Fit Umfrage Template' },
            ],
          },
          {
            title: 'Phase 2: Angel/Pre-Seed Runde',
            duration: '2-3 Monate',
            tasks: [
              { id: 'task-2-1', title: 'Angel-Investoren identifizieren', description: 'Finde 20-30 relevante Angels aus Mobility/Sustainability', priority: 'high' as const, estimatedHours: 20, tools: ['LinkedIn', 'AngelList'] },
              { id: 'task-2-2', title: 'Pitch-Events besuchen', description: 'Nimm an 5-10 relevanten Startup-Events teil', priority: 'medium' as const, estimatedHours: 25, tips: ['Bits & Pretzels', 'Greentech Festival'] },
              { id: 'task-2-3', title: 'SAFE/Convertible Note', description: 'Schließe 150-300k Angel-Runde ab', priority: 'high' as const, estimatedHours: 30 },
            ],
            budget: { min: 3000, max: 8000, currency: 'EUR' },
            timePerWeek: { min: 20, max: 30 },
            milestones: ['200k Angel-Runde geschlossen', 'Runway auf 18 Monate verlängert'],
            resources: [],
          },
          {
            title: 'Phase 3: Skalierung vorbereiten',
            duration: '3-4 Monate',
            tasks: [
              { id: 'task-3-1', title: 'Stadt #2 und #3 launchen', description: 'Expandiere in 2 weitere Städte mit bestehendem Playbook', priority: 'high' as const, estimatedHours: 50 },
              { id: 'task-3-2', title: 'B2B2C Partnerships', description: 'Schließe Deals mit Arbeitgebern für Mitarbeiter-Mobilität', priority: 'medium' as const, estimatedHours: 40 },
              { id: 'task-3-3', title: 'Seed-Runde vorbereiten', description: 'Mit validierter Traction Seed-Runde für echte Skalierung starten', priority: 'high' as const, estimatedHours: 35 },
            ],
            budget: { min: 15000, max: 40000, currency: 'EUR' },
            timePerWeek: { min: 30, max: 40 },
            milestones: ['10.000 aktive User', '3 Städte live', 'MRR > 10.000€'],
            resources: [],
          },
        ],
        totalBudget: { min: 20000, max: 60000, currency: 'EUR' },
        totalDuration: '7-10 Monate',
        criticalPath: ['PMF Validierung', 'Retention > 40%', 'Angel-Runde', 'Stadt-Expansion'],
        riskFactors: ['Abhängigkeit von Mobility-Partnern', 'Hohe Customer Acquisition Costs in neuen Städten'],
        successMetrics: ['10.000 MAU', 'MRR > 10.000€', '40% D7 Retention', 'NPS > 50'],
      },
      alternativeConsiderations: ['Grants für GreenTech prüfen (z.B. KfW, EXIST)'],
      warnings: ['B2C Marketplaces haben oft hohe CAC - Unit Economics genau tracken'],
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
