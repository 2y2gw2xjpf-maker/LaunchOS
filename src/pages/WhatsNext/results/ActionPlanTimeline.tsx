import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Sparkles,
  MessageCircle,
  Play,
  Flag,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Card, Button, Progress } from '@/components/ui';
import { ProgressDashboard } from '@/components/results';
import { ChatModal } from '@/components/chat';
import { useStore } from '@/store';
import type { ActionPlan, ActionPhase, ActionTask } from '@/types';

interface ActionPlanTimelineProps {
  plan: ActionPlan;
  activeView?: 'timeline' | 'dashboard';
}

export const ActionPlanTimeline = ({ plan, activeView = 'timeline' }: ActionPlanTimelineProps) => {
  const [expandedPhase, setExpandedPhase] = React.useState<number | null>(0);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [chatContext, setChatContext] = React.useState<{ currentStep?: string; pendingTasks?: string[] } | undefined>();
  const { completedTasks, toggleTaskComplete, getPhaseCompletionRate } = useStore();

  // Calculate overall progress for header
  const totalTasks = plan.phases.reduce((sum, phase) => sum + phase.tasks.length, 0);
  const completedCount = completedTasks.length;
  const overallProgress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Find current active phase
  const currentPhaseIndex = plan.phases.findIndex((phase, idx) => {
    const completionRate = getPhaseCompletionRate(idx);
    return completionRate < 100;
  });

  return (
    <div className="space-y-6">
      {/* Progress Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 p-6 text-white"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm mb-1">Dein Fortschritt</p>
            <p className="text-3xl font-bold">{completedCount} von {totalTasks} Tasks</p>
            <p className="text-white/60 text-sm mt-1">
              {overallProgress === 100
                ? 'Alle Aufgaben erledigt!'
                : currentPhaseIndex >= 0
                ? `Aktuell: ${plan.phases[currentPhaseIndex]?.title}`
                : 'Bereit zum Start'}
            </p>
          </div>

          {/* Circular Progress */}
          <div className="w-24 h-24 relative">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="3"
              />
              <motion.path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ strokeDasharray: '0, 100' }}
                animate={{ strokeDasharray: `${overallProgress}, 100` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
              {overallProgress}%
            </span>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-pink-500/20 rounded-full blur-xl" />
      </motion.div>

      {/* AI Assistant Hint */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-purple-900">KI-Assistent verfugbar</p>
          <p className="text-sm text-purple-700/70">
            Brauchst du Hilfe bei einem Meilenstein? Der KI-Assistent kann dich bei der Umsetzung unterstutzen.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="flex-shrink-0"
          onClick={() => {
            const pendingTasks = plan.phases
              .flatMap(p => p.tasks)
              .filter(t => !completedTasks.includes(t.id))
              .slice(0, 5)
              .map(t => t.title);
            setChatContext({
              currentStep: currentPhaseIndex >= 0 ? plan.phases[currentPhaseIndex]?.title : undefined,
              pendingTasks,
            });
            setIsChatOpen(true);
          }}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Chat starten
        </Button>
      </motion.div>

      {/* Chat Modal */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        journeyContext={chatContext}
      />

      {/* Dashboard View */}
      {activeView === 'dashboard' && (
        <ProgressDashboard actionPlan={plan} completedTasks={completedTasks} />
      )}

      {/* Timeline View */}
      {activeView === 'timeline' && (
        <>
          {/* Summary Cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-5 rounded-xl bg-white border-2 border-purple-100 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-500/5 transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-charcoal/60">Gesamtdauer</span>
              </div>
              <p className="font-display text-2xl font-bold text-charcoal">{plan.totalDuration}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="p-5 rounded-xl bg-white border-2 border-purple-100 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-500/5 transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-pink-600" />
                </div>
                <span className="text-sm text-charcoal/60">Budget</span>
              </div>
              <p className="font-mono text-xl font-bold text-charcoal">
                {plan.totalBudget.min.toLocaleString('de-DE')} - {plan.totalBudget.max.toLocaleString('de-DE')} €
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-5 rounded-xl bg-white border-2 border-purple-100 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-500/5 transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Flag className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-charcoal/60">Phasen</span>
              </div>
              <p className="font-display text-2xl font-bold text-charcoal">{plan.phases.length}</p>
            </motion.div>
          </div>

          {/* Phases */}
          <div className="space-y-4">
            {plan.phases.map((phase, index) => {
              const isExpanded = expandedPhase === index;
              const completionRate = getPhaseCompletionRate(index);
              const isComplete = completionRate === 100;
              const isCurrent = currentPhaseIndex === index;

              return (
                <motion.div
                  key={phase.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div
                    className={cn(
                      'rounded-2xl border-2 overflow-hidden transition-all',
                      isComplete
                        ? 'border-green-200 bg-green-50/30'
                        : isCurrent
                        ? 'border-purple-300 bg-white shadow-lg shadow-purple-500/10'
                        : 'border-purple-100 bg-white'
                    )}
                  >
                    {/* Phase Header */}
                    <button
                      onClick={() => setExpandedPhase(isExpanded ? null : index)}
                      className="w-full p-6 text-left"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              'w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg',
                              isComplete
                                ? 'bg-green-100 text-green-600'
                                : isCurrent
                                ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                                : 'bg-purple-100 text-purple-600'
                            )}
                          >
                            {isComplete ? (
                              <CheckCircle className="w-6 h-6" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-display font-semibold text-lg text-charcoal">
                                {phase.title}
                              </h3>
                              {isCurrent && !isComplete && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                  Aktuell
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-charcoal/60">{phase.duration}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-charcoal">
                              {phase.tasks.filter((t) => completedTasks.includes(t.id)).length}/{phase.tasks.length}
                            </p>
                            <p className="text-xs text-charcoal/50">Tasks</p>
                          </div>
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            className="text-charcoal/40"
                          >
                            <ChevronDown className="w-5 h-5" />
                          </motion.div>
                        </div>
                      </div>

                      <Progress
                        value={completionRate}
                        variant={isComplete ? 'sage' : 'default'}
                        size="sm"
                        className="mt-2"
                      />
                    </button>

                    {/* Phase Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-purple-100"
                        >
                          <div className="p-6 space-y-6">
                            {/* Budget & Time */}
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl">
                                <p className="text-sm text-purple-700/70 mb-1">Budget</p>
                                <p className="font-mono font-semibold text-purple-900">
                                  {phase.budget.min.toLocaleString('de-DE')} - {phase.budget.max.toLocaleString('de-DE')} €
                                </p>
                              </div>
                              <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-xl">
                                <p className="text-sm text-pink-700/70 mb-1">Zeit pro Woche</p>
                                <p className="font-mono font-semibold text-pink-900">
                                  {phase.timePerWeek.min} - {phase.timePerWeek.max} Stunden
                                </p>
                              </div>
                            </div>

                            {/* Tasks */}
                            <div>
                              <h4 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-purple-600" />
                                Aufgaben
                              </h4>
                              <div className="space-y-3">
                                {phase.tasks.map((task) => (
                                  <TaskItem
                                    key={task.id}
                                    task={task}
                                    isCompleted={completedTasks.includes(task.id)}
                                    onToggle={() => toggleTaskComplete(task.id)}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Milestones - Innovative Visual Display */}
                            {phase.milestones.length > 0 && (
                              <MilestoneVisualizer
                                milestones={phase.milestones}
                                phaseComplete={isComplete}
                                phaseIndex={index}
                                onMilestoneClick={(milestone) => {
                                  setChatContext({
                                    currentStep: `${phase.title}: ${milestone}`,
                                    pendingTasks: [milestone],
                                  });
                                  setIsChatOpen(true);
                                }}
                              />
                            )}

                            {/* Resources */}
                            {phase.resources.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-charcoal mb-3">Ressourcen</h4>
                                <div className="flex flex-wrap gap-2">
                                  {phase.resources.map((resource, i) => (
                                    <a
                                      key={i}
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-lg text-sm text-purple-700 hover:border-purple-300 hover:shadow-sm transition-all"
                                    >
                                      {resource.name}
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Critical Path */}
          {plan.criticalPath.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50"
            >
              <h3 className="font-display font-semibold text-amber-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Kritischer Pfad
              </h3>
              <p className="text-sm text-amber-700/80 mb-4">
                Diese Aufgaben sind besonders wichtig und sollten priorisiert werden:
              </p>
              <div className="space-y-2">
                {plan.criticalPath.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-white/60 rounded-lg"
                  >
                    <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </span>
                    <span className="text-amber-900">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

// Milestone Visualizer Component
const MilestoneVisualizer = ({
  milestones,
  phaseComplete,
  phaseIndex,
  onMilestoneClick,
}: {
  milestones: string[];
  phaseComplete: boolean;
  phaseIndex: number;
  onMilestoneClick?: (milestone: string) => void;
}) => {
  return (
    <div className="relative">
      <h4 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
        <Flag className="w-4 h-4 text-pink-600" />
        Meilensteine dieser Phase
      </h4>

      {/* Visual Milestone Track */}
      <div className="relative">
        {/* Track Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-200 via-pink-200 to-purple-200" />

        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'relative flex items-start gap-4 p-4 rounded-xl transition-all cursor-pointer group',
                phaseComplete
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
                  : 'bg-gradient-to-r from-purple-50/50 to-pink-50/50 border border-purple-100 hover:border-purple-200 hover:shadow-md'
              )}
            >
              {/* Milestone Marker */}
              <div
                className={cn(
                  'relative z-10 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110',
                  phaseComplete
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                    : 'bg-gradient-to-br from-purple-400 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                )}
              >
                {phaseComplete ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <span className="text-lg font-bold">{index + 1}</span>
                )}
              </div>

              {/* Milestone Content */}
              <div className="flex-1 pt-1">
                <p
                  className={cn(
                    'font-medium',
                    phaseComplete ? 'text-green-800' : 'text-charcoal'
                  )}
                >
                  {milestone}
                </p>
                {!phaseComplete && (
                  <p className="text-sm text-charcoal/50 mt-1">
                    Klicke hier um mit dem KI-Assistenten an diesem Meilenstein zu arbeiten
                  </p>
                )}
              </div>

              {/* Action Button */}
              {!phaseComplete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMilestoneClick?.(milestone);
                  }}
                >
                  <Play className="w-4 h-4 mr-1" />
                  Starten
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TaskItem = ({
  task,
  isCompleted,
  onToggle,
}: {
  task: ActionTask;
  isCompleted: boolean;
  onToggle: () => void;
}) => {
  const priorityColors = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    high: 'bg-amber-100 text-amber-700 border-amber-200',
    medium: 'bg-purple-100 text-purple-700 border-purple-200',
    low: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <motion.div
      layout
      className={cn(
        'p-4 rounded-xl border-2 transition-all',
        isCompleted
          ? 'border-green-200 bg-green-50/50'
          : 'border-purple-100 bg-white hover:border-purple-200 hover:shadow-sm'
      )}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={cn(
            'w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
            isCompleted
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-purple-300 hover:border-purple-500 hover:bg-purple-50'
          )}
        >
          {isCompleted && <CheckCircle className="w-4 h-4" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={cn(
                'font-medium',
                isCompleted ? 'line-through text-charcoal/40' : 'text-charcoal'
              )}
            >
              {task.title}
            </span>
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full border',
                priorityColors[task.priority]
              )}
            >
              {task.priority}
            </span>
          </div>
          <p
            className={cn(
              'text-sm',
              isCompleted ? 'text-charcoal/30' : 'text-charcoal/60'
            )}
          >
            {task.description}
          </p>
          {task.tools && task.tools.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tools.map((tool, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 bg-purple-50 border border-purple-100 rounded text-purple-600"
                >
                  {tool}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-charcoal/40 flex-shrink-0">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{task.estimatedHours}h</span>
        </div>
      </div>
    </motion.div>
  );
};
