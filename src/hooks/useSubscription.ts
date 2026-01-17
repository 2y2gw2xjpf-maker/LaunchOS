import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth';

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  maxVentures: number;
  maxTeamMembers: number;
  maxChatMessagesPerMonth: number | null; // null = unlimited
  maxDataRoomStorageMb: number;
  hasDocumentGeneration: boolean;
  hasInvestorCrm: boolean;
  hasDataRoom: boolean;
  hasAnalytics: boolean;
  hasCustomBranding: boolean;
  hasPrioritySupport: boolean;
  hasOnboardingCall: boolean;
  isPopular: boolean;
}

export interface UserSubscription {
  tierId: string;
  tier: SubscriptionTier;
  billingCycle: 'monthly' | 'yearly' | null;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: Date | null;
  chatMessagesThisMonth: number;
  chatMessagesRemaining: number | null; // null = unlimited
}

export interface ChatLimitStatus {
  tier: string;
  current: number;
  limit: number | null;
  canSend: boolean;
  remaining: number | null;
}

export type FeatureName =
  | 'document_generation'
  | 'investor_crm'
  | 'data_room'
  | 'analytics'
  | 'custom_branding'
  | 'priority_support';

// ══════════════════════════════════════════════════════════════════════════════
// HOOK
// ══════════════════════════════════════════════════════════════════════════════

interface UseSubscriptionReturn {
  // Data
  subscription: UserSubscription | null;
  tiers: SubscriptionTier[];
  chatLimit: ChatLimitStatus | null;

  // Loading
  isLoading: boolean;
  error: string | null;

  // Feature Checks
  canUseFeature: (feature: FeatureName) => boolean;
  canCreateVenture: (currentCount: number) => boolean;
  canSendChatMessage: () => boolean;
  canAddTeamMember: (currentCount: number) => boolean;

  // Tier Info
  getCurrentTier: () => SubscriptionTier | null;
  isFreeTier: () => boolean;
  isProTier: () => boolean;
  isTeamTier: () => boolean;

  // Actions
  refreshSubscription: () => Promise<void>;
  incrementChatCount: () => Promise<void>;

  // Upgrade
  getUpgradeUrl: (tierId: string, yearly?: boolean) => string;
}

