import * as React from 'react';
import {
  Cloud,
  ShoppingBag,
  Store,
  FileText,
  Wrench,
  Cpu,
  Landmark,
  Heart,
  GraduationCap,
  HelpCircle,
} from 'lucide-react';
import { useStore } from '@/store';
import { QuestionCard, OptionGrid, OptionButton, NumberInput, CurrencyInput } from '@/components/forms';
import type { ProjectCategory, ProjectStage, TargetCustomer, DataSharingTier } from '@/types';

// Define which questions show at which tier level
// minimal: Only essential questions (category, stage, target)
// basic: + hasRevenue, hasUsers
// detailed: + revenue/user details
// full: All questions with detailed follow-ups
const TIER_LEVELS: Record<DataSharingTier, number> = {
  minimal: 1,
  basic: 2,
  detailed: 3,
  full: 4,
};

const categoryOptions = [
  { value: 'saas', label: 'SaaS', description: 'Software as a Service', icon: <Cloud className="w-5 h-5 text-navy" /> },
  { value: 'marketplace', label: 'Marketplace', description: 'Plattform die Anbieter & Nachfrager verbindet', icon: <Store className="w-5 h-5 text-navy" /> },
  { value: 'ecommerce', label: 'E-Commerce', description: 'Online-Shop oder D2C Brand', icon: <ShoppingBag className="w-5 h-5 text-navy" /> },
  { value: 'content', label: 'Content/Media', description: 'Newsletter, Podcasts, Kurse', icon: <FileText className="w-5 h-5 text-navy" /> },
  { value: 'service', label: 'Service/Agentur', description: 'Beratung oder Dienstleistung', icon: <Wrench className="w-5 h-5 text-navy" /> },
  { value: 'hardware', label: 'Hardware', description: 'Physische Produkte', icon: <Cpu className="w-5 h-5 text-navy" /> },
  { value: 'fintech', label: 'FinTech', description: 'Finanz-Technologie', icon: <Landmark className="w-5 h-5 text-navy" /> },
  { value: 'healthtech', label: 'HealthTech', description: 'Gesundheits-Technologie', icon: <Heart className="w-5 h-5 text-navy" /> },
  { value: 'edtech', label: 'EdTech', description: 'Bildungs-Technologie', icon: <GraduationCap className="w-5 h-5 text-navy" /> },
  { value: 'other', label: 'Andere', description: 'Passt in keine Kategorie', icon: <HelpCircle className="w-5 h-5 text-navy" /> },
];

const stageOptions = [
  { value: 'idea', label: 'Idee', description: 'Noch kein Produkt' },
  { value: 'mvp', label: 'MVP', description: 'Minimales Produkt vorhanden' },
  { value: 'beta', label: 'Beta', description: 'Wird von ersten Nutzern getestet' },
  { value: 'live', label: 'Live', description: 'Am Markt, möglicherweise mit Kunden' },
  { value: 'scaling', label: 'Scaling', description: 'Wachstum beschleunigen' },
];

const targetOptions = [
  { value: 'b2b', label: 'B2B', description: 'Unternehmen als Kunden' },
  { value: 'b2c', label: 'B2C', description: 'Endverbraucher als Kunden' },
  { value: 'both', label: 'Beides', description: 'B2B und B2C' },
  { value: 'b2b2c', label: 'B2B2C', description: 'Über Unternehmen an Endkunden' },
];

