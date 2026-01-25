import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Rocket,
  Briefcase,
  GitMerge,
  CheckCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  Shield,
  Target,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Clock,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ComparisonBar, ConfidenceIndicator } from '@/components/results';
import type { RouteResult, RecommendedRoute } from '@/types';

interface RouteRecommendationProps {
  result: RouteResult;
}

const routeDetails: Record<RecommendedRoute, {
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Rocket;
  color: string;
  gradient: string;
  pros: { text: string; detail: string }[];
  cons: { text: string; detail: string }[];
  timeline: string;
  effort: string;
  risk: string;
}> = {
  bootstrap: {
    title: 'Bootstrap',
    subtitle: 'Selbstfinanziert wachsen',
    description: 'Baue dein Unternehmen mit eigenem Geld und Einnahmen auf. Du behältst die volle Kontrolle über alle Entscheidungen und bist niemandem Rechenschaft schuldig.',
    icon: Rocket,
    color: '#9333ea',
    gradient: 'from-purple-500 to-violet-600',
    pros: [
      { text: 'Volle Kontrolle über Entscheidungen', detail: 'Du bestimmst Tempo, Richtung und Prioritäten ohne externe Einflussnahme' },
      { text: 'Keine Verwässerung deiner Anteile', detail: 'Du behältst 100% deines Unternehmens, auch bei späteren Erfolgen' },
      { text: 'Profitabel von Anfang an denken', detail: 'Zwingt dich zu nachhaltigem Wirtschaften und echtem Product-Market Fit' },
      { text: 'Kein Druck von Investoren', detail: 'Keine Reporting-Pflichten, keine Board-Meetings, keine Exit-Erwartungen' },
    ],
    cons: [
      { text: 'Langsameres Wachstum möglich', detail: 'Ohne Kapitalspritze kann es länger dauern, Marktanteile zu gewinnen' },
      { text: 'Begrenztes Kapital für Experimente', detail: 'Weniger Budget für Marketing, Hiring und Produktentwicklung' },
      { text: 'Hohes persönliches Risiko', detail: 'Dein eigenes Geld steht auf dem Spiel' },
      { text: 'Schwieriger in winner-takes-all Märkten', detail: 'In Märkten mit Netzwerkeffekten kann Geschwindigkeit entscheidend sein' },
    ],
    timeline: '18-36 Monate bis Profitabilität',
    effort: 'Mittel bis Hoch',
    risk: 'Moderat',
  },
  investor: {
    title: 'Investor',
    subtitle: 'Mit Kapital skalieren',
    description: 'Hole externes Kapital für schnelleres Wachstum. Du gibst dafür Anteile und einen Teil der Kontrolle ab, bekommst aber Zugang zu Kapital, Netzwerk und Expertise.',
    icon: Briefcase,
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-600',
    pros: [
      { text: 'Schnelleres Wachstum möglich', detail: 'Mit Kapital kannst du schneller Marktanteile gewinnen und skalieren' },
      { text: 'Zugang zu Netzwerk und Expertise', detail: 'Gute Investoren bringen Kontakte, Erfahrung und strategische Beratung mit' },
      { text: 'Mehr Runway für Experimente', detail: 'Du kannst größer denken und mehr ausprobieren, bevor Profitabilität nötig ist' },
      { text: 'Signal-Effekt im Markt', detail: 'Bekannte Investoren geben deinem Startup Glaubwürdigkeit' },
    ],
    cons: [
      { text: 'Verwasserung deiner Anteile', detail: 'Bei jeder Finanzierungsrunde gibst du einen Teil deines Unternehmens ab' },
      { text: 'Reporting-Pflichten', detail: 'Regelmäßige Updates und Board-Meetings werden erwartet' },
      { text: 'Weniger Kontrolle über Entscheidungen', detail: 'Investoren haben Mitspracherecht bei strategischen Entscheidungen' },
      { text: 'Erwartung von schnellem Exit', detail: 'VCs erwarten typischerweise Exit innerhalb von 7-10 Jahren' },
    ],
    timeline: '6-12 Monate bis zur ersten Runde',
    effort: 'Sehr Hoch (Fundraising)',
    risk: 'Hoch',
  },
  hybrid: {
    title: 'Hybrid',
    subtitle: 'Das Beste aus beiden Welten',
    description: 'Starte Bootstrap und raise strategisch, wenn es Sinn macht. Du validierst dein Geschäftsmodell erst mit eigenen Mitteln und holst dann Kapital zu besseren Konditionen.',
    icon: GitMerge,
    color: '#7c3aed',
    gradient: 'from-violet-500 to-purple-600',
    pros: [
      { text: 'Flexibilität behalten', detail: 'Du kannst je nach Situation entscheiden, welchen Weg du einschlägst' },
      { text: 'Bessere Bewertung bei Raise', detail: 'Mit Traktion und Umsatz verhandelst du aus einer stärkeren Position' },
      { text: 'Kontrolle in der Anfangsphase', detail: 'Du bewahrst dir die Freiheit, solange du sie am meisten brauchst' },
      { text: 'Option auf beide Wege offen', detail: 'Du kannst später entscheiden, ob du Investoren willst oder nicht' },
    ],
    cons: [
      { text: 'Erfordert disziplinierte Execution', detail: 'Du musst sowohl Bootstrap-Skills als auch Fundraising-Fähigkeiten entwickeln' },
      { text: 'Timing des Raises kritisch', detail: 'Zu früh oder zu spät zu raisen kann teuer werden' },
      { text: 'Mögliche Opportunity Costs', detail: 'Während du bootstrappst, könnte ein Wettbewerber mit Kapital schneller wachsen' },
      { text: 'Komplexere Planung nötig', detail: 'Du musst für mehrere Szenarien planen und vorbereitet sein' },
    ],
    timeline: '12-24 Monate Bootstrap, dann Raise',
    effort: 'Hoch (beides lernen)',
    risk: 'Moderat bis Hoch',
  },
};

