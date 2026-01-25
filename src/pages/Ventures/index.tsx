/**
 * Ventures Library Page
 * Übersicht aller Ventures mit Status und Aktionen
 */

import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Rocket,
  Plus,
  MoreVertical,
  Trash2,
  Edit,
  CheckCircle2,
  TrendingUp,
  Calendar,
  BarChart3,
  Map,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Users,
  Building2,
} from 'lucide-react';
import { Header, PageContainer } from '@/components/layout';
import { EnhancedSidebar } from '@/components/layout/sidebar/EnhancedSidebar';
import { Card, Button } from '@/components/ui';
import { useVentureContext } from '@/contexts/VentureContext';
import { useStore } from '@/store';
import { cn } from '@/lib/utils/cn';

// Stage Labels
const STAGE_LABELS: Record<string, string> = {
  'idea': 'Idee',
  'pre-seed': 'Pre-Seed',
  'seed': 'Seed',
  'series-a': 'Series A',
  'series-b': 'Series B+',
  'growth': 'Growth',
};

// Stage Colors
const STAGE_COLORS: Record<string, string> = {
  'idea': 'bg-gray-100 text-gray-700',
  'pre-seed': 'bg-purple-100 text-purple-700',
  'seed': 'bg-blue-100 text-blue-700',
  'series-a': 'bg-green-100 text-green-700',
  'series-b': 'bg-emerald-100 text-emerald-700',
  'growth': 'bg-amber-100 text-amber-700',
};

