import * as React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { useStore } from '@/store';
import { InfoCheckModal } from './InfoCheckModal';
import { ProceedWarningModal } from './ProceedWarningModal';
import { TASK_ASSISTANCE_CONFIG, TASK_LABELS } from '@/lib/taskRequirements';
import { cn } from '@/lib/utils/cn';

interface TaskExecutionButtonProps {
  taskId: string;
  onGenerate: () => Promise<void>;
  variant?: 'default' | 'compact';
  className?: string;
}

export const TaskExecutionButton = ({
  taskId,
  onGenerate,
  variant = 'default',
  className,
}: TaskExecutionButtonProps) => {
  const [showInfoCheck, setShowInfoCheck] = React.useState(false);
  const [showWarning, setShowWarning] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const {
    startTaskExecution,
    currentTaskExecution,
    proceedToGeneration,
    cancelExecution,
  } = useStore();

  const config = TASK_ASSISTANCE_CONFIG[taskId];
  const labels = TASK_LABELS[taskId];

  if (!config) {
    return null;
  }

  const handleClick = () => {
    startTaskExecution(taskId);
    setShowInfoCheck(true);
  };

  const handleProceed = async () => {
    if (
      currentTaskExecution?.infoCheck.canProceed ||
      currentTaskExecution?.infoCheck.canProceedWithWarnings
    ) {
      if (!currentTaskExecution.infoCheck.canProceed) {
        setShowInfoCheck(false);
        setShowWarning(true);
      } else {
        await startGeneration();
      }
    }
  };

  const handleProceedWithWarnings = async () => {
    setShowWarning(false);
    await startGeneration();
  };

  const startGeneration = async () => {
    setShowInfoCheck(false);
    setShowWarning(false);
    setIsGenerating(true);
    proceedToGeneration();

    try {
      await onGenerate();
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartGathering = (requirementId: string) => {
    // This would open the appropriate wizard for the requirement
    console.log('Start gathering for:', requirementId);
    // For now, we'll just close the modal
    // In a full implementation, this would open the wizard component
  };

  const handleClose = () => {
    setShowInfoCheck(false);
    setShowWarning(false);
    cancelExecution();
  };

  if (variant === 'compact') {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClick}
          disabled={isGenerating}
          className={cn('gap-1', className)}
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span className="text-xs">AI Hilfe</span>
        </Button>

        <InfoCheckModal
          open={showInfoCheck}
          onClose={handleClose}
          taskId={taskId}
          onProceed={handleProceed}
          onStartGathering={handleStartGathering}
        />

        <ProceedWarningModal
          open={showWarning}
          onClose={handleClose}
          onConfirm={handleProceedWithWarnings}
          taskId={taskId}
        />
      </>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('bg-white rounded-xl border border-navy/10 p-4', className)}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-navy" />
          </div>
          <div>
            <h4 className="font-medium text-navy">{labels?.title || 'AI Assistance'}</h4>
            <p className="text-sm text-charcoal/60">
              {labels?.description || 'Lass dir von AI helfen'}
            </p>
          </div>
        </div>

        <Button
          onClick={handleClick}
          disabled={isGenerating}
          className="w-full gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generiere...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Starten
            </>
          )}
        </Button>
      </motion.div>

      <InfoCheckModal
        open={showInfoCheck}
        onClose={handleClose}
        taskId={taskId}
        onProceed={handleProceed}
        onStartGathering={handleStartGathering}
      />

      <ProceedWarningModal
        open={showWarning}
        onClose={handleClose}
        onConfirm={handleProceedWithWarnings}
        taskId={taskId}
      />
    </>
  );
};
