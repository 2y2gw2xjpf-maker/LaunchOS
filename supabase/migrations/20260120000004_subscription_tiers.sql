-- ══════════════════════════════════════════════════════════════════════════════
-- LAUNCHOS SUBSCRIPTION TIERS & USER SUBSCRIPTIONS
-- Migration: 20260120000004_subscription_tiers.sql
--
-- Creates the subscription tier system with:
-- - subscription_tiers: Available plans (free, pro, team)
-- - user_subscriptions: User subscription status and usage tracking
-- - Functions for chat limit checking and incrementing
-- ══════════════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════════════
-- SUBSCRIPTION TIERS TABLE
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS subscription_tiers (
  id TEXT PRIMARY KEY, -- 'free', 'pro', 'team'
  name TEXT NOT NULL,
  description TEXT,
  price_monthly INTEGER DEFAULT 0, -- in Cents
  price_yearly INTEGER DEFAULT 0, -- in Cents

  -- Limits
  max_ventures INTEGER DEFAULT 1,
  max_team_members INTEGER DEFAULT 1,
  max_chat_messages_per_month INTEGER, -- NULL = unlimited
  max_data_room_storage_mb INTEGER DEFAULT 0,

  -- Feature Flags
  has_document_generation BOOLEAN DEFAULT false,
  has_investor_crm BOOLEAN DEFAULT false,
  has_data_room BOOLEAN DEFAULT false,
  has_analytics BOOLEAN DEFAULT false,
  has_custom_branding BOOLEAN DEFAULT false,
  has_priority_support BOOLEAN DEFAULT false,
  has_onboarding_call BOOLEAN DEFAULT false,

  -- Display
  is_popular BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;

-- Everyone can read tiers (public pricing info)
DROP POLICY IF EXISTS "Anyone can read subscription tiers" ON subscription_tiers;
CREATE POLICY "Anyone can read subscription tiers"
  ON subscription_tiers FOR SELECT
  USING (true);

-- ══════════════════════════════════════════════════════════════════════════════
-- SEED SUBSCRIPTION TIERS
-- ══════════════════════════════════════════════════════════════════════════════

-- Delete existing and insert fresh data
DELETE FROM subscription_tiers WHERE id IN ('free', 'pro', 'team');

INSERT INTO subscription_tiers (
  id, name, description,
  price_monthly, price_yearly,
  max_ventures, max_team_members, max_chat_messages_per_month, max_data_room_storage_mb,
  has_document_generation, has_investor_crm, has_data_room, has_analytics,
  has_custom_branding, has_priority_support, has_onboarding_call,
  is_popular, sort_order
) VALUES
(
  'free',
  'Builder',
  'Perfekt zum Starten. Toolkit + 1 Venture + 30 Chat-Nachrichten.',
  0, 0,
  1, 1, 30, 0,
  false, false, false, false,
  false, false, false,
  false, 1
),
(
  'pro',
  'Founder',
  'Für ernsthafte Gründer. Unbegrenzter Chat + CRM + Data Room.',
  2900, 24900, -- €29/Monat, €249/Jahr
  3, 1, NULL, 10240, -- NULL = unlimited chat, 10 GB storage
  true, true, true, true,
  false, false, false,
  true, 2 -- is_popular
),
(
  'team',
  'Startup',
  'Für Gründer-Teams. Alles aus Pro + Team-Features + Priority Support.',
  7900, 69900, -- €79/Monat, €699/Jahr
  -1, 5, NULL, 51200, -- -1 = unlimited ventures, 50 GB storage
  true, true, true, true,
  true, true, true,
  false, 3
);

-- ══════════════════════════════════════════════════════════════════════════════
-- USER SUBSCRIPTIONS TABLE
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Plan
  tier_id TEXT NOT NULL DEFAULT 'free' REFERENCES subscription_tiers(id),

  -- Billing
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly', NULL)),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,

  -- Dates
  started_at TIMESTAMPTZ DEFAULT NOW(),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,

  -- Usage Tracking
  chat_messages_this_month INTEGER DEFAULT 0,
  chat_messages_reset_at TIMESTAMPTZ DEFAULT NOW(),

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own subscription (for initial creation)
DROP POLICY IF EXISTS "Users can create own subscription" ON user_subscriptions;
CREATE POLICY "Users can create own subscription"
  ON user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier ON user_subscriptions(tier_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe ON user_subscriptions(stripe_customer_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- CHAT LIMIT FUNCTIONS
-- ══════════════════════════════════════════════════════════════════════════════

-- Function to check chat limit for a user
CREATE OR REPLACE FUNCTION check_chat_limit(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_tier_id TEXT;
  v_limit INTEGER;
  v_current INTEGER;
  v_reset_at TIMESTAMPTZ;
BEGIN
  -- Get user subscription
  SELECT
    tier_id,
    chat_messages_this_month,
    chat_messages_reset_at
  INTO v_tier_id, v_current, v_reset_at
  FROM user_subscriptions
  WHERE user_id = p_user_id;

  -- Default to free if no subscription
  IF v_tier_id IS NULL THEN
    v_tier_id := 'free';
    v_current := 0;

    -- Create subscription record
    INSERT INTO user_subscriptions (user_id, tier_id)
    VALUES (p_user_id, 'free')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  -- Reset counter if new month
  IF v_reset_at IS NULL OR v_reset_at < date_trunc('month', NOW()) THEN
    UPDATE user_subscriptions
    SET
      chat_messages_this_month = 0,
      chat_messages_reset_at = NOW()
    WHERE user_id = p_user_id;
    v_current := 0;
  END IF;

  -- Get limit for tier
  SELECT max_chat_messages_per_month INTO v_limit
  FROM subscription_tiers
  WHERE id = v_tier_id;

  -- Return status
  RETURN json_build_object(
    'tier', v_tier_id,
    'current', v_current,
    'limit', v_limit, -- NULL = unlimited
    'can_send', (v_limit IS NULL OR v_current < v_limit),
    'remaining', CASE WHEN v_limit IS NULL THEN NULL ELSE GREATEST(v_limit - v_current, 0) END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment chat message count
CREATE OR REPLACE FUNCTION increment_chat_count(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Ensure subscription exists
  INSERT INTO user_subscriptions (user_id, tier_id, chat_messages_this_month)
  VALUES (p_user_id, 'free', 1)
  ON CONFLICT (user_id) DO UPDATE
  SET
    chat_messages_this_month = user_subscriptions.chat_messages_this_month + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ══════════════════════════════════════════════════════════════════════════════
-- FEATURE ACCESS CHECK FUNCTION
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION check_feature_access(p_user_id UUID, p_feature TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier_id TEXT;
  v_has_access BOOLEAN;
BEGIN
  -- Get user tier
  SELECT tier_id INTO v_tier_id
  FROM user_subscriptions
  WHERE user_id = p_user_id;

  -- Default to free
  IF v_tier_id IS NULL THEN
    v_tier_id := 'free';
  END IF;

  -- Check feature
  CASE p_feature
    WHEN 'document_generation' THEN
      SELECT has_document_generation INTO v_has_access FROM subscription_tiers WHERE id = v_tier_id;
    WHEN 'investor_crm' THEN
      SELECT has_investor_crm INTO v_has_access FROM subscription_tiers WHERE id = v_tier_id;
    WHEN 'data_room' THEN
      SELECT has_data_room INTO v_has_access FROM subscription_tiers WHERE id = v_tier_id;
    WHEN 'analytics' THEN
      SELECT has_analytics INTO v_has_access FROM subscription_tiers WHERE id = v_tier_id;
    WHEN 'custom_branding' THEN
      SELECT has_custom_branding INTO v_has_access FROM subscription_tiers WHERE id = v_tier_id;
    WHEN 'priority_support' THEN
      SELECT has_priority_support INTO v_has_access FROM subscription_tiers WHERE id = v_tier_id;
    ELSE
      v_has_access := false;
  END CASE;

  RETURN COALESCE(v_has_access, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ══════════════════════════════════════════════════════════════════════════════
-- GET USER SUBSCRIPTION DETAILS FUNCTION
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_subscription RECORD;
  v_tier RECORD;
BEGIN
  -- Get or create subscription
  SELECT * INTO v_subscription
  FROM user_subscriptions
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    -- Create free subscription
    INSERT INTO user_subscriptions (user_id, tier_id)
    VALUES (p_user_id, 'free')
    RETURNING * INTO v_subscription;
  END IF;

  -- Get tier details
  SELECT * INTO v_tier
  FROM subscription_tiers
  WHERE id = v_subscription.tier_id;

  -- Return combined data
  RETURN json_build_object(
    'subscription', json_build_object(
      'id', v_subscription.id,
      'tier_id', v_subscription.tier_id,
      'billing_cycle', v_subscription.billing_cycle,
      'status', v_subscription.status,
      'current_period_end', v_subscription.current_period_end,
      'chat_messages_this_month', v_subscription.chat_messages_this_month
    ),
    'tier', json_build_object(
      'id', v_tier.id,
      'name', v_tier.name,
      'description', v_tier.description,
      'price_monthly', v_tier.price_monthly,
      'price_yearly', v_tier.price_yearly,
      'max_ventures', v_tier.max_ventures,
      'max_team_members', v_tier.max_team_members,
      'max_chat_messages_per_month', v_tier.max_chat_messages_per_month,
      'max_data_room_storage_mb', v_tier.max_data_room_storage_mb,
      'has_document_generation', v_tier.has_document_generation,
      'has_investor_crm', v_tier.has_investor_crm,
      'has_data_room', v_tier.has_data_room,
      'has_analytics', v_tier.has_analytics,
      'has_custom_branding', v_tier.has_custom_branding,
      'has_priority_support', v_tier.has_priority_support,
      'has_onboarding_call', v_tier.has_onboarding_call,
      'is_popular', v_tier.is_popular
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ══════════════════════════════════════════════════════════════════════════════
-- UPDATED_AT TRIGGER
-- ══════════════════════════════════════════════════════════════════════════════

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

DROP TRIGGER IF EXISTS subscription_tiers_updated_at ON subscription_tiers;
CREATE TRIGGER subscription_tiers_updated_at
  BEFORE UPDATE ON subscription_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

-- ══════════════════════════════════════════════════════════════════════════════
-- GRANT PERMISSIONS
-- ══════════════════════════════════════════════════════════════════════════════

GRANT SELECT ON subscription_tiers TO authenticated;
GRANT SELECT ON subscription_tiers TO anon;

GRANT SELECT, INSERT ON user_subscriptions TO authenticated;

GRANT EXECUTE ON FUNCTION check_chat_limit(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_chat_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_feature_access(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_subscription(UUID) TO authenticated;
