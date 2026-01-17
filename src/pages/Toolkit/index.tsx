import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wrench, BookOpen, CheckSquare, MessageSquare,
  Puzzle, AlertTriangle, ArrowRight,
  Clock, TrendingUp
} from 'lucide-react';
import { useToolkit } from '@/hooks/useToolkit';
import { Header, EnhancedSidebar, PageContainer } from '@/components/layout';
import { ToolkitSearch } from './components/ToolkitSearch';

const QUICK_LINKS = [
  {
    title: 'MVP-Readiness Checklist',
    description: 'Ist dein Produkt wirklich fertig?',
    href: '/toolkit/checklists/mvp-readiness',
    icon: CheckSquare,
    color: 'from-green-500 to-emerald-600',
  },
  {
    title: 'Tool-Vergleich',
    description: 'Lovable vs Bolt vs Cursor',
    href: '/toolkit/tools',
    icon: Puzzle,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    title: 'Prompt-Bibliothek',
    description: 'Copy-Paste Prompts für jeden Use Case',
    href: '/toolkit/prompts',
    icon: MessageSquare,
    color: 'from-purple-500 to-pink-600',
  },
  {
    title: 'Häufige Fehler',
    description: 'Vermeide diese Anfänger-Fallen',
    href: '/toolkit/pitfalls',
    icon: AlertTriangle,
    color: 'from-amber-500 to-orange-600',
  },
];

