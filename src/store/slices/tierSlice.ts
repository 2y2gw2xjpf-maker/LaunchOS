import type { StateCreator } from 'zustand';
import type { DataSharingTier, TierConfig } from '@/types';

export const TIER_CONFIGS: TierConfig[] = [
  {
    tier: 'minimal',
    label: 'Nur das Notigste',
    description: 'Du teilst nur Kategorie und Stage - keine Details uber deine Idee.',
    whatWeAsk: [
      'Branche/Kategorie (z.B. "SaaS", "E-Commerce")',
      'Entwicklungsstand (Idee/MVP/Beta/Live)',
      'Zielgruppe (B2B/B2C)',
      'Deine personliche Situation',
    ],
    whatWeNeverAsk: [
      'Was genau dein Produkt macht',
      'Dein Unique Selling Point',
      'Code, Screenshots, URLs',
      'Konkrete Feature-Beschreibungen',
    ],
    confidenceRange: [30, 50],
    analysisDepth: 'Grobe Richtungsempfehlung basierend auf Branchenstandards',
    example: 'Wie ein Berater, der nur weiss "SaaS B2B, MVP-Phase, Solo-Grunder"',
  },
  {
    tier: 'basic',
    label: 'Grundlegende Infos',
    description: 'Du beschreibst dein Produkt in 2-3 Satzen - ohne Geheimrezept.',
    whatWeAsk: [
      'Alles aus Tier 1, plus:',
      'Kurze Produktbeschreibung (was es tut, nicht wie)',
      'Hauptproblem das du lost',
      'Ungefähre Zielgruppengrosse',
      'Aktuelle Metriken (falls vorhanden)',
    ],
    whatWeNeverAsk: [
      'Technische Implementation',
      'Code oder Architektur',
      'Dein "Secret Sauce"',
    ],
    confidenceRange: [50, 70],
    analysisDepth: 'Fundierte Empfehlung mit Marktkontext',
    example:
      'Wie ein Pitch an einen Bekannten - genug um zu verstehen, nicht genug um zu kopieren',
  },
  {
    tier: 'detailed',
    label: 'Detaillierte Analyse',
    description: 'Du teilst eine Live-URL oder Landing Page - wir schauen es uns an.',
    whatWeAsk: [
      'Alles aus Tier 2, plus:',
      'Live URL oder Landing Page',
      'Screenshots der Hauptfeatures',
      'Pricing-Struktur (falls vorhanden)',
      'Bekannte Wettbewerber',
    ],
    whatWeNeverAsk: ['Source Code', 'Interne Dokumentation', 'Passworter oder API-Keys'],
    confidenceRange: [70, 85],
    analysisDepth: 'Detaillierte Analyse mit konkreten Verbesserungsvorschlagen',
    example: 'Wie ein Angel Investor beim ersten Gesprach',
  },
  {
    tier: 'full',
    label: 'Vollstandige Analyse',
    description: 'Du teilst alles - Repo, Docs, alles. Maximale Tiefe.',
    whatWeAsk: [
      'Alles aus Tier 3, plus:',
      'GitHub Repo oder ZIP',
      'Technische Dokumentation',
      'Business Plan / Pitch Deck',
      'Finanzielle Projektionen',
    ],
    whatWeNeverAsk: ['Personliche Passworter', 'Bankdaten'],
    confidenceRange: [85, 95],
    analysisDepth: 'Umfassende Due-Diligence-artige Analyse',
    example: 'Wie ein VC der Term Sheet-ready pruft',
  },
];

export interface TierSlice {
  selectedTier: DataSharingTier | null;
  tierConfigs: TierConfig[];
  acknowledgedPrivacy: boolean;
  setSelectedTier: (tier: DataSharingTier) => void;
  setAcknowledgedPrivacy: (acknowledged: boolean) => void;
  getTierConfig: (tier: DataSharingTier) => TierConfig | undefined;
  getConfidenceRange: () => [number, number];
}

export const createTierSlice: StateCreator<TierSlice> = (set, get) => ({
  selectedTier: null,
  tierConfigs: TIER_CONFIGS,
  acknowledgedPrivacy: false,

  setSelectedTier: (tier) => set({ selectedTier: tier }),
  setAcknowledgedPrivacy: (acknowledged) => set({ acknowledgedPrivacy: acknowledged }),

  getTierConfig: (tier) => TIER_CONFIGS.find((c) => c.tier === tier),

  getConfidenceRange: () => {
    const { selectedTier } = get();
    if (!selectedTier) return [0, 0];
    const config = TIER_CONFIGS.find((c) => c.tier === selectedTier);
    return config?.confidenceRange || [0, 0];
  },
});
