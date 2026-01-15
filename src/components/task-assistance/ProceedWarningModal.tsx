import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { useStore } from '@/store';
import { TASK_ASSISTANCE_CONFIG } from '@/lib/taskRequirements';

interface ProceedWarningModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskId: string;
}

export const ProceedWarningModal = ({
  open,
  onClose,
  onConfirm,
  taskId,
}: ProceedWarningModalProps) => {
  const { getMissingRequirements } = useStore();
  const config = TASK_ASSISTANCE_CONFIG[taskId];

  if (!open || !config) return null;

  const missingReqs = getMissingRequirements();
  const criticalMissing = missingReqs.filter((r) => r.importance === 'critical');
  const importantMissing = missingReqs.filter((r) => r.importance === 'important');

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-[60] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-navy/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-gold" />
                </div>
                <h2 className="font-display text-lg text-navy">Wichtiger Hinweis</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-navy/5 transition-colors"
              >
                <X className="w-5 h-5 text-charcoal/60" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-charcoal/70">
                Ich kann dir helfen, aber das Ergebnis wird Einschränkungen haben:
              </p>

              {criticalMissing.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="font-medium text-red-800 text-sm mb-2">
                    Diese Bereiche werden Platzhalter enthalten:
                  </p>
                  <ul className="text-sm text-red-700 space-y-1">
                    {criticalMissing.map((req) => (
                      <li key={req.id} className="flex items-start gap-2">
                        <span>•</span>
                        <span>{req.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {importantMissing.length > 0 && (
                <div className="bg-gold/10 border border-gold/30 rounded-xl p-4">
                  <p className="font-medium text-charcoal/80 text-sm mb-2">
                    Diese Bereiche werden weniger präzise sein:
                  </p>
                  <ul className="text-sm text-charcoal/70 space-y-1">
                    {importantMissing.map((req) => (
                      <li key={req.id} className="flex items-start gap-2">
                        <span>•</span>
                        <span>{req.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-sm text-charcoal/60">
                Das ist für erste Entwürfe okay, aber nicht investor-ready. Du kannst
                jederzeit zurückkehren und die Informationen ergänzen.
              </p>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-navy/10 bg-cream/50">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Zurück
              </Button>
              <Button onClick={onConfirm} className="flex-1">
                Verstanden, Draft erstellen
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
