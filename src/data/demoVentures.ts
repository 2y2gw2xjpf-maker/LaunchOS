/**
 * Demo Ventures - Hardcoded Beispiel-Startups für Feature-Exploration
 *
 * Diese Demo-Ventures ermöglichen:
 * - Vollständige Feature-Exploration ohne eigene Daten
 * - Nutzung in Vergleichs-Features
 * - Bewertungs-Demos
 * - Read-Only Modus für sichere Exploration
 */

import type { Venture, TierData } from '@/hooks/useVentures';

export interface DemoVenture extends Venture {
  isDemo: true;
  demoScenario: 'bootstrap' | 'investor' | 'hybrid';
  demoDescription: string;
}

// Vollständige Tier-Daten für Demo-Ventures
const bootstrapTierData: TierData = {
  tier: 3,
  category: 'SaaS',
  stage: 'seed',
  description: 'No-Code Platform für schnelle App-Entwicklung',
  url: 'https://codecraft-studio.example.com',
  github_url: 'https://github.com/codecraft-studio',
  pitch_deck_url: '',
  has_financials: true,
  financials_summary: 'MRR: 8.500 EUR, Wachstum: 12% MoM, Runway: 18+ Monate',
  completed_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
};

const investorTierData: TierData = {
  tier: 4,
  category: 'HealthTech',
  stage: 'series-a',
  description: 'KI-gestützte Diagnostik für Krankenhäuser',
  url: 'https://medtech-ai.example.com',
  github_url: '',
  pitch_deck_url: 'https://pitch.medtech-ai.example.com',
  has_financials: true,
  financials_summary: 'ARR: 540.000 EUR, Series A: 2.5M EUR raised, 18 Monate Runway',
  completed_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
};

const hybridTierData: TierData = {
  tier: 3,
  category: 'Mobility',
  stage: 'pre-seed',
  description: 'Nachhaltige urbane Mobilitätslösung',
  url: 'https://greencommute.example.com',
  github_url: 'https://github.com/greencommute',
  pitch_deck_url: 'https://pitch.greencommute.example.com',
  has_financials: true,
  financials_summary: 'MRR: 3.200 EUR, Angel Investment: 150.000 EUR, Break-even in 8 Monaten',
  completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
};

export const DEMO_VENTURES: DemoVenture[] = [
  {
    id: 'demo-bootstrap-venture',
    name: 'CodeCraft Studio',
    tagline: 'No-Code Development Platform',
    description: 'CodeCraft Studio ermöglicht es jedem, professionelle Web-Apps ohne Programmierkenntnisse zu erstellen. Mit unserem visuellen Builder und vorgefertigten Komponenten können Unternehmen ihre digitalen Prozesse in Tagen statt Monaten umsetzen.',
    industry: 'SaaS',
    stage: 'seed',
    companyType: 'GmbH',
    fundingPath: 'bootstrap',
    fundingGoal: 'Organisches Wachstum',
    monthlyRevenue: 8500,
    teamSize: 2,
    logoUrl: undefined,
    branding: {
      primary_color: '#6366F1',
      secondary_color: '#EC4899',
      font: 'Inter',
    },
    isActive: false,
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    tierLevel: 3,
    tierData: bootstrapTierData,
    analysesCount: 3,
    isDemo: true,
    demoScenario: 'bootstrap',
    demoDescription: 'Profitables, selbst-finanziertes SaaS erkunden',
  },
  {
    id: 'demo-investor-venture',
    name: 'MedTech AI Solutions',
    tagline: 'KI-gestützte Diagnostik',
    description: 'MedTech AI revolutioniert die medizinische Diagnostik durch Machine Learning. Unsere Algorithmen analysieren medizinische Bilder mit einer Genauigkeit, die erfahrene Radiologen übertrifft - und das in Sekunden statt Stunden.',
    industry: 'HealthTech',
    stage: 'series-a',
    companyType: 'GmbH',
    fundingPath: 'investor',
    fundingGoal: '5M EUR Series A',
    monthlyRevenue: 45000,
    teamSize: 12,
    logoUrl: undefined,
    branding: {
      primary_color: '#0EA5E9',
      secondary_color: '#10B981',
      font: 'Inter',
    },
    isActive: false,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    tierLevel: 4,
    tierData: investorTierData,
    analysesCount: 5,
    isDemo: true,
    demoScenario: 'investor',
    demoDescription: 'VC-finanziertes Venture mit Fundraising-Metriken',
  },
  {
    id: 'demo-hybrid-venture',
    name: 'GreenCommute',
    tagline: 'Nachhaltige urbane Mobilität',
    description: 'GreenCommute verbindet E-Bikes, E-Scooter und ÖPNV in einer nahtlosen App. Nutzer planen ihre Route, wir optimieren sie für minimalen CO2-Ausstoß und maximale Effizienz. Bereits in 3 Städten aktiv.',
    industry: 'Mobility',
    stage: 'pre-seed',
    companyType: 'UG',
    fundingPath: 'hybrid',
    fundingGoal: '500K EUR Seed',
    monthlyRevenue: 3200,
    teamSize: 4,
    logoUrl: undefined,
    branding: {
      primary_color: '#22C55E',
      secondary_color: '#3B82F6',
      font: 'Inter',
    },
    isActive: false,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    tierLevel: 3,
    tierData: hybridTierData,
    analysesCount: 2,
    isDemo: true,
    demoScenario: 'hybrid',
    demoDescription: 'Hybrid-Ansatz: Bootstrap mit selektiver Finanzierung',
  },
];

/**
 * Prüft ob ein Venture ein Demo-Venture ist
 */
export const isDemoVenture = (venture: Venture): venture is DemoVenture => {
  return venture.id.startsWith('demo-') || ('isDemo' in venture && (venture as DemoVenture).isDemo === true);
};

/**
 * Gibt ein Demo-Venture anhand seiner ID zurück
 */
export const getDemoVentureById = (id: string): DemoVenture | undefined => {
  return DEMO_VENTURES.find(v => v.id === id);
};

/**
 * Gibt Demo-Ventures für ein bestimmtes Szenario zurück
 */
export const getDemoVenturesByScenario = (scenario: DemoVenture['demoScenario']): DemoVenture[] => {
  return DEMO_VENTURES.filter(v => v.demoScenario === scenario);
};
