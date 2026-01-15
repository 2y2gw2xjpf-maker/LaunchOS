import * as React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { RecommendationBadge, ConfidenceIndicator } from '@/components/results';
import type { SavedAnalysis } from '@/types';
import { COMPARISON_COLORS } from '@/types';

interface RouteComparisonProps {
  analyses: SavedAnalysis[];
}

export const RouteComparison = ({ analyses }: RouteComparisonProps) => {
  return (
    <div className="space-y-6">
      {/* Route Cards Side by Side */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${analyses.length}, 1fr)` }}>
        {analyses.map((analysis, index) => (
          <motion.div
            key={analysis.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-soft"
            style={{ borderTop: `4px solid ${COMPARISON_COLORS[index]}` }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COMPARISON_COLORS[index] }}
              />
              <h3 className="font-medium text-navy truncate">{analysis.name}</h3>
            </div>

            {/* Recommendation */}
            {analysis.routeResult && (
              <>
                <div className="mb-4">
                  <RecommendationBadge
                    route={analysis.routeResult.recommendation}
                    score={
                      analysis.routeResult.scores[analysis.routeResult.recommendation]
                    }
                    size="md"
                  />
                </div>

                {/* Confidence */}
                <div className="mb-6">
                  <ConfidenceIndicator
                    value={analysis.routeResult.confidence}
                    showExplanation
                  />
                </div>

                {/* Scores */}
                <div className="space-y-3 mb-6">
                  <ScoreBar
                    label="Bootstrap"
                    value={analysis.routeResult.scores.bootstrap}
                    color="#7c9a8a"
                  />
                  <ScoreBar
                    label="Investor"
                    value={analysis.routeResult.scores.investor}
                    color="#d4af37"
                  />
                  <ScoreBar
                    label="Hybrid"
                    value={analysis.routeResult.scores.hybrid}
                    color="#1e3a5f"
                  />
                </div>

                {/* Key Factors */}
                <div className="border-t border-navy/10 pt-4">
                  <h4 className="text-sm font-medium text-navy mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Top Faktoren
                  </h4>
                  <div className="space-y-2">
                    {analysis.routeResult.reasons.slice(0, 3).map((reason, i) => (
                      <div
                        key={i}
                        className={cn(
                          'flex items-start gap-2 text-xs',
                          reason.impact === 'positive'
                            ? 'text-sage'
                            : reason.impact === 'negative'
                            ? 'text-red-500'
                            : 'text-charcoal/60'
                        )}
                      >
                        <span
                          className={cn(
                            'mt-1 w-2 h-2 rounded-full flex-shrink-0',
                            reason.impact === 'positive'
                              ? 'bg-sage'
                              : reason.impact === 'negative'
                              ? 'bg-red-500'
                              : 'bg-charcoal/30'
                          )}
                        />
                        <span>{reason.explanation}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warnings */}
                {analysis.routeResult.warnings.length > 0 && (
                  <div className="border-t border-navy/10 pt-4 mt-4">
                    <h4 className="text-sm font-medium text-gold mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Warnungen
                    </h4>
                    <ul className="space-y-1">
                      {analysis.routeResult.warnings.map((warning, i) => (
                        <li key={i} className="text-xs text-gold">
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Comparison Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-soft"
      >
        <h3 className="font-display text-lg text-navy mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-gold" />
          Vergleichs-Insights
        </h3>

        <div className="space-y-4">
          {generateInsights(analyses).map((insight, index) => (
            <div key={index} className="flex items-start gap-3">
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                  insight.type === 'positive'
                    ? 'bg-sage/20 text-sage'
                    : insight.type === 'warning'
                    ? 'bg-gold/20 text-gold'
                    : 'bg-navy/10 text-navy'
                )}
              >
                {index + 1}
              </div>
              <p className="text-sm text-charcoal/70">{insight.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// Score Bar Component
interface ScoreBarProps {
  label: string;
  value: number;
  color: string;
}

const ScoreBar = ({ label, value, color }: ScoreBarProps) => (
  <div className="flex items-center gap-3">
    <span className="text-xs text-charcoal/60 w-16">{label}</span>
    <div className="flex-1 h-2 bg-navy/10 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
    <span className="text-xs font-medium text-navy w-8 text-right">{value}</span>
  </div>
);

// Generate insights from comparison
interface Insight {
  type: 'positive' | 'warning' | 'neutral';
  text: string;
}

const generateInsights = (analyses: SavedAnalysis[]): Insight[] => {
  const insights: Insight[] = [];

  if (analyses.length < 2) return insights;

  // Check if all have same recommendation
  const recommendations = analyses.map((a) => a.routeResult?.recommendation);
  const uniqueRecs = [...new Set(recommendations)];

  if (uniqueRecs.length === 1) {
    insights.push({
      type: 'positive',
      text: `Alle Analysen empfehlen den ${
        uniqueRecs[0] === 'bootstrap'
          ? 'Bootstrap'
          : uniqueRecs[0] === 'investor'
          ? 'Investor'
          : 'Hybrid'
      }-Weg. Das ist ein klares Signal.`,
    });
  } else {
    insights.push({
      type: 'neutral',
      text: 'Die Analysen zeigen unterschiedliche Empfehlungen. Prufe die Unterschiede in den Eingaben.',
    });
  }

  // Check confidence levels
  const confidences = analyses.map((a) => a.routeResult?.confidence || 0);
  const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;

  if (avgConfidence >= 75) {
    insights.push({
      type: 'positive',
      text: `Hohe durchschnittliche Konfidenz (${Math.round(avgConfidence)}%). Die Analysen basieren auf guten Daten.`,
    });
  } else if (avgConfidence < 60) {
    insights.push({
      type: 'warning',
      text: `Niedrige durchschnittliche Konfidenz (${Math.round(avgConfidence)}%). Erwage, mehr Details einzugeben.`,
    });
  }

  // Check budget differences
  const budgets = analyses.map(
    (a) => a.routeResult?.actionPlan.totalBudget.max || 0
  );
  const maxBudget = Math.max(...budgets);
  const minBudget = Math.min(...budgets);

  if (maxBudget > 0 && minBudget > 0) {
    const diff = ((maxBudget - minBudget) / minBudget) * 100;
    if (diff > 50) {
      insights.push({
        type: 'warning',
        text: `Die Budget-Schatzungen variieren stark (${Math.round(diff)}% Unterschied). Prufe die unterschiedlichen Annahmen.`,
      });
    }
  }

  return insights;
};
