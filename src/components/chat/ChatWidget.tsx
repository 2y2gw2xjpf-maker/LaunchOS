/**
 * ChatWidget Component
 * Floating Chat Button mit Slide-out Panel und echter Claude API Integration
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, Square, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useLocation } from 'react-router-dom';
import { useChatStream, type ChatMessage } from '@/hooks/useChatStream';
import { useAuth } from '@/components/auth/AuthProvider';

// Markdown-like rendering for assistant messages
function renderMessageContent(content: string, isUser: boolean) {
  if (!content) return <span className="text-gray-400">...</span>;

  const lines = content.split('\n');

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        // Bold text
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <strong key={i} className={isUser ? 'text-white' : 'text-gray-900'}>
              {line.slice(2, -2)}
            </strong>
          );
        }

        // Headings
        if (line.startsWith('## ')) {
          return (
            <h3 key={i} className={cn('font-semibold text-base mt-3', isUser ? 'text-white' : 'text-gray-900')}>
              {line.slice(3)}
            </h3>
          );
        }

        if (line.startsWith('### ')) {
          return (
            <h4 key={i} className={cn('font-medium text-sm mt-2', isUser ? 'text-white' : 'text-gray-800')}>
              {line.slice(4)}
            </h4>
          );
        }

        // Bullet points
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return (
            <div key={i} className="flex items-start gap-2 ml-1">
              <span className={isUser ? 'text-purple-200' : 'text-purple-500'}>•</span>
              <span>{renderInlineMarkdown(line.slice(2), isUser)}</span>
            </div>
          );
        }

        // Numbered lists
        const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
        if (numberedMatch) {
          return (
            <div key={i} className="flex items-start gap-2 ml-1">
              <span className={cn('font-medium min-w-[1.5rem]', isUser ? 'text-purple-200' : 'text-purple-600')}>
                {numberedMatch[1]}.
              </span>
              <span>{renderInlineMarkdown(numberedMatch[2], isUser)}</span>
            </div>
          );
        }

        // Info boxes (emoji indicators)
        if (line.startsWith('📊') || line.startsWith('⚖️') || line.startsWith('📈') || line.startsWith('🎯')) {
          return (
            <div key={i} className={cn(
              'p-2 rounded-lg text-xs mt-2',
              isUser ? 'bg-white/10' : 'bg-purple-50 text-purple-800'
            )}>
              {line}
            </div>
          );
        }

        // Regular paragraph
        if (line.trim()) {
          return <p key={i}>{renderInlineMarkdown(line, isUser)}</p>;
        }

        // Empty line
        return <br key={i} />;
      })}
    </div>
  );
}

// Render inline markdown (bold, italic, code)
function renderInlineMarkdown(text: string, isUser: boolean): React.ReactNode {
  // Simple bold detection
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    // Inline code
    if (part.includes('`')) {
      const codeParts = part.split(/(`[^`]+`)/g);
      return codeParts.map((codePart, j) => {
        if (codePart.startsWith('`') && codePart.endsWith('`')) {
          return (
            <code
              key={`${i}-${j}`}
              className={cn(
                'px-1 py-0.5 rounded text-xs font-mono',
                isUser ? 'bg-white/20' : 'bg-gray-100 text-purple-700'
              )}
            >
              {codePart.slice(1, -1)}
            </code>
          );
        }
        return codePart;
      });
    }
    return part;
  });
}

const SUGGESTIONS = [
  'Welche Rechtsform passt zu meinem Startup?',
  'Wie finde ich passende Investoren?',
  'Was ist mein Startup wert?',
  'Hilf mir ein Pitch Deck zu erstellen',
];

const CHAT_SESSION_KEY = 'launchos-chat-widget-session';

export function ChatWidget() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  // Persist session ID in localStorage so chat history survives page reloads
  const [sessionId] = React.useState(() => {
    const stored = localStorage.getItem(CHAT_SESSION_KEY);
    if (stored) return stored;
    const newId = crypto.randomUUID();
    localStorage.setItem(CHAT_SESSION_KEY, newId);
    return newId;
  });
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const location = useLocation();
  const { profile } = useAuth();

  const {
    messages,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
    clearMessages: clearMessagesHook,
  } = useChatStream({
    sessionId,
    userContext: {
      userName: profile?.full_name || undefined,
      companyName: profile?.company_name || undefined,
      industry: profile?.industry || undefined,
      stage: profile?.stage || undefined,
      fundingPath: profile?.funding_path || undefined,
    },
  });

  // Clear messages and start a new session
  const handleClearMessages = () => {
    clearMessagesHook();
    // Generate a new session ID for fresh start
    const newSessionId = crypto.randomUUID();
    localStorage.setItem(CHAT_SESSION_KEY, newSessionId);
    // Note: This won't update the current sessionId state, but next reload will use new session
  };

  // Don't show on landing page and auth pages
  const hiddenPaths = ['/', '/login', '/pricing', '/about', '/contact', '/auth'];
  const isHidden = hiddenPaths.some(path =>
    location.pathname === path || location.pathname.startsWith('/auth/')
  );

  // Auto-scroll to bottom on new messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const message = inputValue;
    setInputValue('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setInputValue('');
    await sendMessage(suggestion);
  };

  if (isHidden) return null;

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className={cn(
              'fixed bottom-6 right-6 z-50',
              'w-14 h-14 rounded-2xl',
              'bg-gradient-to-r from-purple-600 to-pink-600',
              'shadow-lg shadow-purple-500/30',
              'flex items-center justify-center',
              'hover:shadow-purple-500/50 transition-shadow'
            )}
          >
            <MessageSquare className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed bottom-6 right-6 z-50',
              'w-[420px] h-[620px] max-h-[85vh]',
              'bg-white rounded-3xl shadow-2xl',
              'border border-purple-100',
              'flex flex-col overflow-hidden'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-purple-600 to-pink-600">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">LaunchOS Chat</h3>
                  <p className="text-xs text-white/70">Dein KI-Startup-Assistent</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    onClick={handleClearMessages}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/70 hover:text-white"
                    title="Chat leeren"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="px-4 py-2 bg-red-50 border-b border-red-100 flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Verbindungsfehler - bitte erneut versuchen</span>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl mb-4">
                    <Sparkles className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Wie kann ich dir helfen?</h4>
                  <p className="text-sm text-gray-500 mb-6">
                    Frag mich alles über Gründung, Investoren, Bewertungen oder Pitch Decks.
                  </p>
                  <div className="space-y-2 w-full">
                    {SUGGESTIONS.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick(suggestion)}
                        disabled={isLoading}
                        className={cn(
                          'w-full flex items-center gap-2 p-3 text-left text-sm',
                          'bg-gray-50 rounded-xl border border-gray-100',
                          'hover:bg-purple-50 hover:border-purple-200 transition-all',
                          'disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                      >
                        <MessageSquare className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        'flex gap-3',
                        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      )}
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                            : 'bg-gradient-to-br from-purple-100 to-pink-100'
                        )}
                      >
                        {message.role === 'user' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                      <div
                        className={cn(
                          'max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed',
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-tr-sm'
                            : 'bg-gray-50 text-gray-800 rounded-tl-sm border border-gray-100'
                        )}
                      >
                        {renderMessageContent(message.content, message.role === 'user')}

                        {/* Streaming indicator */}
                        {message.role === 'assistant' &&
                          isStreaming &&
                          message === messages[messages.length - 1] && (
                            <span className="inline-block w-2 h-4 bg-purple-500 animate-pulse ml-1 rounded-sm" />
                          )}
                      </div>
                    </div>
                  ))}

                  {/* Loading indicator when waiting for first response */}
                  {isLoading && !isStreaming && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="p-3 bg-gray-50 rounded-2xl rounded-tl-sm border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Denke nach...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Schreibe eine Nachricht..."
                  disabled={isLoading && !isStreaming}
                  className={cn(
                    'flex-1 px-3 py-2 text-sm bg-transparent outline-none',
                    'placeholder:text-gray-400',
                    'disabled:opacity-50'
                  )}
                />

                {isStreaming ? (
                  <button
                    onClick={stopStreaming}
                    className={cn(
                      'p-2.5 rounded-xl transition-all',
                      'bg-red-500 hover:bg-red-600',
                      'shadow-lg shadow-red-500/30'
                    )}
                    title="Stoppen"
                  >
                    <Square className="w-4 h-4 text-white" />
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                    className={cn(
                      'p-2.5 rounded-xl transition-all',
                      'bg-gradient-to-r from-purple-600 to-pink-600',
                      'hover:shadow-lg hover:shadow-purple-500/30',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 text-white" />
                    )}
                  </button>
                )}
              </div>

              <p className="text-[10px] text-gray-400 text-center mt-2">
                Powered by Claude AI • LaunchOS
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ChatWidget;
