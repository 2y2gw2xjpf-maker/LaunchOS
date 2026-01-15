import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface CircularProgressProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  sublabel?: string;
  variant?: 'default' | 'sage' | 'gold';
  className?: string;
}

const sizeConfig = {
  sm: { size: 80, strokeWidth: 6, fontSize: 'text-lg' },
  md: { size: 120, strokeWidth: 8, fontSize: 'text-2xl' },
  lg: { size: 160, strokeWidth: 10, fontSize: 'text-3xl' },
};

const variantColors = {
  default: { stroke: '#1e3a5f', bg: '#1e3a5f20' },
  sage: { stroke: '#7c9a8a', bg: '#7c9a8a20' },
  gold: { stroke: '#d4af37', bg: '#d4af3720' },
};

export const CircularProgress = ({
  value,
  size = 'md',
  showLabel = true,
  label,
  sublabel,
  variant = 'default',
  className,
}: CircularProgressProps) => {
  const config = sizeConfig[size];
  const colors = variantColors[variant];

  const radius = (config.size - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  // Determine color based on value if variant is default
  const getAdaptiveColor = () => {
    if (variant !== 'default') return colors;
    if (value >= 80) return variantColors.sage;
    if (value >= 50) return variantColors.default;
    return variantColors.gold;
  };

  const adaptiveColors = getAdaptiveColor();

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      <svg
        width={config.size}
        height={config.size}
        viewBox={`0 0 ${config.size} ${config.size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          stroke={adaptiveColors.bg}
          strokeWidth={config.strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          stroke={adaptiveColors.stroke}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>

      {/* Center label */}
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className={cn(config.fontSize, 'font-bold text-navy')}
          >
            {Math.round(value)}%
          </motion.span>
          {sublabel && (
            <span className="text-xs text-charcoal/60">{sublabel}</span>
          )}
        </div>
      )}

      {/* Bottom label */}
      {label && (
        <span className="mt-2 text-sm font-medium text-charcoal/70">{label}</span>
      )}
    </div>
  );
};
