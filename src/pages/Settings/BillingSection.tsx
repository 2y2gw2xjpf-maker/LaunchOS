import * as React from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth, useSubscription } from '@/components/auth/AuthProvider';
import { PRICING_TIERS, formatPrice } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export default function BillingSection() {
  const { profile } = useAuth();
  const { tier, status, isActive, isPaid } = useSubscription();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const currentTier = PRICING_TIERS[tier] || null;

  // Open Stripe Billing Portal
  const handleManageBilling = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get user session for auth header
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Nicht eingeloggt');
      }

      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Fehler beim Öffnen des Billing Portals');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Status badge
  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
            <CheckCircle className="w-3 h-3" />
            Aktiv
          </span>
        );
      case 'trialing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
            <Clock className="w-3 h-3" />
            Testphase
          </span>
        );
      case 'past_due':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full">
            <AlertCircle className="w-3 h-3" />
            Zahlung überfällig
          </span>
        );
      case 'canceled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">
            <AlertCircle className="w-3 h-3" />
            Gekündigt
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Current Plan */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 shadow-soft">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-text-primary">
                {isPaid ? currentTier?.name : 'Free'} Plan
              </h3>
              {getStatusBadge()}
            </div>

            {isPaid && currentTier ? (
              <p className="text-2xl font-bold text-text-primary">
                {formatPrice(currentTier.price)}
                <span className="text-sm font-normal text-text-muted">/Monat</span>
              </p>
            ) : (
              <p className="text-text-secondary">
                1 Projekt gratis, danach Upgrade erforderlich
              </p>
            )}
          </div>

          {isPaid && (
            <button
              onClick={handleManageBilling}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white text-purple-700 border border-purple-200 rounded-lg transition-colors hover:bg-purple-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              Abrechnung verwalten
            </button>
          )}
        </div>

        {/* Features */}
        {currentTier && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          {currentTier.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-text-secondary">
              <CheckCircle className="w-4 h-4 text-purple-500" />
              {feature}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>

      {/* Upgrade CTA for Free Users */}
      {!isPaid && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 shadow-glow-mixed"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-grow">
            <h4 className="text-lg font-bold text-white mb-1">Upgrade auf einen Premium Plan</h4>
            <p className="text-white/80 text-sm mb-4">
              Schalte alle Features frei: unbegrenzte Projekte, AI-Assistance, Investor Research und mehr.
            </p>
              <a
                href="/pricing"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-purple-600 font-semibold rounded-lg hover:bg-white/90 transition-colors"
              >
                Pläne ansehen
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </motion.div>
      )}

      {/* Usage Stats */}
      <div>
        <h4 className="text-lg font-semibold text-text-primary mb-4">Nutzung</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UsageCard
            label="Ventures"
            used={1}
            limit={currentTier?.limits.ventures ?? 1}
          />
          <UsageCard
            label="Chat-Nachrichten"
            used={10}
            limit={currentTier?.limits.chatMessages ?? 30}
          />
          <UsageCard
            label="Team-Mitglieder"
            used={1}
            limit={currentTier?.limits.teamMembers ?? 1}
          />
        </div>
      </div>

      {/* Payment History */}
      {isPaid && (
        <div>
          <h4 className="text-lg font-semibold text-text-primary mb-4">Zahlungshistorie</h4>
          <div className="bg-white rounded-lg overflow-hidden border border-purple-100 shadow-soft">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-100 bg-purple-50/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">Datum</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">Beschreibung</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-text-muted">Betrag</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-text-muted">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-purple-100">
                  <td className="px-4 py-3 text-sm text-text-secondary">15. Jan 2026</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{currentTier?.name} Plan - Monatlich</td>
                  <td className="px-4 py-3 text-sm text-text-primary text-right">{formatPrice(currentTier?.price ?? 0)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Bezahlt
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-text-muted mt-2">
            Für detaillierte Rechnungen besuche das{' '}
            <button onClick={handleManageBilling} className="text-purple-600 hover:text-purple-500">
              Stripe Billing Portal
            </button>
          </p>
        </div>
      )}

      {/* Stripe Customer ID (Debug) */}
      {profile?.stripe_customer_id && (
        <div className="text-xs text-text-muted">
          Customer ID: {profile.stripe_customer_id}
        </div>
      )}
    </div>
  );
}

// ==================== Usage Card ====================

interface UsageCardProps {
  label: string;
  used: number;
  limit: number;
}

function UsageCard({ label, used, limit }: UsageCardProps) {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min(100, (used / limit) * 100);
  const isNearLimit = !isUnlimited && percentage >= 80;
  const isAtLimit = !isUnlimited && percentage >= 100;

  return (
    <div className="bg-white border border-purple-100 rounded-lg p-4 shadow-soft">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-text-muted">{label}</span>
        <span className="text-sm font-medium text-text-primary">
          {used} / {isUnlimited ? '∞' : limit}
        </span>
      </div>
      <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isAtLimit
              ? 'bg-red-500'
              : isNearLimit
              ? 'bg-yellow-500'
              : 'bg-gradient-to-r from-purple-500 to-pink-500'
          }`}
          style={{ width: isUnlimited ? '10%' : `${percentage}%` }}
        />
      </div>
      {isAtLimit && (
        <p className="text-xs text-red-600 mt-1">Limit erreicht - Upgrade erforderlich</p>
      )}
    </div>
  );
}
