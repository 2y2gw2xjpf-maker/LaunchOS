import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight, Sparkles, Zap, Shield, Users, Rocket, Brain, FileText, BarChart3, MessageSquare, Wrench, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PRICING_TIERS, FREE_TIER, formatPrice } from '@/lib/stripe';
import { SectionHeader } from '@/components/common';
import { cn } from '@/lib/utils/cn';

const yearlyDiscount = 0.15; // ~2 months free

// Updated feature categories for Builder/Founder/Startup tiers
const FEATURE_CATEGORIES = [
  {
    id: 'toolkit',
    name: "Builder's Toolkit",
    icon: Wrench,
    free: 'Vollständig',
    pro: 'Vollständig',
    team: 'Vollständig',
  },
  {
    id: 'ventures',
    name: 'Ventures',
    icon: Rocket,
    free: '1 Venture',
    pro: '3 Ventures',
    team: 'Unbegrenzt',
  },
  {
    id: 'chat',
    name: 'Chat-Nachrichten',
    icon: MessageSquare,
    free: '30/Monat',
    pro: 'Unbegrenzt',
    team: 'Unbegrenzt',
  },
  {
    id: 'docs',
    name: 'Dokument-Generierung',
    icon: FileText,
    free: false,
    pro: true,
    team: true,
  },
  {
    id: 'crm',
    name: 'Investor CRM',
    icon: Users,
    free: false,
    pro: true,
    team: true,
  },
  {
    id: 'dataroom',
    name: 'Data Room',
    icon: FolderOpen,
    free: false,
    pro: '10 GB',
    team: '50 GB',
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    icon: BarChart3,
    free: false,
    pro: true,
    team: true,
  },
  {
    id: 'team',
    name: 'Team-Mitglieder',
    icon: Users,
    free: '1',
    pro: '1',
    team: '5',
  },
  {
    id: 'branding',
    name: 'Custom Branding',
    icon: Sparkles,
    free: false,
    pro: false,
    team: true,
  },
  {
    id: 'support',
    name: 'Support',
    icon: Shield,
    free: 'Community',
    pro: 'Email',
    team: 'Priority',
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
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      </motion.div>
    );
  }
  if (value === false) {
    return (
      <div className="flex items-center justify-center">
        <X className="w-5 h-5 text-charcoal/20" />
      </div>
    );
  }
  return (
    <span className="text-sm font-medium text-charcoal/70">{value}</span>
  );
};

