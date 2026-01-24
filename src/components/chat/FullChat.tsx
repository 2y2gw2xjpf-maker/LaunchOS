/**
 * LaunchOS Full Chat Component
 * Vollständiger KI-Assistent mit allen Features
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Square,
  Sparkles,
  Loader2,
  Paperclip,
  Mic,
  MicOff,
  X,
  FileText,
  Image as ImageIcon,
  Download,
  ExternalLink,
  Volume2,
  Bot,
  User,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui';
import { useChatStream, type ToolResult } from '@/hooks/useChatStream';
import { useFileUpload, type ProcessedFile } from '@/hooks/useFileUpload';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';

interface FullChatProps {
  className?: string;
  journeyContext?: {
    currentStep?: string;
    pendingTasks?: string[];
  };
  onClose?: () => void;
}

export function FullChat({ className, journeyContext, onClose }: FullChatProps) {
  const [input, setInput] = React.useState('');
  const [attachments, setAttachments] = React.useState<ProcessedFile[]>([]);
  const [sessionId] = React.useState(() => crypto.randomUUID());
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const {
    messages,
    isLoading,
    isStreaming,
    toolResults,
    sendMessage,
    stopStreaming,
    clearMessages: _clearMessages,
  } = useChatStream({
    sessionId,
    journeyContext,
    onToolResult: (result) => {
      console.log('Tool result:', result);
    },
  });

  const { processFile, isProcessing, error: uploadError } = useFileUpload();
  const {
    isRecording,
    isTranscribing,
    recordingDuration,
    startRecording,
    stopRecording,
    transcribe,
    error: recordingError,
  } = useVoiceRecording();

  // Auto-scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, toolResults]);

  // Focus input on mount
  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    await sendMessage(input, attachments);
    setInput('');
    setAttachments([]);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const processed = await processFile(file);
      if (processed) {
        setAttachments(prev => [...prev, processed]);
      }
    }

    e.target.value = '';
  };

  const handleVoiceToggle = async () => {
    if (isRecording) {
      const recording = await stopRecording();
      if (recording) {
        const text = await transcribe(recording.blob);
        if (text) {
          setInput(prev => prev + (prev ? ' ' : '') + text);
        }
      }
    } else {
      await startRecording();
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    sendMessage(suggestion, []);
  };

  return (
    <div className={cn('flex flex-col h-full bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-2xl overflow-hidden', className)}>
      {/* Header */}
      <div className="p-4 border-b border-purple-100 bg-white/80 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">LaunchOS Assistent</h2>
            <p className="text-xs text-gray-500">
              KI-powered Unterstützung für Gründer
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isStreaming={isStreaming && msg === messages[messages.length - 1] && msg.role === 'assistant'}
              />
            ))}

            {/* Tool Results */}
            <AnimatePresence>
              {toolResults.map((result, i) => (
                <ToolResultCard key={i} result={result} />
              ))}
            </AnimatePresence>
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {(uploadError || recordingError) && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-100">
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{uploadError || recordingError}</span>
          </div>
        </div>
      )}

      {/* Attachments Preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-2 border-t border-purple-100 bg-white/50 overflow-hidden"
          >
            <div className="flex flex-wrap gap-2">
              {attachments.map((att) => (
                <motion.div
                  key={att.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-purple-200 shadow-sm"
                >
                  {att.type === 'image' ? (
                    att.thumbnail ? (
                      <img src={att.thumbnail} alt={att.name} className="w-6 h-6 rounded object-cover" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-purple-500" />
                    )
                  ) : att.type === 'audio' ? (
                    <Volume2 className="w-4 h-4 text-purple-500" />
                  ) : (
                    <FileText className="w-4 h-4 text-purple-500" />
                  )}
                  <span className="text-sm text-gray-700 max-w-[150px] truncate">
                    {att.name}
                  </span>
                  <button
                    onClick={() => removeAttachment(att.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-purple-100 bg-white/80 backdrop-blur-sm">
        <div className="flex gap-2">
          {/* File Upload */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.docx,.doc,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isProcessing}
            className="p-3 text-gray-500 hover:text-purple-500 hover:bg-purple-50 rounded-xl transition-all disabled:opacity-50"
            title="Datei hochladen"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </button>

          {/* Voice Recording */}
          <button
            type="button"
            onClick={handleVoiceToggle}
            disabled={isLoading || isTranscribing}
            className={cn(
              'p-3 rounded-xl transition-all disabled:opacity-50',
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'text-gray-500 hover:text-purple-500 hover:bg-purple-50'
            )}
            title={isRecording ? `Aufnahme stoppen (${recordingDuration.toFixed(1)}s)` : 'Sprachaufnahme starten'}
          >
            {isTranscribing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isRecording ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isRecording
                ? `Aufnahme läuft... ${recordingDuration.toFixed(1)}s`
                : 'Schreibe eine Nachricht...'
            }
            disabled={isLoading || isRecording}
            className="flex-1 px-4 py-3 bg-white border border-purple-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none disabled:opacity-50 transition-all"
          />

          {/* Send/Stop Button */}
          {isStreaming ? (
            <button
              type="button"
              onClick={stopStreaming}
              className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
              title="Antwort stoppen"
            >
              <Square className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={(!input.trim() && attachments.length === 0) || isLoading}
              className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
              title="Nachricht senden"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// ==================== SUB-COMPONENTS ====================

function WelcomeScreen({ onSuggestionClick }: { onSuggestionClick: (s: string) => void }) {
  const suggestions = [
    { icon: '📊', text: 'Erstelle mir ein Pitch Deck für mein Startup' },
    { icon: '🔍', text: 'Welche VCs investieren in HealthTech in Deutschland?' },
    { icon: '📄', text: 'Hilf mir bei meinem Businessplan' },
    { icon: '💰', text: 'Was ist mein Startup ungefähr wert?' },
  ];

  return (
    <div className="text-center py-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25"
      >
        <Sparkles className="w-10 h-10 text-white" />
      </motion.div>

      <motion.h3
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-xl font-semibold text-gray-900 mb-2"
      >
        Wie kann ich dir helfen?
      </motion.h3>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-gray-500 mb-8 max-w-md mx-auto"
      >
        Ich kann Dokumente analysieren, Präsentationen erstellen, Investoren finden
        und dir bei allen Fragen rund um dein Startup helfen.
      </motion.p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
        {suggestions.map(({ icon, text }, index) => (
          <motion.button
            key={text}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            onClick={() => onSuggestionClick(text)}
            className="p-4 bg-white border border-purple-200 rounded-xl text-left hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/10 transition-all group"
          >
            <span className="text-2xl mb-2 block">{icon}</span>
            <span className="text-sm text-gray-700 group-hover:text-purple-700 transition-colors">{text}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isStreaming,
}: {
  message: { id: string; role: string; content: string; attachments?: ProcessedFile[] };
  isStreaming: boolean;
}) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          isUser
            ? 'bg-purple-100 text-purple-600'
            : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'max-w-[80%] px-4 py-3 rounded-2xl',
          isUser
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
            : 'bg-white border border-purple-100 text-gray-800 shadow-sm'
        )}
      >
        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {message.attachments.map((att) => (
              <div
                key={att.id}
                className={cn(
                  'px-2 py-1 rounded-lg text-xs flex items-center gap-1',
                  isUser ? 'bg-white/20' : 'bg-purple-50'
                )}
              >
                {att.type === 'image' ? (
                  <ImageIcon className="w-3 h-3" />
                ) : (
                  <FileText className="w-3 h-3" />
                )}
                <span className="truncate max-w-[100px]">{att.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Text Content */}
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-purple">
            <p className="whitespace-pre-wrap">{message.content || '...'}</p>
          </div>
        )}

        {/* Streaming Indicator */}
        {isStreaming && !isUser && (
          <span className="inline-block w-2 h-4 bg-purple-500 animate-pulse ml-1 rounded-sm" />
        )}
      </div>
    </motion.div>
  );
}

function ToolResultCard({ result }: { result: ToolResult }) {
  const { tool, result: data } = result;

  if (tool === 'generate_pitch_deck' && data.download_ready) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-start"
      >
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 max-w-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{data.file_name}</p>
              <p className="text-xs text-gray-500">Pitch Deck bereit zum Download</p>
            </div>
          </div>
          <Button
            variant="primary"
            className="w-full"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('download-file', {
                detail: { fileId: data.file_id, type: 'pitch_deck' }
              }));
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Herunterladen
          </Button>
        </div>
      </motion.div>
    );
  }

  if (tool === 'generate_business_plan' && data.download_ready) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-start"
      >
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 max-w-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{data.file_name}</p>
              <p className="text-xs text-gray-500">Businessplan bereit</p>
            </div>
          </div>
          <Button
            variant="primary"
            className="w-full"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('download-file', {
                detail: { fileId: data.file_id, type: 'business_plan' }
              }));
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Herunterladen
          </Button>
        </div>
      </motion.div>
    );
  }

  if (tool === 'search_investors' && data.investors) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-start"
      >
        <div className="bg-white border border-purple-200 rounded-xl p-4 max-w-md">
          <p className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center text-sm">🔍</span>
            Gefundene Investoren
          </p>
          <div className="space-y-2">
            {data.investors.slice(0, 5).map((inv, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">{inv.name}</p>
                  <p className="text-xs text-gray-500">{inv.focus} • {inv.ticket}</p>
                </div>
                {inv.website && (
                  <a
                    href={inv.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (tool === 'calculate_valuation' && data.valuation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-start"
      >
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 max-w-sm">
          <p className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center text-sm">💰</span>
            Bewertung ({data.valuation.method})
          </p>
          <div className="text-center py-3">
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              €{(data.valuation.min / 1000000).toFixed(1)}M - €{(data.valuation.max / 1000000).toFixed(1)}M
            </p>
          </div>
          {typeof data.disclaimer === 'string' && (
            <p className="text-xs text-gray-500 mt-2">{data.disclaimer}</p>
          )}
        </div>
      </motion.div>
    );
  }

  return null;
}

export default FullChat;
