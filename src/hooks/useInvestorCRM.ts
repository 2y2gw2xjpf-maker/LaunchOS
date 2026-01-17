/**
 * LaunchOS Investor CRM Hook
 * Vollstaendiges CRM fuer Investoren-Kontakte
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { useOptionalVentureContext } from '@/contexts/VentureContext';

// ==================== TYPES ====================

export type InvestorType = 'vc' | 'angel' | 'family_office' | 'corporate' | 'accelerator' | 'other';

export type PipelineStage =
  | 'lead'
  | 'researching'
  | 'contacted'
  | 'meeting_scheduled'
  | 'meeting_done'
  | 'follow_up'
  | 'term_sheet'
  | 'due_diligence'
  | 'closed_won'
  | 'closed_lost'
  | 'on_hold';

export type ActivityType =
  | 'email_sent'
  | 'email_received'
  | 'call'
  | 'meeting'
  | 'linkedin_message'
  | 'intro_request'
  | 'note'
  | 'stage_change'
  | 'document_shared'
  | 'feedback_received';

export const PIPELINE_STAGES: { value: PipelineStage; label: string; color: string }[] = [
  { value: 'lead', label: 'Lead', color: '#6b7280' },
  { value: 'researching', label: 'Recherche', color: '#8b5cf6' },
  { value: 'contacted', label: 'Kontaktiert', color: '#3b82f6' },
  { value: 'meeting_scheduled', label: 'Meeting geplant', color: '#06b6d4' },
  { value: 'meeting_done', label: 'Meeting gehabt', color: '#10b981' },
  { value: 'follow_up', label: 'Follow-up', color: '#f59e0b' },
  { value: 'term_sheet', label: 'Term Sheet', color: '#ec4899' },
  { value: 'due_diligence', label: 'Due Diligence', color: '#f97316' },
  { value: 'closed_won', label: 'Gewonnen', color: '#22c55e' },
  { value: 'closed_lost', label: 'Verloren', color: '#ef4444' },
  { value: 'on_hold', label: 'Pausiert', color: '#94a3b8' },
];

export const INVESTOR_TYPES: { value: InvestorType; label: string }[] = [
  { value: 'vc', label: 'VC' },
  { value: 'angel', label: 'Angel' },
  { value: 'family_office', label: 'Family Office' },
  { value: 'corporate', label: 'Corporate VC' },
  { value: 'accelerator', label: 'Accelerator' },
  { value: 'other', label: 'Sonstige' },
];

export const ACTIVITY_TYPES: { value: ActivityType; label: string; icon: string }[] = [
  { value: 'email_sent', label: 'E-Mail gesendet', icon: '📤' },
  { value: 'email_received', label: 'E-Mail erhalten', icon: '📥' },
  { value: 'call', label: 'Anruf', icon: '📞' },
  { value: 'meeting', label: 'Meeting', icon: '🤝' },
  { value: 'linkedin_message', label: 'LinkedIn', icon: '💼' },
  { value: 'intro_request', label: 'Intro angefragt', icon: '🔗' },
  { value: 'note', label: 'Notiz', icon: '📝' },
  { value: 'stage_change', label: 'Stage-Wechsel', icon: '➡️' },
  { value: 'document_shared', label: 'Dokument geteilt', icon: '📄' },
  { value: 'feedback_received', label: 'Feedback erhalten', icon: '💬' },
];

export interface InvestorContact {
  id: string;
  userId: string;
  ventureId?: string;
  name: string;
  company?: string;
  role?: string;
  type?: InvestorType;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  website?: string;
  investmentFocus?: string[];
  stageFocus?: string[];
  ticketSizeMin?: number;
  ticketSizeMax?: number;
  geography?: string[];
  pipelineStage: PipelineStage;
  pipelineStageUpdatedAt: Date;
  priority: 'high' | 'medium' | 'low';
  fitScore?: number;
  nextFollowUp?: Date;
  followUpNote?: string;
  source?: string;
  referredBy?: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags?: InvestorTag[];
  activities?: InvestorActivity[];
}

export interface InvestorActivity {
  id: string;
  contactId: string;
  userId: string;
  type: ActivityType;
  title: string;
  description?: string;
  relatedDeliverableId?: string;
  activityDate: Date;
  createdAt: Date;
}

export interface InvestorTag {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface UseInvestorCRMReturn {
  contacts: InvestorContact[];
  tags: InvestorTag[];
  isLoading: boolean;
  error: string | null;

  // Contacts
  createContact: (data: Partial<InvestorContact>) => Promise<InvestorContact | null>;
  updateContact: (id: string, data: Partial<InvestorContact>) => Promise<boolean>;
  deleteContact: (id: string) => Promise<boolean>;
  archiveContact: (id: string) => Promise<boolean>;
  updatePipelineStage: (id: string, stage: PipelineStage) => Promise<boolean>;

  // Activities
  addActivity: (contactId: string, data: Partial<InvestorActivity>) => Promise<InvestorActivity | null>;
  getActivities: (contactId: string) => Promise<InvestorActivity[]>;

  // Tags
  createTag: (name: string, color?: string) => Promise<InvestorTag | null>;
  deleteTag: (id: string) => Promise<boolean>;
  addTagToContact: (contactId: string, tagId: string) => Promise<boolean>;
  removeTagFromContact: (contactId: string, tagId: string) => Promise<boolean>;

  // Queries
  getContactsByStage: (stage: PipelineStage) => InvestorContact[];
  getUpcomingFollowUps: (days?: number) => InvestorContact[];
  getPipelineStats: () => { stage: PipelineStage; count: number; label: string; color: string }[];

  refresh: () => Promise<void>;
}

// ==================== HOOK ====================

export function useInvestorCRM(): UseInvestorCRMReturn {
  const { user } = useAuth();
  const ventureContext = useOptionalVentureContext();
  const activeVenture = ventureContext?.activeVenture;
  const [contacts, setContacts] = useState<InvestorContact[]>([]);
  const [tags, setTags] = useState<InvestorTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map DB row to InvestorContact
  const mapContact = (row: Record<string, unknown>): InvestorContact => ({
    id: row.id as string,
    userId: row.user_id as string,
    ventureId: row.venture_id as string | undefined,
    name: row.name as string,
    company: row.company as string | undefined,
    role: row.role as string | undefined,
    type: row.type as InvestorType | undefined,
    email: row.email as string | undefined,
    phone: row.phone as string | undefined,
    linkedinUrl: row.linkedin_url as string | undefined,
    website: row.website as string | undefined,
    investmentFocus: row.investment_focus as string[] | undefined,
    stageFocus: row.stage_focus as string[] | undefined,
    ticketSizeMin: row.ticket_size_min as number | undefined,
    ticketSizeMax: row.ticket_size_max as number | undefined,
    geography: row.geography as string[] | undefined,
    pipelineStage: row.pipeline_stage as PipelineStage,
    pipelineStageUpdatedAt: new Date(row.pipeline_stage_updated_at as string),
    priority: row.priority as 'high' | 'medium' | 'low',
    fitScore: row.fit_score as number | undefined,
    nextFollowUp: row.next_follow_up ? new Date(row.next_follow_up as string) : undefined,
    followUpNote: row.follow_up_note as string | undefined,
    source: row.source as string | undefined,
    referredBy: row.referred_by as string | undefined,
    isArchived: row.is_archived as boolean,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  });

  // Map DB row to InvestorActivity
  const mapActivity = (row: Record<string, unknown>): InvestorActivity => ({
    id: row.id as string,
    contactId: row.contact_id as string,
    userId: row.user_id as string,
    type: row.type as ActivityType,
    title: row.title as string,
    description: row.description as string | undefined,
    relatedDeliverableId: row.related_deliverable_id as string | undefined,
    activityDate: new Date(row.activity_date as string),
    createdAt: new Date(row.created_at as string),
  });

  // Map DB row to InvestorTag
  const mapTag = (row: Record<string, unknown>): InvestorTag => ({
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    color: row.color as string,
    createdAt: new Date(row.created_at as string),
  });

  // Load contacts
  const loadContacts = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) {
      setContacts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('investor_contacts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('updated_at', { ascending: false });

      if (activeVenture) {
        query = query.eq('venture_id', activeVenture.id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Load tags for each contact
      const contactsWithTags = await Promise.all(
        (data || []).map(async (contact) => {
          const mappedContact = mapContact(contact);

          // Get tags for this contact
          const { data: tagData } = await supabase
            .from('investor_contact_tags')
            .select('tag_id')
            .eq('contact_id', contact.id);

          if (tagData && tagData.length > 0) {
            const tagIds = tagData.map((t) => t.tag_id);
            const { data: tagDetails } = await supabase
              .from('investor_tags')
              .select('*')
              .in('id', tagIds);

            mappedContact.tags = (tagDetails || []).map(mapTag);
          }

          return mappedContact;
        })
      );

      setContacts(contactsWithTags);
    } catch (err) {
      console.error('Error loading contacts:', err);
      setError('Fehler beim Laden der Kontakte');
    } finally {
      setIsLoading(false);
    }
  }, [user, activeVenture]);

  // Load tags
  const loadTags = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) {
      setTags([]);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('investor_tags')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (fetchError) throw fetchError;

      setTags((data || []).map(mapTag));
    } catch (err) {
      console.error('Error loading tags:', err);
    }
  }, [user]);

  // Create contact
  const createContact = useCallback(
    async (data: Partial<InvestorContact>): Promise<InvestorContact | null> => {
      if (!user || !isSupabaseConfigured()) return null;

      try {
        const { data: newContact, error } = await supabase
          .from('investor_contacts')
          .insert({
            user_id: user.id,
            venture_id: activeVenture?.id,
            name: data.name,
            company: data.company,
            role: data.role,
            type: data.type,
            email: data.email,
            phone: data.phone,
            linkedin_url: data.linkedinUrl,
            website: data.website,
            investment_focus: data.investmentFocus,
            stage_focus: data.stageFocus,
            ticket_size_min: data.ticketSizeMin,
            ticket_size_max: data.ticketSizeMax,
            geography: data.geography,
            pipeline_stage: data.pipelineStage || 'lead',
            priority: data.priority || 'medium',
            fit_score: data.fitScore,
            next_follow_up: data.nextFollowUp?.toISOString(),
            follow_up_note: data.followUpNote,
            source: data.source || 'manual',
            referred_by: data.referredBy,
          })
          .select()
          .single();

        if (error) throw error;

        await loadContacts();
        return mapContact(newContact);
      } catch (err) {
        console.error('Error creating contact:', err);
        setError('Fehler beim Erstellen des Kontakts');
        return null;
      }
    },
    [user, activeVenture, loadContacts]
  );

  // Update contact
  const updateContact = useCallback(
    async (id: string, data: Partial<InvestorContact>): Promise<boolean> => {
      if (!isSupabaseConfigured()) return false;

      try {
        const updateData: Record<string, unknown> = {};

        if (data.name !== undefined) updateData.name = data.name;
        if (data.company !== undefined) updateData.company = data.company;
        if (data.role !== undefined) updateData.role = data.role;
        if (data.type !== undefined) updateData.type = data.type;
        if (data.email !== undefined) updateData.email = data.email;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.linkedinUrl !== undefined) updateData.linkedin_url = data.linkedinUrl;
        if (data.website !== undefined) updateData.website = data.website;
        if (data.investmentFocus !== undefined) updateData.investment_focus = data.investmentFocus;
        if (data.stageFocus !== undefined) updateData.stage_focus = data.stageFocus;
        if (data.ticketSizeMin !== undefined) updateData.ticket_size_min = data.ticketSizeMin;
        if (data.ticketSizeMax !== undefined) updateData.ticket_size_max = data.ticketSizeMax;
        if (data.geography !== undefined) updateData.geography = data.geography;
        if (data.priority !== undefined) updateData.priority = data.priority;
        if (data.fitScore !== undefined) updateData.fit_score = data.fitScore;
        if (data.nextFollowUp !== undefined) updateData.next_follow_up = data.nextFollowUp?.toISOString();
        if (data.followUpNote !== undefined) updateData.follow_up_note = data.followUpNote;

        const { error } = await supabase.from('investor_contacts').update(updateData).eq('id', id);

        if (error) throw error;

        await loadContacts();
        return true;
      } catch (err) {
        console.error('Error updating contact:', err);
        setError('Fehler beim Aktualisieren');
        return false;
      }
    },
    [loadContacts]
  );

  // Delete contact
  const deleteContact = useCallback(
    async (id: string): Promise<boolean> => {
      if (!isSupabaseConfigured()) return false;

      try {
        const { error } = await supabase.from('investor_contacts').delete().eq('id', id);

        if (error) throw error;

        await loadContacts();
        return true;
      } catch (err) {
        console.error('Error deleting contact:', err);
        setError('Fehler beim Loeschen');
        return false;
      }
    },
    [loadContacts]
  );

  // Archive contact
  const archiveContact = useCallback(
    async (id: string): Promise<boolean> => {
      if (!isSupabaseConfigured()) return false;

      try {
        const { error } = await supabase.from('investor_contacts').update({ is_archived: true }).eq('id', id);

        if (error) throw error;

        await loadContacts();
        return true;
      } catch (err) {
        console.error('Error archiving contact:', err);
        setError('Fehler beim Archivieren');
        return false;
      }
    },
    [loadContacts]
  );

  // Update pipeline stage
  const updatePipelineStage = useCallback(
    async (id: string, stage: PipelineStage): Promise<boolean> => {
      if (!user || !isSupabaseConfigured()) return false;

      try {
        const contact = contacts.find((c) => c.id === id);
        const oldStage = contact?.pipelineStage;

        const { error } = await supabase
          .from('investor_contacts')
          .update({
            pipeline_stage: stage,
            pipeline_stage_updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;

        // Log stage change activity
        if (oldStage && oldStage !== stage) {
          await addActivity(id, {
            type: 'stage_change',
            title: `Stage geaendert: ${PIPELINE_STAGES.find((s) => s.value === oldStage)?.label} → ${PIPELINE_STAGES.find((s) => s.value === stage)?.label}`,
          });
        }

        await loadContacts();
        return true;
      } catch (err) {
        console.error('Error updating pipeline stage:', err);
        setError('Fehler beim Stage-Wechsel');
        return false;
      }
    },
    [user, contacts, loadContacts]
  );

  // Add activity
  const addActivity = useCallback(
    async (contactId: string, data: Partial<InvestorActivity>): Promise<InvestorActivity | null> => {
      if (!user || !isSupabaseConfigured()) return null;

      try {
        const { data: newActivity, error } = await supabase
          .from('investor_activities')
          .insert({
            contact_id: contactId,
            user_id: user.id,
            type: data.type || 'note',
            title: data.title || '',
            description: data.description,
            related_deliverable_id: data.relatedDeliverableId,
            activity_date: data.activityDate?.toISOString() || new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;

        return mapActivity(newActivity);
      } catch (err) {
        console.error('Error adding activity:', err);
        setError('Fehler beim Hinzufuegen der Aktivitaet');
        return null;
      }
    },
    [user]
  );

  // Get activities for contact
  const getActivities = useCallback(async (contactId: string): Promise<InvestorActivity[]> => {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('investor_activities')
        .select('*')
        .eq('contact_id', contactId)
        .order('activity_date', { ascending: false });

      if (error) throw error;

      return (data || []).map(mapActivity);
    } catch (err) {
      console.error('Error loading activities:', err);
      return [];
    }
  }, []);

  // Create tag
  const createTag = useCallback(
    async (name: string, color?: string): Promise<InvestorTag | null> => {
      if (!user || !isSupabaseConfigured()) return null;

      try {
        const { data: newTag, error } = await supabase
          .from('investor_tags')
          .insert({
            user_id: user.id,
            name,
            color: color || '#9333ea',
          })
          .select()
          .single();

        if (error) throw error;

        await loadTags();
        return mapTag(newTag);
      } catch (err) {
        console.error('Error creating tag:', err);
        setError('Fehler beim Erstellen des Tags');
        return null;
      }
    },
    [user, loadTags]
  );

  // Delete tag
  const deleteTag = useCallback(
    async (id: string): Promise<boolean> => {
      if (!isSupabaseConfigured()) return false;

      try {
        const { error } = await supabase.from('investor_tags').delete().eq('id', id);

        if (error) throw error;

        await loadTags();
        return true;
      } catch (err) {
        console.error('Error deleting tag:', err);
        setError('Fehler beim Loeschen des Tags');
        return false;
      }
    },
    [loadTags]
  );

  // Add tag to contact
  const addTagToContact = useCallback(
    async (contactId: string, tagId: string): Promise<boolean> => {
      if (!isSupabaseConfigured()) return false;

      try {
        const { error } = await supabase.from('investor_contact_tags').insert({
          contact_id: contactId,
          tag_id: tagId,
        });

        if (error) throw error;

        await loadContacts();
        return true;
      } catch (err) {
        console.error('Error adding tag to contact:', err);
        return false;
      }
    },
    [loadContacts]
  );

  // Remove tag from contact
  const removeTagFromContact = useCallback(
    async (contactId: string, tagId: string): Promise<boolean> => {
      if (!isSupabaseConfigured()) return false;

      try {
        const { error } = await supabase
          .from('investor_contact_tags')
          .delete()
          .eq('contact_id', contactId)
          .eq('tag_id', tagId);

        if (error) throw error;

        await loadContacts();
        return true;
      } catch (err) {
        console.error('Error removing tag from contact:', err);
        return false;
      }
    },
    [loadContacts]
  );

  // Get contacts by stage
  const getContactsByStage = useCallback(
    (stage: PipelineStage): InvestorContact[] => {
      return contacts.filter((c) => c.pipelineStage === stage);
    },
    [contacts]
  );

  // Get upcoming follow-ups
  const getUpcomingFollowUps = useCallback(
    (days = 7): InvestorContact[] => {
      const now = new Date();
      const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      return contacts
        .filter((c) => c.nextFollowUp && c.nextFollowUp >= now && c.nextFollowUp <= futureDate)
        .sort((a, b) => (a.nextFollowUp?.getTime() || 0) - (b.nextFollowUp?.getTime() || 0));
    },
    [contacts]
  );

  // Get pipeline statistics
  const getPipelineStats = useCallback((): { stage: PipelineStage; count: number; label: string; color: string }[] => {
    return PIPELINE_STAGES.map((stage) => ({
      stage: stage.value,
      count: contacts.filter((c) => c.pipelineStage === stage.value).length,
      label: stage.label,
      color: stage.color,
    }));
  }, [contacts]);

  // Refresh data
  const refresh = useCallback(async () => {
    await Promise.all([loadContacts(), loadTags()]);
  }, [loadContacts, loadTags]);

  // Load on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    contacts,
    tags,
    isLoading,
    error,
    createContact,
    updateContact,
    deleteContact,
    archiveContact,
    updatePipelineStage,
    addActivity,
    getActivities,
    createTag,
    deleteTag,
    addTagToContact,
    removeTagFromContact,
    getContactsByStage,
    getUpcomingFollowUps,
    getPipelineStats,
    refresh,
  };
}

export default useInvestorCRM;
