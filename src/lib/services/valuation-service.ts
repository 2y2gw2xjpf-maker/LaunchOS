/**
 * LaunchOS Valuation Service
 * Berechnet Startup-Bewertungen mit verschiedenen Methoden
 */

import type {
  ValuationMethod,
  ValuationMethodResult,
  WizardData,
  ProjectStage,
} from '@/types';
import { calculateConfidence, getImprovementSuggestions } from './confidence-service';

// ==================== CONSTANTS ====================

/**
 * Methoden-Konfiguration
 */
export const VALUATION_METHODS = {
  berkus: {
    id: 'berkus' as ValuationMethod,
    name: 'Berkus Method',
    description: 'Pre-Revenue Bewertung basierend auf 5 Risikofaktoren',
    sourceUrl: 'https://berkusmethod.com/',
    maxValue: 2500000, // €2.5M max
    factors: ['idea', 'prototype', 'team', 'partnerships', 'sales'],
    applicableStages: ['idea', 'mvp'] as ProjectStage[],
  },
  scorecard: {
    id: 'scorecard' as ValuationMethod,
    name: 'Scorecard Method',
    description: 'Vergleich mit durchschnittlicher Pre-Seed Bewertung in Deutschland',
    sourceUrl: 'https://www.angelcapitalassociation.org/',
    baseValue: 1500000, // €1.5M Durchschnitt Pre-Seed DE
    applicableStages: ['idea', 'mvp', 'beta'] as ProjectStage[],
  },
  vc_method: {
    id: 'vc_method' as ValuationMethod,
    name: 'VC Method',
    description: 'Rückwärtsrechnung vom erwarteten Exit-Wert',
    sourceUrl: 'https://www.investopedia.com/terms/v/venturecapital.asp',
    applicableStages: ['mvp', 'beta', 'live', 'scaling'] as ProjectStage[],
  },
  comparables: {
    id: 'comparables' as ValuationMethod,
    name: 'Comparable Transactions',
    description: 'Basierend auf ähnlichen Deals in deiner Branche',
    sourceUrl: 'https://www.crunchbase.com/',
    applicableStages: ['beta', 'live', 'scaling'] as ProjectStage[],
  },
  dcf: {
    id: 'dcf' as ValuationMethod,
    name: 'DCF (Discounted Cash Flow)',
    description: 'Abgezinste zukünftige Cashflows auf den heutigen Wert',
    sourceUrl: 'https://www.investopedia.com/terms/d/dcf.asp',
    applicableStages: ['live', 'scaling'] as ProjectStage[],
  },
  cost_to_duplicate: {
    id: 'cost_to_duplicate' as ValuationMethod,
    name: 'Cost to Duplicate',
    description: 'Kosten um das Unternehmen/Produkt nachzubauen',
    sourceUrl: 'https://www.startupvaluation.io/',
    applicableStages: ['idea', 'mvp', 'beta'] as ProjectStage[],
  },
};

/**
 * Branchen-Multiples für Revenue-basierte Bewertungen
 */
const INDUSTRY_MULTIPLES: Record<string, number> = {
  saas: 8,
  fintech: 10,
  healthtech: 7,
  edtech: 5,
  ecommerce: 3,
  marketplace: 5,
  content: 4,
  service: 3,
  hardware: 4,
  default: 4,
};

// ==================== TYPES ====================

export interface ValuationInput {
  // Basics
  stage: ProjectStage;
  industry?: string;
  teamSize?: number;

  // Revenue (optional)
  monthlyRevenue?: number;
  growthRate?: number; // Monthly %
  customers?: number;

  // Berkus Factors (1-5)
  ideaScore?: number;
  prototypeScore?: number;
  teamScore?: number;
  partnershipsScore?: number;
  salesScore?: number;

  // Scorecard Factors (0.5-1.5)
  teamStrength?: number;
  marketSizeScore?: number;
  productScore?: number;
  competitionScore?: number;

  // VC Method
  expectedExitValue?: number;
  yearsToExit?: number;
  targetReturn?: number; // Multiple, e.g., 10x

  // Cost to Duplicate
  developmentCosts?: number;
  monthsSpent?: number;
  teamCostPerMonth?: number;
}

