import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Save, History, Trash2, Clock, FolderOpen } from 'lucide-react';
import { Header, EnhancedSidebar, PageContainer } from '@/components/layout';
import { Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { useStore, generateComparisonMetrics } from '@/store';
import { AnalysisSelector } from './AnalysisSelector';
import { RouteComparison } from './RouteComparison';
import { ScoreRadarComparison } from './ScoreRadarComparison';
import { MetricsTable } from './MetricsTable';
import { NewAnalysisDialog } from '@/components/dialogs/NewAnalysisDialog';
import type { SavedAnalysis, SavedComparison } from '@/types';

export const ComparePage = () => {
  const {
    analyses,
    selectedAnalysisIds,
    removeFromComparison,
    clearComparison,
    canCompare,
    initializeHistory,
    saveComparison,
    loadComparison,
    deleteComparison,
    savedComparisons,
  } = useStore();

  const [activeTab, setActiveTab] = React.useState('route');
  const [showNewAnalysisDialog, setShowNewAnalysisDialog] = React.useState(false);
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = React.useState(false);
  const [saveName, setSaveName] = React.useState('');
  const [saveNotes, setSaveNotes] = React.useState('');

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

  // Handle saving comparison
  const handleSaveComparison = () => {
    if (!saveName.trim()) return;
    try {
      saveComparison(saveName.trim(), saveNotes.trim() || undefined);
      setSaveName('');
      setSaveNotes('');
      setShowSaveDialog(false);
    } catch (error) {
      console.error('Failed to save comparison:', error);
    }
  };

  // Handle loading comparison
  const handleLoadComparison = (id: string) => {
    loadComparison(id);
    setShowHistoryPanel(false);
  };

  // Handle deleting comparison
  const handleDeleteComparison = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteComparison(id);
  };

  // Get analysis names for a saved comparison
  const getComparisonAnalysisNames = (comparison: SavedComparison): string[] => {
    return comparison.analysisIds
      .map((id) => analyses.find((a) => a.id === id)?.name)
      .filter((name): name is string => !!name);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-display-sm text-charcoal mb-2">
                Szenario-Vergleich
              </h1>
              <p className="text-charcoal/60">
                Vergleiche verschiedene Analysen, um die beste Strategie zu finden.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* History Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistoryPanel(!showHistoryPanel)}
                className="flex items-center gap-2"
              >
                <History className="w-4 h-4" />
                <span>Verlauf</span>
                {savedComparisons.length > 0 && (
                  <span className="bg-navy/10 text-navy text-xs px-1.5 py-0.5 rounded-full">
                    {savedComparisons.length}
                  </span>
                )}
              </Button>
              {/* Save Button - only show when comparison is active */}
              {canCompare() && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowSaveDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Speichern</span>
                </Button>
              )}
            </div>
          </div>
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

        {/* Save Comparison Dialog */}
        <AnimatePresence>
          {showSaveDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowSaveDialog(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              >
                <h3 className="text-lg font-semibold text-charcoal mb-4">
                  Vergleich speichern
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal/70 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      placeholder="z.B. Bootstrap vs Investor Vergleich"
                      className="w-full px-3 py-2 border border-charcoal/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/30"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal/70 mb-1">
                      Notizen (optional)
                    </label>
                    <textarea
                      value={saveNotes}
                      onChange={(e) => setSaveNotes(e.target.value)}
                      placeholder="Zusätzliche Notizen zum Vergleich..."
                      rows={3}
                      className="w-full px-3 py-2 border border-charcoal/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/30 resize-none"
                    />
                  </div>
                  <div className="text-sm text-charcoal/60">
                    Ausgewählte Analysen: {selectedAnalyses.map((a) => a.name).join(', ')}
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="ghost" onClick={() => setShowSaveDialog(false)}>
                    Abbrechen
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSaveComparison}
                    disabled={!saveName.trim()}
                  >
                    Speichern
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Panel */}
        <AnimatePresence>
          {showHistoryPanel && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-xl z-40 overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-charcoal/10 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-charcoal">
                  Gespeicherte Vergleiche
                </h3>
                <button
                  onClick={() => setShowHistoryPanel(false)}
                  className="p-2 hover:bg-charcoal/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-charcoal/60" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {savedComparisons.length === 0 ? (
                  <div className="text-center py-12">
                    <FolderOpen className="w-12 h-12 text-charcoal/20 mx-auto mb-3" />
                    <p className="text-charcoal/60">
                      Noch keine Vergleiche gespeichert
                    </p>
                    <p className="text-sm text-charcoal/40 mt-1">
                      Speichere einen Vergleich, um später darauf zuzugreifen
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedComparisons.map((comparison) => (
                      <motion.div
                        key={comparison.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border border-charcoal/10 rounded-xl hover:border-navy/30 hover:bg-navy/5 transition-colors cursor-pointer group"
                        onClick={() => handleLoadComparison(comparison.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-charcoal">
                            {comparison.name}
                          </h4>
                          <button
                            onClick={(e) => handleDeleteComparison(comparison.id, e)}
                            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded transition-all"
                            title="Löschen"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-charcoal/50 mb-2">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(comparison.createdAt)}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {getComparisonAnalysisNames(comparison).map((name, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-navy/10 text-navy px-2 py-0.5 rounded-full"
                            >
                              {name}
                            </span>
                          ))}
                          {comparison.analysisIds.length > getComparisonAnalysisNames(comparison).length && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                              {comparison.analysisIds.length - getComparisonAnalysisNames(comparison).length} gelöscht
                            </span>
                          )}
                        </div>
                        {comparison.notes && (
                          <p className="text-xs text-charcoal/60 mt-2 line-clamp-2">
                            {comparison.notes}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Backdrop for history panel */}
        <AnimatePresence>
          {showHistoryPanel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-30"
              onClick={() => setShowHistoryPanel(false)}
            />
          )}
        </AnimatePresence>
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
