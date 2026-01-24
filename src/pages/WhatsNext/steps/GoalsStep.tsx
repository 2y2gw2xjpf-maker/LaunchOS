import * as React from 'react';
import { Heart, Building2, Rocket, HelpCircle, TrendingUp, Zap, Target } from 'lucide-react';
import { useStore } from '@/store';
import { QuestionCard, OptionGrid, OptionButton, SliderInput, CurrencyInput } from '@/components/forms';
import type { ExitGoal, GrowthSpeed, TimeHorizon, DataSharingTier } from '@/types';

// Define which questions show at which tier level
const TIER_LEVELS: Record<DataSharingTier, number> = {
  minimal: 1,
  basic: 2,
  detailed: 3,
  full: 4,
};

const exitOptions = [
  { value: 'lifestyle', label: 'Lifestyle Business', description: 'Solides Einkommen, volle Kontrolle', icon: <Heart className="w-5 h-5 text-navy" /> },
  { value: 'acquisition', label: 'Acquisition', description: 'Verkauf an grosseres Unternehmen', icon: <Building2 className="w-5 h-5 text-navy" /> },
  { value: 'ipo', label: 'IPO', description: 'Borsengang anstreben', icon: <Rocket className="w-5 h-5 text-navy" /> },
  { value: 'unsure', label: 'Noch unsicher', description: 'Will Optionen offen halten', icon: <HelpCircle className="w-5 h-5 text-navy" /> },
];

const growthOptions = [
  { value: 'slow_steady', label: 'Langsam & stetig', description: 'Organisch, profitabel', icon: <TrendingUp className="w-5 h-5 text-navy" /> },
  { value: 'moderate', label: 'Moderat', description: 'Balance zwischen Wachstum & Profit', icon: <Target className="w-5 h-5 text-navy" /> },
  { value: 'aggressive', label: 'Aggressiv', description: 'Schnelles Wachstum priorisieren', icon: <Zap className="w-5 h-5 text-navy" /> },
  { value: 'hypergrowth', label: 'Hypergrowth', description: 'Marktdominanz anstreben', icon: <Rocket className="w-5 h-5 text-navy" /> },
];

const horizonOptions = [
  { value: '1_year', label: '1 Jahr', description: 'Kurzfristig' },
  { value: '3_years', label: '3 Jahre', description: 'Mittelfristig' },
  { value: '5_years', label: '5 Jahre', description: 'Standard' },
  { value: '10_plus', label: '10+ Jahre', description: 'Langfristig' },
];

export const GoalsStep = () => {
  const { wizardData, setGoals, selectedTier } = useStore();
  const { goals } = wizardData;

  // Get current tier level (default to basic if not set)
  const tierLevel = TIER_LEVELS[selectedTier || 'basic'];

  return (
    <div className="space-y-8">
      {/* TIER 1+ (ALL TIERS): Exit goal and growth speed */}
      <QuestionCard
        question="Was ist dein langfristiges Ziel?"
        required
        helpText="Dein Exit-Ziel beeinflusst massgeblich, ob Investoren der richtige Weg sind."
      >
        <OptionGrid
          options={exitOptions}
          value={goals.exitGoal || ''}
          onChange={(value) => setGoals({ exitGoal: value as ExitGoal })}
          columns={2}
        />

        {tierLevel >= 3 && (goals.exitGoal === 'acquisition' || goals.exitGoal === 'ipo') && (
          <div className="mt-4 animate-fade-in">
            <CurrencyInput
              value={goals.targetExitValue}
              onChange={(value) => setGoals({ targetExitValue: value })}
              label="Angestrebter Exit-Wert"
              placeholder="10.000.000"
              hint="Falls du eine Vorstellung hast"
            />
          </div>
        )}
      </QuestionCard>

      <QuestionCard
        question="Wie schnell willst du wachsen?"
        required
        helpText="Schnelles Wachstum erfordert meist Kapital. Langsames Wachstum erlaubt Bootstrapping."
      >
        <OptionGrid
          options={growthOptions}
          value={goals.growthSpeed || ''}
          onChange={(value) => setGoals({ growthSpeed: value as GrowthSpeed })}
          columns={2}
        />
      </QuestionCard>

      {/* TIER 2+ (BASIC+): Time horizon and investor openness */}
      {tierLevel >= 2 && (
        <>
          <QuestionCard
            question="Dein Zeithorizont?"
            description="Wie lange planst du an diesem Projekt zu arbeiten?"
          >
            <OptionGrid
              options={horizonOptions}
              value={goals.timeHorizon || ''}
              onChange={(value) => setGoals({ timeHorizon: value as TimeHorizon })}
              columns={4}
            />
          </QuestionCard>

          <QuestionCard
            question="Bist du offen fur Investoren?"
            description="Grundsatzliche Offenheit, externe Kapitalgeber ins Boot zu holen."
          >
            <div className="flex gap-4">
              <OptionButton
                label="Ja"
                selected={goals.openToInvestors === true}
                onClick={() => setGoals({ openToInvestors: true })}
              />
              <OptionButton
                label="Nein"
                selected={goals.openToInvestors === false}
                onClick={() => setGoals({ openToInvestors: false })}
              />
              <OptionButton
                label="Vielleicht"
                description="Abhangig von Konditionen"
                selected={goals.openToInvestors === undefined}
                onClick={() => setGoals({ openToInvestors: undefined })}
              />
            </div>
          </QuestionCard>
        </>
      )}

      {/* TIER 3+ (DETAILED+): Control importance and co-founder openness */}
      {tierLevel >= 3 && (
        <>
          <QuestionCard
            question="Wie wichtig ist dir Kontrolle?"
            description="Investoren bekommen typischerweise Stimmrechte und Einfluss auf Entscheidungen."
          >
            <SliderInput
              value={goals.controlImportance || 5}
              onChange={(value) => setGoals({ controlImportance: value })}
              min={1}
              max={10}
              leftLabel="Kontrolle nicht so wichtig"
              rightLabel="Volle Kontrolle essentiell"
              formatValue={(v) => `${v}/10`}
            />
          </QuestionCard>

          <QuestionCard
            question="Bist du offen fur Co-Founder?"
            description="Wurden du einen weiteren Grunder aufnehmen?"
          >
            <div className="flex gap-4">
              <OptionButton
                label="Ja"
                selected={goals.openToCoFounders === true}
                onClick={() => setGoals({ openToCoFounders: true })}
              />
              <OptionButton
                label="Nein"
                selected={goals.openToCoFounders === false}
                onClick={() => setGoals({ openToCoFounders: false })}
              />
            </div>
          </QuestionCard>
        </>
      )}

      {/* TIER 4 (FULL): Profitability vs growth tradeoff */}
      {tierLevel >= 4 && (
        <QuestionCard
          question="Profitabilitat vs. Wachstum?"
          description="Wenn du wahlen musstest - was ist wichtiger?"
        >
          <div className="flex gap-4">
            <OptionButton
              label="Profitabilitat"
              description="Lieber weniger wachsen aber profitabel sein"
              selected={goals.prioritizeProfitability === true}
              onClick={() => setGoals({ prioritizeProfitability: true })}
            />
            <OptionButton
              label="Wachstum"
              description="Lieber schneller wachsen, Profitabilitat spater"
              selected={goals.prioritizeProfitability === false}
              onClick={() => setGoals({ prioritizeProfitability: false })}
            />
          </div>
        </QuestionCard>
      )}
    </div>
  );
};
