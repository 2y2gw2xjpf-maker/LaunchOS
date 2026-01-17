/**
 * ActivityFeed - Liste der letzten Aktivitaeten
 */

import { motion } from 'framer-motion';
import {
  Activity,
  Mail,
  MailOpen,
  Phone,
  Calendar,
  Linkedin,
  Users,
  MessageSquare,
  RefreshCw,
  FileText,
  ThumbsUp,
} from 'lucide-react';
import type { RecentActivity } from '@/hooks/useAnalytics';

interface ActivityFeedProps {
  activities: RecentActivity[];
  isLoading?: boolean;
}

const ACTIVITY_ICONS: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  email_sent: { icon: Mail, color: '#3b82f6', bgColor: '#dbeafe' },
  email_received: { icon: MailOpen, color: '#22c55e', bgColor: '#dcfce7' },
  call: { icon: Phone, color: '#8b5cf6', bgColor: '#ede9fe' },
  meeting: { icon: Calendar, color: '#ec4899', bgColor: '#fce7f3' },
  linkedin_message: { icon: Linkedin, color: '#0077b5', bgColor: '#e0f2fe' },
  intro_request: { icon: Users, color: '#f59e0b', bgColor: '#fef3c7' },
  note: { icon: MessageSquare, color: '#6b7280', bgColor: '#f3f4f6' },
  stage_change: { icon: RefreshCw, color: '#9333ea', bgColor: '#f3e8ff' },
  document_shared: { icon: FileText, color: '#14b8a6', bgColor: '#ccfbf1' },
  feedback_received: { icon: ThumbsUp, color: '#22c55e', bgColor: '#dcfce7' },
};

const ACTIVITY_LABELS: Record<string, string> = {
  email_sent: 'E-Mail gesendet',
  email_received: 'E-Mail erhalten',
  call: 'Telefonat',
  meeting: 'Meeting',
  linkedin_message: 'LinkedIn Nachricht',
  intro_request: 'Intro angefragt',
  note: 'Notiz',
  stage_change: 'Stage geändert',
  document_shared: 'Dokument geteilt',
  feedback_received: 'Feedback erhalten',
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Gerade eben';
  if (diffMins < 60) return `vor ${diffMins} Min.`;
  if (diffHours < 24) return `vor ${diffHours} Std.`;
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}

function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
            <div className="h-3 w-1/2 bg-gray-200 rounded mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
        <Activity className="w-8 h-8 text-purple-600" />
      </div>
      <h4 className="text-lg font-semibold text-gray-900">Keine Aktivitäten</h4>
      <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
        Starte mit deiner ersten Investoren-Interaktion, um Aktivitäten hier zu sehen.
      </p>
    </div>
  );
}

export function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Letzte Aktivitäten</h3>
            <p className="text-sm text-gray-500">Deine neuesten Interaktionen</p>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="p-6 max-h-96 overflow-y-auto">
        {isLoading ? (
          <ActivitySkeleton />
        ) : activities.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const config = ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.note;
              const Icon = config.icon;

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex gap-4 group"
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: config.bgColor }}
                  >
                    <Icon className="w-5 h-5" style={{ color: config.color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {activity.contactName}
                          {activity.contactCompany && (
                            <span className="text-gray-400"> • {activity.contactCompany}</span>
                          )}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatTimeAgo(activity.activityDate)}
                      </span>
                    </div>
                    {activity.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {activity.description}
                      </p>
                    )}
                    <span
                      className="inline-block text-xs px-2 py-0.5 rounded-full mt-2"
                      style={{ backgroundColor: config.bgColor, color: config.color }}
                    >
                      {ACTIVITY_LABELS[activity.type] || activity.type}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {activities.length > 0 && (
        <div className="px-6 pb-6">
          <button className="w-full py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors">
            Alle Aktivitäten anzeigen
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default ActivityFeed;
