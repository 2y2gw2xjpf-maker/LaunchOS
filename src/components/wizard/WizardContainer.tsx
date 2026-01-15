import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { WizardProgress } from './WizardProgress';
import { WizardNavigation } from './WizardNavigation';

interface Step {
  id: string;
  title: string;
  description?: string;
  component: React.ReactNode;
  isValid?: () => boolean;
}

interface WizardContainerProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  onStepChange: (step: number) => void;
  onComplete: () => void;
  title?: string;
  subtitle?: string;
  className?: string;
  showProgress?: boolean;
}

export const WizardContainer = ({
  steps,
  currentStep,
  completedSteps,
  onStepChange,
  onComplete,
  title,
  subtitle,
  className,
  showProgress = true,
}: WizardContainerProps) => {
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = currentStepData?.isValid?.() ?? true;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      onStepChange(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  const handleStepClick = (index: number) => {
    if (index <= currentStep || completedSteps.includes(index - 1)) {
      onStepChange(index);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-8 text-center">
          {title && (
            <h1 className="font-display text-display-sm md:text-display-md text-navy mb-2">
              {title}
            </h1>
          )}
          {subtitle && <p className="text-charcoal/60 text-lg">{subtitle}</p>}
        </div>
      )}

      {/* Progress */}
      {showProgress && (
        <WizardProgress
          steps={steps.map((s) => ({ id: s.id, title: s.title }))}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
          className="mb-8"
        />
      )}

      {/* Step content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step header */}
            {currentStepData && (
              <div className="mb-6">
                <h2 className="font-display text-xl md:text-2xl text-navy mb-2">
                  {currentStepData.title}
                </h2>
                {currentStepData.description && (
                  <p className="text-charcoal/60">{currentStepData.description}</p>
                )}
              </div>
            )}

            {/* Step component */}
            {currentStepData?.component}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <WizardNavigation
        currentStep={currentStep}
        totalSteps={steps.length}
        onNext={handleNext}
        onPrev={handlePrev}
        onComplete={onComplete}
        canProceed={canProceed}
        isLastStep={isLastStep}
      />
    </div>
  );
};
