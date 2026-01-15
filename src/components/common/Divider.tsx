import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface DividerProps {
  label?: string;
  className?: string;
}

export const Divider = ({ label, className }: DividerProps) => {
  if (label) {
    return (
      <div className={cn('flex items-center gap-4 my-6', className)}>
        <div className="flex-1 h-px bg-brand-100" />
        <span className="text-sm text-charcoal/40 font-medium">{label}</span>
        <div className="flex-1 h-px bg-brand-100" />
      </div>
    );
  }

  return <div className={cn('h-px bg-brand-100 my-6', className)} />;
};
