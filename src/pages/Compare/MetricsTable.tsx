import * as React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { SavedAnalysis, ComparisonMetric } from '@/types';
import { COMPARISON_COLORS } from '@/types';

interface MetricsTableProps {
  metrics: ComparisonMetric[];
  analyses: SavedAnalysis[];
}

export const MetricsTable = ({ metrics, analyses }: MetricsTableProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-soft overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-navy/10">
              <th className="px-6 py-4 text-left text-sm font-medium text-charcoal/60">
                Metrik
              </th>
              {analyses.map((analysis, index) => (
                <th key={analysis.id} className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COMPARISON_COLORS[index] }}
                    />
                    <span className="text-sm font-medium text-navy truncate max-w-[120px]">
                      {analysis.name}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric, rowIndex) => (
              <MetricRow
                key={metric.key}
                metric={metric}
                rowIndex={rowIndex}
                analysisCount={analyses.length}
              />
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

interface MetricRowProps {
  metric: ComparisonMetric;
  rowIndex: number;
  analysisCount: number;
}

const MetricRow = ({ metric, rowIndex, analysisCount }: MetricRowProps) => {
  // Find best value based on direction
  const getBestIndex = () => {
    if (!metric.betterDirection || metric.betterDirection === 'neutral') {
      return -1;
    }

    const numericValues = metric.values.map((v) =>
      typeof v.value === 'number' ? v.value : 0
    );

    if (metric.betterDirection === 'higher') {
      const max = Math.max(...numericValues);
      return numericValues.indexOf(max);
    } else {
      const min = Math.min(...numericValues);
      return numericValues.indexOf(min);
    }
  };

  const bestIndex = getBestIndex();

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rowIndex * 0.05 }}
      className={cn(
        'border-b border-navy/5 last:border-0',
        rowIndex % 2 === 0 ? 'bg-white' : 'bg-navy/[0.02]'
      )}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-navy">{metric.label}</span>
          {metric.betterDirection && metric.betterDirection !== 'neutral' && (
            <span className="text-xs text-charcoal/40">
              ({metric.betterDirection === 'higher' ? '↑ besser' : '↓ besser'})
            </span>
          )}
        </div>
      </td>

      {metric.values.map((value, colIndex) => {
        const isBest = colIndex === bestIndex;
        const isNumeric = typeof value.value === 'number';

        return (
          <td key={value.analysisId} className="px-6 py-4 text-center">
            <div
              className={cn(
                'inline-flex items-center gap-1 px-3 py-1 rounded-lg',
                isBest && metric.betterDirection !== 'neutral' ? 'bg-sage/10' : ''
              )}
            >
              <span
                className={cn(
                  'text-sm font-medium',
                  isBest && metric.betterDirection !== 'neutral'
                    ? 'text-sage'
                    : 'text-navy'
                )}
              >
                {value.displayValue}
              </span>

              {isBest && metric.betterDirection !== 'neutral' && (
                <span className="text-sage">
                  {metric.betterDirection === 'higher' ? (
                    <ArrowUp className="w-3 h-3" />
                  ) : (
                    <ArrowDown className="w-3 h-3" />
                  )}
                </span>
              )}
            </div>
          </td>
        );
      })}
    </motion.tr>
  );
};

// Additional comparison utilities
export const generateComparisonSummary = (
  metrics: ComparisonMetric[],
  analyses: SavedAnalysis[]
): string[] => {
  const summaries: string[] = [];

  // Find analysis with highest confidence
  const confidenceMetric = metrics.find((m) => m.key === 'confidence');
  if (confidenceMetric) {
    const maxConfidence = Math.max(
      ...confidenceMetric.values.map((v) => (typeof v.value === 'number' ? v.value : 0))
    );
    const bestAnalysis = confidenceMetric.values.find(
      (v) => v.value === maxConfidence
    );
    if (bestAnalysis) {
      summaries.push(
        `"${bestAnalysis.analysisName}" hat die hochste Konfidenz (${maxConfidence}%).`
      );
    }
  }

  // Check route consistency
  const routeMetric = metrics.find((m) => m.key === 'route');
  if (routeMetric) {
    const routes = routeMetric.values.map((v) => v.value);
    const uniqueRoutes = [...new Set(routes)];
    if (uniqueRoutes.length === 1) {
      summaries.push(
        `Alle Analysen empfehlen die gleiche Route: ${routeMetric.values[0].displayValue}.`
      );
    } else {
      summaries.push(
        `Die Analysen zeigen ${uniqueRoutes.length} verschiedene Route-Empfehlungen.`
      );
    }
  }

  return summaries;
};
