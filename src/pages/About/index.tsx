import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header, EnhancedSidebar, PageContainer } from '@/components/layout';
import { Card } from '@/components/ui';
import {
  Calculator,
  TrendingUp,
  Briefcase,
  Shield,
  Lock,
  Eye,
  Server,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Gauge,
  Database,
  GitCompare,
  BarChart3,
  Users,
  Target,
  Zap,
  Info,
} from 'lucide-react';

// ==================== TYPES ====================

interface ValuationMethod {
  id: string;
  name: string;
  shortName: string;
  icon: typeof Calculator;
  formula: string;
  maxValue?: string;
  stage: string[];
  pros: string[];
  cons: string[];
  color: string;
}

interface ConfidenceFactor {
  id: string;
  name: string;
  icon: typeof Gauge;
  weight: number;
  description: string;
  levels: { label: string; range: string; color: string }[];
}

// ==================== DATA ====================

const valuationMethods: ValuationMethod[] = [
  {
    id: 'berkus',
    name: 'Berkus-Methode',
    shortName: 'Berkus',
    icon: Calculator,
    formula: '5 Faktoren × 500K €',
    maxValue: '2,5M €',
    stage: ['Pre-Seed', 'Seed'],
    pros: ['Einfach', 'Pre-Revenue', 'Risikofokus'],
    cons: ['Max 2,5M €', 'Kein Umsatz'],
    color: 'purple',
  },
  {
    id: 'scorecard',
    name: 'Scorecard-Methode',
    shortName: 'Scorecard',
    icon: TrendingUp,
    formula: 'Basis × Faktoren',
    stage: ['Pre-Seed', 'Seed', 'Series A'],
    pros: ['Marktvergleich', 'Gewichtet', 'Flexibel'],
    cons: ['Regionale Daten', 'Subjektiv'],
    color: 'pink',
  },
  {
    id: 'vc',
    name: 'VC-Methode',
    shortName: 'VC',
    icon: Briefcase,
    formula: 'Exit ÷ ROI',
    stage: ['Seed', 'Series A+'],
    pros: ['Investor-View', 'Exit-fokus', 'Skaliert'],
    cons: ['Spekulativ', 'Hohe Varianz'],
    color: 'blue',
  },
];

const confidenceFactors: ConfidenceFactor[] = [
  {
    id: 'data_quality',
    name: 'Datenqualität',
    icon: Database,
    weight: 30,
    description: 'Wie vollständig und aktuell sind deine Eingaben?',
    levels: [
      { label: 'Minimal', range: '0-25%', color: 'red' },
      { label: 'Basis', range: '26-50%', color: 'amber' },
      { label: 'Gut', range: '51-75%', color: 'blue' },
      { label: 'Exzellent', range: '76-100%', color: 'green' },
    ],
  },
  {
    id: 'method_agreement',
    name: 'Methoden-Konsens',
    icon: GitCompare,
    weight: 25,
    description: 'Wie stark stimmen die verschiedenen Bewertungsmethoden überein?',
    levels: [
      { label: 'Divergent', range: '>50% Abweichung', color: 'red' },
      { label: 'Unterschiedlich', range: '30-50%', color: 'amber' },
      { label: 'Ähnlich', range: '15-30%', color: 'blue' },
      { label: 'Konvergent', range: '<15%', color: 'green' },
    ],
  },
  {
    id: 'market_data',
    name: 'Marktdaten',
    icon: BarChart3,
    weight: 25,
    description: 'Sind Wettbewerber, TAM/SAM/SOM und Branchendaten verfügbar?',
    levels: [
      { label: 'Keine', range: 'Nicht angegeben', color: 'red' },
      { label: 'Geschätzt', range: 'Eigene Schätzung', color: 'amber' },
      { label: 'Recherchiert', range: 'Sekundärquellen', color: 'blue' },
      { label: 'Validiert', range: 'Primärdaten', color: 'green' },
    ],
  },
  {
    id: 'stage_fit',
    name: 'Stage-Passung',
    icon: Target,
    weight: 20,
    description: 'Passen die gewählten Methoden zu deiner Unternehmensphase?',
    levels: [
      { label: 'Unpassend', range: 'Falsche Phase', color: 'red' },
      { label: 'Grenzwertig', range: 'Teilweise', color: 'amber' },
      { label: 'Passend', range: 'Meist korrekt', color: 'blue' },
      { label: 'Optimal', range: 'Perfekte Wahl', color: 'green' },
    ],
  },
];

