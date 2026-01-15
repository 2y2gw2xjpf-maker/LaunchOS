import * as React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils/cn';
import type { ValuationMethodResult } from '@/types';

interface ValuationChartProps {
  results: ValuationMethodResult[];
  className?: string;
}

const methodLabels: Record<string, string> = {
  berkus: 'Berkus',
  scorecard: 'Scorecard',
  vc_method: 'VC Method',
  comparables: 'Comparables',
  dcf: 'DCF',
  cost_to_duplicate: 'Cost to Duplicate',
};

const COLORS = ['#0A1628', '#4A7C59', '#F5A623', '#717D99', '#9BC0A7'];

export const ValuationChart = ({ results, className }: ValuationChartProps) => {
  const data = results.map((result, index) => ({
    name: methodLabels[result.method] || result.method,
    value: result.value,
    confidence: result.confidence,
    color: COLORS[index % COLORS.length],
  }));

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
        <div className="bg-white p-4 rounded-xl shadow-medium border border-navy/10">
          <p className="font-semibold text-navy mb-1">{data.name}</p>
          <p className="font-mono text-lg text-navy">{formatCurrency(data.value)}</p>
          <p className="text-sm text-charcoal/60 mt-1">
            Confidence: {data.confidence}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn('w-full h-[300px]', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(10, 22, 40, 0.1)" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#2D3436', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(10, 22, 40, 0.1)' }}
          />
          <YAxis
            tickFormatter={formatCurrency}
            tick={{ fill: '#2D3436', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(10, 22, 40, 0.1)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
