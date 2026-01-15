import type { ScorecardFactors, ValuationMethodResult } from '@/types';

const AVERAGE_PRE_SEED_VALUATION = 1500000; // €1.5M

export const SCORECARD_FACTOR_DEFINITIONS = {
  teamStrength: {
    name: 'Team-Starke',
    description: 'Qualitat und Erfahrung des Grunderteams',
    defaultWeight: 30,
  },
  marketSize: {
    name: 'Marktgrosse',
    description: 'Grosse und Attraktivitat des Zielmarkts',
    defaultWeight: 25,
  },
  productTech: {
    name: 'Produkt/Technologie',
    description: 'Starke des Produkts oder der Technologie',
    defaultWeight: 15,
  },
  competition: {
    name: 'Wettbewerbsumfeld',
    description: 'Starke und Dichte der Konkurrenz',
    defaultWeight: 10,
  },
  marketingSales: {
    name: 'Marketing/Vertrieb',
    description: 'Fahigkeit, Kunden zu gewinnen',
    defaultWeight: 10,
  },
  needForFunding: {
    name: 'Kapitalbedarf',
    description: 'Wie viel Kapital wird benotigt?',
    defaultWeight: 5,
  },
  other: {
    name: 'Sonstige Faktoren',
    description: 'Weitere relevante Faktoren',
    defaultWeight: 5,
  },
};

export function calculateScorecard(
  factors: ScorecardFactors,
  baseValuation: number = AVERAGE_PRE_SEED_VALUATION
): ValuationMethodResult {
  // Calculate weighted sum
  let weightedSum = 0;
  let totalWeight = 0;
  const breakdown: Record<string, number> = {};

  for (const [key, factor] of Object.entries(factors)) {
    const contribution = (factor.weight / 100) * (factor.score / 100);
    weightedSum += contribution;
    totalWeight += factor.weight;
    breakdown[key] = contribution * baseValuation;
  }

  // Normalize if weights don't sum to 100
  const multiplier = totalWeight === 100 ? weightedSum : weightedSum / (totalWeight / 100);

  // Final valuation: base * multiplier (where 1.0 = average)
  const valuation = Math.round(baseValuation * multiplier);

  // Calculate confidence
  const scores = Object.values(factors).map((f) => f.score);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const scoreVariance =
    scores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / scores.length;
  const confidence = Math.min(85, Math.max(45, 65 - scoreVariance / 50));

  const notes: string[] = [];

  // Generate notes
  const weakFactors = Object.entries(factors)
    .filter(([, f]) => f.score < 40 && f.weight >= 10)
    .map(([key]) => SCORECARD_FACTOR_DEFINITIONS[key as keyof typeof SCORECARD_FACTOR_DEFINITIONS].name);

  if (weakFactors.length > 0) {
    notes.push(`Schwache Bereiche: ${weakFactors.join(', ')}`);
  }

  if (multiplier > 1.2) {
    notes.push('Uberdurchschnittliche Bewertung im Vergleich zum Markt');
  } else if (multiplier < 0.8) {
    notes.push('Unterdurchschnittliche Bewertung - Verbesserungspotenzial vorhanden');
  }

  return {
    method: 'scorecard',
    value: valuation,
    confidence: Math.round(confidence),
    inputs: factors as unknown as Record<string, unknown>,
    breakdown,
    notes,
  };
}

export function getScorecardFactorInfo(factor: keyof ScorecardFactors) {
  return SCORECARD_FACTOR_DEFINITIONS[factor];
}

export function getDefaultScorecardFactors(): ScorecardFactors {
  return {
    teamStrength: { weight: 30, score: 50 },
    marketSize: { weight: 25, score: 50 },
    productTech: { weight: 15, score: 50 },
    competition: { weight: 10, score: 50 },
    marketingSales: { weight: 10, score: 50 },
    needForFunding: { weight: 5, score: 50 },
    other: { weight: 5, score: 50 },
  };
}
