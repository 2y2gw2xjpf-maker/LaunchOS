/**
 * Analytics Dashboard - Hauptseite
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  RefreshCw,
  Download,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useVentureContext } from '@/contexts/VentureContext';
import { Button } from '@/components/ui/button';
import { StatsCards } from './components/StatsCards';
import { ValuationChart } from './components/ValuationChart';
import { PipelineFunnel } from './components/PipelineFunnel';
import { JourneyProgress } from './components/JourneyProgress';
import { ActivityFeed } from './components/ActivityFeed';
import { UpcomingFollowUps } from './components/UpcomingFollowUps';

export default function AnalyticsPage() {
  const { activeVenture } = useVentureContext();
  const {
    dashboardStats,
    pipelineFunnel,
    valuationHistory,
    recentActivities,
    upcomingFollowUps,
    journeyProgress,
    isLoading,
    error,
    refresh,
  } = useAnalytics();

  const handleRefresh = () => {
    refresh();
  };

  const handleExport = () => {
    // Export dashboard data as JSON
    const exportData = {
      exportedAt: new Date().toISOString(),
      venture: activeVenture?.name || 'Alle Ventures',
      stats: dashboardStats,
      pipelineFunnel,
      valuationHistory,
      recentActivities,
      upcomingFollowUps,
      journeyProgress,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleContactClick = (contactId: string) => {
    // Navigate to CRM with contact selected
    window.location.href = `/investors?contact=${contactId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <p className="text-sm text-gray-500">
                  {activeVenture
                    ? `Dashboard für ${activeVenture.name}`
                    : 'Übersicht aller Ventures'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Aktualisieren
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
          >
            {error}
          </motion.div>
        )}

        {/* Stats Cards */}
        <section className="mb-8">
          <StatsCards stats={dashboardStats} isLoading={isLoading} />
        </section>

        {/* Charts Row */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ValuationChart data={valuationHistory} isLoading={isLoading} />
          <PipelineFunnel data={pipelineFunnel} isLoading={isLoading} />
        </section>

        {/* Progress & Activity Row */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <JourneyProgress data={journeyProgress} isLoading={isLoading} />
          <ActivityFeed activities={recentActivities} isLoading={isLoading} />
        </section>

        {/* Follow-ups Section */}
        <section className="mb-8">
          <UpcomingFollowUps
            followUps={upcomingFollowUps}
            isLoading={isLoading}
            onContactClick={handleContactClick}
          />
        </section>

        {/* Quick Actions */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Nächster Schritt</h3>
                <p className="text-purple-100 mt-1">
                  {dashboardStats?.followUpsDue && dashboardStats.followUpsDue > 0
                    ? `Du hast ${dashboardStats.followUpsDue} Follow-ups diese Woche`
                    : dashboardStats?.totalContacts === 0
                      ? 'Füge deinen ersten Investoren-Kontakt hinzu'
                      : 'Halte deine Pipeline aktuell'}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={() => (window.location.href = '/investors')}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Zum CRM
                </Button>
                <Button
                  variant="secondary"
                  className="bg-white text-purple-600 hover:bg-purple-50 border-0"
                  onClick={() => (window.location.href = '/data-room')}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Data Room
                </Button>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
