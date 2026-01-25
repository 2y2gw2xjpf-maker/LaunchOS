import type { VCMethodInput, ValuationMethodResult } from '@/types';

export function calculateVCMethod(input: VCMethodInput): ValuationMethodResult {
  const {
    expectedExitValue,
    yearsToExit,
    expectedReturn,
    investmentAmount,
    dilutionAssumption = 20,
  } = input;

  // Standard VC Method formula:
  // Post-Money (today) = Exit Value / Expected Return Multiple
  // Pre-Money = Post-Money - Investment
  //
  // For multi-year horizon, we use compound return:
  // Required Exit Ownership = 1 / (1 - dilution%)
  // Post-Money = Exit Value / (Return Multiple * Required Exit Ownership)

  // Calculate the required return multiplier accounting for dilution
  // If 20% dilution expected, investor needs to own more at start to achieve target return
  const dilutionFactor = 1 - dilutionAssumption / 100;
  const requiredOwnershipMultiplier = 1 / dilutionFactor;

  // Effective return multiple considering dilution
  const effectiveReturn = expectedReturn * requiredOwnershipMultiplier;

  // Post-money valuation today
  // This is what the investor is willing to pay post-investment
  const postMoneyToday = expectedExitValue / effectiveReturn;

  // Pre-money = Post-money - Investment
  const preMoney = Math.max(0, postMoneyToday - investmentAmount);

  // Implied ownership at current round
  const impliedOwnership = postMoneyToday > 0 ? (investmentAmount / postMoneyToday) * 100 : 0;

  // Calculate dilution adjustment for display
  const postMoneyWithoutDilution = expectedExitValue / expectedReturn;
  const dilutionAdjustment = postMoneyWithoutDilution - postMoneyToday;

  const breakdown = {
    expectedExitValue,
    postMoneyValuation: postMoneyToday,
    preMoneyValuation: preMoney,
    impliedOwnership,
    dilutionAdjustment: Math.max(0, dilutionAdjustment),
  };

  // Confidence depends on exit value realism and time horizon
  let confidence = 60;
  if (yearsToExit > 7) confidence -= 10;
  if (yearsToExit < 3) confidence -= 5;
  if (expectedReturn > 20) confidence -= 15;
  if (expectedExitValue > 100000000) confidence -= 10;

  const notes: string[] = [];

  if (expectedReturn > 15) {
    notes.push('Erwartete Rendite ist hoch - typisch für Seed/Pre-Seed');
  }

  if (yearsToExit > 7) {
    notes.push('Langer Zeithorizont erhöht Unsicherheit der Projektion');
  }

  if (impliedOwnership > 30) {
    notes.push('Hoher Eigentumsanteil für Investor - Verhandlungsspielraum prüfen');
  }

  if (dilutionAssumption > 40) {
    notes.push('Starke Verdünnung angenommen - plane mehr Fundraising-Runden ein');
  }

  return {
    method: 'vc_method',
    value: Math.round(preMoney),
    confidence: Math.max(35, Math.min(80, confidence)),
    inputs: input as unknown as Record<string, unknown>,
    breakdown,
    notes,
  };
}

export function suggestVCMethodImprovements(
  currentValue: number,
  targetValue: number
): string[] {
  const suggestions: string[] = [];
  const increaseNeeded = ((targetValue - currentValue) / currentValue) * 100;

  if (increaseNeeded > 0) {
    suggestions.push(
      `Um ${increaseNeeded.toFixed(0)}% höhere Bewertung zu erreichen:`
    );
    suggestions.push('- Exit-Wert durch Marktexpansion erhöhen');
    suggestions.push('- Kürzeren Zeithorizont durch schnelleres Wachstum');
    suggestions.push('- Niedrigere Rendite-Erwartung durch bessere Traktion');
  }

  return suggestions;
}
