import * as React from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
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
      {/* Progress with connecting arrows */}
      <div className="relative mb-8">
        {/* Background line connecting all steps */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-purple-100" />
        {/* Animated progress line */}
        <motion.div
          className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.3 }}
        />

        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index);
            const isCurrent = index === currentStep;
            const isClickable = onStepClick && (isCompleted || index <= currentStep);
            const isLastStep = index === steps.length - 1;

            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => isClickable && onStepClick(index)}
                  disabled={!isClickable}
                  className={cn(
                    'flex flex-col items-center relative z-10',
                    isClickable && 'cursor-pointer',
                    !isClickable && 'cursor-default'
                  )}
                >
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isCurrent ? 1.1 : 1,
                      backgroundColor: isCompleted
                        ? '#9333ea' // purple-600
                        : isCurrent
                        ? '#9333ea' // purple-600
                        : '#FFFFFF',
                      borderColor: isCompleted
                        ? '#9333ea' // purple-600
                        : isCurrent
                        ? '#9333ea' // purple-600
                        : 'rgba(147, 51, 234, 0.3)', // purple-600/30
                    }}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 flex items-center justify-center',
                      'transition-colors shadow-sm',
                      isCurrent && 'ring-4 ring-purple-100'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          isCurrent ? 'text-white' : 'text-text-muted'
                        )}
                      >
                        {index + 1}
                      </span>
                    )}
                  </motion.div>
                  <span
                    className={cn(
                      'mt-2 text-xs font-medium hidden sm:block',
                      isCurrent ? 'text-purple-700' : isCompleted ? 'text-purple-600' : 'text-text-muted'
                    )}
                  >
                    {step.title}
                  </span>
                </button>

                {/* Arrow connector between steps */}
                {!isLastStep && (
                  <div className="hidden sm:flex items-center mx-2">
                    <ChevronRight
                      className={cn(
                        'w-4 h-4 -mt-5',
                        index < currentStep ? 'text-purple-500' : 'text-purple-200'
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