// Default free tier for fallback
const DEFAULT_FREE_TIER: SubscriptionTier = {
  id: 'free',
  name: 'Builder',
  description: 'Perfekt zum Starten. Toolkit + 1 Venture + 30 Chat-Nachrichten.',
  priceMonthly: 0,
  priceYearly: 0,
  maxVentures: 1,
  maxTeamMembers: 1,
  maxChatMessagesPerMonth: 30,
  maxDataRoomStorageMb: 0,
  hasDocumentGeneration: false,
  hasInvestorCrm: false,
  hasDataRoom: false,
  hasAnalytics: false,
  hasCustomBranding: false,
  hasPrioritySupport: false,
  hasOnboardingCall: false,
  isPopular: false,
};

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuth();

  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [chatLimit, setChatLimit] = useState<ChatLimitStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ════════════════════════════════════════════════════════════════════════════
  // HELPER: Transform DB row to SubscriptionTier
  // ════════════════════════════════════════════════════════════════════════════

  const transformTier = (t: Record<string, unknown>): SubscriptionTier => ({
    id: t.id as string,
    name: t.name as string,
    description: t.description as string || '',
    priceMonthly: t.price_monthly as number || 0,
    priceYearly: t.price_yearly as number || 0,
    maxVentures: t.max_ventures as number || 1,
    maxTeamMembers: t.max_team_members as number || 1,
    maxChatMessagesPerMonth: t.max_chat_messages_per_month as number | null,
    maxDataRoomStorageMb: t.max_data_room_storage_mb as number || 0,
    hasDocumentGeneration: t.has_document_generation as boolean || false,
    hasInvestorCrm: t.has_investor_crm as boolean || false,
    hasDataRoom: t.has_data_room as boolean || false,
    hasAnalytics: t.has_analytics as boolean || false,
    hasCustomBranding: t.has_custom_branding as boolean || false,
    hasPrioritySupport: t.has_priority_support as boolean || false,
    hasOnboardingCall: t.has_onboarding_call as boolean || false,
    isPopular: t.is_popular as boolean || false,
  });

  // ════════════════════════════════════════════════════════════════════════════
  // DATA LOADING
  // ════════════════════════════════════════════════════════════════════════════

  const loadTiers = useCallback(async () => {
    try {
      const { data, error: tiersError } = await supabase
        .from('subscription_tiers')
        .select('*')
        .order('sort_order');

      if (tiersError) {
        console.warn('Could not load subscription tiers:', tiersError);
        // Return default tiers if table doesn't exist yet
        setTiers([DEFAULT_FREE_TIER]);
        return;
      }

      if (data && data.length > 0) {
        setTiers(data.map(transformTier));
      } else {
        setTiers([DEFAULT_FREE_TIER]);
      }
    } catch (err) {
      console.warn('Error loading tiers:', err);
      setTiers([DEFAULT_FREE_TIER]);
    }
  }, []);

  const loadSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      return;
    }

    try {
      // Try to get subscription via RPC function
      const { data, error: subError } = await supabase.rpc('get_user_subscription', {
        p_user_id: user.id
      });

      if (subError) {
        console.warn('Could not load subscription via RPC:', subError);
        // Fallback: set default free subscription
        const freeTier = tiers.find(t => t.id === 'free') || DEFAULT_FREE_TIER;
        setSubscription({
          tierId: 'free',
          tier: freeTier,
          billingCycle: null,
          status: 'active',
          currentPeriodEnd: null,
          chatMessagesThisMonth: 0,
          chatMessagesRemaining: freeTier.maxChatMessagesPerMonth,
        });
        return;
      }

      if (data) {
        const subData = data.subscription;
        const tierData = data.tier;
        const tier = transformTier(tierData);

        setSubscription({
          tierId: subData.tier_id,
          tier,
          billingCycle: subData.billing_cycle,
          status: subData.status,
          currentPeriodEnd: subData.current_period_end ? new Date(subData.current_period_end) : null,
          chatMessagesThisMonth: subData.chat_messages_this_month || 0,
          chatMessagesRemaining: tier.maxChatMessagesPerMonth
            ? Math.max(tier.maxChatMessagesPerMonth - (subData.chat_messages_this_month || 0), 0)
            : null,
        });
      }
    } catch (err) {
      console.warn('Error loading subscription:', err);
      // Set default free subscription
      const freeTier = tiers.find(t => t.id === 'free') || DEFAULT_FREE_TIER;
      setSubscription({
        tierId: 'free',
        tier: freeTier,
        billingCycle: null,
        status: 'active',
        currentPeriodEnd: null,
        chatMessagesThisMonth: 0,
        chatMessagesRemaining: freeTier.maxChatMessagesPerMonth,
      });
    }
  }, [user, tiers]);

  const loadChatLimit = useCallback(async () => {
    if (!user) {
      setChatLimit(null);
      return;
    }

    try {
      const { data, error: limitError } = await supabase.rpc('check_chat_limit', {
        p_user_id: user.id
      });

      if (limitError) {
        console.warn('Could not check chat limit:', limitError);
        // Default to free tier limits
        setChatLimit({
          tier: 'free',
          current: 0,
          limit: 30,
          canSend: true,
          remaining: 30,
        });
        return;
      }

      setChatLimit(data);
    } catch (err) {
      console.warn('Error checking chat limit:', err);
      setChatLimit({
        tier: 'free',
        current: 0,
        limit: 30,
        canSend: true,
        remaining: 30,
      });
    }
  }, [user]);

  // ════════════════════════════════════════════════════════════════════════════
  // FEATURE CHECKS
  // ════════════════════════════════════════════════════════════════════════════

  const canUseFeature = useCallback((feature: FeatureName): boolean => {
    if (!subscription) return false;

    switch (feature) {
      case 'document_generation':
        return subscription.tier.hasDocumentGeneration;
      case 'investor_crm':
        return subscription.tier.hasInvestorCrm;
      case 'data_room':
        return subscription.tier.hasDataRoom;
      case 'analytics':
        return subscription.tier.hasAnalytics;
      case 'custom_branding':
        return subscription.tier.hasCustomBranding;
      case 'priority_support':
        return subscription.tier.hasPrioritySupport;
      default:
        return false;
    }
  }, [subscription]);

  const canCreateVenture = useCallback((currentCount: number): boolean => {
    if (!subscription) return false;
    if (subscription.tier.maxVentures === -1) return true; // unlimited
    return currentCount < subscription.tier.maxVentures;
  }, [subscription]);

  const canSendChatMessage = useCallback((): boolean => {
    if (!chatLimit) return true; // Allow by default if not loaded
    return chatLimit.canSend;
  }, [chatLimit]);

  const canAddTeamMember = useCallback((currentCount: number): boolean => {
    if (!subscription) return false;
    return currentCount < subscription.tier.maxTeamMembers;
  }, [subscription]);

  // ════════════════════════════════════════════════════════════════════════════
  // TIER INFO
  // ════════════════════════════════════════════════════════════════════════════

  const getCurrentTier = useCallback((): SubscriptionTier | null => {
    return subscription?.tier || null;
  }, [subscription]);

  const isFreeTier = useCallback((): boolean => {
    return subscription?.tierId === 'free';
  }, [subscription]);

  const isProTier = useCallback((): boolean => {
    return subscription?.tierId === 'pro';
  }, [subscription]);

  const isTeamTier = useCallback((): boolean => {
    return subscription?.tierId === 'team';
  }, [subscription]);

  // ════════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ════════════════════════════════════════════════════════════════════════════

  const refreshSubscription = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await loadTiers();
      await loadSubscription();
      await loadChatLimit();
    } catch (err) {
      console.error('Error loading subscription:', err);
      setError('Fehler beim Laden des Abonnements');
    } finally {
      setIsLoading(false);
    }
  }, [loadTiers, loadSubscription, loadChatLimit]);

  const incrementChatCount = useCallback(async () => {
    if (!user) return;

    try {
      await supabase.rpc('increment_chat_count', {
        p_user_id: user.id
      });

      // Refresh chat limit
      await loadChatLimit();
    } catch (err) {
      console.warn('Error incrementing chat count:', err);
    }
  }, [user, loadChatLimit]);

  const getUpgradeUrl = useCallback((tierId: string, yearly = false): string => {
    return `/pricing?plan=${tierId}&cycle=${yearly ? 'yearly' : 'monthly'}`;
  }, []);

  // ════════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ════════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        await loadTiers();
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [loadTiers]);

  useEffect(() => {
    if (tiers.length > 0) {
      loadSubscription();
      loadChatLimit();
    }
  }, [tiers, user, loadSubscription, loadChatLimit]);

  return {
    subscription,
    tiers,
    chatLimit,
    isLoading,
    error,
    canUseFeature,
    canCreateVenture,
    canSendChatMessage,
    canAddTeamMember,
    getCurrentTier,
    isFreeTier,
    isProTier,
    isTeamTier,
    refreshSubscription,
    incrementChatCount,
    getUpgradeUrl,
  };
}
