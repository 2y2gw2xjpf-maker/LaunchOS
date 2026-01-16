/**
 * ValuationDisclaimer Component
 * Zeigt Disclaimer für Bewertungen mit Confidence Score
 */

import * as React from 'react';
import { AlertTriangle, Info, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { getConfidenceLevel, type CONFIDENCE_LEVELS } from '@/lib/services/confidence-service';

interface ValuationDisclaimerProps {
  confidenceScore: number;
  methods: string[];
  className?: string;
  compact?: boolean;
}

export function ValuationDisclaimer({
  confidenceScore,
  methods,
  className,
  compact = false,
}: ValuationDisclaimerProps) {
  const level = getConfidenceLevel(confidenceScore);

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3 bg-amber-50/80 border border-amber-200/60 rounded-xl text-sm',
          className
        )}
      >
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span className="text-amber-800">
          Orientierungswert ({confidenceScore}% Konfidenz) – kein Gutachten
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'mt-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/60 rounded-2xl',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="p-2 bg-amber-100 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-display font-semibold text-amber-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Orientierungswert, kein Gutachten
          </h4>

          <p className="text-amber-800 text-sm mb-4 leading-relaxed">
            Diese Bewertung dient als <strong>erste Orientierung</strong> und ersetzt keine
            professionelle Unternehmensbewertung. Die tatsächliche Bewertung kann erheblich
            abweichen basierend auf:
          </p>

          <ul className="text-amber-800 text-sm space-y-1.5 mb-4">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              Verhandlungsposition und Marktbedingungen
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              Detaillierte Due Diligence
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              Strategischer Wert für spezifische Investoren
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              Aktuelle Marktmultiples deiner Branche
            </li>
          </ul>

          {/* Confidence Score Bar */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-white/60 rounded-xl backdrop-blur-sm">
            <span className="text-sm font-medium text-amber-900">Konfidenz:</span>
            <div className="flex-1 h-2.5 bg-amber-200/60 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-500 rounded-full',
                  confidenceScore >= 70
                    ? 'bg-gradient-to-r from-green-400 to-green-500'
                    : confidenceScore >= 40
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                      : 'bg-gradient-to-r from-red-400 to-red-500'
                )}
                style={{ width: `${confidenceScore}%` }}
              />
            </div>
            <span
              className={cn(
                'text-sm font-bold px-2 py-0.5 rounded-lg',
                confidenceScore >= 70
                  ? 'bg-green-100 text-green-700'
                  : confidenceScore >= 40
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
              )}
            >
              {confidenceScore}%
            </span>
          </div>

          {/* Methods Used */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="text-xs font-medium text-amber-700">Methoden:</span>
            {methods.map((method) => (
              <span
                key={method}
                className="text-xs px-2 py-0.5 bg-amber-100/80 text-amber-700 rounded-lg"
              >
                {method}
              </span>
            ))}
          </div>

          <p className="text-amber-700 text-xs flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            Für verbindliche Bewertungen: Wirtschaftsprüfer oder M&A-Berater.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ValuationDisclaimer;