export interface ValuationServiceResult {
  methods: ValuationMethodResult[];
  finalValuation: {
    low: number;
    mid: number;
    high: number;
  };
  confidence: {
    score: number;
    factors: {
      dataCompleteness: number;
      dataQuality: number;
      methodApplicability: number;
      marketData: number;
    };
    explanations: string[];
  };
  improvements: string[];
  methodsUsed: string[];
}

// ==================== CALCULATION FUNCTIONS ====================

/**
 * Berkus Method Berechnung
 */
function calculateBerkus(inputs: ValuationInput): ValuationMethodResult {
  const factors = {
    idea: inputs.ideaScore || 3,
    prototype: inputs.prototypeScore || 2,
    team: inputs.teamScore || 3,
    partnerships: inputs.partnershipsScore || 1,
    sales: inputs.salesScore || 1,
  };

  const perFactor = 500000; // €500k pro Faktor max
  const total = Object.values(factors).reduce(
    (sum, score) => sum + (score / 5) * perFactor,
    0
  );

  // Confidence basiert auf ausgefüllten Faktoren
  const filledFactors = Object.values(factors).filter((v) => v > 1).length;
  const confidence = Math.min(85, 40 + filledFactors * 9);

  return {
    method: 'berkus',
    value: Math.round(total),
    confidence,
    inputs: factors,
    breakdown: {
      idea: (factors.idea / 5) * perFactor,
      prototype: (factors.prototype / 5) * perFactor,
      team: (factors.team / 5) * perFactor,
      partnerships: (factors.partnerships / 5) * perFactor,
      sales: (factors.sales / 5) * perFactor,
    },
    notes: [
      `Basiert auf ${VALUATION_METHODS.berkus.name}`,
      `Max. Bewertung: €2.5M (Pre-Revenue Standard)`,
      filledFactors < 5 ? 'Vollständigere Eingaben erhöhen die Genauigkeit' : '',
    ].filter(Boolean),
  };
}

/**
 * Scorecard Method Berechnung
 */
function calculateScorecard(inputs: ValuationInput): ValuationMethodResult {
  const baseValue = VALUATION_METHODS.scorecard.baseValue;

  const weights = {
    team: { weight: 0.3, score: inputs.teamStrength || 1.0 },
    market: { weight: 0.25, score: inputs.marketSizeScore || 1.0 },
    product: { weight: 0.15, score: inputs.productScore || 1.0 },
    competition: { weight: 0.1, score: inputs.competitionScore || 1.0 },
    partnerships: { weight: 0.1, score: (inputs.partnershipsScore || 3) / 3 },
    other: { weight: 0.1, score: 1.0 },
  };

  const totalMultiplier = Object.values(weights).reduce(
    (sum, { weight, score }) => sum + weight * score,
    0
  );

  const value = Math.round(baseValue * totalMultiplier);

  // Confidence
  const adjustedFactors = Object.values(weights).filter(
    (w) => w.score !== 1.0
  ).length;
  const confidence = Math.min(80, 45 + adjustedFactors * 7);

  return {
    method: 'scorecard',
    value,
    confidence,
    inputs: { baseValue, totalMultiplier, weights },
    breakdown: Object.fromEntries(
      Object.entries(weights).map(([k, v]) => [k, baseValue * v.weight * v.score])
    ),
    notes: [
      `Basis: €1.5M (DE Pre-Seed Durchschnitt)`,
      `Gesamt-Multiplikator: ${totalMultiplier.toFixed(2)}x`,
      totalMultiplier > 1.2
        ? 'Überdurchschnittliche Faktoren erhöhen die Bewertung'
        : '',
    ].filter(Boolean),
  };
}

/**
 * VC Method Berechnung
 */
function calculateVCMethod(inputs: ValuationInput): ValuationMethodResult | null {
  if (!inputs.expectedExitValue || !inputs.targetReturn) {
    return null;
  }

  const exitValue = inputs.expectedExitValue;
  const years = inputs.yearsToExit || 5;
  const targetReturn = inputs.targetReturn || 10;

  // Post-Money = Exit Value / Target Return
  const postMoney = exitValue / targetReturn;

  // Pre-Money (angenommen 20% Verwässerung pro Runde)
  const dilutionFactor = Math.pow(0.8, Math.ceil(years / 2));
  const preMoney = postMoney * dilutionFactor;

  const confidence = inputs.expectedExitValue > 0 && inputs.targetReturn > 0 ? 60 : 40;

  return {
    method: 'vc_method',
    value: Math.round(preMoney),
    confidence,
    inputs: { exitValue, years, targetReturn, dilutionFactor },
    breakdown: {
      exitValue,
      postMoney,
      preMoney,
    },
    notes: [
      `Exit-Erwartung: €${(exitValue / 1000000).toFixed(1)}M in ${years} Jahren`,
      `Ziel-Rendite: ${targetReturn}x`,
      `Geschätzte Verwässerung: ${((1 - dilutionFactor) * 100).toFixed(0)}%`,
    ],
  };
}

