import * as React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Option {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface OptionGridProps {
  options: Option[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const OptionGrid = ({
  options,
  value,
  onChange,
  multiple = false,
  columns = 2,
  className,
}: OptionGridProps) => {
  const selectedValues = Array.isArray(value) ? value : [value];

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValue = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange(newValue);
    } else {
      onChange(optionValue);
    }
  };

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-3', columnClasses[columns], className)}>
      {options.map((option, index) => {
        const isSelected = selectedValues.includes(option.value);

        return (
          <motion.button
            key={option.value}
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => !option.disabled && handleSelect(option.value)}
            disabled={option.disabled}
            className={cn(
              'relative p-4 rounded-2xl border-2 text-left transition-all',
              'hover:border-brand-300 hover:shadow-glow-brand',
              isSelected
                ? 'border-brand-500 bg-brand-50 shadow-glow-brand'
                : 'border-brand-100 bg-white',
              option.disabled && 'opacity-50 cursor-not-allowed hover:border-brand-100'
            )}
          >
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-white" />
              </motion.div>
            )}

            <div className="flex items-start gap-3">
              {option.icon && (
                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                  {option.icon}
                </div>
              )}
              <div className={cn(isSelected && option.icon && 'pr-8')}>
                <span className="font-semibold text-charcoal block">{option.label}</span>
                {option.description && (
                  <span className="text-sm text-charcoal/60 mt-1 block">
                    {option.description}
                  </span>
                )}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};