export function VenturesPage() {
  const navigate = useNavigate();
  const {
    ventures,
    activeVenture,
    isLoading,
    error,
    setActiveVenture,
    deleteVenture,
    refresh,
    demoVentures,
    enterDemoMode,
  } = useVentureContext();
  const { loadDemoAnalysis } = useStore();
  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleSetActive = async (id: string) => {
    await setActiveVenture(id);
    setMenuOpenId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Möchtest du dieses Venture wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      setDeletingId(id);
      await deleteVenture(id);
      setDeletingId(null);
      setMenuOpenId(null);
    }
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setMenuOpenId(null);
    if (menuOpenId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [menuOpenId]);

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <EnhancedSidebar />
      <PageContainer withSidebar maxWidth="wide">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-display-sm md:text-display-md text-text-primary mb-2">
                Meine Ventures
              </h1>
              <p className="text-text-secondary text-lg">
                Verwalte alle deine Startups und Projekte an einem Ort.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refresh()}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Aktualisieren
              </Button>
              <Link to="/venture/create">
                <Button variant="primary" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Neues Venture
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && ventures.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Lade Ventures...</p>
            </div>
          </div>
        ) : ventures.length === 0 ? (
          /* Empty State */
          <Card className="p-12 text-center bg-white/80">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-6">
              <Rocket className="w-8 h-8 text-purple-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Noch keine Ventures erstellt
            </h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Starte dein erstes Venture und beginne mit der Planung deines Startups.
              Alle deine Ventures werden hier gespeichert.
            </p>
            <Link to="/venture/create">
              <Button variant="primary" className="gap-2">
                <Plus className="w-4 h-4" />
                Erstes Venture erstellen
              </Button>
            </Link>
          </Card>
        ) : (
          /* Ventures Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ventures.map((venture, index) => {
              const isActive = venture.id === activeVenture?.id;
              const isDeleting = deletingId === venture.id;

              return (
                <motion.div
                  key={venture.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={cn(
                    "p-6 bg-white/80 relative overflow-hidden transition-all",
                    isActive && "ring-2 ring-purple-500 border-purple-200",
                    isDeleting && "opacity-50 pointer-events-none"
                  )}>
                    {/* Active Badge */}
                    {isActive && (
                      <div className="absolute top-4 right-4">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Aktiv
                        </span>
                      </div>
                    )}

                    {/* Menu Button */}
                    {!isActive && (
                      <div className="absolute top-4 right-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(menuOpenId === venture.id ? null : venture.id);
                          }}
                          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-400" />
                        </button>

                        {/* Dropdown Menu */}
                        {menuOpenId === venture.id && (
                          <div className="absolute right-0 top-8 z-10 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
                            <button
                              onClick={() => handleSetActive(venture.id)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              Als aktiv setzen
                            </button>
                            <button
                              onClick={() => {
                                setMenuOpenId(null);
                                navigate('/venture/data-input');
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4 text-gray-500" />
                              Bearbeiten
                            </button>
                            <hr className="my-2" />
                            <button
                              onClick={() => handleDelete(venture.id)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Löschen
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Venture Info */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <Rocket className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 pr-8">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {venture.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {venture.industry || 'Keine Branche'}
                        </p>
                      </div>
                    </div>

                    {/* Stage Badge */}
                    {venture.stage && (
                      <div className="mb-4">
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full",
                          STAGE_COLORS[venture.stage] || 'bg-gray-100 text-gray-700'
                        )}>
                          {STAGE_LABELS[venture.stage] || venture.stage}
                        </span>
                      </div>
                    )}

                    {/* Progress Indicators */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          Datenlevel
                        </span>
                        <span className="font-medium text-gray-700">
                          Tier {venture.tierLevel || 1}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Erstellt
                        </span>
                        <span className="font-medium text-gray-700">
                          {new Date(venture.createdAt).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {isActive ? (
                        <>
                          <Link to="/whats-next" className="flex-1">
                            <Button variant="outline" size="sm" className="w-full gap-1">
                              <Map className="w-4 h-4" />
                              Was jetzt?
                            </Button>
                          </Link>
                          <Link to="/venture/data-input" className="flex-1">
                            <Button variant="primary" size="sm" className="w-full gap-1">
                              <TrendingUp className="w-4 h-4" />
                              Daten
                            </Button>
                          </Link>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleSetActive(venture.id)}
                        >
                          Als aktiv setzen
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}

            {/* Add New Venture Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ventures.length * 0.05 }}
            >
              <Link to="/venture/create">
                <Card className="p-6 bg-white/50 border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all h-full min-h-[280px] flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                    <Plus className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="font-medium text-gray-500">Neues Venture erstellen</p>
                </Card>
              </Link>
            </motion.div>
          </div>
        )}

        {/* Demo Ventures Section */}
        <div className="mt-12 pt-8 border-t border-amber-200/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-display text-xl text-text-primary">
                Demo Ventures erkunden
              </h2>
              <p className="text-sm text-text-secondary">
                Beispiel-Startups zum Ausprobieren aller Features
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {demoVentures.map((venture, index) => (
              <motion.div
                key={venture.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className={cn(
                  'relative bg-white rounded-2xl border border-amber-200/50 overflow-hidden h-full',
                  'shadow-sm hover:shadow-lg hover:shadow-amber-100/50',
                  'transition-shadow cursor-pointer group flex flex-col'
                )}
                onClick={async () => {
                  console.log('[Ventures] Demo venture clicked:', venture.id);
                  enterDemoMode(venture.id);
                  // Load the demo analysis (creates/links if needed)
                  console.log('[Ventures] Calling loadDemoAnalysis...');
                  try {
                    const success = await loadDemoAnalysis(venture.id);
                    console.log('[Ventures] loadDemoAnalysis returned:', success);
                    // Wait for React to propagate the state changes before navigating
                    await new Promise(resolve => setTimeout(resolve, 100));
                    console.log('[Ventures] Navigating to /whats-next');
                    navigate('/whats-next');
                  } catch (error) {
                    console.error('[Ventures] Error in loadDemoAnalysis:', error);
                    navigate('/whats-next');
                  }
                }}
              >
                {/* Gradient Header */}
                <div className={cn(
                  'h-2 bg-gradient-to-r',
                  venture.demoScenario === 'bootstrap' && 'from-emerald-500 to-teal-500',
                  venture.demoScenario === 'investor' && 'from-blue-500 to-indigo-500',
                  venture.demoScenario === 'hybrid' && 'from-purple-500 to-pink-500'
                )} />

                <div className="p-5 flex flex-col h-full">
                  {/* Header mit Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {venture.name}
                        </h3>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                          <Sparkles className="w-2.5 h-2.5" />
                          Demo
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{venture.tagline}</p>
                    </div>
                  </div>

                  {/* Szenario Label */}
                  <div className="mb-4">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white',
                      venture.demoScenario === 'bootstrap' && 'bg-gradient-to-r from-emerald-500 to-teal-500',
                      venture.demoScenario === 'investor' && 'bg-gradient-to-r from-blue-500 to-indigo-500',
                      venture.demoScenario === 'hybrid' && 'bg-gradient-to-r from-purple-500 to-pink-500'
                    )}>
                      <Sparkles className="w-3 h-3" />
                      {venture.demoScenario === 'bootstrap' && 'Bootstrap Szenario'}
                      {venture.demoScenario === 'investor' && 'Investor Szenario'}
                      {venture.demoScenario === 'hybrid' && 'Hybrid Szenario'}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">MRR</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {venture.monthlyRevenue ? new Intl.NumberFormat('de-DE', {
                          style: 'currency',
                          currency: 'EUR',
                          maximumFractionDigits: 0,
                        }).format(venture.monthlyRevenue) : '-'}
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
                        {STAGE_LABELS[venture.stage || ''] || venture.stage || '-'}
                      </p>
                    </div>
                  </div>

                  {/* Beschreibung - fixed height for consistent button alignment */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10">
                    {venture.demoDescription}
                  </p>

                  {/* CTA - mt-auto ensures it's at the bottom */}
                  <button className={cn(
                    'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl mt-auto',
                    'bg-amber-50 text-amber-700 font-medium text-sm',
                    'group-hover:bg-amber-100 transition-colors'
                  )}>
                    Erkunden
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Deine Ventures werden automatisch in der Cloud gespeichert.
            Du kannst jederzeit zwischen verschiedenen Ventures wechseln.
          </p>
        </div>
      </PageContainer>
    </div>
  );
}

export default VenturesPage;
