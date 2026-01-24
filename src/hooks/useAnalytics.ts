/**
 * Analytics Hook - Dashboard-Daten und Statistiken
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth';
import { useVentureContext } from '@/contexts/VentureContext';

// Types
export interface DashboardStats {
  totalContacts: number;
  activeConversations: number;
  termSheets: number;
  closedDeals: number;
  totalActivities: number;
  followUpsDue: number;
}

export interface PipelineFunnelData {
  stage: string;
  count: number;
  label: string;
  color: string;
}

export interface ValuationHistoryEntry {
  id: string;
  valuationAmount: number;
  valuationMethod: string;
  currency: string;
  notes: string | null;
  recordedAt: string;
}

export interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string | null;
  activityDate: string;
  contactName: string;
  contactCompany: string | null;
}

export interface UpcomingFollowUp {
  id: string;
  name: string;
  company: string | null;
  nextFollowUp: string;
  followUpNote: string | null;
  pipelineStage: string;
  priority: string;
}

export interface JourneyProgress {
  currentPhase: number;
  totalPhases: number;
  completedTasks: number;
  totalTasks: number;
  percentComplete: number;
  phaseName: string;
}

// Pipeline stage labels and colors
const PIPELINE_CONFIG: Record<string, { label: string; color: string }> = {
  lead: { label: 'Leads', color: '#94a3b8' },
  researching: { label: 'Recherche', color: '#60a5fa' },
  contacted: { label: 'Kontaktiert', color: '#818cf8' },
  meeting_scheduled: { label: 'Meeting geplant', color: '#a78bfa' },
  meeting_done: { label: 'Meeting abgeschlossen', color: '#c084fc' },
  follow_up: { label: 'Follow-up', color: '#e879f9' },
  term_sheet: { label: 'Term Sheet', color: '#f472b6' },
  due_diligence: { label: 'Due Diligence', color: '#fb7185' },
  closed_won: { label: 'Abgeschlossen', color: '#22c55e' },
  closed_lost: { label: 'Verloren', color: '#ef4444' },
  on_hold: { label: 'Pausiert', color: '#6b7280' },
};

export function useAnalytics() {
  const { user } = useAuth();
  const { activeVenture } = useVentureContext();

  // State
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [pipelineFunnel, setPipelineFunnel] = useState<PipelineFunnelData[]>([]);
  const [valuationHistory, setValuationHistory] = useState<ValuationHistoryEntry[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [upcomingFollowUps, setUpcomingFollowUps] = useState<UpcomingFollowUp[]>([]);
  const [journeyProgress, setJourneyProgress] = useState<JourneyProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Dashboard Stats
  const fetchDashboardStats = useCallback(async () => {
    if (!user) return;

    try {
      // Try RPC first
      const { data, error: rpcError } = await supabase.rpc('get_dashboard_stats', {
        p_user_id: user.id,
        p_venture_id: activeVenture?.id || null,
      });

      if (rpcError) {
        // Fallback to manual query if RPC not available
        console.warn('RPC not available, using fallback:', rpcError.message);
        await fetchDashboardStatsFallback();
        return;
      }

      setDashboardStats(data as DashboardStats);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      await fetchDashboardStatsFallback();
    }
  }, [user, activeVenture]);

  // Fallback for dashboard stats
  const fetchDashboardStatsFallback = async () => {
    if (!user) return;

    let query = supabase
      .from('investor_contacts')
      .select('id, pipeline_stage, next_follow_up')
      .eq('user_id', user.id)
      .eq('is_archived', false);

    if (activeVenture) {
      query = query.eq('venture_id', activeVenture.id);
    }

    const { data: contacts, error: contactsError } = await query;

    if (contactsError) {
      console.error('Error fetching contacts:', contactsError);
      return;
    }

    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const stats: DashboardStats = {
      totalContacts: contacts?.length || 0,
      activeConversations: contacts?.filter((c) =>
        ['meeting_scheduled', 'meeting_done', 'follow_up'].includes(c.pipeline_stage)
      ).length || 0,
      termSheets: contacts?.filter((c) =>
        ['term_sheet', 'due_diligence'].includes(c.pipeline_stage)
      ).length || 0,
      closedDeals: contacts?.filter((c) => c.pipeline_stage === 'closed_won').length || 0,
      totalActivities: 0,
      followUpsDue: contacts?.filter((c) => {
        if (!c.next_follow_up) return false;
        const followUpDate = new Date(c.next_follow_up);
        return followUpDate <= weekFromNow;
      }).length || 0,
    };

    // Get activity count separately
    const activityQuery = supabase
      .from('investor_activities')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .gte('activity_date', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const { count: activityCount } = await activityQuery;
    stats.totalActivities = activityCount || 0;

    setDashboardStats(stats);
  };

  // Fetch Pipeline Funnel
  const fetchPipelineFunnel = useCallback(async () => {
    if (!user) return;

    try {
      // Try RPC first
      const { data, error: rpcError } = await supabase.rpc('get_pipeline_funnel', {
        p_user_id: user.id,
        p_venture_id: activeVenture?.id || null,
      });

      if (rpcError) {
        console.warn('RPC not available, using fallback:', rpcError.message);
        await fetchPipelineFunnelFallback();
        return;
      }

      const funnelData: PipelineFunnelData[] = (data || []).map((item: { stage: string; count: number }) => ({
        stage: item.stage,
        count: item.count,
        label: PIPELINE_CONFIG[item.stage]?.label || item.stage,
        color: PIPELINE_CONFIG[item.stage]?.color || '#9333ea',
      }));

      setPipelineFunnel(funnelData);
    } catch (err) {
      console.error('Error fetching pipeline funnel:', err);
      await fetchPipelineFunnelFallback();
    }
  }, [user, activeVenture]);

  // Fallback for pipeline funnel
  const fetchPipelineFunnelFallback = async () => {
    if (!user) return;

    let query = supabase
      .from('investor_contacts')
      .select('pipeline_stage')
      .eq('user_id', user.id)
      .eq('is_archived', false);

    if (activeVenture) {
      query = query.eq('venture_id', activeVenture.id);
    }

    const { data: contacts } = await query;

    if (!contacts) return;

    // Count by stage
    const stageCounts: Record<string, number> = {};
    contacts.forEach((c) => {
      stageCounts[c.pipeline_stage] = (stageCounts[c.pipeline_stage] || 0) + 1;
    });

    const stageOrder = [
      'lead', 'researching', 'contacted', 'meeting_scheduled',
      'meeting_done', 'follow_up', 'term_sheet', 'due_diligence',
      'closed_won', 'closed_lost', 'on_hold'
    ];

    const funnelData: PipelineFunnelData[] = stageOrder
      .filter((stage) => stageCounts[stage] > 0)
      .map((stage) => ({
        stage,
        count: stageCounts[stage],
        label: PIPELINE_CONFIG[stage]?.label || stage,
        color: PIPELINE_CONFIG[stage]?.color || '#9333ea',
      }));

    setPipelineFunnel(funnelData);
  };

  // Fetch Valuation History
  const fetchValuationHistory = useCallback(async () => {
    if (!user) return;

    let query = supabase
      .from('valuation_history')
      .select('*')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: true });

    if (activeVenture) {
      query = query.eq('venture_id', activeVenture.id);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching valuation history:', fetchError);
      return;
    }

    const history: ValuationHistoryEntry[] = (data || []).map((item) => ({
      id: item.id,
      valuationAmount: parseFloat(item.valuation_amount),
      valuationMethod: item.valuation_method,
      currency: item.currency,
      notes: item.notes,
      recordedAt: item.recorded_at,
    }));

    setValuationHistory(history);
  }, [user, activeVenture]);

  // Fetch Recent Activities
  const fetchRecentActivities = useCallback(async () => {
    if (!user) return;

    try {
      // Try RPC first
      const { data, error: rpcError } = await supabase.rpc('get_recent_activities', {
        p_user_id: user.id,
        p_venture_id: activeVenture?.id || null,
        p_limit: 10,
      });

      if (rpcError) {
        console.warn('RPC not available, using fallback:', rpcError.message);
        await fetchRecentActivitiesFallback();
        return;
      }

      const activities: RecentActivity[] = (data || []).map((item: {
        id: string;
        type: string;
        title: string;
        description: string | null;
        activity_date: string;
        contact_name: string;
        contact_company: string | null;
      }) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        activityDate: item.activity_date,
        contactName: item.contact_name,
        contactCompany: item.contact_company,
      }));

      setRecentActivities(activities);
    } catch (err) {
      console.error('Error fetching recent activities:', err);
      await fetchRecentActivitiesFallback();
    }
  }, [user, activeVenture]);

  // Fallback for recent activities
  const fetchRecentActivitiesFallback = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('investor_activities')
      .select(`
        id,
        type,
        title,
        description,
        activity_date,
        investor_contacts!inner (
          name,
          company,
          venture_id
        )
      `)
      .eq('user_id', user.id)
      .order('activity_date', { ascending: false })
      .limit(10);

    if (!data) return;

    // Filter by venture if needed
    type ActivityItemRaw = {
      id: string;
      type: string;
      title: string;
      description: string | null;
      activity_date: string;
      investor_contacts: {
        name: string;
        company: string | null;
        venture_id: string | null;
      }[] | null;
    };
    const filteredData = activeVenture
      ? (data as ActivityItemRaw[]).filter((item) => item.investor_contacts?.[0]?.venture_id === activeVenture.id)
      : (data as ActivityItemRaw[]);

    const activities: RecentActivity[] = filteredData.map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      description: item.description,
      activityDate: item.activity_date,
      contactName: item.investor_contacts?.[0]?.name || 'Unbekannt',
      contactCompany: item.investor_contacts?.[0]?.company || null,
    }));

    setRecentActivities(activities);
  };

  // Fetch Upcoming Follow-ups
  const fetchUpcomingFollowUps = useCallback(async () => {
    if (!user) return;

    try {
      // Try RPC first
      const { data, error: rpcError } = await supabase.rpc('get_upcoming_follow_ups', {
        p_user_id: user.id,
        p_venture_id: activeVenture?.id || null,
        p_limit: 5,
      });

      if (rpcError) {
        console.warn('RPC not available, using fallback:', rpcError.message);
        await fetchUpcomingFollowUpsFallback();
        return;
      }

      const followUps: UpcomingFollowUp[] = (data || []).map((item: {
        id: string;
        name: string;
        company: string | null;
        next_follow_up: string;
        follow_up_note: string | null;
        pipeline_stage: string;
        priority: string;
      }) => ({
        id: item.id,
        name: item.name,
        company: item.company,
        nextFollowUp: item.next_follow_up,
        followUpNote: item.follow_up_note,
        pipelineStage: item.pipeline_stage,
        priority: item.priority,
      }));

      setUpcomingFollowUps(followUps);
    } catch (err) {
      console.error('Error fetching upcoming follow-ups:', err);
      await fetchUpcomingFollowUpsFallback();
    }
  }, [user, activeVenture]);

  // Fallback for upcoming follow-ups
  const fetchUpcomingFollowUpsFallback = async () => {
    if (!user) return;

    let query = supabase
      .from('investor_contacts')
      .select('id, name, company, next_follow_up, follow_up_note, pipeline_stage, priority')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .not('next_follow_up', 'is', null)
      .order('next_follow_up', { ascending: true })
      .limit(5);

    if (activeVenture) {
      query = query.eq('venture_id', activeVenture.id);
    }

    const { data } = await query;

    if (!data) return;

    const followUps: UpcomingFollowUp[] = data.map((item) => ({
      id: item.id,
      name: item.name,
      company: item.company,
      nextFollowUp: item.next_follow_up,
      followUpNote: item.follow_up_note,
      pipelineStage: item.pipeline_stage,
      priority: item.priority,
    }));

    setUpcomingFollowUps(followUps);
  };

  // Fetch Journey Progress (from wizard/route data)
  const fetchJourneyProgress = useCallback(async () => {
    if (!user) return;

    // This would typically come from the route/wizard slice
    // For now, we calculate from available data
    const phases = [
      { name: 'Discover', tasks: 5 },
      { name: 'Define', tasks: 8 },
      { name: 'Develop', tasks: 12 },
      { name: 'Deliver', tasks: 10 },
      { name: 'Scale', tasks: 7 },
    ];

    // Get stored progress from localStorage or venture data
    const storedProgress = localStorage.getItem(`journey_progress_${activeVenture?.id || 'default'}`);
    let completedTasks = 0;
    let currentPhase = 0;

    if (storedProgress) {
      const parsed = JSON.parse(storedProgress);
      completedTasks = parsed.completedTasks || 0;
      currentPhase = parsed.currentPhase || 0;
    }

    const totalTasks = phases.reduce((sum, p) => sum + p.tasks, 0);

    setJourneyProgress({
      currentPhase,
      totalPhases: phases.length,
      completedTasks,
      totalTasks,
      percentComplete: Math.round((completedTasks / totalTasks) * 100),
      phaseName: phases[currentPhase]?.name || 'Discover',
    });
  }, [user, activeVenture]);

  // Save valuation to history
  const saveValuation = async (
    amount: number,
    method: string,
    currency: string = 'EUR',
    notes?: string
  ): Promise<boolean> => {
    if (!user) return false;

    const { error: insertError } = await supabase.from('valuation_history').insert({
      user_id: user.id,
      venture_id: activeVenture?.id || null,
      valuation_amount: amount,
      valuation_method: method,
      currency,
      notes,
    });

    if (insertError) {
      console.error('Error saving valuation:', insertError);
      setError('Fehler beim Speichern der Bewertung');
      return false;
    }

    await fetchValuationHistory();
    return true;
  };

  // Update journey progress
  const updateJourneyProgress = (completedTasks: number, currentPhase: number) => {
    const key = `journey_progress_${activeVenture?.id || 'default'}`;
    localStorage.setItem(key, JSON.stringify({ completedTasks, currentPhase }));
    fetchJourneyProgress();
  };

  // Refresh all data
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchPipelineFunnel(),
        fetchValuationHistory(),
        fetchRecentActivities(),
        fetchUpcomingFollowUps(),
        fetchJourneyProgress(),
      ]);
    } catch (err) {
      console.error('Error refreshing analytics:', err);
      setError('Fehler beim Laden der Daten');
    } finally {
      setIsLoading(false);
    }
  }, [
    fetchDashboardStats,
    fetchPipelineFunnel,
    fetchValuationHistory,
    fetchRecentActivities,
    fetchUpcomingFollowUps,
    fetchJourneyProgress,
  ]);

  // Initial load and venture change
  useEffect(() => {
    if (user) {
      refresh();
    }
  }, [user, activeVenture, refresh]);

  return {
    // Data
    dashboardStats,
    pipelineFunnel,
    valuationHistory,
    recentActivities,
    upcomingFollowUps,
    journeyProgress,

    // State
    isLoading,
    error,

    // Actions
    refresh,
    saveValuation,
    updateJourneyProgress,
  };
}

export default useAnalytics;
