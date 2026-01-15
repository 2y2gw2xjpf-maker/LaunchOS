import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { CurrencyDisplay } from '@/components/common';

interface ValueRangeProps {
  low: number;
  mid: number;
  high: number;
  currency?: string;
  label?: string;
  className?: string;
}

export const ValueRange = ({
  low,
  mid,
  high,
  currency = 'EUR',
  label,
  className,
}: ValueRangeProps) => {
  const range = high - low;
  const midPosition = ((mid - low) / range) * 100;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="text-sm font-medium text-charcoal/60 mb-4">{label}</div>
      )}

      {/* Main value */}
      <div className="text-center mb-6">
        <CurrencyDisplay
          value={mid}
          currency={currency}
          className="text-4xl md:text-5xl text-navy"
        />
        <p className="text-sm text-charcoal/50 mt-2">Geschatzter Wert</p>
      </div>

      {/* Range visualization */}
      <div className="relative">
        {/* Bar background */}
        <div className="h-4 bg-gradient-to-r from-sage/20 via-gold/20 to-sage/20 rounded-full" />

        {/* Mid marker */}
        <motion.div
          initial={{ left: '0%', opacity: 0 }}
          animate={{ left: `${midPosition}%`, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-6 bg-navy rounded-full border-4 border-white shadow-medium" />
        </motion.div>

        {/* Labels */}
        <div className="flex justify-between mt-4">
          <div className="text-left">
            <p className="text-xs text-charcoal/40 mb-1">Konservativ</p>
            <CurrencyDisplay
              value={low}
              currency={currency}
              animated={false}
              className="text-sm text-charcoal/60"
              compact
            />
          </div>
          <div className="text-right">
            <p className="text-xs text-charcoal/40 mb-1">Optimistisch</p>
            <CurrencyDisplay
              value={high}
              currency={currency}
              animated={false}
              className="text-sm text-charcoal/60"
              compact
            />
          </div>
        </div>
      </div>
    </div>
  );
};
