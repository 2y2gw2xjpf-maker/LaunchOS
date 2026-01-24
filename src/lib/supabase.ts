import { createClient } from '@supabase/supabase-js';

// Environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Single Supabase client - avoid multiple GoTrueClient instances
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Use a stable storage key to avoid conflicts
    storageKey: 'launchos-auth-token',
    // Use PKCE flow for better security and reliability
    flowType: 'pkce',
  },
  global: {
    // Custom fetch that ignores abort signals for data queries
    // but still allows auth to work properly
    fetch: async (url, options = {}) => {
      const { signal, ...rest } = options;

      // For auth endpoints, use the signal normally
      if (typeof url === 'string' && url.includes('/auth/')) {
        return fetch(url, options);
      }

      // For data queries, ignore abort signal to prevent cancellation issues
      return fetch(url, rest);
    },
  },
});

// Re-export supabase as supabasePublic for backwards compatibility
// This ensures only ONE client instance exists
export const supabasePublic = supabase;

// ==================== TYPES ====================

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  avatar_url: string | null;
  subscription_tier: 'free' | 'starter' | 'growth' | 'scale';
  subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing';
  stripe_customer_id: string | null;
  // Journey-Felder (aus profiles-Tabelle)
  industry: string | null;
  stage: 'idea' | 'building' | 'mvp' | 'launched' | 'scaling' | null;
  funding_path: 'bootstrap' | 'investor' | 'grant' | 'undecided' | null;
  company_type: 'gmbh' | 'ug' | 'einzelunternehmen' | 'gbr' | 'ag' | 'not_yet_founded' | null;
  monthly_revenue: number | null;
  team_size: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserProject {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  position: number;
  is_expanded: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserAnalysis {
  id: string;
  user_id: string;
  project_id: string | null;
  venture_id: string | null;  // Verknüpfung zum Venture (1:n)
  name: string;
  type: 'valuation' | 'whatsnext' | 'actionplan' | 'full';
  data: Record<string, unknown>;
  is_favorite: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

// ==================== AUTH HELPERS ====================

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  if (error) throw error;
  return data;
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
};

export const signInWithGitHub = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  if (error) throw error;
  return data;
};

export const updatePassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
  return data;
};

// ==================== PROFILE HELPERS ====================

export const getProfile = async (userId: string): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data as UserProfile;
};

export const updateProfile = async (
  userId: string,
  updates: {
    full_name?: string;
    company_name?: string;
    avatar_url?: string;
  }
): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data as UserProfile;
};

// ==================== ANALYSES HELPERS ====================

export const getUserAnalyses = async (userId: string): Promise<UserAnalysis[]> => {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data || []) as UserAnalysis[];
};

export const getAnalysisByProject = async (
  userId: string,
  projectId: string | null
): Promise<UserAnalysis[]> => {
  let query = supabase.from('analyses').select('*').eq('user_id', userId);

  if (projectId === null) {
    query = query.is('project_id', null);
  } else {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query.order('position', { ascending: true });
  if (error) throw error;
  return (data || []) as UserAnalysis[];
};

export const getAnalysesByVenture = async (
  userId: string,
  ventureId: string
): Promise<UserAnalysis[]> => {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', userId)
    .eq('venture_id', ventureId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data || []) as UserAnalysis[];
};

export const createAnalysis = async (analysis: {
  user_id: string;
  name: string;
  type: 'valuation' | 'whatsnext' | 'actionplan' | 'full';
  project_id?: string | null;
  venture_id?: string | null;
  data?: Record<string, unknown>;
}): Promise<UserAnalysis> => {
  const { data, error } = await supabase.from('analyses').insert(analysis).select().single();
  if (error) throw error;
  return data as UserAnalysis;
};

export const updateAnalysis = async (
  analysisId: string,
  updates: {
    name?: string;
    project_id?: string | null;
    venture_id?: string | null;
    data?: Record<string, unknown>;
    is_favorite?: boolean;
    position?: number;
  }
): Promise<UserAnalysis> => {
  const { data, error } = await supabase
    .from('analyses')
    .update(updates)
    .eq('id', analysisId)
    .select()
    .single();
  if (error) throw error;
  return data as UserAnalysis;
};

export const deleteAnalysis = async (analysisId: string): Promise<void> => {
  const { error } = await supabase.from('analyses').delete().eq('id', analysisId);
  if (error) throw error;
};

// ==================== PROJECTS HELPERS ====================

export const getUserProjects = async (userId: string): Promise<UserProject[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('position', { ascending: true });
  if (error) throw error;
  return (data || []) as UserProject[];
};

export const createProject = async (project: {
  user_id: string;
  name: string;
  color?: string;
  description?: string;
}): Promise<UserProject> => {
  const { data, error } = await supabase.from('projects').insert(project).select().single();
  if (error) throw error;
  return data as UserProject;
};

export const updateProject = async (
  projectId: string,
  updates: {
    name?: string;
    color?: string;
    description?: string;
    position?: number;
    is_expanded?: boolean;
  }
): Promise<UserProject> => {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();
  if (error) throw error;
  return data as UserProject;
};

export const deleteProject = async (projectId: string): Promise<void> => {
  const { error } = await supabase.from('projects').delete().eq('id', projectId);
  if (error) throw error;
};

// ==================== SUBSCRIPTION HELPERS ====================

export const getSubscriptionStatus = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status, stripe_customer_id')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
};

export const updateSubscription = async (
  userId: string,
  subscription: {
    subscription_tier: 'free' | 'starter' | 'growth' | 'scale';
    subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing';
    stripe_customer_id?: string;
  }
): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(subscription)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data as UserProfile;
};

// ==================== UTILITY ====================

export const isSupabaseConfigured = () => {
  return (
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
  );
};
