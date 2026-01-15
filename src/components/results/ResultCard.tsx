import * as React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { CurrencyDisplay, PercentageDisplay } from '@/components/common';

interface ResultCardProps {
  title: string;
  value: number;
  type?: 'currency' | 'percentage' | 'number';
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'highlighted' | 'sage' | 'gold';
  className?: string;
}

export const ResultCard = ({
  title,
  value,
  type = 'number',
  subtitle,
  trend,
  trendLabel,
  icon,
  variant = 'default',
  className,
}: ResultCardProps) => {
  const variantClasses = {
    default: 'bg-white border-brand-100',
    highlighted: 'bg-gradient-to-br from-brand-600 to-brand-700 text-white border-brand-600',
    sage: 'bg-brand-50 border-brand-200',
    gold: 'bg-accent-50 border-accent-200',
  };

  const getTrendIcon = () => {
    if (!trend) return <Minus className="w-4 h-4" />;
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-brand-600" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl border-2 p-6',
        variantClasses[variant],
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <span
          className={cn(
            'text-sm font-medium',
            variant === 'highlighted' ? 'text-white/70' : 'text-charcoal/60'
          )}
        >
          {title}
        </span>
        {icon && (
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              variant === 'highlighted' ? 'bg-white/10' : 'bg-brand-50'
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mb-2">
        {type === 'currency' && (
          <CurrencyDisplay
            value={value}
            className={cn(
              'text-3xl',
              variant === 'highlighted' ? 'text-white' : 'text-charcoal'
            )}
          />
        )}
        {type === 'percentage' && (
          <PercentageDisplay
            value={value}
            className={cn(
              'text-3xl',
              variant === 'highlighted' ? 'text-white' : 'text-charcoal'
            )}
          />
        )}
        {type === 'number' && (
          <span
            className={cn(
              'text-3xl font-mono font-semibold',
              variant === 'highlighted' ? 'text-white' : 'text-charcoal'
            )}
          >
            {value.toLocaleString('de-DE')}
          </span>
        )}
      </div>

      {subtitle && (
        <p
          className={cn(
            'text-sm',
            variant === 'highlighted' ? 'text-white/60' : 'text-charcoal/50'
          )}
        >
          {subtitle}
        </p>
      )}

      {trend !== undefined && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-current/10">
          {getTrendIcon()}
          <span
            className={cn(
              'text-sm font-medium',
              trend > 0 ? 'text-brand-600' : trend < 0 ? 'text-red-500' : 'text-charcoal/50'
            )}
          >
            {trend > 0 ? '+' : ''}
            {trend}%
          </span>
          {trendLabel && (
            <span className="text-sm text-charcoal/40">{trendLabel}</span>
          )}
        </div>
      )}
    </motion.div>
  );
};
