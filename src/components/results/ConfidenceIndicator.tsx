import * as React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Tooltip } from '@/components/ui';

interface ConfidenceIndicatorProps {
  value: number;
  label?: string;
  showExplanation?: boolean;
  explanationText?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ConfidenceIndicator = ({
  value,
  label = 'Confidence',
  showExplanation = true,
  explanationText,
  size = 'md',
  className,
}: ConfidenceIndicatorProps) => {
  const getConfidenceLevel = () => {
    if (value >= 80) return { level: 'high', color: 'brand', icon: CheckCircle };
    if (value >= 60) return { level: 'medium', color: 'accent', icon: Info };
    return { level: 'low', color: 'red', icon: AlertCircle };
  };

  const { level, color, icon: Icon } = getConfidenceLevel();

  const sizeClasses = {
    sm: 'text-sm py-1 px-2',
    md: 'text-base py-2 px-4',
    lg: 'text-lg py-3 px-6',
  };

  const getDefaultExplanation = () => {
    if (level === 'high') {
      return 'Hohe Datenqualitat: Die Analyse basiert auf umfangreichen Eingaben.';
    }
    if (level === 'medium') {
      return 'Mittlere Datenqualitat: Mehr Details wurden die Genauigkeit erhohen.';
    }
    return 'Niedrige Datenqualitat: Bitte teile mehr Informationen fur genauere Ergebnisse.';
  };

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div
        className={cn(
          'rounded-lg flex items-center gap-2 font-medium',
          sizeClasses[size]
        )}
        style={{
          backgroundColor:
            color === 'brand'
              ? 'rgba(139, 92, 246, 0.1)'
              : color === 'accent'
              ? 'rgba(236, 72, 153, 0.1)'
              : 'rgba(239, 68, 68, 0.1)',
          color:
            color === 'brand'
              ? '#8B5CF6'
              : color === 'accent'
              ? '#EC4899'
              : '#EF4444',
        }}
      >
        <Icon className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
        <span className="font-mono font-semibold">{value}%</span>
        <span className="font-normal opacity-80">{label}</span>
      </div>

      {showExplanation && (
        <Tooltip content={explanationText || getDefaultExplanation()}>
          <button
            type="button"
            className="p-1 rounded-lg text-charcoal/40 hover:text-brand-600 hover:bg-brand-50 transition-colors"
          >
            <Info className="w-4 h-4" />
          </button>
        </Tooltip>
      )}
    </div>
  );
};
