/**
 * LaunchOS Ventures Hook
 * Verwaltet Startups/Projekte des Nutzers
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';

// Helper to check if error is an AbortError (cleanup-related)
const isAbortError = (err: unknown): boolean => {
  if (err instanceof Error) {
    return err.name === 'AbortError' || err.message.includes('aborted');
  }
  if (typeof err === 'object' && err !== null) {
    const errorObj = err as { message?: string; name?: string; code?: string; cause?: unknown };
    // Check direct properties
    if (errorObj.name === 'AbortError' ||
        (typeof errorObj.message === 'string' && errorObj.message.includes('aborted'))) {
      return true;
    }
    // Check Supabase error code
    if (errorObj.code === 'PGRST301' || errorObj.code === 'FETCH_ERROR') {
      return true;
    }
    // Check nested cause
    if (errorObj.cause && isAbortError(errorObj.cause)) {
      return true;
    }
  }
  return false;
};

// ==================== TYPES ====================

export interface TierData {
  tier: number;
  category: string;
  stage: string;
  description: string;
  url: string;
  github_url: string;
  pitch_deck_url: string;
  has_financials: boolean;
  financials_summary: string;
  completed_at: string | null;
}

export interface Venture {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  industry?: string;
  stage?: 'idea' | 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'growth';
  companyType?: string;
  fundingPath?: 'bootstrap' | 'investor' | 'hybrid' | 'undecided';
  fundingGoal?: string;
  monthlyRevenue?: number;
  teamSize?: number;
  logoUrl?: string;
  branding?: {
    primary_color: string;
    secondary_color: string;
    font: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Tier-basierte Daten
  tierLevel?: number;
  tierData?: TierData;
  // Anzahl verknüpfter Analysen (wird beim Laden berechnet)
  analysesCount?: number;
}

export interface UseVenturesReturn {
  ventures: Venture[];
  activeVenture: Venture | null;
  isLoading: boolean;
  error: string | null;
  createVenture: (data: Partial<Venture>) => Promise<Venture | null>;
  updateVenture: (id: string, data: Partial<Venture>) => Promise<boolean>;
  deleteVenture: (id: string) => Promise<boolean>;
  setActiveVenture: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

// ==================== HOOK ====================

export function useVentures(): UseVenturesReturn {
  const { user, session, loading: authLoading } = useAuth();
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const loadingRef = useRef(false);

  // Map DB row to Venture object
  const mapVenture = (row: Record<string, unknown>): Venture => ({
    id: row.id as string,
    name: row.name as string,
    tagline: row.tagline as string | undefined,
    description: row.description as string | undefined,
    industry: row.industry as string | undefined,
    stage: row.stage as Venture['stage'],
    companyType: row.company_type as string | undefined,
    fundingPath: row.funding_path as Venture['fundingPath'],
    fundingGoal: row.funding_goal as string | undefined,
    monthlyRevenue: row.monthly_revenue as number | undefined,
    teamSize: row.team_size as number | undefined,
    logoUrl: row.logo_url as string | undefined,
    branding: row.branding as Venture['branding'],
    isActive: row.is_active as boolean,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
    // Tier-basierte Daten
    tierLevel: row.tier_level as number | undefined,
    tierData: row.tier_data as TierData | undefined,
  });

  // Load ventures from DB
  const loadVentures = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) {
      setVentures([]);
      setIsLoading(false);
      return;
    }

    // Prevent concurrent loads
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('ventures')
        .select('*')
        .eq('user_id', user.id)
        .order('is_active', { ascending: false })
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Only update state if still mounted
      if (mountedRef.current) {
        setVentures((data || []).map(mapVenture));
      }
    } catch (err) {
      // Ignore AbortError - it's from component cleanup
      if (isAbortError(err)) {
        console.log('[Ventures] Request aborted (cleanup)');
        return;
      }
      console.error('Error loading ventures:', err);
      if (mountedRef.current) {
        setError('Fehler beim Laden der Ventures');
      }
    } finally {
      loadingRef.current = false;
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [user]);

  // Create new venture using direct fetch to bypass Supabase's global AbortController
  // Uses session token from AuthContext (already in memory) to avoid async getSession() calls
  const createVenture = useCallback(async (data: Partial<Venture>): Promise<Venture | null> => {
    // Bessere Fehlerbehandlung
    if (!isSupabaseConfigured()) {
      console.error('[Ventures] Supabase is not configured');
      setError('Datenbankverbindung nicht konfiguriert');
      return null;
    }

    if (!user) {
      console.error('[Ventures] No user logged in');
      setError('Bitte melde dich zuerst an');
      return null;
    }

    // Get access token from session in context (no async call needed)
    const accessToken = session?.access_token;
    if (!accessToken) {
      console.error('[Ventures] No access token in session');
      setError('Sitzung abgelaufen. Bitte lade die Seite neu.');
      return null;
    }

    try {
      // Wenn erstes Venture, automatisch aktiv setzen
      const isFirstVenture = ventures.length === 0;

      console.log('[Ventures] Creating venture for user:', user.id);

      // Use direct fetch to bypass Supabase client's AbortController issues
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const ventureData = {
        user_id: user.id,
        name: data.name,
        tagline: data.tagline || null,
        description: data.description || null,
        industry: data.industry || null,
        stage: data.stage || null,
        company_type: data.companyType || null,
        funding_path: data.fundingPath || null,
        funding_goal: data.fundingGoal || null,
        monthly_revenue: data.monthlyRevenue || null,
        team_size: data.teamSize || null,
        logo_url: data.logoUrl || null,
        branding: data.branding || null,
        is_active: isFirstVenture,
      };

      console.log('[Ventures] Making direct API call to create venture');

      const response = await fetch(`${supabaseUrl}/rest/v1/ventures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(ventureData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Ventures] API error:', response.status, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const newVentureArray = await response.json();
      const newVenture = Array.isArray(newVentureArray) ? newVentureArray[0] : newVentureArray;

      console.log('[Ventures] Venture created successfully:', newVenture);

      // Update local state immediately
      const mappedVenture = mapVenture(newVenture);
      if (mountedRef.current) {
        setVentures(prev => [mappedVenture, ...prev]);
      }

      // Refresh in background (don't await to avoid blocking)
      loadVentures().catch(() => {});

      return mappedVenture;
    } catch (err) {
      console.error('[Ventures] Error creating venture:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler';
      if (mountedRef.current) {
        setError(`Fehler beim Erstellen: ${errorMessage}`);
      }
      // Re-throw the error so callers can catch it with the detailed message
      throw new Error(errorMessage);
    }
  }, [user, session, ventures.length, loadVentures]);

  // Update venture
  const updateVenture = useCallback(async (id: string, data: Partial<Venture> & { tier_level?: number; tier_data?: TierData }): Promise<boolean> => {
    if (!isSupabaseConfigured()) return false;

    try {
      const updateData: Record<string, unknown> = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.tagline !== undefined) updateData.tagline = data.tagline;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.industry !== undefined) updateData.industry = data.industry;
      if (data.stage !== undefined) updateData.stage = data.stage;
      if (data.companyType !== undefined) updateData.company_type = data.companyType;
      if (data.fundingPath !== undefined) updateData.funding_path = data.fundingPath;
      if (data.fundingGoal !== undefined) updateData.funding_goal = data.fundingGoal;
      if (data.monthlyRevenue !== undefined) updateData.monthly_revenue = data.monthlyRevenue;
      if (data.teamSize !== undefined) updateData.team_size = data.teamSize;
      if (data.logoUrl !== undefined) updateData.logo_url = data.logoUrl;
      if (data.branding !== undefined) updateData.branding = data.branding;
      // Tier-basierte Daten
      if (data.tierLevel !== undefined) updateData.tier_level = data.tierLevel;
      if (data.tierData !== undefined) updateData.tier_data = data.tierData;
      if (data.tier_level !== undefined) updateData.tier_level = data.tier_level;
      if (data.tier_data !== undefined) updateData.tier_data = data.tier_data;

      const { error } = await supabase
        .from('ventures')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      await loadVentures();
      return true;
    } catch (err) {
      console.error('Error updating venture:', err);
      setError('Fehler beim Aktualisieren');
      return false;
    }
  }, [loadVentures]);

  // Delete venture
  const deleteVenture = useCallback(async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) return false;

    try {
      const { error } = await supabase
        .from('ventures')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadVentures();
      return true;
    } catch (err) {
      console.error('Error deleting venture:', err);
      setError('Fehler beim Löschen');
      return false;
    }
  }, [loadVentures]);

  // Set active venture
  const setActiveVenture = useCallback(async (id: string): Promise<boolean> => {
    if (!user || !isSupabaseConfigured()) return false;

    try {
      // Erst alle deaktivieren
      await supabase
        .from('ventures')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Dann gewähltes aktivieren
      const { error } = await supabase
        .from('ventures')
        .update({ is_active: true })
        .eq('id', id);

      if (error) throw error;

      await loadVentures();
      return true;
    } catch (err) {
      console.error('Error setting active venture:', err);
      setError('Fehler beim Aktivieren');
      return false;
    }
  }, [user, loadVentures]);

  // Track mounted state for cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Load on mount and when user changes (wait for auth to be ready)
  useEffect(() => {
    // Don't load while auth is still loading
    if (authLoading) {
      return;
    }
    loadVentures();
  }, [loadVentures, authLoading]);

  // Get active venture
  const activeVenture = ventures.find(v => v.isActive) || null;

  return {
    ventures,
    activeVenture,
    isLoading,
    error,
    createVenture,
    updateVenture,
    deleteVenture,
    setActiveVenture,
    refresh: loadVentures,
  };
}

export default useVentures;
