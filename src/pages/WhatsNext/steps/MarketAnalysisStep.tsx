import * as React from 'react';
import { TrendingUp, Clock, Users, Shield, Crown, Grid } from 'lucide-react';
import { useStore } from '@/store';
import { QuestionCard, OptionGrid, SliderInput, CurrencyInput } from '@/components/forms';
import { Input } from '@/components/ui';

const timingOptions = [
  { value: 'early', label: 'Fruh', description: 'Markt entsteht gerade', icon: <Clock className="w-5 h-5 text-navy" /> },
  { value: 'growing', label: 'Wachsend', description: 'Starkes Marktwachstum', icon: <TrendingUp className="w-5 h-5 text-navy" /> },
  { value: 'mature', label: 'Reif', description: 'Etablierter Markt', icon: <Shield className="w-5 h-5 text-navy" /> },
  { value: 'declining', label: 'Rucklaufig', description: 'Markt schrumpft', icon: <Clock className="w-5 h-5 text-navy" /> },
];

const marketTypeOptions = [
  { value: 'winner_takes_all', label: 'Winner takes all', description: 'Netzwerkeffekte, ein Gewinner', icon: <Crown className="w-5 h-5 text-navy" /> },
  { value: 'fragmented', label: 'Fragmentiert', description: 'Viele kleine Player moglich', icon: <Grid className="w-5 h-5 text-navy" /> },
  { value: 'oligopoly', label: 'Oligopol', description: 'Wenige grosse Anbieter', icon: <Users className="w-5 h-5 text-navy" /> },
];

export const MarketAnalysisStep = () => {
  const { wizardData, setMarketAnalysis } = useStore();
  const { marketAnalysis } = wizardData;
  const [competitorInput, setCompetitorInput] = React.useState('');

  const addCompetitor = () => {
    if (competitorInput.trim()) {
      const current = marketAnalysis.knownCompetitors || [];
      setMarketAnalysis({ knownCompetitors: [...current, competitorInput.trim()] });
      setCompetitorInput('');
    }
  };

  const removeCompetitor = (index: number) => {
    const current = marketAnalysis.knownCompetitors || [];
    setMarketAnalysis({ knownCompetitors: current.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-8">
      <QuestionCard
        question="Wer sind deine Wettbewerber?"
        description="Nenne die wichtigsten direkten und indirekten Konkurrenten."
        helpText="Auch indirekte Alternativen zahlen - wie losen Kunden das Problem heute?"
      >
        <div className="flex gap-2 mb-4">
          <Input
            value={competitorInput}
            onChange={(e) => setCompetitorInput(e.target.value)}
            placeholder="Wettbewerber-Name"
            onKeyPress={(e) => e.key === 'Enter' && addCompetitor()}
          />
          <button
            onClick={addCompetitor}
            className="px-4 py-2 bg-navy text-white rounded-xl font-medium hover:bg-navy/90 transition-colors"
          >
            Hinzufugen
          </button>
        </div>

        {(marketAnalysis.knownCompetitors?.length || 0) > 0 && (
          <div className="flex flex-wrap gap-2">
            {marketAnalysis.knownCompetitors?.map((competitor, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-navy/5 rounded-lg"
              >
                {competitor}
                <button
                  onClick={() => removeCompetitor(index)}
                  className="text-charcoal/40 hover:text-red-500"
                >
                  x
                </button>
              </span>
            ))}
          </div>
        )}
      </QuestionCard>

      <QuestionCard
        question="Wie stark ist der Wettbewerb?"
        description="Wie intensiv ist die Konkurrenz in deinem Markt?"
      >
        <SliderInput
          value={marketAnalysis.competitorStrength || 5}
          onChange={(value) => setMarketAnalysis({ competitorStrength: value })}
          min={1}
          max={10}
          leftLabel="Kaum Wettbewerb"
          rightLabel="Extrem wettbewerbsintensiv"
          formatValue={(v) => `${v}/10`}
        />
      </QuestionCard>

      <QuestionCard
        question="Wie ist das Markt-Timing?"
        helpText="Fruhe Markte bieten mehr Upside aber auch mehr Risiko."
      >
        <OptionGrid
          options={timingOptions}
          value={marketAnalysis.marketTiming || ''}
          onChange={(value) => setMarketAnalysis({ marketTiming: value as 'early' | 'growing' | 'mature' | 'declining' })}
          columns={4}
        />
      </QuestionCard>

      <QuestionCard
        question="Welcher Markttyp?"
        description="Die Marktstruktur beeinflusst die optimale Strategie."
        helpText="Winner-takes-all Markte erfordern schnelles Wachstum und oft Kapital."
      >
        <OptionGrid
          options={marketTypeOptions}
          value={marketAnalysis.marketType || ''}
          onChange={(value) => setMarketAnalysis({ marketType: value as 'winner_takes_all' | 'fragmented' | 'oligopoly' })}
          columns={3}
        />
      </QuestionCard>

      <QuestionCard
        question="Wie komplex ist die Regulierung?"
        description="Gibt es rechtliche Hurden oder Compliance-Anforderungen?"
      >
        <SliderInput
          value={marketAnalysis.regulatoryComplexity || 3}
          onChange={(value) => setMarketAnalysis({ regulatoryComplexity: value })}
          min={1}
          max={10}
          leftLabel="Kaum Regulierung"
          rightLabel="Stark reguliert"
          formatValue={(v) => `${v}/10`}
        />
      </QuestionCard>

      <QuestionCard
        question="Marktgrosse (optional)"
        description="Falls du Schatzungen hast - diese verbessern die Analyse."
        helpText="TAM = Total, SAM = Serviceable, SOM = Obtainable"
      >
        <div className="grid sm:grid-cols-3 gap-4">
          <CurrencyInput
            value={marketAnalysis.estimatedTAM}
            onChange={(value) => setMarketAnalysis({ estimatedTAM: value })}
            label="TAM (Total Addressable)"
            placeholder="1.000.000.000"
          />
          <CurrencyInput
            value={marketAnalysis.estimatedSAM}
            onChange={(value) => setMarketAnalysis({ estimatedSAM: value })}
            label="SAM (Serviceable)"
            placeholder="100.000.000"
          />
          <CurrencyInput
            value={marketAnalysis.estimatedSOM}
            onChange={(value) => setMarketAnalysis({ estimatedSOM: value })}
            label="SOM (Obtainable)"
            placeholder="10.000.000"
          />
        </div>
      </QuestionCard>
    </div>
  );
};
