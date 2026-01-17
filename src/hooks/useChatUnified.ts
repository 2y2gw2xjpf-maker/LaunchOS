/**
 * LaunchOS Unified Chat Hook
 * Combines streaming, session management, and persistence
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { useOptionalVentureContext } from '@/contexts/VentureContext';

// ==================== TYPES ====================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  attachments?: Attachment[];
  createdAt: Date;
  isStreaming?: boolean;
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResult {
  tool: string;
  result: {
    success: boolean;
    message?: string;
    file_id?: string;
    file_name?: string;
    download_ready?: boolean;
    investors?: Array<{
      name: string;
      type: string;
      focus: string;
      ticket: string;
      website: string;
    }>;
    valuation?: {
      min: number;
      max: number;
      method: string;
    };
    [key: string]: unknown;
  };
}

export interface Attachment {
  name: string;
  type: string;
  size?: number;
  url?: string;
  base64?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  ventureId?: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount?: number;
}

interface UseChatUnifiedOptions {
  sessionId?: string;
  systemPrompt?: string;
  onError?: (error: string) => void;
  onToolResult?: (result: ToolResult) => void;
}

interface UseChatUnifiedReturn {
  // Session
  session: ChatSession | null;
  sessions: ChatSession[];

  // Messages
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  toolResults: ToolResult[];

  // Actions
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
  stopStreaming: () => void;

  // Session Management
  createSession: (title?: string) => Promise<string | null>;
  loadSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<boolean>;
  loadSessions: () => Promise<void>;

  // Utilities
  clearMessages: () => void;
  updateSessionTitle: (sessionId: string, title: string) => Promise<boolean>;
}

// ==================== HOOK ====================

export function useChatUnified(options: UseChatUnifiedOptions = {}): UseChatUnifiedReturn {
  const { user, profile } = useAuth();
  const ventureContext = useOptionalVentureContext();
  const activeVenture = ventureContext?.activeVenture;

  const [session, setSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toolResults, setToolResults] = useState<ToolResult[]>([]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const sessionIdRef = useRef<string | null>(options.sessionId || null);

  // ═══════════════════════════════════════════════════════════
  // SESSION MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  const createSession = useCallback(async (title?: string): Promise<string | null> => {
    if (!user || !isSupabaseConfigured()) {
      // Fallback: Generate local session ID
      const localId = `local-${Date.now()}`;
      sessionIdRef.current = localId;
      setSession({
        id: localId,
        title: title || 'Neue Unterhaltung',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      localStorage.setItem('launchos_chat_session_id', localId);
      return localId;
    }

    try {
      const { data, error: createError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          venture_id: activeVenture?.id,
          title: title || 'Neue Unterhaltung',
        })
        .select()
        .single();

      if (createError) throw createError;

      const newSession: ChatSession = {
        id: data.id,
        title: data.title,
        ventureId: data.venture_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setSession(newSession);
      sessionIdRef.current = data.id;
      localStorage.setItem('launchos_chat_session_id', data.id);

      return data.id;
    } catch (err) {
      console.error('Error creating session:', err);
      setError('Fehler beim Erstellen der Session');
      options.onError?.('Fehler beim Erstellen der Session');
      return null;
    }
  }, [user, activeVenture, options]);

  const loadSession = useCallback(async (sessionId: string): Promise<void> => {
    if (!user || !isSupabaseConfigured()) {
      // Local session - just set the ID
      sessionIdRef.current = sessionId;
      setSession({
        id: sessionId,
        title: 'Lokale Session',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Load session
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (sessionError) throw sessionError;

      setSession({
        id: sessionData.id,
        title: sessionData.title,
        ventureId: sessionData.venture_id,
        createdAt: new Date(sessionData.created_at),
        updatedAt: new Date(sessionData.updated_at),
      });
      sessionIdRef.current = sessionId;

      // Load messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      setMessages((messagesData || []).map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        toolCalls: m.tool_calls,
        toolResults: m.tool_results,
        attachments: m.attachments,
        createdAt: new Date(m.created_at),
      })));

      // Extract tool results
      const allToolResults: ToolResult[] = [];
      messagesData?.forEach(m => {
        if (m.tool_results) {
          allToolResults.push(...m.tool_results);
        }
      });
      setToolResults(allToolResults);

      localStorage.setItem('launchos_chat_session_id', sessionId);
    } catch (err) {
      console.error('Error loading session:', err);
      setError('Fehler beim Laden der Session');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const loadSessions = useCallback(async (): Promise<void> => {
    if (!user || !isSupabaseConfigured()) return;

    try {
      let query = supabase
        .from('chat_sessions')
        .select('*, chat_messages(count)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(50);

      // Filter by venture if active
      if (activeVenture) {
        query = query.eq('venture_id', activeVenture.id);
      }

      const { data, error: loadError } = await query;

      if (loadError) throw loadError;

      setSessions((data || []).map(s => ({
        id: s.id,
        title: s.title,
        ventureId: s.venture_id,
        createdAt: new Date(s.created_at),
        updatedAt: new Date(s.updated_at),
        messageCount: s.chat_messages?.[0]?.count || 0,
      })));
    } catch (err) {
      console.error('Error loading sessions:', err);
    }
  }, [user, activeVenture]);

  const deleteSession = useCallback(async (sessionId: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      if (sessionIdRef.current === sessionId) {
        setSession(null);
        setMessages([]);
        sessionIdRef.current = null;
        localStorage.removeItem('launchos_chat_session_id');
      }
      return true;
    }

    try {
      const { error: deleteError } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (deleteError) throw deleteError;

      if (sessionIdRef.current === sessionId) {
        setSession(null);
        setMessages([]);
        sessionIdRef.current = null;
        localStorage.removeItem('launchos_chat_session_id');
      }

      await loadSessions();
      return true;
    } catch (err) {
      console.error('Error deleting session:', err);
      return false;
    }
  }, [loadSessions]);

  const updateSessionTitle = useCallback(async (sessionId: string, title: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      if (session?.id === sessionId) {
        setSession(prev => prev ? { ...prev, title } : null);
      }
      return true;
    }

    try {
      const { error: updateError } = await supabase
        .from('chat_sessions')
        .update({ title })
        .eq('id', sessionId);

      if (updateError) throw updateError;

      if (session?.id === sessionId) {
        setSession(prev => prev ? { ...prev, title } : null);
      }

      await loadSessions();
      return true;
    } catch (err) {
      console.error('Error updating session title:', err);
      return false;
    }
  }, [session, loadSessions]);

  // ═══════════════════════════════════════════════════════════
  // MESSAGE HANDLING
  // ═══════════════════════════════════════════════════════════

  const saveMessage = useCallback(async (
    sessionId: string,
    message: Omit<ChatMessage, 'id' | 'createdAt'>
  ): Promise<string | null> => {
    if (!isSupabaseConfigured() || !user) return null;

    try {
      const { data, error: saveError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          role: message.role,
          content: message.content,
          tool_calls: message.toolCalls,
          tool_results: message.toolResults,
          attachments: message.attachments,
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // Update session updated_at
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      return data.id;
    } catch (err) {
      console.error('Error saving message:', err);
      return null;
    }
  }, [user]);

  const sendMessage = useCallback(async (content: string, attachments?: File[]): Promise<void> => {
    if (!content.trim()) return;

    setError(null);

    // Create session if not exists
    let currentSessionId = sessionIdRef.current;
    if (!currentSessionId) {
      currentSessionId = await createSession();
      if (!currentSessionId) {
        setError('Fehler beim Erstellen der Session');
        return;
      }
    }

    // Process attachments
    const processedAttachments: Attachment[] = [];
    if (attachments?.length) {
      for (const file of attachments) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        processedAttachments.push({
          name: file.name,
          type: file.type,
          size: file.size,
          base64,
        });
      }
    }

    // User message
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      attachments: processedAttachments.length > 0 ? processedAttachments : undefined,
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Save user message to DB
    const savedUserMessageId = await saveMessage(currentSessionId, userMessage);
    if (savedUserMessageId) {
      setMessages(prev =>
        prev.map(m => m.id === userMessage.id ? { ...m, id: savedUserMessageId } : m)
      );
    }

    // Assistant message placeholder
    const assistantMessage: ChatMessage = {
      id: `temp-assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      createdAt: new Date(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsStreaming(true);

    // Abort controller for streaming
    abortControllerRef.current = new AbortController();

    try {
      // Build venture context
      const ventureContext = activeVenture ? `
Du hilfst dem Gründer von "${activeVenture.name}".
Branche: ${activeVenture.industry || 'Nicht angegeben'}
Stage: ${activeVenture.stage || 'Nicht angegeben'}
Funding-Strategie: ${activeVenture.fundingPath || 'Nicht angegeben'}
` : '';

      // Build user context
      const userContextStr = profile ? `
User: ${profile.full_name || 'Gründer'}
Unternehmen: ${profile.company_name || 'Nicht angegeben'}
` : '';

      const systemPrompt = options.systemPrompt || `Du bist ein erfahrener Startup-Berater und Co-Pilot für Gründer.
${ventureContext}
${userContextStr}
Antworte auf Deutsch, sei freundlich aber professionell.
Bei einfachen Fragen antworte direkt ohne Tools.
Nutze Tools nur wenn nötig (z.B. für Investoren-Suche, Dokument-Generierung).`;

      // Prepare messages for API
      const apiMessages = messages
        .filter(m => !m.isStreaming)
        .map(m => ({
          role: m.role,
          content: m.content,
        }));

      apiMessages.push({ role: 'user', content });

      // Get auth session for JWT
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const authHeader = authSession?.access_token
        ? `Bearer ${authSession.access_token}`
        : `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
          body: JSON.stringify({
            messages: apiMessages,
            systemPrompt,
            userContext: {
              userName: profile?.full_name,
              companyName: profile?.company_name,
              industry: profile?.industry || activeVenture?.industry,
              stage: profile?.stage || activeVenture?.stage,
            },
            sessionId: currentSessionId,
            attachments: processedAttachments,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      // Process streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      const msgToolCalls: ToolCall[] = [];
      const msgToolResults: ToolResult[] = [];

      if (reader) {
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim() || !line.startsWith('data: ')) continue;

            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === 'content' || parsed.content) {
                fullContent += parsed.content || '';
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantMessage.id
                      ? { ...m, content: fullContent }
                      : m
                  )
                );
              } else if (parsed.type === 'tool_call' || parsed.toolCall) {
                const toolCall = parsed.toolCall || parsed;
                msgToolCalls.push(toolCall);
              } else if (parsed.type === 'tool_result' || parsed.toolResult) {
                const toolResult = parsed.toolResult || parsed;
                msgToolResults.push(toolResult);
                setToolResults(prev => [...prev, toolResult]);
                options.onToolResult?.(toolResult);
              } else if (parsed.text) {
                // Legacy format support
                fullContent += parsed.text;
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantMessage.id
                      ? { ...m, content: fullContent }
                      : m
                  )
                );
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      // Final message update
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMessage.id
            ? {
                ...m,
                content: fullContent || 'Entschuldigung, ich konnte keine Antwort generieren.',
                toolCalls: msgToolCalls.length > 0 ? msgToolCalls : undefined,
                toolResults: msgToolResults.length > 0 ? msgToolResults : undefined,
                isStreaming: false,
              }
            : m
        )
      );

      // Save assistant message to DB (including tool results!)
      const savedAssistantMessageId = await saveMessage(currentSessionId, {
        role: 'assistant',
        content: fullContent,
        toolCalls: msgToolCalls.length > 0 ? msgToolCalls : undefined,
        toolResults: msgToolResults.length > 0 ? msgToolResults : undefined,
      });

      if (savedAssistantMessageId) {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMessage.id
              ? { ...m, id: savedAssistantMessageId }
              : m
          )
        );
      }

      // Auto-generate title for new sessions
      if (messages.length === 0 && fullContent) {
        const autoTitle = content.slice(0, 50) + (content.length > 50 ? '...' : '');
        await updateSessionTitle(currentSessionId, autoTitle);
      }

    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === 'AbortError') {
        // Streaming was stopped
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMessage.id
              ? { ...m, isStreaming: false }
              : m
          )
        );
      } else {
        console.error('Error sending message:', error);
        setError(error.message || 'Fehler beim Senden der Nachricht');
        options.onError?.(error.message || 'Fehler beim Senden der Nachricht');
        // Remove failed assistant message
        setMessages(prev => prev.filter(m => m.id !== assistantMessage.id));
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [user, profile, messages, activeVenture, options, createSession, saveMessage, updateSessionTitle]);

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setToolResults([]);
    setSession(null);
    sessionIdRef.current = null;
    localStorage.removeItem('launchos_chat_session_id');
  }, []);

  // ═══════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════

  useEffect(() => {
    if (user) {
      loadSessions();

      // Try to load last session
      const savedSessionId = options.sessionId || localStorage.getItem('launchos_chat_session_id');
      if (savedSessionId && !savedSessionId.startsWith('local-')) {
        loadSession(savedSessionId);
      }
    }
  }, [user, loadSessions, loadSession, options.sessionId]);

  // Venture change: reload sessions
  useEffect(() => {
    if (user && activeVenture) {
      loadSessions();
    }
  }, [activeVenture, user, loadSessions]);

  return {
    session,
    sessions,
    messages,
    isLoading,
    isStreaming,
    error,
    toolResults,
    sendMessage,
    stopStreaming,
    createSession,
    loadSession,
    deleteSession,
    loadSessions,
    clearMessages,
    updateSessionTitle,
  };
}

export default useChatUnified;