export const ProjectBasicsStep = () => {
  const { wizardData, setProjectBasics, selectedTier } = useStore();
  const { projectBasics } = wizardData;

  // Get current tier level (default to basic if not set)
  const tierLevel = TIER_LEVELS[selectedTier || 'basic'];

  return (
    <div className="space-y-8">
      {/* TIER 1+ (ALL TIERS): Basic category, stage, target */}
      <QuestionCard
        question="In welcher Branche ist dein Startup?"
        required
        helpText="Wähle die Kategorie, die am besten passt. Dies hilft uns bei der Markteinschätzung."
      >
        <OptionGrid
          options={categoryOptions}
          value={projectBasics.category || ''}
          onChange={(value) => setProjectBasics({ category: value as ProjectCategory })}
          columns={2}
        />
      </QuestionCard>

      <QuestionCard
        question="In welcher Phase ist dein Projekt?"
        required
        helpText="Der Entwicklungsstand beeinflusst sowohl die Bewertung als auch die empfohlene Strategie."
      >
        <OptionGrid
          options={stageOptions}
          value={projectBasics.stage || ''}
          onChange={(value) => setProjectBasics({ stage: value as ProjectStage })}
          columns={3}
        />
      </QuestionCard>

      <QuestionCard
        question="Wer ist deine Zielgruppe?"
        required
        helpText="Die Zielgruppe bestimmt Vertriebswege und Skalierungsmöglichkeiten."
      >
        <OptionGrid
          options={targetOptions}
          value={projectBasics.targetCustomer || ''}
          onChange={(value) => setProjectBasics({ targetCustomer: value as TargetCustomer })}
          columns={4}
        />
      </QuestionCard>

      {/* TIER 2+ (BASIC+): Revenue and users questions */}
      {tierLevel >= 2 && (
        <>
          <QuestionCard
            question="Hast du bereits Umsatz?"
            description="Zahlende Kunden sind ein starkes Signal für Produkt-Market-Fit."
          >
            <div className="flex gap-4 mb-4">
              <OptionButton
                label="Ja"
                selected={projectBasics.hasRevenue === true}
                onClick={() => setProjectBasics({ hasRevenue: true })}
              />
              <OptionButton
                label="Nein"
                selected={projectBasics.hasRevenue === false}
                onClick={() => setProjectBasics({ hasRevenue: false })}
              />
            </div>

            {/* TIER 3+ (DETAILED+): Revenue details */}
            {tierLevel >= 3 && projectBasics.hasRevenue && (
              <div className="grid sm:grid-cols-2 gap-4 animate-fade-in">
                <CurrencyInput
                  value={projectBasics.monthlyRevenue}
                  onChange={(value) => setProjectBasics({ monthlyRevenue: value })}
                  label="Monatlicher Umsatz (MRR)"
                  placeholder="5.000"
                />
                <NumberInput
                  value={projectBasics.revenueGrowthRate}
                  onChange={(value) => setProjectBasics({ revenueGrowthRate: value })}
                  label="Monatliches Wachstum"
                  suffix="%"
                  placeholder="10"
                  hint="MoM Growth Rate"
                />
              </div>
            )}
          </QuestionCard>

          <QuestionCard
            question="Hast du bereits Nutzer?"
            description="Auch ohne Umsatz können aktive Nutzer ein wichtiges Signal sein."
          >
            <div className="flex gap-4 mb-4">
              <OptionButton
                label="Ja"
                selected={projectBasics.hasUsers === true}
                onClick={() => setProjectBasics({ hasUsers: true })}
              />
              <OptionButton
                label="Nein"
                selected={projectBasics.hasUsers === false}
                onClick={() => setProjectBasics({ hasUsers: false })}
              />
            </div>

            {/* TIER 3+ (DETAILED+): User details */}
            {tierLevel >= 3 && projectBasics.hasUsers && (
              <div className="grid sm:grid-cols-2 gap-4 animate-fade-in">
                <NumberInput
                  value={projectBasics.userCount}
                  onChange={(value) => setProjectBasics({ userCount: value })}
                  label="Anzahl aktiver Nutzer"
                  placeholder="100"
                />
                <NumberInput
                  value={projectBasics.userGrowthRate}
                  onChange={(value) => setProjectBasics({ userGrowthRate: value })}
                  label="Monatliches Wachstum"
                  suffix="%"
                  placeholder="15"
                  hint="MoM Growth Rate"
                />
              </div>
            )}
          </QuestionCard>
        </>
      )}

      {/* Info for minimal tier */}
      {tierLevel === 1 && (
        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-sm text-purple-700">
          <p className="font-medium mb-1">Minimale Datenfreigabe aktiv</p>
          <p className="text-purple-600">
            Du hast die minimale Datenfreigabe gewählt. Für detailliertere Empfehlungen
            kannst du jederzeit auf der Tier-Auswahl mehr Informationen freigeben.
          </p>
        </div>
      )}
    </div>
  );
};
