/**
 * LaunchOS Chat Modal
 * Vollbildiges Chat-Modal für den KI-Assistenten
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { FullChat } from './FullChat';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  journeyContext?: {
    currentStep?: string;
    pendingTasks?: string[];
  };
  initialMessage?: string;
}

export function ChatModal({ isOpen, onClose, journeyContext, initialMessage: _initialMessage }: ChatModalProps) {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed z-50 overflow-hidden rounded-2xl shadow-2xl shadow-purple-500/20',
              isFullscreen
                ? 'inset-4'
                : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[80vh] max-h-[700px]'
            )}
          >
            {/* Header Controls */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 bg-white/90 hover:bg-white rounded-lg text-gray-600 hover:text-gray-900 shadow-sm transition-all"
                title={isFullscreen ? 'Verkleinern' : 'Vollbild'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white/90 hover:bg-white rounded-lg text-gray-600 hover:text-gray-900 shadow-sm transition-all"
                title="Schließen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Content */}
            <FullChat
              className="h-full"
              journeyContext={journeyContext}
              onClose={onClose}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ChatModal;
