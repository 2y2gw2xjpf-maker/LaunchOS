import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Briefcase, BarChart3, LineChart, Download, RefreshCw } from 'lucide-react';
import { Header, EnhancedSidebar, PageContainer } from '@/components/layout';
import { Card, Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { CurrencyDisplay } from '@/components/common';
import { ConfidenceIndicator, ValueRange } from '@/components/results';
import { ValuationChart, MethodComparisonChart } from '@/components/charts';
import { useStore } from '@/store';
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
  const { selectedTier, methodResults, activeMethod, setActiveMethod, resetValuation } = useStore();
  const [showResults, setShowResults] = React.useState(false);

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
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Methods Column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="font-display text-display-sm text-navy mb-2">
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
                          <span className="w-2 h-2 rounded-full bg-sage" />
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
                <h3 className="font-display font-semibold text-navy mb-4">Ubersicht</h3>

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
                      <span className="font-mono font-semibold text-navy">
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
                  <h3 className="font-display font-semibold text-navy mb-4">Ergebnisse</h3>
                  <div className="space-y-3">
                    {validResults.map((result) => {
                      const methodLabel = methods.find((m) => m.id === result.method)?.label || result.method.replace('_', ' ');
                      return (
                      <div
                        key={result.method}
                        className="flex items-center justify-between py-2 border-b border-navy/10 last:border-0"
                      >
                        <span className="text-charcoal/70">
                          {methodLabel}
                        </span>
                        <CurrencyDisplay
                          value={result.value}
                          animated={false}
                          compact
                          className="text-navy"
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
                  <h3 className="font-display font-semibold text-navy mb-4">Vergleich</h3>
                  <ValuationChart results={validResults} className="h-[200px]" />
                </Card>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  variant="gold"
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
