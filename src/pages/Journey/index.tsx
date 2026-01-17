/**
 * Journey Page
 * Zeigt die 35 Founder Journey Steps mit Progress Tracking
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Circle,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Building,
  Scale,
  Palette,
  Package,
  Rocket,
  TrendingUp,
  DollarSign,
  Filter,
} from 'lucide-react';
import { Header, EnhancedSidebar, PageContainer } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';

// ==================== TYPES ====================

interface JourneyResource {
  id: string;
  type: string;
  title: string;
  url: string;
  description: string;
  is_free: boolean;
}

interface JourneyStep {
  id: string;
  phase: string;
  category: string;
  title: string;
  description: string;
  requires: string[];
  can_help: boolean;
  help_type: string;
  help_action: string;
  estimated_time: string;
  estimated_cost: string;
  applicable_when: Record<string, string[]>;
  sort_order: number;
  resources?: JourneyResource[];
}

type StepStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';

type StageFilter = 'all' | 'idea' | 'building' | 'launched' | 'scaling';

// ==================== CONSTANTS ====================

const STAGE_CONFIG: Record<StageFilter, { label: string; description: string }> = {
  all: { label: 'Alle', description: 'Alle 35 Schritte anzeigen' },
  idea: { label: 'Idee', description: 'Du hast eine Idee, aber noch nicht gegründet' },
  building: { label: 'Aufbau', description: 'Du bist dabei, dein Startup aufzubauen' },
  launched: { label: 'Gestartet', description: 'Dein Produkt ist am Markt' },
  scaling: { label: 'Wachstum', description: 'Du skalierst dein Geschäft' },
};

const PHASE_CONFIG: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; label: string; color: string }
> = {
  foundation: { icon: Building, label: 'Gründung', color: 'purple' },
  legal: { icon: Scale, label: 'Rechtliches', color: 'blue' },
  branding: { icon: Palette, label: 'Branding', color: 'pink' },
  product: { icon: Package, label: 'Produkt', color: 'cyan' },
  launch: { icon: Rocket, label: 'Launch', color: 'orange' },
  funding: { icon: DollarSign, label: 'Funding', color: 'green' },
  growth: { icon: TrendingUp, label: 'Wachstum', color: 'violet' },
};

const STATUS_CONFIG: Record<StepStatus, { color: string; label: string }> = {
  not_started: { color: 'bg-gray-100 text-gray-600', label: 'Offen' },
  in_progress: { color: 'bg-yellow-100 text-yellow-700', label: 'In Arbeit' },
  completed: { color: 'bg-green-100 text-green-700', label: 'Erledigt' },
  skipped: { color: 'bg-gray-100 text-gray-400', label: 'Übersprungen' },
};

// ==================== COMPONENTS ====================

function StepCard({
  step,
  status,
  onStatusChange,
}: {
  step: JourneyStep;
  status: StepStatus;
  onStatusChange: (status: StepStatus) => void;
}) {
  const [expanded, setExpanded] = React.useState(false);

  const handleStatusToggle = () => {
    const nextStatus: StepStatus =
      status === 'completed' ? 'not_started' : status === 'in_progress' ? 'completed' : 'in_progress';
    onStatusChange(nextStatus);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-gray-100 rounded-xl p-4 hover:border-purple-200 transition-colors bg-white/50"
    >
      <div className="flex items-start gap-4">
        {/* Status Toggle */}
        <button onClick={handleStatusToggle} className="mt-1 flex-shrink-0">
          {status === 'completed' ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : status === 'in_progress' ? (
            <Clock className="w-6 h-6 text-yellow-500" />
          ) : (
            <Circle className="w-6 h-6 text-gray-300 hover:text-purple-400 transition-colors" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{step.title}</h4>
              <p className="text-sm text-gray-500 mt-1">{step.description}</p>
            </div>

            {step.can_help && (
              <Button
                variant="primary"
                size="sm"
                className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-pink-500 border-0 w-[90px] text-xs inline-flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3 h-3 flex-shrink-0" />
                <span>KI-Hilfe</span>
              </Button>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-2 mt-3">
            {step.estimated_time && (
              <span className="inline-flex items-center px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {step.estimated_time}
              </span>
            )}
            {step.estimated_cost && (
              <span className="inline-flex items-center px-2 py-1 bg-pink-50 text-pink-600 rounded-full text-xs">
                <DollarSign className="w-3 h-3 mr-1" />
                {step.estimated_cost}
              </span>
            )}
            <span className={`px-2 py-1 rounded-full text-xs ${STATUS_CONFIG[status].color}`}>
              {STATUS_CONFIG[status].label}
            </span>
          </div>

          {/* Resources Toggle */}
          {step.resources && step.resources.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                {step.resources.length} Ressourcen
              </button>

              {expanded && (
                <div className="mt-2 space-y-2">
                  {step.resources.map((resource) => (
                    <a
                      key={resource.id}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-700 truncate">{resource.title}</p>
                        {resource.description && (
                          <p className="text-xs text-gray-500 truncate">{resource.description}</p>
                        )}
                      </div>
                      {resource.is_free && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full flex-shrink-0">
                          Kostenlos
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ==================== MAIN PAGE ====================

export function JourneyPage() {
  const { user, profile } = useAuth();
  const [steps, setSteps] = React.useState<JourneyStep[]>([]);
  const [progress, setProgress] = React.useState<Record<string, StepStatus>>({});
  const [expandedPhases, setExpandedPhases] = React.useState<string[]>(['foundation']);
  const [filter, setFilter] = React.useState<string>('all');
  const [stageFilter, setStageFilter] = React.useState<StageFilter>('all');
  const [loading, setLoading] = React.useState(true);

  // Load journey data
  React.useEffect(() => {
    loadJourneyData();
  }, [user]);

  const loadJourneyData = async () => {
    try {
      // Load steps with resources
      const { data: stepsData, error: stepsError } = await supabase
        .from('journey_steps')
        .select(
          `
          *,
          resources:journey_resources(*)
        `
        )
        .order('sort_order');

      if (stepsError) {
        console.error('Error loading journey steps:', stepsError);
        // Use empty array if table doesn't exist yet
        setSteps([]);
      } else {
        // Filter steps based on user profile
        const filteredSteps = filterStepsForUser(stepsData || [], profile);
        setSteps(filteredSteps);
      }

      // Load user progress
      if (user) {
        const { data: progressData, error: progressError } = await supabase
          .from('user_journey_progress')
          .select('step_id, status')
          .eq('user_id', user.id);

        if (!progressError && progressData) {
          const progressMap: Record<string, StepStatus> = {};
          progressData.forEach((p) => {
            progressMap[p.step_id] = p.status as StepStatus;
          });
          setProgress(progressMap);
        }
      }
    } catch (error) {
      console.error('Error loading journey data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStepsForUser = (
    stepsData: JourneyStep[],
    userProfile: typeof profile
  ): JourneyStep[] => {
    if (!userProfile) return stepsData;

    return stepsData.filter((step) => {
      const conditions = step.applicable_when || {};

      // Check company_type
      if (
        conditions.company_type &&
        userProfile.company_type &&
        !conditions.company_type.includes(userProfile.company_type)
      ) {
        return false;
      }

      // Check funding_path
      if (
        conditions.funding_path &&
        userProfile.funding_path &&
        !conditions.funding_path.includes(userProfile.funding_path)
      ) {
        return false;
      }

      // Check stage
      if (conditions.stage && userProfile.stage && !conditions.stage.includes(userProfile.stage)) {
        return false;
      }

      return true;
    });
  };

  const updateStepStatus = async (stepId: string, status: StepStatus) => {
    if (!user) return;

    try {
      await supabase.from('user_journey_progress').upsert({
        user_id: user.id,
        step_id: stepId,
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      });

      setProgress((prev) => ({ ...prev, [stepId]: status }));
    } catch (error) {
      console.error('Error updating step status:', error);
    }
  };

  // Filter steps by stage
  const filterStepsByStage = (stepsToFilter: JourneyStep[]): JourneyStep[] => {
    if (stageFilter === 'all') return stepsToFilter;

    return stepsToFilter.filter((step) => {
      const conditions = step.applicable_when || {};
      // Wenn der Step keine stage-Bedingung hat, zeige ihn immer
      if (!conditions.stage || conditions.stage.length === 0) return true;
      // Prüfe ob der aktuelle Stage-Filter in den erlaubten Stages ist
      return conditions.stage.includes(stageFilter);
    });
  };

  const getStepsByPhase = (): Record<string, JourneyStep[]> => {
    const grouped: Record<string, JourneyStep[]> = {};
    const filteredByStage = filterStepsByStage(steps);
    filteredByStage.forEach((step) => {
      if (!grouped[step.phase]) grouped[step.phase] = [];
      grouped[step.phase].push(step);
    });
    return grouped;
  };

  const calculateProgress = () => {
    const total = steps.length;
    const completed = Object.values(progress).filter((s) => s === 'completed').length;
    return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const togglePhase = (phase: string) => {
    setExpandedPhases((prev) =>
      prev.includes(phase) ? prev.filter((p) => p !== phase) : [...prev, phase]
    );
  };

  const stepsByPhase = getStepsByPhase();
  const progressStats = calculateProgress();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <EnhancedSidebar />
      <PageContainer withSidebar maxWidth="wide">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display text-display-sm text-charcoal mb-2">
            Deine Founder Journey
          </h1>
          <p className="text-charcoal/60">
            {steps.length > 0
              ? `${filterStepsByStage(steps).length} von ${steps.length} Schritten für deinen Reifegrad`
              : 'Lade Journey Steps...'}
          </p>
        </motion.div>

        {/* KI-Assistent Hinweis - Kompakt */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-purple-900">
                <span className="font-medium">KI-Assistent verfügbar</span>
                <span className="text-purple-700/70"> – Klicke auf </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-md mx-1">
                  <Sparkles className="w-3 h-3 flex-shrink-0" />
                  <span>KI-Hilfe</span>
                </span>
                <span className="text-purple-700/70"> bei jedem Schritt für personalisierte Hilfe.</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stage Filter - Reifegrad */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Wo stehst du gerade?
          </p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(STAGE_CONFIG) as StageFilter[]).map((stage) => (
              <button
                key={stage}
                onClick={() => setStageFilter(stage)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  stageFilter === stage
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-white text-gray-600 hover:bg-purple-50 border border-gray-200 hover:border-purple-300'
                }`}
              >
                {STAGE_CONFIG[stage].label}
              </button>
            ))}
          </div>
          {stageFilter !== 'all' && (
            <p className="mt-2 text-xs text-purple-600">
              {STAGE_CONFIG[stageFilter].description}
            </p>
          )}
        </motion.div>

        {/* Progress Overview */}
        <Card className="p-6 mb-8 bg-white/80 backdrop-blur-sm border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Gesamtfortschritt</p>
                <p className="text-3xl font-bold text-purple-600">
                  {progressStats.completed} / {progressStats.total}
                </p>
              </div>
              <div className="w-32 h-32 relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="#f3e8ff" strokeWidth="12" fill="none" />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="url(#progressGradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${progressStats.percentage * 3.52} 352`}
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#9333ea" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-600">{progressStats.percentage}%</span>
                </div>
              </div>
            </div>

            {/* Phase Progress Bars */}
            <div className="grid grid-cols-7 gap-2">
              {Object.entries(PHASE_CONFIG).map(([phase, config]) => {
                const phaseSteps = stepsByPhase[phase] || [];
                const completed = phaseSteps.filter((s) => progress[s.id] === 'completed').length;
                const percentage = phaseSteps.length ? (completed / phaseSteps.length) * 100 : 0;

                return (
                  <div key={phase} className="text-center">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">{config.label}</p>
                  </div>
                );
              })}
            </div>
        </Card>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
            {['all', 'not_started', 'in_progress', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-purple-50 border border-gray-200'
                }`}
              >
                {f === 'all'
                  ? 'Alle'
                  : f === 'not_started'
                    ? 'Offen'
                    : f === 'in_progress'
                      ? 'In Arbeit'
                      : 'Erledigt'}
              </button>
          ))}
        </div>

        {/* Journey Steps by Phase */}
        <div className="space-y-4">
            {Object.entries(stepsByPhase).map(([phase, phaseSteps]) => {
              const config = PHASE_CONFIG[phase];
              const Icon = config?.icon || Building;
              const isExpanded = expandedPhases.includes(phase);

              // Filter steps
              const filteredPhaseSteps =
                filter === 'all'
                  ? phaseSteps
                  : phaseSteps.filter((s) => (progress[s.id] || 'not_started') === filter);

              if (filteredPhaseSteps.length === 0 && filter !== 'all') return null;

              const phaseCompleted = phaseSteps.filter((s) => progress[s.id] === 'completed').length;

              return (
                <Card
                  key={phase}
                  className="overflow-hidden bg-white/80 backdrop-blur-sm border-purple-100"
                >
                  {/* Phase Header */}
                  <button
                    onClick={() => togglePhase(phase)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-purple-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">{config?.label || phase}</h3>
                        <p className="text-sm text-gray-500">
                          {phaseCompleted} / {phaseSteps.length} erledigt
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {/* Phase Steps */}
                  {isExpanded && (
                    <div className="px-6 pb-4 space-y-3">
                      {filteredPhaseSteps.length > 0 ? (
                        filteredPhaseSteps.map((step) => (
                          <StepCard
                            key={step.id}
                            step={step}
                            status={progress[step.id] || 'not_started'}
                            onStatusChange={(status) => updateStepStatus(step.id, status)}
                          />
                        ))
                      ) : (
                        <p className="text-center text-gray-400 py-4">
                          Keine Steps in dieser Kategorie
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}

          {steps.length === 0 && !loading && (
            <Card className="p-12 text-center bg-white/80">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Rocket className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Journey wird geladen</h3>
              <p className="text-gray-500 mb-6">
                Die Journey Steps werden aus der Datenbank geladen. Stelle sicher, dass die
                Migrations ausgeführt wurden.
              </p>
              <Button variant="primary" onClick={loadJourneyData}>
                Erneut laden
              </Button>
            </Card>
          )}
        </div>
      </PageContainer>
    </div>
  );
}

export default JourneyPage;
