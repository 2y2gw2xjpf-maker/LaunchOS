/**
 * LaunchOS Chat Sidebar
 * Zeigt Chat-History und ermöglicht Session-Management
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useChatSessions, type ChatSession } from '@/hooks/useChatSessions';

interface ChatSidebarProps {
  currentSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  className?: string;
}

export function ChatSidebar({
  currentSessionId,
  onSelectSession,
  onNewSession,
  className,
}: ChatSidebarProps) {
  const { sessions, isLoading, deleteSession, updateSessionTitle } = useChatSessions();
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState('');
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const handleStartEdit = (session: ChatSession) => {
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveEdit = async () => {
    if (editingId && editTitle.trim()) {
      await updateSessionTitle(editingId, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleDelete = async (sessionId: string) => {
    if (confirm('Diese Unterhaltung löschen?')) {
      await deleteSession(sessionId);
    }
  };

  if (isCollapsed) {
    return (
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 48 }}
        className={cn(
          'bg-white/80 backdrop-blur-sm border-r border-purple-100 flex flex-col items-center py-4 flex-shrink-0',
          className
        )}
      >
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
          title="Sidebar öffnen"
        >
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </button>
        <button
          onClick={onNewSession}
          className="mt-4 p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          title="Neue Unterhaltung"
        >
          <Plus className="w-5 h-5" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: 256 }}
      className={cn(
        'w-64 bg-white/80 backdrop-blur-sm border-r border-purple-100 flex flex-col flex-shrink-0',
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-purple-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900">Chats</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onNewSession}
            className="p-2 hover:bg-purple-50 rounded-lg text-purple-600 transition-colors"
            title="Neue Unterhaltung"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-2 hover:bg-purple-50 rounded-lg text-gray-500 transition-colors"
            title="Sidebar minimieren"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-purple-100 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-500" />
            </div>
            <p className="text-gray-500 text-sm">Noch keine Unterhaltungen</p>
            <button
              onClick={onNewSession}
              className="mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Starte eine neue Unterhaltung
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {sessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className={cn(
                  'group rounded-xl transition-all',
                  currentSessionId === session.id
                    ? 'bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200'
                    : 'hover:bg-purple-50 border border-transparent'
                )}
              >
                {editingId === session.id ? (
                  <div className="p-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-purple-300 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-200 outline-none"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                    />
                    <button
                      onClick={handleSaveEdit}
                      className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onSelectSession(session.id)}
                    className="w-full p-3 flex items-start gap-3 text-left"
                  >
                    <MessageSquare
                      className={cn(
                        'w-4 h-4 mt-0.5 flex-shrink-0 transition-colors',
                        currentSessionId === session.id
                          ? 'text-purple-600'
                          : 'text-purple-400'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm font-medium truncate transition-colors',
                          currentSessionId === session.id
                            ? 'text-purple-900'
                            : 'text-gray-900'
                        )}
                      >
                        {session.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {session.messageCount} Nachrichten • {formatDate(session.updatedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(session);
                        }}
                        className="p-1 hover:bg-purple-200 rounded transition-colors"
                        title="Umbenennen"
                      >
                        <Edit2 className="w-3 h-3 text-gray-500" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(session.id);
                        }}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                        title="Löschen"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-purple-100">
        <p className="text-xs text-gray-400 text-center">
          Unterhaltungen werden lokal gespeichert
        </p>
      </div>
    </motion.div>
  );
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Heute';
  if (days === 1) return 'Gestern';
  if (days < 7) return `vor ${days} Tagen`;
  return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}

export default ChatSidebar;
