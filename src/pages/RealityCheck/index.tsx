/**
 * Reality Check Page
 * Analysiert Social Media Claims und gibt eine faktenbasierte Einordnung
 */

import * as React from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Shield,
  Sparkles,
  Link as LinkIcon,
  FileText,
  Loader2,
  XCircle,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Header, PageContainer } from '@/components/layout';
import { EnhancedSidebar } from '@/components/layout/sidebar/EnhancedSidebar';
import { Card, Button } from '@/components/ui';
import { useAuth } from '@/components/auth/AuthProvider';

// ==================== TYPES ====================

interface AnalysisResult {
  claim: string;
  probability: number;
  probabilityLabel: string;
  hiddenFactors: string[];
  redFlags: string[];
  realisticPath: {
    phase: string;
    duration: string;
    description: string;
  }[];
  businessModelAnalysis: string;
  verdict: 'scam' | 'misleading' | 'possible' | 'realistic';
  verdictLabel: string;
  verdictDescription: string;
}

// ==================== ANALYSIS LOGIC ====================

function analyzeContent(input: string): AnalysisResult {
  const lowerInput = input.toLowerCase();

  // Erkennung von typischen Scam-Mustern
  const incomePatterns = [
    { pattern: /(\d+)k.*monat/i, multiplier: 1000 },
    { pattern: /(\d+)\.?(\d*)€.*monat/i, multiplier: 1 },
    { pattern: /(\d+)k.*month/i, multiplier: 1000 },
    { pattern: /(\d+) euro.*monat/i, multiplier: 1 },
  ];

  let claimedIncome = 0;
  for (const { pattern, multiplier } of incomePatterns) {
    const match = input.match(pattern);
    if (match) {
      claimedIncome = parseInt(match[1]) * multiplier;
      break;
    }
  }

  // Zeit-Claims erkennen
  const hasQuickTimeframe = /(\d+)\s*(stunde|hour|tag|day|woche|week)/i.test(lowerInput) ||
    /schnell|quick|fast|sofort|instant/i.test(lowerInput);

  // Typische Red Flags
  const redFlags: string[] = [];

  if (/kurs|course|coaching|mentoring|masterclass/i.test(lowerInput)) {
    redFlags.push('Verkauft vermutlich einen Kurs zum "Reichwerden"');
  }
  if (/geheim|secret|niemand kennt|keiner weiß/i.test(lowerInput)) {
    redFlags.push('Verwendet "Geheimnis"-Rhetorik');
  }
  if (/nur heute|limited|begrenzt|schnell sein|jetzt oder nie/i.test(lowerInput)) {
    redFlags.push('Künstliche Dringlichkeit/FOMO-Taktik');
  }
  if (/passiv|automatisch|im schlaf|ohne arbeit/i.test(lowerInput)) {
    redFlags.push('Verspricht "passives" oder "automatisches" Einkommen');
  }
  if (/garantiert|100%|sicher|risikofrei/i.test(lowerInput)) {
    redFlags.push('Unrealistische Erfolgsgarantien');
  }
  if (/dropshipping|affiliate|amazon fba|crypto|trading|nft/i.test(lowerInput)) {
    redFlags.push('Häufig übertriebene Nische mit hoher Scam-Rate');
  }
  if (claimedIncome > 10000 && hasQuickTimeframe) {
    redFlags.push('Kombination aus hohem Einkommen + kurzem Zeitrahmen');
  }

  // Versteckte Faktoren
  const hiddenFactors: string[] = [
    '3-5 Jahre Vorarbeit (Community-Aufbau, Expertise, Netzwerk)',
    'Bestehendes Publikum von 10.000-100.000+ Followern',
    'Startkapital für Ads, Tools und Infrastruktur',
    'Team im Hintergrund (Cutter, VA, Designer, etc.)',
    'Mehrere gescheiterte Versuche vorher',
    'Das Produkt ist oft der Kurs selbst ("Wie du X machst")',
  ];

  // Realistischer Pfad
  const realisticPath = [
    {
      phase: 'Jahr 1',
      duration: '12 Monate',
      description: 'Expertise aufbauen, erste Kunden gewinnen, 0-2k€/Monat möglich',
    },
    {
      phase: 'Jahr 2',
      duration: '12 Monate',
      description: 'Prozesse optimieren, Reputation aufbauen, 2-5k€/Monat realistisch',
    },
    {
      phase: 'Jahr 3-4',
      duration: '24 Monate',
      description: 'Skalierung möglich, Team aufbauen, 5-15k€/Monat mit viel Arbeit',
    },
    {
      phase: 'Jahr 5+',
      duration: 'Langfristig',
      description: 'Mit etabliertem System und Team: 15k+/Monat erreichbar',
    },
  ];

  // Wahrscheinlichkeit berechnen
  let probability = 50;

  if (claimedIncome > 30000) probability -= 30;
  else if (claimedIncome > 10000) probability -= 20;
  else if (claimedIncome > 5000) probability -= 10;

  if (hasQuickTimeframe) probability -= 25;
  probability -= redFlags.length * 8;

  probability = Math.max(1, Math.min(99, probability));

  // Verdict bestimmen
  let verdict: AnalysisResult['verdict'];
  let verdictLabel: string;
  let verdictDescription: string;

  if (probability < 5 || redFlags.length >= 4) {
    verdict = 'scam';
    verdictLabel = 'Sehr wahrscheinlich Scam';
    verdictDescription = 'Dieser Content zeigt klassische Merkmale eines Betrugs. Investiere weder Zeit noch Geld.';
  } else if (probability < 20 || redFlags.length >= 2) {
    verdict = 'misleading';
    verdictLabel = 'Stark irreführend';
    verdictDescription = 'Die Darstellung verschweigt wesentliche Faktoren. Die Realität sieht deutlich anders aus.';
  } else if (probability < 50) {
    verdict = 'possible';
    verdictLabel = 'Theoretisch möglich';
    verdictDescription = 'Mit den richtigen Voraussetzungen möglich, aber deutlich schwieriger als dargestellt.';
  } else {
    verdict = 'realistic';
    verdictLabel = 'Realistisch dargestellt';
    verdictDescription = 'Die Darstellung erscheint größtenteils realistisch, aber prüfe die Details.';
  }

  // Probability Label
  let probabilityLabel: string;
  if (probability < 5) probabilityLabel = 'Extrem unwahrscheinlich';
  else if (probability < 15) probabilityLabel = 'Sehr unwahrscheinlich';
  else if (probability < 30) probabilityLabel = 'Unwahrscheinlich';
  else if (probability < 50) probabilityLabel = 'Möglich, aber schwierig';
  else probabilityLabel = 'Durchaus möglich';

  // Business Model Analyse
  let businessModelAnalysis = '';
  if (/dropshipping/i.test(lowerInput)) {
    businessModelAnalysis = 'Dropshipping: Margen typischerweise 10-20%, hohe Konkurrenz, Werbekosten oft unterschätzt. Realistische Gewinne im ersten Jahr: 0-1.000€/Monat.';
  } else if (/affiliate/i.test(lowerInput)) {
    businessModelAnalysis = 'Affiliate Marketing: Erfordert große Reichweite (100k+ Traffic/Monat für nennenswerte Einnahmen). 1-5% Conversion, 5-30% Provision.';
  } else if (/coaching|beratung|consulting/i.test(lowerInput)) {
    businessModelAnalysis = 'Coaching/Beratung: Hochpreisig möglich (1-10k€/Kunde), aber erfordert nachweisbare Expertise und Vertrauensaufbau (1-3 Jahre).';
  } else if (/saas|software|app/i.test(lowerInput)) {
    businessModelAnalysis = 'SaaS/Software: Skalierbar, aber hohe Entwicklungskosten und lange Zeit bis Product-Market-Fit (18-36 Monate typisch).';
  } else if (/crypto|trading|invest/i.test(lowerInput)) {
    businessModelAnalysis = 'Trading/Crypto: Hochriskant, 90%+ der Retail-Trader verlieren Geld. "Erfolgsgeschichten" sind oft Survivorship Bias.';
  } else {
    businessModelAnalysis = 'Das genaue Business-Modell ist nicht klar erkennbar. Ohne konkretes Modell sind solche Einkommensversprechen besonders kritisch zu betrachten.';
  }

  return {
    claim: input.substring(0, 200) + (input.length > 200 ? '...' : ''),
    probability,
    probabilityLabel,
    hiddenFactors,
    redFlags,
    realisticPath,
    businessModelAnalysis,
    verdict,
    verdictLabel,
    verdictDescription,
  };
}

