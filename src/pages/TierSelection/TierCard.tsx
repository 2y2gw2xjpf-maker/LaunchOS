import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle, XCircle, Lightbulb, Shield, Eye, Users, FileText } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui';
import type { TierConfig, DataSharingTier } from '@/types';

interface TierCardProps {
  tier: TierConfig;
  index: number;
  onSelect: () => void;
}

const tierIcons: Record<DataSharingTier, typeof Shield> = {
  minimal: Shield,
  basic: Eye,
  detailed: Users,
  full: FileText,
};

export const TierCard = ({ tier, index, onSelect }: TierCardProps) => {
  const [expanded, setExpanded] = React.useState(false);
  const Icon = tierIcons[tier.tier];

  const getConfidenceColor = () => {
    const [min] = tier.confidenceRange;
    if (min >= 70) return 'text-purple-600 bg-purple-100';
    if (min >= 50) return 'text-pink-600 bg-pink-100';
    return 'text-gray-600 bg-purple-50';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="border-2 border-purple-100 rounded-2xl overflow-hidden hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/10 transition-all bg-white"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
              <Icon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-text-primary text-lg">
                {tier.label}
              </h3>
              <p className="text-text-secondary text-sm">{tier.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={cn('px-3 py-1.5 rounded-lg font-mono text-sm font-semibold', getConfidenceColor())}>
              {tier.confidenceRange[0]}-{tier.confidenceRange[1]}%
            </div>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-purple-400" />
            </motion.div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-purple-100 overflow-hidden"
          >
            <div className="p-6 bg-purple-50/50">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    Was wir fragen
                  </h4>
                  <ul className="space-y-2">
                    {tier.whatWeAsk.map((item, i) => (
                      <li
                        key={i}
                        className="text-sm text-text-secondary flex items-start gap-2"
                      >
                        <span className="text-purple-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    Was wir NICHT fragen
                  </h4>
                  <ul className="space-y-2">
                    {tier.whatWeNeverAsk.map((item, i) => (
                      <li
                        key={i}
                        className="text-sm text-text-secondary flex items-start gap-2"
                      >
                        <span className="text-red-400 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl mb-6 border border-purple-100">
                <div className="flex items-center gap-3 mb-2">
                  <Lightbulb className="w-5 h-5 text-pink-500" />
                  <span className="font-semibold text-text-primary">Analyse-Tiefe</span>
                </div>
                <p className="text-text-secondary">{tier.analysisDepth}</p>
                <p className="text-sm text-text-muted mt-2 italic">
                  "{tier.example}"
                </p>
              </div>

              <Button onClick={onSelect} variant="primary" className="w-full">
                Mit diesem Level starten
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
