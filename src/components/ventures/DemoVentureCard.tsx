/**
 * DemoVentureCard Component
 * Karte für Demo-Ventures auf der Ventures-Seite
 */

import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Users, Building2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { DemoVentureBadge } from './DemoVentureBadge';
import type { DemoVenture } from '@/data/demoVentures';

interface DemoVentureCardProps {
  venture: DemoVenture;
  onExplore: () => void;
  className?: string;
}

const scenarioLabels: Record<DemoVenture['demoScenario'], string> = {
  bootstrap: 'Bootstrap',
  investor: 'Investor',
  hybrid: 'Hybrid',
};

const scenarioColors: Record<DemoVenture['demoScenario'], string> = {
  bootstrap: 'from-emerald-500 to-teal-500',
  investor: 'from-blue-500 to-indigo-500',
  hybrid: 'from-purple-500 to-pink-500',
};

export function DemoVentureCard({ venture, onExplore, className }: DemoVentureCardProps) {
  const formatRevenue = (revenue?: number) => {
    if (!revenue) return '-';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(revenue);
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative bg-white rounded-2xl border border-amber-200/50 overflow-hidden',
        'shadow-sm hover:shadow-lg hover:shadow-amber-100/50',
        'transition-shadow cursor-pointer group',
        className
      )}
      onClick={onExplore}
    >
      {/* Gradient Header */}
      <div
        className={cn(
          'h-2 bg-gradient-to-r',
          scenarioColors[venture.demoScenario]
        )}
      />

      <div className="p-5">
        {/* Header mit Badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {venture.name}
              </h3>
              <DemoVentureBadge size="small" />
            </div>
            <p className="text-sm text-gray-500 truncate">{venture.tagline}</p>
          </div>
        </div>

        {/* Szenario Label */}
        <div className="mb-4">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
              'bg-gradient-to-r text-white',
              scenarioColors[venture.demoScenario]
            )}
          >
            <Sparkles className="w-3 h-3" />
            {scenarioLabels[venture.demoScenario]} Szenario
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <TrendingUp className="w-4 h-4 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500">MRR</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatRevenue(venture.monthlyRevenue)}
            </p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Team</p>
            <p className="text-sm font-semibold text-gray-900">
              {venture.teamSize || '-'}
            </p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <Building2 className="w-4 h-4 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Stage</p>
            <p className="text-sm font-semibold text-gray-900 capitalize">
              {venture.stage || '-'}
            </p>
          </div>
        </div>

        {/* Beschreibung */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {venture.demoDescription}
        </p>

        {/* CTA */}
        <button
          className={cn(
            'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl',
            'bg-amber-50 text-amber-700 font-medium text-sm',
            'group-hover:bg-amber-100 transition-colors'
          )}
        >
          Erkunden
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}

export default DemoVentureCard;
