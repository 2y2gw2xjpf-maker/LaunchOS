import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface ComparisonBarProps {
  leftValue: number;
  rightValue: number;
  leftLabel: string;
  rightLabel: string;
  leftColor?: string;
  rightColor?: string;
  showPercentages?: boolean;
  className?: string;
}

export const ComparisonBar = ({
  leftValue,
  rightValue,
  leftLabel,
  rightLabel,
  leftColor = '#4A7C59',
  rightColor = '#F5A623',
  showPercentages = true,
  className,
}: ComparisonBarProps) => {
  const total = leftValue + rightValue;
  const leftPercentage = total > 0 ? (leftValue / total) * 100 : 50;
  const rightPercentage = total > 0 ? (rightValue / total) * 100 : 50;

  return (
    <div className={cn('w-full', className)}>
      {/* Labels */}
      <div className="flex justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: leftColor }}
          />
          <span className="text-sm font-medium text-navy">{leftLabel}</span>
          {showPercentages && (
            <span className="text-sm font-mono text-charcoal/60">
              {Math.round(leftPercentage)}%
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showPercentages && (
            <span className="text-sm font-mono text-charcoal/60">
              {Math.round(rightPercentage)}%
            </span>
          )}
          <span className="text-sm font-medium text-navy">{rightLabel}</span>
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: rightColor }}
          />
        </div>
      </div>

      {/* Bar */}
      <div className="relative h-4 bg-navy/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: '50%' }}
          animate={{ width: `${leftPercentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute left-0 top-0 bottom-0 rounded-l-full"
          style={{ backgroundColor: leftColor }}
        />
        <motion.div
          initial={{ width: '50%' }}
          animate={{ width: `${rightPercentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute right-0 top-0 bottom-0 rounded-r-full"
          style={{ backgroundColor: rightColor }}
        />
      </div>
    </div>
  );
};
