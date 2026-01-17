import * as React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuth, useSubscription } from './AuthProvider';
import { canAccessFeature } from '@/lib/stripe';

// ==================== PROTECTED ROUTE ====================

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isConfigured } = useAuth();
  const location = useLocation();

  // Skip auth in development mode if VITE_SKIP_AUTH is set
  const skipAuth = import.meta.env.VITE_SKIP_AUTH === 'true';

  // If Supabase is not configured or auth is skipped, allow access (development mode)
  if (!isConfigured || skipAuth) {
    return children ? <>{children}</> : <Outlet />;
  }

  // Show loading spinner while checking auth
  if (loading) {
    return <AuthLoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render children
  return children ? <>{children}</> : <Outlet />;
}

// ==================== SUBSCRIPTION GATE ====================

interface SubscriptionGateProps {
  requiredTier: 'free' | 'pro' | 'team';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SubscriptionGate({
  requiredTier,
  children,
  fallback,
}: SubscriptionGateProps) {
  const { tier } = useSubscription();

  if (!canAccessFeature(tier, requiredTier)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <UpgradePrompt requiredTier={requiredTier} />;
  }

  return <>{children}</>;
}

// ==================== AUTH CALLBACK ====================

export function AuthCallback() {
  const { session, loading } = useAuth();
  const location = useLocation();

  React.useEffect(() => {
    // Handle the OAuth callback
    // The session will be set automatically by Supabase
  }, []);

  if (loading) {
    return <AuthLoadingScreen message="Authentifizierung wird abgeschlossen..." />;
  }

  if (session) {
    // Redirect to the original destination or dashboard
    const from = (location.state as { from?: Location })?.from?.pathname || '/app';
    return <Navigate to={from} replace />;
  }

  return <Navigate to="/login" replace />;
}

// ==================== LOADING SCREEN ====================

interface AuthLoadingScreenProps {
  message?: string;
}

function AuthLoadingScreen({ message = 'Laden...' }: AuthLoadingScreenProps) {
  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        </div>
        <p className="text-charcoal/60 text-sm">{message}</p>
      </motion.div>
    </div>
  );
}

// ==================== UPGRADE PROMPT ====================

interface UpgradePromptProps {
  requiredTier: 'free' | 'pro' | 'team';
}

function UpgradePrompt({ requiredTier }: UpgradePromptProps) {
  const tierNames = {
    free: 'Builder',
    pro: 'Founder',
    team: 'Startup',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-8 shadow-soft max-w-md mx-auto text-center"
    >
      <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">🔒</span>
      </div>
      <h3 className="text-xl font-semibold text-navy mb-2">
        {tierNames[requiredTier]} Plan erforderlich
      </h3>
      <p className="text-charcoal/60 mb-6">
        Diese Funktion ist nur im {tierNames[requiredTier]} Plan und höher verfügbar.
        Upgrade jetzt um alle Features freizuschalten.
      </p>
      <a
        href="/pricing"
        className="inline-flex items-center justify-center px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition-colors"
      >
        Pläne ansehen
      </a>
    </motion.div>
  );
}

// ==================== EXPORTS ====================

export { AuthLoadingScreen };
