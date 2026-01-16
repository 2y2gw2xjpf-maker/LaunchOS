import * as React from 'react';
import { motion } from 'framer-motion';
import { Info, Calculator } from 'lucide-react';
import { useStore } from '@/store';
import { Card, Tooltip } from '@/components/ui';
import { CurrencyInput, NumberInput, SliderInput } from '@/components/forms';
import { CurrencyDisplay } from '@/components/common';
import { MethodApplicabilityWarning } from '@/components/results';
import { calculateVCMethod } from '@/lib/calculations';

export const VCMethodPage = () => {
  const { vcMethodInput, setVCMethodInput, addMethodResult, wizardData } = useStore();
  const result = calculateVCMethod(vcMethodInput);

  // Check if user has a clear exit scenario
  const hasExitScenario = wizardData?.goals?.exitGoal && wizardData.goals.exitGoal !== 'lifestyle';

  React.useEffect(() => {
    addMethodResult(result);
  }, [vcMethodInput]);

  return (
    <div className="space-y-8">
      {/* Method Applicability Warning */}
      <MethodApplicabilityWarning
        method="vcMethod"
        stage={wizardData?.projectBasics?.stage}
        hasExitScenario={hasExitScenario}
      />

      {/* Info Card */}
      <Card className="p-6 bg-purple-50/50 border-purple-100">
        <h3 className="font-display font-semibold text-charcoal mb-2 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-purple-600" />
          Über die VC-Methode
        </h3>
        <p className="text-charcoal/70 mb-3">
          Die VC-Methode rechnet vom erwarteten Exit-Wert zuruck. Sie zeigt, welche
          Pre-Money Bewertung ein Investor akzeptieren wurde, um seine Rendite-Erwartung
          zu erreichen.
        </p>
        <div className="bg-white/50 p-3 rounded-lg text-sm">
          <p className="font-mono text-charcoal/80">
            <strong>Formel:</strong> Pre-Money = (Exit-Wert / ROI-Multiple) - Investment
          </p>
        </div>
      </Card>

      {/* Inputs */}
      <div className="space-y-6">
        <Card className="p-6">
          <h4 className="font-display font-semibold text-charcoal mb-4 flex items-center gap-2">
            Exit-Annahmen
            <Tooltip content="Wie viel glaubst du wird das Unternehmen beim Exit wert sein?">
              <Info className="w-4 h-4 text-charcoal/40 cursor-help" />
            </Tooltip>
          </h4>

          <div className="grid md:grid-cols-2 gap-6">
            <CurrencyInput
              value={vcMethodInput.expectedExitValue}
              onChange={(v) => setVCMethodInput({ expectedExitValue: v || 0 })}
              label="Erwarteter Exit-Wert"
              hint="Typisch: 10-100 Mio. € fur erfolgreichen Exit"
            />
            <NumberInput
              value={vcMethodInput.yearsToExit}
              onChange={(v) => setVCMethodInput({ yearsToExit: v || 5 })}
              label="Jahre bis Exit"
              min={1}
              max={15}
              suffix="Jahre"
              showControls
            />
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-display font-semibold text-charcoal mb-4 flex items-center gap-2">
            Investor-Perspektive
            <Tooltip content="Welche Rendite erwartet ein typischer VC?">
              <Info className="w-4 h-4 text-charcoal/40 cursor-help" />
            </Tooltip>
          </h4>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <SliderInput
              value={vcMethodInput.expectedReturn}
              onChange={(v) => setVCMethodInput({ expectedReturn: v })}
              min={3}
              max={30}
              label="Erwarteter Return Multiple"
              formatValue={(v) => `${v}x`}
            />
            <CurrencyInput
              value={vcMethodInput.investmentAmount}
              onChange={(v) => setVCMethodInput({ investmentAmount: v || 0 })}
              label="Investment-Betrag"
              hint="Wie viel Kapital suchst du?"
            />
          </div>

          <SliderInput
            value={vcMethodInput.dilutionAssumption || 20}
            onChange={(v) => setVCMethodInput({ dilutionAssumption: v })}
            min={0}
            max={60}
            label="Erwartete Verdunnung"
            formatValue={(v) => `${v}%`}
            leftLabel="Keine weiteren Runden"
            rightLabel="Mehrere Runden geplant"
          />
        </Card>
      </div>

      {/* Breakdown */}
      {result.breakdown && (
        <Card className="p-6">
          <h4 className="font-display font-semibold text-charcoal mb-4">Berechnung</h4>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-purple-100">
              <span className="text-charcoal/70">Erwarteter Exit-Wert</span>
              <CurrencyDisplay value={result.breakdown.expectedExitValue} animated={false} />
            </div>
            <div className="flex justify-between py-2 border-b border-purple-100">
              <span className="text-charcoal/70">Post-Money Bewertung (heute)</span>
              <CurrencyDisplay value={result.breakdown.postMoneyValuation} animated={false} />
            </div>
            {result.breakdown.dilutionAdjustment > 0 && (
              <div className="flex justify-between py-2 border-b border-purple-100 text-pink-600">
                <span>Verdünnungs-Abzug</span>
                <span>-<CurrencyDisplay value={result.breakdown.dilutionAdjustment} animated={false} /></span>
              </div>
            )}
            <div className="flex justify-between py-2 font-semibold">
              <span className="text-purple-700">Pre-Money Bewertung</span>
              <CurrencyDisplay value={result.breakdown.preMoneyValuation} animated={false} className="text-purple-700" />
            </div>
            <div className="flex justify-between py-2 text-sm text-charcoal/60">
              <span>Implizierter Anteil fur Investor</span>
              <span>{result.breakdown.impliedOwnership.toFixed(1)}%</span>
            </div>
          </div>
        </Card>
      )}

      {/* Result */}
      <Card className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 mb-1">VC-Methode Pre-Money</p>
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

export default VCMethodPage;
