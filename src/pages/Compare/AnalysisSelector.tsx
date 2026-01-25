import * as React from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Calendar, FlaskConical } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui';
import { useStore } from '@/store';
import { NewAnalysisDialog } from '@/components/dialogs/NewAnalysisDialog';
import { cleanupDuplicateTestAnalyses } from '@/lib/storage';

interface AnalysisSelectorProps {
  onStartComparison?: () => void;
}

export const AnalysisSelector = ({ onStartComparison }: AnalysisSelectorProps) => {
  const [showNewAnalysisDialog, setShowNewAnalysisDialog] = React.useState(false);
  const [isCreatingTest, setIsCreatingTest] = React.useState(false);
  const { analyses, selectedAnalysisIds, toggleInComparison, canCompare, getComparisonCount, isHistoryLoading, createTestAnalyses } = useStore();

  // Auto-create test analyses if none exist with results - only once per session
  const hasAttemptedAutoCreate = React.useRef(false);

  // Check analyses with results
  const analysesWithResults = React.useMemo(
    () => analyses.filter((a) => a.routeResult),
    [analyses]
  );

  React.useEffect(() => {
    // Only attempt cleanup/auto-create once after loading is complete
    if (isHistoryLoading || hasAttemptedAutoCreate.current) {
      return;
    }

    const initTestAnalyses = async () => {
      hasAttemptedAutoCreate.current = true;

      // First, cleanup any duplicate test analyses
      const deletedCount = await cleanupDuplicateTestAnalyses();
      if (deletedCount > 0) {
        console.log('[Compare] Cleaned up', deletedCount, 'duplicate analyses');
      }

      // Then check if we need to create test analyses
      if (analysesWithResults.length < 3) {
        console.log('[Compare] Auto-creating test analyses because only', analysesWithResults.length, 'exist with results');
        await createTestAnalyses();
      }
    };

    initTestAnalyses();
  }, [isHistoryLoading, analysesWithResults.length, createTestAnalyses]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getRouteLabel = (route?: string) => {
    switch (route) {
      case 'bootstrap':
        return 'Bootstrap';
      case 'investor':
        return 'Investor';
      case 'hybrid':
        return 'Hybrid';
      default:
        return 'Keine Empfehlung';
    }
  };

  const getRouteColor = (route?: string) => {
    switch (route) {
      case 'bootstrap':
        return 'bg-sage/20 text-sage';
      case 'investor':
        return 'bg-gold/20 text-gold';
      case 'hybrid':
        return 'bg-navy/20 text-navy';
      default:
        return 'bg-charcoal/10 text-charcoal/60';
    }
  };

  // Debug: Log analysis counts in development
  React.useEffect(() => {
    console.log('[Compare] Analyses loaded:', {
      total: analyses.length,
      withResults: analysesWithResults.length,
      loading: isHistoryLoading,
      analyses: analyses.map(a => ({
        name: a.name,
        hasRouteResult: !!a.routeResult,
        ventureId: a.ventureId
      })),
    });
  }, [analyses, analysesWithResults.length, isHistoryLoading]);

  // Show loading state while history is being loaded
  if (isHistoryLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 shadow-soft text-center"
      >
        <div className="w-16 h-16 rounded-full bg-navy/5 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Calendar className="w-8 h-8 text-navy/40" />
        </div>
        <h2 className="font-display text-xl text-navy mb-2">
          Analysen werden geladen...
        </h2>
        <p className="text-charcoal/60">
          Bitte warte einen Moment.
        </p>
      </motion.div>
    );
  }

  if (analysesWithResults.length < 2) {
    // Check if there are incomplete analyses
    const incompleteCount = analyses.length - analysesWithResults.length;

    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-soft text-center"
        >
          <div className="w-16 h-16 rounded-full bg-navy/5 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-navy/40" />
          </div>
          <h2 className="font-display text-xl text-navy mb-2">
            Nicht genug Analysen zum Vergleichen
          </h2>
          <p className="text-charcoal/60 mb-6 max-w-md mx-auto">
            {incompleteCount > 0 ? (
              <>
                Du hast {incompleteCount} Analyse{incompleteCount > 1 ? 'n' : ''}, aber{' '}
                {incompleteCount > 1 ? 'diese sind' : 'diese ist'} noch nicht abgeschlossen.
                Schliesse mindestens 2 Analysen ab (bis zur Route-Empfehlung), um sie vergleichen zu konnen.
              </>
            ) : (
              <>
                Du benotigst mindestens 2 abgeschlossene Analysen, um einen Vergleich
                durchfuhren zu konnen. Erstelle weitere Analysen, um verschiedene
                Szenarien zu vergleichen.
              </>
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="gold" onClick={() => setShowNewAnalysisDialog(true)}>
              Neue Analyse starten
            </Button>
            {/* Button to create test data - always visible for now */}
            <Button
              variant="outline"
              onClick={async () => {
                setIsCreatingTest(true);
                await createTestAnalyses();
                setIsCreatingTest(false);
              }}
              disabled={isCreatingTest}
              className="flex items-center gap-2"
            >
              <FlaskConical className="w-4 h-4" />
              {isCreatingTest ? 'Erstelle...' : 'Demo-Vergleich testen'}
            </Button>
          </div>
        </motion.div>

        <NewAnalysisDialog
          open={showNewAnalysisDialog}
          onClose={() => setShowNewAnalysisDialog(false)}
          compareMode={true}
        />
      </>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-2xl p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg text-navy">
              Wahle Analysen zum Vergleichen
            </h2>
            <p className="text-sm text-charcoal/60">
              Wahle 2-4 Analysen aus, um sie zu vergleichen
            </p>
          </div>
          <div className="text-sm text-charcoal/60">
            {getComparisonCount()} von 4 ausgewahlt
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {analysesWithResults.map((analysis, index) => {
            const isSelected = selectedAnalysisIds.includes(analysis.id);
            const canSelect = isSelected || getComparisonCount() < 4;

            return (
              <motion.button
                key={analysis.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => canSelect && toggleInComparison(analysis.id)}
                disabled={!canSelect}
                className={cn(
                  'relative p-4 rounded-xl border-2 text-left transition-all',
                  isSelected
                    ? 'border-navy bg-navy/5'
                    : canSelect
                    ? 'border-navy/10 hover:border-navy/30 bg-white'
                    : 'border-navy/10 bg-charcoal/5 opacity-50 cursor-not-allowed'
                )}
              >
                {/* Selection Indicator */}
                <div
                  className={cn(
                    'absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center',
                    isSelected ? 'bg-navy text-white' : 'border-2 border-navy/20'
                  )}
                >
                  {isSelected && <Check className="w-4 h-4" />}
                </div>

                {/* Favorite */}
                {analysis.isFavorite && (
                  <Star className="absolute top-3 left-3 w-4 h-4 text-gold fill-gold" />
                )}

                {/* Content */}
                <div className="pr-8">
                  <h3 className="font-medium text-navy mb-1 truncate">
                    {analysis.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded',
                        getRouteColor(analysis.routeResult?.recommendation)
                      )}
                    >
                      {getRouteLabel(analysis.routeResult?.recommendation)}
                    </span>
                    <span className="text-xs text-charcoal/40">
                      {analysis.routeResult?.confidence}% Konfidenz
                    </span>
                  </div>

                  <div className="text-xs text-charcoal/40">
                    {formatDate(analysis.updatedAt)}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Compare Button */}
      {canCompare() && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <Button variant="gold" size="lg" onClick={onStartComparison}>
            Vergleich starten ({getComparisonCount()} ausgewählt)
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};
