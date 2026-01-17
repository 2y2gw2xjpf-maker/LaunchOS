import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, AlertTriangle, Info, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ChecklistItemData {
  id: string;
  title: string;
  description?: string;
  isCritical?: boolean;
  tip?: string;
  isCompleted?: boolean;
}

interface ChecklistItemProps {
  item: ChecklistItemData;
  isCompleted: boolean;
  onToggle: () => void;
  note?: string;
  onNoteChange?: (note: string) => void;
}

export function ChecklistItem({ item, isCompleted, onToggle, note, onNoteChange }: ChecklistItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);

  return (
    <div
      className={cn(
        'bg-white rounded-xl border transition-all',
        isCompleted ? 'border-green-200 bg-green-50/50' : 'border-purple-100 hover:border-purple-200',
        item.isCritical && !isCompleted && 'border-amber-200 bg-amber-50/30'
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={onToggle}
            className={cn(
              'w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all mt-0.5',
              isCompleted
                ? 'bg-green-500 border-green-500 text-white'
                : item.isCritical
                  ? 'border-amber-400 hover:border-amber-500'
                  : 'border-purple-300 hover:border-purple-400'
            )}
          >
            {isCompleted && <Check className="w-4 h-4" />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4
                className={cn(
                  'font-medium transition-colors',
                  isCompleted ? 'text-green-700 line-through' : 'text-gray-900'
                )}
              >
                {item.title}
              </h4>
              {item.isCritical && !isCompleted && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  <AlertTriangle className="w-3 h-3" />
                  Kritisch
                </span>
              )}
            </div>

            {item.description && (
              <p className={cn('text-sm mt-1', isCompleted ? 'text-green-600' : 'text-gray-500')}>
                {item.description}
              </p>
            )}
          </div>

          {/* Expand button */}
          {(item.tip || onNoteChange) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronDown
                className={cn('w-5 h-5 text-gray-400 transition-transform', isExpanded && 'rotate-180')}
              />
            </button>
          )}
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-purple-100 space-y-3">
                {/* Tip */}
                {item.tip && (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">{item.tip}</p>
                  </div>
                )}

                {/* Note input */}
                {onNoteChange && (
                  <div>
                    {showNoteInput || note ? (
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <MessageSquare className="w-4 h-4" />
                          Notiz
                        </label>
                        <textarea
                          value={note || ''}
                          onChange={(e) => onNoteChange(e.target.value)}
                          placeholder="Füge eine Notiz hinzu..."
                          className="w-full p-3 border border-purple-200 rounded-lg text-sm resize-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none"
                          rows={2}
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowNoteInput(true)}
                        className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Notiz hinzufügen
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
