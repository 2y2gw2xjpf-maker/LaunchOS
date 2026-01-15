import * as React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface WizardProgressProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (index: number) => void;
  className?: string;
}

export const WizardProgress = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  className,
}: WizardProgressProps) => {
  return (
    <div className={cn('w-full', className)}>
      {/* Progress bar */}
      <div className="relative mb-8">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-navy/10" />
        <motion.div
          className="absolute top-4 left-0 h-0.5 bg-navy"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.3 }}
        />

        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index);
            const isCurrent = index === currentStep;
            const isClickable = onStepClick && (isCompleted || index <= currentStep);

            return (
              <button
                key={step.id}
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
                className={cn(
                  'flex flex-col items-center',
                  isClickable && 'cursor-pointer',
                  !isClickable && 'cursor-default'
                )}
              >
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                    backgroundColor: isCompleted
                      ? '#4A7C59'
                      : isCurrent
                      ? '#0A1628'
                      : '#FFFFFF',
                    borderColor: isCompleted
                      ? '#4A7C59'
                      : isCurrent
                      ? '#0A1628'
                      : 'rgba(10, 22, 40, 0.2)',
                  }}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 flex items-center justify-center',
                    'transition-colors'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        isCurrent ? 'text-white' : 'text-charcoal/40'
                      )}
                    >
                      {index + 1}
                    </span>
                  )}
                </motion.div>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium hidden sm:block',
                    isCurrent ? 'text-navy' : 'text-charcoal/40'
                  )}
                >
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
