/**
 * ChatInput Component
 * Eingabefeld für Chat mit Quick Actions
 */

import * as React from 'react';
import { Send, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { QUICK_ACTIONS, type QuickAction } from '@/types';
import { useSubscription } from '@/hooks/useSubscription';
import { Link } from 'react-router-dom';

interface ChatInputProps {
  onSend: (message: string) => void;
  onQuickAction?: (action: QuickAction) => void;
  isLoading?: boolean;
  placeholder?: string;
  suggestions?: string[];
  showQuickActions?: boolean;
  className?: string;
  showChatLimit?: boolean;
}

export function ChatInput({
  onSend,
  onQuickAction,
  isLoading = false,
  placeholder = 'Schreibe eine Nachricht...',
  suggestions = [],
  showQuickActions = true,
  className,
  showChatLimit = true,
}: ChatInputProps) {
  const [value, setValue] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const { chatLimit, isFreeTier, canSendChatMessage, incrementChatCount } = useSubscription();

  const isLimitReached = !canSendChatMessage();
  const isLow = chatLimit && chatLimit.remaining !== null && chatLimit.remaining <= 10;

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading && !isLimitReached) {
      // Increment chat count before sending
      if (isFreeTier()) {
        await incrementChatCount();
      }
      onSend(value.trim());
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Chat Limit Warning */}
      {showChatLimit && isFreeTier() && chatLimit && chatLimit.remaining !== null && (isLow || isLimitReached) && (
        <div className={cn(
          'flex items-center justify-between p-3 rounded-xl text-sm',
          isLimitReached
            ? 'bg-coral/10 border border-coral/20'
            : 'bg-gold/10 border border-gold/20'
        )}>
          <div className="flex items-center gap-2">
            <AlertTriangle className={cn('w-4 h-4', isLimitReached ? 'text-coral' : 'text-gold')} />
            <span className={isLimitReached ? 'text-coral' : 'text-gold'}>
              {isLimitReached
                ? 'Chat-Limit erreicht (0 Nachrichten übrig)'
                : `Noch ${chatLimit.remaining} Nachrichten diesen Monat`}
            </span>
          </div>
          <Link
            to="/pricing?plan=pro"
            className="px-3 py-1 bg-brand-600 text-white text-xs font-medium rounded-lg hover:bg-brand-700 transition-colors"
          >
            Upgrade
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      {showQuickActions && onQuickAction && !isLimitReached && (
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.slice(0, 4).map((action) => (
            <button
              key={action.id}
              onClick={() => onQuickAction(action)}
              disabled={isLoading}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium',
                'bg-purple-50 text-purple-700 rounded-full',
                'hover:bg-purple-100 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <span>{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => {
                setValue(suggestion);
                textareaRef.current?.focus();
              }}
              disabled={isLoading}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs',
                'bg-gray-50 text-gray-600 border border-gray-200 rounded-lg',
                'hover:bg-gray-100 hover:border-gray-300 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end gap-2 p-2 bg-white border border-gray-200 rounded-2xl shadow-soft focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className={cn(
              'flex-1 min-h-[44px] max-h-[200px] px-3 py-2.5',
              'text-sm text-gray-900 placeholder:text-gray-400',
              'bg-transparent border-none outline-none resize-none',
              'disabled:opacity-50'
            )}
          />
          <Button
            type="submit"
            variant="primary"
            size="icon"
            disabled={!value.trim() || isLoading || isLimitReached}
            className="flex-shrink-0 w-10 h-10 rounded-xl"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Character hint */}
        <div className="flex justify-between items-center mt-1 px-2">
          <span className="text-[10px] text-gray-400">
            Shift+Enter für neue Zeile
          </span>
          {value.length > 0 && (
            <span className={cn(
              'text-[10px]',
              value.length > 2000 ? 'text-red-500' : 'text-gray-400'
            )}>
              {value.length}/2000
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

export default ChatInput;
