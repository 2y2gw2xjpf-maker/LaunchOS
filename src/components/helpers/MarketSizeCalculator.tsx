import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calculator,
  TrendingUp,
  Info,
} from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import type { MarketSize } from '@/types';

const REGION_OPTIONS = [
  { value: 'DACH', label: 'DACH' },
  { value: 'EU', label: 'Europa' },
  { value: 'Global', label: 'Global' },
];

interface MarketSizeCalculatorProps {
  open: boolean;
  onClose: () => void;
  onComplete: (tam: MarketSize, sam: MarketSize, som: MarketSize) => void;
}

export const MarketSizeCalculator = ({
  open,
  onClose,
  onComplete,
}: MarketSizeCalculatorProps) => {
  const [step, setStep] = React.useState(0);
  const [methodology, setMethodology] = React.useState<'top-down' | 'bottom-up'>('bottom-up');
  const [data, setData] = React.useState({
    // Top-down
    totalMarket: 0,
    targetSegmentPercent: 10,
    reachablePercent: 5,

    // Bottom-up
    totalCustomers: 0,
    averagePrice: 0,
    purchaseFrequency: 12, // per year
    targetablePercent: 30,
    capturePercent: 5,

    // Common
    region: 'DACH',
    currency: 'EUR' as const,
  });

  const steps = [
    { id: 'methodology', title: 'Methode wählen' },
    { id: 'inputs', title: 'Daten eingeben' },
    { id: 'refinement', title: 'Ergebnis verfeinern' },
    { id: 'result', title: 'Ergebnis prüfen' },
  ];

  // Calculate market sizes
  const calculateMarkets = () => {
    let tam = 0;
    let sam = 0;
    let som = 0;

    if (methodology === 'top-down') {
      tam = data.totalMarket;
      sam = tam * (data.targetSegmentPercent / 100);
      som = sam * (data.reachablePercent / 100);
    } else {
      tam = data.totalCustomers * data.averagePrice * data.purchaseFrequency;
      sam = tam * (data.targetablePercent / 100);
      som = sam * (data.capturePercent / 100);
    }

    return { tam, sam, som };
  };

  const { tam, sam, som } = calculateMarkets();

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `€${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `€${(value / 1000).toFixed(0)}K`;
    }
    return `€${value.toFixed(0)}`;
  };

  const handleComplete = () => {
    const year = new Date().getFullYear();
    const createMarketSize = (value: number, method: string): MarketSize => ({
      value,
      currency: data.currency,
      year,
      source: methodology === 'top-down' ? 'Branchenreport / Schätzung' : 'Bottom-up Berechnung',
      methodology: method,
    });

    onComplete(
      createMarketSize(tam, `TAM: Gesamtmarkt ${data.region}`),
      createMarketSize(sam, `SAM: ${data.targetablePercent}% des TAM erreichbar`),
      createMarketSize(som, `SOM: ${data.capturePercent}% Marktanteil in 3 Jahren`)
    );
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[70]"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-white rounded-2xl shadow-2xl z-[70] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-navy" />
            </div>
            <div>
              <h2 className="font-display text-lg text-navy">Marktgröße berechnen</h2>
              <p className="text-sm text-charcoal/60">TAM / SAM / SOM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-navy/5 transition-colors"
          >
            <X className="w-5 h-5 text-charcoal/60" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step ? 'bg-navy' : 'bg-navy/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-medium text-navy">Welche Methode möchtest du nutzen?</h3>

              <div className="grid gap-4">
                <button
                  onClick={() => setMethodology('bottom-up')}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all',
                    methodology === 'bottom-up'
                      ? 'border-navy bg-navy/5'
                      : 'border-navy/10 hover:border-navy/30'
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-navy" />
                    <span className="font-medium text-navy">Bottom-Up (Empfohlen)</span>
                  </div>
                  <p className="text-sm text-charcoal/60">
                    Basierend auf Anzahl potenzieller Kunden × Preis × Kauffrequenz. Glaubwürdiger
                    für Investoren.
                  </p>
                </button>

                <button
                  onClick={() => setMethodology('top-down')}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all',
                    methodology === 'top-down'
                      ? 'border-navy bg-navy/5'
                      : 'border-navy/10 hover:border-navy/30'
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Calculator className="w-5 h-5 text-navy" />
                    <span className="font-medium text-navy">Top-Down</span>
                  </div>
                  <p className="text-sm text-charcoal/60">
                    Basierend auf Branchenberichten und prozentualer Eingrenzung. Schneller, aber
                    weniger präzise.
                  </p>
                </button>
              </div>
            </motion.div>
          )}

          {step === 1 && methodology === 'bottom-up' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-medium text-navy">Bottom-Up Daten</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Anzahl potenzieller Kunden (weltweit/regional)
                  </label>
                  <Input
                    type="number"
                    value={data.totalCustomers || ''}
                    onChange={(e) =>
                      setData({ ...data, totalCustomers: Number(e.target.value) })
                    }
                    placeholder="z.B. 500000"
                  />
                  <p className="text-xs text-charcoal/60 mt-1">
                    Wie viele Unternehmen/Personen könnten theoretisch dein Produkt nutzen?
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Durchschnittlicher Preis pro Transaktion (€)
                  </label>
                  <Input
                    type="number"
                    value={data.averagePrice || ''}
                    onChange={(e) =>
                      setData({ ...data, averagePrice: Number(e.target.value) })
                    }
                    placeholder="z.B. 99"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Kauffrequenz pro Jahr
                  </label>
                  <Input
                    type="number"
                    value={data.purchaseFrequency || ''}
                    onChange={(e) =>
                      setData({ ...data, purchaseFrequency: Number(e.target.value) })
                    }
                    placeholder="z.B. 12 (monatlich)"
                  />
                </div>

                <Select
                  label="Region"
                  value={data.region}
                  onChange={(value) => setData({ ...data, region: value })}
                  options={REGION_OPTIONS}
                  placeholder="Region wählen"
                />
              </div>
            </motion.div>
          )}

          {step === 1 && methodology === 'top-down' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-medium text-navy">Top-Down Daten</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Gesamtmarktgröße (TAM) in €
                  </label>
                  <Input
                    type="number"
                    value={data.totalMarket || ''}
                    onChange={(e) =>
                      setData({ ...data, totalMarket: Number(e.target.value) })
                    }
                    placeholder="z.B. 50000000000"
                  />
                  <p className="text-xs text-charcoal/60 mt-1">
                    Aus Branchenberichten (Statista, Gartner, etc.)
                  </p>
                </div>

                <Select
                  label="Region"
                  value={data.region}
                  onChange={(value) => setData({ ...data, region: value })}
                  options={REGION_OPTIONS}
                  placeholder="Region wählen"
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-medium text-navy">SAM & SOM definieren</h3>

              <div className="space-y-4">
                {methodology === 'bottom-up' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-navy mb-2">
                        SAM: Wie viel % des TAM kannst du realistisch erreichen?
                      </label>
                      <Input
                        type="number"
                        value={data.targetablePercent || ''}
                        onChange={(e) =>
                          setData({ ...data, targetablePercent: Number(e.target.value) })
                        }
                        placeholder="z.B. 30"
                        max={100}
                      />
                      <p className="text-xs text-charcoal/60 mt-1">
                        Berücksichtige Geografie, Sprache, Vertriebskanäle
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy mb-2">
                        SOM: Welchen Marktanteil kannst du in 3-5 Jahren erreichen?
                      </label>
                      <Input
                        type="number"
                        value={data.capturePercent || ''}
                        onChange={(e) =>
                          setData({ ...data, capturePercent: Number(e.target.value) })
                        }
                        placeholder="z.B. 5"
                        max={100}
                      />
                      <p className="text-xs text-charcoal/60 mt-1">
                        Sei realistisch - 1-10% ist für die meisten Startups erreichbar
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-navy mb-2">
                        SAM: Welcher % des Marktes ist dein Zielsegment?
                      </label>
                      <Input
                        type="number"
                        value={data.targetSegmentPercent || ''}
                        onChange={(e) =>
                          setData({ ...data, targetSegmentPercent: Number(e.target.value) })
                        }
                        placeholder="z.B. 10"
                        max={100}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy mb-2">
                        SOM: Welchen % des SAM kannst du realistisch erreichen?
                      </label>
                      <Input
                        type="number"
                        value={data.reachablePercent || ''}
                        onChange={(e) =>
                          setData({ ...data, reachablePercent: Number(e.target.value) })
                        }
                        placeholder="z.B. 5"
                        max={100}
                      />
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-medium text-navy">Deine Marktgröße</h3>

              <div className="space-y-4">
                <div className="bg-navy/5 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-navy">TAM (Total Addressable Market)</span>
                    <span className="text-2xl font-bold text-navy">{formatCurrency(tam)}</span>
                  </div>
                  <p className="text-sm text-charcoal/60">Gesamtmarkt für dein Produkt</p>
                </div>

                <div className="bg-sage/10 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sage">SAM (Serviceable Addressable Market)</span>
                    <span className="text-2xl font-bold text-sage">{formatCurrency(sam)}</span>
                  </div>
                  <p className="text-sm text-charcoal/60">Der Teil, den du realistisch erreichen kannst</p>
                </div>

                <div className="bg-gold/10 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gold">SOM (Serviceable Obtainable Market)</span>
                    <span className="text-2xl font-bold text-gold">{formatCurrency(som)}</span>
                  </div>
                  <p className="text-sm text-charcoal/60">
                    Dein realistisches Umsatzziel in 3-5 Jahren
                  </p>
                </div>
              </div>

              <div className="bg-cream rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-navy flex-shrink-0 mt-0.5" />
                <div className="text-sm text-charcoal/70">
                  <p className="font-medium text-navy mb-1">Tipp für Investoren</p>
                  <p>
                    Investoren schauen vor allem auf das SOM - ist es groß genug für eine
                    interessante Return-Möglichkeit? Mindestens €50M SOM wird oft erwartet.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-navy/10 bg-cream/50">
          {step > 0 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Zurück
            </Button>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
          )}

          {step < steps.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} className="flex-1 gap-2">
              Weiter
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleComplete} className="flex-1 gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Übernehmen
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
