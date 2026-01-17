import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header, EnhancedSidebar, PageContainer } from '@/components/layout';
import { Card } from '@/components/ui';
import { Calculator, TrendingUp, Briefcase, Shield, Lock, Eye, Server, ChevronRight, Target, AlertCircle, CheckCircle } from 'lucide-react';

interface ValuationMethod {
  id: string;
  name: string;
  shortName: string;
  icon: typeof Calculator;
  tagline: string;
  maxValue?: string;
  stage: string[];
  pros: string[];
  cons: string[];
  color: string;
}

const valuationMethods: ValuationMethod[] = [
  {
    id: 'berkus',
    name: 'Berkus-Methode',
    shortName: 'Berkus',
    icon: Calculator,
    tagline: '5 Faktoren × 500K € = max. 2,5M €',
    maxValue: '2,5M €',
    stage: ['Pre-Seed', 'Seed'],
    pros: ['Einfach anzuwenden', 'Ideal ohne Umsatz', 'Risikofokussiert'],
    cons: ['Maximal 2,5M €', 'Ignoriert Umsatz'],
    color: 'purple',
  },
  {
    id: 'scorecard',
    name: 'Scorecard-Methode',
    shortName: 'Scorecard',
    icon: TrendingUp,
    tagline: 'Vergleich mit Durchschnitt × Faktoren',
    stage: ['Pre-Seed', 'Seed', 'Series A'],
    pros: ['Marktvergleich', 'Gewichtete Faktoren', 'Flexibel'],
    cons: ['Regionale Daten nötig', 'Subjektive Gewichtung'],
    color: 'pink',
  },
  {
    id: 'vc',
    name: 'VC-Methode',
    shortName: 'VC',
    icon: Briefcase,
    tagline: 'Exit-Wert ÷ Rendite-Erwartung',
    stage: ['Seed', 'Series A', 'Series B+'],
    pros: ['Investor-Perspektive', 'Exit-orientiert', 'Skalierbar'],
    cons: ['Exit-Annahmen unsicher', 'Hohe Varianz'],
    color: 'blue',
  },
];

