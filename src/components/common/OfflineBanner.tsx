import * as React from 'react';
import { WifiOff, RefreshCw, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

// ═══════════════════════════════════════════════════════════════════════════
// Offline Banner Component
// Shows when user goes offline and when they come back online
// ═══════════════════════════════════════════════════════════════════════════

export function OfflineBanner() {
  const { isOnline, wasOffline } = useOnlineStatus();
  const [showBackOnline, setShowBackOnline] = React.useState(false);

  React.useEffect(() => {
    if (isOnline && wasOffline) {
      setShowBackOnline(true);
      const timer = setTimeout(() => setShowBackOnline(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  return (
    <AnimatePresence>
      {/* Offline Banner */}
      {!isOnline && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-yellow-900 px-4 py-3 z-50 shadow-lg"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <WifiOff className="h-5 w-5" />
              <div>
                <span className="font-medium">Du bist offline</span>
                <span className="text-yellow-800 ml-2 hidden sm:inline">
                  Einige Funktionen sind eingeschränkt
                </span>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Erneut verbinden
            </button>
          </div>
        </motion.div>
      )}

      {/* Back Online Banner */}
      {showBackOnline && isOnline && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-green-500 text-white px-4 py-3 z-50 shadow-lg"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Wieder online!</span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Seite aktualisieren
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
