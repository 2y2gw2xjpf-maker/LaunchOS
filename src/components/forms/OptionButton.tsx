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
        'hover:border-purple-300 hover:shadow-lg hover:shadow-purple-200/50',
        selected
          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg shadow-purple-200/50 ring-2 ring-purple-400/30'
          : 'border-gray-200 bg-white',
        disabled && 'opacity-50 cursor-not-allowed hover:border-gray-200',
        className
      )}
    >
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30"
        >
          <Check className="w-4 h-4 text-white" />
        </motion.div>
      )}

      <div className="flex items-center gap-3">
        {icon && (
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
            selected ? "bg-gradient-to-br from-purple-100 to-pink-100" : "bg-gray-100"
          )}>
            {icon}
          </div>
        )}
        <div className={cn('flex-1', selected && 'pr-8')}>
          <span className="font-semibold text-charcoal block">{label}</span>
          {description && (
            <span className="text-sm text-charcoal/60 mt-0.5 block">{description}</span>
          )}
        </div>
      </div>
    </button>
  );
};
