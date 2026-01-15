import * as React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onComplete?: () => void;
  canProceed?: boolean;
  isLastStep?: boolean;
  className?: string;
  nextLabel?: string;
  prevLabel?: string;
  completeLabel?: string;
}

export const WizardNavigation = ({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onComplete,
  canProceed = true,
  isLastStep = false,
  className,
  nextLabel = 'Weiter',
  prevLabel = 'Zuruck',
  completeLabel = 'Abschliessen',
}: WizardNavigationProps) => {
  const isFirst = currentStep === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-center justify-between pt-8 border-t border-navy/10',
        className
      )}
    >
      <Button
        variant="ghost"
        onClick={onPrev}
        disabled={isFirst}
        className={cn(isFirst && 'invisible')}
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        {prevLabel}
      </Button>

      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              index === currentStep ? 'bg-navy' : 'bg-navy/20'
            )}
          />
        ))}
      </div>

      {isLastStep ? (
        <Button variant="gold" onClick={onComplete} disabled={!canProceed}>
          <Check className="w-5 h-5 mr-1" />
          {completeLabel}
        </Button>
      ) : (
        <Button variant="primary" onClick={onNext} disabled={!canProceed}>
          {nextLabel}
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      )}
    </motion.div>
  );
};
