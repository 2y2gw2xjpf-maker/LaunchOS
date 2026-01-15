import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Card, Button, Progress } from '@/components/ui';
import { CurrencyDisplay } from '@/components/common';
import { useStore } from '@/store';
import type { ActionPlan, ActionPhase, ActionTask } from '@/types';

interface ActionPlanTimelineProps {
  plan: ActionPlan;
}

export const ActionPlanTimeline = ({ plan }: ActionPlanTimelineProps) => {
  const [expandedPhase, setExpandedPhase] = React.useState<number | null>(0);
  const { completedTasks, toggleTaskComplete, getPhaseCompletionRate } = useStore();

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="p-6">
        <div className="grid sm:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-charcoal/60 mb-1">Gesamtdauer</p>
            <p className="font-display text-xl font-semibold text-navy">{plan.totalDuration}</p>
          </div>
          <div>
            <p className="text-sm text-charcoal/60 mb-1">Gesamtbudget</p>
            <p className="font-mono text-xl font-semibold text-navy">
              {plan.totalBudget.min.toLocaleString('de-DE')} - {plan.totalBudget.max.toLocaleString('de-DE')} €
            </p>
          </div>
          <div>
            <p className="text-sm text-charcoal/60 mb-1">Phasen</p>
            <p className="font-display text-xl font-semibold text-navy">{plan.phases.length}</p>
          </div>
        </div>
      </Card>

      {/* Phases */}
      <div className="space-y-4">
        {plan.phases.map((phase, index) => {
          const isExpanded = expandedPhase === index;
          const completionRate = getPhaseCompletionRate(index);
          const isComplete = completionRate === 100;

          return (
            <motion.div
              key={phase.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={cn(
                'overflow-hidden transition-colors',
                isComplete && 'border-sage/30 bg-sage/5'
              )}>
                {/* Phase Header */}
                <button
                  onClick={() => setExpandedPhase(isExpanded ? null : index)}
                  className="w-full p-6 text-left"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        isComplete ? 'bg-sage/20' : 'bg-navy/5'
                      )}>
                        {isComplete ? (
                          <CheckCircle className="w-5 h-5 text-sage" />
                        ) : (
                          <span className="font-semibold text-navy">{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-navy">{phase.title}</h3>
                        <p className="text-sm text-charcoal/60">{phase.duration}</p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      className="text-charcoal/40"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.div>
                  </div>

                  <Progress
                    value={completionRate}
                    variant={isComplete ? 'sage' : 'default'}
                    size="sm"
                  />
                </button>

                {/* Phase Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-navy/10"
                    >
                      <div className="p-6 space-y-6">
                        {/* Budget & Time */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="p-4 bg-navy/5 rounded-xl">
                            <p className="text-sm text-charcoal/60 mb-1">Budget</p>
                            <p className="font-mono font-semibold text-navy">
                              {phase.budget.min.toLocaleString('de-DE')} - {phase.budget.max.toLocaleString('de-DE')} €
                            </p>
                          </div>
                          <div className="p-4 bg-navy/5 rounded-xl">
                            <p className="text-sm text-charcoal/60 mb-1">Zeit pro Woche</p>
                            <p className="font-mono font-semibold text-navy">
                              {phase.timePerWeek.min} - {phase.timePerWeek.max} Stunden
                            </p>
                          </div>
                        </div>

                        {/* Tasks */}
                        <div>
                          <h4 className="font-semibold text-navy mb-3">Aufgaben</h4>
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

                        {/* Milestones */}
                        {phase.milestones.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-navy mb-3">Meilensteine</h4>
                            <ul className="space-y-2">
                              {phase.milestones.map((milestone, i) => (
                                <li key={i} className="flex items-center gap-2 text-charcoal/70">
                                  <CheckCircle className="w-4 h-4 text-sage" />
                                  {milestone}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Resources */}
                        {phase.resources.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-navy mb-3">Ressourcen</h4>
                            <div className="flex flex-wrap gap-2">
                              {phase.resources.map((resource, i) => (
                                <a
                                  key={i}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-navy/5 rounded-lg text-sm hover:bg-navy/10 transition-colors"
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
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Critical Path */}
      {plan.criticalPath.length > 0 && (
        <Card className="p-6 border-gold/30 bg-gold/5">
          <h3 className="font-display font-semibold text-gold-700 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Kritischer Pfad
          </h3>
          <p className="text-sm text-charcoal/70 mb-3">
            Diese Aufgaben sind besonders wichtig und sollten priorisiert werden:
          </p>
          <ol className="list-decimal list-inside space-y-1">
            {plan.criticalPath.map((item, i) => (
              <li key={i} className="text-charcoal/70">{item}</li>
            ))}
          </ol>
        </Card>
      )}
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
    critical: 'bg-red-100 text-red-700',
    high: 'bg-gold/20 text-gold-700',
    medium: 'bg-navy/10 text-navy',
    low: 'bg-navy/5 text-charcoal/60',
  };

  return (
    <div className={cn(
      'p-4 rounded-xl border-2 transition-colors',
      isCompleted ? 'border-sage/30 bg-sage/5' : 'border-navy/10'
    )}>
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={cn(
            'w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
            isCompleted ? 'bg-sage border-sage text-white' : 'border-navy/20 hover:border-navy/40'
          )}
        >
          {isCompleted && <CheckCircle className="w-4 h-4" />}
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              'font-medium',
              isCompleted ? 'line-through text-charcoal/40' : 'text-navy'
            )}>
              {task.title}
            </span>
            <span className={cn('text-xs px-2 py-0.5 rounded-full', priorityColors[task.priority])}>
              {task.priority}
            </span>
          </div>
          <p className={cn(
            'text-sm',
            isCompleted ? 'text-charcoal/30' : 'text-charcoal/60'
          )}>
            {task.description}
          </p>
          {task.tools && task.tools.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tools.map((tool, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-navy/5 rounded text-charcoal/60">
                  {tool}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-charcoal/40">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{task.estimatedHours}h</span>
        </div>
      </div>
    </div>
  );
};
