import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Briefcase, Download, RefreshCw, Building2, AlertCircle } from 'lucide-react';
import { Header, EnhancedSidebar, PageContainer } from '@/components/layout';
import { Card, Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { CurrencyDisplay } from '@/components/common';
import { ConfidenceIndicator, ValueRange } from '@/components/results';
import { ValuationChart } from '@/components/charts';
import { ValuationDisclaimer } from '@/components/disclaimers';
import { MethodologyExplainer } from '@/components/valuation';
import { useStore } from '@/store';
import { useVentureContext } from '@/contexts/VentureContext';
import { BerkusMethodPage } from './methods/BerkusMethod';
import { ScorecardMethodPage } from './methods/ScorecardMethod';
import { VCMethodPage } from './methods/VCMethod';
import type { ValuationMethod } from '@/types';

const methods: { id: ValuationMethod; label: string; icon: typeof Calculator }[] = [
  { id: 'berkus', label: 'Berkus', icon: Calculator },
  { id: 'scorecard', label: 'Scorecard', icon: TrendingUp },
  { id: 'vc_method', label: 'VC Method', icon: Briefcase },
];

export const ValuationPage = () => {
  const navigate = useNavigate();
  const { activeVenture } = useVentureContext();
  const { selectedTier, methodResults, activeMethod, setActiveMethod, resetValuation } = useStore();
  const [_showResults, _setShowResults] = React.useState(false); // Reserved for future use

  // Prüfe ob Tier-Daten vorhanden sind
  const hasTierData = activeVenture?.tierData?.completed_at !== null && activeVenture?.tierData?.completed_at !== undefined;

  // Berechne Confidence-Bonus basierend auf Tier-Level
  const tierConfidenceBonus = React.useMemo(() => {
    const tierLevel = activeVenture?.tierLevel || 1;
    // Tier 1: 0%, Tier 2: +5%, Tier 3: +10%, Tier 4: +15%
    return (tierLevel - 1) * 5;
  }, [activeVenture?.tierLevel]);

  // Redirect if no tier selected
  React.useEffect(() => {
    if (!selectedTier) {
      navigate('/tier-selection');
    }
  }, [selectedTier, navigate]);

  // Calculate aggregated values
  const validResults = methodResults.filter((r) => r.value > 0);
  const aggregatedValue = React.useMemo(() => {
    if (validResults.length === 0) return { low: 0, mid: 0, high: 0 };

    const values = validResults.map((r) => r.value).sort((a, b) => a - b);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;

    return {
      low: values[0],
      mid: mean,
      high: values[values.length - 1],
    };
  }, [validResults]);

  const averageConfidence = React.useMemo(() => {
    if (validResults.length === 0) return 0;
    return Math.round(
      validResults.reduce((sum, r) => sum + r.confidence, 0) / validResults.length
    );
  }, [validResults]);

  const renderMethod = () => {
    switch (activeMethod) {
      case 'berkus':
        return <BerkusMethodPage />;
      case 'scorecard':
        return <ScorecardMethodPage />;
      case 'vc_method':
        return <VCMethodPage />;
      default:
        return <BerkusMethodPage />;
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <EnhancedSidebar />
      <PageContainer withSidebar maxWidth="wide">
        {/* Tier Data Info Banner */}
        {activeVenture && hasTierData && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-900">
                  Bewerte: <span className="font-semibold">{activeVenture.name}</span>
                </p>
                <p className="text-xs text-purple-700/70">
                  {activeVenture.tierData?.category} • {activeVenture.tierData?.stage}
                  {tierConfidenceBonus > 0 && ` • +${tierConfidenceBonus}% Genauigkeit durch Tier ${activeVenture.tierLevel}`}
                </p>
              </div>
              <Link
                to="/venture/data-input"
                className="text-sm text-purple-600 hover:text-purple-700 underline"
              >
                Daten bearbeiten
              </Link>
            </div>
          </motion.div>
        )}

        {/* Missing Tier Data Warning */}
        {activeVenture && !hasTierData && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900">
                  Für genauere Bewertungen: Venture-Daten ausfüllen
                </p>
                <p className="text-xs text-amber-700/70 mt-1">
                  Die Genauigkeit deiner Bewertung steigt um bis zu 15% mit vollständigen Daten.
                </p>
              </div>
              <Link
                to="/venture/data-input"
                className="text-sm font-medium text-amber-700 hover:text-amber-800 underline whitespace-nowrap"
              >
                Daten eingeben
              </Link>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Methods Column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="font-display text-display-sm text-charcoal mb-2">
                Startup-Bewertung
              </h1>
              <p className="text-charcoal/60">
                Nutze verschiedene Methoden, um den Wert deines Startups zu schatzen.
              </p>
            </motion.div>

            {/* Method Tabs */}
            <Tabs value={activeMethod} onChange={(v) => setActiveMethod(v as ValuationMethod)}>
              <TabsList className="mb-6">
                {methods.map((method) => {
                  const Icon = method.icon;
                  const hasResult = methodResults.some((r) => r.method === method.id);
                  return (
                    <TabsTrigger key={method.id} value={method.id}>
                      <span className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {method.label}
                        {hasResult && (
                          <span className="w-2 h-2 rounded-full bg-purple-500" />
                        )}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {methods.map((method) => (
                <TabsContent key={method.id} value={method.id}>
                  {renderMethod()}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Results Summary Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Quick Summary */}
              <Card className="p-6">
                <h3 className="font-display font-semibold text-charcoal mb-4">Übersicht</h3>

                {validResults.length > 0 ? (
                  <>
                    <ValueRange
                      low={aggregatedValue.low}
                      mid={aggregatedValue.mid}
                      high={aggregatedValue.high}
                      className="mb-6"
                    />

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-charcoal/60">Methoden berechnet</span>
                      <span className="font-mono font-semibold text-purple-600">
                        {validResults.length} / {methods.length}
                      </span>
                    </div>

                    <ConfidenceIndicator
                      value={averageConfidence}
                      label="Avg. Confidence"
                      size="sm"
                    />
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Calculator className="w-12 h-12 text-charcoal/20 mx-auto mb-3" />
                    <p className="text-charcoal/50">
                      Fullst die Methoden aus, um deine Bewertung zu sehen
                    </p>
                  </div>
                )}
              </Card>

              {/* Method Results */}
              {validResults.length > 0 && (
                <Card className="p-6">
                  <h3 className="font-display font-semibold text-charcoal mb-4">Ergebnisse</h3>
                  <div className="space-y-3">
                    {validResults.map((result) => {
                      const methodLabel = methods.find((m) => m.id === result.method)?.label || result.method.replace('_', ' ');
                      return (
                      <div
                        key={result.method}
                        className="flex items-center justify-between py-2 border-b border-purple-100 last:border-0"
                      >
                        <span className="text-charcoal/70">
                          {methodLabel}
                        </span>
                        <CurrencyDisplay
                          value={result.value}
                          animated={false}
                          compact
                          className="text-purple-600"
                        />
                      </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* Chart */}
              {validResults.length >= 2 && (
                <Card className="p-6">
                  <h3 className="font-display font-semibold text-charcoal mb-4">Vergleich</h3>
                  <ValuationChart results={validResults} className="h-[200px]" />
                </Card>
              )}

              {/* Methodology Explainer */}
              {validResults.length > 0 && (
                <MethodologyExplainer
                  methods={validResults.map((r) => ({
                    id: r.method,
                    name: methods.find((m) => m.id === r.method)?.label || r.method,
                    description: r.notes?.[0] || '',
                    inputs: Object.entries(r.breakdown || {}).map(([k, v]) => ({
                      label: k,
                      value: typeof v === 'number' ? `€${(v / 1000).toFixed(0)}k` : String(v),
                    })),
                    result: {
                      low: Math.round(r.value * 0.7),
                      mid: r.value,
                      high: Math.round(r.value * 1.3),
                    },
                  }))}
                  finalValuation={aggregatedValue}
                  improvements={[
                    'Erste zahlende Kunden erhöhen die Bewertung (+30-50%)',
                    'Höheres Wachstum (>20% MoM) steigert Revenue-Multiples',
                    'Erfahrenes Team mit Track Record erhöht Vertrauen',
                  ]}
                />
              )}

              {/* Disclaimer - IMMER anzeigen wenn Ergebnisse vorhanden */}
              {validResults.length > 0 && (
                <ValuationDisclaimer
                  confidenceScore={averageConfidence}
                  methods={validResults.map((r) => methods.find((m) => m.id === r.method)?.label || r.method)}
                />
              )}

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  variant="primary"
                  className="w-full"
                  disabled={validResults.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export als PDF
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={resetValuation}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Zurucksetzen
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default ValuationPage;
