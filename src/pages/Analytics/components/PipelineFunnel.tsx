/**
 * PipelineFunnel - Horizontal BarChart fuer Pipeline-Visualisierung
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Target, Users } from 'lucide-react';
import type { PipelineFunnelData } from '@/hooks/useAnalytics';

interface PipelineFunnelProps {
  data: PipelineFunnelData[];
  isLoading?: boolean;
}

interface TooltipPayload {
  value: number;
  payload: PipelineFunnelData;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3">
      <p className="font-medium text-gray-900">{data.label}</p>
      <p className="text-sm text-gray-500">{data.count} Kontakte</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-64 flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
        <Target className="w-8 h-8 text-purple-600" />
      </div>
      <h4 className="text-lg font-semibold text-gray-900">Keine Pipeline-Daten</h4>
      <p className="text-sm text-gray-500 mt-2 max-w-xs">
        Füge Investoren-Kontakte hinzu, um deine Pipeline hier zu visualisieren.
      </p>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse">
          <div className="w-24 h-4 bg-gray-200 rounded" />
          <div className="flex-1 h-8 bg-gray-200 rounded" style={{ width: `${Math.random() * 50 + 20}%` }} />
        </div>
      ))}
    </div>
  );
}

export function PipelineFunnel({ data, isLoading }: PipelineFunnelProps) {
  const totalContacts = useMemo(() => {
    return data.reduce((sum, item) => sum + item.count, 0);
  }, [data]);

  const sortedData = useMemo(() => {
    // Sort by pipeline order
    const stageOrder = [
      'lead', 'researching', 'contacted', 'meeting_scheduled',
      'meeting_done', 'follow_up', 'term_sheet', 'due_diligence',
      'closed_won', 'closed_lost', 'on_hold'
    ];

    return [...data].sort((a, b) => {
      return stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage);
    });
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Pipeline Funnel</h3>
              <p className="text-sm text-gray-500">Verteilung deiner Kontakte</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">{totalContacts} Gesamt</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        {isLoading ? (
          <ChartSkeleton />
        ) : data.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {sortedData.map((item, index) => {
              const percentage = totalContacts > 0 ? (item.count / totalContacts) * 100 : 0;
              const maxCount = Math.max(...data.map((d) => d.count));
              const barWidth = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

              return (
                <motion.div
                  key={item.stage}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center gap-4"
                >
                  {/* Label */}
                  <div className="w-32 flex-shrink-0">
                    <span className="text-sm font-medium text-gray-700 truncate block">
                      {item.label}
                    </span>
                  </div>

                  {/* Bar */}
                  <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                      className="h-full rounded-lg flex items-center justify-end px-3"
                      style={{ backgroundColor: item.color }}
                    >
                      {barWidth > 20 && (
                        <span className="text-xs font-medium text-white">
                          {item.count}
                        </span>
                      )}
                    </motion.div>
                    {barWidth <= 20 && item.count > 0 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600">
                        {item.count}
                      </span>
                    )}
                  </div>

                  {/* Percentage */}
                  <div className="w-12 text-right">
                    <span className="text-sm text-gray-500">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      {data.length > 0 && (
        <div className="px-6 pb-6">
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-gray-500">Abgeschlossen</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-xs text-gray-500">In Bearbeitung</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span className="text-xs text-gray-500">Leads</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default PipelineFunnel;
