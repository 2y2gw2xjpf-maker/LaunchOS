import * as React from 'react';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { cn } from '@/lib/utils/cn';

interface RadarDataPoint {
  subject: string;
  value: number;
  fullMark?: number;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  className?: string;
  fillColor?: string;
  strokeColor?: string;
}

interface TooltipPayload {
  payload: RadarDataPoint;
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-xl shadow-medium border border-brand-100">
        <p className="font-semibold text-charcoal">{data.subject}</p>
        <p className="font-mono text-lg text-brand-600">{data.value}/100</p>
      </div>
    );
  }
  return null;
};

export const RadarChart = ({
  data,
  className,
  fillColor = 'rgba(139, 92, 246, 0.3)',
  strokeColor = '#8B5CF6',
}: RadarChartProps) => {
  return (
    <div className={cn('w-full h-[300px]', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="rgba(139, 92, 246, 0.2)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#2D3436', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#2D3436', fontSize: 10 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name="Score"
            dataKey="value"
            stroke={strokeColor}
            fill={fillColor}
            strokeWidth={2}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};
