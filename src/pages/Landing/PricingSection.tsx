import * as React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PRICING_TIERS, FREE_TIER, formatPrice } from '@/lib/stripe';
import { SectionHeader } from '@/components/common';
import { cn } from '@/lib/utils/cn';

const yearlyDiscount = 0.2;

export const PricingSection = () => {
  const [billingInterval, setBillingInterval] = React.useState<'month' | 'year'>('month');
  const tiers = [FREE_TIER, ...Object.values(PRICING_TIERS)];

  return (
    <section id="pricing" className="section-padding bg-gradient-to-b from-white to-purple-50/40">
      <div className="container-wide">
        <SectionHeader
          badge="Preise"
          title="Starte gratis, upgrade wenn du wächst"
          subtitle="1 Projekt ist kostenlos. Danach wählst du den Plan, der zu deiner Ambition passt."
          align="center"
        />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-3 mb-10"
        >
          <span
            className={cn(
              'text-sm font-medium transition-colors',
              billingInterval === 'month' ? 'text-text-primary' : 'text-text-muted'
            )}
          >
            Monatlich
          </span>
          <button
            onClick={() =>
              setBillingInterval(billingInterval === 'month' ? 'year' : 'month')
            }
            className="relative w-14 h-7 bg-purple-100 rounded-full transition-colors"
            aria-label="Abrechnungszeitraum umschalten"
          >
            <div
              className={cn(
                'absolute w-5 h-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full top-1 transition-transform',
                billingInterval === 'year' ? 'translate-x-8' : 'translate-x-1'
              )}
            />
          </button>
          <span
            className={cn(
              'text-sm font-medium transition-colors',
              billingInterval === 'year' ? 'text-text-primary' : 'text-text-muted'
            )}
          >
            Jährlich
          </span>
          <span className="ml-2 px-2 py-0.5 bg-pink-100 text-pink-700 text-xs font-medium rounded-full">
            20% sparen
          </span>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6">
          {tiers.map((tier, index) => {
            const isFree = tier.id === 'free';
            const monthlyPrice = tier.price;
            const yearlyPrice = isFree
              ? 0
              : Math.round(monthlyPrice * 12 * (1 - yearlyDiscount));
            const displayPrice = billingInterval === 'year' ? yearlyPrice : monthlyPrice;

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className={cn(
                  'relative rounded-2xl p-6 border bg-white/80 backdrop-blur-sm shadow-card flex flex-col',
                  !isFree && (tier as { popular?: boolean }).popular
                    ? 'border-purple-300 shadow-lg shadow-purple-200/50'
                    : 'border-purple-100'
                )}
              >
                {(tier as { popular?: boolean }).popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium rounded-full shadow-lg shadow-purple-500/30">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Beliebt
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="text-lg font-semibold text-text-primary">{tier.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-text-primary">
                      {formatPrice(displayPrice)}
                    </span>
                    <span className="text-text-muted text-sm">
                      /{billingInterval === 'year' ? 'Jahr' : 'Monat'}
                    </span>
                  </div>
                  {billingInterval === 'year' && !isFree && (
                    <p className="text-xs text-purple-600 mt-1">
                      {formatPrice(Math.round(displayPrice / 12))}/Monat
                    </p>
                  )}
                  {isFree && (
                    <p className="text-xs text-text-muted mt-1">1 Projekt gratis</p>
                  )}
                </div>

                {/* Features list with flex-grow to push button to bottom */}
                <ul className="space-y-3 flex-grow">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Button container - always at bottom with consistent height */}
                <div className="mt-6 pt-4 border-t border-purple-50">
                  <Link
                    to={isFree ? '/login' : '/pricing'}
                    onClick={() => window.scrollTo(0, 0)}
                    className={cn(
                      'inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-semibold transition-all whitespace-nowrap',
                      isFree
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40'
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                    )}
                  >
                    {isFree ? 'Gratis starten' : 'Details ansehen'}
                    <ArrowRight className="w-4 h-4 flex-shrink-0" />
                  </Link>
                  {isFree && (
                    <p className="text-xs text-text-muted text-center mt-2">
                      Einstellungen & Abrechnung erst nach Login.
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
