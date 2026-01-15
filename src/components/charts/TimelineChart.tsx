import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import type { ActionPhase } from '@/types';

interface TimelineChartProps {
  phases: ActionPhase[];
  currentPhase?: number;
  className?: string;
}

export const TimelineChart = ({
  phases,
  currentPhase = 0,
  className,
}: TimelineChartProps) => {
  return (
    <div className={cn('w-full', className)}>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-navy/10" />

        {/* Phases */}
        <div className="space-y-6">
          {phases.map((phase, index) => {
            const isActive = index === currentPhase;
            const isCompleted = index < currentPhase;

            return (
              <motion.div
                key={phase.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-16"
              >
                {/* Marker */}
                <div
                  className={cn(
                    'absolute left-4 w-5 h-5 rounded-full border-2 transition-colors',
                    isCompleted
                      ? 'bg-sage border-sage'
                      : isActive
                      ? 'bg-navy border-navy'
                      : 'bg-white border-navy/20'
                  )}
                />

                {/* Content */}
                <div
                  className={cn(
                    'p-4 rounded-2xl border-2 transition-colors',
                    isActive
                      ? 'border-navy bg-navy/5'
                      : isCompleted
                      ? 'border-sage/30 bg-sage/5'
                      : 'border-navy/10 bg-white'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-display font-semibold text-navy">
                      {phase.title}
                    </h4>
                    <span className="text-sm text-charcoal/50">{phase.duration}</span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-charcoal/50">Budget:</span>
                      <span className="font-mono text-navy">
                        {phase.budget.min.toLocaleString('de-DE')} -{' '}
                        {phase.budget.max.toLocaleString('de-DE')} {phase.budget.currency}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-charcoal/50">Zeit/Woche:</span>
                      <span className="font-mono text-navy">
                        {phase.timePerWeek.min}-{phase.timePerWeek.max}h
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-charcoal/50">Tasks:</span>
                      <span className="font-mono text-navy">{phase.tasks.length}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
