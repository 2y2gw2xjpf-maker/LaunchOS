import * as React from 'react';
import { Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface BenchmarkData {
  average: number;
  percentile25: number;
  percentile75: number;
  description?: string;
}

interface ScoreBenchmarkProps {
  score: number;
  benchmark: BenchmarkData;
  label: string;
  showTrend?: boolean;
  className?: string;
}

export const ScoreBenchmark = ({
  score,
  benchmark,
  label,
  showTrend = true,
  className,
}: ScoreBenchmarkProps) => {
  const { average, percentile25, percentile75, description } = benchmark;

  // Determine position relative to benchmark
  const _isAboveAverage = score > average;
  const isBelowP25 = score < percentile25;
  const isAboveP75 = score > percentile75;

  const getTrendInfo = () => {
    if (isAboveP75) {
      return {
        icon: <TrendingUp className="w-4 h-4 text-sage" />,
        label: 'Überdurchschnittlich',
        color: 'text-sage',
        bg: 'bg-sage/10',
      };
    }
    if (isBelowP25) {
      return {
        icon: <TrendingDown className="w-4 h-4 text-gold" />,
        label: 'Unter Durchschnitt',
        color: 'text-gold-700',
        bg: 'bg-gold/10',
      };
    }
    return {
      icon: <Minus className="w-4 h-4 text-charcoal/60" />,
      label: 'Durchschnittlich',
      color: 'text-charcoal/70',
      bg: 'bg-navy/5',
    };
  };

  const trend = getTrendInfo();

  // Calculate position for marker (0-100 scale)
  const getMarkerPosition = (value: number) => {
    // Assuming 0-150 scale for scores
    return Math.min(100, Math.max(0, (value / 150) * 100));
  };

  return (
    <div className={cn('p-4 rounded-xl bg-cream-50', className)}>
      {/* Header with Trend */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-charcoal/40" />
          <span className="text-sm text-charcoal/60">{label}</span>
        </div>
        {showTrend && (
          <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', trend.bg, trend.color)}>
            {trend.icon}
            {trend.label}
          </div>
        )}
      </div>

      {/* Benchmark Bar */}
      <div className="relative h-3 bg-navy/10 rounded-full mb-2">
        {/* Interquartile Range (P25-P75) */}
        <div
          className="absolute h-full bg-brand/20 rounded-full"
          style={{
            left: `${getMarkerPosition(percentile25)}%`,
            width: `${getMarkerPosition(percentile75) - getMarkerPosition(percentile25)}%`,
          }}
        />

        {/* Average Marker */}
        <div
          className="absolute w-0.5 h-4 bg-charcoal/40 -top-0.5 rounded-full"
          style={{ left: `${getMarkerPosition(average)}%` }}
        >
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-charcoal/40 whitespace-nowrap">
            Ø {average}%
          </span>
        </div>

        {/* User Score Marker */}
        <div
          className={cn(
            'absolute w-4 h-4 -top-0.5 rounded-full border-2 border-white shadow-sm transition-all',
            isAboveP75 ? 'bg-sage' : isBelowP25 ? 'bg-gold' : 'bg-brand'
          )}
          style={{ left: `${getMarkerPosition(score)}%`, transform: 'translateX(-50%)' }}
        >
          <span
            className={cn(
              'absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap',
              trend.color
            )}
          >
            {score}%
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-between text-[10px] text-charcoal/40 mt-4">
        <span>P25: {percentile25}%</span>
        <span>Durchschnitt: {average}%</span>
        <span>P75: {percentile75}%</span>
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs text-charcoal/50 mt-3 leading-relaxed">{description}</p>
      )}
    </div>
  );
};

// Pre-defined benchmarks for common startup metrics
export const STARTUP_BENCHMARKS: Record<string, BenchmarkData> = {
  teamStrength: {
    average: 70,
    percentile25: 50,
    percentile75: 85,
    description: 'Starke Teams haben: erfahrene Gründer, komplementäre Skills, nachweisbare Track Records.',
  },
  marketSize: {
    average: 60,
    percentile25: 40,
    percentile75: 80,
    description: 'Bewerte realistisch: TAM > 1 Mrd.€ ist gut, aber SAM und SOM sind relevanter.',
  },
  productTech: {
    average: 55,
    percentile25: 35,
    percentile75: 75,
    description: 'Produkt-Score hängt ab von: MVP Status, Tech-Differenzierung, IP/Defensibility.',
  },
  competition: {
    average: 50,
    percentile25: 30,
    percentile75: 70,
    description: 'Weniger Wettbewerb = höherer Score. Aber: Kein Wettbewerb kann auch kein Markt bedeuten.',
  },
  traction: {
    average: 45,
    percentile25: 20,
    percentile75: 70,
    description: 'Traction: User-Wachstum, Revenue-Entwicklung, Engagement-Metriken.',
  },
};

export default ScoreBenchmark;
