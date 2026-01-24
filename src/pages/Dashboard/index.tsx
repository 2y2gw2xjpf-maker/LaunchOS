/**
 * LaunchOS Dashboard
 * Zentrale Übersicht für Gründer
 */

import * as React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Rocket,
  Target,
  Users,
  FolderOpen,
  BarChart3,
  Wrench,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Header, EnhancedSidebar, PageContainer } from '@/components/layout';
import { useAuth } from '@/components/auth/AuthProvider';
import { useVentureContext } from '@/contexts/VentureContext';
import { useInvestorCRM } from '@/hooks/useInvestorCRM';

export function DashboardPage() {
  const { user } = useAuth();
  const { activeVenture } = useVentureContext();
  const { contacts } = useInvestorCRM();

  // State für Nächste Schritte - default eingeklappt
  const [nextStepsOpen, setNextStepsOpen] = React.useState(false);

  // Berechne Stats
  const investorCount = contacts?.length || 0;

  // Begrüßung basierend auf Tageszeit
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Guten Morgen';
    if (hour < 18) return 'Guten Tag';
    return 'Guten Abend';
  };

  // Vorname extrahieren - nur ersten Teil vor Punkt nehmen und kapitalisieren
  const rawFirstName =
    user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.email?.split('@')[0]?.split('.')[0] ||
    'Gründer';
  const firstName = rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1).toLowerCase();

  // Stats mit purple/pink Branding
  const stats = [
    {
      label: 'Stage',
      value: activeVenture?.stage || '—',
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      label: 'Investoren',
      value: investorCount,
      icon: Users,
      color: 'text-pink-600',
      bg: 'bg-pink-100',
    },
    {
      label: 'Dokumente',
      value: '—',
      icon: FolderOpen,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      label: 'Launch Score',
      value: '—',
      icon: Rocket,
      color: 'text-pink-600',
      bg: 'bg-pink-100',
    },
  ];

  // Quick Links mit purple/pink Gradienten
  const quickLinks = [
    {
      title: 'Was tun?',
      description: 'Finde deinen nächsten Schritt',
      href: '/whats-next',
      icon: Target,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Bewertung',
      description: 'Berechne den Wert deines Startups',
      href: '/valuation',
      icon: BarChart3,
      gradient: 'from-purple-600 to-purple-500',
    },
    {
      title: "Builder's Toolkit",
      description: 'Guides, Checklists & Prompts',
      href: '/toolkit',
      icon: Wrench,
      gradient: 'from-pink-500 to-purple-500',
    },
    {
      title: 'Investoren CRM',
      description: 'Verwalte deine Pipeline',
      href: '/investors',
      icon: Users,
      gradient: 'from-purple-500 to-pink-600',
    },
  ];

  const nextSteps = [
    { done: true, text: 'Account erstellen', href: null },
    { done: !!activeVenture, text: 'Erstes Venture anlegen', href: '/venture/create' },
    {
      done: false,
      text: 'MVP-Readiness Checklist starten',
      href: '/toolkit/checklists/mvp-readiness',
    },
    { done: false, text: 'Startup-Bewertung durchführen', href: '/valuation' },
    {
      done: investorCount > 0,
      text: 'Ersten Investor hinzufügen',
      href: '/investors',
    },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <EnhancedSidebar />

      <PageContainer withSidebar maxWidth="wide">
        {/* Header mit Begrüßung */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-display-sm text-charcoal">
            {getGreeting()}, {firstName}!
          </h1>
          <p className="text-charcoal/60 mt-1">
            {activeVenture ? (
              <>
                Arbeite an{' '}
                <span className="font-medium text-purple-600">
                  {activeVenture.name}
                </span>
              </>
            ) : (
              'Starte dein erstes Venture'
            )}
          </p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl border border-purple-100 p-5"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}
                >
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-charcoal">{stat.value}</p>
                  <p className="text-sm text-charcoal/50">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Schnellzugriff - Volle Breite */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-charcoal mb-4">
            Schnellzugriff
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Link to={item.href} className="block group">
                  <div
                    className="bg-white/80 backdrop-blur-sm rounded-xl border border-purple-100 p-5
                                hover:border-purple-300 hover:shadow-md transition-all h-full"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-r ${item.gradient}
                                    flex items-center justify-center flex-shrink-0`}
                      >
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-semibold text-charcoal group-hover:text-purple-600
                                     transition-colors flex items-center gap-2"
                        >
                          {item.title}
                          <ArrowRight
                            className="w-4 h-4 opacity-0 -translate-x-2
                                               group-hover:opacity-100 group-hover:translate-x-0
                                               transition-all"
                          />
                        </h3>
                        <p className="text-sm text-charcoal/50 mt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Nächste Schritte - Collapsible, default eingeklappt */}
        <div className="mb-8">
          <button
            onClick={() => setNextStepsOpen(!nextStepsOpen)}
            className="w-full flex items-center justify-between mb-4 group"
          >
            <h2 className="text-lg font-semibold text-charcoal">
              Nächste Schritte
              <span className="ml-2 text-sm font-normal text-charcoal/50">
                ({nextSteps.filter((s) => s.done).length}/{nextSteps.length} erledigt)
              </span>
            </h2>
            <ChevronDown
              className={`w-5 h-5 text-charcoal/40 transition-transform ${
                nextStepsOpen ? 'rotate-0' : '-rotate-90'
              }`}
            />
          </button>
          <AnimatePresence>
            {nextStepsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
                  <div className="relative">
                    {/* Verbindungslinie */}
                    <div className="absolute left-[11px] top-6 bottom-6 w-0.5 bg-purple-200" />

                    <div className="space-y-4">
                      {nextSteps.map((step, index) => (
                        <div key={index} className="flex items-start gap-4 relative">
                          {/* Punkt */}
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                              step.done
                                ? 'bg-purple-500'
                                : 'bg-white border-2 border-purple-300'
                            }`}
                          >
                            {step.done && (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            )}
                          </div>

                          {/* Text */}
                          <div className="flex-1 pb-4">
                            {step.href && !step.done ? (
                              <Link
                                to={step.href}
                                className="block font-medium text-charcoal hover:text-purple-600 transition-colors"
                              >
                                {step.text}
                                <span className="block text-sm text-purple-500 mt-1 hover:underline">
                                  Klicke um zu starten →
                                </span>
                              </Link>
                            ) : (
                              <span
                                className={
                                  step.done
                                    ? 'text-charcoal/40 line-through'
                                    : 'font-medium text-charcoal'
                                }
                              >
                                {step.text}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Venture + AI-Coach - Volle Breite, nebeneinander */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Aktives Venture */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-charcoal">
                Dein Venture
              </h2>
              <Link
                to="/ventures"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Alle Ventures →
              </Link>
            </div>
            {activeVenture ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-purple-100 p-5 h-[calc(100%-2rem)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal">
                      {activeVenture.name}
                    </h3>
                    <p className="text-sm text-charcoal/50">
                      {activeVenture.industry || 'Keine Branche'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-charcoal/50">Stage</span>
                    <span className="font-medium text-charcoal">
                      {activeVenture.stage || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal/50">Datenlevel</span>
                    <span className="font-medium text-charcoal">
                      Tier {activeVenture.tierLevel || 1}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    to="/venture/data-input"
                    className="flex-1 py-2 px-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm font-medium text-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Daten ergänzen
                  </Link>
                  <Link
                    to="/whats-next"
                    className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                  >
                    Was jetzt?
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-purple-100 p-5 text-center h-[calc(100%-2rem)] flex flex-col justify-center">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mx-auto mb-3">
                  <Rocket className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-charcoal/50 mb-4">Noch kein Venture angelegt</p>
                <Link
                  to="/venture/create"
                  className="inline-flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-shadow mx-auto"
                >
                  Venture starten
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* AI-Coach */}
          <div>
            <h2 className="text-lg font-semibold text-charcoal mb-4">
              Brauchst du Hilfe?
            </h2>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 p-5 h-[calc(100%-2rem)] flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-charcoal">AI-Coach</h3>
              </div>
              <p className="text-sm text-charcoal/60 mb-4 flex-1">
                Unser AI-Coach hilft dir bei allen Fragen rund um dein Startup.
                Egal ob Strategie, Finanzierung oder Produktentwicklung.
              </p>
              <button className="w-full py-2 px-4 bg-white border border-purple-200 rounded-lg text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors">
                Chat öffnen
              </button>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}

export default DashboardPage;
