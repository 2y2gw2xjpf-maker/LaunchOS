/**
 * LaunchOS Chat Hook
 * React Hook für Chat-Interaktionen mit dem KI-Assistenten
 */

import * as React from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { buildSystemPrompt, DISCLAIMERS } from '@/lib/prompts/system-prompt';
import { DELIVERABLE_CONFIGS, getDeliverableConfig } from '@/lib/services/deliverable-configs';
import { iterationService, buildIterationPrompt } from '@/lib/services/iteration-service';
import type {
  ChatMessage,
  ChatSession,
  DeliverableType,
  QuickAction,
  JourneyStep,
  UserJourneyProfile,
} from '@/types';

// ==================== TYPES ====================

export interface ChatContext {
  currentStep?: JourneyStep | null;
  userProfile?: UserJourneyProfile | null;
  activeDeliverableId?: string | null;
  activeDeliverableType?: DeliverableType | null;
}

export interface UseChatOptions {
  sessionId?: string;
  context?: ChatContext;
  autoSave?: boolean;
}

export interface UseChatReturn {
  // State
  messages: ChatMessage[];
  isLoading: boolean;
  error: Error | null;
  session: ChatSession | null;

  // Actions
  sendMessage: (content: string) => Promise<void>;
  sendQuickAction: (action: QuickAction) => Promise<void>;
  startDeliverable: (type: DeliverableType) => Promise<void>;
  clearChat: () => void;
  loadSession: (sessionId: string) => Promise<void>;

  // Helpers
  getSystemPrompt: () => string;
  getSuggestedQuestions: () => string[];
}

// ==================== HELPERS ====================

/**
 * Erkennt die Intention des Users aus der Nachricht
 */
function detectIntent(message: string): {
  type: 'question' | 'deliverable' | 'iteration' | 'action';
  deliverableType?: DeliverableType;
  actionType?: string;
} {
  const lowerMsg = message.toLowerCase();

  // Deliverable-Anfrage erkennen
  const deliverableKeywords: Record<DeliverableType, string[]> = {
    pitch_deck: ['pitch deck', 'pitchdeck', 'investor deck', 'präsentation'],
    business_plan: ['businessplan', 'business plan', 'geschäftsplan'],
    financial_model: ['finanzmodell', 'financial model', 'finanzplan', 'finanzierung'],
    investor_list: ['investoren', 'investor list', 'investorenliste', 'vcs'],
    valuation_report: ['bewertung', 'valuation', 'unternehmensbewertung'],
    legal_docs: ['impressum', 'datenschutz', 'agb', 'rechtlich'],
    data_room: ['data room', 'dataroom', 'due diligence'],
    outreach_emails: ['email', 'outreach', 'investor email', 'anschreiben'],
  };

  for (const [type, keywords] of Object.entries(deliverableKeywords)) {
    if (keywords.some((k) => lowerMsg.includes(k))) {
      return { type: 'deliverable', deliverableType: type as DeliverableType };
    }
  }

  // Iteration-Anfrage erkennen
  const iterationKeywords = ['kürzer', 'länger', 'übersetze', 'ändere', 'anpassen', 'verbessere'];
  if (iterationKeywords.some((k) => lowerMsg.includes(k))) {
    return { type: 'iteration' };
  }

  // Standard: Frage
  return { type: 'question' };
}

/**
 * Generiert Vorschläge basierend auf Kontext
 */
function generateSuggestions(context: ChatContext): string[] {
  const suggestions: string[] = [];

  if (context.currentStep) {
    suggestions.push(`Hilf mir bei: ${context.currentStep.title}`);
  }

  if (context.userProfile?.fundingPath === 'investor') {
    suggestions.push('Ich brauche ein Pitch Deck');
    suggestions.push('Finde passende Investoren für mich');
  }

  if (context.userProfile?.stage === 'idea') {
    suggestions.push('Wie wähle ich die richtige Rechtsform?');
    suggestions.push('Was kostet eine GmbH-Gründung?');
  }

  // Standard-Vorschläge
  if (suggestions.length === 0) {
    suggestions.push(
      'Was sind die ersten Schritte zur Gründung?',
      'Hilf mir einen Businessplan zu erstellen',
      'Wie finde ich Investoren?'
    );
  }

  return suggestions.slice(0, 4);
}

