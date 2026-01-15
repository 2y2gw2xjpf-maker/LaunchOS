import * as React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Briefcase, GitMerge } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { RecommendedRoute } from '@/types';

interface RecommendationBadgeProps {
  route: RecommendedRoute;
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const routeConfig: Record<
  RecommendedRoute,
  { label: string; icon: typeof Rocket; color: string; bgColor: string }
> = {
  bootstrap: {
    label: 'Bootstrap',
    icon: Rocket,
    color: '#4A7C59',
    bgColor: 'rgba(74, 124, 89, 0.1)',
  },
  investor: {
    label: 'Investor',
    icon: Briefcase,
    color: '#F5A623',
    bgColor: 'rgba(245, 166, 35, 0.1)',
  },
  hybrid: {
    label: 'Hybrid',
    icon: GitMerge,
    color: '#0A1628',
    bgColor: 'rgba(10, 22, 40, 0.1)',
  },
};

export const RecommendationBadge = ({
  route,
  score,
  size = 'md',
  className,
}: RecommendationBadgeProps) => {
  const config = routeConfig[route];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'inline-flex items-center gap-3 rounded-2xl font-semibold',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: config.bgColor, color: config.color }}
    >
      <Icon className={iconSizes[size]} />
      <span>{config.label}</span>
      <span
        className="font-mono px-2 py-0.5 rounded-lg"
        style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}
      >
        {score}%
      </span>
    </motion.div>
  );
};
