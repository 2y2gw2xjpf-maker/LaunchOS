import * as React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowLeft, ArrowRight, HelpCircle, Shield, Zap, Users } from 'lucide-react';
import { useAuth, useSubscription } from '@/components/auth';
import {
  PRICING_TIERS,
  FREE_TIER,
  formatPrice,
  createCheckoutSession,
  redirectToCheckout,
  isStripeConfigured,
} from '@/lib/stripe';
import { cn } from '@/lib/utils/cn';

export function PricingPage() {
  const { user, profile, isConfigured: isAuthConfigured } = useAuth();
  const { tier: currentTier } = useSubscription();
  const [loading, setLoading] = React.useState<string | null>(null);
  const [billingInterval, setBillingInterval] = React.useState<'month' | 'year'>('month');

  const handleSubscribe = async (priceId: string, tierId: string) => {
    if (!user || !profile) {
      // Redirect to login
      window.location.href = '/login?redirect=/pricing';
      return;
    }

    if (!isStripeConfigured()) {
      alert('Stripe ist nicht konfiguriert. Bitte kontaktiere den Support.');
      return;
    }

    setLoading(tierId);

    try {
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

  // Yearly discount
  const yearlyDiscount = 0.2; // 20% off

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
              Starte kostenlos und upgrade wenn du wächst.
              Keine versteckten Kosten, jederzeit kündbar.
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
              20% sparen
            </span>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            {/* Free Tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-navy/10 p-6 flex flex-col"
            >
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-navy">{FREE_TIER.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-navy">€0</span>
                  <span className="text-charcoal/50 text-sm">/Monat</span>
                </div>
              </div>

              <ul className="space-y-3 flex-1">
                {FREE_TIER.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-sage shrink-0 mt-0.5" />
                    <span className="text-sm text-charcoal/70">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={user ? '/app' : '/login'}
                className="mt-6 w-full py-3 text-center text-navy bg-navy/5 hover:bg-navy/10 font-medium rounded-xl transition-colors"
              >
                {currentTier === 'free' ? 'Aktueller Plan' : 'Kostenlos starten'}
              </Link>
            </motion.div>

            {/* Paid Tiers */}
            {Object.values(PRICING_TIERS).map((tier, index) => {
              const isCurrentTier = currentTier === tier.id;
              const price =
                billingInterval === 'year'
                  ? Math.round(tier.price * 12 * (1 - yearlyDiscount))
                  : tier.price;

              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + (index + 1) * 0.1 }}
                  className={cn(
                    'bg-white rounded-2xl p-6 flex flex-col relative',
                    tier.popular
                      ? 'border-2 border-brand-500 shadow-glow-brand'
                      : 'border border-navy/10'
                  )}
                >
                  {/* Popular Badge */}
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center px-3 py-1 bg-brand-600 text-white text-xs font-medium rounded-full">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Beliebt
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-navy">{tier.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-navy">
                        {formatPrice(price)}
                      </span>
                      <span className="text-charcoal/50 text-sm">
                        /{billingInterval === 'year' ? 'Jahr' : 'Monat'}
                      </span>
                    </div>
                    {billingInterval === 'year' && (
                      <p className="text-xs text-sage mt-1">
                        {formatPrice(Math.round(price / 12))}/Monat
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 flex-1">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-sage shrink-0 mt-0.5" />
                        <span className="text-sm text-charcoal/70">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(tier.priceId, tier.id)}
                    disabled={isCurrentTier || loading === tier.id}
                    className={cn(
                      'mt-6 w-full py-3 font-medium rounded-xl transition-all flex items-center justify-center gap-2',
                      isCurrentTier
                        ? 'bg-navy/5 text-navy cursor-default'
                        : tier.popular
                        ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-glow-brand'
                        : 'bg-navy text-white hover:bg-navy-700'
                    )}
                  >
                    {loading === tier.id ? (
                      'Laden...'
                    ) : isCurrentTier ? (
                      'Aktueller Plan'
                    ) : (
                      <>
                        Jetzt starten
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
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
                    Free
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-navy">
                    Starter
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-brand-600">
                    Growth
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-navy">
                    Scale
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
                    <td className="py-4 px-4 text-center">
                      <FeatureCheck value={feature.starter} />
                    </td>
                    <td className="py-4 px-4 text-center bg-brand-50/50">
                      <FeatureCheck value={feature.growth} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <FeatureCheck value={feature.scale} />
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
            Starte kostenlos und upgrade wenn du bereit bist.
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
            Alle Preise zzgl. MwSt. • Bei Fragen: support@launchos.io
          </p>
        </div>
      </footer>
    </div>
  );
}

// ==================== HELPERS ====================

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
  { name: 'Projekte', free: 1, starter: 3, growth: '∞', scale: '∞' },
  { name: 'Analysen', free: 3, starter: 10, growth: '∞', scale: '∞' },
  { name: 'Bewertungsmethoden', free: 1, starter: true, growth: true, scale: true },
  { name: 'Action Plan Generator', free: true, starter: true, growth: true, scale: true },
  { name: 'Progress Tracking', free: false, starter: true, growth: true, scale: true },
  { name: 'Szenario-Vergleich', free: false, starter: false, growth: true, scale: true },
  { name: 'AI Assistance', free: false, starter: false, growth: '100/Mo', scale: '500/Mo' },
  { name: 'Investor Research', free: false, starter: false, growth: true, scale: true },
  { name: 'Team Members', free: 1, starter: 1, growth: 1, scale: 5 },
  { name: 'API Access', free: false, starter: false, growth: false, scale: true },
  { name: 'Priority Support', free: false, starter: false, growth: true, scale: true },
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
      'Ja! Du kannst LaunchOS kostenlos mit dem Free-Plan testen. Bei kostenpflichtigen Plänen hast du außerdem 14 Tage Geld-zurück-Garantie.',
  },
  {
    question: 'Kann ich meinen Plan jederzeit wechseln?',
    answer:
      'Ja, du kannst jederzeit upgraden oder downgraden. Bei einem Upgrade wird der Restbetrag verrechnet, bei einem Downgrade gilt der neue Plan ab dem nächsten Abrechnungszeitraum.',
  },
  {
    question: 'Wie funktioniert die AI Assistance?',
    answer:
      'Die AI Assistance hilft dir bei der Erstellung von Pitch Decks, Investor Research und mehr. Du erhältst je nach Plan eine bestimmte Anzahl an AI-Anfragen pro Monat.',
  },
];

export default PricingPage;
