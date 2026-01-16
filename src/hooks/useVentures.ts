/**
 * LaunchOS Ventures Hook
 * Verwaltet Startups/Projekte des Nutzers
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';

// ==================== TYPES ====================

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
  const { user } = useAuth();
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  });

  // Load ventures from DB
  const loadVentures = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) {
      setVentures([]);
      setIsLoading(false);
      return;
    }

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

      setVentures((data || []).map(mapVenture));
    } catch (err) {
      console.error('Error loading ventures:', err);
      setError('Fehler beim Laden der Ventures');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Create new venture
  const createVenture = useCallback(async (data: Partial<Venture>): Promise<Venture | null> => {
    if (!user || !isSupabaseConfigured()) return null;

    try {
      // Wenn erstes Venture, automatisch aktiv setzen
      const isFirstVenture = ventures.length === 0;

      const { data: newVenture, error } = await supabase
        .from('ventures')
        .insert({
          user_id: user.id,
          name: data.name,
          tagline: data.tagline,
          description: data.description,
          industry: data.industry,
          stage: data.stage,
          company_type: data.companyType,
          funding_path: data.fundingPath,
          funding_goal: data.fundingGoal,
          monthly_revenue: data.monthlyRevenue,
          team_size: data.teamSize,
          logo_url: data.logoUrl,
          branding: data.branding,
          is_active: isFirstVenture,
        })
        .select()
        .single();

      if (error) throw error;

      await loadVentures();
      return mapVenture(newVenture);
    } catch (err) {
      console.error('Error creating venture:', err);
      setError('Fehler beim Erstellen des Ventures');
      return null;
    }
  }, [user, ventures.length, loadVentures]);

  // Update venture
  const updateVenture = useCallback(async (id: string, data: Partial<Venture>): Promise<boolean> => {
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

  // Load on mount and when user changes
  useEffect(() => {
    loadVentures();
  }, [loadVentures]);

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