export const RouteRecommendation = ({ result }: RouteRecommendationProps) => {
  const details = routeDetails[result.recommendation];
  const Icon = details.icon;

  return (
    <div className="space-y-8">
      {/* Main Recommendation Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 p-8 text-white"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative">
          <p className="text-white/70 text-sm mb-2">Unsere Empfehlung für dich</p>

          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className={cn(
                'w-20 h-20 rounded-2xl flex items-center justify-center',
                'bg-white/20 backdrop-blur-sm'
              )}
            >
              <Icon className="w-10 h-10 text-white" />
            </motion.div>

            <div className="flex-1">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-display font-bold mb-2"
              >
                {details.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-white/80 text-lg"
              >
                {details.subtitle}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <div className="text-5xl font-bold mb-1">{result.scores[result.recommendation]}%</div>
              <p className="text-white/60 text-sm">Match Score</p>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/90 text-lg leading-relaxed max-w-3xl"
          >
            {details.description}
          </motion.p>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20"
          >
            <div>
              <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
                <Clock className="w-4 h-4" />
                Timeline
              </div>
              <p className="font-medium">{details.timeline}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
                <TrendingUp className="w-4 h-4" />
                Aufwand
              </div>
              <p className="font-medium">{details.effort}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
                <Shield className="w-4 h-4" />
                Risiko
              </div>
              <p className="font-medium">{details.risk}</p>
            </div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-pink-500/30 rounded-full blur-2xl" />
      </motion.div>

      {/* Confidence & Score Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-white border-2 border-purple-100"
        >
          <h3 className="font-display font-semibold text-charcoal mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Confidence Level
          </h3>
          <ConfidenceIndicator value={result.confidence} label="Confidence" />
          <p className="text-sm text-charcoal/60 mt-4">
            {result.confidence >= 80
              ? 'Sehr hohe Sicherheit - deine Eingaben zeigen ein klares Bild.'
              : result.confidence >= 60
              ? 'Gute Sicherheit - einige Faktoren könnten noch verfeinert werden.'
              : 'Moderate Sicherheit - weitere Details würden die Analyse verbessern.'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-white border-2 border-purple-100"
        >
          <h3 className="font-display font-semibold text-charcoal mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Score-Vergleich
          </h3>
          <div className="space-y-4">
            <ComparisonBar
              leftValue={result.scores.bootstrap}
              rightValue={result.scores.investor}
              leftLabel="Bootstrap"
              rightLabel="Investor"
              leftColor="#9333ea"
              rightColor="#ec4899"
            />
            <div className="flex items-center justify-center gap-2 text-sm text-charcoal/60">
              <GitMerge className="w-4 h-4 text-violet-500" />
              <span>Hybrid Score: <strong className="text-charcoal">{result.scores.hybrid}%</strong></span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pros & Cons - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl bg-white border-2 border-purple-100 overflow-hidden"
      >
        <div className="p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center',
                `bg-gradient-to-br ${details.gradient} shadow-lg`
              )}
            >
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-xl text-charcoal">{details.title}</h3>
              <p className="text-charcoal/60">{details.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2">
          {/* Pros */}
          <div className="p-6 border-r border-purple-100">
            <h4 className="font-semibold text-green-700 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Vorteile
            </h4>
            <div className="space-y-4">
              {details.pros.map((pro, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-sm font-bold">+</span>
                    </div>
                    <div>
                      <p className="font-medium text-charcoal">{pro.text}</p>
                      <p className="text-sm text-charcoal/50 mt-0.5">{pro.detail}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Cons */}
          <div className="p-6">
            <h4 className="font-semibold text-amber-700 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Herausforderungen
            </h4>
            <div className="space-y-4">
              {details.cons.map((con, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-amber-600 text-sm font-bold">!</span>
                    </div>
                    <div>
                      <p className="font-medium text-charcoal">{con.text}</p>
                      <p className="text-sm text-charcoal/50 mt-0.5">{con.detail}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Reasons - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-2xl bg-white border-2 border-purple-100"
      >
        <h3 className="font-display font-semibold text-charcoal mb-6 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-purple-600" />
          Wichtigste Einflussfaktoren
        </h3>
        <p className="text-charcoal/60 mb-6">
          Diese Faktoren aus deinen Eingaben haben die Empfehlung am stärksten beeinflusst:
        </p>
        <div className="space-y-3">
          {result.reasons.slice(0, 6).map((reason, i) => (
            <motion.div
              key={reason.factor}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className={cn(
                'flex items-start gap-4 p-4 rounded-xl transition-all',
                reason.impact === 'positive'
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
                  : reason.impact === 'negative'
                  ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200'
                  : 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200'
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  reason.impact === 'positive'
                    ? 'bg-green-100 text-green-600'
                    : reason.impact === 'negative'
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-purple-100 text-purple-600'
                )}
              >
                {reason.impact === 'positive' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : reason.impact === 'negative' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-charcoal">{reason.factor}</p>
                <p className="text-sm text-charcoal/60 mt-1">{reason.explanation}</p>
              </div>
              <div
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium',
                  reason.impact === 'positive'
                    ? 'bg-green-200 text-green-800'
                    : reason.impact === 'negative'
                    ? 'bg-amber-200 text-amber-800'
                    : 'bg-purple-200 text-purple-800'
                )}
              >
                {reason.impact === 'positive' ? 'Pro Bootstrap' : reason.impact === 'negative' ? 'Pro Investor' : 'Neutral'}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50"
        >
          <h3 className="font-display font-semibold text-red-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Wichtige Hinweise
          </h3>
          <div className="space-y-3">
            {result.warnings.map((warning, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-red-200 text-red-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  !
                </span>
                <p className="text-red-900">{warning}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Alternatives */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-100"
      >
        <h3 className="font-display font-semibold text-charcoal mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Alternative Überlegungen
        </h3>
        <p className="text-charcoal/60 mb-4">
          Unabhängig von der Hauptempfehlung könntest du auch diese Optionen in Betracht ziehen:
        </p>
        <div className="space-y-3">
          {result.alternativeConsiderations.map((alt, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="flex items-start gap-3 p-4 bg-white rounded-xl border border-purple-100 hover:border-purple-200 hover:shadow-sm transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                <ArrowRight className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-charcoal/80 pt-1">{alt}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
