import * as React from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { useStore } from '@/store';
import { Card, Tooltip } from '@/components/ui';
import { SliderInput, CurrencyInput } from '@/components/forms';
import { CurrencyDisplay } from '@/components/common';
import { MethodApplicabilityWarning, ScoreBenchmark, STARTUP_BENCHMARKS } from '@/components/results';
import { calculateScorecard, SCORECARD_FACTOR_DEFINITIONS } from '@/lib/calculations';
import type { ScorecardFactors } from '@/types';

const factors: (keyof ScorecardFactors)[] = [
  'teamStrength',
  'marketSize',
  'productTech',
  'competition',
  'marketingSales',
  'needForFunding',
  'other',
];

export const ScorecardMethodPage = () => {
  const { scorecardFactors, setScorecardFactors, addMethodResult, wizardData } = useStore();
  const [baseValuation, setBaseValuation] = React.useState(1500000);
  const [showBenchmarks, setShowBenchmarks] = React.useState(true);

  const result = calculateScorecard(scorecardFactors, baseValuation);

  React.useEffect(() => {
    addMethodResult(result);
  }, [scorecardFactors, baseValuation]);

  const updateFactor = (key: keyof ScorecardFactors, field: 'weight' | 'score', value: number) => {
    setScorecardFactors({
      [key]: {
        ...scorecardFactors[key],
        [field]: value,
      },
    });
  };

  const totalWeight = Object.values(scorecardFactors).reduce((sum, f) => sum + f.weight, 0);

  return (
    <div className="space-y-8">
      {/* Method Applicability Warning */}
      <MethodApplicabilityWarning
        method="scorecard"
        stage={wizardData?.projectBasics?.stage}
      />

      {/* Info Card */}
      <Card className="p-6 bg-purple-50/50 border-purple-100">
        <h3 className="font-display font-semibold text-charcoal mb-2">Über die Scorecard-Methode</h3>
        <p className="text-charcoal/70">
          Die Scorecard-Methode vergleicht dein Startup mit einem durchschnittlichen Pre-Seed
          Unternehmen. Faktoren werden gewichtet und bewertet - uber 100% bedeutet besser als
          Durchschnitt.
        </p>
        <label className="flex items-center gap-2 mt-4 cursor-pointer">
          <input
            type="checkbox"
            checked={showBenchmarks}
            onChange={(e) => setShowBenchmarks(e.target.checked)}
            className="w-4 h-4 rounded border-charcoal/20 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-sm text-charcoal/70">Benchmarks anzeigen</span>
        </label>
      </Card>

      {/* Base Valuation */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-display font-semibold text-charcoal">Basis-Bewertung</h4>
            <p className="text-sm text-charcoal/60">
              Durchschnittliche Pre-Seed Bewertung in deiner Region
            </p>
          </div>
        </div>
        <CurrencyInput
          value={baseValuation}
          onChange={(v) => setBaseValuation(v || 1500000)}
          hint="Typisch: 1-2 Mio. € fur DACH"
        />
      </Card>

      {/* Weight Warning */}
      {totalWeight !== 100 && (
        <Card className="p-4 bg-pink-50 border-pink-200">
          <p className="text-sm text-pink-700">
            Gewichtungen summieren sich zu {totalWeight}% (sollte 100% sein)
          </p>
        </Card>
      )}

      {/* Factors */}
      <div className="space-y-4">
        {factors.map((factorKey, index) => {
          const definition = SCORECARD_FACTOR_DEFINITIONS[factorKey];
          const factor = scorecardFactors[factorKey];

          return (
            <motion.div
              key={factorKey}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-display font-semibold text-charcoal flex items-center gap-2">
                      {definition.name}
                      <Tooltip content={definition.description}>
                        <Info className="w-4 h-4 text-charcoal/40 cursor-help" />
                      </Tooltip>
                    </h4>
                  </div>
                  <div className="text-right text-sm text-charcoal/60">
                    Gewicht: {factor.weight}%
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <SliderInput
                    value={factor.weight}
                    onChange={(v) => updateFactor(factorKey, 'weight', v)}
                    min={0}
                    max={50}
                    label="Gewichtung"
                    formatValue={(v) => `${v}%`}
                  />
                  <SliderInput
                    value={factor.score}
                    onChange={(v) => updateFactor(factorKey, 'score', v)}
                    min={0}
                    max={150}
                    label="Score"
                    formatValue={(v) => `${v}%`}
                    leftLabel="Schwach"
                    rightLabel="Exzellent"
                  />
                </div>

                {/* Benchmark for this factor */}
                {showBenchmarks && STARTUP_BENCHMARKS[factorKey] && (
                  <ScoreBenchmark
                    score={factor.score}
                    benchmark={STARTUP_BENCHMARKS[factorKey]}
                    label={`Vergleich: ${definition.name}`}
                    className="mt-4"
                  />
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Result */}
      <Card className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 mb-1">Scorecard-Bewertung</p>
            <CurrencyDisplay
              value={result.value}
              className="text-4xl text-white"
            />
          </div>
          <div className="text-right">
            <p className="text-white/60 mb-1">Confidence</p>
            <span className="text-2xl font-mono">{result.confidence}%</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-sm text-white/70">
            {result.value > baseValuation
              ? `${((result.value / baseValuation - 1) * 100).toFixed(0)}% uber Durchschnitt`
              : `${((1 - result.value / baseValuation) * 100).toFixed(0)}% unter Durchschnitt`}
          </p>
        </div>

        {result.notes.length > 0 && (
          <div className="mt-4">
            <ul className="space-y-1">
              {result.notes.map((note, i) => (
                <li key={i} className="text-sm text-white/70">• {note}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ScorecardMethodPage;
