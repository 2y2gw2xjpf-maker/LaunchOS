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
}

type DialogStep = 'venture' | 'tier';

const TIER_ICONS = {
  minimal: Shield,
  basic: Zap,
  detailed: Database,
  full: Lock,
};

export const NewAnalysisDialog = ({ open, onClose }: NewAnalysisDialogProps) => {
  const navigate = useNavigate();
  const { ventures, isLoading, setActiveVenture } = useVentureContext();
  const { setSelectedTier, setAcknowledgedPrivacy, setWizardData, setCurrentStep } = useStore();

  const [step, setStep] = React.useState<DialogStep>('venture');
  const [selectedVenture, setSelectedVenture] = React.useState<Venture | null>(null);

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setStep('venture');
      setSelectedVenture(null);
    }
  }, [open]);

  const availableVentures = ventures;

  const handleSelectVenture = (venture: Venture) => {
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
                      {step === 'venture' ? 'Neue Analyse starten' : 'Daten-Level wählen'}
                    </h2>
                    <p className="text-sm text-charcoal/60 mt-1">
                      {step === 'venture'
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
                      {/* Create New Venture Option */}
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

                      {/* Divider */}
                      {availableVentures.length > 0 && (
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-px bg-gray-200" />
                          <span className="text-xs text-charcoal/50 uppercase tracking-wider">
                            oder wähle existierendes
                          </span>
                          <div className="flex-1 h-px bg-gray-200" />
                        </div>
                      )}

                      {/* Loading State */}
                      {isLoading && (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                        </div>
                      )}

                      {/* Existing Ventures */}
                      {!isLoading && availableVentures.length > 0 && (
                        <div className="space-y-2">
                          {availableVentures.map((venture) => (
                            <button
                              key={venture.id}
                              onClick={() => handleSelectVenture(venture)}
                              className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all group"
                            >
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-gray-600" />
                              </div>
                              <div className="flex-1 text-left">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-charcoal">
                                    {venture.name}
                                  </p>
                                  {venture.isActive && (
                                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                                      Aktiv
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
                              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Empty State */}
                      {!isLoading && availableVentures.length === 0 && (
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
