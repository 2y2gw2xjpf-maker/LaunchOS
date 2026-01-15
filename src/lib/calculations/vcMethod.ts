import type { VCMethodInput, ValuationMethodResult } from '@/types';

export function calculateVCMethod(input: VCMethodInput): ValuationMethodResult {
  const {
    expectedExitValue,
    yearsToExit,
    expectedReturn,
    investmentAmount,
    dilutionAssumption = 20,
  } = input;

  // VC Method formula:
  // Post-money valuation = Exit Value / (Expected Return ^ Years)
  // Pre-money valuation = Post-money - Investment

  const returnMultiple = Math.pow(expectedReturn, 1); // Already a multiple
  const postMoneyToday = expectedExitValue / Math.pow(returnMultiple, yearsToExit / 5); // Normalize to 5-year horizon

  // Account for dilution in future rounds
  const dilutionFactor = 1 - dilutionAssumption / 100;
  const adjustedPostMoney = postMoneyToday * dilutionFactor;

  // Pre-money = Post-money - Investment
  const preMoney = Math.max(0, adjustedPostMoney - investmentAmount);

  // Implied ownership
  const impliedOwnership = (investmentAmount / adjustedPostMoney) * 100;

  const breakdown = {
    expectedExitValue,
    postMoneyValuation: adjustedPostMoney,
    preMoneyValuation: preMoney,
    impliedOwnership,
    dilutionAdjustment: postMoneyToday - adjustedPostMoney,
  };

  // Confidence depends on exit value realism and time horizon
  let confidence = 60;
  if (yearsToExit > 7) confidence -= 10;
  if (yearsToExit < 3) confidence -= 5;
  if (expectedReturn > 20) confidence -= 15;
  if (expectedExitValue > 100000000) confidence -= 10;

  const notes: string[] = [];

  if (expectedReturn > 15) {
    notes.push('Erwartete Rendite ist hoch - typisch fur Seed/Pre-Seed');
  }

  if (yearsToExit > 7) {
    notes.push('Langer Zeithorizont erhoht Unsicherheit der Projektion');
  }

  if (impliedOwnership > 30) {
    notes.push('Hoher Eigentumsanteil fur Investor - Verhandlungsspielraum prufen');
  }

  if (dilutionAssumption > 40) {
    notes.push('Starke Verdunnung angenommen - plane mehr Fundraising-Runden ein');
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
      `Um ${increaseNeeded.toFixed(0)}% hohere Bewertung zu erreichen:`
    );
    suggestions.push('- Exit-Wert durch Marktexpansion erhohen');
    suggestions.push('- Kurzeren Zeithorizont durch schnelleres Wachstum');
    suggestions.push('- Niedrigere Rendite-Erwartung durch bessere Traktion');
  }

  return suggestions;
}
