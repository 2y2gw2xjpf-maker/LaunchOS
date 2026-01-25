import type {
  WizardData,
  RouteResult,
  RouteReason,
  RecommendedRoute,
  DataSharingTier,
} from '@/types';
import { generateActionPlan } from './actionPlanGenerator';

interface ScoreFactor {
  name: string;
  weight: number;
  calculate: (data: WizardData) => { bootstrap: number; investor: number; reason: string };
}

const SCORE_FACTORS: ScoreFactor[] = [
  {
    name: 'Markt-Typ',
    weight: 15,
    calculate: (data) => {
      const category = data.projectBasics.category;
      const marketType = data.marketAnalysis.marketType;

      if (marketType === 'winner_takes_all') {
        return { bootstrap: 20, investor: 80, reason: 'Winner-takes-all Märkte erfordern schnelles Wachstum' };
      }

      if (category === 'saas' || category === 'marketplace') {
        return { bootstrap: 50, investor: 65, reason: 'Skalierbare Modelle sind für beide Wege geeignet' };
      }

      if (category === 'service') {
        return { bootstrap: 80, investor: 30, reason: 'Service-Businesses skalieren organisch besser' };
      }

      if (category === 'hardware' || category === 'fintech' || category === 'healthtech') {
        return { bootstrap: 30, investor: 75, reason: 'Kapitalintensive Branchen profitieren von Investoren' };
      }

      return { bootstrap: 55, investor: 55, reason: 'Branche erlaubt beide Wege' };
    },
  },
  {
    name: 'Entwicklungsstand',
    weight: 12,
    calculate: (data) => {
      const stage = data.projectBasics.stage;
      const hasRevenue = data.projectBasics.hasRevenue;

      if (stage === 'idea') {
        return { bootstrap: 70, investor: 40, reason: 'Ideen-Phase: Erst validieren, dann entscheiden' };
      }

      if (stage === 'live' && hasRevenue) {
        return { bootstrap: 75, investor: 60, reason: 'Mit Revenue hast du Optionen' };
      }

      if (stage === 'scaling') {
        return { bootstrap: 40, investor: 80, reason: 'Scaling-Phase profitiert von Kapitalspritze' };
      }

      return { bootstrap: 60, investor: 55, reason: 'MVP/Beta-Phase: Guter Zeitpunkt für beide Wege' };
    },
  },
  {
    name: 'Team-Situation',
    weight: 14,
    calculate: (data) => {
      const teamSize = data.personalSituation.teamSize;
      const hasExperience = data.personalSituation.hasRelevantExperience;

      if (teamSize === 'solo' && !hasExperience) {
        return { bootstrap: 65, investor: 35, reason: 'Solo ohne Erfahrung: Investoren erwarten Team' };
      }

      if (teamSize === 'solo' && hasExperience) {
        return { bootstrap: 70, investor: 50, reason: 'Solo mit Erfahrung: Bootstrap ist machbar' };
      }

      if (teamSize === 'cofounders') {
        return { bootstrap: 55, investor: 70, reason: 'Co-Founder-Teams sind attraktiver für VCs' };
      }

      return { bootstrap: 50, investor: 65, reason: 'Team vorhanden: Beide Wege möglich' };
    },
  },
  {
    name: 'Finanzieller Runway',
    weight: 16,
    calculate: (data) => {
      const runway = data.personalSituation.runwayMonths || 12;
      const situation = data.personalSituation.financialSituation;

      if (runway < 6) {
        return { bootstrap: 30, investor: 75, reason: 'Kurzer Runway: Kapital nötig für Überleben' };
      }

      if (runway >= 18 && situation === 'comfortable') {
        return { bootstrap: 85, investor: 45, reason: 'Langer Runway ermöglicht organisches Wachstum' };
      }

      if (runway >= 12) {
        return { bootstrap: 70, investor: 55, reason: 'Ausreichend Runway für beide Wege' };
      }

      return { bootstrap: 50, investor: 65, reason: 'Moderater Runway: Planung wichtig' };
    },
  },
  {
    name: 'Exit-Ziel',
    weight: 18,
    calculate: (data) => {
      const exitGoal = data.goals.exitGoal;

      if (exitGoal === 'lifestyle') {
        return { bootstrap: 95, investor: 15, reason: 'Lifestyle-Business: Investoren erwarten Exit' };
      }

      if (exitGoal === 'ipo') {
        return { bootstrap: 15, investor: 90, reason: 'IPO-Ambitionen erfordern VC-Track' };
      }

      if (exitGoal === 'acquisition') {
        return { bootstrap: 55, investor: 70, reason: 'Acquisition: Investoren haben Netzwerk' };
      }

      return { bootstrap: 60, investor: 55, reason: 'Noch unentschieden: Beide Wege offen' };
    },
  },
  {
    name: 'Kontroll-Präferenz',
    weight: 12,
    calculate: (data) => {
      const control = data.goals.controlImportance || 5;

      if (control >= 8) {
        return { bootstrap: 90, investor: 25, reason: 'Hohe Kontroll-Präferenz spricht gegen Investoren' };
      }

      if (control <= 4) {
        return { bootstrap: 40, investor: 70, reason: 'Offen für externe Einflussnahme' };
      }

      return { bootstrap: 60, investor: 55, reason: 'Moderate Kontroll-Präferenz' };
    },
  },
  {
    name: 'Wachstums-Geschwindigkeit',
    weight: 10,
    calculate: (data) => {
      const speed = data.goals.growthSpeed;

      if (speed === 'hypergrowth') {
        return { bootstrap: 20, investor: 90, reason: 'Hypergrowth erfordert Kapital' };
      }

      if (speed === 'slow_steady') {
        return { bootstrap: 85, investor: 30, reason: 'Langsames Wachstum ist Bootstrap-ideal' };
      }

      if (speed === 'aggressive') {
        return { bootstrap: 35, investor: 75, reason: 'Aggressives Wachstum braucht Ressourcen' };
      }

      return { bootstrap: 60, investor: 55, reason: 'Moderates Wachstum erlaubt Flexibilität' };
    },
  },
  {
    name: 'Risiko-Toleranz',
    weight: 8,
    calculate: (data) => {
      const risk = data.personalSituation.riskTolerance || 5;

      if (risk >= 8) {
        return { bootstrap: 45, investor: 70, reason: 'Hohe Risiko-Toleranz: VC-Weg möglich' };
      }

      if (risk <= 3) {
        return { bootstrap: 75, investor: 40, reason: 'Niedrige Risiko-Toleranz: Bootstrap sicherer' };
      }

      return { bootstrap: 55, investor: 55, reason: 'Moderate Risiko-Bereitschaft' };
    },
  },
];

