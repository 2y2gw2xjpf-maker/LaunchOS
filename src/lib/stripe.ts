import { loadStripe } from '@stripe/stripe-js';

// Stripe publishable key from environment
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

// Stripe instance (lazy loaded)
let stripePromise: ReturnType<typeof loadStripe> | null = null;

export const getStripe = () => {
  if (!stripePromise && stripePublishableKey) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

// ==================== PRICING CONFIGURATION ====================

export interface PricingTier {
  id: 'free' | 'pro' | 'team';
  name: string;
  price: number;
  priceYearly: number;
  currency: 'EUR';
  interval: 'month';
  priceId: string; // Stripe Price ID - set in Stripe Dashboard
  priceIdYearly?: string; // Optional yearly Price ID
  features: string[];
  limits: {
    ventures: number; // -1 = unlimited
    chatMessages: number | null; // null = unlimited
    dataRoomStorageMb: number;
    teamMembers: number;
  };
  featureFlags: {
    hasDocumentGeneration: boolean;
    hasInvestorCrm: boolean;
    hasDataRoom: boolean;
    hasAnalytics: boolean;
    hasCustomBranding: boolean;
    hasPrioritySupport: boolean;
  };
  popular?: boolean;
}

export const PRICING_TIERS: Record<string, PricingTier> = {
  pro: {
    id: 'pro',
    name: 'Founder',
    price: 29,
    priceYearly: 249,
    currency: 'EUR',
    interval: 'month',
    priceId: import.meta.env.VITE_STRIPE_PRICE_PRO || 'price_pro',
    priceIdYearly: import.meta.env.VITE_STRIPE_PRICE_PRO_YEAR || 'price_pro_year',
    features: [
      'Unbegrenzte Chat-Nachrichten',
      'Dokument-Generierung',
      'Investor CRM mit Kanban',
      'Sicherer Data Room (10 GB)',
      'Analytics Dashboard',
      'Bis zu 3 Ventures',
      'Email Support',
    ],
    limits: {
      ventures: 3,
      chatMessages: null, // unlimited
      dataRoomStorageMb: 10240, // 10 GB
      teamMembers: 1,
    },
    featureFlags: {
      hasDocumentGeneration: true,
      hasInvestorCrm: true,
      hasDataRoom: true,
      hasAnalytics: true,
      hasCustomBranding: false,
      hasPrioritySupport: false,
    },
    popular: true,
  },
  team: {
    id: 'team',
    name: 'Startup',
    price: 79,
    priceYearly: 699,
    currency: 'EUR',
    interval: 'month',
    priceId: import.meta.env.VITE_STRIPE_PRICE_TEAM || 'price_team',
    priceIdYearly: import.meta.env.VITE_STRIPE_PRICE_TEAM_YEAR || 'price_team_year',
    features: [
      'Alles aus Founder',
      'Unbegrenzte Ventures',
      'Bis zu 5 Team-Mitglieder',
      'Data Room (50 GB)',
      'Custom Branding',
      'Detaillierte Analytics',
      'Priority Support (24h)',
      'Onboarding Call (30 min)',
    ],
    limits: {
      ventures: -1, // unlimited
      chatMessages: null, // unlimited
      dataRoomStorageMb: 51200, // 50 GB
      teamMembers: 5,
    },
    featureFlags: {
      hasDocumentGeneration: true,
      hasInvestorCrm: true,
      hasDataRoom: true,
      hasAnalytics: true,
      hasCustomBranding: true,
      hasPrioritySupport: true,
    },
  },
};

// Free tier for comparison
export const FREE_TIER: PricingTier = {
  id: 'free',
  name: 'Builder',
  price: 0,
  priceYearly: 0,
  currency: 'EUR',
  interval: 'month',
  priceId: '',
  features: [
    'Alle Toolkit-Guides',
    'Alle Checklists (interaktiv)',
    'Alle Prompts',
    '1 Venture',
    '30 Chat-Nachrichten/Monat',
    'Community Support',
  ],
  limits: {
    ventures: 1,
    chatMessages: 30,
    dataRoomStorageMb: 0,
    teamMembers: 1,
  },
  featureFlags: {
    hasDocumentGeneration: false,
    hasInvestorCrm: false,
    hasDataRoom: false,
    hasAnalytics: false,
    hasCustomBranding: false,
    hasPrioritySupport: false,
  },
};

// ==================== CHECKOUT HELPERS ====================

export interface CheckoutOptions {
  priceId: string;
  userId: string;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export const createCheckoutSession = async (options: CheckoutOptions) => {
  // Call Supabase Edge Function for checkout
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create checkout session');
  }

  const data = await response.json();
  return data;
};

export const redirectToCheckout = async (sessionId: string) => {
  const stripeInstance = await getStripe();
  if (!stripeInstance) {
    throw new Error('Stripe not configured');
  }

  // Use the Stripe.js redirect method
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (stripeInstance as any).redirectToCheckout({ sessionId });
  if (result?.error) {
    throw result.error;
  }
};

export const createBillingPortalSession = async (customerId: string) => {
  // Call Supabase Edge Function for billing portal
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const response = await fetch(`${supabaseUrl}/functions/v1/create-billing-portal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ customerId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create billing portal session');
  }

  const data = await response.json();
  return data;
};

// ==================== UTILITY ====================

export const formatPrice = (price: number, currency: string = 'EUR') => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const isStripeConfigured = () => {
  return Boolean(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
};

export const getTierByPriceId = (priceId: string): PricingTier | undefined => {
  return Object.values(PRICING_TIERS).find((tier) => tier.priceId === priceId);
};

export const canAccessFeature = (
  userTier: string,
  requiredTier: 'free' | 'pro' | 'team'
): boolean => {
  const tierOrder = ['free', 'pro', 'team'];
  const userIndex = tierOrder.indexOf(userTier);
  const requiredIndex = tierOrder.indexOf(requiredTier);
  return userIndex >= requiredIndex;
};

export const getRemainingLimits = (
  userTier: string,
  currentUsage: { ventures: number; chatMessages: number }
) => {
  const tier = PRICING_TIERS[userTier] || FREE_TIER;
  const limits = tier.limits;

  return {
    ventures: limits.ventures === -1 ? Infinity : limits.ventures - currentUsage.ventures,
    chatMessages: limits.chatMessages === null ? Infinity : limits.chatMessages - currentUsage.chatMessages,
    dataRoomStorageMb: limits.dataRoomStorageMb,
    teamMembers: limits.teamMembers,
  };
};

export const hasFeatureAccess = (
  userTier: string,
  feature: keyof PricingTier['featureFlags']
): boolean => {
  const tier = PRICING_TIERS[userTier] || FREE_TIER;
  return tier.featureFlags[feature] || false;
};
