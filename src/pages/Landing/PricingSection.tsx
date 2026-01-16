import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight, Sparkles, Zap, Shield, Users, Rocket, Brain, FileText, BarChart3, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PRICING_TIERS, FREE_TIER, formatPrice } from '@/lib/stripe';
import { SectionHeader } from '@/components/common';
import { cn } from '@/lib/utils/cn';

const yearlyDiscount = 0.2;

// Feature categories with icons for the animated comparison
const FEATURE_CATEGORIES = [
  {
    id: 'projects',
    name: 'Projekte',
    icon: Rocket,
    free: '1 Projekt',
    starter: '3 Projekte',
    growth: 'Unbegrenzt',
    scale: 'Unbegrenzt',
  },
  {
    id: 'valuation',
    name: 'Bewertungsmethoden',
    icon: BarChart3,
    free: 'Berkus Methode',
    starter: 'Alle 5 Methoden',
    growth: 'Alle 5 Methoden',
    scale: 'Alle 5 Methoden',
  },
  {
    id: 'actionplan',
    name: 'Action Plan',
    icon: FileText,
    free: 'Basis Route',
    starter: 'Vollständig',
    growth: 'Mit AI Insights',
    scale: 'Mit AI Insights',
  },
  {
    id: 'ai',
    name: 'AI Assistance',
    icon: Brain,
    free: false,
    starter: false,
    growth: '100 Anfragen/Mo',
    scale: '500 Anfragen/Mo',
  },
  {
    id: 'compare',
    name: 'Szenario-Vergleich',
    icon: Zap,
    free: false,
    starter: false,
    growth: true,
    scale: true,
  },
  {
    id: 'team',
    name: 'Team Features',
    icon: Users,
    free: false,
    starter: false,
    growth: false,
    scale: 'Bis 5 User',
  },
  {
    id: 'support',
    name: 'Support',
    icon: MessageSquare,
    free: 'Community',
    starter: 'Email',
    growth: 'Priority',
    scale: 'Dedicated',
  },
  {
    id: 'api',
    name: 'API Access',
    icon: Shield,
    free: false,
    starter: false,
    growth: false,
    scale: true,
  },
];

const FeatureCell = ({ value }: { value: boolean | string }) => {
  if (value === true) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        className="flex items-center justify-center"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      </motion.div>
    );
  }
  if (value === false) {
    return (
      <div className="flex items-center justify-center">
        <X className="w-5 h-5 text-gray-300" />
      </div>
    );
  }
  return (
    <span className="text-sm font-medium text-gray-700">{value}</span>
  );
};