function getTierConfidenceMultiplier(tier: DataSharingTier): number {
  const multipliers: Record<DataSharingTier, number> = {
    minimal: 0.6,
    basic: 0.75,
    detailed: 0.9,
    full: 1.0,
  };
  return multipliers[tier];
}

function generateAlternatives(recommendation: RecommendedRoute): string[] {
  const alternatives: Record<RecommendedRoute, string[]> = {
    bootstrap: [
      'Du könntest später immer noch Investoren reinholen, wenn du Traktion hast',
      'Crowdfunding als Mittelweg zwischen Bootstrap und VC',
      'Revenue-based Financing als nicht-verwassernde Alternative',
    ],
    investor: [
      'Ein Angel statt VC gibt dir mehr Kontrolle',
      'Bootstrappe bis zum MVP, dann raise mit besserer Bewertung',
      'Accelerator-Programme als Einstieg ins Ökosystem',
    ],
    hybrid: [
      'Starte Bootstrap, validiere, dann raise strategisch',
      'Finde einen Angel als "Smart Money" statt reines Kapital',
      'Grants und Förderprogramme als nicht-verwässernde Finanzierung',
    ],
  };
  return alternatives[recommendation];
}

function generateWarnings(data: WizardData): string[] {
  const warnings: string[] = [];

  if (data.personalSituation.runwayMonths && data.personalSituation.runwayMonths < 6) {
    warnings.push('Mit weniger als 6 Monaten Runway solltest du schnell handeln');
  }

  if (data.personalSituation.teamSize === 'solo' && data.goals.exitGoal === 'ipo') {
    warnings.push('Solo-Gründer mit IPO-Ambitionen: VCs erwarten typischerweise ein Team');
  }

  if (
    data.goals.controlImportance &&
    data.goals.controlImportance >= 9 &&
    data.goals.growthSpeed === 'hypergrowth'
  ) {
    warnings.push('Hypergrowth bei maximaler Kontrolle ist ein Widerspruch');
  }

  return warnings;
}

export function calculateRoute(data: WizardData): RouteResult {
  let bootstrapTotal = 0;
  let investorTotal = 0;
  const reasons: RouteReason[] = [];

  for (const factor of SCORE_FACTORS) {
    const result = factor.calculate(data);
    const weightedBootstrap = (result.bootstrap / 100) * factor.weight;
    const weightedInvestor = (result.investor / 100) * factor.weight;

    bootstrapTotal += weightedBootstrap;
    investorTotal += weightedInvestor;

    reasons.push({
      factor: factor.name,
      impact:
        result.bootstrap > result.investor
          ? 'positive'
          : result.bootstrap < result.investor
          ? 'negative'
          : 'neutral',
      explanation: result.reason,
      score: result.bootstrap - result.investor,
    });
  }

  const totalWeight = SCORE_FACTORS.reduce((sum, f) => sum + f.weight, 0);
  const bootstrapScore = Math.round((bootstrapTotal / totalWeight) * 100);
  const investorScore = Math.round((investorTotal / totalWeight) * 100);
  const hybridScore = Math.round((bootstrapScore + investorScore) / 2);

  let recommendation: RecommendedRoute;
  if (Math.abs(bootstrapScore - investorScore) < 15) {
    recommendation = 'hybrid';
  } else if (bootstrapScore > investorScore) {
    recommendation = 'bootstrap';
  } else {
    recommendation = 'investor';
  }

  const tierConfidence = getTierConfidenceMultiplier(data.tier);
  const baseConfidence = 60 + Math.abs(bootstrapScore - investorScore) / 2;
  const confidence = Math.min(95, Math.round(baseConfidence * tierConfidence));

  reasons.sort((a, b) => Math.abs(b.score) - Math.abs(a.score));

  return {
    recommendation,
    scores: {
      bootstrap: bootstrapScore,
      investor: investorScore,
      hybrid: hybridScore,
    },
    confidence,
    reasons: reasons.slice(0, 6),
    actionPlan: generateActionPlan(data, recommendation),
    alternativeConsiderations: generateAlternatives(recommendation),
    warnings: generateWarnings(data),
  };
}
