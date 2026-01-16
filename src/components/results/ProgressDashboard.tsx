import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  CheckCircle2,
  Target,
  TrendingUp,
  Calendar,
  Flag,
  Zap,
  Award,
} from 'lucide-react';
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
      phaseName: phase.title,
      phaseComplete: phaseProgress[idx].completionPercentage === 100,
    }))
  );
  const completedMilestones = allMilestones.filter((m) => m.phaseComplete).length;

  // Find current phase
  const currentPhaseIndex = phaseProgress.findIndex((p) => p.completionPercentage < 100);
  const currentPhase = currentPhaseIndex >= 0 ? phaseProgress[currentPhaseIndex] : null;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Main Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-3xl font-bold">{completedCount}</span>
          </div>
          <p className="text-white/80 text-sm">von {totalTasks} Tasks erledigt</p>
          <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-white rounded-full"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 text-white"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-3xl font-bold">{remainingHours}h</span>
          </div>
          <p className="text-white/80 text-sm">verbleibende Stunden</p>
          <p className="text-white/60 text-xs mt-1">{completedHours}h von {totalEstimatedHours}h erledigt</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 text-white"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Flag className="w-5 h-5" />
            </div>
            <span className="text-3xl font-bold">{completedMilestones}</span>
          </div>
          <p className="text-white/80 text-sm">von {allMilestones.length} Meilensteinen</p>
          <p className="text-white/60 text-xs mt-1">erreicht</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-3xl font-bold">
              {phaseProgress.filter((p) => p.completionPercentage === 100).length}
            </span>
          </div>
          <p className="text-white/80 text-sm">von {phaseProgress.length} Phasen</p>
          <p className="text-white/60 text-xs mt-1">abgeschlossen</p>
        </motion.div>
      </div>

      {/* Current Phase Highlight */}
      {currentPhase && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-white border-2 border-purple-200 shadow-lg shadow-purple-500/10"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                {currentPhaseIndex + 1}
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">Aktuelle Phase</p>
                <h3 className="font-display font-semibold text-lg text-charcoal">{currentPhase.phaseName}</h3>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600">{Math.round(currentPhase.completionPercentage)}%</p>
              <p className="text-sm text-charcoal/50">abgeschlossen</p>
            </div>
          </div>

          <Progress
            value={currentPhase.completionPercentage}
            size="md"
            className="mb-3"
          />

          <div className="flex items-center justify-between text-sm text-charcoal/60">
            <span>{currentPhase.completedTasks} von {currentPhase.totalTasks} Tasks erledigt</span>
            <span>{currentPhase.remainingHours}h verbleibend</span>
          </div>
        </motion.div>
      )}

      {/* Phase Progress Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl bg-white border-2 border-purple-100"
      >
        <h3 className="font-display font-semibold text-lg text-charcoal mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Fortschritt nach Phase
        </h3>

        <div className="space-y-4">
          {phaseProgress.map((phase, index) => {
            const isComplete = phase.completionPercentage === 100;
            const isCurrent = currentPhaseIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all',
                  isComplete
                    ? 'border-green-200 bg-green-50/50'
                    : isCurrent
                    ? 'border-purple-300 bg-purple-50/50'
                    : 'border-gray-100 bg-gray-50/30'
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center font-bold',
                      isComplete
                        ? 'bg-green-100 text-green-600'
                        : isCurrent
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                        : 'bg-gray-100 text-gray-500'
                    )}
                  >
                    {isComplete ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-charcoal">{phase.phaseName}</span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            Aktuell
                          </span>
                        )}
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

                    <div className="flex justify-between mt-2 text-xs text-charcoal/40">
                      <span>{Math.round(phase.completionPercentage)}%</span>
                      <span>{phase.remainingHours}h verbleibend</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Milestone Journey */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100"
      >
        <h3 className="font-display font-semibold text-lg text-charcoal mb-2 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" />
          Deine Meilenstein-Reise
        </h3>
        <p className="text-sm text-charcoal/60 mb-6">
          Verfolge deinen Fortschritt durch alle wichtigen Meilensteine deines Action Plans
        </p>

        {/* Milestone Visual Track */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 via-pink-300 to-purple-300" />

          <div className="space-y-4">
            {allMilestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className={cn(
                  'relative flex items-start gap-4 p-4 rounded-xl transition-all',
                  milestone.phaseComplete
                    ? 'bg-gradient-to-r from-green-100/80 to-emerald-100/80'
                    : 'bg-white/60'
                )}
              >
                {/* Milestone Marker */}
                <div
                  className={cn(
                    'relative z-10 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                    milestone.phaseComplete
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                      : 'bg-white border-2 border-purple-200 text-purple-500'
                  )}
                >
                  {milestone.phaseComplete ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Target className="w-5 h-5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        milestone.phaseComplete
                          ? 'bg-green-200 text-green-800'
                          : 'bg-purple-100 text-purple-700'
                      )}
                    >
                      Phase {milestone.phaseIndex + 1}
                    </span>
                  </div>
                  <p
                    className={cn(
                      'font-medium',
                      milestone.phaseComplete ? 'text-green-800' : 'text-charcoal'
                    )}
                  >
                    {milestone.name}
                  </p>
                  <p className="text-xs text-charcoal/50 mt-0.5">{milestone.phaseName}</p>
                </div>

                {/* Status */}
                {milestone.phaseComplete && (
                  <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <Zap className="w-4 h-4" />
                    Erreicht
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Achievement Summary */}
        {completedMilestones > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 p-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center"
          >
            <p className="text-white/80 text-sm mb-1">Du hast bereits</p>
            <p className="text-2xl font-bold">{completedMilestones} von {allMilestones.length} Meilensteinen</p>
            <p className="text-white/80 text-sm">erreicht - weiter so!</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