export default function ToolkitPage() {
  const {
    guides,
    checklists,
    prompts,
    tools,
    getFeaturedGuides,
    getCriticalPitfalls,
    isLoading
  } = useToolkit();

  const featuredGuides = getFeaturedGuides();
  const criticalPitfalls = getCriticalPitfalls();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <EnhancedSidebar />
        <PageContainer withSidebar maxWidth="wide">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-2 border-brand border-t-transparent animate-spin mx-auto mb-4" />
              <p className="text-charcoal/60">Toolkit wird geladen...</p>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <EnhancedSidebar />

      <PageContainer withSidebar maxWidth="wide">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-pink-500 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-display-sm text-charcoal">Builder's Toolkit</h1>
              <p className="text-charcoal/60">
                Guides, Checklisten und Prompts für deinen Build
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="max-w-xl">
            <ToolkitSearch placeholder="Suche nach Guides, Prompts, Tools..." />
          </div>
        </motion.div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {QUICK_LINKS.map((link, index) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={link.href}
                className="block bg-white rounded-2xl shadow-card hover:shadow-lg transition-all duration-300 overflow-hidden group border border-sand-200"
              >
                <div className={`h-1.5 bg-gradient-to-r ${link.color}`} />
                <div className="p-5">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${link.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <link.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-charcoal mb-1">{link.title}</h3>
                  <p className="text-sm text-charcoal/60">{link.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Guides', value: guides.length, icon: BookOpen },
            { label: 'Checklisten', value: checklists.length, icon: CheckSquare },
            { label: 'Prompts', value: prompts.length, icon: MessageSquare },
            { label: 'Tools', value: tools.length, icon: Puzzle },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 border border-sand-200 shadow-card">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-50 rounded-lg">
                  <stat.icon className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-charcoal">{stat.value}</p>
                  <p className="text-sm text-charcoal/60">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Guides */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-charcoal">Empfohlene Guides</h2>
              <p className="text-charcoal/60">Starte hier, wenn du neu bist</p>
            </div>
            <Link
              to="/toolkit/guides"
              className="flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium"
            >
              Alle ansehen
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredGuides.slice(0, 3).map((guide) => (
              <Link
                key={guide.id}
                to={`/toolkit/guides/${guide.slug}`}
                className="group bg-white rounded-2xl border border-sand-200 hover:border-brand-300 hover:shadow-lg transition-all overflow-hidden shadow-card"
              >
                {guide.coverImage && (
                  <div className="aspect-video bg-gradient-to-br from-brand-100 to-pink-100 overflow-hidden">
                    <img
                      src={guide.coverImage}
                      alt={guide.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    {guide.difficulty && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        guide.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                        guide.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {guide.difficulty === 'beginner' ? 'Anfänger' :
                         guide.difficulty === 'intermediate' ? 'Mittel' : 'Fortgeschritten'}
                      </span>
                    )}
                    {guide.estimatedTime && (
                      <span className="flex items-center gap-1 text-xs text-charcoal/60">
                        <Clock className="w-3 h-3" />
                        {guide.estimatedTime}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-charcoal mb-2 group-hover:text-brand-600 transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-charcoal/60 line-clamp-2">{guide.description}</p>

                  {guide.tools && guide.tools.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {guide.tools.slice(0, 3).map((tool) => (
                        <span
                          key={tool}
                          className="px-2 py-0.5 bg-brand-50 text-brand-600 rounded text-xs font-medium"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Critical Pitfalls Warning */}
        {criticalPitfalls.length > 0 && (
          <section className="mb-8">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">
                    Kritische Fehler vermeiden
                  </h3>
                  <p className="text-red-700 mb-4">
                    Diese {criticalPitfalls.length} Fehler machen fast alle Anfänger.
                    Lies dir diese unbedingt durch, bevor du startest!
                  </p>
                  <div className="space-y-2">
                    {criticalPitfalls.slice(0, 3).map((pitfall) => (
                      <div
                        key={pitfall.id}
                        className="flex items-center gap-2 text-sm text-red-800"
                      >
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        {pitfall.title}
                      </div>
                    ))}
                  </div>
                  <Link
                    to="/toolkit/pitfalls"
                    className="inline-flex items-center gap-2 mt-4 text-red-600 hover:text-red-700 font-medium"
                  >
                    Alle Fehler ansehen
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Journey Overview */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-charcoal mb-6">
            Deine Build-Journey
          </h2>

          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-6 top-12 bottom-12 w-0.5 bg-brand-200 hidden md:block" />

            <div className="space-y-4">
              {[
                {
                  step: 1,
                  title: 'Tool wählen',
                  description: 'Finde das richtige AI-Coding-Tool für dein Projekt',
                  link: '/toolkit/tools',
                  icon: Puzzle,
                },
                {
                  step: 2,
                  title: 'Grundlagen lernen',
                  description: 'Verstehe, was ein echtes Produkt wirklich braucht',
                  link: '/toolkit/guides/was-braucht-ein-echtes-produkt',
                  icon: BookOpen,
                },
                {
                  step: 3,
                  title: 'Mit Prompts arbeiten',
                  description: 'Nutze erprobte Prompts für schnellere Ergebnisse',
                  link: '/toolkit/prompts',
                  icon: MessageSquare,
                },
                {
                  step: 4,
                  title: 'MVP fertigstellen',
                  description: 'Checke ob dein Produkt wirklich launch-ready ist',
                  link: '/toolkit/checklists/mvp-readiness',
                  icon: CheckSquare,
                },
                {
                  step: 5,
                  title: 'Go Live!',
                  description: 'Launch dein Produkt und hole dir Feedback',
                  link: '/toolkit/checklists/go-live',
                  icon: TrendingUp,
                },
              ].map((item) => (
                <Link
                  key={item.step}
                  to={item.link}
                  className="flex items-start gap-4 group"
                >
                  <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-gradient-to-br from-brand-500 to-pink-500 rounded-xl text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                  <div className="flex-1 bg-white rounded-xl p-4 border border-sand-200 group-hover:border-brand-300 group-hover:shadow-md transition-all shadow-card">
                    <div className="flex items-center gap-2 mb-1">
                      <item.icon className="w-4 h-4 text-brand-600" />
                      <h3 className="font-semibold text-charcoal">{item.title}</h3>
                    </div>
                    <p className="text-sm text-charcoal/60">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Tools Preview */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-charcoal">Tool-Vergleich</h2>
              <p className="text-charcoal/60">Finde das richtige Tool für dich</p>
            </div>
            <Link
              to="/toolkit/tools"
              className="flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium"
            >
              Alle Tools
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tools.slice(0, 4).map((tool) => (
              <Link
                key={tool.id}
                to={`/toolkit/tools/${tool.slug}`}
                className="bg-white rounded-xl p-4 border border-sand-200 hover:border-brand-300 hover:shadow-md transition-all group shadow-card"
              >
                <div
                  className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center text-2xl"
                  style={{ backgroundColor: tool.color ? `${tool.color}20` : '#f3e8ff' }}
                >
                  {tool.logoUrl ? (
                    <img src={tool.logoUrl} alt={tool.name} className="w-8 h-8" />
                  ) : (
                    tool.name.charAt(0)
                  )}
                </div>
                <h3 className="font-semibold text-charcoal group-hover:text-brand-600 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-sm text-charcoal/60 line-clamp-1">{tool.tagline}</p>
              </Link>
            ))}
          </div>
        </section>
      </PageContainer>
    </div>
  );
}
