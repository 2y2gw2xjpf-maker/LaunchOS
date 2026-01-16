/**
 * ChatContainer Component
 * Vollständiger Chat-Container mit Messages und Input
 */

import * as React from 'react';
import { MessageSquare, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useChat, type UseChatOptions } from '@/hooks/useChat';
import type { ChatMessage as ChatMessageType, QuickAction, DeliverableType } from '@/types';

interface ChatContainerProps {
  options?: UseChatOptions;
  className?: string;
  showHeader?: boolean;
  headerTitle?: string;
}

export function ChatContainer({
  options,
  className,
  showHeader = true,
  headerTitle = 'LaunchOS Chat',
}: ChatContainerProps) {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    sendQuickAction,
    clearChat,
    getSuggestedQuestions,
  } = useChat(options);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const suggestions = getSuggestedQuestions();

  return (
    <div className={cn('flex flex-col h-full bg-gradient-to-br from-gray-50 to-slate-50', className)}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
              <MessageSquare className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-gray-900">{headerTitle}</h3>
              <p className="text-xs text-gray-500">Dein KI-Assistent für Gründer</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={clearChat}
              title="Chat leeren"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <EmptyState suggestions={suggestions} onSuggestionClick={sendMessage} />
        ) : (
          <div className="space-y-2 max-w-3xl mx-auto">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500 py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">LaunchOS denkt nach...</span>
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                Fehler: {error.message}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="px-4 py-4 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            onSend={sendMessage}
            onQuickAction={sendQuickAction}
            isLoading={isLoading}
            placeholder="Stelle eine Frage oder starte ein Projekt..."
            suggestions={messages.length === 0 ? [] : suggestions.slice(0, 2)}
            showQuickActions={messages.length > 0}
          />
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({
  suggestions,
  onSuggestionClick,
}: {
  suggestions: string[];
  onSuggestionClick: (s: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl mb-4">
        <MessageSquare className="w-10 h-10 text-purple-600" />
      </div>
      <h3 className="font-display font-semibold text-xl text-gray-900 mb-2">
        Willkommen bei LaunchOS
      </h3>
      <p className="text-gray-600 text-sm max-w-md mb-6">
        Ich bin dein KI-Assistent für die Gründung in Deutschland. Frag mich alles über Rechtsformen,
        Finanzierung, Pitch Decks und mehr.
      </p>

      {/* Starter Suggestions */}
      <div className="flex flex-col gap-2 w-full max-w-md">
        {suggestions.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => onSuggestionClick(suggestion)}
            className={cn(
              'flex items-center gap-3 p-3 text-left',
              'bg-white border border-gray-200 rounded-xl',
              'hover:border-purple-300 hover:bg-purple-50/50 transition-all',
              'group'
            )}
          >
            <div className="p-1.5 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <MessageSquare className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-sm text-gray-700">{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ChatContainer;
