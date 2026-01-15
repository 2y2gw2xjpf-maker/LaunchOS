import * as React from 'react';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type MethodType = 'berkus' | 'scorecard' | 'vcMethod';
type Severity = 'success' | 'info' | 'warning' | 'error';

interface WarningConfig {
  show: boolean;
  message: string;
  severity: Severity;
  title?: string;
}

interface MethodApplicabilityWarningProps {
  method: MethodType;
  stage?: string;
  hasRevenue?: boolean;
  hasExitScenario?: boolean;
  className?: string;
}

const getWarningConfig = (
  method: MethodType,
  stage?: string,
  hasRevenue?: boolean,
  hasExitScenario?: boolean
): WarningConfig | null => {
  const warnings: Record<MethodType, WarningConfig> = {
    berkus: {
      show: !!hasRevenue,
      message:
        'Die Berkus-Methode ist primär für Pre-Revenue Startups gedacht. Da du bereits Umsatz generierst, sind andere Methoden möglicherweise aussagekräftiger. Erwäge die Scorecard- oder DCF-Methode.',
      severity: 'warning',
      title: 'Eingeschränkte Anwendbarkeit',
    },
    scorecard: {
      show: !stage || stage === 'idea',
      message:
        'Die Scorecard-Methode vergleicht dein Startup mit dem Durchschnitt. Für sehr frühe Stages (nur Idee) sind die Ergebnisse weniger zuverlässig, da konkrete Vergleichspunkte fehlen.',
      severity: 'info',
      title: 'Hinweis zur Genauigkeit',
    },
    vcMethod: {
      show: !hasExitScenario || !stage || ['idea', 'mvp'].includes(stage),
      message:
        'Die VC-Methode basiert auf Exit-Annahmen. Ohne klares Exit-Szenario (M&A, IPO) und nachweisbare Traktion sind die Ergebnisse spekulativ.',
      severity: 'warning',
      title: 'Exit-Szenario erforderlich',
    },
  };

  const warning = warnings[method];
  return warning.show ? warning : null;
};

// Best practice info for each method
const methodBestPractices: Record<MethodType, { title: string; tips: string[] }> = {
  berkus: {
    title: 'Best Practices für Berkus-Methode',
    tips: [
      'Maximalbewertung: 2,5 Mio. € (500K € pro Faktor)',
      'Geeignet für: Pre-Revenue, Pre-Seed bis Seed',
      'Basiert auf: Risikominimierung, nicht auf Wachstum',
      'Bewerte jeden Faktor ehrlich - überschätze nicht',
    ],
  },
  scorecard: {
    title: 'Best Practices für Scorecard-Methode',
    tips: [
      'Basis-Bewertung sollte regionsspezifisch sein',
      '100% = Durchschnitt der Vergleichsgruppe',
      'Über 100% bedeutet besser als Durchschnitt',
      'Gewichtungen sollten 100% ergeben',
    ],
  },
  vcMethod: {
    title: 'Best Practices für VC-Methode',
    tips: [
      'Return-Erwartung: Seed 20-30x, Series A 10-15x',
      'Exit-Horizont: Typisch 5-7 Jahre',
      'Berücksichtige zukünftige Verwässerung',
      'Formel: Pre-Money = (Exit / ROI) - Investment',
    ],
  },
};

export const MethodApplicabilityWarning = ({
  method,
  stage,
  hasRevenue,
  hasExitScenario,
  className,
}: MethodApplicabilityWarningProps) => {
  const warning = getWarningConfig(method, stage, hasRevenue, hasExitScenario);
  const bestPractices = methodBestPractices[method];

  const severityStyles: Record<Severity, string> = {
    success: 'bg-sage/10 border-sage/30 text-sage-800',
    info: 'bg-brand/10 border-brand/30 text-brand-800',
    warning: 'bg-gold/10 border-gold/30 text-gold-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  const severityIcons: Record<Severity, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5 text-sage" />,
    info: <Info className="w-5 h-5 text-brand" />,
    warning: <AlertTriangle className="w-5 h-5 text-gold" />,
    error: <AlertTriangle className="w-5 h-5 text-red-500" />,
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Applicability Warning */}
      {warning && (
        <div
          className={cn(
            'p-4 rounded-xl border flex items-start gap-3',
            severityStyles[warning.severity]
          )}
        >
          {severityIcons[warning.severity]}
          <div>
            {warning.title && (
              <h4 className="font-semibold mb-1">{warning.title}</h4>
            )}
            <p className="text-sm opacity-90">{warning.message}</p>
          </div>
        </div>
      )}

      {/* Best Practices Collapsible */}
      <details className="group">
        <summary className="flex items-center gap-2 cursor-pointer text-sm text-charcoal/60 hover:text-charcoal/80 transition-colors">
          <Info className="w-4 h-4" />
          <span>{bestPractices.title}</span>
          <span className="ml-auto text-xs opacity-60 group-open:hidden">
            Klicken zum Öffnen
          </span>
        </summary>
        <div className="mt-3 pl-6 space-y-2">
          {bestPractices.tips.map((tip, index) => (
            <p key={index} className="text-sm text-charcoal/70 flex items-start gap-2">
              <span className="text-brand font-bold">•</span>
              {tip}
            </p>
          ))}
        </div>
      </details>
    </div>
  );
};

export default MethodApplicabilityWarning;