/**
 * Revenue Multiple Berechnung
 */
function calculateRevenueMultiple(inputs: ValuationInput): ValuationMethodResult | null {
  if (!inputs.monthlyRevenue || inputs.monthlyRevenue <= 0) {
    return null;
  }

  const arr = inputs.monthlyRevenue * 12;
  const industry = inputs.industry?.toLowerCase() || 'default';
  const multiple = INDUSTRY_MULTIPLES[industry] || INDUSTRY_MULTIPLES.default;

  // Growth Bonus
  const growthRate = inputs.growthRate || 0;
  const growthBonus = growthRate > 50 ? 1.5 : growthRate > 20 ? 1.2 : 1.0;

  const value = Math.round(arr * multiple * growthBonus);

  return {
    method: 'comparables',
    value,
    confidence: 70,
    inputs: { arr, multiple, growthBonus, industry },
    breakdown: {
      arr,
      baseValuation: arr * multiple,
      withGrowthBonus: value,
    },
    notes: [
      `ARR: €${(arr / 1000).toFixed(0)}k`,
      `${industry.charAt(0).toUpperCase() + industry.slice(1)} Multiple: ${multiple}x`,
      growthBonus > 1 ? `Wachstums-Bonus: +${((growthBonus - 1) * 100).toFixed(0)}%` : '',
    ].filter(Boolean),
  };
}

/**
 * Cost to Duplicate Berechnung
 */
function calculateCostToDuplicate(inputs: ValuationInput): ValuationMethodResult | null {
  if (!inputs.developmentCosts && !inputs.monthsSpent) {
    return null;
  }

  let totalCost = inputs.developmentCosts || 0;

  // Alternative: Zeit * Team-Kosten
  if (inputs.monthsSpent && inputs.teamCostPerMonth) {
    totalCost = Math.max(totalCost, inputs.monthsSpent * inputs.teamCostPerMonth);
  } else if (inputs.monthsSpent) {
    // Standard: €8k/Monat für ein kleines Team
    totalCost = Math.max(totalCost, inputs.monthsSpent * 8000);
  }

  // Multiplier für IP/Know-How
  const ipMultiplier = 1.3;
  const value = Math.round(totalCost * ipMultiplier);

  return {
    method: 'cost_to_duplicate',
    value,
    confidence: 55,
    inputs: { totalCost, ipMultiplier },
    breakdown: {
      baseCost: totalCost,
      ipPremium: totalCost * (ipMultiplier - 1),
      total: value,
    },
    notes: [
      `Entwicklungskosten: €${(totalCost / 1000).toFixed(0)}k`,
      `IP/Know-How Aufschlag: +30%`,
      'Mindestbewertung - echte Kosten oft höher',
    ],
  };
}

/**
 * Gewichteten Durchschnitt berechnen
 */
function calculateWeightedAverage(
  results: ValuationMethodResult[]
): { low: number; mid: number; high: number } {
  const weights: Record<string, number> = {
    berkus: 0.3,
    scorecard: 0.4,
    vc_method: 0.5,
    comparables: 0.5,
    dcf: 0.4,
    cost_to_duplicate: 0.2,
  };

  let totalWeight = 0;
  let sumMid = 0;

  for (const r of results) {
    const w = weights[r.method] || 0.3;
    totalWeight += w;
    sumMid += r.value * w;
  }

  const mid = Math.round(sumMid / totalWeight);

  return {
    low: Math.round(mid * 0.7),
    mid,
    high: Math.round(mid * 1.4),
  };
}

/**
 * Verbesserungsvorschläge generieren
 */
