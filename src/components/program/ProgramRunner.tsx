/**
 * LaunchOS Program Runner
 * UI fuer das Ausfuehren von automatisierten Programmen
 */

import { useEffect, useState } from 'react';
import { useProgram } from '@/hooks/useProgram';
import type { ProgramTemplate } from '@/hooks/useProgram';
import { useOptionalVentureContext } from '@/contexts/VentureContext';
import {
  Play, Pause, X, Check, Loader2,
  Rocket, AlertCircle, Clock
} from 'lucide-react';

interface ProgramRunnerProps {
  isOpen: boolean;
  onClose: () => void;
  initialProgram?: string;
}

export function ProgramRunner({ isOpen, onClose, initialProgram }: ProgramRunnerProps) {
  const {
    templates,
    activeExecution,
    isLoading,
    isExecuting,
    error,
    startProgram,
    pauseProgram,
    resumeProgram,
    cancelProgram,
    executeNextStep,
  } = useProgram();
  const ventureContext = useOptionalVentureContext();
  const activeVenture = ventureContext?.activeVenture;
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(initialProgram || null);
  const [autoExecute, setAutoExecute] = useState(true);

  // Auto-execute steps when running
  useEffect(() => {
    if (!autoExecute || !activeExecution || activeExecution.status !== 'running' || isExecuting) {
      return;
    }

    const timer = setTimeout(() => {
      executeNextStep();
    }, 1500); // 1.5 second delay between steps

    return () => clearTimeout(timer);
  }, [activeExecution, autoExecute, isExecuting, executeNextStep]);

  const handleStart = async () => {
    if (!selectedTemplate) return;
    await startProgram(selectedTemplate);
  };

  const handleCancel = async () => {
    if (confirm('Programm wirklich abbrechen? Der Fortschritt geht verloren.')) {
      await cancelProgram();
    }
  };

  if (!isOpen) return null;

  const currentTemplate = activeExecution?.template ||
    templates.find(t => t.slug === selectedTemplate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-purple-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {activeExecution ? 'Programm laeuft' : 'Programm starten'}
              </h2>
              {activeVenture && (
                <p className="text-sm text-gray-500">fuer {activeVenture.name}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* No Active Execution - Select Template */}
          {!activeExecution && (
            <>
              <p className="text-gray-600 mb-6">
                Waehle ein Programm das automatisch mehrere Schritte fuer dich ausfuehrt:
              </p>

              <div className="space-y-3 mb-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                  </div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Keine Programme verfuegbar
                  </div>
                ) : (
                  templates.map((template) => (
                    <button
                      key={template.slug}
                      onClick={() => setSelectedTemplate(template.slug)}
                      className={`w-full p-4 rounded-xl border text-left transition-all ${
                        selectedTemplate === template.slug
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{template.title}</h3>
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {template.estimatedDuration}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{template.steps.length} Schritte</span>
                        <span>-</span>
                        <span>{template.targetStage?.join(', ')}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <button
                onClick={handleStart}
                disabled={!selectedTemplate || isLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Programm starten
              </button>
            </>
          )}

          {/* Active Execution - Show Progress */}
          {activeExecution && currentTemplate && (
            <>
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {currentTemplate.title}
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round(activeExecution.progress)}%
                  </span>
                </div>
                <div className="h-3 bg-purple-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${activeExecution.progress}%` }}
                  />
                </div>
              </div>

              {/* Steps List */}
              <div className="space-y-3 mb-6">
                {currentTemplate.steps.map((step, index) => {
                  const isCompleted = activeExecution.stepsCompleted.some(
                    s => s.step_index === index
                  );
                  const isCurrent = index === activeExecution.currentStep;
                  const isPending = index > activeExecution.currentStep;

                  return (
                    <div
                      key={step.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrent
                          ? 'border-purple-500 bg-purple-50'
                          : isCompleted
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isCurrent
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {isCompleted ? (
                            <Check className="w-4 h-4" />
                          ) : isCurrent && isExecuting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <span className="text-sm font-medium">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-medium ${
                            isPending ? 'text-gray-400' : 'text-gray-900'
                          }`}>
                            {step.title}
                          </h4>
                          <p className={`text-sm ${
                            isPending ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            {step.description}
                          </p>
                        </div>
                        {isCurrent && activeExecution.status === 'running' && (
                          <div className="text-purple-500 text-sm font-medium">
                            In Arbeit...
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Controls */}
              <div className="flex gap-3">
                {activeExecution.status === 'running' ? (
                  <>
                    <button
                      onClick={() => pauseProgram()}
                      className="flex-1 py-3 border border-purple-200 text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Pause className="w-5 h-5" />
                      Pausieren
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-6 py-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </>
                ) : activeExecution.status === 'paused' ? (
                  <>
                    <button
                      onClick={() => resumeProgram()}
                      className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      Fortsetzen
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-6 py-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </>
                ) : activeExecution.status === 'completed' ? (
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Fertig! Ergebnisse ansehen
                  </button>
                ) : null}
              </div>

              {/* Auto-Execute Toggle */}
              {activeExecution.status === 'running' && (
                <label className="flex items-center gap-2 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoExecute}
                    onChange={(e) => setAutoExecute(e.target.checked)}
                    className="w-4 h-4 text-purple-500 rounded"
                  />
                  <span className="text-sm text-gray-600">
                    Schritte automatisch ausfuehren
                  </span>
                </label>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProgramRunner;
