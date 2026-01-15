import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  HelpCircle,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button, Progress, Badge } from '@/components/ui';
import { useStore } from '@/store';
import { TASK_ASSISTANCE_CONFIG, TASK_LABELS } from '@/lib/taskRequirements';

interface InfoCheckModalProps {
  open: boolean;
  onClose: () => void;
  taskId: string;
  onProceed: () => void;
  onStartGathering: (requirementId: string) => void;
}

export const InfoCheckModal = ({
  open,
  onClose,
  taskId,
  onProceed,
  onStartGathering,
}: InfoCheckModalProps) => {
  const { currentTaskExecution, runInfoCheck, getContextField } = useStore();
  const config = TASK_ASSISTANCE_CONFIG[taskId];
  const labels = TASK_LABELS[taskId];

  // Run info check on mount
  React.useEffect(() => {
    if (open && currentTaskExecution) {
      runInfoCheck(getContextField);
    }
  }, [open, currentTaskExecution, runInfoCheck, getContextField]);

  if (!open || !currentTaskExecution || !config) return null;

  const { infoCheck } = currentTaskExecution;

  // Status icon component
  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="w-5 h-5 text-sage" />;
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-gold" />;
      default:
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  // Readiness color
  const getReadinessColor = (readiness: number) => {
    if (readiness >= 80) return 'text-sage';
    if (readiness >= 50) return 'text-gold';
    return 'text-red-500';
  };

  // Readiness label
  const getReadinessLabel = (readiness: number) => {
    if (readiness >= config.qualityGate.minConfidenceForFinal) {
      return 'Bereit für Top-Ergebnis';
    }
    if (readiness >= config.qualityGate.minConfidenceForDraft) {
      return 'Gut genug für Draft';
    }
    if (readiness >= config.qualityGate.minConfidenceToStart) {
      return 'Minimum erreicht';
    }
    return 'Noch nicht bereit';
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-navy/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-navy" />
                </div>
                <div>
                  <h2 className="font-display text-lg text-navy">
                    {labels?.title || 'Task Assistance'}
                  </h2>
                  <p className="text-sm text-charcoal/60">
                    Prüfe ob genug Informationen vorhanden sind
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-navy/5 transition-colors"
              >
                <X className="w-5 h-5 text-charcoal/60" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Readiness Score */}
              <div className="bg-cream rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-charcoal/70">
                    Bereitschaft
                  </span>
                  <span
                    className={cn(
                      'text-3xl font-bold',
                      getReadinessColor(infoCheck.overallReadiness)
                    )}
                  >
                    {infoCheck.overallReadiness}%
                  </span>
                </div>
                <Progress value={infoCheck.overallReadiness} className="h-3 mb-2" />
                <p className="text-sm text-charcoal/60 text-center">
                  {getReadinessLabel(infoCheck.overallReadiness)}
                </p>
              </div>

              {/* Blockers */}
              {infoCheck.blockers.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-red-700">Blockiert</span>
                  </div>
                  <ul className="space-y-2">
                    {infoCheck.blockers.map((blocker, i) => (
                      <li key={i} className="text-sm text-red-600 flex items-start gap-2">
                        <span className="mt-1">•</span>
                        <span>{blocker}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {infoCheck.warnings.length > 0 && (
                <div className="bg-gold/10 border border-gold/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-gold" />
                    <span className="font-medium text-gold">Hinweise</span>
                  </div>
                  <ul className="space-y-2">
                    {infoCheck.warnings.map((warning, i) => (
                      <li
                        key={i}
                        className="text-sm text-charcoal/70 flex items-start gap-2"
                      >
                        <span className="mt-1">•</span>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements List */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-charcoal/50 uppercase tracking-wider">
                  Benötigte Informationen
                </h4>
                <div className="space-y-2">
                  {config.requirements.map((req) => {
                    const status = infoCheck.requirements.find(
                      (r) => r.requirementId === req.id
                    );

                    return (
                      <div
                        key={req.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-navy/10 bg-white hover:bg-cream/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <StatusIcon status={status?.status || 'missing'} />
                          <div>
                            <p className="font-medium text-sm text-navy">
                              {req.label}
                            </p>
                            <p className="text-xs text-charcoal/60">
                              {req.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              req.importance === 'critical'
                                ? 'gold'
                                : req.importance === 'important'
                                ? 'default'
                                : 'outline'
                            }
                          >
                            {req.importance === 'critical'
                              ? 'Kritisch'
                              : req.importance === 'important'
                              ? 'Wichtig'
                              : 'Optional'}
                          </Badge>
                          {req.helperConfig && status?.status !== 'complete' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => onStartGathering(req.id)}
                              title="Hilfe beim Erarbeiten"
                            >
                              <HelpCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row gap-3 px-6 py-4 border-t border-navy/10 bg-cream/50">
              <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
                Abbrechen
              </Button>

              {!infoCheck.canProceed && (
                <Button
                  onClick={() => onStartGathering(config.requirements[0]?.id || '')}
                  className="flex-1 gap-2"
                >
                  Fehlende Infos erarbeiten
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}

              {infoCheck.canProceedWithWarnings && !infoCheck.canProceed && (
                <Button
                  variant="outline"
                  onClick={onProceed}
                  className="flex-1 gap-2"
                >
                  Trotzdem starten (Draft)
                </Button>
              )}

              {infoCheck.canProceed && (
                <Button onClick={onProceed} className="flex-1 gap-2">
                  <Sparkles className="w-4 h-4" />
                  Jetzt erstellen
                </Button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
