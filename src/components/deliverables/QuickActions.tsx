/**
 * QuickActions Component
 * Schnelle Aktionen für Deliverable-Iterationen
 */

import * as React from 'react';
import { Loader2, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { QUICK_ACTIONS, type QuickAction } from '@/types';

interface QuickActionsProps {
  deliverableId: string;
  deliverableType: string;
  onAction: (action: QuickAction) => Promise<void>;
  onCustomAction?: (prompt: string) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export function QuickActions({
  deliverableId: _deliverableId,
  deliverableType,
  onAction,
  onCustomAction,
  isLoading = false,
  className,
}: QuickActionsProps) {
  const [customPrompt, setCustomPrompt] = React.useState('');
  const [activeAction, setActiveAction] = React.useState<string | null>(null);

  const handleAction = async (action: QuickAction) => {
    if (isLoading) return;
    setActiveAction(action.id);
    try {
      await onAction(action);
    } finally {
      setActiveAction(null);
    }
  };

  const handleCustom = async () => {
    if (!customPrompt.trim() || isLoading || !onCustomAction) return;
    setActiveAction('custom');
    try {
      await onCustomAction(customPrompt);
      setCustomPrompt('');
    } finally {
      setActiveAction(null);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <Wand2 className="w-4 h-4 text-purple-500" />
        <h4 className="font-semibold text-gray-900">Schnelle Aktionen</h4>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => handleAction(action)}
            disabled={isLoading}
            className={cn(
              'px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm',
              'hover:border-purple-300 hover:bg-purple-50 transition-all',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center gap-2',
              activeAction === action.id && 'border-purple-400 bg-purple-50'
            )}
          >
            {activeAction === action.id ? (
              <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
            ) : (
              <span>{action.icon}</span>
            )}
            <span className="text-gray-700">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Custom Prompt Input */}
      {onCustomAction && (
        <div className="flex gap-2">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Eigene Anderung beschreiben..."
            disabled={isLoading}
            className={cn(
              'flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm',
              'focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none',
              'disabled:opacity-50 transition-all'
            )}
            onKeyDown={(e) => e.key === 'Enter' && handleCustom()}
          />
          <Button
            onClick={handleCustom}
            disabled={isLoading || !customPrompt.trim()}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm"
          >
            {activeAction === 'custom' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Anwenden'
            )}
          </Button>
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-500">
        Klicke auf eine Aktion um dein {deliverableType} anzupassen.
      </p>
    </div>
  );
}

export default QuickActions;
