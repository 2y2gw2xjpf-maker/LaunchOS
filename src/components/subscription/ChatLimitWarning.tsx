import { AlertTriangle, Zap } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { Link } from 'react-router-dom';

interface ChatLimitWarningProps {
  compact?: boolean;
}

export function ChatLimitWarning({ compact = false }: ChatLimitWarningProps) {
  const { chatLimit, isFreeTier } = useSubscription();

  // Don't show if not free tier or no limit info
  if (!chatLimit || !isFreeTier() || chatLimit.remaining === null) {
    return null;
  }

  // Show warning when less than 10 messages remaining
  if (chatLimit.remaining > 10) {
    return null;
  }

  const isExhausted = chatLimit.remaining <= 0;

  if (compact) {
    return (
      <div className={`px-3 py-2 rounded-lg text-sm ${
        isExhausted
          ? 'bg-coral/10 text-coral'
          : 'bg-gold/10 text-gold'
      }`}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {isExhausted
            ? 'Chat-Limit erreicht'
            : `Noch ${chatLimit.remaining} Nachrichten`}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl mb-4 ${
      isExhausted
        ? 'bg-coral/10 border border-coral/20'
        : 'bg-gold/10 border border-gold/20'
    }`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
          isExhausted ? 'text-coral' : 'text-gold'
        }`} />
        <div className="flex-1">
          <p className={`font-medium ${
            isExhausted ? 'text-coral' : 'text-gold'
          }`}>
            {isExhausted
              ? 'Chat-Limit erreicht'
              : `Noch ${chatLimit.remaining} Nachrichten übrig`}
          </p>
          <p className={`text-sm mt-1 ${
            isExhausted ? 'text-coral/80' : 'text-gold/80'
          }`}>
            {isExhausted
              ? 'Upgrade auf Pro für unbegrenzte Nachrichten.'
              : 'Dein monatliches Limit ist fast aufgebraucht.'}
          </p>
          <Link
            to="/pricing?plan=pro"
            className="inline-flex items-center gap-2 mt-3 px-3 py-1.5
                     bg-gradient-to-r from-brand-600 to-brand-500
                     text-white text-sm font-medium rounded-lg
                     hover:shadow-md transition-shadow"
          >
            <Zap className="w-4 h-4" />
            Upgrade auf Pro
          </Link>
        </div>
      </div>
    </div>
  );
}

// Inline badge for chat input
export function ChatLimitBadge() {
  const { chatLimit, isFreeTier } = useSubscription();

  if (!chatLimit || !isFreeTier() || chatLimit.remaining === null) {
    return null;
  }

  const isLow = chatLimit.remaining <= 10;
  const isExhausted = chatLimit.remaining <= 0;

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${
      isExhausted
        ? 'bg-coral/10 text-coral'
        : isLow
        ? 'bg-gold/10 text-gold'
        : 'bg-charcoal/5 text-charcoal/50'
    }`}>
      {chatLimit.remaining} übrig
    </span>
  );
}

export default ChatLimitWarning;