const privacyPoints = [
  {
    icon: Server,
    title: 'Analyse im Browser',
    description: 'Alle Berechnungen finden lokal in deinem Browser statt.',
  },
  {
    icon: Lock,
    title: 'Verschlüsselte Speicherung',
    description: 'Daten werden nur verschlüsselt in deinem Account gespeichert.',
  },
  {
    icon: Eye,
    title: 'Transparente Methodik',
    description: 'Alle Berechnungen sind nachvollziehbar und dokumentiert.',
  },
  {
    icon: Shield,
    title: 'Deine Kontrolle',
    description: 'Du entscheidest, welche Daten du teilst.',
  },
];

// ==================== COMPONENTS ====================

// Compact horizontal method selector with animated indicator
function MethodsComparison({ methods }: { methods: ValuationMethod[] }) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const activeMethod = methods[activeIndex];

  const colorMap: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
    purple: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-600', gradient: 'from-purple-500 to-purple-600' },
    pink: { bg: 'bg-pink-50', border: 'border-pink-300', text: 'text-pink-600', gradient: 'from-pink-500 to-pink-600' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-600', gradient: 'from-blue-500 to-blue-600' },
  };

  return (
    <div className="mb-12">
      {/* Method Tabs - Horizontal with sliding indicator */}
      <div className="relative bg-gray-100 p-1 rounded-2xl mb-4">
        {/* Sliding background */}
        <motion.div
          className={`absolute top-1 bottom-1 rounded-xl bg-gradient-to-r ${colorMap[activeMethod.color].gradient} shadow-lg`}
          initial={false}
          animate={{
            left: `calc(${(activeIndex / methods.length) * 100}% + 4px)`,
            width: `calc(${100 / methods.length}% - 8px)`,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />

        <div className="relative flex">
          {methods.map((method, index) => {
            const Icon = method.icon;
            const isActive = index === activeIndex;

            return (
              <button
                key={method.id}
                onClick={() => setActiveIndex(index)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-colors z-10 ${
                  isActive ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium text-sm">{method.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Method Details - Animated */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMethod.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Card className={`p-4 ${colorMap[activeMethod.color].bg} border ${colorMap[activeMethod.color].border}`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Left: Name + Formula */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-semibold ${colorMap[activeMethod.color].text}`}>
                    {activeMethod.name}
                  </h4>
                  {activeMethod.maxValue && (
                    <span className="text-xs bg-white/70 px-2 py-0.5 rounded-full text-gray-600">
                      max. {activeMethod.maxValue}
                    </span>
                  )}
                </div>
                <p className="font-mono text-sm text-gray-700 bg-white/50 px-2 py-1 rounded inline-block">
                  {activeMethod.formula}
                </p>
              </div>

              {/* Middle: Stages */}
              <div className="flex gap-1">
                {activeMethod.stage.map((s) => (
                  <span key={s} className="px-2 py-1 bg-white/70 rounded-lg text-xs font-medium text-gray-700">
                    {s}
                  </span>
                ))}
              </div>

              {/* Right: Pros/Cons */}
              <div className="flex gap-3 text-xs">
                <div className="flex flex-col gap-1">
                  {activeMethod.pros.map((p, i) => (
                    <span key={i} className="flex items-center gap-1 text-green-700">
                      <CheckCircle className="w-3 h-3" /> {p}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col gap-1">
                  {activeMethod.cons.map((c, i) => (
                    <span key={i} className="flex items-center gap-1 text-amber-700">
                      <AlertCircle className="w-3 h-3" /> {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Enhanced Confidence System with depth
function ConfidenceSystem({ factors }: { factors: ConfidenceFactor[] }) {
  const [activeFactor, setActiveFactor] = React.useState<string | null>(null);
  const [demoScore, setDemoScore] = React.useState(68);

  // Calculate demo confidence breakdown
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Hoch';
    if (score >= 60) return 'Mittel';
    if (score >= 40) return 'Niedrig';
    return 'Sehr niedrig';
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-gradient-to-r from-green-400 to-green-500';
    if (score >= 60) return 'bg-gradient-to-r from-blue-400 to-blue-500';
    if (score >= 40) return 'bg-gradient-to-r from-amber-400 to-amber-500';
    return 'bg-gradient-to-r from-red-400 to-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Interactive Demo Score */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold text-gray-900 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-purple-600" />
              Confidence Score
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Zeigt die Zuverlässigkeit deiner Bewertung
            </p>
          </div>
          <div className="text-right">
            <motion.span
              key={demoScore}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-4xl font-bold ${getScoreColor(demoScore)}`}
            >
              {demoScore}%
            </motion.span>
            <p className={`text-sm font-medium ${getScoreColor(demoScore)}`}>
              {getScoreLabel(demoScore)}
            </p>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
          <motion.div
            className={`h-full ${getBarColor(demoScore)} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${demoScore}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        {/* Demo Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">Demo:</span>
          <input
            type="range"
            min="10"
            max="95"
            value={demoScore}
            onChange={(e) => setDemoScore(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
        </div>
      </Card>

      {/* Confidence Factors Breakdown */}
      <div>
        <h4 className="font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-500" />
          Was beeinflusst den Score?
        </h4>

        <div className="grid sm:grid-cols-2 gap-3">
          {factors.map((factor) => {
            const Icon = factor.icon;
            const isActive = activeFactor === factor.id;

            return (
              <motion.div
                key={factor.id}
                onClick={() => setActiveFactor(isActive ? null : factor.id)}
                className={`
                  p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${isActive
                    ? 'bg-purple-50 border-purple-300 shadow-md'
                    : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                  }
                `}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isActive ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-gray-900">{factor.name}</span>
                  </div>
                  <span className={`text-sm font-bold ${isActive ? 'text-purple-600' : 'text-gray-400'}`}>
                    {factor.weight}%
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-2">{factor.description}</p>

                {/* Level indicators - always visible but compact */}
                <div className="flex gap-1">
                  {factor.levels.map((level, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-1.5 rounded-full ${
                        level.color === 'red' ? 'bg-red-300' :
                        level.color === 'amber' ? 'bg-amber-300' :
                        level.color === 'blue' ? 'bg-blue-300' : 'bg-green-300'
                      }`}
                      title={`${level.label}: ${level.range}`}
                    />
                  ))}
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-3 pt-3 border-t border-purple-200"
                    >
                      <div className="grid grid-cols-4 gap-1 text-[10px]">
                        {factor.levels.map((level, i) => (
                          <div key={i} className="text-center">
                            <div className={`
                              w-full h-1 rounded mb-1
                              ${level.color === 'red' ? 'bg-red-400' :
                                level.color === 'amber' ? 'bg-amber-400' :
                                level.color === 'blue' ? 'bg-blue-400' : 'bg-green-400'}
                            `} />
                            <span className="font-medium text-gray-700">{level.label}</span>
                            <p className="text-gray-400">{level.range}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* How it's calculated */}
      <Card className="p-4 bg-gray-50 border-gray-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-700 mb-1">So berechnen wir den Score:</p>
            <p>
              Der Confidence Score ist ein gewichteter Durchschnitt aller Faktoren.
              Er zeigt, wie verlässlich die Bewertung ist – nicht ob sie hoch oder niedrig ist.
              Ein Score unter 50% bedeutet, dass mehr Daten die Aussagekraft stark verbessern würden.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ==================== MAIN PAGE ====================

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <EnhancedSidebar />
      <PageContainer withSidebar maxWidth="wide">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-display-sm text-charcoal mb-2">
            Methodik
          </h1>
          <p className="text-charcoal/60">
            LaunchOS verwendet etablierte Bewertungsmethoden aus der Startup-Finanzierung.
          </p>
        </motion.div>

        {/* Valuation Methods */}
        <MethodsComparison methods={valuationMethods} />

        {/* Confidence System */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="font-display text-xl font-semibold text-charcoal mb-2">
            Confidence System
          </h2>
          <p className="text-charcoal/60 mb-6">
            Transparente Einschätzung der Zuverlässigkeit unserer Analysen.
          </p>

          <ConfidenceSystem factors={confidenceFactors} />
        </motion.section>

        {/* Privacy - Compact */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-xl font-semibold text-charcoal mb-4">
            Datenschutz
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {privacyPoints.map((point, index) => {
              const Icon = point.icon;
              return (
                <motion.div
                  key={point.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all"
                >
                  <Icon className="w-5 h-5 text-purple-500 mb-2" />
                  <h3 className="font-medium text-gray-900 text-sm mb-1">{point.title}</h3>
                  <p className="text-xs text-gray-500">{point.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      </PageContainer>
    </div>
  );
};

export default AboutPage;
