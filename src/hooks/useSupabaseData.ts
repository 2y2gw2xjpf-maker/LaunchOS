import * as React from 'react';
import { supabase } from '@/lib/supabase';
import type { UserAnalysis, UserProject } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';

// ==================== useAnalyses Hook ====================

interface UseAnalysesOptions {
  projectId?: string | null;
  type?: 'valuation' | 'whatsnext' | 'actionplan' | 'full';
  realtime?: boolean;
}

interface UseAnalysesReturn {
  analyses: UserAnalysis[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createAnalysis: (data: Omit<UserAnalysis, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<UserAnalysis>;
  updateAnalysis: (id: string, updates: Partial<UserAnalysis>) => Promise<void>;
  deleteAnalysis: (id: string) => Promise<void>;
}

export function useAnalyses(options: UseAnalysesOptions = {}): UseAnalysesReturn {
  const { user } = useAuth();
  const [analyses, setAnalyses] = React.useState<UserAnalysis[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const { projectId, type, realtime = true } = options;

  const fetchAnalyses = React.useCallback(async () => {
    if (!user) {
      setAnalyses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let query = supabase
        .from('analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (projectId !== undefined) {
        if (projectId === null) {
          query = query.is('project_id', null);
        } else {
          query = query.eq('project_id', projectId);
        }
      }

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setAnalyses((data || []) as UserAnalysis[]);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching analyses:', err);
    } finally {
      setLoading(false);
    }
  }, [user, projectId, type]);

  // Initial fetch
  React.useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  // Real-time subscription
  React.useEffect(() => {
    if (!user || !realtime) return;

    const channel = supabase
      .channel('analyses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analyses',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Analysis change:', payload);

          if (payload.eventType === 'INSERT') {
            setAnalyses((prev) => [payload.new as UserAnalysis, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setAnalyses((prev) =>
              prev.map((a) => (a.id === payload.new.id ? (payload.new as UserAnalysis) : a))
            );
          } else if (payload.eventType === 'DELETE') {
            setAnalyses((prev) => prev.filter((a) => a.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, realtime]);

  const createAnalysis = async (
    data: Omit<UserAnalysis, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<UserAnalysis> => {
    if (!user) throw new Error('Not authenticated');

    const { data: newAnalysis, error: createError } = await supabase
      .from('analyses')
      .insert({ ...data, user_id: user.id })
      .select()
      .single();

    if (createError) throw createError;
    return newAnalysis as UserAnalysis;
  };

  const updateAnalysis = async (id: string, updates: Partial<UserAnalysis>): Promise<void> => {
    const { error: updateError } = await supabase
      .from('analyses')
      .update(updates)
      .eq('id', id);

    if (updateError) throw updateError;
  };

  const deleteAnalysis = async (id: string): Promise<void> => {
    const { error: deleteError } = await supabase.from('analyses').delete().eq('id', id);

    if (deleteError) throw deleteError;
  };

  return {
    analyses,
    loading,
    error,
    refetch: fetchAnalyses,
    createAnalysis,
    updateAnalysis,
    deleteAnalysis,
  };
}

// ==================== useProjects Hook ====================

interface UseProjectsReturn {
  projects: UserProject[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createProject: (data: { name: string; color?: string; description?: string }) => Promise<UserProject>;
  updateProject: (id: string, updates: Partial<UserProject>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  reorderProjects: (projectIds: string[]) => Promise<void>;
}

export function useProjects(): UseProjectsReturn {
  const { user } = useAuth();
  const [projects, setProjects] = React.useState<UserProject[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchProjects = React.useCallback(async () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true });

      if (fetchError) throw fetchError;
      setProjects((data || []) as UserProject[]);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch
  React.useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Real-time subscription
  React.useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Project change:', payload);

          if (payload.eventType === 'INSERT') {
            setProjects((prev) => [...prev, payload.new as UserProject].sort((a, b) => a.position - b.position));
          } else if (payload.eventType === 'UPDATE') {
            setProjects((prev) =>
              prev.map((p) => (p.id === payload.new.id ? (payload.new as UserProject) : p)).sort((a, b) => a.position - b.position)
            );
          } else if (payload.eventType === 'DELETE') {
            setProjects((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const createProject = async (data: { name: string; color?: string; description?: string }): Promise<UserProject> => {
    if (!user) throw new Error('Not authenticated');

    // Get max position
    const maxPosition = projects.reduce((max, p) => Math.max(max, p.position), -1);

    const { data: newProject, error: createError } = await supabase
      .from('projects')
      .insert({ ...data, user_id: user.id, position: maxPosition + 1 })
      .select()
      .single();

    if (createError) throw createError;
    return newProject as UserProject;
  };

  const updateProject = async (id: string, updates: Partial<UserProject>): Promise<void> => {
    const { error: updateError } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id);

    if (updateError) throw updateError;
  };

  const deleteProject = async (id: string): Promise<void> => {
    const { error: deleteError } = await supabase.from('projects').delete().eq('id', id);

    if (deleteError) throw deleteError;
  };

  const reorderProjects = async (projectIds: string[]): Promise<void> => {
    // Update positions in batch
    const updates = projectIds.map((id, index) => ({
      id,
      position: index,
    }));

    for (const update of updates) {
      await supabase.from('projects').update({ position: update.position }).eq('id', update.id);
    }

    // Optimistic update
    setProjects((prev) => {
      const projectMap = new Map(prev.map((p) => [p.id, p]));
      return projectIds.map((id, index) => ({
        ...projectMap.get(id)!,
        position: index,
      }));
    });
  };

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    reorderProjects,
  };
}

// ==================== useLaunchOSData Hook ====================
// Combines analyses and projects for the main app

interface UseLaunchOSDataReturn {
  analyses: UserAnalysis[];
  projects: UserProject[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  // Helpers
  getAnalysesByProject: (projectId: string | null) => UserAnalysis[];
  getFavoriteAnalyses: () => UserAnalysis[];
  getRecentAnalyses: (limit?: number) => UserAnalysis[];
}

export function useLaunchOSData(): UseLaunchOSDataReturn {
  const { analyses, loading: analysesLoading, error: analysesError, refetch: refetchAnalyses } = useAnalyses();
  const { projects, loading: projectsLoading, error: projectsError, refetch: refetchProjects } = useProjects();

  const loading = analysesLoading || projectsLoading;
  const error = analysesError || projectsError;

  const refetch = async () => {
    await Promise.all([refetchAnalyses(), refetchProjects()]);
  };

  const getAnalysesByProject = (projectId: string | null): UserAnalysis[] => {
    if (projectId === null) {
      return analyses.filter((a) => a.project_id === null);
    }
    return analyses.filter((a) => a.project_id === projectId);
  };

  const getFavoriteAnalyses = (): UserAnalysis[] => {
    return analyses.filter((a) => a.is_favorite);
  };

  const getRecentAnalyses = (limit = 5): UserAnalysis[] => {
    return analyses.slice(0, limit);
  };

  return {
    analyses,
    projects,
    loading,
    error,
    refetch,
    getAnalysesByProject,
    getFavoriteAnalyses,
    getRecentAnalyses,
  };
}

// ==================== useSubscriptionLimits Hook ====================

interface SubscriptionLimits {
  projects: number;
  analyses: number;
  aiRequests: number;
  teamMembers?: number;
}

interface UseSubscriptionLimitsReturn {
  limits: SubscriptionLimits;
  usage: {
    projects: number;
    analyses: number;
    aiRequests: number;
  };
  remaining: {
    projects: number;
    analyses: number;
    aiRequests: number;
  };
  canCreate: {
    project: boolean;
    analysis: boolean;
    aiRequest: boolean;
  };
}

const TIER_LIMITS: Record<string, SubscriptionLimits> = {
  free: { projects: 1, analyses: 3, aiRequests: 0 },
  starter: { projects: 3, analyses: 10, aiRequests: 0 },
  growth: { projects: -1, analyses: -1, aiRequests: 100 },
  scale: { projects: -1, analyses: -1, aiRequests: 500, teamMembers: 5 },
};

export function useSubscriptionLimits(): UseSubscriptionLimitsReturn {
  const { profile } = useAuth();
  const { analyses, projects } = useLaunchOSData();

  const tier = profile?.subscription_tier || 'free';
  const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;

  const usage = {
    projects: projects.length,
    analyses: analyses.length,
    aiRequests: 0, // TODO: Track AI requests
  };

  const remaining = {
    projects: limits.projects === -1 ? Infinity : Math.max(0, limits.projects - usage.projects),
    analyses: limits.analyses === -1 ? Infinity : Math.max(0, limits.analyses - usage.analyses),
    aiRequests: Math.max(0, limits.aiRequests - usage.aiRequests),
  };

  const canCreate = {
    project: limits.projects === -1 || usage.projects < limits.projects,
    analysis: limits.analyses === -1 || usage.analyses < limits.analyses,
    aiRequest: usage.aiRequests < limits.aiRequests,
  };

  return { limits, usage, remaining, canCreate };
}
