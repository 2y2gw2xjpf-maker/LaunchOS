import * as React from 'react';
import { AnimatedNumber } from './AnimatedNumber';
import { cn } from '@/lib/utils/cn';

interface PercentageDisplayProps {
  value: number;
  animated?: boolean;
  className?: string;
  showSign?: boolean;
  decimals?: number;
}

export const PercentageDisplay = ({
  value,
  animated = true,
  className,
  showSign = false,
  decimals = 0,
}: PercentageDisplayProps) => {
  const formatPercentage = (num: number) => {
    const sign = showSign && num > 0 ? '+' : '';
    return `${sign}${num.toFixed(decimals)}%`;
  };

  const colorClass =
    value > 0 ? 'text-brand-600' : value < 0 ? 'text-red-500' : 'text-charcoal/60';

  return (
    <span className={cn('font-mono font-semibold', showSign && colorClass, className)}>
      {animated ? (
        <AnimatedNumber value={value} format={formatPercentage} />
      ) : (
        formatPercentage(value)
      )}
    </span>
  );
};
