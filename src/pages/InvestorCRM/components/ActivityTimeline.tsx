/**
 * Aktivitaeten-Timeline fuer Kontakte
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Phone, MessageSquare, Calendar, FileText, Link2,
  GitMerge, Clock, Plus, Send
} from 'lucide-react';
import { Button } from '@/components/ui';
import {
  type InvestorActivity,
  type ActivityType,
  ACTIVITY_TYPES,
} from '@/hooks/useInvestorCRM';
import { cn } from '@/lib/utils/cn';

interface ActivityTimelineProps {
  activities: InvestorActivity[];
  onAddActivity: (data: Partial<InvestorActivity>) => Promise<void>;
  isLoading?: boolean;
}

const activityIcons: Record<ActivityType, React.ReactNode> = {
  email_sent: <Send className="w-4 h-4" />,
  email_received: <Mail className="w-4 h-4" />,
  call: <Phone className="w-4 h-4" />,
  meeting: <Calendar className="w-4 h-4" />,
  linkedin_message: <MessageSquare className="w-4 h-4" />,
  intro_request: <Link2 className="w-4 h-4" />,
  note: <FileText className="w-4 h-4" />,
  stage_change: <GitMerge className="w-4 h-4" />,
  document_shared: <FileText className="w-4 h-4" />,
  feedback_received: <MessageSquare className="w-4 h-4" />,
};

const activityColors: Record<ActivityType, string> = {
  email_sent: 'bg-blue-100 text-blue-600',
  email_received: 'bg-green-100 text-green-600',
  call: 'bg-purple-100 text-purple-600',
  meeting: 'bg-pink-100 text-pink-600',
  linkedin_message: 'bg-blue-100 text-blue-600',
  intro_request: 'bg-orange-100 text-orange-600',
  note: 'bg-gray-100 text-gray-600',
  stage_change: 'bg-indigo-100 text-indigo-600',
  document_shared: 'bg-teal-100 text-teal-600',
  feedback_received: 'bg-yellow-100 text-yellow-600',
};

export function ActivityTimeline({ activities, onAddActivity, isLoading }: ActivityTimelineProps) {
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newActivity, setNewActivity] = React.useState<Partial<InvestorActivity>>({
    type: 'note',
    title: '',
    description: '',
  });
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.title?.trim()) return;

    setIsSaving(true);
    try {
      await onAddActivity(newActivity);
      setNewActivity({ type: 'note', title: '', description: '' });
      setShowAddForm(false);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Heute, ${date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return 'Gestern';
    } else if (diffDays < 7) {
      return `Vor ${diffDays} Tagen`;
    } else {
      return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Activity Button */}
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-gray-900">Aktivitaeten</h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Hinzufuegen
        </Button>
      </div>

      {/* Add Activity Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-gray-50 rounded-xl p-4 space-y-3"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
              <select
                value={newActivity.type}
                onChange={(e) =>
                  setNewActivity((prev) => ({ ...prev, type: e.target.value as ActivityType }))
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-500 outline-none"
              >
                {ACTIVITY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
              <input
                type="text"
                value={newActivity.title || ''}
                onChange={(e) => setNewActivity((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="z.B. Erstes Gespraech gefuehrt"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beschreibung (optional)
              </label>
              <textarea
                value={newActivity.description || ''}
                onChange={(e) =>
                  setNewActivity((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Details..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-500 outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSaving || !newActivity.title?.trim()}
              >
                {isSaving ? 'Speichern...' : 'Speichern'}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Timeline */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Noch keine Aktivitaeten</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

          {/* Activities */}
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative flex gap-4"
              >
                {/* Icon */}
                <div
                  className={cn(
                    'relative z-10 w-8 h-8 rounded-full flex items-center justify-center',
                    activityColors[activity.type]
                  )}
                >
                  {activityIcons[activity.type]}
                </div>

                {/* Content */}
                <div className="flex-1 bg-white rounded-xl border border-gray-100 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      {activity.description && (
                        <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(activity.activityDate)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityTimeline;
