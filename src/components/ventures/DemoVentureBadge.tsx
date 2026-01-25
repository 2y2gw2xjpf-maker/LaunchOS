/**
 * DemoVentureBadge Component
 * Visueller Badge zur Kennzeichnung von Demo-Ventures
 */

import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface DemoVentureBadgeProps {
  size?: 'small' | 'default' | 'large';
  className?: string;
}

export function DemoVentureBadge({ size = 'default', className }: DemoVentureBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full',
        'bg-amber-100 text-amber-700 border border-amber-200',
        size === 'small' && 'px-1.5 py-0.5 text-[10px]',
        size === 'default' && 'px-2 py-1 text-xs',
        size === 'large' && 'px-3 py-1.5 text-sm',
        className
      )}
    >
      <Sparkles
        className={cn(
          size === 'small' && 'w-2.5 h-2.5',
          size === 'default' && 'w-3 h-3',
          size === 'large' && 'w-4 h-4'
        )}
      />
      Demo
    </span>
  );
}

export default DemoVentureBadge;
