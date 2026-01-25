import type {
  DataSharingTier,
  WizardData,
  ValuationMethodResult,
} from '@/types';

interface ConfidenceFactors {
  tierFactor: number;
  dataCompleteness: number;
  methodAgreement: number;
  marketDataQuality: number;
}

const TIER_BASE_CONFIDENCE: Record<DataSharingTier, [number, number]> = {
  minimal: [30, 50],
  basic: [50, 70],
  detailed: [70, 85],
  full: [85, 95],
};

export function calculateOverallConfidence(
  tier: DataSharingTier,
  data: WizardData,
  valuationResults?: ValuationMethodResult[]
): { confidence: number; factors: ConfidenceFactors; explanation: string[] } {
  // 1. Tier-based baseline
  const [minConf, maxConf] = TIER_BASE_CONFIDENCE[tier];
  const tierFactor = (minConf + maxConf) / 2 / 100;

  // 2. Data completeness
  const dataCompleteness = calculateDataCompleteness(data);

  // 3. Method agreement (if valuation results provided)
  const methodAgreement = valuationResults
    ? calculateMethodAgreement(valuationResults)
    : 0.5;

  // 4. Market data quality
  const marketDataQuality = assessMarketDataQuality(data);

  // Weighted combination
  const weights = {
    tier: 0.35,
    completeness: 0.25,
    agreement: 0.25,
    market: 0.15,
  };

  const rawConfidence =
    tierFactor * weights.tier +
    dataCompleteness * weights.completeness +
    methodAgreement * weights.agreement +
    marketDataQuality * weights.market;

  const confidence = Math.round(Math.min(95, Math.max(20, rawConfidence * 100)));

  // Generate explanations
  const explanation = generateConfidenceExplanation(
    { tierFactor, dataCompleteness, methodAgreement, marketDataQuality },
    tier
  );

  return {
    confidence,
    factors: { tierFactor, dataCompleteness, methodAgreement, marketDataQuality },
    explanation,
  };
}

function calculateDataCompleteness(data: WizardData): number {
  let filledFields = 0;
  let totalFields = 0;

  // Project basics
  const projectFields = ['category', 'stage', 'targetCustomer', 'hasRevenue', 'hasUsers'];
  for (const field of projectFields) {
    totalFields++;
    if (data.projectBasics[field as keyof typeof data.projectBasics] !== undefined) {
      filledFields++;
    }
  }

  // Personal situation
  const personalFields = [
    'teamSize',
    'hasRelevantExperience',
    'commitment',
    'runwayMonths',
    'financialSituation',
    'riskTolerance',
  ];
  for (const field of personalFields) {
    totalFields++;
    if (data.personalSituation[field as keyof typeof data.personalSituation] !== undefined) {
      filledFields++;
    }
  }

  // Goals
  const goalsFields = ['exitGoal', 'growthSpeed', 'controlImportance', 'timeHorizon'];
  for (const field of goalsFields) {
    totalFields++;
    if (data.goals[field as keyof typeof data.goals] !== undefined) {
      filledFields++;
    }
  }

  return totalFields > 0 ? filledFields / totalFields : 0;
}

function calculateMethodAgreement(results: ValuationMethodResult[]): number {
  if (results.length < 2) return 0.5;

  const values = results.map((r) => r.value).filter((v) => v > 0);
  if (values.length < 2) return 0.5;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = stdDev / mean;

  // Lower CV = higher agreement
  // CV < 0.2 = very good agreement (0.9)
  // CV > 1.0 = poor agreement (0.3)
  return Math.max(0.3, Math.min(0.9, 1 - coefficientOfVariation));
}

function assessMarketDataQuality(data: WizardData): number {
  let score = 0.5; // Base score

  // Has competitors analyzed
  if (data.marketAnalysis.knownCompetitors && data.marketAnalysis.knownCompetitors.length > 0) {
    score += 0.1;
    if (data.marketAnalysis.knownCompetitors.length >= 3) {
      score += 0.1;
    }
  }

  // Has TAM/SAM/SOM
  if (data.marketAnalysis.estimatedTAM) score += 0.1;
  if (data.marketAnalysis.estimatedSAM) score += 0.05;
  if (data.marketAnalysis.estimatedSOM) score += 0.05;

  // Has market timing assessment
  if (data.marketAnalysis.marketTiming) score += 0.05;
  if (data.marketAnalysis.marketType) score += 0.05;

  return Math.min(1, score);
}

function generateConfidenceExplanation(
  factors: ConfidenceFactors,
  tier: DataSharingTier
): string[] {
  const explanations: string[] = [];

  // Tier explanation
  const tierExplanation: Record<DataSharingTier, string> = {
    minimal:
      'Mit minimalen Daten können wir nur grobe Schätzungen liefern',
    basic: 'Grundlegende Infos ermöglichen fundierte Empfehlungen',
    detailed:
      'Detaillierte Daten erlauben präzisere Analysen',
    full: 'Vollständige Daten ermöglichen maximale Analysetiefe',
  };
  explanations.push(tierExplanation[tier]);

  if (factors.dataCompleteness < 0.5) {
    explanations.push('Einige wichtige Felder sind noch nicht ausgefüllt');
  } else if (factors.dataCompleteness > 0.8) {
    explanations.push('Daten sind sehr vollständig - gute Analysebasis');
  }

  if (factors.methodAgreement < 0.5) {
    explanations.push('Bewertungsmethoden zeigen unterschiedliche Ergebnisse');
  } else if (factors.methodAgreement > 0.7) {
    explanations.push('Bewertungsmethoden stimmen gut überein');
  }

  if (factors.marketDataQuality < 0.4) {
    explanations.push('Mehr Marktdaten würden die Analyse verbessern');
  }

  return explanations;
}

export function getConfidenceLevel(confidence: number): 'low' | 'medium' | 'high' {
  if (confidence >= 70) return 'high';
  if (confidence >= 50) return 'medium';
  return 'low';
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 70) return '#4A7C59'; // sage
  if (confidence >= 50) return '#F5A623'; // gold
  return '#EF4444'; // red
}
