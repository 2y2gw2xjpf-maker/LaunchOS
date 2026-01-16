/**
 * ChatMessage Component
 * Einzelne Chat-Nachricht (User oder Assistant)
 */

import * as React from 'react';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { ChatMessage as ChatMessageType } from '@/types';

interface ChatMessageProps {
  message: ChatMessageType;
  className?: string;
}

export function ChatMessage({ message, className }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className={cn('flex justify-center my-2', className)}>
        <div className="px-3 py-1.5 bg-gray-100 text-gray-500 text-xs rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex gap-3 py-4',
        isUser ? 'flex-row-reverse' : 'flex-row',
        className
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center',
          isUser
            ? 'bg-gradient-to-br from-purple-500 to-pink-500'
            : 'bg-gradient-to-br from-purple-100 to-pink-100'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-purple-600" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'flex-1 max-w-[80%] space-y-1',
          isUser ? 'text-right' : 'text-left'
        )}
      >
        {/* Role Label */}
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {isUser ? 'Du' : 'LaunchOS'}
        </span>

        {/* Message Bubble */}
        <div
          className={cn(
            'inline-block p-4 rounded-2xl text-sm leading-relaxed',
            isUser
              ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-tr-sm'
              : 'bg-white border border-gray-100 text-gray-800 shadow-soft rounded-tl-sm'
          )}
        >
          {/* Render markdown-like content */}
          <div className="prose prose-sm max-w-none">
            {message.content.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line.startsWith('**') && line.endsWith('**') ? (
                  <strong>{line.slice(2, -2)}</strong>
                ) : line.startsWith('- ') || line.startsWith('• ') ? (
                  <div className="flex items-start gap-2">
                    <span className={isUser ? 'text-purple-200' : 'text-purple-400'}>•</span>
                    <span>{line.slice(2)}</span>
                  </div>
                ) : (
                  <span>{line}</span>
                )}
                {i < message.content.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-gray-400">
          {new Date(message.createdAt).toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}

export default ChatMessage;
