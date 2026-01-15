import * as React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface OptionButtonProps {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const OptionButton = ({
  label,
  description,
  icon,
  selected = false,
  onClick,
  disabled = false,
  className,
}: OptionButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative w-full p-4 rounded-2xl border-2 text-left transition-all',
        'hover:border-navy/30 hover:shadow-soft',
        selected
          ? 'border-navy bg-navy/5 shadow-soft'
          : 'border-navy/10 bg-white',
        disabled && 'opacity-50 cursor-not-allowed hover:border-navy/10',
        className
      )}
    >
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-navy flex items-center justify-center"
        >
          <Check className="w-4 h-4 text-white" />
        </motion.div>
      )}

      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
        <div className={cn('flex-1', selected && 'pr-8')}>
          <span className="font-semibold text-navy block">{label}</span>
          {description && (
            <span className="text-sm text-charcoal/60 mt-0.5 block">{description}</span>
          )}
        </div>
      </div>
    </button>
  );
};
