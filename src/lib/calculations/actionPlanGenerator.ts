import type { WizardData, ActionPlan, ActionPhase, RecommendedRoute } from '@/types';

const bootstrapPhases: ActionPhase[] = [
  {
    title: 'Phase 1: Validierung',
    duration: 'Monat 1-2',
    tasks: [
      {
        id: 'b1-1',
        title: 'Problem-Interviews durchfuhren',
        description: 'Sprich mit 10-20 potenziellen Kunden uber ihr Problem',
        priority: 'critical',
        estimatedHours: 20,
        tools: ['Calendly', 'Zoom', 'Notion'],
        tips: ['Frag nach Verhalten, nicht nach Meinungen', 'Nimm Interviews auf'],
      },
      {
        id: 'b1-2',
        title: 'Landing Page erstellen',
        description: 'Einfache Seite mit Value Prop und Email-Signup',
        priority: 'high',
        estimatedHours: 8,
        tools: ['Carrd', 'Webflow', 'Framer'],
      },
      {
        id: 'b1-3',
        title: 'Erstes Traffic-Experiment',
        description: 'Teste ein Marketing-Kanal mit kleinem Budget',
        priority: 'medium',
        estimatedHours: 10,
        tools: ['Google Ads', 'Reddit Ads', 'Twitter'],
      },
    ],
    budget: { min: 200, max: 500, currency: 'EUR' },
    timePerWeek: { min: 15, max: 25 },
    milestones: [
      '10+ Kundeninterviews abgeschlossen',
      '100+ Email-Signups',
      'Problem-Solution-Fit validiert',
    ],
    resources: [
      {
        name: 'The Mom Test',
        type: 'course',
        url: 'https://www.momtestbook.com/',
        cost: 'paid',
        description: 'Das wichtigste Buch fur Customer Discovery',
      },
    ],
  },
  {
    title: 'Phase 2: MVP Development',
    duration: 'Monat 2-4',
    tasks: [
      {
        id: 'b2-1',
        title: 'MVP bauen',
        description: 'Minimale Version mit Kernfeature',
        priority: 'critical',
        estimatedHours: 80,
      },
      {
        id: 'b2-2',
        title: 'Beta-Tester rekrutieren',
        description: '5-10 Early Adopter aus Interviews',
        priority: 'high',
        estimatedHours: 5,
      },
      {
        id: 'b2-3',
        title: 'Feedback-Loop etablieren',
        description: 'System fur kontinuierliches Feedback',
        priority: 'medium',
        estimatedHours: 8,
      },
    ],
    budget: { min: 500, max: 2000, currency: 'EUR' },
    timePerWeek: { min: 25, max: 40 },
    milestones: [
      'MVP live',
      '5+ Beta-Tester aktiv',
      'Erste Feature-Requests dokumentiert',
    ],
    resources: [],
  },
  {
    title: 'Phase 3: First Revenue',
    duration: 'Monat 4-6',
    tasks: [
      {
        id: 'b3-1',
        title: 'Pricing definieren',
        description: 'Preismodell basierend auf Value festlegen',
        priority: 'critical',
        estimatedHours: 10,
      },
      {
        id: 'b3-2',
        title: 'Payment-System integrieren',
        description: 'Stripe, Paddle oder ahnliches einrichten',
        priority: 'critical',
        estimatedHours: 8,
      },
      {
        id: 'b3-3',
        title: 'Erste zahlende Kunden gewinnen',
        description: 'Beta-Tester zu Kunden konvertieren',
        priority: 'critical',
        estimatedHours: 15,
      },
    ],
    budget: { min: 300, max: 1000, currency: 'EUR' },
    timePerWeek: { min: 20, max: 35 },
    milestones: [
      'Erstes MRR',
      '10+ zahlende Kunden',
      'Unit Economics verstanden',
    ],
    resources: [],
  },
];