export const PricingSection = () => {
  const [billingInterval, setBillingInterval] = React.useState<'month' | 'year'>('month');
  const [hoveredTier, setHoveredTier] = React.useState<string | null>(null);
  const [showFeatures, setShowFeatures] = React.useState(false);

  // Build tiers array with correct structure
  const tiers = React.useMemo(() => [
    {
      id: FREE_TIER.id,
      name: FREE_TIER.name,
      price: FREE_TIER.price,
      priceYearly: FREE_TIER.priceYearly,
      features: FREE_TIER.features,
      popular: false,
    },
    ...Object.values(PRICING_TIERS).map(tier => ({
      id: tier.id,
      name: tier.name,
      price: tier.price,
      priceYearly: tier.priceYearly,
      features: tier.features,
      popular: tier.popular || false,
    })),
  ], []);

  const tierGradients: Record<string, string> = {
    free: 'from-charcoal/80 to-charcoal',
    pro: 'from-brand-600 to-brand-500',
    team: 'from-navy to-navy-700',
  };

  const tierIcons: Record<string, React.ReactNode> = {
    free: <Sparkles className="w-5 h-5" />,
    pro: <Zap className="w-5 h-5" />,
    team: <Users className="w-5 h-5" />,
  };

  return (
    <section id="pricing" className="section-padding bg-gradient-to-b from-white via-brand-50/30 to-white overflow-hidden">
      <div className="container-wide">
        <SectionHeader
          badge="Preise"
          title="Starte gratis, upgrade wenn du wächst"
          subtitle="Builder's Toolkit ist kostenlos. Upgrade auf Pro für unbegrenzten Chat, CRM und Data Room."
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
              billingInterval === 'month' ? 'text-navy' : 'text-charcoal/50'
            )}
          >
            Monatlich
          </span>
          <button
            onClick={() =>
              setBillingInterval(billingInterval === 'month' ? 'year' : 'month')
            }
            className="relative w-14 h-7 bg-brand-100 rounded-full transition-colors hover:bg-brand-200"
            aria-label="Abrechnungszeitraum umschalten"
          >
            <motion.div
              layout
              className={cn(
                'absolute w-5 h-5 bg-gradient-to-r from-brand-600 to-brand-500 rounded-full top-1 shadow-lg',
                billingInterval === 'year' ? 'left-8' : 'left-1'
              )}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
          <span
            className={cn(
              'text-sm font-medium transition-colors',
              billingInterval === 'year' ? 'text-navy' : 'text-charcoal/50'
            )}
          >
            Jährlich
          </span>
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="ml-2 px-3 py-1 bg-gradient-to-r from-sage to-sage-dark text-white text-xs font-bold rounded-full"
          >
            2 Monate gratis
          </motion.span>
        </motion.div>

        {/* Pricing Cards - 3 columns */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
          {tiers.map((tier, index) => {
            const isFree = tier.id === 'free';
            const isPopular = tier.popular;
            const monthlyPrice = tier.price;
            const yearlyPrice = tier.priceYearly;
            const displayPrice = billingInterval === 'year'
              ? Math.round(yearlyPrice / 12)
              : monthlyPrice;
            const gradient = tierGradients[tier.id] || tierGradients.free;
            const Icon = tierIcons[tier.id];

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
                  'relative rounded-2xl bg-white flex flex-col transition-all duration-300 overflow-hidden',
                  isPopular
                    ? 'border-2 border-brand-500 shadow-2xl shadow-brand-500/20 scale-[1.02] z-10'
                    : 'border border-navy/10 hover:border-brand-200 hover:shadow-xl',
                  hoveredTier === tier.id && !isPopular && 'scale-[1.02]'
                )}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-brand-500 text-white px-3 py-1 text-xs font-bold rounded-bl-xl">
                    Beliebt
                  </div>
                )}

                {/* Header */}
                <div className={cn('p-5 text-white bg-gradient-to-r', gradient)}>
                  <div className="flex items-center gap-2 mb-1">
                    {Icon}
                    <h3 className="text-lg font-bold">{tier.name}</h3>
                  </div>
                </div>

                {/* Price */}
                <div className="p-5 border-b border-navy/5">
                  <div className="flex items-baseline gap-1">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={displayPrice}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="text-3xl font-bold text-navy"
                      >
                        {isFree ? '0' : displayPrice}
                      </motion.span>
                    </AnimatePresence>
                    {!isFree && (
                      <span className="text-charcoal/50 text-sm">/Monat</span>
                    )}
                    {isFree && (
                      <span className="text-charcoal/50 text-sm">Kostenlos</span>
                    )}
                  </div>
                  {billingInterval === 'year' && !isFree && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-brand-600 font-medium mt-1"
                    >
                      {formatPrice(yearlyPrice)}/Jahr
                    </motion.p>
                  )}
                </div>

                {/* Features List */}
                <ul className="p-5 space-y-2 flex-grow">
                  {tier.features.map((feature, i) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + i * 0.03 }}
                      className="flex items-start gap-2"
                    >
                      <div className="w-4 h-4 rounded-full bg-sage/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-sage" />
                      </div>
                      <span className="text-sm text-charcoal/70">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* CTA Button */}
                <div className="p-5 pt-0">
                  <Link
                    to={isFree ? '/tier-selection' : '/pricing'}
                    onClick={() => window.scrollTo(0, 0)}
                    className={cn(
                      'inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-semibold transition-all duration-300 group',
                      isPopular
                        ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-[1.02]'
                        : isFree
                        ? 'bg-navy text-white hover:bg-navy-700'
                        : 'bg-navy/5 text-navy hover:bg-navy/10'
                    )}
                  >
                    {isFree ? 'Kostenlos starten' : 'Plan wählen'}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
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
            className="inline-flex items-center gap-2 px-6 py-3 text-brand-600 font-semibold hover:text-brand-700 transition-colors"
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
              className="overflow-hidden max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-2xl border border-navy/10 shadow-xl overflow-hidden">
                {/* Header Row */}
                <div className="grid grid-cols-4 bg-gradient-to-r from-brand-50 to-cream border-b border-navy/10">
                  <div className="p-4 font-semibold text-navy">Features</div>
                  {['Builder', 'Founder', 'Startup'].map((name, i) => (
                    <motion.div
                      key={name}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={cn(
                        'p-4 text-center font-bold',
                        name === 'Founder' ? 'text-brand-600' : 'text-navy'
                      )}
                    >
                      {name}
                      {name === 'Founder' && (
                        <span className="ml-2 px-2 py-0.5 bg-brand-100 text-brand-600 text-xs rounded-full">
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
                      'grid grid-cols-4 border-b border-navy/5 hover:bg-brand-50/30 transition-colors',
                      index === FEATURE_CATEGORIES.length - 1 && 'border-b-0'
                    )}
                  >
                    <div className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-100 to-cream flex items-center justify-center">
                        <feature.icon className="w-4 h-4 text-brand-600" />
                      </div>
                      <span className="font-medium text-charcoal/80 text-sm">{feature.name}</span>
                    </div>
                    <div className="p-4 flex items-center justify-center">
                      <FeatureCell value={feature.free} />
                    </div>
                    <div className="p-4 flex items-center justify-center bg-brand-50/30">
                      <FeatureCell value={feature.pro} />
                    </div>
                    <div className="p-4 flex items-center justify-center">
                      <FeatureCell value={feature.team} />
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
          className="mt-8 text-center"
        >
          <p className="text-charcoal/50 text-sm">
            Keine Kreditkarte für Builder erforderlich | SSL-verschlüsselt | DSGVO-konform | 14 Tage Geld-zurück
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
