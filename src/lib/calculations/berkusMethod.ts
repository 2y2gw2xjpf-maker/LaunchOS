import type { BerkusFactors, ValuationMethodResult } from '@/types';

const MAX_PER_FACTOR = 500000; // €500k

export const BERKUS_FACTOR_DEFINITIONS = {
  soundIdea: {
    name: 'Grundlegende Idee',
    description: 'Ist die Grundidee solide und das Problem real?',
    questions: [
      'Lost das Produkt ein echtes Problem?',
      'Gibt es einen klaren Zielmarkt?',
      'Ist die Value Proposition verstandlich?',
    ],
    scoring: {
      0: 'Keine klare Idee oder kein echtes Problem',
      25: 'Idee vorhanden, Problem unklar',
      50: 'Solide Idee, Problem validierungsbedurftig',
      75: 'Gute Idee, Problem durch Research bestatigt',
      100: 'Exzellente Idee, Problem eindeutig validiert',
    },
  },
  prototype: {
    name: 'Prototyp / MVP',
    description: 'Reduziert das Technologie-Risiko',
    questions: [
      'Gibt es einen funktionierenden Prototyp?',
      'Wurde die Kernfunktionalitat demonstriert?',
      'Ist die Technologie machbar?',
    ],
    scoring: {
      0: 'Nur Konzept, kein Prototyp',
      25: 'Mockups oder Wireframes',
      50: 'Funktionaler Prototyp mit Einschrankungen',
      75: 'MVP mit Kernfunktionen live',
      100: 'Vollstandiges Produkt, produktionsreif',
    },
  },
  qualityTeam: {
    name: 'Management-Team',
    description: 'Reduziert das Ausfuhrungs-Risiko',
    questions: [
      'Hat das Team relevante Erfahrung?',
      'Sind die Skills komplementar?',
      'Gibt es eine Track-Record von Erfolgen?',
    ],
    scoring: {
      0: 'Kein Team, keine relevante Erfahrung',
      25: 'Solo-Grunder mit etwas Erfahrung',
      50: 'Kleines Team, gemischte Erfahrung',
      75: 'Starkes Team mit Domain-Expertise',
      100: 'Erfahrenes Team mit Erfolgs-Track-Record',
    },
  },
  strategicRelations: {
    name: 'Strategische Beziehungen',
    description: 'Reduziert das Markt-Risiko',
    questions: [
      'Gibt es Partnerschaften oder Advisors?',
      'Bestehen Beziehungen zu potenziellen Kunden?',
      'Gibt es Zugang zu wichtigen Netzwerken?',
    ],
    scoring: {
      0: 'Keine relevanten Beziehungen',
      25: 'Erste Kontakte aufgebaut',
      50: 'LOIs oder informelle Partnerschaften',
      75: 'Feste Partnerschaften oder erste Kunden',
      100: 'Strategische Partner und validierte Channels',
    },
  },
  productRollout: {
    name: 'Produkt-Rollout',
    description: 'Reduziert das Produktions-Risiko',
    questions: [
      'Ist das Produkt bereits am Markt?',
      'Gibt es zahlende Kunden?',
      'Ist der Go-to-Market-Plan klar?',
    ],
    scoring: {
      0: 'Noch keine Marktaktivitat',
      25: 'Beta-Nutzer vorhanden',
      50: 'Erste zahlende Kunden',
      75: 'Wachsender Kundenstamm',
      100: 'Etabliertes Produkt mit wiederkehrenden Kunden',
    },
  },
};

export function calculateBerkus(factors: BerkusFactors): ValuationMethodResult {
  const breakdown: Record<string, number> = {};
  let total = 0;

  const factorKeys: (keyof BerkusFactors)[] = [
    'soundIdea',
    'prototype',
    'qualityTeam',
    'strategicRelations',
    'productRollout',
  ];

  for (const key of factorKeys) {
    const score = factors[key];
    const value = (score / 100) * MAX_PER_FACTOR;
    breakdown[key] = value;
    total += value;
  }

  // Confidence based on score distribution
  const scores = factorKeys.map((k) => factors[k]);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const scoreVariance =
    scores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / scores.length;
  const confidence = Math.min(90, Math.max(40, 70 - scoreVariance / 100));

  const notes: string[] = [];

  if (factors.soundIdea < 50) {
    notes.push('Die Idee sollte weiter validiert werden');
  }
  if (factors.qualityTeam < 50 && factors.prototype > 75) {
    notes.push('Starkes Produkt, aber Team-Starke erhohen wurde Bewertung verbessern');
  }
  if (factors.productRollout === 0) {
    notes.push('Ohne Marktprasenz ist dies eine rein potenzialbasierte Bewertung');
  }
  if (total > 1500000) {
    notes.push('Bewertung im oberen Bereich fur Pre-Revenue - gute Ausgangsposition');
  }

  return {
    method: 'berkus',
    value: total,
    confidence: Math.round(confidence),
    inputs: factors as unknown as Record<string, unknown>,
    breakdown,
    notes,
  };
}

export function getBerkusFactorInfo(factor: keyof BerkusFactors) {
  return BERKUS_FACTOR_DEFINITIONS[factor];
}

export function suggestBerkusImprovements(factors: BerkusFactors): string[] {
  const suggestions: string[] = [];

  const sortedFactors = Object.entries(factors).sort(([, a], [, b]) => a - b);

  for (const [factor, score] of sortedFactors.slice(0, 2)) {
    if (score < 75) {
      const definition =
        BERKUS_FACTOR_DEFINITIONS[factor as keyof BerkusFactors];
      const potentialIncrease = ((75 - score) / 100) * MAX_PER_FACTOR;
      suggestions.push(
        `${definition.name} verbessern konnte +€${potentialIncrease.toLocaleString('de-DE')} bringen`
      );
    }
  }

  return suggestions;
}