// Compact Methods Comparison Component
function MethodsComparison({ methods }: { methods: ValuationMethod[] }) {
  const [activeMethod, setActiveMethod] = React.useState<string | null>(null);
  const [hoveredMethod, setHoveredMethod] = React.useState<string | null>(null);

  const colorMap: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-600',
      gradient: 'from-purple-500 to-purple-600',
    },
    pink: {
      bg: 'bg-pink-50',
      border: 'border-pink-200',
      text: 'text-pink-600',
      gradient: 'from-pink-500 to-pink-600',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-600',
      gradient: 'from-blue-500 to-blue-600',
    },
  };

  return (
    <div className="mb-12">
      {/* Compact Method Pills */}
      <div className="flex flex-wrap gap-3 mb-6">
        {methods.map((method, index) => {
          const Icon = method.icon;
          const colors = colorMap[method.color];
          const isActive = activeMethod === method.id;
          const isHovered = hoveredMethod === method.id;

          return (
            <motion.button
              key={method.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setActiveMethod(isActive ? null : method.id)}
              onMouseEnter={() => setHoveredMethod(method.id)}
              onMouseLeave={() => setHoveredMethod(null)}
              className={`
                relative flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all duration-300 cursor-pointer
                ${isActive
                  ? `${colors.bg} ${colors.border} shadow-lg`
                  : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'
                }
              `}
            >
              {/* Icon */}
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                ${isActive ? `bg-gradient-to-br ${colors.gradient}` : 'bg-gray-100'}
              `}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
              </div>

              {/* Content */}
              <div className="text-left">
                <p className={`font-semibold ${isActive ? colors.text : 'text-gray-900'}`}>
                  {method.shortName}
                </p>
                <p className="text-xs text-gray-500 max-w-[140px] truncate">
                  {method.tagline}
                </p>
              </div>

              {/* Expand indicator */}
              <ChevronRight className={`
                w-4 h-4 transition-transform duration-300 ml-1
                ${isActive ? `rotate-90 ${colors.text}` : 'text-gray-300'}
              `} />

              {/* Stage badges - show on hover */}
              <AnimatePresence>
                {(isHovered || isActive) && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute -bottom-2 left-4 flex gap-1"
                  >
                    {method.stage.slice(0, 2).map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 bg-white border border-gray-200 rounded-full text-[10px] font-medium text-gray-600 shadow-sm"
                      >
                        {s}
                      </span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Expanded Details Panel */}
      <AnimatePresence mode="wait">
        {activeMethod && (
          <motion.div
            key={activeMethod}
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {methods
              .filter((m) => m.id === activeMethod)
              .map((method) => {
                const colors = colorMap[method.color];
                return (
                  <Card key={method.id} className={`p-5 ${colors.bg} border ${colors.border}`}>
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Left: Formula/Tagline */}
                      <div className="flex-1">
                        <h4 className={`font-display font-semibold ${colors.text} mb-2`}>
                          {method.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3 font-mono bg-white/60 px-3 py-2 rounded-lg inline-block">
                          {method.tagline}
                        </p>
                        {method.maxValue && (
                          <p className="text-xs text-gray-500">
                            Max. Bewertung: <span className="font-semibold">{method.maxValue}</span>
                          </p>
                        )}
                      </div>

                      {/* Right: Pros/Cons compact */}
                      <div className="flex gap-4 text-sm">
                        <div className="space-y-1.5">
                          {method.pros.map((pro, i) => (
                            <div key={i} className="flex items-center gap-2 text-green-700">
                              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-xs">{pro}</span>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-1.5">
                          {method.cons.map((con, i) => (
                            <div key={i} className="flex items-center gap-2 text-amber-700">
                              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-xs">{con}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint when nothing selected */}
      {!activeMethod && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-400 text-center mt-4"
        >
          Klicke auf eine Methode für Details
        </motion.p>
      )}
    </div>
  );
}

const privacyPoints = [
  {
    icon: Server,
    title: 'Analyse im Browser',
    description: 'Alle Berechnungen finden lokal in deinem Browser statt. Gespeichert werden nur Account- und Abrechnungsdaten.',
  },
  {
    icon: Lock,
    title: 'Kostenlos registrieren',
    description: 'Ein Account reicht, um Projekte und Einstellungen zu speichern. 1 Projekt ist gratis.',
  },
  {
    icon: Eye,
    title: 'Transparente Methodik',
    description: 'Alle Berechnungen sind transparent und nachvollziehbar. Du siehst immer, wie wir zu unseren Empfehlungen kommen.',
  },
  {
    icon: Shield,
    title: 'Deine Kontrolle',
    description: 'Du entscheidest, wie viel du teilst. Selbst mit minimalen Daten liefern wir nutzliche Einblicke.',
  },
];

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

        {/* Valuation Methods - Compact Interactive Cards */}
        <MethodsComparison methods={valuationMethods} />

        {/* Confidence System */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="font-display text-xl font-semibold text-charcoal mb-4">
            Unser Confidence-System
          </h2>
          <p className="text-charcoal/60 mb-6">
            Wir sind transparent daruber, wie sicher unsere Analysen sind.
          </p>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-purple-100">
                <span className="font-medium text-charcoal">Tier-Level</span>
                <span className="text-charcoal/60">Je mehr du teilst, desto genauer</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-purple-100">
                <span className="font-medium text-charcoal">Daten-Vollstandigkeit</span>
                <span className="text-charcoal/60">Ausgefullte Felder verbessern die Analyse</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-purple-100">
                <span className="font-medium text-charcoal">Methoden-Ubereinstimmung</span>
                <span className="text-charcoal/60">Ahnliche Ergebnisse = hohere Sicherheit</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="font-medium text-charcoal">Marktdaten</span>
                <span className="text-charcoal/60">Wettbewerber & TAM verbessern Einschatzung</span>
              </div>
            </div>
          </Card>
        </motion.section>

        {/* Privacy */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-xl font-semibold text-charcoal mb-4">
            Privatsphare & Datenschutz
          </h2>
          <p className="text-charcoal/60 mb-6">
            Wir haben LaunchOS so gebaut, dass wir gar nicht an deine Daten kommen konnen.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            {privacyPoints.map((point, index) => {
              const Icon = point.icon;
              return (
                <motion.div
                  key={point.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="font-display font-semibold text-charcoal mb-2">
                      {point.title}
                    </h3>
                    <p className="text-charcoal/60 text-sm">{point.description}</p>
                  </Card>
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
