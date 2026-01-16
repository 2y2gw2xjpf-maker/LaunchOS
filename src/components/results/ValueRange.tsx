import * as React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';
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
  const midPosition = range > 0 ? ((mid - low) / range) * 100 : 50;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="text-sm font-medium text-charcoal/60 mb-4">{label}</div>
      )}

      {/* Main value with animated gradient background */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="relative text-center mb-6 py-6 px-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100"
      >
        {/* Decorative elements */}
        <div className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-50" />
        <div className="absolute bottom-2 left-2 w-6 h-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-30" />

        <div className="relative">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <CurrencyDisplay
              value={mid}
              currency={currency}
              className="text-4xl md:text-5xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold"
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-purple-600/70 mt-2 flex items-center justify-center gap-1"
          >
            <Target className="w-4 h-4" />
            Geschätzter Wert
          </motion.p>
        </div>
      </motion.div>

      {/* Range visualization */}
      <div className="relative px-2">
        {/* Bar background with gradient */}
        <div className="h-3 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 rounded-full overflow-hidden">
          {/* Animated fill effect */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 opacity-40"
          />
        </div>

        {/* Mid marker */}
        <motion.div
          initial={{ left: '50%', opacity: 0, scale: 0 }}
          animate={{ left: `${midPosition}%`, opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5, type: 'spring' }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
        >
          <div className="w-5 h-5 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full border-3 border-white shadow-lg shadow-purple-500/30" />
        </motion.div>

        {/* Labels */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-between mt-4"
        >
          <div className="text-left flex items-start gap-2">
            <TrendingDown className="w-4 h-4 text-purple-400 mt-0.5" />
            <div>
              <p className="text-xs text-charcoal/50 mb-0.5">Konservativ</p>
              <CurrencyDisplay
                value={low}
                currency={currency}
                animated={false}
                className="text-sm font-semibold text-charcoal/70"
                compact
              />
            </div>
          </div>
          <div className="text-right flex items-start gap-2">
            <div>
              <p className="text-xs text-charcoal/50 mb-0.5">Optimistisch</p>
              <CurrencyDisplay
                value={high}
                currency={currency}
                animated={false}
                className="text-sm font-semibold text-charcoal/70"
                compact
              />
            </div>
            <TrendingUp className="w-4 h-4 text-pink-400 mt-0.5" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
