/**
 * LaunchOS Full Chat with Sidebar
 * Vollständiger Chat-Bereich mit Session-History
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { FullChat } from './FullChat';
import { ChatSidebar } from './ChatSidebar';
import { useChatSessions } from '@/hooks/useChatSessions';

interface FullChatWithSidebarProps {
  className?: string;
  journeyContext?: {
    currentStep?: string;
    pendingTasks?: string[];
  };
  showSidebar?: boolean;
  onClose?: () => void;
}

export function FullChatWithSidebar({
  className,
  journeyContext,
  showSidebar = true,
  onClose,
}: FullChatWithSidebarProps) {
  const [currentSessionId, setCurrentSessionId] = React.useState<string | undefined>();
  const { createSession } = useChatSessions();

  // Create initial session on mount
  React.useEffect(() => {
    if (!currentSessionId) {
      createSession().then((id) => {
        if (id) setCurrentSessionId(id);
      });
    }
  }, [currentSessionId, createSession]);

  const handleNewSession = async () => {
    const id = await createSession();
    if (id) {
      setCurrentSessionId(id);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  if (!showSidebar) {
    return (
      <FullChat
        className={className}
        journeyContext={journeyContext}
        onClose={onClose}
      />
    );
  }

  return (
    <div className={cn('flex h-full', className)}>
      {/* Sidebar */}
      <ChatSidebar
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
      />

      {/* Chat */}
      <motion.div
        key={currentSessionId}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 min-w-0"
      >
        <FullChat
          journeyContext={journeyContext}
          onClose={onClose}
        />
      </motion.div>
    </div>
  );
}

export default FullChatWithSidebar;
