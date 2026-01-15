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
    color: '#4A7C59',
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
    color: '#F5A623',
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
    color: '#0A1628',
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
        <h3 className="font-display font-semibold text-navy mb-6">Vergleich der Optionen</h3>
        <div className="space-y-4">
          <ComparisonBar
            leftValue={result.scores.bootstrap}
            rightValue={result.scores.investor}
            leftLabel="Bootstrap"
            rightLabel="Investor"
            leftColor="#4A7C59"
            rightColor="#F5A623"
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
            <h3 className="font-display font-semibold text-navy text-xl">{details.title}</h3>
            <p className="text-charcoal/60">{details.description}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-sage mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Vorteile
            </h4>
            <ul className="space-y-2">
              {details.pros.map((pro, i) => (
                <li key={i} className="text-sm text-charcoal/70 flex items-start gap-2">
                  <span className="text-sage mt-1">+</span>
                  {pro}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gold-700 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Nachteile
            </h4>
            <ul className="space-y-2">
              {details.cons.map((con, i) => (
                <li key={i} className="text-sm text-charcoal/70 flex items-start gap-2">
                  <span className="text-gold-700 mt-1">-</span>
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Key Reasons */}
      <Card className="p-6">
        <h3 className="font-display font-semibold text-navy mb-4">Wichtigste Einflussfaktoren</h3>
        <div className="space-y-3">
          {result.reasons.slice(0, 5).map((reason, i) => (
            <motion.div
              key={reason.factor}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl',
                reason.impact === 'positive' ? 'bg-sage/10' :
                reason.impact === 'negative' ? 'bg-gold/10' : 'bg-navy/5'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                reason.impact === 'positive' ? 'bg-sage/20 text-sage' :
                reason.impact === 'negative' ? 'bg-gold/20 text-gold-700' : 'bg-navy/10 text-navy'
              )}>
                {reason.impact === 'positive' ? <CheckCircle className="w-4 h-4" /> :
                 reason.impact === 'negative' ? <AlertTriangle className="w-4 h-4" /> :
                 <Info className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-navy">{reason.factor}</p>
                <p className="text-sm text-charcoal/60">{reason.explanation}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <Card className="p-6 border-gold/30 bg-gold/5">
          <h3 className="font-display font-semibold text-gold-700 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Zu beachten
          </h3>
          <ul className="space-y-2">
            {result.warnings.map((warning, i) => (
              <li key={i} className="text-sm text-charcoal/70 flex items-start gap-2">
                <span className="text-gold-700 mt-0.5">!</span>
                {warning}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Alternatives */}
      <Card className="p-6">
        <h3 className="font-display font-semibold text-navy mb-4">Alternative Uberlegungen</h3>
        <ul className="space-y-3">
          {result.alternativeConsiderations.map((alt, i) => (
            <li key={i} className="flex items-start gap-3 text-charcoal/70">
              <Info className="w-4 h-4 text-navy mt-0.5 flex-shrink-0" />
              {alt}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
