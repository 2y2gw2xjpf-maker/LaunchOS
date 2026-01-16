/**
 * LaunchOS Deliverables Hook
 * Verwaltet generierte Dokumente
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { useOptionalVentureContext } from '@/contexts/VentureContext';

// ==================== TYPES ====================

export type DeliverableType =
  | 'pitch_deck'
  | 'business_plan'
  | 'financial_model'
  | 'investor_list'
  | 'valuation_report'
  | 'legal_docs'
  | 'data_room'
  | 'outreach_emails'
  | 'other';

export interface Deliverable {
  id: string;
  userId: string;
  ventureId?: string;
  type: DeliverableType;
  title: string;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  version: number;
  parentId?: string;
  generatedBy: 'ai' | 'user';
  generationParams?: Record<string, unknown>;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export const DELIVERABLE_LABELS: Record<DeliverableType, string> = {
  pitch_deck: 'Pitch Deck',
  business_plan: 'Businessplan',
  financial_model: 'Finanzmodell',
  investor_list: 'Investoren-Liste',
  valuation_report: 'Bewertungsreport',
  legal_docs: 'Rechtsdokumente',
  data_room: 'Data Room',
  outreach_emails: 'Outreach E-Mails',
  other: 'Sonstiges',
};

export const DELIVERABLE_ICONS: Record<DeliverableType, string> = {
  pitch_deck: '\uD83D\uDCCA', // chart
  business_plan: '\uD83D\uDCCB', // clipboard
  financial_model: '\uD83D\uDCB0', // money
  investor_list: '\uD83D\uDC65', // people
  valuation_report: '\uD83D\uDCC8', // chart up
  legal_docs: '\u2696\uFE0F', // scales
  data_room: '\uD83D\uDCC1', // folder
  outreach_emails: '\uD83D\uDCE7', // email
  other: '\uD83D\uDCC4', // document
};

export interface UseDeliverablesReturn {
  deliverables: Deliverable[];
  isLoading: boolean;
  error: string | null;
  getByType: (type: DeliverableType) => Deliverable[];
  getVersions: (parentId: string) => Deliverable[];
  createDeliverable: (data: Partial<Deliverable>) => Promise<Deliverable | null>;
  updateDeliverable: (id: string, data: Partial<Deliverable>) => Promise<boolean>;
  deleteDeliverable: (id: string) => Promise<boolean>;
  downloadDeliverable: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

// ==================== HOOK ====================

export function useDeliverables(): UseDeliverablesReturn {
  const { user } = useAuth();
  const ventureContext = useOptionalVentureContext();
  const activeVenture = ventureContext?.activeVenture;
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map DB row to Deliverable
  const mapDeliverable = (row: Record<string, unknown>): Deliverable => ({
    id: row.id as string,
    userId: row.user_id as string,
    ventureId: row.venture_id as string | undefined,
    type: row.type as DeliverableType,
    title: row.title as string,
    description: row.description as string | undefined,
    fileUrl: row.file_url as string | undefined,
    fileName: row.file_name as string | undefined,
    fileSize: row.file_size as number | undefined,
    fileType: row.file_type as string | undefined,
    version: row.version as number,
    parentId: row.parent_id as string | undefined,
    generatedBy: row.generated_by as 'ai' | 'user',
    generationParams: row.generation_params as Record<string, unknown> | undefined,
    status: row.status as Deliverable['status'],
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  });

  // Load deliverables
  const loadDeliverables = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) {
      setDeliverables([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('deliverables')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Filter by active venture if exists
      if (activeVenture) {
        query = query.eq('venture_id', activeVenture.id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setDeliverables((data || []).map(mapDeliverable));
    } catch (err) {
      console.error('Error loading deliverables:', err);
      setError('Fehler beim Laden der Dokumente');
    } finally {
      setIsLoading(false);
    }
  }, [user, activeVenture]);

  // Get by type
  const getByType = useCallback((type: DeliverableType): Deliverable[] => {
    return deliverables.filter(d => d.type === type && !d.parentId);
  }, [deliverables]);

  // Get versions
  const getVersions = useCallback((parentId: string): Deliverable[] => {
    const parent = deliverables.find(d => d.id === parentId);
    if (!parent) return [];

    const versions = deliverables.filter(d => d.parentId === parentId);
    return [parent, ...versions].sort((a, b) => b.version - a.version);
  }, [deliverables]);

  // Create deliverable
  const createDeliverable = useCallback(async (data: Partial<Deliverable>): Promise<Deliverable | null> => {
    if (!user || !isSupabaseConfigured()) return null;

    try {
      // Calculate version
      let version = 1;
      if (data.parentId) {
        const siblings = deliverables.filter(d =>
          d.parentId === data.parentId || d.id === data.parentId
        );
        version = Math.max(...siblings.map(s => s.version), 0) + 1;
      }

      const { data: newDeliverable, error } = await supabase
        .from('deliverables')
        .insert({
          user_id: user.id,
          venture_id: activeVenture?.id,
          type: data.type,
          title: data.title,
          description: data.description,
          file_url: data.fileUrl,
          file_name: data.fileName,
          file_size: data.fileSize,
          file_type: data.fileType,
          version,
          parent_id: data.parentId,
          generated_by: data.generatedBy || 'ai',
          generation_params: data.generationParams,
          status: data.status || 'completed',
        })
        .select()
        .single();

      if (error) throw error;

      await loadDeliverables();
      return mapDeliverable(newDeliverable);
    } catch (err) {
      console.error('Error creating deliverable:', err);
      setError('Fehler beim Erstellen');
      return null;
    }
  }, [user, activeVenture, deliverables, loadDeliverables]);

  // Update deliverable
  const updateDeliverable = useCallback(async (id: string, data: Partial<Deliverable>): Promise<boolean> => {
    if (!isSupabaseConfigured()) return false;

    try {
      const updateData: Record<string, unknown> = {};

      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.fileUrl !== undefined) updateData.file_url = data.fileUrl;
      if (data.fileName !== undefined) updateData.file_name = data.fileName;
      if (data.status !== undefined) updateData.status = data.status;

      const { error } = await supabase
        .from('deliverables')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      await loadDeliverables();
      return true;
    } catch (err) {
      console.error('Error updating deliverable:', err);
      setError('Fehler beim Aktualisieren');
      return false;
    }
  }, [loadDeliverables]);

  // Delete deliverable
  const deleteDeliverable = useCallback(async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) return false;

    try {
      // Delete all versions first
      const versionsToDelete = deliverables
        .filter(d => d.parentId === id)
        .map(d => d.id);

      if (versionsToDelete.length > 0) {
        await supabase
          .from('deliverables')
          .delete()
          .in('id', versionsToDelete);
      }

      const { error } = await supabase
        .from('deliverables')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadDeliverables();
      return true;
    } catch (err) {
      console.error('Error deleting deliverable:', err);
      setError('Fehler beim Loeschen');
      return false;
    }
  }, [deliverables, loadDeliverables]);

  // Download deliverable
  const downloadDeliverable = useCallback(async (id: string): Promise<void> => {
    const deliverable = deliverables.find(d => d.id === id);
    if (!deliverable?.fileUrl) return;

    try {
      const response = await fetch(deliverable.fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = deliverable.fileName || `${deliverable.title}.${deliverable.fileType}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading deliverable:', err);
      setError('Fehler beim Download');
    }
  }, [deliverables]);

  // Load on mount and when dependencies change
  useEffect(() => {
    loadDeliverables();
  }, [loadDeliverables]);

  return {
    deliverables,
    isLoading,
    error,
    getByType,
    getVersions,
    createDeliverable,
    updateDeliverable,
    deleteDeliverable,
    downloadDeliverable,
    refresh: loadDeliverables,
  };
}

export default useDeliverables;
