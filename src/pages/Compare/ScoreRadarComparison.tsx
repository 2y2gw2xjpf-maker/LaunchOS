import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { SavedAnalysis } from '@/types';
import { COMPARISON_COLORS } from '@/types';

interface ScoreRadarComparisonProps {
  analyses: SavedAnalysis[];
}

export const ScoreRadarComparison = ({ analyses }: ScoreRadarComparisonProps) => {
  // Prepare radar data
  const radarData = React.useMemo(() => {
    const factors = [
      { key: 'bootstrap', label: 'Bootstrap' },
      { key: 'investor', label: 'Investor' },
      { key: 'hybrid', label: 'Hybrid' },
      { key: 'confidence', label: 'Konfidenz' },
    ];

    return factors.map((factor) => {
      const dataPoint: Record<string, unknown> = { subject: factor.label };

      analyses.forEach((analysis, index) => {
        if (factor.key === 'confidence') {
          dataPoint[`analysis_${index}`] = analysis.routeResult?.confidence || 0;
        } else {
          dataPoint[`analysis_${index}`] =
            analysis.routeResult?.scores[factor.key as keyof typeof analysis.routeResult.scores] || 0;
        }
      });

      return dataPoint;
    });
  }, [analyses]);

  // Prepare bar chart data for detailed scores
  const scoreBarData = React.useMemo(() => {
    return analyses.map((analysis, index) => ({
      name: analysis.name,
      bootstrap: analysis.routeResult?.scores.bootstrap || 0,
      investor: analysis.routeResult?.scores.investor || 0,
      hybrid: analysis.routeResult?.scores.hybrid || 0,
      color: COMPARISON_COLORS[index],
    }));
  }, [analyses]);

  return (
    <div className="space-y-6">
      {/* Radar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-soft"
      >
        <h3 className="font-display text-lg text-navy mb-4">Score-Ubersicht</h3>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#2d3436', fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: '#9ca3af', fontSize: 10 }}
              />

              {analyses.map((analysis, index) => (
                <Radar
                  key={analysis.id}
                  name={analysis.name}
                  dataKey={`analysis_${index}`}
                  stroke={COMPARISON_COLORS[index]}
                  fill={COMPARISON_COLORS[index]}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              ))}

              <Legend
                wrapperStyle={{ paddingTop: 20 }}
                formatter={(value) => (
                  <span className="text-sm text-charcoal">{value}</span>
                )}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white rounded-lg shadow-lg border border-navy/10 p-3">
                        <p className="font-medium text-navy mb-2">
                          {payload[0]?.payload?.subject}
                        </p>
                        {payload.map((entry, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-charcoal/70">{entry.name}:</span>
                            <span className="font-medium text-navy">
                              {entry.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Detailed Score Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-soft"
      >
        <h3 className="font-display text-lg text-navy mb-4">Detaillierter Vergleich</h3>

        <div className="space-y-6">
          {['Bootstrap', 'Investor', 'Hybrid'].map((category) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-charcoal/60 mb-3">
                {category}-Score
              </h4>
              <div className="space-y-3">
                {scoreBarData.map((data, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: data.color }}
                    />
                    <span className="text-sm text-navy w-32 truncate">
                      {data.name}
                    </span>
                    <div className="flex-1 h-3 bg-navy/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${
                            data[category.toLowerCase() as keyof typeof data]
                          }%`,
                        }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: data.color }}
                      />
                    </div>
                    <span className="text-sm font-medium text-navy w-10 text-right">
                      {data[category.toLowerCase() as keyof typeof data]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Score Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-4 justify-center"
      >
        {analyses.map((analysis, index) => (
          <div key={analysis.id} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: COMPARISON_COLORS[index] }}
            />
            <span className="text-sm text-charcoal/70">{analysis.name}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};
