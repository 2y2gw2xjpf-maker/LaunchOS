/**
 * UpcomingFollowUps - Follow-up Reminder Widget
 */

import { motion } from 'framer-motion';
import {
  Bell,
  Calendar,
  ChevronRight,
  AlertCircle,
  Clock,
  User,
  Building,
} from 'lucide-react';
import type { UpcomingFollowUp } from '@/hooks/useAnalytics';

interface UpcomingFollowUpsProps {
  followUps: UpcomingFollowUp[];
  isLoading?: boolean;
  onContactClick?: (contactId: string) => void;
}

const PRIORITY_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  high: { color: '#ef4444', bgColor: '#fee2e2', label: 'Hoch' },
  medium: { color: '#f59e0b', bgColor: '#fef3c7', label: 'Mittel' },
  low: { color: '#22c55e', bgColor: '#dcfce7', label: 'Niedrig' },
};

const STAGE_LABELS: Record<string, string> = {
  lead: 'Lead',
  researching: 'Recherche',
  contacted: 'Kontaktiert',
  meeting_scheduled: 'Meeting geplant',
  meeting_done: 'Meeting abgeschlossen',
  follow_up: 'Follow-up',
  term_sheet: 'Term Sheet',
  due_diligence: 'Due Diligence',
  closed_won: 'Abgeschlossen',
  closed_lost: 'Verloren',
  on_hold: 'Pausiert',
};

function formatFollowUpDate(dateString: string): { text: string; isOverdue: boolean; isToday: boolean } {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((date.getTime() - today.getTime()) / 86400000);

  if (diffDays < 0) {
    return { text: `${Math.abs(diffDays)} Tage überfällig`, isOverdue: true, isToday: false };
  }
  if (diffDays === 0) {
    return { text: 'Heute', isOverdue: false, isToday: true };
  }
  if (diffDays === 1) {
    return { text: 'Morgen', isOverdue: false, isToday: false };
  }
  if (diffDays <= 7) {
    return { text: `In ${diffDays} Tagen`, isOverdue: false, isToday: false };
  }
  return {
    text: date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }),
    isOverdue: false,
    isToday: false,
  };
}

function FollowUpSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-3 w-24 bg-gray-200 rounded mt-2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <Calendar className="w-8 h-8 text-green-600" />
      </div>
      <h4 className="text-lg font-semibold text-gray-900">Alles erledigt!</h4>
      <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
        Keine anstehenden Follow-ups. Zeit für neue Kontakte!
      </p>
    </div>
  );
}

export function UpcomingFollowUps({ followUps, isLoading, onContactClick }: UpcomingFollowUpsProps) {
  const overdueCount = followUps.filter((f) => {
    const date = new Date(f.nextFollowUp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  }).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center relative">
              <Bell className="w-5 h-5 text-white" />
              {overdueCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {overdueCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Anstehende Follow-ups</h3>
              <p className="text-sm text-gray-500">Deine nächsten Aufgaben</p>
            </div>
          </div>
        </div>
      </div>

      {/* Follow-up List */}
      <div className="p-6">
        {isLoading ? (
          <FollowUpSkeleton />
        ) : followUps.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {followUps.map((followUp, index) => {
              const dateInfo = formatFollowUpDate(followUp.nextFollowUp);
              const priorityConfig = PRIORITY_CONFIG[followUp.priority] || PRIORITY_CONFIG.medium;

              return (
                <motion.div
                  key={followUp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => onContactClick?.(followUp.id)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                    dateInfo.isOverdue
                      ? 'bg-red-50 border-red-200 hover:border-red-300'
                      : dateInfo.isToday
                        ? 'bg-amber-50 border-amber-200 hover:border-amber-300'
                        : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-gray-900 truncate">
                            {followUp.name}
                          </p>
                          {followUp.company && (
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Building className="w-3 h-3" />
                              {followUp.company}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </div>

                      {followUp.followUpNote && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {followUp.followUpNote}
                        </p>
                      )}

                      {/* Tags */}
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {/* Date */}
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                            dateInfo.isOverdue
                              ? 'bg-red-100 text-red-700'
                              : dateInfo.isToday
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {dateInfo.isOverdue ? (
                            <AlertCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {dateInfo.text}
                        </span>

                        {/* Stage */}
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                          {STAGE_LABELS[followUp.pipelineStage] || followUp.pipelineStage}
                        </span>

                        {/* Priority */}
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: priorityConfig.bgColor,
                            color: priorityConfig.color,
                          }}
                        >
                          {priorityConfig.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {followUps.length > 0 && (
        <div className="px-6 pb-6">
          <button className="w-full py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors">
            Alle Follow-ups anzeigen
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default UpcomingFollowUps;
