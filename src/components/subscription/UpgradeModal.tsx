import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Check, ArrowRight } from 'lucide-react';
import { useSubscription, type FeatureName } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: FeatureName | 'chat_limit' | 'venture_limit';
  description?: string;
}

const featureDescriptions: Record<string, string> = {
  document_generation: 'Generiere professionelle Dokumente wie Pitch Decks, One-Pager und mehr.',
  investor_crm: 'Tracke Investoren mit Kanban-Board und Pipeline-Management.',
  data_room: 'Teile Dokumente sicher mit Investoren und tracke Zugriffe.',
  analytics: 'Erhalte Einblicke in dein Startup mit dem Analytics Dashboard.',
  custom_branding: 'Gestalte deinen Data Room mit eigenem Branding.',
  priority_support: 'Erhalte Priority Support mit schnellerer Antwortzeit.',
  chat_limit: 'Unbegrenzte Chat-Nachrichten für intensive Beratung.',
  venture_limit: 'Verwalte mehrere Ventures parallel.',
};

const proFeatures = [
  'Unbegrenzte Chat-Nachrichten',
  'Dokument-Generierung',
  'Investor CRM mit Kanban',
  'Sicherer Data Room (10 GB)',
  'Analytics Dashboard',
  'Bis zu 3 Ventures',
  'Email Support',
];

export function UpgradeModal({ isOpen, onClose, feature, description }: UpgradeModalProps) {
  const { tiers } = useSubscription();
  const navigate = useNavigate();

  const proTier = tiers.find(t => t.id === 'pro');
  const priceMonthly = proTier ? proTier.priceMonthly / 100 : 29;
  const priceYearly = proTier ? proTier.priceYearly / 100 : 249;

  const handleUpgrade = () => {
    onClose();
    navigate('/pricing?plan=pro');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-brand-600 to-brand-500 p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Zap className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">Upgrade auf Pro</h2>
              </div>
              <p className="text-brand-100">
                Schalte alle Features frei und bringe dein Startup auf das nächste Level.
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Feature Highlight */}
              <div className="bg-brand-50 rounded-xl p-4 mb-6 border border-brand-100">
                <p className="text-sm text-brand-600 font-medium mb-1">
                  Du benötigst dieses Feature:
                </p>
                <p className="font-semibold text-navy">
                  {description || featureDescriptions[feature] || feature}
                </p>
              </div>

              {/* What you get */}
              <h3 className="font-semibold text-navy mb-3">
                Mit Pro bekommst du:
              </h3>
              <ul className="space-y-2 mb-6">
                {proFeatures.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-charcoal/80">
                    <Check className="w-4 h-4 text-sage flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-navy">
                  {priceMonthly}<span className="text-lg text-charcoal/50 font-normal">/Monat</span>
                </div>
                <p className="text-sm text-charcoal/60">
                  oder {priceYearly}/Jahr (2 Monate gratis)
                </p>
              </div>

              {/* CTA */}
              <button
                onClick={handleUpgrade}
                className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-brand-500
                         text-white font-semibold rounded-xl flex items-center justify-center gap-2
                         hover:shadow-lg hover:shadow-brand-500/25 transition-all"
              >
                Jetzt upgraden
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-sm text-charcoal/50 mt-3">
                Jederzeit kündbar. Keine versteckten Kosten.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default UpgradeModal;
