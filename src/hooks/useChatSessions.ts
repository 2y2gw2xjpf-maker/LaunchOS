/**
 * LaunchOS Chat Sessions Hook
 * Verwaltet Chat-Sitzungen mit Persistenz in Supabase
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';

export interface ChatSession {
  id: string;
  title: string;
  ventureId?: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}

export interface UseChatSessionsReturn {
  sessions: ChatSession[];
  isLoading: boolean;
  createSession: (title?: string, ventureId?: string) => Promise<string | null>;
  deleteSession: (sessionId: string) => Promise<void>;
  updateSessionTitle: (sessionId: string, title: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useChatSessions(): UseChatSessionsReturn {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all sessions
  const loadSessions = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // First check if table exists by trying to query
      const { data, error } = await supabase
        .from('chat_sessions')
        .select(`
          id,
          title,
          venture_id,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        // Table might not exist - use localStorage fallback
        console.warn('Chat sessions table not available, using localStorage');
        const stored = localStorage.getItem(`launchos-chat-sessions-${user.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSessions(parsed.map((s: any) => ({
            ...s,
            createdAt: new Date(s.createdAt),
            updatedAt: new Date(s.updatedAt),
          })));
        }
        setIsLoading(false);
        return;
      }

      if (data) {
        // Count messages separately
        const sessionsWithCounts = await Promise.all(
          data.map(async (s) => {
            const { count } = await supabase
              .from('chat_messages')
              .select('*', { count: 'exact', head: true })
              .eq('session_id', s.id);

            return {
              id: s.id,
              title: s.title || 'Neue Unterhaltung',
              ventureId: s.venture_id,
              createdAt: new Date(s.created_at),
              updatedAt: new Date(s.updated_at),
              messageCount: count || 0,
            };
          })
        );

        setSessions(sessionsWithCounts);
      }
    } catch (err) {
      console.error('Error loading sessions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Create new session
  const createSession = useCallback(async (title?: string, ventureId?: string): Promise<string | null> => {
    if (!user) return null;

    const sessionId = crypto.randomUUID();
    const now = new Date();
    const sessionTitle = title || 'Neue Unterhaltung';

    if (!isSupabaseConfigured()) {
      // Use localStorage
      const newSession: ChatSession = {
        id: sessionId,
        title: sessionTitle,
        ventureId,
        createdAt: now,
        updatedAt: now,
        messageCount: 0,
      };

      const stored = localStorage.getItem(`launchos-chat-sessions-${user.id}`);
      const existing = stored ? JSON.parse(stored) : [];
      localStorage.setItem(
        `launchos-chat-sessions-${user.id}`,
        JSON.stringify([newSession, ...existing])
      );

      setSessions(prev => [newSession, ...prev]);
      return sessionId;
    }

    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          id: sessionId,
          user_id: user.id,
          venture_id: ventureId,
          title: sessionTitle,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.warn('Could not create session in DB, using localStorage');
        // Fallback to localStorage
        const newSession: ChatSession = {
          id: sessionId,
          title: sessionTitle,
          ventureId,
          createdAt: now,
          updatedAt: now,
          messageCount: 0,
        };

        const stored = localStorage.getItem(`launchos-chat-sessions-${user.id}`);
        const existing = stored ? JSON.parse(stored) : [];
        localStorage.setItem(
          `launchos-chat-sessions-${user.id}`,
          JSON.stringify([newSession, ...existing])
        );

        setSessions(prev => [newSession, ...prev]);
        return sessionId;
      }

      if (data) {
        await loadSessions();
        return data.id;
      }

      return sessionId;
    } catch (err) {
      console.error('Error creating session:', err);
      return null;
    }
  }, [user, loadSessions]);

  // Delete session
  const deleteSession = useCallback(async (sessionId: string) => {
    if (!user) return;

    if (!isSupabaseConfigured()) {
      // Use localStorage
      const stored = localStorage.getItem(`launchos-chat-sessions-${user.id}`);
      if (stored) {
        const existing = JSON.parse(stored);
        localStorage.setItem(
          `launchos-chat-sessions-${user.id}`,
          JSON.stringify(existing.filter((s: any) => s.id !== sessionId))
        );
      }
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      return;
    }

    try {
      // Delete messages first
      await supabase
        .from('chat_messages')
        .delete()
        .eq('session_id', sessionId);

      // Then delete session
      await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      await loadSessions();
    } catch (err) {
      console.error('Error deleting session:', err);
    }
  }, [user, loadSessions]);

  // Update session title
  const updateSessionTitle = useCallback(async (sessionId: string, title: string) => {
    if (!user) return;

    if (!isSupabaseConfigured()) {
      // Use localStorage
      const stored = localStorage.getItem(`launchos-chat-sessions-${user.id}`);
      if (stored) {
        const existing = JSON.parse(stored);
        const updated = existing.map((s: any) =>
          s.id === sessionId ? { ...s, title, updatedAt: new Date().toISOString() } : s
        );
        localStorage.setItem(`launchos-chat-sessions-${user.id}`, JSON.stringify(updated));
      }
      setSessions(prev =>
        prev.map(s => (s.id === sessionId ? { ...s, title, updatedAt: new Date() } : s))
      );
      return;
    }

    try {
      await supabase
        .from('chat_sessions')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      await loadSessions();
    } catch (err) {
      console.error('Error updating session title:', err);
    }
  }, [user, loadSessions]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    sessions,
    isLoading,
    createSession,
    deleteSession,
    updateSessionTitle,
    refresh: loadSessions,
  };
}

export default useChatSessions;
