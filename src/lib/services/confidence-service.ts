/**
 * LaunchOS Confidence Scoring Service
 * Berechnet und erklärt Konfidenz-Scores für Bewertungen
 */

import type {
  ConfidenceFactors,
  ConfidenceResult,
  WizardData,
  ValuationMethodResult,
  DataSharingTier,
} from '@/types';

// ==================== CONSTANTS ====================

/**
 * Gewichtung der Faktoren für den Gesamtscore
 */
const FACTOR_WEIGHTS = {
  dataCompleteness: 0.25,
  dataQuality: 0.25,
  methodApplicability: 0.25,
  marketData: 0.25,
};

/**
 * Tier-basierte Baseline-Konfidenz
 */
const TIER_BASELINE: Record<DataSharingTier, number> = {
  minimal: 20,
  basic: 40,
  detailed: 60,
  full: 80,
};

/**
 * Konfidenz-Level Labels
 */
export const CONFIDENCE_LEVELS = {
  low: { min: 0, max: 40, label: 'Niedrig', color: '#ef4444' },
  medium: { min: 40, max: 70, label: 'Mittel', color: '#f59e0b' },
  high: { min: 70, max: 100, label: 'Hoch', color: '#10b981' },
};

// ==================== HELPERS ====================

/**
 * Berechnet Daten-Vollständigkeit basierend auf WizardData
 */
function calculateDataCompleteness(data: WizardData): number {
  const sections = [
    data.projectBasics,
    data.personalSituation,
    data.goals,
    data.marketAnalysis,
    data.detailedInput,
  ];

  let filledFields = 0;
  let totalFields = 0;

  for (const section of sections) {
    if (!section) continue;
    for (const [_key, value] of Object.entries(section)) {
      totalFields++;
      if (value !== null && value !== undefined && value !== '') {
        filledFields++;
      }
    }
  }

  if (totalFields === 0) return 0;
  return Math.round((filledFields / totalFields) * 25);
}

/**
 * Berechnet Daten-Qualität basierend auf Verifikation
 */
function calculateDataQuality(data: WizardData): number {
  let score = 5; // Basis

  // Umsatzdaten erhöhen Qualität
  if (data.projectBasics?.monthlyRevenue && data.projectBasics.monthlyRevenue > 0) {
    score += 5;
  }

  // Nutzerdaten erhöhen Qualität
  if (data.projectBasics?.userCount && data.projectBasics.userCount > 0) {
    score += 5;
  }

  // Team-Erfahrung
  if (data.personalSituation?.hasRelevantExperience) {
    score += 3;
  }

  // Wettbewerbsanalyse
  if (
    data.marketAnalysis?.knownCompetitors &&
    data.marketAnalysis.knownCompetitors.length > 0
  ) {
    score += 4;
  }

  // Marktdaten
  if (data.marketAnalysis?.estimatedTAM) {
    score += 3;
  }

  return Math.min(25, score);
}

/**
 * Berechnet Methoden-Anwendbarkeit
 */
function calculateMethodApplicability(
  data: WizardData,
  methodsUsed: ValuationMethodResult[]
): number {
  if (methodsUsed.length === 0) return 5;

  const stage = data.projectBasics?.stage || 'idea';
  let score = 10;

  // Mehr Methoden = höhere Konfidenz
  score += Math.min(10, methodsUsed.length * 2);

  // Stage-basierte Anpassung
  if (stage === 'idea') {
    // Bei Ideen sind Berkus/Scorecard am besten
    const idealMethods = ['berkus', 'scorecard'];
    const hasIdealMethod = methodsUsed.some((m) => idealMethods.includes(m.method));
    if (hasIdealMethod) score += 5;
  } else if (stage === 'live' || stage === 'scaling') {
    // Bei Umsatz sind DCF/Comparables besser
    const idealMethods = ['dcf', 'comparables', 'vc_method'];
    const hasIdealMethod = methodsUsed.some((m) => idealMethods.includes(m.method));
    if (hasIdealMethod) score += 5;
  }

  return Math.min(25, score);
}

/**
 * Berechnet Marktdaten-Verfügbarkeit
 */
function calculateMarketDataScore(data: WizardData): number {
  let score = 5;

  // TAM/SAM/SOM
  if (data.marketAnalysis?.estimatedTAM) score += 5;
  if (data.marketAnalysis?.estimatedSAM) score += 3;
  if (data.marketAnalysis?.estimatedSOM) score += 2;

  // Wettbewerber
  const competitors = data.marketAnalysis?.knownCompetitors || [];
  score += Math.min(5, competitors.length);

  // Markt-Timing
  if (data.marketAnalysis?.marketTiming) score += 3;

  // Markt-Typ
  if (data.marketAnalysis?.marketType) score += 2;

  return Math.min(25, score);
}

/**
 * Generiert Erklärungen für die Faktoren
 */
