// ═══════════════════════════════════════════════════════════════════════════
// LaunchOS Analytics Configuration
// PostHog for product analytics, optional Sentry for error tracking
// ═══════════════════════════════════════════════════════════════════════════

import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://eu.posthog.com';

// Check if analytics is enabled
const isAnalyticsEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (import.meta.env.DEV) return false; // Disable in dev
  return !!POSTHOG_KEY;
};

let isInitialized = false;

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

export function initAnalytics(): void {
  if (!isAnalyticsEnabled() || isInitialized) {
    if (import.meta.env.DEV) {
      console.log('[Analytics] Disabled in development mode');
    }
    return;
  }

  try {
    posthog.init(POSTHOG_KEY!, {
      api_host: POSTHOG_HOST,
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      persistence: 'localStorage+cookie',
      disable_session_recording: false,
      loaded: () => {
        isInitialized = true;
        console.log('[Analytics] PostHog initialized');
      },
    });
  } catch (error) {
    console.error('[Analytics] Failed to initialize PostHog:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TRACKING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export function identify(userId: string, traits?: Record<string, unknown>): void {
  if (!isAnalyticsEnabled()) return;

  try {
    posthog.identify(userId, traits);
  } catch (error) {
    console.error('[Analytics] identify error:', error);
  }
}

export function track(event: string, properties?: Record<string, unknown>): void {
  if (!isAnalyticsEnabled()) return;

  try {
    posthog.capture(event, properties);
  } catch (error) {
    console.error('[Analytics] track error:', error);
  }
}

export function page(name?: string, properties?: Record<string, unknown>): void {
  if (!isAnalyticsEnabled()) return;

  try {
    posthog.capture('$pageview', {
      $current_url: window.location.href,
      page_name: name,
      ...properties,
    });
  } catch (error) {
    console.error('[Analytics] page error:', error);
  }
}

export function reset(): void {
  if (!isAnalyticsEnabled()) return;

  try {
    posthog.reset();
  } catch (error) {
    console.error('[Analytics] reset error:', error);
  }
}

// Set user properties
export function setUserProperties(properties: Record<string, unknown>): void {
  if (!isAnalyticsEnabled()) return;

  try {
    posthog.people.set(properties);
  } catch (error) {
    console.error('[Analytics] setUserProperties error:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PREDEFINED EVENTS
// ═══════════════════════════════════════════════════════════════════════════

export const AnalyticsEvents = {
  // Auth
  SIGNED_UP: 'user_signed_up',
  SIGNED_IN: 'user_signed_in',
  SIGNED_OUT: 'user_signed_out',
  PASSWORD_RESET_REQUESTED: 'password_reset_requested',
  EMAIL_VERIFIED: 'email_verified',

  // Subscription
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_UPGRADED: 'subscription_upgraded',
  SUBSCRIPTION_DOWNGRADED: 'subscription_downgraded',
  SUBSCRIPTION_CANCELED: 'subscription_canceled',
  CHECKOUT_STARTED: 'checkout_started',
  CHECKOUT_COMPLETED: 'checkout_completed',

  // Features
  ANALYSIS_CREATED: 'analysis_created',
  ANALYSIS_COMPLETED: 'analysis_completed',
  ANALYSIS_SAVED: 'analysis_saved',
  PROJECT_CREATED: 'project_created',
  PROJECT_DELETED: 'project_deleted',
  VALUATION_CALCULATED: 'valuation_calculated',
  ACTION_PLAN_GENERATED: 'action_plan_generated',
  COMPARISON_CREATED: 'comparison_created',
  ROUTE_SELECTED: 'route_selected',

  // Engagement
  FEATURE_USED: 'feature_used',
  EXPORT_CREATED: 'export_created',
  HELP_REQUESTED: 'help_requested',
  FEEDBACK_SUBMITTED: 'feedback_submitted',
  WAITLIST_JOINED: 'waitlist_joined',

  // Errors
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
} as const;

// Helper to track with predefined events
export function trackEvent(
  event: keyof typeof AnalyticsEvents,
  properties?: Record<string, unknown>
): void {
  track(AnalyticsEvents[event], properties);
}

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE FLAGS (optional PostHog feature)
// ═══════════════════════════════════════════════════════════════════════════

export function isFeatureEnabled(featureFlag: string): boolean {
  if (!isAnalyticsEnabled()) return false;

  try {
    return posthog.isFeatureEnabled(featureFlag) ?? false;
  } catch {
    return false;
  }
}

export function getFeatureFlag(featureFlag: string): string | boolean | undefined {
  if (!isAnalyticsEnabled()) return undefined;

  try {
    return posthog.getFeatureFlag(featureFlag);
  } catch {
    return undefined;
  }
}