export const PricingSection = () => {
  const [billingInterval, setBillingInterval] = React.useState<'month' | 'year'>('month');
  const [hoveredTier, setHoveredTier] = React.useState<string | null>(null);
  const [showFeatures, setShowFeatures] = React.useState(false);
  const tiers = [FREE_TIER, ...Object.values(PRICING_TIERS)];

  return (
    <section id="pricing" className="section-padding bg-gradient-to-b from-white via-purple-50/30 to-white overflow-hidden">
      <div className="container-wide">
        <SectionHeader
          badge="Preise"
          title="Starte gratis, upgrade wenn du wächst"
          subtitle="1 Projekt ist kostenlos. Danach wählst du den Plan, der zu deiner Ambition passt."
          align="center"
        />

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-3 mb-12"
        >
          <span
            className={cn(
              'text-sm font-medium transition-colors',
              billingInterval === 'month' ? 'text-gray-900' : 'text-gray-400'
            )}
          >
            Monatlich
          </span>
          <button
            onClick={() =>
              setBillingInterval(billingInterval === 'month' ? 'year' : 'month')
            }
            className="relative w-14 h-7 bg-purple-100 rounded-full transition-colors hover:bg-purple-200"
            aria-label="Abrechnungszeitraum umschalten"
          >
            <motion.div
              layout
              className={cn(
                'absolute w-5 h-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full top-1 shadow-lg',
                billingInterval === 'year' ? 'left-8' : 'left-1'
              )}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
          <span
            className={cn(
              'text-sm font-medium transition-colors',
              billingInterval === 'year' ? 'text-gray-900' : 'text-gray-400'
            )}
          >
            Jährlich
          </span>
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="ml-2 px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-full shadow-lg shadow-pink-500/30"
          >
            -20%
          </motion.span>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {tiers.map((tier, index) => {
            const isFree = tier.id === 'free';
            const isPopular = !isFree && (tier as { popular?: boolean }).popular;
            const monthlyPrice = tier.price;
            const yearlyPrice = isFree
              ? 0
              : Math.round(monthlyPrice * 12 * (1 - yearlyDiscount));
            const displayPrice = billingInterval === 'year' ? yearlyPrice : monthlyPrice;

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onHoverStart={() => setHoveredTier(tier.id)}
                onHoverEnd={() => setHoveredTier(null)}
                className={cn(
                  'relative rounded-3xl p-6 border-2 bg-white flex flex-col transition-all duration-300',
                  isPopular
                    ? 'border-purple-400 shadow-2xl shadow-purple-500/20 scale-[1.02] z-10'
                    : 'border-gray-100 hover:border-purple-200 hover:shadow-xl',
                  hoveredTier === tier.id && !isPopular && 'scale-[1.02]'
                )}
              >
                {/* Popular Badge - Corner Ribbon */}
                {isPopular && (
                  <div className="absolute -top-px -right-px overflow-hidden w-24 h-24">
                    <motion.div
                      initial={{ rotate: 45, x: 100 }}
                      animate={{ rotate: 45, x: 0 }}
                      className="absolute top-4 -right-8 w-32 text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold py-1.5 shadow-lg"
                    >
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      Beliebt
                    </motion.div>
                  </div>
                )}

                {/* Tier Header */}
                <div className="mb-6 pt-2">
                  <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={displayPrice}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                      >
                        {formatPrice(displayPrice)}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-gray-400 text-sm">
                      /{billingInterval === 'year' ? 'Jahr' : 'Monat'}
                    </span>
                  </div>
                  {billingInterval === 'year' && !isFree && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-purple-600 font-medium mt-1"
                    >
                      = {formatPrice(Math.round(displayPrice / 12))}/Monat
                    </motion.p>
                  )}
                </div>

                {/* Features List */}
                <ul className="space-y-3 flex-grow mb-6">
                  {tier.features.map((feature, i) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + i * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-purple-600" />
                      </div>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link
                  to={isFree ? '/tier-selection' : '/login'}
                  onClick={() => window.scrollTo(0, 0)}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 group',
                    isPopular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02]'
                      : isFree
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50'
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                  )}
                >
                  {isFree ? 'Gratis starten' : 'Auswählen'}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Feature Comparison Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mb-4"
        >
          <button
            onClick={() => setShowFeatures(!showFeatures)}
            className="inline-flex items-center gap-2 px-6 py-3 text-purple-600 font-semibold hover:text-purple-700 transition-colors"
          >
            <span>{showFeatures ? 'Feature-Vergleich ausblenden' : 'Alle Features vergleichen'}</span>
            <motion.div
              animate={{ rotate: showFeatures ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ArrowRight className="w-5 h-5 rotate-90" />
            </motion.div>
          </button>
        </motion.div>

        {/* Animated Feature Comparison Table */}
        <AnimatePresence>
          {showFeatures && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-3xl border-2 border-purple-100 shadow-xl overflow-hidden">
                {/* Header Row */}
                <div className="grid grid-cols-5 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                  <div className="p-4 font-semibold text-gray-900">Features</div>
                  {['Free', 'Starter', 'Growth', 'Scale'].map((name, i) => (
                    <motion.div
                      key={name}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={cn(
                        'p-4 text-center font-bold',
                        name === 'Growth' ? 'text-purple-600' : 'text-gray-700'
                      )}
                    >
                      {name}
                      {name === 'Growth' && (
                        <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full">
                          Empfohlen
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Feature Rows */}
                {FEATURE_CATEGORIES.map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'grid grid-cols-5 border-b border-purple-50 hover:bg-purple-50/50 transition-colors',
                      index === FEATURE_CATEGORIES.length - 1 && 'border-b-0'
                    )}
                  >
                    <div className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <feature.icon className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="font-medium text-gray-700">{feature.name}</span>
                    </div>
                    <div className="p-4 flex items-center justify-center">
                      <FeatureCell value={feature.free} />
                    </div>
                    <div className="p-4 flex items-center justify-center">
                      <FeatureCell value={feature.starter} />
                    </div>
                    <div className="p-4 flex items-center justify-center bg-purple-50/30">
                      <FeatureCell value={feature.growth} />
                    </div>
                    <div className="p-4 flex items-center justify-center">
                      <FeatureCell value={feature.scale} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 text-center"
        >
          <p className="text-gray-500 text-sm">
            ✨ Keine Kreditkarte für Free-Plan erforderlich &bull; 🔒 SSL-verschlüsselt &bull; 🇩🇪 DSGVO-konform
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
