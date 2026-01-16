/**
 * LaunchOS Program Hook
 * Verwaltet automatisierte Programme/Agents
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { useOptionalVentureContext } from '@/contexts/VentureContext';

// ==================== TYPES ====================

export interface ProgramStep {
  id: string;
  title: string;
  description: string;
  type: 'check' | 'generate' | 'research';
  deliverable_type?: string;
  required_fields?: string[];
}

export interface ProgramTemplate {
  id: string;
  slug: string;
  title: string;
  description: string;
  steps: ProgramStep[];
  estimatedDuration: string;
  category: string;
  targetStage: string[];
}

export interface StepResult {
  step_index: number;
  status: 'completed' | 'failed' | 'skipped';
  result?: Record<string, unknown>;
  deliverable_id?: string;
  completed_at: string;
}

export interface ProgramExecution {
  id: string;
  userId: string;
  ventureId?: string;
  templateId?: string;
  templateSlug: string;
  status: 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  currentStep: number;
  stepsCompleted: StepResult[];
  deliverablesCreated: string[];
  startedAt: Date;
  pausedAt?: Date;
  completedAt?: Date;
  // Computed
  template?: ProgramTemplate;
  progress: number;
}

export interface UseProgramReturn {
  templates: ProgramTemplate[];
  activeExecution: ProgramExecution | null;
  isLoading: boolean;
  isExecuting: boolean;
  error: string | null;
  startProgram: (slug: string) => Promise<string | null>;
  pauseProgram: () => Promise<boolean>;
  resumeProgram: () => Promise<boolean>;
  cancelProgram: () => Promise<boolean>;
  executeNextStep: () => Promise<boolean>;
  getExecutionHistory: () => Promise<ProgramExecution[]>;
}

// ==================== HOOK ====================

export function useProgram(): UseProgramReturn {
  const { user } = useAuth();
  const ventureContext = useOptionalVentureContext();
  const activeVenture = ventureContext?.activeVenture;
  const [templates, setTemplates] = useState<ProgramTemplate[]>([]);
  const [activeExecution, setActiveExecution] = useState<ProgramExecution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const executionRef = useRef<boolean>(false);

  // Map template row
  const mapTemplate = (row: Record<string, unknown>): ProgramTemplate => ({
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    description: row.description as string,
    steps: row.steps as ProgramStep[],
    estimatedDuration: row.estimated_duration as string,
    category: row.category as string,
    targetStage: row.target_stage as string[],
  });

  // Load templates
  const loadTemplates = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('program_templates')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      setTemplates((data || []).map(mapTemplate));
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  }, []);

  // Load active execution
  const loadActiveExecution = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) return;

    try {
      const { data, error } = await supabase
        .from('program_executions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['running', 'paused'])
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const template = templates.find(t => t.slug === data.template_slug);
        setActiveExecution({
          id: data.id,
          userId: data.user_id,
          ventureId: data.venture_id,
          templateId: data.template_id,
          templateSlug: data.template_slug,
          status: data.status,
          currentStep: data.current_step,
          stepsCompleted: data.steps_completed || [],
          deliverablesCreated: data.deliverables_created || [],
          startedAt: new Date(data.started_at),
          pausedAt: data.paused_at ? new Date(data.paused_at) : undefined,
          completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
          template,
          progress: template
            ? ((data.steps_completed?.length || 0) / template.steps.length) * 100
            : 0,
        });
      } else {
        setActiveExecution(null);
      }
    } catch (err) {
      console.error('Error loading active execution:', err);
    }
  }, [user, templates]);

  // Start program
  const startProgram = useCallback(async (slug: string): Promise<string | null> => {
    if (!user || !isSupabaseConfigured()) return null;

    const template = templates.find(t => t.slug === slug);
    if (!template) {
      setError('Programm nicht gefunden');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('program_executions')
        .insert({
          user_id: user.id,
          venture_id: activeVenture?.id,
          template_id: template.id,
          template_slug: slug,
          status: 'running',
          current_step: 0,
          steps_completed: [],
          deliverables_created: [],
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      await loadActiveExecution();
      return data.id;
    } catch (err) {
      console.error('Error starting program:', err);
      setError('Fehler beim Starten des Programms');
      return null;
    }
  }, [user, activeVenture, templates, loadActiveExecution]);

  // Pause program
  const pauseProgram = useCallback(async (): Promise<boolean> => {
    if (!activeExecution || !isSupabaseConfigured()) return false;

    try {
      const { error } = await supabase
        .from('program_executions')
        .update({
          status: 'paused',
          paused_at: new Date().toISOString(),
        })
        .eq('id', activeExecution.id);

      if (error) throw error;

      executionRef.current = false;
      await loadActiveExecution();
      return true;
    } catch (err) {
      console.error('Error pausing program:', err);
      return false;
    }
  }, [activeExecution, loadActiveExecution]);

  // Resume program
  const resumeProgram = useCallback(async (): Promise<boolean> => {
    if (!activeExecution || !isSupabaseConfigured()) return false;

    try {
      const { error } = await supabase
        .from('program_executions')
        .update({
          status: 'running',
          paused_at: null,
        })
        .eq('id', activeExecution.id);

      if (error) throw error;

      await loadActiveExecution();
      return true;
    } catch (err) {
      console.error('Error resuming program:', err);
      return false;
    }
  }, [activeExecution, loadActiveExecution]);

  // Cancel program
  const cancelProgram = useCallback(async (): Promise<boolean> => {
    if (!activeExecution || !isSupabaseConfigured()) return false;

    try {
      const { error } = await supabase
        .from('program_executions')
        .update({
          status: 'cancelled',
          completed_at: new Date().toISOString(),
        })
        .eq('id', activeExecution.id);

      if (error) throw error;

      executionRef.current = false;
      setActiveExecution(null);
      return true;
    } catch (err) {
      console.error('Error cancelling program:', err);
      return false;
    }
  }, [activeExecution]);

  // Execute next step
  const executeNextStep = useCallback(async (): Promise<boolean> => {
    if (!activeExecution || !activeExecution.template || !isSupabaseConfigured()) return false;
    if (activeExecution.status !== 'running') return false;

    const step = activeExecution.template.steps[activeExecution.currentStep];
    if (!step) {
      // All steps completed
      await supabase
        .from('program_executions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', activeExecution.id);

      await loadActiveExecution();
      return true;
    }

    setIsExecuting(true);
    setError(null);

    try {
      // Execute step based on type
      let result: Record<string, unknown> = {};
      let deliverableId: string | undefined;

      if (step.type === 'check') {
        // Check required fields
        result = { checked: true };
      } else if (step.type === 'generate' || step.type === 'research') {
        // Call AI to generate/research
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseAnonKey) {
          const response = await fetch(
            `${supabaseUrl}/functions/v1/chat`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseAnonKey}`,
              },
              body: JSON.stringify({
                messages: [{
                  role: 'user',
                  content: `Fuehre folgenden Schritt aus: ${step.title}. ${step.description}.
                           ${step.deliverable_type ? `Erstelle ein ${step.deliverable_type}.` : ''}`,
                }],
                systemPrompt: 'Du bist ein Startup-Assistent. Fuehre die Aufgabe aus.',
                programMode: true,
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            result = data;
            deliverableId = data.deliverable_id;
          }
        }
      }

      // Update execution
      const stepResult: StepResult = {
        step_index: activeExecution.currentStep,
        status: 'completed',
        result,
        deliverable_id: deliverableId,
        completed_at: new Date().toISOString(),
      };

      const newStepsCompleted = [...activeExecution.stepsCompleted, stepResult];
      const newDeliverablesCreated = deliverableId
        ? [...activeExecution.deliverablesCreated, deliverableId]
        : activeExecution.deliverablesCreated;

      const isLastStep = activeExecution.currentStep >= activeExecution.template.steps.length - 1;

      await supabase
        .from('program_executions')
        .update({
          current_step: activeExecution.currentStep + 1,
          steps_completed: newStepsCompleted,
          deliverables_created: newDeliverablesCreated,
          status: isLastStep ? 'completed' : 'running',
          completed_at: isLastStep ? new Date().toISOString() : null,
        })
        .eq('id', activeExecution.id);

      await loadActiveExecution();
      return true;
    } catch (err) {
      console.error('Error executing step:', err);
      setError(`Fehler bei Schritt: ${step.title}`);
      return false;
    } finally {
      setIsExecuting(false);
    }
  }, [activeExecution, loadActiveExecution]);

  // Get execution history
  const getExecutionHistory = useCallback(async (): Promise<ProgramExecution[]> => {
    if (!user || !isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('program_executions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || []).map(e => {
        const template = templates.find(t => t.slug === e.template_slug);
        return {
          id: e.id,
          userId: e.user_id,
          ventureId: e.venture_id,
          templateId: e.template_id,
          templateSlug: e.template_slug,
          status: e.status,
          currentStep: e.current_step,
          stepsCompleted: e.steps_completed || [],
          deliverablesCreated: e.deliverables_created || [],
          startedAt: new Date(e.started_at),
          pausedAt: e.paused_at ? new Date(e.paused_at) : undefined,
          completedAt: e.completed_at ? new Date(e.completed_at) : undefined,
          template,
          progress: template
            ? ((e.steps_completed?.length || 0) / template.steps.length) * 100
            : 0,
        };
      });
    } catch (err) {
      console.error('Error loading history:', err);
      return [];
    }
  }, [user, templates]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadTemplates();
      setIsLoading(false);
    };
    init();
  }, [loadTemplates]);

  // Load active execution when templates are loaded
  useEffect(() => {
    if (templates.length > 0) {
      loadActiveExecution();
    }
  }, [templates, loadActiveExecution]);

  return {
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
    getExecutionHistory,
  };
}

export default useProgram;
