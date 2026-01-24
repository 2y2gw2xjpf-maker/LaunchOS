import * as React from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, getProfile, isSupabaseConfigured, type UserProfile } from '@/lib/supabase';

// Helper to check if error is an AbortError (cleanup-related)
const isAbortError = (err: unknown): boolean => {
  if (err instanceof Error) {
    return err.name === 'AbortError' || err.message.includes('aborted');
  }
  if (typeof err === 'object' && err !== null) {
    const errorObj = err as { message?: string; name?: string };
    return errorObj.name === 'AbortError' ||
           (typeof errorObj.message === 'string' && errorObj.message.includes('aborted'));
  }
  return false;
};

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

  const isConfigured = isSupabaseConfigured();

  // Fetch user profile
  const fetchProfile = React.useCallback(async (userId: string) => {
    try {
      const data = await getProfile(userId);
      setProfile(data);
    } catch (error) {
      // Ignore AbortError - it's from component cleanup
      if (isAbortError(error)) {
        console.log('[Auth] Profile fetch aborted (cleanup)');
        return;
      }
      console.error('[Auth] Error fetching profile:', error);
      setProfile(null);
    }
  }, []);

  // Handle temporary session cleanup on browser/tab close
  // Note: We use the "pagehide" event with persisted check instead of "beforeunload"
  // because beforeunload fires on EVERY navigation/refresh, not just tab close.
  // The pagehide event with persisted=false indicates actual tab/browser close.
  React.useEffect(() => {
    const handlePageHide = (event: PageTransitionEvent) => {
      // Only sign out on actual browser/tab close, not on refresh
      // persisted=true means the page is being kept in bfcache (refresh/navigation)
      // persisted=false means the page is being discarded (tab close)
      if (!event.persisted) {
        const isTemporarySession = sessionStorage.getItem('launchos-session-temporary');
        if (isTemporarySession === 'true') {
          // Mark for signout on next visit
          localStorage.setItem('launchos-pending-signout', 'true');
        }
      }
    };

    window.addEventListener('pagehide', handlePageHide);
    return () => window.removeEventListener('pagehide', handlePageHide);
  }, []);

  // Initialize auth state
  React.useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Timeout fallback - ensure loading is set to false after 5 seconds max
    // Increased from 3s to give Supabase more time to initialize
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('[Auth] Session check timeout - setting loading to false');
        setLoading(false);
      }
    }, 5000);

    // Check for pending signout from previous session
    const pendingSignout = localStorage.getItem('launchos-pending-signout');

    // Clean up the pending signout flag regardless
    localStorage.removeItem('launchos-pending-signout');

    // Only sign out if there's an explicit pending signout flag
    if (pendingSignout === 'true') {
      console.log('[Auth] Pending signout detected, signing out...');
      supabase.auth.signOut();
    }

    // Get initial session with retry logic
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          // If it's an AbortError, ignore it
          if (isAbortError(error)) {
            console.log('[Auth] Session check aborted (cleanup)');
            return;
          }
          throw error;
        }

        if (isMounted) {
          clearTimeout(timeoutId);
          console.log('[Auth] Initial session check:', session ? 'Found' : 'None');
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            fetchProfile(session.user.id);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          clearTimeout(timeoutId);
          // Ignore AbortError - it's from component cleanup or React StrictMode
          if (isAbortError(err)) {
            console.log('[Auth] Session check aborted (cleanup)');
            setLoading(false);
            return;
          }
          console.error('[Auth] Error getting session:', err);
          setLoading(false);
        }
      }
    };

    // Small delay to let Supabase client initialize properly
    const initDelay = setTimeout(() => {
      initSession();
    }, 100);

    // Listen for auth changes - comprehensive event handling
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Event:', event, session?.user?.id ? `User: ${session.user.id.slice(0, 8)}...` : 'No user');

      setSession(session);
      setUser(session?.user ?? null);

      switch (event) {
        case 'SIGNED_IN':
        case 'TOKEN_REFRESHED':
          // User signed in or token was refreshed - fetch/update profile
          if (session?.user) {
            await fetchProfile(session.user.id);
          }
          break;

        case 'SIGNED_OUT':
          // User signed out - clear all state
          setProfile(null);
          // Clear any local storage items related to the user session
          try {
            localStorage.removeItem('launchos-chat-session');
            localStorage.removeItem('launchos-active-venture');
          } catch (e) {
            // Ignore localStorage errors
          }
          break;

        case 'USER_UPDATED':
          // User data was updated - refresh profile
          if (session?.user) {
            await fetchProfile(session.user.id);
          }
          break;

        case 'PASSWORD_RECOVERY':
          // Password recovery initiated - user might need to be redirected
          console.log('[Auth] Password recovery initiated');
          break;

        default:
          // Handle any other events
          if (session?.user) {
            await fetchProfile(session.user.id);
          }
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      clearTimeout(initDelay);
      subscription.unsubscribe();
    };
  }, [isConfigured, fetchProfile]);

  // ==================== AUTH ACTIONS ====================

  const signIn = async (email: string, password: string, rememberMe: boolean = true) => {
    // Set session persistence based on rememberMe
    // When rememberMe is false, we'll clear the session on browser close
    if (!rememberMe) {
      // Store flag to clear session on page unload
      sessionStorage.setItem('launchos-session-temporary', 'true');
    } else {
      sessionStorage.removeItem('launchos-session-temporary');
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const signInWithApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
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

    const updateData = {
      full_name: updates.full_name,
      company_name: updates.company_name,
      avatar_url: updates.avatar_url,
    };

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
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
