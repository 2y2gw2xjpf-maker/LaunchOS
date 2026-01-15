import * as React from 'react';
import { User, Users, Building, Clock, Briefcase, Coffee } from 'lucide-react';
import { useStore } from '@/store';
import { QuestionCard, OptionGrid, OptionButton, NumberInput, SliderInput } from '@/components/forms';
import type { TeamSize, Commitment, FinancialSituation } from '@/types';

const teamOptions = [
  { value: 'solo', label: 'Solo', description: 'Nur ich', icon: <User className="w-5 h-5 text-navy" /> },
  { value: 'cofounders', label: 'Co-Founder', description: '2-3 Grunder', icon: <Users className="w-5 h-5 text-navy" /> },
  { value: 'small_team', label: 'Kleines Team', description: '4-10 Leute', icon: <Building className="w-5 h-5 text-navy" /> },
  { value: 'larger_team', label: 'Grosseres Team', description: '10+ Leute', icon: <Building className="w-5 h-5 text-navy" /> },
];

const commitmentOptions = [
  { value: 'fulltime', label: 'Vollzeit', description: '40+ Stunden/Woche', icon: <Briefcase className="w-5 h-5 text-navy" /> },
  { value: 'parttime', label: 'Teilzeit', description: '15-30 Stunden/Woche', icon: <Clock className="w-5 h-5 text-navy" /> },
  { value: 'side_project', label: 'Side Project', description: '<15 Stunden/Woche', icon: <Coffee className="w-5 h-5 text-navy" /> },
];

const financialOptions = [
  { value: 'bootstrapped', label: 'Bootstrapped', description: 'Kein Polster, lebe von Einnahmen' },
  { value: 'some_savings', label: 'Etwas Erspartes', description: '3-6 Monate Lebenshaltung' },
  { value: 'comfortable', label: 'Komfortabel', description: '6-18 Monate Lebenshaltung' },
  { value: 'significant', label: 'Signifikant', description: '18+ Monate oder andere Einkommensquellen' },
];

export const PersonalSituationStep = () => {
  const { wizardData, setPersonalSituation } = useStore();
  const { personalSituation } = wizardData;

  return (
    <div className="space-y-8">
      <QuestionCard
        question="Wie gross ist dein Team?"
        required
        helpText="Die Team-Grosse beeinflusst sowohl die Bewertung als auch den empfohlenen Weg."
      >
        <OptionGrid
          options={teamOptions}
          value={personalSituation.teamSize || ''}
          onChange={(value) => setPersonalSituation({ teamSize: value as TeamSize })}
          columns={4}
        />

        {personalSituation.teamSize === 'cofounders' && (
          <div className="mt-4 animate-fade-in">
            <NumberInput
              value={personalSituation.cofoundersCount}
              onChange={(value) => setPersonalSituation({ cofoundersCount: value })}
              label="Anzahl Co-Founder (inkl. dir)"
              min={2}
              max={5}
              showControls
            />
          </div>
        )}
      </QuestionCard>

      <QuestionCard
        question="Hast du relevante Erfahrung in der Branche?"
        description="Vorherige Erfahrung in ahnlichen Rollen oder Branchen."
        helpText="Branchenerfahrung reduziert das Ausfuhrungsrisiko aus Investorensicht."
      >
        <div className="flex gap-4 mb-4">
          <OptionButton
            label="Ja"
            selected={personalSituation.hasRelevantExperience === true}
            onClick={() => setPersonalSituation({ hasRelevantExperience: true })}
          />
          <OptionButton
            label="Nein"
            selected={personalSituation.hasRelevantExperience === false}
            onClick={() => setPersonalSituation({ hasRelevantExperience: false })}
          />
        </div>

        {personalSituation.hasRelevantExperience && (
          <div className="animate-fade-in">
            <NumberInput
              value={personalSituation.yearsExperience}
              onChange={(value) => setPersonalSituation({ yearsExperience: value })}
              label="Jahre relevanter Erfahrung"
              min={0}
              max={30}
              showControls
            />
          </div>
        )}
      </QuestionCard>

      <QuestionCard
        question="Wie viel Zeit kannst du investieren?"
        required
        helpText="Dein Commitment beeinflusst die Geschwindigkeit deines Fortschritts."
      >
        <OptionGrid
          options={commitmentOptions}
          value={personalSituation.commitment || ''}
          onChange={(value) => setPersonalSituation({ commitment: value as Commitment })}
          columns={3}
        />
      </QuestionCard>

      <QuestionCard
        question="Wie ist deine finanzielle Situation?"
        required
        description="Dies hilft uns, realistische Empfehlungen zu geben."
        helpText="Wir fragen nicht nach genauen Zahlen - nur nach einer groben Einschatzung."
      >
        <OptionGrid
          options={financialOptions}
          value={personalSituation.financialSituation || ''}
          onChange={(value) => setPersonalSituation({ financialSituation: value as FinancialSituation })}
          columns={2}
        />
      </QuestionCard>

      <QuestionCard
        question="Wie viele Monate Runway hast du?"
        description="Wie lange kannst du ohne externes Einkommen weitermachen?"
        helpText="Runway = Monate bis dir das Geld ausgeht."
      >
        <NumberInput
          value={personalSituation.runwayMonths}
          onChange={(value) => setPersonalSituation({ runwayMonths: value })}
          min={0}
          max={60}
          suffix="Monate"
          showControls
        />
      </QuestionCard>

      <QuestionCard
        question="Wie hoch ist deine Risiko-Toleranz?"
        description="Wie viel Unsicherheit kannst du ertragen?"
      >
        <SliderInput
          value={personalSituation.riskTolerance || 5}
          onChange={(value) => setPersonalSituation({ riskTolerance: value })}
          min={1}
          max={10}
          leftLabel="Sehr risikoavers"
          rightLabel="Sehr risikobereit"
          formatValue={(v) => `${v}/10`}
        />
      </QuestionCard>

      <QuestionCard
        question="Hast du andere Einkommensquellen?"
        description="Z.B. Teilzeit-Job, Partner-Einkommen, Mieteinnahmen"
      >
        <div className="flex gap-4">
          <OptionButton
            label="Ja"
            selected={personalSituation.hasOtherIncome === true}
            onClick={() => setPersonalSituation({ hasOtherIncome: true })}
          />
          <OptionButton
            label="Nein"
            selected={personalSituation.hasOtherIncome === false}
            onClick={() => setPersonalSituation({ hasOtherIncome: false })}
          />
        </div>
      </QuestionCard>
    </div>
  );
};