// ==================== COMPONENTS ====================

function ResultCard({ result }: { result: AnalysisResult }) {
  const [showFullPath, setShowFullPath] = React.useState(false);

  const verdictColors = {
    scam: 'from-red-500 to-red-600',
    misleading: 'from-orange-500 to-amber-500',
    possible: 'from-yellow-500 to-amber-400',
    realistic: 'from-green-500 to-emerald-500',
  };

  const verdictBgColors = {
    scam: 'bg-red-50 border-red-200',
    misleading: 'bg-orange-50 border-orange-200',
    possible: 'bg-yellow-50 border-yellow-200',
    realistic: 'bg-green-50 border-green-200',
  };

  const verdictIcons = {
    scam: XCircle,
    misleading: AlertTriangle,
    possible: Info,
    realistic: CheckCircle,
  };

  const VerdictIcon = verdictIcons[result.verdict];

  return (
    <div className="space-y-6">
      {/* Verdict Banner */}
      <div className={`p-6 rounded-2xl border ${verdictBgColors[result.verdict]}`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${verdictColors[result.verdict]} flex items-center justify-center flex-shrink-0`}>
            <VerdictIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {result.verdictLabel}
            </h3>
            <p className="text-gray-600">{result.verdictDescription}</p>
          </div>
        </div>
      </div>

      {/* Probability Meter */}
      <Card className="p-6 bg-white/80">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Erfolgswahrscheinlichkeit für Anfänger</span>
          <span className="text-2xl font-bold text-purple-600">{result.probability}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${verdictColors[result.verdict]} transition-all duration-500`}
            style={{ width: `${result.probability}%` }}
          />
        </div>
        <p className="text-sm text-gray-500">{result.probabilityLabel}</p>
      </Card>

      {/* Red Flags */}
      {result.redFlags.length > 0 && (
        <Card className="p-6 bg-white/80">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h4 className="font-semibold text-gray-900">Red Flags erkannt ({result.redFlags.length})</h4>
          </div>
          <ul className="space-y-2">
            {result.redFlags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                {flag}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Hidden Factors */}
      <Card className="p-6 bg-white/80">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-purple-500" />
          <h4 className="font-semibold text-gray-900">Was typischerweise verschwiegen wird</h4>
        </div>
        <ul className="space-y-2">
          {result.hiddenFactors.map((factor, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <Info className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              {factor}
            </li>
          ))}
        </ul>
      </Card>

      {/* Business Model Analysis */}
      <Card className="p-6 bg-white/80">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <h4 className="font-semibold text-gray-900">Business-Modell Analyse</h4>
        </div>
        <p className="text-sm text-gray-600">{result.businessModelAnalysis}</p>
      </Card>

      {/* Realistic Path */}
      <Card className="p-6 bg-white/80">
        <button
          onClick={() => setShowFullPath(!showFullPath)}
          className="w-full flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" />
            <h4 className="font-semibold text-gray-900">Realistischer Weg zum Ziel</h4>
          </div>
          {showFullPath ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {showFullPath && (
          <div className="space-y-4">
            {result.realisticPath.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                    {i + 1}
                  </div>
                  {i < result.realisticPath.length - 1 && (
                    <div className="w-0.5 h-full bg-purple-200 my-1" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{step.phase}</span>
                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full">
                      {step.duration}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ==================== MAIN PAGE ====================

export function RealityCheckPage() {
  const { user } = useAuth();
  const [input, setInput] = React.useState('');
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [result, setResult] = React.useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;

    setIsAnalyzing(true);

    // Simuliere kurze Analyse-Zeit für bessere UX
    await new Promise(resolve => setTimeout(resolve, 1500));

    const analysisResult = analyzeContent(input);
    setResult(analysisResult);
    setIsAnalyzing(false);
  };

  const handleReset = () => {
    setInput('');
    setResult(null);
  };

  const exampleClaims = [
    '"Mit meinem System verdiene ich 30k im Monat in nur 3 Stunden Arbeit - und das kann jeder!"',
    '"Ich zeige dir mein geheimes Dropshipping-System das mir 10.000€ passives Einkommen bringt"',
    '"Nach 6 Monaten Coaching verdiene ich jetzt 5-stellig pro Monat mit meiner Agentur"',
  ];

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <EnhancedSidebar />
      <PageContainer withSidebar maxWidth="wide">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-display-sm md:text-display-md text-text-primary mb-4">
            Reality Check
          </h1>
          <p className="text-text-secondary text-lg">
            Analysiere Social Media Claims und finde heraus, was wirklich dahinter steckt.
            Schütze dich vor unrealistischen Versprechen und überteuerten Kursen.
          </p>
        </div>

        {/* Info Banner */}
        <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-purple-900">
                <span className="font-medium">Warum das wichtig ist:</span>
                <span className="text-purple-700/70"> 95% der "Schnell reich werden"-Claims auf Social Media verschweigen wesentliche Faktoren. Dieses Tool hilft dir, die Realität einzuschätzen.</span>
              </p>
            </div>
          </div>
        </div>

        {!result ? (
          <>
            {/* Input Section */}
            <Card className="p-6 bg-white/80 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Füge den Social Media Post oder Link ein
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='z.B. "Mit diesem System verdiene ich 30k im Monat in nur 3 Stunden Arbeit..."'
                className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all resize-none"
              />

              <div className="flex items-center gap-3 mt-4">
                <Button
                  variant="primary"
                  onClick={handleAnalyze}
                  disabled={!input.trim() || isAnalyzing}
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analysiere...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analysieren
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Example Claims */}
            <Card className="p-6 bg-white/80">
              <h3 className="font-semibold text-gray-900 mb-4">Beispiele zum Testen</h3>
              <div className="space-y-3">
                {exampleClaims.map((claim, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(claim)}
                    className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-300 transition-all text-sm text-gray-600"
                  >
                    {claim}
                  </button>
                ))}
              </div>
            </Card>
          </>
        ) : (
          <>
            {/* Results */}
            <div className="mb-6">
              <Button
                variant="secondary"
                onClick={handleReset}
                className="mb-4"
              >
                ← Neue Analyse
              </Button>

              <Card className="p-4 bg-gray-50 mb-6">
                <p className="text-sm text-gray-500 mb-1">Analysierter Content:</p>
                <p className="text-gray-700 italic">"{result.claim}"</p>
              </Card>
            </div>

            <ResultCard result={result} />
          </>
        )}

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Diese Analyse basiert auf Mustererkennung und allgemeinen Statistiken.
            Sie ersetzt keine individuelle Prüfung. Jeder Einzelfall kann anders sein.
          </p>
        </div>
      </PageContainer>
    </div>
  );
}

export default RealityCheckPage;
