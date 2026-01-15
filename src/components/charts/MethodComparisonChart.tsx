import * as React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils/cn';
import type { ValuationMethodResult } from '@/types';

interface MethodComparisonChartProps {
  results: ValuationMethodResult[];
  className?: string;
}

const methodLabels: Record<string, string> = {
  berkus: 'Berkus',
  scorecard: 'Scorecard',
  vc_method: 'VC Method',
  comparables: 'Comparables',
  dcf: 'DCF',
};

export const MethodComparisonChart = ({
  results,
  className,
}: MethodComparisonChartProps) => {
  const data = results.map((result) => ({
    name: methodLabels[result.method] || result.method,
    value: result.value,
    confidence: result.confidence,
  }));

  const averageValue =
    data.reduce((sum, item) => sum + item.value, 0) / data.length;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M €`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K €`;
    }
    return `${value} €`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-xl shadow-medium border border-brand-100">
          <p className="font-semibold text-charcoal mb-2">{data.name}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-charcoal/60">Bewertung: </span>
              <span className="font-mono text-brand-600">{formatCurrency(data.value)}</span>
            </p>
            <p className="text-sm">
              <span className="text-charcoal/60">Confidence: </span>
              <span className="font-mono text-accent-500">{data.confidence}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn('w-full h-[350px]', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.2)" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#2D3436', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(139, 92, 246, 0.2)' }}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={formatCurrency}
            tick={{ fill: '#2D3436', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(139, 92, 246, 0.2)' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: '#EC4899', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(236, 72, 153, 0.3)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            yAxisId="left"
            dataKey="value"
            radius={[8, 8, 0, 0]}
            fill="#8B5CF6"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="confidence"
            stroke="#EC4899"
            strokeWidth={2}
            dot={{ fill: '#EC4899', strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
