/**
 * MethodologyExplainer Component
 * Zeigt transparente Erklärung der Bewertungsmethodik
 */

import * as React from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Info, Calculator, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { ValuationMethodResult } from '@/types';

interface ValuationMethodDisplay {
  id: string;
  name: string;
  description: string;
  sourceUrl?: string;
  inputs: { label: string; value: string }[];
  result: { low: number; mid: number; high: number };
}

interface MethodologyExplainerProps {
  methods: ValuationMethodDisplay[];
  finalValuation: { low: number; mid: number; high: number };
  improvements: string[];
  className?: string;
}

const formatEuro = (n: number): string => {
  if (n >= 1000000) {
    return `€${(n / 1000000).toFixed(1)}M`;
  }
  if (n >= 1000) {
    return `€${(n / 1000).toFixed(0)}k`;
  }
  return `€${n.toFixed(0)}`;
};

const METHOD_INFO: Record<string, { name: string; description: string; sourceUrl: string }> = {
  berkus: {
    name: 'Berkus Method',
    description: 'Pre-Revenue Bewertung basierend auf 5 Risikofaktoren (Idee, Prototyp, Team, Partnerschaften, Vertrieb)',
    sourceUrl: 'https://berkusmethod.com/',
  },
  scorecard: {
    name: 'Scorecard Method',
    description: 'Vergleich mit durchschnittlicher Pre-Seed Bewertung anhand gewichteter Faktoren',
    sourceUrl: 'https://www.angelcapitalassociation.org/',
  },
  vc_method: {
    name: 'VC Method',
    description: 'Rückwärtsrechnung vom erwarteten Exit-Wert mit Ziel-Rendite',
    sourceUrl: 'https://www.investopedia.com/terms/v/venturecapital.asp',
  },
  comparables: {
    name: 'Comparable Transactions',
    description: 'Basierend auf ähnlichen Deals in deiner Branche',
    sourceUrl: 'https://www.crunchbase.com/',
  },
  dcf: {
    name: 'DCF (Discounted Cash Flow)',
    description: 'Abgezinste zukünftige Cashflows auf den heutigen Wert',
    sourceUrl: 'https://www.investopedia.com/terms/d/dcf.asp',
  },
  cost_to_duplicate: {
    name: 'Cost to Duplicate',
    description: 'Kosten um das Unternehmen/Produkt nachzubauen',
    sourceUrl: 'https://www.startupvaluation.io/',
  },
};

export function MethodologyExplainer({
  methods,
  finalValuation,
  improvements,
  className,
}: MethodologyExplainerProps) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className={cn('border border-gray-200/60 rounded-2xl overflow-hidden bg-white', className)}>
      {/* Header Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 transition-colors"
      >
        <span className="font-display font-semibold text-gray-900 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-purple-600" />
          So wurde das berechnet
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{methods.length} Methoden</span>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-6 space-y-6 border-t border-gray-100">
          {/* Methoden */}
          <div>
            <h4 className="font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-500" />
              Verwendete Methoden
            </h4>
            <div className="space-y-4">
              {methods.map((method) => {
                const info = METHOD_INFO[method.id] || {
                  name: method.name,
                  description: method.description,
                  sourceUrl: '',
                };

                return (
                  <div
                    key={method.id}
                    className="p-4 bg-gradient-to-br from-gray-50 to-slate-50/50 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-semibold text-gray-900">{info.name}</h5>
                      {info.sourceUrl && (
                        <a
                          href={info.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 text-sm flex items-center gap-1 hover:underline"
                        >
                          Mehr
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{info.description}</p>

                    {/* Inputs */}
                    {method.inputs.length > 0 && (
                      <div className="text-xs text-gray-500 mb-3 p-2 bg-white/50 rounded-lg">
                        <strong className="text-gray-600">Deine Eingaben:</strong>
                        <ul className="mt-1 space-y-0.5">
                          {method.inputs.map((input, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <span className="text-purple-400">•</span>
                              {input.label}: <span className="font-medium">{input.value}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Result */}
                    <div className="flex items-center gap-4 pt-3 border-t border-gray-200/50">
                      <span className="text-sm text-gray-600">Ergebnis:</span>
                      <div className="flex items-baseline gap-3">
                        <span className="text-sm text-gray-400">{formatEuro(method.result.low)}</span>
                        <span className="text-lg font-bold text-purple-600">
                          {formatEuro(method.result.mid)}
                        </span>
                        <span className="text-sm text-gray-400">{formatEuro(method.result.high)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gewichtetes Ergebnis */}
          <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50/50 border border-purple-200/60 rounded-xl">
            <h5 className="font-display font-semibold text-purple-900 mb-3">
              Gewichtetes Gesamtergebnis
            </h5>
            <div className="flex items-baseline gap-4">
              <span className="text-gray-600">{formatEuro(finalValuation.low)}</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {formatEuro(finalValuation.mid)}
              </span>
              <span className="text-gray-600">{formatEuro(finalValuation.high)}</span>
            </div>
            <p className="text-xs text-purple-600/70 mt-2">
              Basierend auf gewichtetem Durchschnitt aller Methoden
            </p>
          </div>

          {/* Verbesserungen */}
          {improvements.length > 0 && (
            <div>
              <h5 className="font-display font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Was deine Bewertung erhöhen würde
              </h5>
              <ul className="space-y-2">
                {improvements.map((imp, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-700 p-2 bg-amber-50/50 rounded-lg"
                  >
                    <span className="text-green-500 font-bold mt-0.5">↑</span>
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MethodologyExplainer;
