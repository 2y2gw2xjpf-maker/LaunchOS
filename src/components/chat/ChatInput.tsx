/**
 * ChatInput Component
 * Eingabefeld für Chat mit Quick Actions
 */

import * as React from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { QUICK_ACTIONS, type QuickAction } from '@/types';

interface ChatInputProps {
  onSend: (message: string) => void;
  onQuickAction?: (action: QuickAction) => void;
  isLoading?: boolean;
  placeholder?: string;
  suggestions?: string[];
  showQuickActions?: boolean;
  className?: string;
}

export function ChatInput({
  onSend,
  onQuickAction,
  isLoading = false,
  placeholder = 'Schreibe eine Nachricht...',
  suggestions = [],
  showQuickActions = true,
  className,
}: ChatInputProps) {
  const [value, setValue] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
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
      {/* Quick Actions */}
      {showQuickActions && onQuickAction && (
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
            disabled={!value.trim() || isLoading}
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