function generateExplanations(
  factors: ConfidenceFactors,
  data: WizardData
): string[] {
  const explanations: string[] = [];

  // Daten-Vollständigkeit
  if (factors.dataCompleteness < 15) {
    explanations.push(
      'Die Datenlage ist noch dünn. Fülle mehr Felder aus, um die Konfidenz zu erhöhen.'
    );
  } else if (factors.dataCompleteness >= 20) {
    explanations.push('Gute Datenbasis vorhanden.');
  }

  // Daten-Qualität
  if (factors.dataQuality < 10) {
    explanations.push(
      'Quantitative Daten (Umsatz, Nutzer) würden die Bewertung verbessern.'
    );
  }

  // Umsatz-spezifisch
  if (!data.projectBasics?.monthlyRevenue || data.projectBasics.monthlyRevenue === 0) {
    explanations.push(
      'Ohne Umsatzdaten basiert die Bewertung auf qualitativen Faktoren.'
    );
  } else {
    explanations.push(
      `Umsatzdaten (€${data.projectBasics.monthlyRevenue.toLocaleString('de-DE')}/Monat) fließen in die Bewertung ein.`
    );
  }

  // Marktdaten
  if (factors.marketData < 10) {
    explanations.push(
      'Marktdaten (TAM/SAM/SOM) würden die Genauigkeit erhöhen.'
    );
  }

  // Team
  if (data.personalSituation?.hasRelevantExperience) {
    explanations.push('Relevante Team-Erfahrung positiv berücksichtigt.');
  }

  return explanations;
}

// ==================== MAIN SERVICE ====================

/**
 * Berechnet den Konfidenz-Score für eine Bewertung
 */
export function calculateConfidence(
  data: WizardData,
  methodResults: ValuationMethodResult[] = []
): ConfidenceResult {
  const factors: ConfidenceFactors = {
    dataCompleteness: calculateDataCompleteness(data),
    dataQuality: calculateDataQuality(data),
    methodApplicability: calculateMethodApplicability(data, methodResults),
    marketData: calculateMarketDataScore(data),
  };

  // Gewichteter Gesamtscore
  const score = Math.round(
    factors.dataCompleteness * FACTOR_WEIGHTS.dataCompleteness * 4 +
      factors.dataQuality * FACTOR_WEIGHTS.dataQuality * 4 +
      factors.methodApplicability * FACTOR_WEIGHTS.methodApplicability * 4 +
      factors.marketData * FACTOR_WEIGHTS.marketData * 4
  );

  const explanations = generateExplanations(factors, data);

  return {
    score: Math.min(100, Math.max(0, score)),
    factors,
    explanations,
  };
}

/**
 * Berechnet Baseline-Konfidenz basierend auf Tier
 */
export function getBaselineConfidence(tier: DataSharingTier): number {
  return TIER_BASELINE[tier] || 20;
}

/**
 * Gibt das Konfidenz-Level zurück
 */
export function getConfidenceLevel(
  score: number
): (typeof CONFIDENCE_LEVELS)[keyof typeof CONFIDENCE_LEVELS] {
  if (score < CONFIDENCE_LEVELS.low.max) {
    return CONFIDENCE_LEVELS.low;
  }
  if (score < CONFIDENCE_LEVELS.medium.max) {
    return CONFIDENCE_LEVELS.medium;
  }
  return CONFIDENCE_LEVELS.high;
}

/**
 * Generiert Verbesserungsvorschläge basierend auf Faktoren
 */
export function getImprovementSuggestions(factors: ConfidenceFactors): Array<{
  factor: keyof ConfidenceFactors;
  suggestion: string;
  potentialIncrease: number;
}> {
  const suggestions: Array<{
    factor: keyof ConfidenceFactors;
    suggestion: string;
    potentialIncrease: number;
  }> = [];

  if (factors.dataCompleteness < 20) {
    suggestions.push({
      factor: 'dataCompleteness',
      suggestion: 'Fülle alle Wizard-Felder aus',
      potentialIncrease: 20 - factors.dataCompleteness,
    });
  }

  if (factors.dataQuality < 15) {
    suggestions.push({
      factor: 'dataQuality',
      suggestion: 'Füge Umsatz- und Nutzerdaten hinzu',
      potentialIncrease: 15 - factors.dataQuality,
    });
  }

  if (factors.marketData < 15) {
    suggestions.push({
      factor: 'marketData',
      suggestion: 'Ergänze Marktgrößen (TAM/SAM/SOM) und Wettbewerber',
      potentialIncrease: 15 - factors.marketData,
    });
  }

  if (factors.methodApplicability < 20) {
    suggestions.push({
      factor: 'methodApplicability',
      suggestion: 'Führe mehrere Bewertungsmethoden durch',
      potentialIncrease: 20 - factors.methodApplicability,
    });
  }

  // Sortieren nach potentiellem Anstieg
  return suggestions.sort((a, b) => b.potentialIncrease - a.potentialIncrease);
}

/**
 * Formatiert die Konfidenz für die Anzeige
 */
export function formatConfidence(score: number): string {
  const level = getConfidenceLevel(score);
  return `${score}% (${level.label})`;
}

export default {
  calculateConfidence,
  getBaselineConfidence,
  getConfidenceLevel,
  getImprovementSuggestions,
  formatConfidence,
  CONFIDENCE_LEVELS,
};
