import * as React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Tooltip } from '@/components/ui';

interface QuestionCardProps {
  question: string;
  description?: string;
  helpText?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const QuestionCard = ({
  question,
  description,
  helpText,
  required = false,
  children,
  className,
}: QuestionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('mb-8', className)}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-charcoal">
            {question}
            {required && <span className="text-accent-500 ml-1">*</span>}
          </h3>
          {description && (
            <p className="text-charcoal/60 mt-1">{description}</p>
          )}
        </div>
        {helpText && (
          <Tooltip content={helpText}>
            <button
              type="button"
              className="p-1.5 rounded-lg text-charcoal/40 hover:text-brand-600 hover:bg-brand-50 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </Tooltip>
        )}
      </div>
      {children}
    </motion.div>
  );
};