function generateImprovements(
  inputs: ValuationInput,
  valuation: { low: number; mid: number; high: number }
): string[] {
  const improvements: string[] = [];

  if (!inputs.monthlyRevenue || inputs.monthlyRevenue === 0) {
    improvements.push(
      'Erste zahlende Kunden würden die Bewertung deutlich erhöhen (+30-50%)'
    );
  }

  if (!inputs.growthRate || inputs.growthRate < 20) {
    improvements.push('Höheres Wachstum (>20% MoM) steigert Revenue-Multiples');
  }

  if (!inputs.teamStrength || inputs.teamStrength < 1.2) {
    improvements.push('Erfahrenes Team mit Track Record erhöht Vertrauen');
  }

  if (!inputs.partnershipsScore || inputs.partnershipsScore < 3) {
    improvements.push('Strategische Partnerschaften signalisieren Marktvalidierung');
  }

  if (!inputs.customers || inputs.customers < 10) {
    improvements.push('Dokumentierte Kundenbasis stärkt die Verhandlungsposition');
  }

  improvements.push('Dokumentierte Traction (User-Wachstum, Engagement) stärkt die Position');

  return improvements.slice(0, 5); // Max 5 Vorschläge
}

// ==================== MAIN SERVICE ====================

/**
 * Hauptfunktion: Berechnet vollständige Bewertung
 */
export function calculateValuation(inputs: ValuationInput): ValuationServiceResult {
  const results: ValuationMethodResult[] = [];
  const methodsUsed: string[] = [];

  // 1. Berkus für Pre-Revenue
  if (!inputs.monthlyRevenue || inputs.monthlyRevenue === 0) {
    const berkusResult = calculateBerkus(inputs);
    results.push(berkusResult);
    methodsUsed.push('berkus');
  }

  // 2. Scorecard immer anwendbar
  const scorecardResult = calculateScorecard(inputs);
  results.push(scorecardResult);
  methodsUsed.push('scorecard');

  // 3. VC Method wenn Exit-Erwartung vorhanden
  const vcResult = calculateVCMethod(inputs);
  if (vcResult) {
    results.push(vcResult);
    methodsUsed.push('vc_method');
  }

  // 4. Revenue Multiple wenn Umsatz vorhanden
  const revenueResult = calculateRevenueMultiple(inputs);
  if (revenueResult) {
    results.push(revenueResult);
    methodsUsed.push('comparables');
  }

  // 5. Cost to Duplicate wenn Daten vorhanden
  const costResult = calculateCostToDuplicate(inputs);
  if (costResult) {
    results.push(costResult);
    methodsUsed.push('cost_to_duplicate');
  }

  // Gewichteter Durchschnitt
  const finalValuation = calculateWeightedAverage(results);

  // Confidence berechnen mit WizardData-Format
  const wizardData: WizardData = {
    tier: 'detailed',
    projectBasics: {
      stage: inputs.stage,
      monthlyRevenue: inputs.monthlyRevenue,
      userCount: inputs.customers,
      revenueGrowthRate: inputs.growthRate,
    },
    personalSituation: {
      teamSize: inputs.teamSize === 1 ? 'solo' : inputs.teamSize && inputs.teamSize <= 3 ? 'cofounders' : 'small_team',
      hasRelevantExperience: (inputs.teamStrength || 1) > 1,
    },
    goals: {},
    marketAnalysis: {
      knownCompetitors: [],
      competitorStrength: inputs.competitionScore ? inputs.competitionScore * 2 : 3,
    },
    detailedInput: {},
    completedSteps: [],
  };

  const confidence = calculateConfidence(wizardData, results);
  const improvements = generateImprovements(inputs, finalValuation);

  return {
    methods: results,
    finalValuation,
    confidence,
    improvements,
    methodsUsed,
  };
}

/**
 * Formatiert Euro-Beträge
 */
export function formatEuro(value: number): string {
  if (value >= 1000000) {
    return `€${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `€${(value / 1000).toFixed(0)}k`;
  }
  return `€${value.toFixed(0)}`;
}

/**
 * Gibt passende Methoden für eine Stage zurück
 */
export function getApplicableMethods(stage: ProjectStage): typeof VALUATION_METHODS[keyof typeof VALUATION_METHODS][] {
  return Object.values(VALUATION_METHODS).filter((m) =>
    m.applicableStages.includes(stage)
  );
}

export default {
  calculateValuation,
  formatEuro,
  getApplicableMethods,
  VALUATION_METHODS,
  INDUSTRY_MULTIPLES,
};
