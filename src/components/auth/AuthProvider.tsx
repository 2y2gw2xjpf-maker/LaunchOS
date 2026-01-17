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

  const isConfigured = isSupabaseConfigured();

  // Fetch user profile
  const fetchProfile = React.useCallback(async (userId: string) => {
    try {
      const data = await getProfile(userId);
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  }, []);

  // Handle temporary session cleanup on browser close
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      // Check if this was a temporary session (rememberMe was false)
      const isTemporarySession = sessionStorage.getItem('launchos-session-temporary');
      if (isTemporarySession === 'true') {
        // Sign out on browser close - this uses synchronous localStorage removal
        // The actual signOut will happen on next visit if the session is still valid
        localStorage.setItem('launchos-pending-signout', 'true');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Initialize auth state
  React.useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    // Check for pending signout from previous session
    const pendingSignout = localStorage.getItem('launchos-pending-signout');
    if (pendingSignout === 'true') {
      localStorage.removeItem('launchos-pending-signout');
      // Sign out but still set up the listener
      supabase.auth.signOut();
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[Auth] Initial session check:', session ? 'Found' : 'None');
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    }).catch((err) => {
      console.error('[Auth] Error getting session:', err);
      setLoading(false);
    });

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
