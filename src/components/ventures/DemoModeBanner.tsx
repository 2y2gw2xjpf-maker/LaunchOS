/**
 * DemoModeBanner Component
 * Banner das angezeigt wird wenn Demo-Modus aktiv ist
 */

import { Sparkles, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import type { DemoVenture } from '@/data/demoVentures';

interface DemoModeBannerProps {
  venture: DemoVenture;
  onExit: () => void;
  className?: string;
}

export function DemoModeBanner({ venture, onExit, className }: DemoModeBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'flex items-center justify-between gap-4 px-4 py-3 rounded-xl',
        'bg-amber-50 border border-amber-200',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-amber-900">
            Demo-Modus: <span className="font-semibold">{venture.name}</span>
          </p>
          <p className="text-xs text-amber-700">
            Änderungen werden nicht gespeichert
          </p>
        </div>
      </div>

      <button
        onClick={onExit}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
          'text-amber-700 hover:bg-amber-100 transition-colors'
        )}
      >
        Demo beenden
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export default DemoModeBanner;
