import * as React from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// Online Status Hook
// Detects network connectivity changes
// ═══════════════════════════════════════════════════════════════════════════

export interface OnlineStatus {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnline: Date | null;
}

export function useOnlineStatus(): OnlineStatus {
  const [status, setStatus] = React.useState<OnlineStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    lastOnline: null,
  });

  const handleOnline = React.useCallback(() => {
    setStatus((prev) => ({
      isOnline: true,
      wasOffline: !prev.isOnline,
      lastOnline: new Date(),
    }));
  }, []);

  const handleOffline = React.useCallback(() => {
    setStatus((prev) => ({
      ...prev,
      isOnline: false,
    }));
  }, []);

  React.useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return status;
}
