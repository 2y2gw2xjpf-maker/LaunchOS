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

export const RadarChart = ({
  data,
  className,
  fillColor = 'rgba(74, 124, 89, 0.3)',
  strokeColor = '#4A7C59',
}: RadarChartProps) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-xl shadow-medium border border-navy/10">
          <p className="font-semibold text-navy">{data.subject}</p>
          <p className="font-mono text-lg text-sage">{data.value}/100</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn('w-full h-[300px]', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="rgba(10, 22, 40, 0.1)" />
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
