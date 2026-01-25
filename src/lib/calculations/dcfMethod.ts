import type { DCFInput, ValuationMethodResult } from '@/types';

export function calculateDCF(input: DCFInput): ValuationMethodResult {
  const {
    projectedCashFlows,
    discountRate,
    terminalGrowthRate,
    years: _years,
  } = input;

  // Discount each cash flow to present value
  const discountFactor = 1 + discountRate / 100;
  let pvCashFlows = 0;
  const yearlyPVs: number[] = [];

  for (let i = 0; i < projectedCashFlows.length; i++) {
    const pv = projectedCashFlows[i] / Math.pow(discountFactor, i + 1);
    pvCashFlows += pv;
    yearlyPVs.push(pv);
  }

  // Terminal value (Gordon Growth Model)
  const lastCashFlow = projectedCashFlows[projectedCashFlows.length - 1];
  const terminalCashFlow = lastCashFlow * (1 + terminalGrowthRate / 100);
  const terminalValue =
    terminalCashFlow / (discountRate / 100 - terminalGrowthRate / 100);
  const pvTerminalValue =
    terminalValue / Math.pow(discountFactor, projectedCashFlows.length);

  const enterpriseValue = pvCashFlows + pvTerminalValue;

  const breakdown = {
    pvOperatingCashFlows: pvCashFlows,
    terminalValue,
    pvTerminalValue,
    enterpriseValue,
  };

  // Confidence is lower for startups using DCF
  let confidence = 45; // DCF is less reliable for early-stage

  if (projectedCashFlows.some((cf) => cf < 0)) {
    confidence -= 10;
  }

  if (discountRate < 20) {
    confidence -= 5; // Low discount rate for startup is suspicious
  }

  if (terminalGrowthRate > 5) {
    confidence -= 10; // Unrealistically high terminal growth
  }

  const notes: string[] = [];

  notes.push('DCF ist für Startups weniger zuverlässig als andere Methoden');

  if (pvTerminalValue / enterpriseValue > 0.7) {
    notes.push(
      'Warnung: Großteil des Werts stammt aus Terminal Value - hohe Unsicherheit'
    );
  }

  if (discountRate < 25) {
    notes.push(
      'Niedriger Discount Rate für Startup - typisch sind 25-40% für Early Stage'
    );
  }

  if (projectedCashFlows[0] < 0) {
    notes.push('Negative Cash Flows in frühen Jahren sind für Startups normal');
  }

  return {
    method: 'dcf',
    value: Math.round(Math.max(0, enterpriseValue)),
    confidence: Math.max(25, Math.min(60, confidence)),
    inputs: input as unknown as Record<string, unknown>,
    breakdown,
    notes,
  };
}

export function getDefaultDCFInput(): DCFInput {
  return {
    projectedCashFlows: [-50000, 0, 100000, 200000, 350000],
    discountRate: 30,
    terminalGrowthRate: 3,
    years: 5,
  };
}

export function validateDCFInput(input: DCFInput): string[] {
  const errors: string[] = [];

  if (input.projectedCashFlows.length < 3) {
    errors.push('Mindestens 3 Jahre Cash Flow Projektion benötigt');
  }

  if (input.discountRate < 10 || input.discountRate > 60) {
    errors.push('Discount Rate sollte zwischen 10% und 60% liegen');
  }

  if (input.terminalGrowthRate >= input.discountRate) {
    errors.push('Terminal Growth Rate muss kleiner als Discount Rate sein');
  }

  if (input.terminalGrowthRate > 10) {
    errors.push('Terminal Growth Rate über 10% ist unrealistisch');
  }

  return errors;
}
