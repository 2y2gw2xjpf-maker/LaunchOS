import type {
  ProjectContext,
  Investor,
  Assumption,
  PitchDeckSlide,
  PitchDeckResult,
  InvestorListResult,
  InvestorSearchParams,
} from '@/types';

// ═══════════════════════════════════════════════════════════════════════════
// API CONFIGURATION
// Note: In production, this should use environment variables and a backend proxy
// ═══════════════════════════════════════════════════════════════════════════

const API_KEY_STORAGE_KEY = 'launchos-api-key';

export const setApiKey = (key: string) => {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
};

export const getApiKey = (): string | null => {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
};

export const hasApiKey = (): boolean => {
  return !!getApiKey();
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER: Build Project Summary from Context
// ═══════════════════════════════════════════════════════════════════════════

function buildProjectSummary(project: ProjectContext): string {
  const parts: string[] = [];

  if (project.core.problemStatement.value) {
    parts.push(`Problem: ${project.core.problemStatement.value}`);
  }
  if (project.core.solution.value) {
    parts.push(`Lösung: ${project.core.solution.value}`);
  }
  if (project.core.targetCustomer.value) {
    parts.push(`Zielkunde: ${project.core.targetCustomer.value}`);
  }
  if (project.core.uniqueValueProposition.value) {
    parts.push(`USP: ${project.core.uniqueValueProposition.value}`);
  }
  if (project.traction.currentStage.value) {
    parts.push(`Stage: ${project.traction.currentStage.value}`);
  }
  if (project.traction.revenue.value) {
    parts.push(`Revenue: €${project.traction.revenue.value.toLocaleString()}`);
  }
  if (project.traction.users.value) {
    parts.push(`User: ${project.traction.users.value.toLocaleString()}`);
  }
  if (project.team.founders.value) {
    parts.push(
      `Team: ${project.team.founders.value.map((f) => `${f.name} (${f.role})`).join(', ')}`
    );
  }
  if (project.funding.targetAmount.value) {
    parts.push(`Funding-Ziel: €${project.funding.targetAmount.value.toLocaleString()}`);
  }

  return parts.length > 0 ? parts.join('\n') : 'Keine Projekt-Informationen vorhanden.';
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA FOR DEVELOPMENT (when no API key is set)
// ═══════════════════════════════════════════════════════════════════════════

const generateMockInvestorList = (params: InvestorSearchParams): InvestorListResult => {
  const mockInvestors: Investor[] = [
    {
      id: 'inv_1',
      name: 'Cherry Ventures',
      type: 'vc',
      website: 'https://cherry.vc',
      criteria: {
        stages: ['pre_seed', 'seed'],
        ticketSize: { min: 500000, max: 5000000 },
        sectors: ['B2B SaaS', 'Marketplace', 'FinTech'],
        geographies: ['DACH', 'EU'],
      },
      portfolio: {
        totalInvestments: 85,
        recentInvestments: [
          { name: 'Gorillas', sector: 'Delivery', stage: 'seed', year: 2020 },
          { name: 'Flaschenpost', sector: 'E-Commerce', stage: 'seed', year: 2018 },
        ],
        notableExits: ['Auto1', 'Flixbus'],
      },
      contact: {
        preferredMethod: 'warm_intro',
        applicationUrl: 'https://cherry.vc/founders',
        keyPartners: ['Christian Meermann', 'Filip Dames'],
      },
      matchScore: {
        overall: 85,
        breakdown: {
          stageMatch: 90,
          sectorMatch: 85,
          ticketMatch: 80,
          geographyMatch: 95,
          activityScore: 75,
        },
        reasoning: 'Starker Fit für DACH B2B SaaS in früher Phase',
      },
    },
    {
      id: 'inv_2',
      name: 'HV Capital',
      type: 'vc',
      website: 'https://www.hvcapital.com',
      criteria: {
        stages: ['seed', 'series_a'],
        ticketSize: { min: 1000000, max: 15000000 },
        sectors: ['Enterprise Software', 'Consumer Internet', 'HealthTech'],
        geographies: ['DACH', 'EU', 'US'],
      },
      portfolio: {
        totalInvestments: 120,
        recentInvestments: [
          { name: 'Scalable Capital', sector: 'FinTech', stage: 'series_a', year: 2021 },
        ],
        notableExits: ['Zalando', 'HelloFresh', 'Delivery Hero'],
      },
      contact: {
        preferredMethod: 'warm_intro',
        applicationUrl: 'https://www.hvcapital.com/contact',
        keyPartners: ['Rainer Maerkle', 'David Kuczek'],
      },
      matchScore: {
        overall: 78,
        breakdown: {
          stageMatch: 75,
          sectorMatch: 80,
          ticketMatch: 85,
          geographyMatch: 90,
          activityScore: 60,
        },
        reasoning: 'Etablierter VC mit gutem Track Record',
      },
    },
    {
      id: 'inv_3',
      name: 'ByFounders',
      type: 'vc',
      website: 'https://byfounders.vc',
      criteria: {
        stages: ['pre_seed', 'seed'],
        ticketSize: { min: 200000, max: 2000000 },
        sectors: ['B2B', 'Deep Tech', 'Climate'],
        geographies: ['Nordics', 'DACH', 'EU'],
      },
      portfolio: {
        totalInvestments: 45,
        recentInvestments: [],
        notableExits: [],
      },
      contact: {
        preferredMethod: 'cold_email',
        applicationUrl: 'https://byfounders.vc/pitch',
        keyPartners: ['Eric Lagier', 'Tommy Andersen'],
      },
      matchScore: {
        overall: 72,
        breakdown: {
          stageMatch: 85,
          sectorMatch: 70,
          ticketMatch: 75,
          geographyMatch: 80,
          activityScore: 50,
        },
        reasoning: 'Founder-freundlicher VC mit Operator-Background',
      },
    },
  ];

  return {
    investors: mockInvestors.filter((inv) => {
      // Simple filtering based on params
      const stageMatch = inv.criteria.stages.some((s) =>
        params.stage.toLowerCase().includes(s.replace('_', ' '))
      );
      return stageMatch || true; // Return all for mock
    }),
    confidence: 65,
    assumptions: [
      {
        id: 'mock_data',
        description: 'Dies sind Beispieldaten. Für echte Investoren-Recherche wird eine API-Verbindung benötigt.',
        impact: 'high',
        howToVerify: 'API-Key in den Einstellungen hinterlegen',
      },
      {
        id: 'fund_status',
        description: 'Der aktuelle Fund-Status der Investoren wurde nicht verifiziert',
        impact: 'medium',
        howToVerify: 'Website des Investors prüfen oder im Netzwerk nachfragen',
      },
    ],
    searchMethodology: 'Mock-Daten basierend auf bekannten DACH-Investoren',
    limitations: [
      'Keine Live-Recherche - Beispieldaten',
      'Kein personalisiertes Matching',
      'Keine aktuellen Portfolio-Updates',
    ],
  };
};

const generateMockPitchDeck = (project: ProjectContext): PitchDeckResult => {
  const slides: PitchDeckSlide[] = [
    {
      number: 1,
      title: 'Title Slide',
      content: project.core.solution.value
        ? `${project.name}\n\n${project.core.solution.value}`
        : `${project.name}\n\n[PLACEHOLDER: Kurze Beschreibung deiner Lösung]`,
      speakerNotes: 'Kurze Vorstellung, Namen merken. Maximal 30 Sekunden.',
      dataConfidence: project.core.solution.value ? 80 : 20,
    },
    {
      number: 2,
      title: 'Das Problem',
      content: project.core.problemStatement.value || '[PLACEHOLDER: Problem Statement]',
      speakerNotes:
        'Das Problem konkret und emotional beschreiben. Warum ist es wichtig, das jetzt zu lösen?',
      dataConfidence: project.core.problemStatement.value ? 85 : 10,
      assumptions: project.core.problemStatement.value
        ? undefined
        : ['Problem Statement fehlt'],
    },
    {
      number: 3,
      title: 'Die Lösung',
      content: project.core.solution.value || '[PLACEHOLDER: Deine Lösung]',
      speakerNotes:
        'Wie löst du das Problem? Zeige den Aha-Moment. Nicht zu technisch werden.',
      dataConfidence: project.core.solution.value ? 85 : 10,
    },
    {
      number: 4,
      title: 'Marktgröße',
      content: project.market.tam.value
        ? `TAM: €${project.market.tam.value.value.toLocaleString()}\nSAM: ${project.market.sam.value?.value.toLocaleString() || '[TBD]'}\nSOM: ${project.market.som.value?.value.toLocaleString() || '[TBD]'}`
        : '[PLACEHOLDER: TAM/SAM/SOM - Marktgrößen berechnen]',
      speakerNotes:
        'Bottom-up ist glaubwürdiger als Top-down. Zeige, wie du auf die Zahlen kommst.',
      dataConfidence: project.market.tam.value ? 70 : 5,
      assumptions: project.market.tam.value
        ? undefined
        : ['Marktdaten fehlen komplett'],
    },
    {
      number: 5,
      title: 'Business Model',
      content: project.business.revenueModel.value
        ? `Revenue Model: ${project.business.revenueModel.value.type}\n${project.business.revenueModel.value.description}`
        : '[PLACEHOLDER: Wie verdienst du Geld?]',
      speakerNotes: 'Unit Economics sind wichtig. Zeige CAC, LTV, Payback Period wenn vorhanden.',
      dataConfidence: project.business.revenueModel.value ? 75 : 10,
    },
    {
      number: 6,
      title: 'Traction',
      content: `${project.traction.users.value ? `User: ${project.traction.users.value.toLocaleString()}` : ''}\n${project.traction.revenue.value ? `MRR: €${project.traction.revenue.value.toLocaleString()}` : ''}\n${project.traction.growth.value ? `Growth: ${project.traction.growth.value.monthlyGrowthRate}% MoM` : ''}`.trim() ||
        '[PLACEHOLDER: Traction Metrics]',
      speakerNotes:
        'Zeige die wichtigsten Metriken. Wachstum ist wichtiger als absolute Zahlen.',
      dataConfidence:
        project.traction.users.value || project.traction.revenue.value ? 80 : 15,
    },
    {
      number: 7,
      title: 'Team',
      content: project.team.founders.value
        ? project.team.founders.value
            .map((f) => `${f.name}\n${f.role}\n${f.background}`)
            .join('\n\n')
        : '[PLACEHOLDER: Founder Profiles]',
      speakerNotes:
        'Warum seid IHR das richtige Team für dieses Problem? Relevante Erfahrung hervorheben.',
      dataConfidence: project.team.founders.value ? 85 : 5,
      assumptions: project.team.founders.value ? undefined : ['Team-Infos fehlen'],
    },
    {
      number: 8,
      title: 'Ask',
      content: project.funding.targetAmount.value
        ? `Wir raisen €${project.funding.targetAmount.value.toLocaleString()}\n\nUse of Funds:\n${project.funding.useOfFunds.value?.map((u) => `- ${u.category}: ${u.percentage}%`).join('\n') || '[TBD]'}`
        : '[PLACEHOLDER: Funding Ask und Use of Funds]',
      speakerNotes:
        'Sei spezifisch über die Verwendung. Zeige 18-24 Monate Runway.',
      dataConfidence: project.funding.targetAmount.value ? 80 : 10,
    },
  ];

  const avgConfidence =
    slides.reduce((sum, s) => sum + s.dataConfidence, 0) / slides.length;

  const missingForBetter: string[] = [];
  if (!project.market.tam.value) {
    missingForBetter.push('Marktgröße (TAM/SAM/SOM) für überzeugendere Market Slide');
  }
  if (!project.traction.revenue.value && !project.traction.users.value) {
    missingForBetter.push('Traction-Daten (Revenue oder User) für Glaubwürdigkeit');
  }
  if (!project.market.competitors.value) {
    missingForBetter.push('Wettbewerbsanalyse für stärkere Positionierung');
  }
  if (!project.business.unitEconomics.value) {
    missingForBetter.push('Unit Economics für Business Model Slide');
  }

  return {
    slides,
    overallConfidence: Math.round(avgConfidence),
    assumptions: [
      {
        id: 'mock_generation',
        description:
          'Deck wurde lokal generiert. Für AI-optimierte Inhalte wird eine API-Verbindung benötigt.',
        impact: 'medium',
        howToVerify: 'API-Key in den Einstellungen hinterlegen',
      },
    ],
    missingForBetterDeck: missingForBetter,
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC API FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export async function generateInvestorList(
  params: InvestorSearchParams,
  projectContext: ProjectContext
): Promise<InvestorListResult> {
  const apiKey = getApiKey();

  // If no API key, return mock data
  if (!apiKey) {
    console.log('No API key set, returning mock investor data');
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate delay
    return generateMockInvestorList(params);
  }

  // Real API call would go here
  // For now, we'll use mock data as a fallback
  try {
    const _contextSummary = buildProjectSummary(projectContext);

    // This is where you would make the actual API call
    // const response = await fetch('...', { ... });

    // For now, return enhanced mock data
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return generateMockInvestorList(params);
  } catch (error) {
    console.error('Error generating investor list:', error);
    throw error;
  }
}

export async function generatePitchDeck(
  projectContext: ProjectContext
): Promise<PitchDeckResult> {
  const apiKey = getApiKey();

  // If no API key, return template-based mock
  if (!apiKey) {
    console.log('No API key set, returning template-based pitch deck');
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate delay
    return generateMockPitchDeck(projectContext);
  }

  // Real API call would go here
  try {
    // This is where you would make the actual API call
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return generateMockPitchDeck(projectContext);
  } catch (error) {
    console.error('Error generating pitch deck:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPETITOR ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════

export interface CompetitorAnalysisResult {
  competitors: Array<{
    name: string;
    website: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
    funding: string;
    differentiator: string;
  }>;
  marketPosition: string;
  confidence: number;
  assumptions: Assumption[];
}

export async function generateCompetitorAnalysis(
  _projectContext: ProjectContext
): Promise<CompetitorAnalysisResult> {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    competitors: [
      {
        name: 'Beispiel-Wettbewerber 1',
        website: 'https://example.com',
        description: 'Führender Anbieter im Bereich...',
        strengths: ['Etablierte Marke', 'Große Nutzerbasis'],
        weaknesses: ['Veraltete Technologie', 'Schlechter Support'],
        funding: '€10M Series A',
        differentiator: 'Du bist schneller und günstiger',
      },
    ],
    marketPosition:
      'Der Markt ist noch fragmentiert mit Platz für innovative Lösungen.',
    confidence: 55,
    assumptions: [
      {
        id: 'mock_competitors',
        description: 'Dies sind Beispieldaten. Für echte Recherche wird API-Zugang benötigt.',
        impact: 'high',
        howToVerify: 'Manuelle Recherche oder API-Key hinterlegen',
      },
    ],
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MARKET SIZE CALCULATION
// ═══════════════════════════════════════════════════════════════════════════

export interface MarketSizeResult {
  tam: { value: number; methodology: string };
  sam: { value: number; methodology: string };
  som: { value: number; methodology: string };
  confidence: number;
  assumptions: Assumption[];
  sources: string[];
}

export async function calculateMarketSize(
  _projectContext: ProjectContext
): Promise<MarketSizeResult> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // This would normally use real market data and calculations
  return {
    tam: {
      value: 50000000000,
      methodology: 'Top-down basierend auf Branchengröße',
    },
    sam: {
      value: 5000000000,
      methodology: 'Geografische und Segment-Einschränkung',
    },
    som: {
      value: 100000000,
      methodology: 'Realistische Marktdurchdringung in 3 Jahren',
    },
    confidence: 45,
    assumptions: [
      {
        id: 'market_growth',
        description: 'Angenommenes jährliches Marktwachstum von 15%',
        impact: 'medium',
        howToVerify: 'Mit Branchenreports abgleichen',
      },
      {
        id: 'pricing_assumption',
        description: 'Durchschnittlicher Kundenpreis basierend auf Wettbewerb geschätzt',
        impact: 'high',
        howToVerify: 'Eigene Preistests durchführen',
      },
    ],
    sources: [
      'Beispiel-Branchenreport 2024',
      'Statista Market Outlook',
      'Eigene Berechnungen',
    ],
  };
}
