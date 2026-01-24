import * as React from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, getProfile, isSupabaseConfigured, type UserProfile } from '@/lib/supabase';

// ==================== TYPES ====================

interface AuthContextType {
  // State
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;

  // Auth Actions
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;

  // Profile Actions
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

// ==================== CONTEXT ====================

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// ==================== PROVIDER ====================

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [initialized, setInitialized] = React.useState(false);

  const isConfigured = isSupabaseConfigured();

  // Fetch user profile - simplified, no abort handling needed with singleton
  const fetchProfile = React.useCallback(async (userId: string) => {
    try {
      const data = await getProfile(userId);
      setProfile(data);
    } catch (error) {
      console.error('[Auth] Error fetching profile:', error);
      setProfile(null);
    }
  }, []);

  // Initialize auth state - runs once
  React.useEffect(() => {
    // Prevent double initialization in StrictMode
    if (initialized) return;

    if (!isConfigured) {
      setLoading(false);
      setInitialized(true);
      return;
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('[Auth] Event:', event);

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Use setTimeout to avoid potential race conditions
          setTimeout(() => fetchProfile(currentSession.user.id), 0);
        } else {
          setProfile(null);
        }

        // After first event, we're no longer loading
        setLoading(false);
      }
    );

    // Then get current session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('[Auth] Initial session:', currentSession ? 'Found' : 'None');
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      }

      setLoading(false);
      setInitialized(true);
    }).catch((err) => {
      console.error('[Auth] Session error:', err);
      setLoading(false);
      setInitialized(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured, fetchProfile, initialized]);

  // ==================== AUTH ACTIONS ====================

  const signIn = async (email: string, password: string, _rememberMe: boolean = true) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  };

  const signInWithApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    setProfile(null);
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  };

  // ==================== PROFILE ACTIONS ====================

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: updates.full_name,
        company_name: updates.company_name,
        avatar_url: updates.avatar_url,
      })
      .eq('id', user.id);

    if (error) throw error;
    await refreshProfile();
  };

  // ==================== CONTEXT VALUE ====================

  const value: AuthContextType = {
    session,
    user,
    profile,
    loading,
    isConfigured,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithApple,
    signOut,
    resetPassword,
    refreshProfile,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ==================== HOOK ====================

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ==================== UTILITY HOOKS ====================

export function useRequireAuth() {
  const { user, loading } = useAuth();
  const [redirecting, setRedirecting] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !user && !redirecting) {
      setRedirecting(true);
      window.location.href = '/login';
    }
  }, [user, loading, redirecting]);

  return { user, loading: loading || redirecting };
}

export function useSubscription() {
  const { profile } = useAuth();

  return {
    tier: profile?.subscription_tier ?? 'free',
    status: profile?.subscription_status ?? 'active',
    isActive: profile?.subscription_status === 'active',
    isPaid: profile?.subscription_tier !== 'free',
  };
}