const investorPhases: ActionPhase[] = [
  {
    title: 'Phase 1: Investor-Ready machen',
    duration: 'Monat 1-2',
    tasks: [
      {
        id: 'i1-1',
        title: 'Pitch Deck erstellen',
        description: '10-12 Slides nach Standard-Format',
        priority: 'critical',
        estimatedHours: 30,
        tools: ['Pitch', 'Canva', 'Figma'],
      },
      {
        id: 'i1-2',
        title: 'Financial Model bauen',
        description: '3-5 Jahre Projektion mit Annahmen',
        priority: 'high',
        estimatedHours: 20,
        tools: ['Google Sheets', 'Causal'],
      },
      {
        id: 'i1-3',
        title: 'Data Room vorbereiten',
        description: 'Alle Dokumente fur Due Diligence',
        priority: 'medium',
        estimatedHours: 15,
      },
    ],
    budget: { min: 500, max: 2000, currency: 'EUR' },
    timePerWeek: { min: 20, max: 35 },
    milestones: [
      'Pitch Deck fertig',
      'Financial Model reviewed',
      'Data Room komplett',
    ],
    resources: [],
  },
  {
    title: 'Phase 2: Investor-Suche',
    duration: 'Monat 2-4',
    tasks: [
      {
        id: 'i2-1',
        title: 'Target-Liste erstellen',
        description: '50+ relevante Investoren recherchieren',
        priority: 'critical',
        estimatedHours: 15,
      },
      {
        id: 'i2-2',
        title: 'Warm Intros organisieren',
        description: 'Netzwerk fur Introductions nutzen',
        priority: 'critical',
        estimatedHours: 20,
      },
      {
        id: 'i2-3',
        title: 'Pitch trainieren',
        description: '20+ Ubungspitches durchfuhren',
        priority: 'high',
        estimatedHours: 15,
      },
    ],
    budget: { min: 1000, max: 3000, currency: 'EUR' },
    timePerWeek: { min: 25, max: 40 },
    milestones: [
      '50+ Investoren kontaktiert',
      '10+ Erstgesprache',
      '3+ Follow-up Meetings',
    ],
    resources: [],
  },
  {
    title: 'Phase 3: Closing',
    duration: 'Monat 4-6',
    tasks: [
      {
        id: 'i3-1',
        title: 'Term Sheets verhandeln',
        description: 'Konditionen verstehen und verhandeln',
        priority: 'critical',
        estimatedHours: 25,
      },
      {
        id: 'i3-2',
        title: 'Legal vorbereiten',
        description: 'Anwalt fur Investment-Docs',
        priority: 'critical',
        estimatedHours: 20,
      },
      {
        id: 'i3-3',
        title: 'Due Diligence begleiten',
        description: 'Alle Anfragen zeitnah beantworten',
        priority: 'high',
        estimatedHours: 30,
      },
    ],
    budget: { min: 5000, max: 15000, currency: 'EUR' },
    timePerWeek: { min: 30, max: 50 },
    milestones: [
      'Term Sheet unterschrieben',
      'Due Diligence abgeschlossen',
      'Geld auf dem Konto',
    ],
    resources: [],
  },
];

const hybridPhases: ActionPhase[] = [
  {
    title: 'Phase 1: Proof of Concept',
    duration: 'Monat 1-3',
    tasks: [
      {
        id: 'h1-1',
        title: 'MVP mit eigenem Geld',
        description: 'Bootstrapped MVP entwickeln',
        priority: 'critical',
        estimatedHours: 60,
      },
      {
        id: 'h1-2',
        title: 'Erste Kunden gewinnen',
        description: 'Traktion vor Investment zeigen',
        priority: 'critical',
        estimatedHours: 30,
      },
      {
        id: 'h1-3',
        title: 'Metriken tracken',
        description: 'Investor-relevante KPIs von Anfang an',
        priority: 'high',
        estimatedHours: 10,
      },
    ],
    budget: { min: 1000, max: 3000, currency: 'EUR' },
    timePerWeek: { min: 25, max: 40 },
    milestones: [
      'MVP live',
      'Erste zahlende Kunden',
      'Wachstums-Metriken positiv',
    ],
    resources: [],
  },
  {
    title: 'Phase 2: Strategic Fundraising',
    duration: 'Monat 3-5',
    tasks: [
      {
        id: 'h2-1',
        title: 'Smart Money identifizieren',
        description: 'Angels mit Branchenexpertise finden',
        priority: 'critical',
        estimatedHours: 20,
      },
      {
        id: 'h2-2',
        title: 'Selektives Pitchen',
        description: 'Nur strategisch wertvolle Investoren',
        priority: 'high',
        estimatedHours: 25,
      },
      {
        id: 'h2-3',
        title: 'Parallel weiter bootstrappen',
        description: 'Revenue-Wachstum nicht vernachlassigen',
        priority: 'critical',
        estimatedHours: 40,
      },
    ],
    budget: { min: 2000, max: 5000, currency: 'EUR' },
    timePerWeek: { min: 30, max: 45 },
    milestones: [
      '3+ strategische Investoren in Pipeline',
      'MRR weiter wachsend',
      'Optionalitat erhalten',
    ],
    resources: [],
  },
];

