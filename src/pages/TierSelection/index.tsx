import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { useStore, TIER_CONFIGS } from '@/store';
import { TierCard } from './TierCard';
import type { DataSharingTier } from '@/types';

export const TierSelectionPage = () => {
  const navigate = useNavigate();
  const { setSelectedTier, setAcknowledgedPrivacy, setWizardData } = useStore();

  const handleSelectTier = (tier: DataSharingTier) => {
    setSelectedTier(tier);
    setAcknowledgedPrivacy(true);
    setWizardData({ tier });
    navigate('/whats-next');
  };

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main className="pt-20">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-display-sm md:text-display-md text-navy mb-4">
              Wie viel mochtest du teilen?
            </h1>
            <p className="text-charcoal/70 text-lg mb-8">
              Je mehr du teilst, desto genauer unsere Analyse. Aber du entscheidest -
              und wir sind bei jeder Stufe ehrlich, was wir damit anfangen konnen.
            </p>

            <div className="space-y-4 mb-12">
              {TIER_CONFIGS.map((tier, index) => (
                <TierCard
                  key={tier.tier}
                  tier={tier}
                  index={index}
                  onSelect={() => handleSelectTier(tier.tier)}
                />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 bg-navy/5 rounded-2xl"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-navy" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-navy mb-2">
                    Deine Daten bleiben bei dir
                  </h3>
                  <p className="text-charcoal/70">
                    LaunchOS speichert nichts auf Servern. Alle Berechnungen passieren
                    lokal in deinem Browser. Wenn du den Tab schliesst, ist alles weg -
                    ausser du exportierst es selbst.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TierSelectionPage;
