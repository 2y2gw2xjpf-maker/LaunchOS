/**
 * Pipeline-Statistiken Uebersicht
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Target, Calendar } from 'lucide-react';
import type { InvestorContact } from '@/hooks/useInvestorCRM';
import { PIPELINE_STAGES } from '@/hooks/useInvestorCRM';

interface PipelineStatsProps {
  contacts: InvestorContact[];
  stats: { stage: string; count: number; label: string; color: string }[];
}

export function PipelineStats({ contacts, stats }: PipelineStatsProps) {
  // Calculate metrics
  const totalContacts = contacts.length;
  const activeContacts = contacts.filter(
    (c) => !['closed_won', 'closed_lost', 'on_hold'].includes(c.pipelineStage)
  ).length;
  const closedWon = contacts.filter((c) => c.pipelineStage === 'closed_won').length;
  const conversionRate = totalContacts > 0 ? Math.round((closedWon / totalContacts) * 100) : 0;

  const upcomingFollowUps = contacts.filter((c) => {
    if (!c.nextFollowUp) return false;
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return c.nextFollowUp >= now && c.nextFollowUp <= sevenDaysFromNow;
  }).length;

  const overdueFollowUps = contacts.filter((c) => {
    if (!c.nextFollowUp) return false;
    return c.nextFollowUp < new Date();
  }).length;

  // Stats cards
  const statCards = [
    {
      label: 'Gesamt',
      value: totalContacts,
      icon: Users,
      color: 'purple',
    },
    {
      label: 'Aktiv',
      value: activeContacts,
      icon: TrendingUp,
      color: 'blue',
    },
    {
      label: 'Conversion',
      value: `${conversionRate}%`,
      icon: Target,
      color: 'green',
    },
    {
      label: 'Follow-ups',
      value: upcomingFollowUps + overdueFollowUps,
      subValue: overdueFollowUps > 0 ? `${overdueFollowUps} ueberfaellig` : undefined,
      icon: Calendar,
      color: overdueFollowUps > 0 ? 'red' : 'orange',
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string; icon: string }> = {
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
    green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-500' },
    red: { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-500' },
  };

  // Pipeline funnel data (simplified)
  const funnelStages = ['lead', 'contacted', 'meeting_done', 'term_sheet', 'closed_won'];
  const funnelData = funnelStages.map((stage) => {
    const stageInfo = PIPELINE_STAGES.find((s) => s.value === stage);
    return {
      stage,
      label: stageInfo?.label || stage,
      count: contacts.filter((c) => c.pipelineStage === stage).length,
      color: stageInfo?.color || '#6b7280',
    };
  });

  const maxCount = Math.max(...funnelData.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colors = colorClasses[stat.color];

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${colors.bg} rounded-xl p-4`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">{stat.label}</span>
                <Icon className={`w-5 h-5 ${colors.icon}`} />
              </div>
              <div className={`text-2xl font-bold ${colors.text}`}>{stat.value}</div>
              {stat.subValue && (
                <div className="text-xs text-red-500 mt-1">{stat.subValue}</div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Pipeline Funnel */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="font-medium text-gray-900 mb-4">Pipeline-Trichter</h3>
        <div className="space-y-3">
          {funnelData.map((item, index) => (
            <div key={item.stage} className="flex items-center gap-4">
              <div className="w-32 text-sm text-gray-600">{item.label}</div>
              <div className="flex-1">
                <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.count / maxCount) * 100}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="h-full rounded-lg flex items-center justify-end px-2"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.count > 0 && (
                      <span className="text-white text-sm font-medium">{item.count}</span>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stage Distribution */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="font-medium text-gray-900 mb-4">Verteilung nach Stage</h3>
        <div className="flex flex-wrap gap-2">
          {stats.map((stat) => (
            <div
              key={stat.stage}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: `${stat.color}15` }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: stat.color }}
              />
              <span className="text-sm font-medium" style={{ color: stat.color }}>
                {stat.label}
              </span>
              <span
                className="px-1.5 py-0.5 rounded text-xs font-bold"
                style={{ backgroundColor: stat.color, color: 'white' }}
              >
                {stat.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PipelineStats;