// ==================== HOOK ====================

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { user, profile } = useAuth();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [session, setSession] = React.useState<ChatSession | null>(null);

  const { context = {}, autoSave = true } = options;

  // System Prompt basierend auf User-Kontext
  const getSystemPrompt = React.useCallback((): string => {
    const userContext = {
      companyName: profile?.company_name ?? undefined,
      industry: profile?.industry ?? undefined,
      stage: profile?.stage ?? undefined,
      fundingPath: profile?.funding_path ?? undefined,
      companyType: profile?.company_type ?? undefined,
      monthlyRevenue: profile?.monthly_revenue ?? undefined,
      teamSize: profile?.team_size ?? undefined,
      // Include current step as pending task if available
      pendingTasks: context.currentStep
        ? [`${context.currentStep.title}: ${context.currentStep.description}`]
        : undefined,
    };

    return buildSystemPrompt(userContext);
  }, [profile, context.currentStep]);

  // Session laden
  const loadSession = React.useCallback(
    async (sessionId: string) => {
      if (!user) return;

      try {
        setIsLoading(true);

        // Session laden
        const { data: sessionData, error: sessionError } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('id', sessionId)
          .eq('user_id', user.id)
          .single();

        if (sessionError) throw sessionError;
        setSession(sessionData as ChatSession);

        // Messages laden
        const { data: messagesData, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;
        setMessages((messagesData || []) as ChatMessage[]);
      } catch (err) {
        setError(err as Error);
        console.error('Error loading chat session:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  // Initiale Session erstellen oder laden
  React.useEffect(() => {
    if (options.sessionId) {
      loadSession(options.sessionId);
    }
  }, [options.sessionId, loadSession]);

  // Message speichern
  const saveMessage = React.useCallback(
    async (message: Omit<ChatMessage, 'id' | 'createdAt'>) => {
      if (!user || !autoSave) return;

      try {
        // Session erstellen falls nicht vorhanden
        let currentSessionId = session?.id;

        if (!currentSessionId) {
          const { data: newSession, error: sessionError } = await supabase
            .from('chat_sessions')
            .insert({
              user_id: user.id,
              title: 'Neue Konversation',
              context: context,
            })
            .select()
            .single();

          if (sessionError) throw sessionError;
          setSession(newSession as ChatSession);
          currentSessionId = newSession.id;
        }

        // Message speichern
        const { error: messageError } = await supabase.from('chat_messages').insert({
          ...message,
          session_id: currentSessionId,
        });

        if (messageError) throw messageError;
      } catch (err) {
        console.error('Error saving message:', err);
      }
    },
    [user, session, context, autoSave]
  );

  // Nachricht senden
  const sendMessage = React.useCallback(
    async (content: string) => {
      if (!user || !content.trim()) return;

      try {
        setIsLoading(true);
        setError(null);

        // User Message hinzufügen
        const userMessage: ChatMessage = {
          id: `temp-${Date.now()}`,
          userId: user.id,
          sessionId: session?.id || '',
          role: 'user',
          content: content.trim(),
          metadata: {},
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        await saveMessage({
          userId: user.id,
          sessionId: session?.id || '',
          role: 'user',
          content: content.trim(),
          metadata: {},
        });

        // Intent erkennen
        const intent = detectIntent(content);

        // AI Response generieren (Placeholder - hier würde die echte AI-Integration stehen)
        let responseContent = '';

        if (intent.type === 'deliverable' && intent.deliverableType) {
          const config = getDeliverableConfig(intent.deliverableType);
          responseContent = `Ich helfe dir gerne bei deinem ${config.title}!\n\n${config.gatherPrompt}`;
        } else if (intent.type === 'iteration' && context.activeDeliverableId) {
          responseContent =
            'Welche Änderung möchtest du vornehmen? Du kannst auch eine der Quick Actions nutzen.';
        } else {
          // Standard-Antwort (in Produktion: AI-Call)
          responseContent = `Ich verstehe deine Frage zu "${content}".

Hier sind einige hilfreiche Informationen für dich als Gründer in Deutschland:

${context.currentStep ? `\n**Aktueller Fokus:** ${context.currentStep.title}\n` : ''}

Möchtest du mehr Details oder soll ich dir bei einem konkreten Deliverable helfen?

${DISCLAIMERS.legal}`;
        }

        // Assistant Message hinzufügen
        const assistantMessage: ChatMessage = {
          id: `temp-${Date.now() + 1}`,
          userId: user.id,
          sessionId: session?.id || '',
          role: 'assistant',
          content: responseContent,
          metadata: { intent },
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        await saveMessage({
          userId: user.id,
          sessionId: session?.id || '',
          role: 'assistant',
          content: responseContent,
          metadata: { intent },
        });
      } catch (err) {
        setError(err as Error);
        console.error('Error sending message:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [user, session, context, saveMessage]
  );

  // Quick Action senden
  const sendQuickAction = React.useCallback(
    async (action: QuickAction) => {
      if (!context.activeDeliverableId) {
        await sendMessage(action.prompt);
        return;
      }

      // Iteration auf aktives Deliverable
      const request = iterationService.prepareIteration(context.activeDeliverableId, action);

      if (request) {
        const iterationPrompt = buildIterationPrompt(request);
        await sendMessage(`[${action.label}] ${iterationPrompt}`);
      } else {
        await sendMessage(action.prompt);
      }
    },
    [context.activeDeliverableId, sendMessage]
  );

  // Deliverable starten
  const startDeliverable = React.useCallback(
    async (type: DeliverableType) => {
      const config = DELIVERABLE_CONFIGS[type];
      if (!config) return;

      await sendMessage(`Ich möchte ein ${config.title} erstellen.`);
    },
    [sendMessage]
  );

  // Chat leeren
  const clearChat = React.useCallback(() => {
    setMessages([]);
    setSession(null);
    setError(null);
  }, []);

  // Vorgeschlagene Fragen
  const getSuggestedQuestions = React.useCallback((): string[] => {
    return generateSuggestions(context);
  }, [context]);

  return {
    messages,
    isLoading,
    error,
    session,
    sendMessage,
    sendQuickAction,
    startDeliverable,
    clearChat,
    loadSession,
    getSystemPrompt,
    getSuggestedQuestions,
  };
}

export default useChat;
