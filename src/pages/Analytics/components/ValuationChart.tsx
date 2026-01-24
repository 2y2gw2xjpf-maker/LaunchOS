/**
 * ValuationChart - Bewertungsverlauf mit Recharts
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { ValuationHistoryEntry } from '@/hooks/useAnalytics';

interface ValuationChartProps {
  data: ValuationHistoryEntry[];
  isLoading?: boolean;
}

interface TooltipPayload {
  value: number;
  payload: {
    date: string;
    fullDate: string;
    method: string;
    formattedValue: string;
  };
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4">
      <p className="text-sm text-gray-500">{data.fullDate}</p>
      <p className="text-lg font-bold text-gray-900">{data.formattedValue}</p>
      <p className="text-xs text-purple-600 mt-1">{data.method}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-64 flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
        <TrendingUp className="w-8 h-8 text-purple-600" />
      </div>
      <h4 className="text-lg font-semibold text-gray-900">Noch keine Bewertungen</h4>
      <p className="text-sm text-gray-500 mt-2 max-w-xs">
        Führe eine Bewertung durch, um deinen Bewertungsverlauf hier zu verfolgen.
      </p>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="h-64 flex items-center justify-center">
      <div className="animate-pulse space-y-4 w-full px-6">
        <div className="flex justify-between">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 w-2 bg-gray-200 rounded" style={{ height: `${(i * 15) + 40}px` }} />
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded w-full" />
      </div>
    </div>
  );
}

export function ValuationChart({ data, isLoading }: ValuationChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((entry) => {
      const date = new Date(entry.recordedAt);
      return {
        date: date.toLocaleDateString('de-DE', { month: 'short', day: 'numeric' }),
        fullDate: date.toLocaleDateString('de-DE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        value: entry.valuationAmount,
        formattedValue: new Intl.NumberFormat('de-DE', {
          style: 'currency',
          currency: entry.currency,
          maximumFractionDigits: 0,
        }).format(entry.valuationAmount),
        method: entry.valuationMethod,
      };
    });
  }, [data]);

  // Calculate stats
  const stats = useMemo(() => {
    if (chartData.length === 0) return null;

    const values = chartData.map((d) => d.value);
    const latest = values[values.length - 1];
    const previous = values.length > 1 ? values[values.length - 2] : latest;
    const change = previous > 0 ? ((latest - previous) / previous) * 100 : 0;

    return {
      latest: new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }).format(latest),
      change: change.toFixed(1),
      isPositive: change >= 0,
    };
  }, [chartData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Bewertungsverlauf</h3>
              <p className="text-sm text-gray-500">Entwicklung deiner Unternehmensbewertung</p>
            </div>
          </div>
          {stats && (
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{stats.latest}</p>
              <p className={`text-sm font-medium ${stats.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {stats.isPositive ? '+' : ''}{stats.change}% vs. vorherige
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        {isLoading ? (
          <ChartSkeleton />
        ) : chartData.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="valuationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9333ea" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#9333ea" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    new Intl.NumberFormat('de-DE', {
                      notation: 'compact',
                      compactDisplay: 'short',
                    }).format(value)
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#9333ea"
                  strokeWidth={2}
                  fill="url(#valuationGradient)"
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ValuationChart;
