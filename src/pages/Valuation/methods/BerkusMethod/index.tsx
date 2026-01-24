import * as React from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { useStore } from '@/store';
import { Card, Tooltip } from '@/components/ui';
import { SliderInput } from '@/components/forms';
import { CurrencyDisplay } from '@/components/common';
import { MethodApplicabilityWarning } from '@/components/results';
import { calculateBerkus, BERKUS_FACTOR_DEFINITIONS } from '@/lib/calculations';
import type { BerkusFactors } from '@/types';

const factors: (keyof BerkusFactors)[] = [
  'soundIdea',
  'prototype',
  'qualityTeam',
  'strategicRelations',
  'productRollout',
];

export const BerkusMethodPage = () => {
  const { berkusFactors, setBerkusFactors, addMethodResult, wizardData } = useStore();
  const result = calculateBerkus(berkusFactors);

  // Determine if startup has revenue (from wizard data if available)
  const hasRevenue = wizardData?.projectBasics?.hasRevenue || false;

  React.useEffect(() => {
    addMethodResult(result);
  }, [berkusFactors]);

  return (
    <div className="space-y-8">
      {/* Method Applicability Warning */}
      <MethodApplicabilityWarning
        method="berkus"
        hasRevenue={hasRevenue}
        stage={wizardData?.projectBasics?.stage}
      />

      {/* Info Card */}
      <Card className="p-6 bg-purple-50/50 border-purple-100">
        <h3 className="font-display font-semibold text-charcoal mb-2">Über die Berkus-Methode</h3>
        <p className="text-charcoal/70">
          Die Berkus-Methode bewertet Pre-Revenue Startups anhand von 5 Risiko-Faktoren.
          Jeder Faktor kann bis zu 500.000 € zum Wert beitragen, fur eine maximale
          Bewertung von 2,5 Mio. €.
        </p>
      </Card>

      {/* Factors */}
      <div className="space-y-6">
        {factors.map((factorKey, index) => {
          const definition = BERKUS_FACTOR_DEFINITIONS[factorKey];
          const value = berkusFactors[factorKey];
          const contribution = (value / 100) * 500000;

          return (
            <motion.div
              key={factorKey}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
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
                    <p className="text-sm text-charcoal/60 mt-1">{definition.description}</p>
                  </div>
                  <div className="text-right">
                    <CurrencyDisplay
                      value={contribution}
                      className="text-xl text-purple-600"
                    />
                    <p className="text-xs text-charcoal/50">von max. 500K €</p>
                  </div>
                </div>

                <SliderInput
                  value={value}
                  onChange={(v) => setBerkusFactors({ [factorKey]: v })}
                  min={0}
                  max={100}
                  formatValue={(v) => `${v}%`}
                />

                {/* Scoring Guide */}
                <div className="mt-4 grid grid-cols-5 gap-1 text-xs">
                  {Object.entries(definition.scoring).map(([score]) => (
                    <div
                      key={score}
                      className={`p-2 rounded text-center ${
                        Math.abs(value - parseInt(score)) < 15
                          ? 'bg-purple-100 text-purple-700 font-medium'
                          : 'bg-gray-100 text-charcoal/50'
                      }`}
                    >
                      {score}%
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Result */}
      <Card className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 mb-1">Berkus-Bewertung</p>
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

        {result.notes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
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

export default BerkusMethodPage;
