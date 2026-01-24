/**
 * FinancialDisclaimer Component
 * Zeigt Hinweis für Finanzprognosen
 */

import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface FinancialDisclaimerProps {
  className?: string;
  compact?: boolean;
}

export function FinancialDisclaimer({ className, compact = false }: FinancialDisclaimerProps) {
  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs',
          className
        )}
      >
        <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
        <span className="text-blue-700">Prognosen – tatsächliche Entwicklung kann abweichen.</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200/60 rounded-xl',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="p-1.5 bg-blue-100 rounded-lg">
          <TrendingUp className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <p className="text-blue-800 text-sm leading-relaxed">
            <strong className="font-semibold">Hinweis:</strong> Prognosen basieren auf deinen
            Angaben und branchenüblichen Annahmen. Die tatsächliche Entwicklung kann erheblich
            abweichen. Dies ist keine Finanzberatung.
          </p>
        </div>
      </div>
    </div>
  );
}

export default FinancialDisclaimer;
