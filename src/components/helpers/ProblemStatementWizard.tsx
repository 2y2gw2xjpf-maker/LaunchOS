import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, CheckCircle2, Lightbulb } from 'lucide-react';
import { Button, Textarea } from '@/components/ui';

interface ProblemStatementWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: (value: string) => void;
}

export const ProblemStatementWizard = ({
  open,
  onClose,
  onComplete,
}: ProblemStatementWizardProps) => {
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState({
    who: '',
    problem: '',
    frequency: '',
    currentSolution: '',
    painLevel: '',
  });

  const steps = [
    {
      id: 'who',
      question: 'Wer hat das Problem?',
      placeholder: 'z.B. "Kleine E-Commerce-Unternehmen mit 10-50 Mitarbeitern"',
      help: 'Sei so spezifisch wie möglich. "Alle" ist keine gute Antwort.',
      examples: [
        'Freelance-Designer ohne Buchhaltungskenntnisse',
        'Mittelständische Unternehmen mit veralteten IT-Systemen',
        'Junge Familien in Großstädten ohne Auto',
      ],
    },
    {
      id: 'problem',
      question: 'Was genau ist das Problem?',
      placeholder: 'z.B. "Sie verbringen zu viel Zeit mit manueller Dateneingabe"',
      help: 'Beschreibe das Problem konkret, nicht deine Lösung.',
      examples: [
        'Sie verlieren 40% ihrer Leads wegen langsamer Antwortzeiten',
        'Sie können ihre Finanzdaten nicht in Echtzeit einsehen',
        'Sie verpassen wichtige Deadlines, weil Informationen verstreut sind',
      ],
    },
    {
      id: 'frequency',
      question: 'Wie oft tritt das Problem auf?',
      placeholder: 'z.B. "Täglich", "Bei jedem neuen Kunden", "Quartalsweise"',
      help: 'Häufige Probleme sind oft wertvoller zu lösen.',
      examples: ['Mehrmals täglich', 'Bei jedem Projekt', 'Monatlich bei der Abrechnung'],
    },
    {
      id: 'currentSolution',
      question: 'Wie wird das Problem aktuell gelöst?',
      placeholder: 'z.B. "Excel-Tabellen", "Manuelle Prozesse", "Externe Berater"',
      help: 'Verstehe den Status Quo. Deine Lösung muss besser sein.',
      examples: [
        'Manuelle Excel-Tabellen mit Fehleranfälligkeit',
        'Teure Agenturen, die langsam sind',
        'Gar nicht - sie ignorieren es und hoffen auf das Beste',
      ],
    },
    {
      id: 'painLevel',
      question: 'Wie schmerzhaft ist das Problem?',
      placeholder: 'z.B. "Sehr - kostet sie Zeit und Geld"',
      help: 'Ein echtes Problem verursacht messbare Schmerzen.',
      examples: [
        'Sehr schmerzhaft - sie verlieren dadurch Kunden',
        'Mittelmäßig - es nervt, aber ist aushaltbar',
        'Existenzbedrohend - ohne Lösung gehen sie pleite',
      ],
    },
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Generate problem statement from answers
      const statement = generateProblemStatement(answers);
      onComplete(statement);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const generateProblemStatement = (data: typeof answers): string => {
    return `${data.who} haben das Problem, dass ${data.problem}. Dies passiert ${data.frequency}. Aktuell lösen sie es durch ${data.currentSolution}, aber das ist nicht ideal weil ${data.painLevel}.`;
  };

  const canProceed = answers[currentStep?.id as keyof typeof answers]?.trim().length > 0;

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[70]"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg bg-white rounded-2xl shadow-2xl z-[70] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy/10">
          <div>
            <h2 className="font-display text-lg text-navy">Problem Statement erarbeiten</h2>
            <p className="text-sm text-charcoal/60">
              Schritt {step + 1} von {steps.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-navy/5 transition-colors"
          >
            <X className="w-5 h-5 text-charcoal/60" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step ? 'bg-navy' : 'bg-navy/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-medium text-navy">{currentStep.question}</h3>
              <p className="text-sm text-charcoal/60">{currentStep.help}</p>

              <Textarea
                value={answers[currentStep.id as keyof typeof answers]}
                onChange={(e) =>
                  setAnswers({ ...answers, [currentStep.id]: e.target.value })
                }
                placeholder={currentStep.placeholder}
                className="min-h-[100px]"
              />

              {/* Examples */}
              <div className="bg-cream rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-navy">
                  <Lightbulb className="w-4 h-4" />
                  Beispiele
                </div>
                <ul className="space-y-1">
                  {currentStep.examples.map((example, i) => (
                    <li
                      key={i}
                      className="text-sm text-charcoal/70 cursor-pointer hover:text-navy transition-colors"
                      onClick={() =>
                        setAnswers({ ...answers, [currentStep.id]: example })
                      }
                    >
                      • {example}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-navy/10 bg-cream/50">
          {step > 0 ? (
            <Button variant="outline" onClick={handleBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Zurück
            </Button>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
          )}

          <Button onClick={handleNext} disabled={!canProceed} className="flex-1 gap-2">
            {step < steps.length - 1 ? (
              <>
                Weiter
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Fertig
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
