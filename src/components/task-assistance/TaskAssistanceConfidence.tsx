import * as React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Tooltip } from '@/components/ui';
import type { Assumption } from '@/types';

interface TaskAssistanceConfidenceProps {
  confidence: number;
  assumptions: Assumption[];
  label?: string;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TaskAssistanceConfidence = ({
  confidence,
  assumptions,
  label = 'Confidence',
  showDetails = true,
  size = 'md',
}: TaskAssistanceConfidenceProps) => {
  const getConfidenceLevel = () => {
    if (confidence >= 85)
      return { level: 'high', color: 'sage', icon: CheckCircle2, label: 'Hohe Sicherheit' };
    if (confidence >= 60)
      return { level: 'medium', color: 'gold', icon: AlertTriangle, label: 'Mit Annahmen' };
    return { level: 'low', color: 'red', icon: XCircle, label: 'Viele Unsicherheiten' };
  };

  const { color, icon: Icon, label: levelLabel } = getConfidenceLevel();

  const colorClasses = {
    sage: 'text-sage bg-sage/10 border-sage/30',
    gold: 'text-gold bg-gold/10 border-gold/30',
    red: 'text-red-500 bg-red-50 border-red-200',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const highImpactAssumptions = assumptions.filter((a) => a.impact === 'high');
  const mediumImpactAssumptions = assumptions.filter((a) => a.impact === 'medium');

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-xl border',
        colorClasses[color as keyof typeof colorClasses],
        sizeClasses[size]
      )}
    >
      <Icon className={cn(size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4')} />

      <div className="flex flex-col">
        <span className="text-[10px] font-medium uppercase tracking-wide opacity-70">
          {label}
        </span>
        <span className={cn('font-bold', size === 'lg' ? 'text-xl' : 'text-lg')}>
          {confidence}%
        </span>
      </div>

      <span className={cn('font-medium', size === 'sm' ? 'text-[10px]' : 'text-xs')}>
        {levelLabel}
      </span>

      {showDetails && assumptions.length > 0 && (
        <Tooltip
          content={
            <div className="max-w-xs space-y-3">
              <p className="font-medium text-sm">Annahmen in diesem Ergebnis:</p>

              {highImpactAssumptions.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-red-400 mb-1">Hoher Impact:</p>
                  <ul className="text-xs space-y-1">
                    {highImpactAssumptions.map((a) => (
                      <li key={a.id} className="flex items-start gap-1">
                        <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                        <span>{a.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {mediumImpactAssumptions.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gold mb-1">Mittlerer Impact:</p>
                  <ul className="text-xs space-y-1">
                    {mediumImpactAssumptions.map((a) => (
                      <li key={a.id} className="flex items-start gap-1">
                        <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                        <span>{a.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          }
        >
          <button className="ml-1 p-1 hover:bg-white/20 rounded transition-colors">
            <Info className={cn(size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')} />
          </button>
        </Tooltip>
      )}
    </div>
  );
};
