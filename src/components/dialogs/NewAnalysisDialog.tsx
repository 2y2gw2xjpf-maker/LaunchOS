/**
 * New Analysis Dialog
 * 2-Step Dialog:
 * 1. Wähle Venture (existierend oder neu erstellen)
 * 2. Wähle Tier-Level für die Analyse
 */

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Building2,
  ChevronRight,
  Loader2,
  BarChart3,
  ArrowLeft,
  Shield,
  Zap,
  Database,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { useVentureContext } from '@/contexts/VentureContext';
import { useStore, TIER_CONFIGS } from '@/store';
import { cn } from '@/lib/utils/cn';
import type { Venture } from '@/hooks/useVentures';
import type { DataSharingTier } from '@/types';

interface NewAnalysisDialogProps {
  open: boolean;
  onClose: () => void;
  /** If true, dialog is used for selecting analyses to compare (not creating new ones) */
  compareMode?: boolean;
}

type DialogStep = 'venture' | 'tier';

const TIER_ICONS = {
  minimal: Shield,
  basic: Zap,
  detailed: Database,
  full: Lock,
};

export const NewAnalysisDialog = ({ open, onClose, compareMode = false }: NewAnalysisDialogProps) => {
  const navigate = useNavigate();
  const { ventures, isLoading, setActiveVenture } = useVentureContext();
  const {
    setSelectedTier,
    setAcknowledgedPrivacy,
    setWizardData,
    setCurrentStep,
    findAnalysisForVenture,
    toggleInComparison,
    isInComparison,
    restoreAnalysisToStore,
    initializeHistory,
    analyses,
    isHistoryLoading,
  } = useStore();

  const [step, setStep] = React.useState<DialogStep>('venture');
  const [selectedVenture, setSelectedVenture] = React.useState<Venture | null>(null);
  const [isInitializing, setIsInitializing] = React.useState(false);
  const [hasInitialized, setHasInitialized] = React.useState(false);

  // Load history when dialog opens - MUST complete before showing ventures
  React.useEffect(() => {
    if (open && !hasInitialized) {
      setIsInitializing(true);
      initializeHistory().finally(() => {
        setIsInitializing(false);
        setHasInitialized(true);
      });
    }
  }, [open, hasInitialized, initializeHistory]);

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setStep('venture');
      setSelectedVenture(null);
      setHasInitialized(false);
    }
  }, [open]);

  // Debug log - shows after history is loaded
  React.useEffect(() => {
    if (open && hasInitialized) {
      console.log('[NewAnalysisDialog] History loaded:', {
        ventures: ventures.length,
        analyses: analyses.length,
        analysesWithVenture: analyses.filter(a => a.ventureId).map(a => ({
          name: a.name,
          ventureId: a.ventureId,
          hasRouteResult: !!a.routeResult,
        })),
        compareMode,
      });
    }
  }, [open, hasInitialized, ventures.length, analyses, compareMode]);

  // Show loading until history is ready
  const isDataLoading = isLoading || isInitializing || isHistoryLoading || !hasInitialized;

  const availableVentures = ventures;

  const handleSelectVenture = async (venture: Venture) => {
    // Check if venture has an existing analysis with results
    const existingAnalysis = findAnalysisForVenture(venture.id);
    const hasCompletedAnalysis = existingAnalysis && existingAnalysis.routeResult;

    // In compare mode: toggle comparison selection for ventures with completed analyses
    if (compareMode && hasCompletedAnalysis) {
      toggleInComparison(existingAnalysis.id);
      // Don't close - let user select multiple
      return;
    }

    // If venture has a completed analysis, offer to load it or start new
    if (hasCompletedAnalysis && !compareMode) {
      // Load existing analysis and go to results
      await setActiveVenture(venture.id);
      await restoreAnalysisToStore(existingAnalysis.id);
      onClose();
      navigate('/whats-next');
      return;
    }

    // No completed analysis - go through tier selection for new analysis
    setSelectedVenture(venture);
    setStep('tier');
  };

  const handleSelectTier = async (tier: DataSharingTier) => {
    // Set active venture
    if (selectedVenture) {
      await setActiveVenture(selectedVenture.id);
    }

    // Finalize tier selection
    setSelectedTier(tier);
    setAcknowledgedPrivacy(true);
    setWizardData({
      tier,
      projectBasics: {},
      personalSituation: {},
      goals: {},
      marketAnalysis: {},
      detailedInput: {},
      completedSteps: [],
    });
    setCurrentStep(0);

    onClose();

    // Navigate to data input for existing venture, otherwise to wizard
    if (selectedVenture) {
      navigate('/venture/data-input');
    } else {
      navigate('/whats-next');
    }
  };

  const handleCreateNew = () => {
    onClose();
    navigate('/venture/create');
  };

  const handleBack = () => {
    setStep('venture');
    setSelectedVenture(null);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-50"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  {step === 'tier' && (
                    <button
                      onClick={handleBack}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </button>
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-charcoal">
                      {compareMode
                        ? 'Analysen vergleichen'
                        : step === 'venture'
                        ? 'Neue Analyse starten'
                        : 'Daten-Level wählen'}
                    </h2>
                    <p className="text-sm text-charcoal/60 mt-1">
                      {compareMode
                        ? 'Wähle Ventures zum Vergleichen aus'
                        : step === 'venture'
                        ? 'Wähle ein Venture oder erstelle ein neues'
                        : `Für: ${selectedVenture?.name}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <AnimatePresence mode="wait">
                  {step === 'venture' ? (
                    <motion.div
                      key="venture-step"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      {/* Create New Venture Option - hide in compare mode */}
                      {!compareMode && (
                        <button
                          onClick={handleCreateNew}
                          className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all group"
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Plus className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-charcoal group-hover:text-purple-700">
                              Neues Venture erstellen
                            </p>
                            <p className="text-sm text-charcoal/60">
                              Starte mit einem neuen Startup-Profil
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                        </button>
                      )}

                      {/* Divider */}
                      {availableVentures.length > 0 && !compareMode && (
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-px bg-gray-200" />
                          <span className="text-xs text-charcoal/50 uppercase tracking-wider">
                            oder wähle existierendes
                          </span>
                          <div className="flex-1 h-px bg-gray-200" />
                        </div>
                      )}

                      {/* Compare mode info */}
                      {compareMode && (
                        <div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
                          Wähle Ventures mit abgeschlossenen Analysen zum Vergleichen aus.
                        </div>
                      )}

                      {/* Loading State */}
                      {isDataLoading && (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                          <span className="ml-2 text-sm text-charcoal/60">Lade Analysen...</span>
                        </div>
                      )}

                      {/* Existing Ventures */}
                      {!isDataLoading && availableVentures.length > 0 && (
                        <div className="space-y-2">
                          {availableVentures.map((venture) => {
                            const existingAnalysis = findAnalysisForVenture(venture.id);
                            const hasCompletedAnalysis = existingAnalysis && existingAnalysis.routeResult;
                            const isSelectedForComparison = hasCompletedAnalysis && isInComparison(existingAnalysis.id);
                            const isDisabledInCompareMode = compareMode && !hasCompletedAnalysis;

                            return (
                            <button
                              key={venture.id}
                              onClick={() => handleSelectVenture(venture)}
                              disabled={isDisabledInCompareMode}
                              className={cn(
                                'w-full flex items-center gap-4 p-4 rounded-xl border transition-all group',
                                isSelectedForComparison
                                  ? 'border-2 border-navy bg-navy/5'
                                  : isDisabledInCompareMode
                                  ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                              )}
                            >
                              <div className={cn(
                                'w-12 h-12 rounded-xl flex items-center justify-center',
                                isSelectedForComparison
                                  ? 'bg-navy/20'
                                  : 'bg-gradient-to-br from-gray-100 to-gray-200'
                              )}>
                                <Building2 className={cn('w-6 h-6', isSelectedForComparison ? 'text-navy' : 'text-gray-600')} />
                              </div>
                              <div className="flex-1 text-left">
                                <div className="flex items-center gap-2">
                                  <p className={cn('font-semibold', isSelectedForComparison ? 'text-navy' : 'text-charcoal')}>
                                    {venture.name}
                                  </p>
                                  {venture.isActive && !compareMode && (
                                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                                      Aktiv
                                    </span>
                                  )}
                                  {isSelectedForComparison && (
                                    <span className="px-2 py-0.5 text-xs bg-navy text-white rounded-full">
                                      ✓ Ausgewählt
                                    </span>
                                  )}
                                  {compareMode && !hasCompletedAnalysis && (
                                    <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-500 rounded-full">
                                      Keine Analyse
                                    </span>
                                  )}
                                  {!compareMode && hasCompletedAnalysis && (
                                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                                      Analyse vorhanden
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-charcoal/60">
                                  {venture.industry || 'Keine Branche'} •{' '}
                                  {venture.stage || 'Keine Phase'}
                                </p>
                                {venture.analysesCount !== undefined &&
                                  venture.analysesCount > 0 && (
                                    <div className="flex items-center gap-1 mt-1 text-xs text-charcoal/50">
                                      <BarChart3 className="w-3 h-3" />
                                      <span>
                                        {venture.analysesCount}{' '}
                                        {venture.analysesCount === 1
                                          ? 'Analyse'
                                          : 'Analysen'}
                                      </span>
                                    </div>
                                  )}
                              </div>
                              {!isSelectedForComparison && (
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                              )}
                            </button>
                          );
                          })}
                        </div>
                      )}

                      {/* Empty State */}
                      {!isDataLoading && availableVentures.length === 0 && (
                        <div className="text-center py-8">
                          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-charcoal/60">
                            Du hast noch keine Ventures erstellt.
                          </p>
                          <p className="text-sm text-charcoal/40 mt-1">
                            Erstelle ein neues Venture, um zu starten.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="tier-step"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-3"
                    >
                      <p className="text-sm text-charcoal/60 mb-4">
                        Je mehr du teilst, desto genauer die Analyse.
                      </p>

                      {TIER_CONFIGS.map((tier) => {
                        const Icon = TIER_ICONS[tier.tier as keyof typeof TIER_ICONS] || Shield;
                        return (
                          <button
                            key={tier.tier}
                            onClick={() => handleSelectTier(tier.tier)}
                            className={cn(
                              'w-full flex items-center gap-4 p-4 rounded-xl border transition-all group text-left',
                              'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                            )}
                          >
                            <div
                              className={cn(
                                'w-10 h-10 rounded-lg flex items-center justify-center',
                                tier.tier === 'minimal' && 'bg-gray-100',
                                tier.tier === 'basic' && 'bg-blue-100',
                                tier.tier === 'detailed' && 'bg-purple-100',
                                tier.tier === 'full' && 'bg-gradient-to-br from-purple-100 to-pink-100'
                              )}
                            >
                              <Icon
                                className={cn(
                                  'w-5 h-5',
                                  tier.tier === 'minimal' && 'text-gray-600',
                                  tier.tier === 'basic' && 'text-blue-600',
                                  tier.tier === 'detailed' && 'text-purple-600',
                                  tier.tier === 'full' && 'text-purple-600'
                                )}
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-charcoal">{tier.label}</p>
                              <p className="text-sm text-charcoal/60">{tier.description}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <Button variant="ghost" onClick={onClose} className="w-full">
                  Abbrechen
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
