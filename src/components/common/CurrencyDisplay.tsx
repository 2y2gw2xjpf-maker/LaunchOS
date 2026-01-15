import * as React from 'react';
import { AnimatedNumber } from './AnimatedNumber';
import { cn } from '@/lib/utils/cn';

interface CurrencyDisplayProps {
  value: number;
  currency?: string;
  animated?: boolean;
  className?: string;
  showDecimals?: boolean;
  compact?: boolean;
}

export const CurrencyDisplay = ({
  value,
  currency = 'EUR',
  animated = true,
  className,
  showDecimals = false,
  compact = false,
}: CurrencyDisplayProps) => {
  const formatCurrency = (num: number) => {
    if (compact) {
      if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
      }
      if (num >= 1000) {
        return `${(num / 1000).toFixed(0)}K`;
      }
    }
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(num);
  };

  const currencySymbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : currency;

  return (
    <span className={cn('font-mono font-semibold', className)}>
      {animated ? (
        <>
          <AnimatedNumber value={value} format={formatCurrency} />
          <span className="ml-1">{currencySymbol}</span>
        </>
      ) : (
        `${formatCurrency(value)} ${currencySymbol}`
      )}
    </span>
  );
};
