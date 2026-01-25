import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, CheckCircle } from 'lucide-react';
import { Header, PageContainer } from '@/components/layout';
import { EnhancedSidebar } from '@/components/layout/sidebar/EnhancedSidebar';
import { useStore, TIER_CONFIGS } from '@/store';
import { useVentureContext } from '@/contexts/VentureContext';
import { TierCard } from './TierCard';
import { VentureSelectionDialog } from './VentureSelectionDialog';
import type { DataSharingTier } from '@/types';
import type { Venture } from '@/hooks/useVentures';

export const TierSelectionPage = () => {
  const navigate = useNavigate();
  const { selectedTier, setSelectedTier, setAcknowledgedPrivacy, setWizardData, setCurrentStep } = useStore();
  const { setActiveVenture } = useVentureContext();

  // State für Venture-Auswahl Dialog
  const [showVentureDialog, setShowVentureDialog] = React.useState(false);
  const [pendingTier, setPendingTier] = React.useState<DataSharingTier | null>(null);

  const handleSelectTier = (tier: DataSharingTier) => {
    // Speichere Tier und zeige Venture-Auswahl Dialog
    setPendingTier(tier);
    setShowVentureDialog(true);
  };

  const finalizeTierSelection = (tier: DataSharingTier) => {
    setSelectedTier(tier);
    setAcknowledgedPrivacy(true);
    // Reset wizard to start fresh with new tier
    setWizardData({
      tier,
      projectBasics: {},
      personalSituation: {},
      goals: {},
      marketAnalysis: {},
      detailedInput: {},
      completedSteps: [],
    });
    // Reset to first step
    setCurrentStep(0);
  };

  const handleSelectExistingVenture = async (venture: Venture) => {
    if (!pendingTier) return;

    // Setze das ausgewählte Venture als aktiv
    await setActiveVenture(venture.id);

    // Finalisiere Tier-Auswahl
    finalizeTierSelection(pendingTier);

    // Schließe Dialog und navigiere
    setShowVentureDialog(false);
    setPendingTier(null);
    navigate('/venture/data-input');
  };

  const handleCreateNewVenture = () => {
    if (!pendingTier) return;

    // Finalisiere Tier-Auswahl
    finalizeTierSelection(pendingTier);

    // Schließe Dialog und navigiere zur Venture-Erstellung
    setShowVentureDialog(false);
    setPendingTier(null);
    navigate('/venture/create');
  };

  const handleCloseDialog = () => {
    setShowVentureDialog(false);
    setPendingTier(null);
  };

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <EnhancedSidebar />
      <PageContainer withSidebar maxWidth="wide">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Current Selection Banner */}
          {selectedTier && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-900">
                    Aktuell ausgewählt: <span className="font-bold">{TIER_CONFIGS.find(t => t.tier === selectedTier)?.label}</span>
                  </p>
                  <p className="text-xs text-purple-700/70">
                    Du kannst dein Daten-Level jederzeit ändern. Eine Änderung kann die Genauigkeit deiner Analyse beeinflussen.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <h1 className="font-display text-display-sm md:text-display-md text-text-primary mb-4">
            Wie viel möchtest du teilen?
          </h1>
          <p className="text-text-secondary text-lg mb-8">
            Je mehr du teilst, desto genauer unsere Analyse. Aber du entscheidest -
            und wir sind bei jeder Stufe ehrlich, was wir damit anfangen können.
          </p>

          <div className="space-y-4 mb-12">
            {TIER_CONFIGS.map((tier, index) => (
              <TierCard
                key={tier.tier}
                tier={tier}
                index={index}
                isSelected={selectedTier === tier.tier}
                onSelect={() => handleSelectTier(tier.tier)}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 bg-purple-50 rounded-2xl border border-purple-100"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-text-primary mb-2">
                  Deine Daten bleiben bei dir
                </h3>
                <p className="text-text-secondary">
                  LaunchOS speichert nichts auf Servern. Alle Berechnungen passieren
                  lokal in deinem Browser. Wenn du den Tab schließt, ist alles weg -
                  außer du exportierst es selbst.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </PageContainer>

      {/* Venture Selection Dialog */}
      <VentureSelectionDialog
        open={showVentureDialog}
        onClose={handleCloseDialog}
        onSelectExisting={handleSelectExistingVenture}
        onCreateNew={handleCreateNewVenture}
      />
    </div>
  );
};

export default TierSelectionPage;
