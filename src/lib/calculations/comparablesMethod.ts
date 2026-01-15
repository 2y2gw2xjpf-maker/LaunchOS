import type {
  ComparablesInput,
  ComparableCompany,
  ValuationMethodResult,
} from '@/types';

export const SAMPLE_COMPARABLES: ComparableCompany[] = [
  {
    name: 'SaaS Startup A',
    valuation: 5000000,
    metric: 100000,
    metricType: 'arr',
    fundingStage: 'seed',
    region: 'DACH',
    date: '2024-01',
  },
  {
    name: 'SaaS Startup B',
    valuation: 3000000,
    metric: 50000,
    metricType: 'arr',
    fundingStage: 'pre-seed',
    region: 'DACH',
    date: '2024-03',
  },
  {
    name: 'Marketplace C',
    valuation: 8000000,
    metric: 500000,
    metricType: 'gmv',
    fundingStage: 'seed',
    region: 'EU',
    date: '2024-02',
  },
];

export function calculateComparables(
  input: ComparablesInput,
  yourMetric: number
): ValuationMethodResult {
  const { comparableCompanies, selectedMetric, adjustmentFactor } = input;

  if (comparableCompanies.length === 0) {
    return {
      method: 'comparables',
      value: 0,
      confidence: 0,
      inputs: input as unknown as Record<string, unknown>,
      notes: ['Keine Vergleichsunternehmen ausgewahlt'],
    };
  }

  // Calculate multiples for each comparable
  const multiples = comparableCompanies
    .filter((c) => c.metricType === selectedMetric && c.metric > 0)
    .map((c) => ({
      company: c.name,
      multiple: c.valuation / c.metric,
    }));

  if (multiples.length === 0) {
    return {
      method: 'comparables',
      value: 0,
      confidence: 0,
      inputs: input as unknown as Record<string, unknown>,
      notes: ['Keine Vergleichsunternehmen mit passender Metrik gefunden'],
    };
  }

  // Calculate median and mean multiples
  const sortedMultiples = multiples.map((m) => m.multiple).sort((a, b) => a - b);
  const medianMultiple =
    sortedMultiples.length % 2 === 0
      ? (sortedMultiples[sortedMultiples.length / 2 - 1] +
          sortedMultiples[sortedMultiples.length / 2]) /
        2
      : sortedMultiples[Math.floor(sortedMultiples.length / 2)];

  const meanMultiple =
    sortedMultiples.reduce((a, b) => a + b, 0) / sortedMultiples.length;

  // Use median as more robust measure, adjusted
  const adjustedMultiple = medianMultiple * adjustmentFactor;
  const valuation = Math.round(yourMetric * adjustedMultiple);

  // Calculate range
  const lowMultiple = sortedMultiples[0] * adjustmentFactor;
  const highMultiple = sortedMultiples[sortedMultiples.length - 1] * adjustmentFactor;

  const breakdown = {
    medianMultiple,
    meanMultiple,
    adjustedMultiple,
    lowValuation: Math.round(yourMetric * lowMultiple),
    highValuation: Math.round(yourMetric * highMultiple),
    comparablesUsed: multiples.length,
  };

  // Confidence based on number and consistency of comparables
  let confidence = 50;
  confidence += Math.min(20, multiples.length * 5); // More comparables = higher confidence

  const multipleRange = (highMultiple - lowMultiple) / medianMultiple;
  if (multipleRange < 0.5) confidence += 15;
  else if (multipleRange > 2) confidence -= 15;

  const notes: string[] = [];

  notes.push(`Basierend auf ${multiples.length} Vergleichsunternehmen`);
  notes.push(`Median Multiple: ${medianMultiple.toFixed(1)}x ${selectedMetric.toUpperCase()}`);

  if (adjustmentFactor !== 1) {
    notes.push(
      `Anpassungsfaktor ${adjustmentFactor}x angewendet (${
        adjustmentFactor > 1 ? 'Premium' : 'Discount'
      })`
    );
  }

  if (multipleRange > 1.5) {
    notes.push('Hohe Streuung bei Vergleichsunternehmen - Bewertungsrange beachten');
  }

  return {
    method: 'comparables',
    value: valuation,
    confidence: Math.min(80, Math.max(30, confidence)),
    inputs: { ...input, yourMetric } as unknown as Record<string, unknown>,
    breakdown,
    notes,
  };
}

export function getMetricLabel(metric: string): string {
  const labels: Record<string, string> = {
    revenue: 'Umsatz (MRR)',
    arr: 'ARR',
    users: 'Nutzer',
    gmv: 'GMV',
  };
  return labels[metric] || metric;
}
