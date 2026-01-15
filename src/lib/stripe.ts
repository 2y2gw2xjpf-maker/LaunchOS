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
  id: 'starter' | 'growth' | 'scale';
  name: string;
  price: number;
  currency: 'EUR';
  interval: 'month';
  priceId: string; // Stripe Price ID - set in Stripe Dashboard
  features: string[];
  limits: {
    projects: number; // -1 = unlimited
    analyses: number;
    aiRequests: number;
    teamMembers?: number;
  };
  popular?: boolean;
}

export const PRICING_TIERS: Record<string, PricingTier> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 49,
    currency: 'EUR',
    interval: 'month',
    priceId: import.meta.env.VITE_STRIPE_PRICE_STARTER || 'price_starter',
    features: [
      '3 Projekte',
      'Alle Bewertungsmethoden',
      'Action Plan Generator',
      'Progress Tracking',
      'Email Support',
    ],
    limits: {
      projects: 3,
      analyses: 10,
      aiRequests: 0,
    },
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    price: 99,
    currency: 'EUR',
    interval: 'month',
    priceId: import.meta.env.VITE_STRIPE_PRICE_GROWTH || 'price_growth',
    features: [
      'Unbegrenzte Projekte',
      'Alle Module',
      'AI Assistance (100 Anfragen/Monat)',
      'Investor Research',
      'Szenario-Vergleich',
      'Priority Support',
    ],
    limits: {
      projects: -1,
      analyses: -1,
      aiRequests: 100,
    },
    popular: true,
  },
  scale: {
    id: 'scale',
    name: 'Scale',
    price: 199,
    currency: 'EUR',
    interval: 'month',
    priceId: import.meta.env.VITE_STRIPE_PRICE_SCALE || 'price_scale',
    features: [
      'Alles aus Growth',
      'Team Features (bis 5 User)',
      'API Access',
      'Custom Exports',
      'Pitch Deck Generator',
      'Dedicated Support',
    ],
    limits: {
      projects: -1,
      analyses: -1,
      aiRequests: 500,
      teamMembers: 5,
    },
  },
};

// Free tier for comparison
export const FREE_TIER = {
  id: 'free',
  name: 'Free',
  price: 0,
  features: [
    '1 Projekt',
    'Basis-Bewertung (Berkus)',
    'Route-Empfehlung',
    'Community Support',
  ],
  limits: {
    projects: 1,
    analyses: 3,
    aiRequests: 0,
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
  // In production, this would call your backend API
  // which creates a Stripe Checkout Session
  const response = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
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
  // In production, this would call your backend API
  const response = await fetch('/api/stripe/create-portal-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ customerId }),
  });

  if (!response.ok) {
    throw new Error('Failed to create billing portal session');
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
  requiredTier: 'starter' | 'growth' | 'scale'
): boolean => {
  const tierOrder = ['free', 'starter', 'growth', 'scale'];
  const userIndex = tierOrder.indexOf(userTier);
  const requiredIndex = tierOrder.indexOf(requiredTier);
  return userIndex >= requiredIndex;
};

export const getRemainingLimits = (
  userTier: string,
  currentUsage: { projects: number; analyses: number; aiRequests: number }
) => {
  const tier = PRICING_TIERS[userTier] || FREE_TIER;
  const limits = tier.limits;

  return {
    projects: limits.projects === -1 ? Infinity : limits.projects - currentUsage.projects,
    analyses: limits.analyses === -1 ? Infinity : limits.analyses - currentUsage.analyses,
    aiRequests: limits.aiRequests - currentUsage.aiRequests,
  };
};
