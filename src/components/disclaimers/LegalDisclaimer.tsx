/**
 * LegalDisclaimer Component
 * Zeigt rechtlichen Hinweis
 */

import * as React from 'react';
import { Scale } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface LegalDisclaimerProps {
  className?: string;
  compact?: boolean;
}

export function LegalDisclaimer({ className, compact = false }: LegalDisclaimerProps) {
  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs',
          className
        )}
      >
        <Scale className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-slate-600">Keine Rechtsberatung – Anwalt konsultieren.</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-4 bg-gradient-to-br from-slate-50 to-gray-50/50 border border-slate-200/60 rounded-xl',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="p-1.5 bg-slate-100 rounded-lg">
          <Scale className="w-4 h-4 text-slate-600" />
        </div>
        <div>
          <p className="text-slate-700 text-sm leading-relaxed">
            <strong className="font-semibold">Hinweis:</strong> Dies ist keine Rechtsberatung. Für
            verbindliche Auskünfte wende dich an einen Anwalt oder Steuerberater. LaunchOS übernimmt
            keine Haftung für rechtliche Entscheidungen.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LegalDisclaimer;
