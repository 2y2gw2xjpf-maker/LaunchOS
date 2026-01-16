/**
 * LaunchOS Chat Hook with Claude API Streaming
 * Echte KI-Integration mit Streaming-Support
 */

import * as React from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';

// ==================== TYPES ====================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface UserContext {
  userName?: string;
  companyName?: string;
  industry?: string;
  stage?: string;
  fundingPath?: string;
}

export interface UseChatStreamOptions {
  sessionId?: string;
  userContext?: UserContext;
  onError?: (error: Error) => void;
}

export interface UseChatStreamReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  error: Error | null;
  sendMessage: (content: string) => Promise<void>;
  stopStreaming: () => void;
  clearMessages: () => void;
  loadSession: (sessionId: string) => Promise<void>;
}

// ==================== HOOK ====================

export function useChatStream(options: UseChatStreamOptions = {}): UseChatStreamReturn {
  const { user, profile } = useAuth();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Build user context from profile
  const getUserContext = React.useCallback((): UserContext => {
    return {
      userName: profile?.full_name || options.userContext?.userName,
      companyName: profile?.company_name || options.userContext?.companyName,
      industry: profile?.industry || options.userContext?.industry,
      stage: profile?.stage || options.userContext?.stage,
      fundingPath: profile?.funding_path || options.userContext?.fundingPath,
    };
  }, [profile, options.userContext]);

  // Load existing session
  const loadSession = React.useCallback(async (sessionId: string) => {
    if (!isSupabaseConfigured()) return;

    try {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.created_at),
        })));
      }
    } catch (err) {
      console.error('Error loading session:', err);
    }
  }, []);

  // Send message with streaming
  const sendMessage = React.useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);
    setIsStreaming(true);

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Save user message to DB if authenticated
    if (user && options.sessionId && isSupabaseConfigured()) {
      try {
        await supabase.from('chat_messages').insert({
          session_id: options.sessionId,
          user_id: user.id,
          role: 'user',
          content: content.trim(),
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Error saving user message:', err);
      }
    }

    // Create placeholder for assistant message
    const assistantMessageId = crypto.randomUUID();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Prepare messages for API
      const apiMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Get Supabase URL
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase nicht konfiguriert');
      }

      // Create abort controller
      abortControllerRef.current = new AbortController();

      // Call Edge Function with streaming
      const response = await fetch(
        `${supabaseUrl}/functions/v1/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            messages: apiMessages,
            userContext: getUserContext(),
            sessionId: options.sessionId,
            userId: user?.id,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Process streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.error) {
                throw new Error(parsed.error);
              }

              if (parsed.text) {
                fullContent += parsed.text;

                // Update assistant message with streamed content
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantMessageId
                      ? { ...m, content: fullContent }
                      : m
                  )
                );
              }
            } catch (parseError) {
              // Ignore parse errors for incomplete chunks
              if (data !== '' && !data.startsWith('{')) {
                console.debug('Skipping non-JSON chunk:', data);
              }
            }
          }
        }
      }

    } catch (err) {
      const error = err as Error;

      if (error.name === 'AbortError') {
        console.log('Request aborted by user');
      } else {
        console.error('Chat error:', error);
        setError(error);
        options.onError?.(error);

        // Update assistant message with error
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMessageId
              ? { ...m, content: `Es tut mir leid, es gab einen Fehler: ${error.message}\n\nBitte versuche es erneut.` }
              : m
          )
        );
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [messages, isLoading, user, options, getUserContext]);

  // Stop streaming
  const stopStreaming = React.useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setIsLoading(false);
    }
  }, []);

  // Clear messages
  const clearMessages = React.useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
    clearMessages,
    loadSession,
  };
}

export default useChatStream;
