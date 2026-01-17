import * as React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, ArrowLeft, ArrowRight, HelpCircle, Shield, Zap, Users } from 'lucide-react';
import { useAuth } from '@/components/auth';
import { useSubscription, type SubscriptionTier } from '@/hooks/useSubscription';
import {
  FREE_TIER,
  PRICING_TIERS,
  formatPrice,
  createCheckoutSession,
  redirectToCheckout,
  isStripeConfigured,
} from '@/lib/stripe';
import { cn } from '@/lib/utils/cn';

export function PricingPage() {
  const { user, profile, isConfigured: isAuthConfigured } = useAuth();
  const { subscription, tiers: dbTiers, isLoading: tiersLoading } = useSubscription();
  const [loading, setLoading] = React.useState<string | null>(null);
  const [billingInterval, setBillingInterval] = React.useState<'month' | 'year'>('month');

  // Use tiers from DB if available, otherwise fallback to static config
  const allTiers: SubscriptionTier[] = React.useMemo(() => {
    if (dbTiers.length > 0) {
      return dbTiers;
    }
    // Fallback to static tiers
    return [
      {
        id: FREE_TIER.id,
        name: FREE_TIER.name,
        description: 'Perfekt zum Starten',
        priceMonthly: FREE_TIER.price * 100,
        priceYearly: FREE_TIER.priceYearly * 100,
        maxVentures: FREE_TIER.limits.ventures,
        maxTeamMembers: FREE_TIER.limits.teamMembers,
        maxChatMessagesPerMonth: FREE_TIER.limits.chatMessages,
        maxDataRoomStorageMb: FREE_TIER.limits.dataRoomStorageMb,
        hasDocumentGeneration: FREE_TIER.featureFlags.hasDocumentGeneration,
        hasInvestorCrm: FREE_TIER.featureFlags.hasInvestorCrm,
        hasDataRoom: FREE_TIER.featureFlags.hasDataRoom,
        hasAnalytics: FREE_TIER.featureFlags.hasAnalytics,
        hasCustomBranding: FREE_TIER.featureFlags.hasCustomBranding,
        hasPrioritySupport: FREE_TIER.featureFlags.hasPrioritySupport,
        hasOnboardingCall: false,
        isPopular: false,
      },
      ...Object.values(PRICING_TIERS).map(tier => ({
        id: tier.id,
        name: tier.name,
        description: tier.features[0],
        priceMonthly: tier.price * 100,
        priceYearly: tier.priceYearly * 100,
        maxVentures: tier.limits.ventures,
        maxTeamMembers: tier.limits.teamMembers,
        maxChatMessagesPerMonth: tier.limits.chatMessages,
        maxDataRoomStorageMb: tier.limits.dataRoomStorageMb,
        hasDocumentGeneration: tier.featureFlags.hasDocumentGeneration,
        hasInvestorCrm: tier.featureFlags.hasInvestorCrm,
        hasDataRoom: tier.featureFlags.hasDataRoom,
        hasAnalytics: tier.featureFlags.hasAnalytics,
        hasCustomBranding: tier.featureFlags.hasCustomBranding,
        hasPrioritySupport: tier.featureFlags.hasPrioritySupport,
        hasOnboardingCall: tier.id === 'team',
        isPopular: tier.popular || false,
      })),
    ];
  }, [dbTiers]);

  const currentTier = subscription?.tierId ?? 'free';

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (!user || !profile) {
      window.location.href = '/login?redirect=/pricing';
      return;
    }

    if (tier.id === 'free') {
      window.location.href = '/app';
      return;
    }

    if (!isStripeConfigured()) {
      alert('Stripe ist nicht konfiguriert. Bitte kontaktiere den Support.');
      return;
    }

    setLoading(tier.id);

    try {
      const priceId = billingInterval === 'year'
        ? (PRICING_TIERS[tier.id]?.priceIdYearly || PRICING_TIERS[tier.id]?.priceId)
        : PRICING_TIERS[tier.id]?.priceId;

      if (!priceId) {
        throw new Error('No price ID configured');
      }

      const { sessionId } = await createCheckoutSession({
        priceId,
        userId: user.id,
        userEmail: user.email || '',
        successUrl: `${window.location.origin}/app?subscription=success`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`,
      });

      await redirectToCheckout(sessionId);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Es ist ein Fehler aufgetreten. Bitte versuche es erneut.');
    } finally {
      setLoading(null);
    }
  };

  const getDisplayPrice = (tier: SubscriptionTier) => {
    if (tier.priceMonthly === 0) return '0';
    const price = billingInterval === 'year'
      ? Math.round(tier.priceYearly / 12 / 100)
      : tier.priceMonthly / 100;
    return price.toString();
  };

  const tierIcons: Record<string, React.ReactNode> = {
    free: <Sparkles className="w-6 h-6" />,
    pro: <Zap className="w-6 h-6" />,
    team: <Users className="w-6 h-6" />,
  };

  const tierGradients: Record<string, string> = {
    free: 'from-charcoal/80 to-charcoal',
    pro: 'from-brand-600 to-brand-500',
    team: 'from-navy to-navy-700',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <span className="text-lg">🚀</span>
            </div>
            <span className="font-bold text-navy text-xl">LaunchOS</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <Link
                to="/app"
                className="text-sm text-charcoal/70 hover:text-navy flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Zurück zur App
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Anmelden
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-flex items-center px-3 py-1 bg-brand-100 text-brand-700 text-sm font-medium rounded-full mb-6">
              <Sparkles className="w-4 h-4 mr-1.5" />
              Pricing
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-navy mb-4">
              Wähle deinen Plan
            </h1>
            <p className="text-lg text-charcoal/70 max-w-2xl mx-auto">
              Starte kostenlos mit dem Builder's Toolkit. Upgrade wenn du bereit bist für mehr.
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 flex items-center justify-center gap-3"
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
              className="relative w-14 h-7 bg-navy/10 rounded-full transition-colors"
            >
              <div
                className={cn(
                  'absolute w-5 h-5 bg-brand-600 rounded-full top-1 transition-transform',
                  billingInterval === 'year' ? 'translate-x-8' : 'translate-x-1'
                )}
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
            <span className="ml-2 px-2 py-0.5 bg-sage/10 text-sage text-xs font-medium rounded-full">
              2 Monate gratis
            </span>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {allTiers.map((tier, index) => {
              const isCurrentPlan = currentTier === tier.id;
              const Icon = tierIcons[tier.id] || <Sparkles className="w-6 h-6" />;
              const gradient = tierGradients[tier.id] || tierGradients.free;

              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className={cn(
                    'bg-white rounded-2xl overflow-hidden flex flex-col relative',
                    tier.isPopular
                      ? 'border-2 border-brand-500 shadow-glow-brand ring-2 ring-brand-500/20'
                      : 'border border-navy/10'
                  )}
                >
                  {/* Popular Badge */}
                  {tier.isPopular && (
                    <div className="absolute -top-0 right-0 bg-brand-500 text-white px-3 py-1 text-xs font-medium rounded-bl-xl">
                      Beliebt
                    </div>
                  )}

                  {/* Header */}
                  <div className={cn('p-6 text-white bg-gradient-to-r', gradient)}>
                    <div className="flex items-center gap-3 mb-2">
                      {Icon}
                      <h3 className="text-xl font-bold">{tier.name}</h3>
                    </div>
                    <p className="text-white/80 text-sm">{tier.description}</p>
                  </div>

                  {/* Price */}
                  <div className="p-6 border-b border-navy/5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-navy">
                        {getDisplayPrice(tier)}
                      </span>
                      {tier.priceMonthly > 0 && (
                        <span className="text-charcoal/50">/Monat</span>
                      )}
                      {tier.priceMonthly === 0 && (
                        <span className="text-charcoal/50">Kostenlos</span>
                      )}
                    </div>
                    {billingInterval === 'year' && tier.priceYearly > 0 && (
                      <p className="text-sm text-charcoal/50 mt-1">
                        {formatPrice(tier.priceYearly / 100)} jährlich
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="p-6 space-y-4 flex-1">
                    {/* Toolkit */}
                    <div>
                      <p className="text-xs font-semibold text-charcoal/40 uppercase tracking-wider mb-2">
                        Toolkit
                      </p>
                      <FeatureItem included>Alle Guides</FeatureItem>
                      <FeatureItem included>Alle Checklists</FeatureItem>
                      <FeatureItem included>Alle Prompts</FeatureItem>
                    </div>

                    {/* Ventures */}
                    <div>
                      <p className="text-xs font-semibold text-charcoal/40 uppercase tracking-wider mb-2">
                        Ventures
                      </p>
                      <FeatureItem included>
                        {tier.maxVentures === -1 ? 'Unbegrenzt' : tier.maxVentures} Venture{tier.maxVentures !== 1 ? 's' : ''}
                      </FeatureItem>
                    </div>

                    {/* Chat */}
                    <div>
                      <p className="text-xs font-semibold text-charcoal/40 uppercase tracking-wider mb-2">
                        Chat
                      </p>
                      <FeatureItem included>
                        {tier.maxChatMessagesPerMonth === null
                          ? 'Unbegrenzte Nachrichten'
                          : `${tier.maxChatMessagesPerMonth} Nachrichten/Monat`}
                      </FeatureItem>
                      <FeatureItem included={tier.hasDocumentGeneration}>
                        Dokument-Generierung
                      </FeatureItem>
                    </div>

                    {/* CRM & Data Room */}
                    <div>
                      <p className="text-xs font-semibold text-charcoal/40 uppercase tracking-wider mb-2">
                        CRM & Data Room
                      </p>
                      <FeatureItem included={tier.hasInvestorCrm}>
                        Investor CRM
                      </FeatureItem>
                      <FeatureItem included={tier.hasDataRoom}>
                        Data Room {tier.maxDataRoomStorageMb > 0 && `(${tier.maxDataRoomStorageMb / 1024} GB)`}
                      </FeatureItem>
                      <FeatureItem included={tier.hasAnalytics}>
                        Analytics Dashboard
                      </FeatureItem>
                    </div>

                    {/* Team (only for team tier) */}
                    {tier.maxTeamMembers > 1 && (
                      <div>
                        <p className="text-xs font-semibold text-charcoal/40 uppercase tracking-wider mb-2">
                          Team
                        </p>
                        <FeatureItem included>
                          Bis zu {tier.maxTeamMembers} Team-Mitglieder
                        </FeatureItem>
                        <FeatureItem included={tier.hasCustomBranding}>
                          Custom Branding
                        </FeatureItem>
                      </div>
                    )}

                    {/* Support */}
                    <div>
                      <p className="text-xs font-semibold text-charcoal/40 uppercase tracking-wider mb-2">
                        Support
                      </p>
                      <FeatureItem included>Community</FeatureItem>
                      <FeatureItem included={tier.id !== 'free'}>
                        Email Support {tier.hasPrioritySupport && '(Priority)'}
                      </FeatureItem>
                      <FeatureItem included={tier.hasOnboardingCall}>
                        Onboarding Call
                      </FeatureItem>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="p-6 pt-0">
                    <button
                      onClick={() => handleSubscribe(tier)}
                      disabled={isCurrentPlan || loading === tier.id}
                      className={cn(
                        'w-full py-3 font-semibold rounded-xl transition-all flex items-center justify-center gap-2',
                        isCurrentPlan
                          ? 'bg-navy/5 text-charcoal/50 cursor-default'
                          : tier.isPopular
                          ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white hover:shadow-lg hover:shadow-brand-500/25'
                          : 'bg-navy text-white hover:bg-navy-700'
                      )}
                    >
                      {loading === tier.id ? (
                        'Laden...'
                      ) : isCurrentPlan ? (
                        'Aktueller Plan'
                      ) : tier.id === 'free' ? (
                        'Kostenlos starten'
                      ) : (
                        <>
                          Jetzt starten
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-20 px-4 bg-navy/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-navy text-center mb-12">
            Alle Features im Überblick
          </h2>

          <div className="bg-white rounded-2xl overflow-hidden shadow-soft">
            <table className="w-full">
              <thead>
                <tr className="border-b border-navy/10">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-navy">
                    Feature
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-navy">
                    Builder
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-brand-600">
                    Founder
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-navy">
                    Startup
                  </th>
                </tr>
              </thead>
              <tbody>
                {featureComparison.map((feature, i) => (
                  <tr key={i} className="border-b border-navy/5 last:border-0">
                    <td className="py-4 px-6 text-sm text-charcoal/70">
                      {feature.name}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <FeatureCheck value={feature.free} />
                    </td>
                    <td className="py-4 px-4 text-center bg-brand-50/50">
                      <FeatureCheck value={feature.pro} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <FeatureCheck value={feature.team} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="font-semibold text-navy mb-2">14 Tage Geld-zurück</h3>
              <p className="text-sm text-charcoal/60">
                Nicht zufrieden? Volle Erstattung, keine Fragen.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-sage/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-sage" />
              </div>
              <h3 className="font-semibold text-navy mb-2">Jederzeit kündbar</h3>
              <p className="text-sm text-charcoal/60">
                Keine Mindestlaufzeit, keine versteckten Kosten.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-semibold text-navy mb-2">Persönlicher Support</h3>
              <p className="text-sm text-charcoal/60">
                Echte Menschen, schnelle Antworten.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-navy/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-navy text-center mb-12">
            Häufige Fragen
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="bg-white rounded-xl p-6 group"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="font-medium text-navy pr-4">{faq.question}</span>
                  <HelpCircle className="w-5 h-5 text-charcoal/40 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-4 text-charcoal/70 text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-navy mb-4">
            Bereit durchzustarten?
          </h2>
          <p className="text-charcoal/70 mb-8">
            Starte kostenlos mit dem Builder's Toolkit. Upgrade jederzeit möglich.
          </p>
          <Link
            to={user ? '/app' : '/login'}
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl shadow-glow-brand transition-all"
          >
            Jetzt kostenlos starten
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-navy/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-charcoal/50">
            Alle Preise zzgl. MwSt. | Bei Fragen: support@launchos.io
          </p>
        </div>
      </footer>
    </div>
  );
}

// ==================== HELPERS ====================

function FeatureItem({ included, children }: { included: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 py-1">
      {included ? (
        <Check className="w-4 h-4 text-sage flex-shrink-0" />
      ) : (
        <X className="w-4 h-4 text-charcoal/20 flex-shrink-0" />
      )}
      <span className={included ? 'text-charcoal/70 text-sm' : 'text-charcoal/40 text-sm'}>
        {children}
      </span>
    </div>
  );
}

function FeatureCheck({ value }: { value: boolean | string | number }) {
  if (value === true) {
    return <Check className="w-5 h-5 text-sage mx-auto" />;
  }
  if (value === false) {
    return <span className="text-charcoal/30">—</span>;
  }
  return <span className="text-sm text-charcoal/70">{value}</span>;
}

const featureComparison = [
  { name: 'Toolkit (Guides, Checklists, Prompts)', free: true, pro: true, team: true },
  { name: 'Ventures', free: 1, pro: 3, team: '∞' },
  { name: 'Chat-Nachrichten', free: '30/Mo', pro: '∞', team: '∞' },
  { name: 'Dokument-Generierung', free: false, pro: true, team: true },
  { name: 'Investor CRM', free: false, pro: true, team: true },
  { name: 'Data Room', free: false, pro: '10 GB', team: '50 GB' },
  { name: 'Analytics Dashboard', free: false, pro: true, team: true },
  { name: 'Team-Mitglieder', free: 1, pro: 1, team: 5 },
  { name: 'Custom Branding', free: false, pro: false, team: true },
  { name: 'Priority Support', free: false, pro: false, team: true },
  { name: 'Onboarding Call', free: false, pro: false, team: true },
];

const faqs = [
  {
    question: 'Kann ich jederzeit kündigen?',
    answer:
      'Ja, du kannst dein Abo jederzeit kündigen. Nach der Kündigung hast du bis zum Ende des Abrechnungszeitraums Zugriff auf alle Features.',
  },
  {
    question: 'Was passiert mit meinen Daten wenn ich kündige?',
    answer:
      'Deine Daten bleiben 30 Tage nach der Kündigung erhalten. Du kannst sie jederzeit exportieren. Danach werden sie aus Datenschutzgründen gelöscht.',
  },
  {
    question: 'Gibt es eine Testphase?',
    answer:
      "Ja! Du kannst LaunchOS kostenlos mit dem Builder-Plan testen. Das Builder's Toolkit ist komplett kostenlos und bleibt es auch. Bei kostenpflichtigen Plänen hast du außerdem 14 Tage Geld-zurück-Garantie.",
  },
  {
    question: 'Kann ich meinen Plan jederzeit wechseln?',
    answer:
      'Ja, du kannst jederzeit upgraden oder downgraden. Bei einem Upgrade wird der Restbetrag verrechnet, bei einem Downgrade gilt der neue Plan ab dem nächsten Abrechnungszeitraum.',
  },
  {
    question: 'Was ist der Unterschied zwischen Builder und Founder?',
    answer:
      'Der Builder-Plan gibt dir vollen Zugriff auf das Toolkit, 1 Venture und 30 Chat-Nachrichten pro Monat. Mit dem Founder-Plan bekommst du unbegrenzte Chat-Nachrichten, bis zu 3 Ventures, Investor CRM, Data Room und Analytics.',
  },
];

export default PricingPage;
