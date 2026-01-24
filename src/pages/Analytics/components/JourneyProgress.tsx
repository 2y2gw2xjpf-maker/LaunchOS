/**
 * JourneyProgress - Fortschrittsanzeige fuer die Startup-Journey
 */

import { motion } from 'framer-motion';
import { Rocket, CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import type { JourneyProgress as JourneyProgressType } from '@/hooks/useAnalytics';

interface JourneyProgressProps {
  data: JourneyProgressType | null;
  isLoading?: boolean;
}

const PHASES = [
  { id: 0, name: 'Discover', description: 'Idee validieren', color: '#9333ea' },
  { id: 1, name: 'Define', description: 'Strategie entwickeln', color: '#a855f7' },
  { id: 2, name: 'Develop', description: 'Produkt bauen', color: '#c084fc' },
  { id: 3, name: 'Deliver', description: 'Markt launchen', color: '#d946ef' },
  { id: 4, name: 'Scale', description: 'Wachstum skalieren', color: '#ec4899' },
];

function ProgressSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-xl" />
        <div className="flex-1">
          <div className="h-5 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-48 bg-gray-200 rounded mt-2" />
        </div>
      </div>
      <div className="h-4 bg-gray-200 rounded-full" />
      <div className="flex justify-between">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-8 h-8 bg-gray-200 rounded-full" />
        ))}
      </div>
    </div>
  );
}

export function JourneyProgress({ data, isLoading }: JourneyProgressProps) {
  if (isLoading || !data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="bg-white rounded-xl border border-gray-100 p-6"
      >
        <ProgressSkeleton />
      </motion.div>
    );
  }

  const { currentPhase, completedTasks, totalTasks, percentComplete, phaseName } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Journey Progress</h3>
              <p className="text-sm text-gray-500">Dein Fortschritt auf dem Weg zum Erfolg</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{percentComplete}%</p>
            <p className="text-sm text-gray-500">{completedTasks}/{totalTasks} Tasks</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Current Phase */}
        <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: PHASES[currentPhase]?.color || '#9333ea' }}
          >
            <span className="text-white font-bold">{currentPhase + 1}</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">
              Phase {currentPhase + 1}: {phaseName}
            </p>
            <p className="text-sm text-gray-600">
              {PHASES[currentPhase]?.description || 'In Bearbeitung'}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-purple-400" />
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Gesamtfortschritt</span>
            <span className="font-medium text-gray-900">{percentComplete}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentComplete}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
            />
          </div>
        </div>

        {/* Phase Steps */}
        <div className="flex items-center justify-between">
          {PHASES.map((phase, index) => {
            const isCompleted = index < currentPhase;
            const isCurrent = index === currentPhase;

            return (
              <div key={phase.id} className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted
                      ? 'bg-green-500'
                      : isCurrent
                        ? 'bg-purple-500'
                        : 'bg-gray-200'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : isCurrent ? (
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </motion.div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {phase.name}
                </span>

                {/* Connector Line */}
                {index < PHASES.length - 1 && (
                  <div
                    className="absolute h-0.5 w-12"
                    style={{
                      backgroundColor: index < currentPhase ? '#22c55e' : '#e5e7eb',
                      left: `calc(${(index + 0.5) * (100 / PHASES.length)}% + 20px)`,
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{currentPhase + 1}</p>
            <p className="text-xs text-gray-500">Aktuelle Phase</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
            <p className="text-xs text-gray-500">Erledigt</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-400">{totalTasks - completedTasks}</p>
            <p className="text-xs text-gray-500">Offen</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default JourneyProgress;
