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
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
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

  // Initialize auth state
  React.useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (event === 'SIGNED_IN' && session?.user) {
        await fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured, fetchProfile]);

  // ==================== AUTH ACTIONS ====================

  const signIn = async (email: string, password: string) => {
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

  const signInWithGitHub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
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
    signInWithGitHub,
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
