import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface ScoreGaugeProps {
  value: number;
  max?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  variant?: 'default' | 'sage' | 'gold';
  className?: string;
}

export const ScoreGauge = ({
  value,
  max = 100,
  label,
  size = 'md',
  showValue = true,
  variant = 'default',
  className,
}: ScoreGaugeProps) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeConfig = {
    sm: { width: 100, height: 100, strokeWidth: 8, fontSize: 'text-xl' },
    md: { width: 150, height: 150, strokeWidth: 10, fontSize: 'text-3xl' },
    lg: { width: 200, height: 200, strokeWidth: 12, fontSize: 'text-4xl' },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = radius * Math.PI * 2;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const variantColors = {
    default: '#0A1628',
    sage: '#4A7C59',
    gold: '#F5A623',
  };

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative" style={{ width: config.width, height: config.height }}>
        <svg
          width={config.width}
          height={config.height}
          viewBox={`0 0 ${config.width} ${config.height}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={config.width / 2}
            cy={config.height / 2}
            r={radius}
            stroke="rgba(10, 22, 40, 0.1)"
            strokeWidth={config.strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <motion.circle
            cx={config.width / 2}
            cy={config.height / 2}
            r={radius}
            stroke={variantColors[variant]}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            fill="none"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            strokeDasharray={circumference}
          />
        </svg>

        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className={cn('font-mono font-bold text-navy', config.fontSize)}
            >
              {Math.round(value)}
            </motion.span>
          </div>
        )}
      </div>

      {label && (
        <span className="mt-3 text-sm font-medium text-charcoal/60">{label}</span>
      )}
    </div>
  );
};
