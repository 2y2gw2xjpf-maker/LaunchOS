import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, RefreshCw, Sparkles, Target, Map, Rocket, AlertCircle, Building2 } from 'lucide-react';
import { Header, EnhancedSidebar, PageContainer } from '@/components/layout';
import { WizardProgress, WizardNavigation } from '@/components/wizard';
import { Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { useStore } from '@/store';
import { useVentureContext } from '@/contexts/VentureContext';
import { calculateRoute } from '@/lib/calculations';
import { ProjectBasicsStep } from './steps/ProjectBasicsStep';
import { PersonalSituationStep } from './steps/PersonalSituationStep';
import { GoalsStep } from './steps/GoalsStep';
import { MarketAnalysisStep } from './steps/MarketAnalysisStep';
import { RouteRecommendation } from './results/RouteRecommendation';
import { ActionPlanTimeline } from './results/ActionPlanTimeline';
import { ProgramRunner } from '@/components/program/ProgramRunner';
// RouteResult type is used by calculateRoute return value

const STEPS = [
  { id: 'project', title: 'Projekt', description: 'Grundlegende Informationen' },
  { id: 'personal', title: 'Situation', description: 'Deine persönliche Lage' },
  { id: 'goals', title: 'Ziele', description: 'Was willst du erreichen?' },
  { id: 'market', title: 'Markt', description: 'Wettbewerb & Umfeld' },
  { id: 'results', title: 'Ergebnis', description: 'Deine Empfehlung' },
];

export const WhatsNextPage = () => {
  const navigate = useNavigate();
  const { activeVenture } = useVentureContext();
  const {
    selectedTier,
    wizardData,
    currentStep,
    setCurrentStep,
    completeStep,
    routeResult,
    setRouteResult,
    setIsCalculating,
    isCalculating,
    resetRoute,
    saveCurrentAsAnalysis,
    activeAnalysisId,
    updateAnalysis,
  } = useStore();

  const [activeResultTab, setActiveResultTab] = React.useState('recommendation');
  const [activeAnalysisSubTab, setActiveAnalysisSubTab] = React.useState<'timeline' | 'dashboard'>('timeline');
  const [showProgramRunner, setShowProgramRunner] = React.useState(false);

  // Prüfe ob Tier-Daten vorhanden sind
  const hasTierData = activeVenture?.tierData?.completed_at !== null && activeVenture?.tierData?.completed_at !== undefined;

  // Redirect if no tier selected
  React.useEffect(() => {
    if (!selectedTier) {
      navigate('/tier-selection');
    }
  }, [selectedTier, navigate]);

  // Scroll to top on mount and when step changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Scroll to top when step changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const handleNext = () => {
    completeStep(currentStep);
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsCalculating(true);
    completeStep(currentStep);
    // Move to results step
    setCurrentStep(STEPS.length - 1);

    // Simulate calculation delay for UX
    setTimeout(async () => {
      const result = calculateRoute(wizardData);
      setRouteResult(result);
      setIsCalculating(false);

      // Auto-save the analysis after calculation
      const analysisName = activeVenture?.name
        ? `${activeVenture.name} - Analyse`
        : `Analyse ${new Date().toLocaleDateString('de-DE')}`;

      const getCurrentState = () => ({
        tier: selectedTier || 'minimal' as const,
        wizardData,
        routeResult: result,
        methodResults: [] as import('@/types').ValuationMethodResult[],
        completedTasks: [] as string[],
      });

      try {
        if (activeAnalysisId) {
          // Update existing analysis
          await updateAnalysis(activeAnalysisId, {
            routeResult: result,
            wizardData,
            tier: selectedTier || 'minimal',
          });
          console.log('[WhatsNext] Analysis updated:', activeAnalysisId);
        } else {
          // Save as new analysis
          const saved = await saveCurrentAsAnalysis(
            analysisName,
            null, // projectId
            getCurrentState,
            activeVenture?.id || null
          );
          console.log('[WhatsNext] Analysis saved:', saved.id);
        }
      } catch (error) {
        console.error('[WhatsNext] Failed to save analysis:', error);
      }
    }, 1500);
  };

  const handleRecalculate = () => {
    resetRoute();
    setCurrentStep(0);
  };

  const isLastStep = currentStep === STEPS.length - 2; // Before results
  const showResults = currentStep === STEPS.length - 1 && routeResult;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <ProjectBasicsStep />;
      case 1:
        return <PersonalSituationStep />;
      case 2:
        return <GoalsStep />;
      case 3:
        return <MarketAnalysisStep />;
      case 4:
        return showResults ? (
          <div className="space-y-8">
            {/* Main Tabs - Results Overview */}
            <Tabs value={activeResultTab} onChange={setActiveResultTab}>
              <TabsList className="mb-8 bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl shadow-lg shadow-purple-500/5 border border-purple-100">
                <TabsTrigger
                  value="recommendation"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-xl px-6 py-3 font-medium transition-all"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Empfehlung
                </TabsTrigger>
                <TabsTrigger
                  value="actionplan"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-xl px-6 py-3 font-medium transition-all"
                >
                  <Map className="w-4 h-4 mr-2" />
                  Action Plan
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recommendation">
                <RouteRecommendation result={routeResult} />
              </TabsContent>

              <TabsContent value="actionplan">
                {/* Sub-Tabs for Action Plan */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 p-1 bg-purple-50 rounded-xl w-fit">
                    <button
                      onClick={() => setActiveAnalysisSubTab('timeline')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeAnalysisSubTab === 'timeline'
                          ? 'bg-white text-purple-700 shadow-sm'
                          : 'text-purple-600/70 hover:text-purple-600'
                      }`}
                    >
                      Timeline
                    </button>
                    <button
                      onClick={() => setActiveAnalysisSubTab('dashboard')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeAnalysisSubTab === 'dashboard'
                          ? 'bg-white text-purple-700 shadow-sm'
                          : 'text-purple-600/70 hover:text-purple-600'
                      }`}
                    >
                      Dashboard
                    </button>
                  </div>
                </div>
                <ActionPlanTimeline plan={routeResult.actionPlan} activeView={activeAnalysisSubTab} />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex items-center justify-center py-20">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="relative mx-auto mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-10 h-10 text-purple-600" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-30 animate-pulse" />
              </div>
              <p className="text-lg text-purple-600 font-medium">Analysiere deine Eingaben...</p>
              <p className="text-sm text-charcoal/50 mt-2">Dein personalisierter Action Plan wird erstellt</p>
            </motion.div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <EnhancedSidebar />
      <PageContainer withSidebar maxWidth="wide">
        {/* Tier Data Info Banner */}
        {activeVenture && hasTierData && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-900">
                  Analysiere: <span className="font-semibold">{activeVenture.name}</span>
                </p>
                <p className="text-xs text-purple-700/70">
                  {activeVenture.tierData?.category} • {activeVenture.tierData?.stage}
                  {activeVenture.tierLevel && ` • Tier ${activeVenture.tierLevel}`}
                </p>
              </div>
              <Link
                to="/venture/data-input"
                className="text-sm text-purple-600 hover:text-purple-700 underline"
              >
                Daten bearbeiten
              </Link>
            </div>
          </motion.div>
        )}

        {/* Missing Tier Data Warning */}
        {activeVenture && !hasTierData && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900">
                  Für genauere Empfehlungen: Venture-Daten ausfüllen
                </p>
                <p className="text-xs text-amber-700/70 mt-1">
                  Je mehr Informationen du teilst, desto personalisierter werden unsere Empfehlungen.
                </p>
              </div>
              <Link
                to="/venture/data-input"
                className="text-sm font-medium text-amber-700 hover:text-amber-800 underline whitespace-nowrap"
              >
                Daten eingeben
              </Link>
            </div>
          </motion.div>
        )}

        {/* Back button */}
        {currentStep === 0 && (
          <Button
            variant="ghost"
            onClick={() => navigate('/tier-selection')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zur Tier-Auswahl
          </Button>
        )}

        {/* Progress */}
        <WizardProgress
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={wizardData.completedSteps}
          onStepClick={(index) => {
            if (index <= currentStep || wizardData.completedSteps.includes(index - 1)) {
              setCurrentStep(index);
            }
          }}
          className="mb-8"
        />

        {/* Step Title */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-display-sm text-charcoal mb-2">
            {STEPS[currentStep].title}
          </h1>
          <p className="text-charcoal/60">{STEPS[currentStep].description}</p>
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {!showResults && (
          <WizardNavigation
            currentStep={currentStep}
            totalSteps={STEPS.length}
            onNext={handleNext}
            onPrev={handlePrev}
            onComplete={handleComplete}
            isLastStep={isLastStep}
            canProceed={!isCalculating}
            className="mt-8"
            completeLabel="Analyse starten"
          />
        )}

        {/* Results Actions */}
        {showResults && (
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-purple-100">
            <Button variant="secondary" onClick={handleRecalculate}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Neu berechnen
            </Button>
            <Button variant="primary" onClick={() => navigate('/valuation')}>
              Zur Bewertung
            </Button>
            <Button variant="gold">
              <Download className="w-4 h-4 mr-2" />
              PDF Export
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowProgramRunner(true)}
              className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:border-purple-400"
            >
              <Rocket className="w-4 h-4 mr-2 text-purple-500" />
              Programm starten
            </Button>
          </div>
        )}

        {/* Program Runner Modal */}
        <ProgramRunner
          isOpen={showProgramRunner}
          onClose={() => setShowProgramRunner(false)}
        />
      </PageContainer>
    </div>
  );
};

export default WhatsNextPage;