export function generateActionPlan(
  data: WizardData,
  route: RecommendedRoute
): ActionPlan {
  const templates: Record<RecommendedRoute, ActionPhase[]> = {
    bootstrap: bootstrapPhases,
    investor: investorPhases,
    hybrid: hybridPhases,
  };

  const phases = JSON.parse(JSON.stringify(templates[route])) as ActionPhase[];

  // Adjust for commitment level
  const commitment = data.personalSituation.commitment || 'fulltime';
  const timeMultiplier = commitment === 'fulltime' ? 1 : commitment === 'parttime' ? 1.5 : 2;

  phases.forEach((phase) => {
    if (commitment !== 'fulltime') {
      const durationMatch = phase.duration.match(/(\d+)-(\d+)/);
      if (durationMatch) {
        const start = Math.round(parseInt(durationMatch[1]) * timeMultiplier);
        const end = Math.round(parseInt(durationMatch[2]) * timeMultiplier);
        phase.duration = phase.duration.replace(/\d+-\d+/, `${start}-${end}`);
      }

      phase.timePerWeek = {
        min: Math.round(phase.timePerWeek.min * 0.6),
        max: Math.round(phase.timePerWeek.max * 0.6),
      };
    }
  });

  // Calculate totals
  const totalBudget = phases.reduce(
    (acc, phase) => ({
      min: acc.min + phase.budget.min,
      max: acc.max + phase.budget.max,
      currency: 'EUR',
    }),
    { min: 0, max: 0, currency: 'EUR' }
  );

  return {
    route,
    phases,
    totalBudget,
    totalDuration: `${Math.round(6 * timeMultiplier)} Monate`,
    criticalPath: phases.flatMap((p) =>
      p.tasks.filter((t) => t.priority === 'critical').map((t) => t.title)
    ),
    riskFactors: generateRiskFactors(data, route),
    successMetrics: generateSuccessMetrics(route),
  };
}

function generateRiskFactors(data: WizardData, route: RecommendedRoute): string[] {
  const risks: string[] = [];

  if (data.personalSituation.teamSize === 'solo') {
    risks.push('Als Solo-Grunder: Burnout-Risiko und Engpass bei Skills');
  }

  if ((data.personalSituation.runwayMonths || 12) < 12) {
    risks.push('Begrenzter Runway: Zeitdruck bei Entscheidungen');
  }

  if (route === 'investor') {
    risks.push('Fundraising-Markt kann sich verschlechtern');
    risks.push('Verwasserung bei mehreren Runden');
  }

  if (route === 'bootstrap') {
    risks.push('Langsameres Wachstum als VC-finanzierte Konkurrenz');
    risks.push('Personliches finanzielles Risiko');
  }

  return risks;
}

function generateSuccessMetrics(route: RecommendedRoute): string[] {
  const metrics: Record<RecommendedRoute, string[]> = {
    bootstrap: [
      'MRR-Wachstum pro Monat',
      'Customer Lifetime Value',
      'Profitabilitat Timeline',
      'Net Revenue Retention',
    ],
    investor: [
      'Funding-Meilensteine',
      'Team-Wachstum',
      'Marktanteil-Entwicklung',
      'Burn Rate vs. Runway',
    ],
    hybrid: [
      'Revenue + Funding Mix',
      'Bewertungs-Entwicklung',
      'Strategische Partner',
      'Optionalitat Score',
    ],
  };

  return metrics[route];
}
