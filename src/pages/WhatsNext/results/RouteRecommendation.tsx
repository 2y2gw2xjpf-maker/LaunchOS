import * as React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Briefcase, GitMerge, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Card } from '@/components/ui';
import { RecommendationBadge, ComparisonBar, ConfidenceIndicator } from '@/components/results';
import type { RouteResult, RecommendedRoute } from '@/types';

interface RouteRecommendationProps {
  result: RouteResult;
}

const routeDetails: Record<RecommendedRoute, {
  title: string;
  description: string;
  icon: typeof Rocket;
  color: string;
  pros: string[];
  cons: string[];
}> = {
  bootstrap: {
    title: 'Bootstrap',
    description: 'Baue dein Unternehmen mit eigenem Geld und Einnahmen. Behalte volle Kontrolle.',
    icon: Rocket,
    color: '#8B5CF6', // brand-500
    pros: [
      'Volle Kontrolle uber Entscheidungen',
      'Keine Verwasserung deiner Anteile',
      'Profitabel von Anfang an denken',
      'Kein Druck von Investoren',
    ],
    cons: [
      'Langsameres Wachstum moglich',
      'Begrenztes Kapital fur Experimente',
      'Hohes personliches Risiko',
      'Schwieriger in winner-takes-all Markten',
    ],
  },
  investor: {
    title: 'Investor',
    description: 'Hole externes Kapital fur schnelleres Wachstum. Gib dafur Anteile und Kontrolle ab.',
    icon: Briefcase,
    color: '#EC4899', // accent-500
    pros: [
      'Schnelleres Wachstum moglich',
      'Zugang zu Netzwerk und Expertise',
      'Mehr Runway fur Experimente',
      'Signal-Effekt im Markt',
    ],
    cons: [
      'Verwasserung deiner Anteile',
      'Reporting-Pflichten',
      'Weniger Kontrolle uber Entscheidungen',
      'Erwartung von schnellem Exit',
    ],
  },
  hybrid: {
    title: 'Hybrid',
    description: 'Starte Bootstrap und raise strategisch wenn es Sinn macht. Best of both worlds.',
    icon: GitMerge,
    color: '#7c3aed', // brand-600
    pros: [
      'Flexibilitat behalten',
      'Bessere Bewertung bei Raise',
      'Kontrolle in der Anfangsphase',
      'Option auf beide Wege offen',
    ],
    cons: [
      'Erfordert disziplinierte Execution',
      'Timing des Raises kritisch',
      'Mogliche Opportunity Costs',
      'Komplexere Planung notig',
    ],
  },
};

export const RouteRecommendation = ({ result }: RouteRecommendationProps) => {
  const details = routeDetails[result.recommendation];
  const Icon = details.icon;

  return (
    <div className="space-y-8">
      {/* Main Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-sm text-charcoal/60 mb-4">Unsere Empfehlung fur dich</p>
        <div className="flex justify-center mb-6">
          <RecommendationBadge route={result.recommendation} score={result.scores[result.recommendation]} size="lg" />
        </div>
        <ConfidenceIndicator value={result.confidence} label="Confidence" />
      </motion.div>

      {/* Score Comparison */}
      <Card className="p-6">
        <h3 className="font-display font-semibold text-charcoal mb-6">Vergleich der Optionen</h3>
        <div className="space-y-4">
          <ComparisonBar
            leftValue={result.scores.bootstrap}
            rightValue={result.scores.investor}
            leftLabel="Bootstrap"
            rightLabel="Investor"
            leftColor="#8B5CF6"
            rightColor="#EC4899"
          />
          <div className="text-center">
            <span className="text-sm text-charcoal/50">
              Hybrid Score: {result.scores.hybrid}%
            </span>
          </div>
        </div>
      </Card>

      {/* Recommendation Details */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${details.color}20` }}
          >
            <Icon className="w-6 h-6" style={{ color: details.color }} />
          </div>
          <div>
            <h3 className="font-display font-semibold text-charcoal text-xl">{details.title}</h3>
            <p className="text-charcoal/60">{details.description}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-brand-600 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Vorteile
            </h4>
            <ul className="space-y-2">
              {details.pros.map((pro, i) => (
                <li key={i} className="text-sm text-charcoal/70 flex items-start gap-2">
                  <span className="text-brand-500 mt-1">+</span>
                  {pro}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-accent-600 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Nachteile
            </h4>
            <ul className="space-y-2">
              {details.cons.map((con, i) => (
                <li key={i} className="text-sm text-charcoal/70 flex items-start gap-2">
                  <span className="text-accent-500 mt-1">-</span>
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Key Reasons */}
      <Card className="p-6">
        <h3 className="font-display font-semibold text-charcoal mb-4">Wichtigste Einflussfaktoren</h3>
        <div className="space-y-3">
          {result.reasons.slice(0, 5).map((reason, i) => (
            <motion.div
              key={reason.factor}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl',
                reason.impact === 'positive' ? 'bg-brand-50' :
                reason.impact === 'negative' ? 'bg-accent-50' : 'bg-brand-50/50'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                reason.impact === 'positive' ? 'bg-brand-100 text-brand-600' :
                reason.impact === 'negative' ? 'bg-accent-100 text-accent-600' : 'bg-brand-100 text-brand-500'
              )}>
                {reason.impact === 'positive' ? <CheckCircle className="w-4 h-4" /> :
                 reason.impact === 'negative' ? <AlertTriangle className="w-4 h-4" /> :
                 <Info className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-charcoal">{reason.factor}</p>
                <p className="text-sm text-charcoal/60">{reason.explanation}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <Card className="p-6 border-accent-200 bg-accent-50">
          <h3 className="font-display font-semibold text-accent-700 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Zu beachten
          </h3>
          <ul className="space-y-2">
            {result.warnings.map((warning, i) => (
              <li key={i} className="text-sm text-charcoal/70 flex items-start gap-2">
                <span className="text-accent-600 mt-0.5">!</span>
                {warning}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Alternatives */}
      <Card className="p-6">
        <h3 className="font-display font-semibold text-charcoal mb-4">Alternative Uberlegungen</h3>
        <ul className="space-y-3">
          {result.alternativeConsiderations.map((alt, i) => (
            <li key={i} className="flex items-start gap-3 text-charcoal/70">
              <Info className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
              {alt}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
