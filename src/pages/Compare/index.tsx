import * as React from 'react';
import { motion } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { Header, EnhancedSidebar, PageContainer } from '@/components/layout';
import { Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { useStore, generateComparisonMetrics } from '@/store';
import { AnalysisSelector } from './AnalysisSelector';
import { RouteComparison } from './RouteComparison';
import { ScoreRadarComparison } from './ScoreRadarComparison';
import { MetricsTable } from './MetricsTable';
import { NewAnalysisDialog } from '@/components/dialogs/NewAnalysisDialog';
import type { SavedAnalysis } from '@/types';

export const ComparePage = () => {
  const {
    analyses,
    selectedAnalysisIds,
    removeFromComparison,
    clearComparison,
    canCompare,
    initializeHistory,
  } = useStore();

  const [activeTab, setActiveTab] = React.useState('route');
  const [showNewAnalysisDialog, setShowNewAnalysisDialog] = React.useState(false);

  // Initialize history on mount
  React.useEffect(() => {
    initializeHistory();
  }, [initializeHistory]);

  // Get selected analyses
  const selectedAnalyses = React.useMemo(
    () => analyses.filter((a) => selectedAnalysisIds.includes(a.id)),
    [analyses, selectedAnalysisIds]
  );

  // Generate comparison metrics
  const metrics = React.useMemo(
    () => (selectedAnalyses.length >= 2 ? generateComparisonMetrics(selectedAnalyses) : []),
    [selectedAnalyses]
  );

  const showSelector = !canCompare();

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <EnhancedSidebar />

      <PageContainer withSidebar maxWidth="wide">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-display-sm text-charcoal mb-2">
            Szenario-Vergleich
          </h1>
          <p className="text-charcoal/60">
            Vergleiche verschiedene Analysen, um die beste Strategie zu finden.
          </p>
        </motion.div>

        {showSelector ? (
          <AnalysisSelector />
        ) : (
          <>
            {/* Selected Analyses Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-4 shadow-soft mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-charcoal/60">
                  Ausgewahlte Analysen ({selectedAnalyses.length}/4)
                </h2>
                <Button variant="ghost" size="sm" onClick={clearComparison}>
                  Alle entfernen
                </Button>
              </div>

              <div className="flex flex-wrap gap-3">
                {selectedAnalyses.map((analysis, index) => (
                  <AnalysisChip
                    key={analysis.id}
                    analysis={analysis}
                    index={index}
                    onRemove={() => removeFromComparison(analysis.id)}
                  />
                ))}

                {selectedAnalyses.length < 4 && (
                  <button
                    onClick={() => setShowNewAnalysisDialog(true)}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-navy/20 rounded-xl text-charcoal/60 hover:border-navy/40 hover:text-navy transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Weitere hinzufugen</span>
                  </button>
                )}
              </div>
            </motion.div>

            {/* Comparison Content */}
            <Tabs value={activeTab} onChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="route">Route-Empfehlung</TabsTrigger>
                <TabsTrigger value="scores">Score-Vergleich</TabsTrigger>
                <TabsTrigger value="metrics">Alle Metriken</TabsTrigger>
              </TabsList>

              <TabsContent value="route">
                <RouteComparison analyses={selectedAnalyses} />
              </TabsContent>

              <TabsContent value="scores">
                <ScoreRadarComparison analyses={selectedAnalyses} />
              </TabsContent>

              <TabsContent value="metrics">
                <MetricsTable metrics={metrics} analyses={selectedAnalyses} />
              </TabsContent>
            </Tabs>
          </>
        )}

        <NewAnalysisDialog
          open={showNewAnalysisDialog}
          onClose={() => setShowNewAnalysisDialog(false)}
        />
      </PageContainer>
    </div>
  );
};

// Analysis Chip Component
interface AnalysisChipProps {
  analysis: SavedAnalysis;
  index: number;
  onRemove: () => void;
}

const CHIP_COLORS = [
  'bg-navy/10 border-navy/30',
  'bg-gold/10 border-gold/30',
  'bg-sage/10 border-sage/30',
  'bg-red-100 border-red-300',
];

const AnalysisChip = ({ analysis, index, onRemove }: AnalysisChipProps) => (
  <div
    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${CHIP_COLORS[index]}`}
  >
    <div
      className="w-3 h-3 rounded-full"
      style={{
        backgroundColor:
          index === 0
            ? '#1e3a5f'
            : index === 1
            ? '#d4af37'
            : index === 2
            ? '#7c9a8a'
            : '#e74c3c',
      }}
    />
    <span className="text-sm font-medium text-navy">{analysis.name}</span>
    <button
      onClick={onRemove}
      className="p-1 hover:bg-navy/10 rounded transition-colors"
    >
      <X className="w-3 h-3 text-charcoal/60" />
    </button>
  </div>
);

export default ComparePage;
