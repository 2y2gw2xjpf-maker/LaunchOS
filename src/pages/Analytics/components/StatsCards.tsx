/**
 * StatsCards - Key Metrics mit Trend-Indikatoren
 */

import { motion } from 'framer-motion';
import {
  Users,
  MessageSquare,
  FileText,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import type { DashboardStats } from '@/hooks/useAnalytics';

interface StatsCardsProps {
  stats: DashboardStats | null;
  isLoading?: boolean;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  delay?: number;
}

function StatCard({ title, value, icon: Icon, color, trend = 'neutral', trendValue, delay = 0 }: StatCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trendValue && (
            <div className={`flex items-center gap-1 mt-2 ${trendColor}`}>
              <TrendIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{trendValue}</span>
            </div>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div>
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-8 w-16 bg-gray-200 rounded mt-2" />
          <div className="h-4 w-20 bg-gray-200 rounded mt-2" />
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Kontakte',
      value: stats.totalContacts,
      icon: Users,
      color: '#9333ea',
      trend: 'up' as const,
      trendValue: '+12% diesen Monat',
    },
    {
      title: 'Aktive Gespräche',
      value: stats.activeConversations,
      icon: MessageSquare,
      color: '#3b82f6',
      trend: 'up' as const,
      trendValue: `${stats.followUpsDue} Follow-ups fällig`,
    },
    {
      title: 'Term Sheets',
      value: stats.termSheets,
      icon: FileText,
      color: '#f59e0b',
      trend: stats.termSheets > 0 ? 'up' as const : 'neutral' as const,
      trendValue: stats.termSheets > 0 ? 'In Verhandlung' : 'Noch keine',
    },
    {
      title: 'Abgeschlossene Deals',
      value: stats.closedDeals,
      icon: Trophy,
      color: '#22c55e',
      trend: stats.closedDeals > 0 ? 'up' as const : 'neutral' as const,
      trendValue: stats.closedDeals > 0 ? 'Erfolgreich' : 'In Arbeit',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <StatCard
          key={card.title}
          {...card}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
}

export default StatsCards;
