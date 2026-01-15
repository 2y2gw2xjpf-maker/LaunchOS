import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { Header, EnhancedSidebar, PageContainer } from '@/components/layout';
import { WizardProgress, WizardNavigation } from '@/components/wizard';
import { Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { useStore } from '@/store';
import { calculateRoute } from '@/lib/calculations';
import { ProjectBasicsStep } from './steps/ProjectBasicsStep';
import { PersonalSituationStep } from './steps/PersonalSituationStep';
import { GoalsStep } from './steps/GoalsStep';
import { MarketAnalysisStep } from './steps/MarketAnalysisStep';
import { RouteRecommendation } from './results/RouteRecommendation';
import { ActionPlanTimeline } from './results/ActionPlanTimeline';
import type { RouteResult } from '@/types';

const STEPS = [
  { id: 'project', title: 'Projekt', description: 'Grundlegende Informationen' },
  { id: 'personal', title: 'Situation', description: 'Deine personliche Lage' },
  { id: 'goals', title: 'Ziele', description: 'Was willst du erreichen?' },
  { id: 'market', title: 'Markt', description: 'Wettbewerb & Umfeld' },
  { id: 'results', title: 'Ergebnis', description: 'Deine Empfehlung' },
];

export const WhatsNextPage = () => {
  const navigate = useNavigate();
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
  } = useStore();

  const [activeResultTab, setActiveResultTab] = React.useState('recommendation');

  // Redirect if no tier selected
  React.useEffect(() => {
    if (!selectedTier) {
      navigate('/tier-selection');
    }
  }, [selectedTier, navigate]);

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

  const handleComplete = () => {
    setIsCalculating(true);
    completeStep(currentStep);
    // Move to results step
    setCurrentStep(STEPS.length - 1);

    // Simulate calculation delay for UX
    setTimeout(() => {
      const result = calculateRoute(wizardData);
      setRouteResult(result);
      setIsCalculating(false);
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
            <Tabs value={activeResultTab} onChange={setActiveResultTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="recommendation">Empfehlung</TabsTrigger>
                <TabsTrigger value="actionplan">Action Plan</TabsTrigger>
              </TabsList>

              <TabsContent value="recommendation">
                <RouteRecommendation result={routeResult} />
              </TabsContent>

              <TabsContent value="actionplan">
                <ActionPlanTimeline plan={routeResult.actionPlan} />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
              </div>
              <p className="text-charcoal/60">Analysiere deine Eingaben...</p>
            </div>
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
        {/* Back button */}
        {currentStep === 0 && (
          <Button
            variant="ghost"
            onClick={() => navigate('/tier-selection')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zuruck zur Tier-Auswahl
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
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-brand-100">
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
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default WhatsNextPage;
