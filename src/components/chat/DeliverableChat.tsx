/**
 * DeliverableChat Component
 * Chat UI mit Multi-Step Deliverable Flow
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, FileText, Users, DollarSign, Download, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { useDeliverableChat } from '@/hooks/useDeliverableChat';

const quickActions = [
  { icon: FileText, label: 'Pitch Deck', action: 'Erstelle ein Pitch Deck' },
  { icon: FileText, label: 'Businessplan', action: 'Schreibe einen Businessplan' },
  { icon: Users, label: 'Investor-Liste', action: 'Finde passende Investoren' },
  { icon: DollarSign, label: 'Finanzmodell', action: 'Erstelle ein Finanzmodell' },
];

export function DeliverableChat() {
  const [input, setInput] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const {
    messages,
    deliverable,
    isGenerating,
    processUserInput,
    generateDeliverable,
    reset,
  } = useDeliverableChat();

  // Auto-scroll to bottom on new messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    processUserInput(input);
    setInput('');
  };

  const handleQuickAction = (action: string) => {
    processUserInput(action);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-purple-100 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">LaunchOS Assistent</h2>
            <p className="text-xs text-gray-500">Ich helfe dir Dokumente für Investoren zu erstellen</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="text-gray-500 hover:text-gray-700"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Neu starten
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="popLayout">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Was möchtest du erstellen?
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Ich führe dich Schritt für Schritt durch den Prozess und generiere professionelle Dokumente für dein Startup.
              </p>

              {/* Quick Actions */}
              <div className="flex flex-wrap justify-center gap-3 max-w-lg mx-auto">
                {quickActions.map(({ icon: Icon, label, action }) => (
                  <motion.button
                    key={label}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickAction(action)}
                    className={cn(
                      'px-5 py-3 bg-white border border-purple-200 rounded-xl',
                      'hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/10',
                      'transition-all flex items-center gap-2'
                    )}
                  >
                    <Icon className="w-5 h-5 text-purple-500" />
                    <span className="font-medium text-gray-700">{label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4 max-w-2xl mx-auto">
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'flex',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] px-4 py-3 rounded-2xl',
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white border border-purple-100 text-gray-800 shadow-sm'
                    )}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.content.split('**').map((part, i) =>
                        i % 2 === 1 ? (
                          <strong key={i} className="font-semibold">
                            {part}
                          </strong>
                        ) : (
                          part
                        )
                      )}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Generating indicator */}
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="px-4 py-3 bg-white border border-purple-100 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 text-purple-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Generiere Dokument...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Generate Button */}
              {deliverable.isComplete && !isGenerating && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-center py-4"
                >
                  <Button
                    onClick={generateDeliverable}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Jetzt generieren
                  </Button>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Indicator */}
      {deliverable.type && !deliverable.isComplete && (
        <div className="px-4 py-2 border-t border-purple-100 bg-white/80">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Fortschritt</span>
              <span>
                Schritt {deliverable.step + 1} von{' '}
                {deliverable.type === 'pitch_deck'
                  ? 12
                  : deliverable.type === 'business_plan'
                    ? 9
                    : 6}
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{
                  width: `${((deliverable.step + 1) / (deliverable.type === 'pitch_deck' ? 12 : deliverable.type === 'business_plan' ? 9 : 6)) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-purple-100 bg-white/80 backdrop-blur-sm"
      >
        <div className="max-w-2xl mx-auto flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              deliverable.isComplete
                ? 'Was möchtest du als nächstes tun?'
                : 'Schreibe eine Nachricht...'
            }
            disabled={isGenerating}
            className={cn(
              'flex-1 px-4 py-3 bg-white border border-purple-200 rounded-xl',
              'focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none',
              'disabled:opacity-50 transition-all',
              'text-sm'
            )}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className={cn(
              'px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl',
              'hover:shadow-lg hover:shadow-purple-500/25 transition-all',
              'disabled:opacity-50'
            )}
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default DeliverableChat;
