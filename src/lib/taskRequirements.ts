import type { TaskAssistance } from '@/types';

// ═══════════════════════════════════════════════════════════════════════════
// PITCH DECK ERSTELLEN
// ═══════════════════════════════════════════════════════════════════════════

export const PITCH_DECK_REQUIREMENTS: TaskAssistance = {
  canHelp: true,
  helpType: 'generate',

  requirements: [
    {
      id: 'problem',
      label: 'Problem Statement',
      description: 'Welches Problem löst du? Für wen ist es ein Problem?',
      contextPath: 'core.problemStatement',
      importance: 'critical',
      helperConfig: {
        type: 'wizard',
        componentId: 'ProblemStatementWizard',
      },
    },
    {
      id: 'solution',
      label: 'Deine Lösung',
      description: 'Wie löst du das Problem? Was ist dein Produkt/Service?',
      contextPath: 'core.solution',
      importance: 'critical',
      helperConfig: {
        type: 'wizard',
        componentId: 'SolutionWizard',
      },
    },
    {
      id: 'uvp',
      label: 'Unique Value Proposition',
      description: 'Was macht dich einzigartig? Warum du und nicht die Konkurrenz?',
      contextPath: 'core.uniqueValueProposition',
      importance: 'critical',
      helperConfig: {
        type: 'wizard',
        componentId: 'UVPWizard',
      },
    },
    {
      id: 'target_customer',
      label: 'Zielkunde',
      description: 'Wer genau ist dein Kunde? B2B oder B2C? Welche Branche?',
      contextPath: 'core.targetCustomer',
      importance: 'critical',
      helperConfig: {
        type: 'wizard',
        componentId: 'TargetCustomerWizard',
      },
    },
    {
      id: 'market_size',
      label: 'Marktgröße (TAM/SAM/SOM)',
      description: 'Wie groß ist der Markt? Was ist realistisch erreichbar?',
      contextPath: 'market.tam',
      importance: 'critical',
      helperConfig: {
        type: 'calculator',
        componentId: 'MarketSizeCalculator',
      },
    },
    {
      id: 'business_model',
      label: 'Business Model',
      description: 'Wie verdienst du Geld? Subscription, Transaktion, Lizenz?',
      contextPath: 'business.revenueModel',
      importance: 'critical',
      helperConfig: {
        type: 'wizard',
        componentId: 'BusinessModelWizard',
      },
    },
    {
      id: 'traction',
      label: 'Traction & Metrics',
      description: 'Was hast du bereits erreicht? User, Revenue, Growth?',
      contextPath: 'traction',
      importance: 'important',
      helperConfig: {
        type: 'wizard',
        componentId: 'TractionWizard',
      },
    },
    {
      id: 'team',
      label: 'Team',
      description: 'Wer sind die Gründer? Relevante Erfahrung?',
      contextPath: 'team.founders',
      importance: 'critical',
      helperConfig: {
        type: 'wizard',
        componentId: 'TeamWizard',
      },
    },
    {
      id: 'competitors',
      label: 'Wettbewerb',
      description: 'Wer sind deine Konkurrenten? Wie unterscheidest du dich?',
      contextPath: 'market.competitors',
      importance: 'important',
      helperConfig: {
        type: 'research',
        componentId: 'CompetitorResearch',
      },
    },
    {
      id: 'funding_ask',
      label: 'Funding Ask',
      description: 'Wie viel brauchst du? Wofür?',
      contextPath: 'funding',
      importance: 'critical',
      helperConfig: {
        type: 'calculator',
        componentId: 'FundingCalculator',
      },
    },
  ],

  minimumRequirements: ['problem', 'solution', 'target_customer', 'team'],

  qualityGate: {
    minConfidenceToStart: 40,
    minConfidenceForDraft: 60,
    minConfidenceForFinal: 85,
  },

  output: {
    type: 'document',
    format: 'pitch_deck',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// TARGET-LISTE ERSTELLEN (INVESTOREN)
// ═══════════════════════════════════════════════════════════════════════════

export const INVESTOR_LIST_REQUIREMENTS: TaskAssistance = {
  canHelp: true,
  helpType: 'research',

  requirements: [
    {
      id: 'stage',
      label: 'Aktuelle Stage',
      description: 'In welcher Phase ist dein Startup? (Pre-Seed, Seed, Series A)',
      contextPath: 'traction.currentStage',
      importance: 'critical',
      helperConfig: {
        type: 'wizard',
        componentId: 'StageAssessment',
      },
    },
    {
      id: 'sector',
      label: 'Sektor / Branche',
      description: 'In welcher Branche bist du? (HealthTech, FinTech, B2B SaaS, etc.)',
      contextPath: 'core.targetCustomer',
      importance: 'critical',
      helperConfig: {
        type: 'wizard',
        componentId: 'SectorWizard',
      },
    },
    {
      id: 'funding_target',
      label: 'Funding-Ziel',
      description: 'Wie viel willst du raisen? (€200k, €500k, €2M?)',
      contextPath: 'funding.targetAmount',
      importance: 'critical',
      helperConfig: {
        type: 'calculator',
        componentId: 'FundingCalculator',
      },
    },
    {
      id: 'geography',
      label: 'Geografie-Präferenz',
      description: 'Wo sollen die Investoren sitzen? (nur DACH, EU, Global)',
      contextPath: 'preferences.geographicFocus',
      importance: 'critical',
      helperConfig: {
        type: 'wizard',
        componentId: 'GeographyWizard',
      },
    },
    {
      id: 'traction_status',
      label: 'Aktueller Status',
      description: 'Hast du bereits Revenue? User? MVP? Nur Idee?',
      contextPath: 'traction',
      importance: 'critical',
      helperConfig: {
        type: 'wizard',
        componentId: 'TractionWizard',
      },
    },
    {
      id: 'investor_preferences',
      label: 'Investoren-Typ Präferenz',
      description: 'Angels, VCs, Corporate VCs? Gibt es Deal-Breaker?',
      contextPath: 'preferences.investorTypes',
      importance: 'important',
      helperConfig: {
        type: 'wizard',
        componentId: 'InvestorPreferenceWizard',
      },
    },
    {
      id: 'unique_angle',
      label: 'Unique Angle / USP',
      description: 'Was macht dich besonders? (Für Matching mit Investor-Thesis)',
      contextPath: 'core.uniqueValueProposition',
      importance: 'important',
    },
  ],

  minimumRequirements: ['stage', 'sector', 'funding_target', 'geography'],

  qualityGate: {
    minConfidenceToStart: 50,
    minConfidenceForDraft: 70,
    minConfidenceForFinal: 90,
  },

  output: {
    type: 'list',
    format: 'investor_list',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// FINANCIAL MODEL BAUEN
// ═══════════════════════════════════════════════════════════════════════════

export const FINANCIAL_MODEL_REQUIREMENTS: TaskAssistance = {
  canHelp: true,
  helpType: 'calculate',

  requirements: [
    {
      id: 'revenue_model',
      label: 'Revenue Model',
      description: 'Wie verdienst du Geld? (Subscription, Transaktion, etc.)',
      contextPath: 'business.revenueModel',
      importance: 'critical',
      helperConfig: {
        type: 'wizard',
        componentId: 'RevenueModelWizard',
      },
    },
    {
      id: 'pricing',
      label: 'Pricing',
      description: 'Was kostet dein Produkt? Verschiedene Tiers?',
      contextPath: 'business.pricingStrategy',
      importance: 'critical',
      helperConfig: {
        type: 'wizard',
        componentId: 'PricingWizard',
      },
    },
    {
      id: 'current_metrics',
      label: 'Aktuelle Metrics',
      description: 'Aktuelle User/Kunden, Revenue, Kosten',
      contextPath: 'traction',
      importance: 'important',
      helperConfig: {
        type: 'wizard',
        componentId: 'MetricsWizard',
      },
    },
    {
      id: 'cost_structure',
      label: 'Kostenstruktur',
      description: 'Was sind deine Fixkosten? Variable Kosten?',
      contextPath: 'business.unitEconomics',
      importance: 'critical',
      helperConfig: {
        type: 'calculator',
        componentId: 'CostCalculator',
      },
    },
    {
      id: 'growth_assumptions',
      label: 'Wachstumsannahmen',
      description: 'Wie schnell willst du wachsen? Was ist realistisch?',
      contextPath: 'traction.growth',
      importance: 'important',
      helperConfig: {
        type: 'wizard',
        componentId: 'GrowthAssumptionsWizard',
      },
    },
    {
      id: 'hiring_plan',
      label: 'Hiring Plan',
      description: 'Wie viele Leute brauchst du? Wann?',
      contextPath: 'team.keyHires',
      importance: 'important',
      helperConfig: {
        type: 'wizard',
        componentId: 'HiringPlanWizard',
      },
    },
  ],

  minimumRequirements: ['revenue_model', 'pricing', 'cost_structure'],

  qualityGate: {
    minConfidenceToStart: 45,
    minConfidenceForDraft: 65,
    minConfidenceForFinal: 85,
  },

  output: {
    type: 'calculation',
    format: 'financial_model',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPETITOR ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════

export const COMPETITOR_ANALYSIS_REQUIREMENTS: TaskAssistance = {
  canHelp: true,
  helpType: 'research',

  requirements: [
    {
      id: 'solution',
      label: 'Deine Lösung',
      description: 'Was bietest du an? Welches Problem löst du?',
      contextPath: 'core.solution',
      importance: 'critical',
      helperConfig: {
        type: 'wizard',
        componentId: 'SolutionWizard',
      },
    },
    {
      id: 'target_customer',
      label: 'Zielkunde',
      description: 'Wer ist dein Kunde? B2B/B2C? Branche?',
      contextPath: 'core.targetCustomer',
      importance: 'critical',
      helperConfig: {
        type: 'wizard',
        componentId: 'TargetCustomerWizard',
      },
    },
    {
      id: 'known_competitors',
      label: 'Bekannte Wettbewerber',
      description: 'Welche Konkurrenten kennst du bereits?',
      contextPath: 'market.competitors',
      importance: 'important',
    },
    {
      id: 'uvp',
      label: 'Dein Differentiator',
      description: 'Was unterscheidet dich von der Konkurrenz?',
      contextPath: 'core.uniqueValueProposition',
      importance: 'important',
      helperConfig: {
        type: 'wizard',
        componentId: 'UVPWizard',
      },
    },
  ],

  minimumRequirements: ['solution', 'target_customer'],

  qualityGate: {
    minConfidenceToStart: 40,
    minConfidenceForDraft: 60,
    minConfidenceForFinal: 80,
  },

  output: {
    type: 'analysis',
    format: 'competitor_analysis',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MARKET SIZE ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════

export const MARKET_SIZE_REQUIREMENTS: TaskAssistance = {
  canHelp: true,
  helpType: 'calculate',

  requirements: [
    {
      id: 'target_customer',
      label: 'Zielkunde',
      description: 'Wer ist dein primärer Kunde?',
      contextPath: 'core.targetCustomer',
      importance: 'critical',
      helperConfig: {
        type: 'wizard',
        componentId: 'TargetCustomerWizard',
      },
    },
    {
      id: 'solution',
      label: 'Produkt/Service',
      description: 'Was verkaufst du?',
      contextPath: 'core.solution',
      importance: 'critical',
      helperConfig: {
        type: 'wizard',
        componentId: 'SolutionWizard',
      },
    },
    {
      id: 'pricing',
      label: 'Preispunkt',
      description: 'Was kostet dein Produkt ungefähr?',
      contextPath: 'business.pricingStrategy',
      importance: 'important',
      helperConfig: {
        type: 'wizard',
        componentId: 'PricingWizard',
      },
    },
    {
      id: 'geography',
      label: 'Zielregion',
      description: 'In welchen Ländern/Regionen willst du aktiv sein?',
      contextPath: 'preferences.geographicFocus',
      importance: 'important',
      helperConfig: {
        type: 'wizard',
        componentId: 'GeographyWizard',
      },
    },
  ],

  minimumRequirements: ['target_customer', 'solution'],

  qualityGate: {
    minConfidenceToStart: 35,
    minConfidenceForDraft: 55,
    minConfidenceForFinal: 75,
  },

  output: {
    type: 'calculation',
    format: 'market_size',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// TASK CONFIGURATION REGISTRY
// ═══════════════════════════════════════════════════════════════════════════

export const TASK_ASSISTANCE_CONFIG: Record<string, TaskAssistance> = {
  pitch_deck: PITCH_DECK_REQUIREMENTS,
  investor_list: INVESTOR_LIST_REQUIREMENTS,
  financial_model: FINANCIAL_MODEL_REQUIREMENTS,
  competitor_analysis: COMPETITOR_ANALYSIS_REQUIREMENTS,
  market_size: MARKET_SIZE_REQUIREMENTS,
};

// ═══════════════════════════════════════════════════════════════════════════
// TASK LABELS (German)
// ═══════════════════════════════════════════════════════════════════════════

export const TASK_LABELS: Record<string, { title: string; description: string }> = {
  pitch_deck: {
    title: 'Pitch Deck erstellen',
    description: 'Ein professionelles Pitch Deck für Investoren generieren',
  },
  investor_list: {
    title: 'Investor Target-Liste',
    description: 'Passende Investoren für dein Startup finden',
  },
  financial_model: {
    title: 'Financial Model bauen',
    description: 'Finanzprognosen und Unit Economics erstellen',
  },
  competitor_analysis: {
    title: 'Wettbewerbsanalyse',
    description: 'Konkurrenten identifizieren und analysieren',
  },
  market_size: {
    title: 'Marktgröße berechnen',
    description: 'TAM, SAM und SOM für deinen Markt ermitteln',
  },
};
