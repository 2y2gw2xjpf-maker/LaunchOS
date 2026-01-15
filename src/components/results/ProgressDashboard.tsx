import * as React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, Target, TrendingUp, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { CircularProgress } from '@/components/charts/CircularProgress';
import { Progress } from '@/components/ui/progress';
import type { ActionPlan, TaskProgressSummary, PhaseProgressSummary } from '@/types';

interface ProgressDashboardProps {
  actionPlan: ActionPlan;
  completedTasks: string[];
  className?: string;
}

export const ProgressDashboard = ({
  actionPlan,
  completedTasks,
  className,
}: ProgressDashboardProps) => {
  // Calculate overall progress
  const totalTasks = actionPlan.phases.reduce((sum, phase) => sum + phase.tasks.length, 0);
  const completedCount = completedTasks.length;
  const overallProgress = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

  // Calculate estimated hours
  const totalEstimatedHours = actionPlan.phases.reduce(
    (sum, phase) => sum + phase.tasks.reduce((s, t) => s + t.estimatedHours, 0),
    0
  );
  const completedHours = actionPlan.phases.reduce(
    (sum, phase) =>
      sum +
      phase.tasks
        .filter((t) => completedTasks.includes(t.id))
        .reduce((s, t) => s + t.estimatedHours, 0),
    0
  );
  const remainingHours = totalEstimatedHours - completedHours;

  // Calculate phase progress
  const phaseProgress: PhaseProgressSummary[] = actionPlan.phases.map((phase, index) => {
    const phaseCompleted = phase.tasks.filter((t) => completedTasks.includes(t.id)).length;
    const phaseTotal = phase.tasks.length;
    const phaseEstimated = phase.tasks.reduce((s, t) => s + t.estimatedHours, 0);
    const phaseCompletedHours = phase.tasks
      .filter((t) => completedTasks.includes(t.id))
      .reduce((s, t) => s + t.estimatedHours, 0);

    return {
      phaseName: phase.title,
      phaseIndex: index,
      totalTasks: phaseTotal,
      completedTasks: phaseCompleted,
      completionPercentage: phaseTotal > 0 ? (phaseCompleted / phaseTotal) * 100 : 0,
      estimatedTotalHours: phaseEstimated,
      actualTotalHours: phaseCompletedHours,
      remainingHours: phaseEstimated - phaseCompletedHours,
    };
  });

  // Calculate milestones
  const allMilestones = actionPlan.phases.flatMap((phase, idx) =>
    phase.milestones.map((m) => ({
      name: m,
      phaseIndex: idx,
      phaseComplete: phaseProgress[idx].completionPercentage === 100,
    }))
  );
  const completedMilestones = allMilestones.filter((m) => m.phaseComplete).length;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Main Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-soft"
      >
        <h3 className="font-display font-semibold text-lg text-navy mb-6">
          Gesamtfortschritt
        </h3>

        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Circular Progress */}
          <CircularProgress
            value={overallProgress}
            size="lg"
            sublabel="erledigt"
          />

          {/* Stats Grid */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            <StatCard
              icon={<CheckCircle2 className="w-5 h-5 text-sage" />}
              label="Tasks erledigt"
              value={`${completedCount}/${totalTasks}`}
              subvalue={`${Math.round(overallProgress)}%`}
            />
            <StatCard
              icon={<Clock className="w-5 h-5 text-gold" />}
              label="Stunden verbleibend"
              value={`${remainingHours}h`}
              subvalue={`von ${totalEstimatedHours}h`}
            />
            <StatCard
              icon={<Target className="w-5 h-5 text-navy" />}
              label="Meilensteine"
              value={`${completedMilestones}/${allMilestones.length}`}
              subvalue="erreicht"
            />
            <StatCard
              icon={<Calendar className="w-5 h-5 text-charcoal/60" />}
              label="Phasen"
              value={`${phaseProgress.filter((p) => p.completionPercentage === 100).length}/${
                phaseProgress.length
              }`}
              subvalue="abgeschlossen"
            />
          </div>
        </div>
      </motion.div>

      {/* Phase Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-soft"
      >
        <h3 className="font-display font-semibold text-lg text-navy mb-4">
          Fortschritt nach Phase
        </h3>

        <div className="space-y-4">
          {phaseProgress.map((phase, index) => (
            <PhaseProgressBar key={index} phase={phase} index={index} />
          ))}
        </div>
      </motion.div>

      {/* Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-soft"
      >
        <h3 className="font-display font-semibold text-lg text-navy mb-4">
          Meilensteine
        </h3>

        <div className="grid gap-2">
          {allMilestones.map((milestone, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg transition-colors',
                milestone.phaseComplete ? 'bg-sage/10' : 'bg-navy/5'
              )}
            >
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center',
                  milestone.phaseComplete ? 'bg-sage text-white' : 'bg-navy/20 text-navy'
                )}
              >
                {milestone.phaseComplete ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-bold">{milestone.phaseIndex + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  'text-sm',
                  milestone.phaseComplete ? 'text-sage font-medium' : 'text-charcoal/70'
                )}
              >
                {milestone.name}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subvalue?: string;
}

const StatCard = ({ icon, label, value, subvalue }: StatCardProps) => (
  <div className="flex items-start gap-3 p-3 rounded-xl bg-navy/5">
    <div className="mt-0.5">{icon}</div>
    <div>
      <p className="text-xs text-charcoal/60">{label}</p>
      <p className="text-lg font-bold text-navy">{value}</p>
      {subvalue && <p className="text-xs text-charcoal/40">{subvalue}</p>}
    </div>
  </div>
);

// Phase Progress Bar Component
interface PhaseProgressBarProps {
  phase: PhaseProgressSummary;
  index: number;
}

const PhaseProgressBar = ({ phase, index }: PhaseProgressBarProps) => {
  const isComplete = phase.completionPercentage === 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
              isComplete ? 'bg-sage text-white' : 'bg-navy/10 text-navy'
            )}
          >
            {isComplete ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
          </span>
          <span className="text-sm font-medium text-navy">{phase.phaseName}</span>
        </div>
        <span className="text-sm text-charcoal/60">
          {phase.completedTasks}/{phase.totalTasks} Tasks
        </span>
      </div>

      <Progress
        value={phase.completionPercentage}
        variant={isComplete ? 'sage' : 'default'}
        size="sm"
      />

      <div className="flex justify-between text-xs text-charcoal/40">
        <span>{Math.round(phase.completionPercentage)}% erledigt</span>
        <span>{phase.remainingHours}h verbleibend</span>
      </div>
    </div>
  );
};
