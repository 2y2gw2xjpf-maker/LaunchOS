import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wrench, BookOpen, CheckSquare, MessageSquare,
  Puzzle, AlertTriangle, Search, ArrowRight,
  Clock, TrendingUp
} from 'lucide-react';
import { useToolkit } from '@/hooks/useToolkit';
import { EnhancedSidebar } from '@/components/layout/sidebar/EnhancedSidebar';
import { Header } from '@/components/layout/Header';

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

  const [searchQuery, setSearchQuery] = useState('');

  const featuredGuides = getFeaturedGuides();
  const criticalPitfalls = getCriticalPitfalls();

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <EnhancedSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Toolkit wird geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <EnhancedSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {/* Hero Section */}
          <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white">
            <div className="max-w-7xl mx-auto px-6 py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Wrench className="w-8 h-8" />
                  </div>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                    Neu in LaunchOS
                  </span>
                </div>

                <h1 className="text-4xl font-bold mb-4">
                  Builder's Toolkit
                </h1>
                <p className="text-xl text-purple-100 mb-6">
                  Von der Idee zum funktionierenden Produkt. Guides, Checklisten und
                  Prompts aus 50+ Tagen praktischer Erfahrung mit AI-Coding-Tools.
                </p>

                {/* Search */}
                <div className="relative max-w-xl">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Suche nach Guides, Prompts, Tools..."
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl
                             text-white placeholder-purple-200 focus:bg-white/20 focus:border-white/40
                             focus:outline-none transition-all"
                  />
                </div>
              </motion.div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 -mt-16 mb-12">
              {QUICK_LINKS.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={link.href}
                    className="block bg-white rounded-2xl shadow-lg hover:shadow-xl
                             transition-all duration-300 overflow-hidden group"
                  >
                    <div className={`h-2 bg-gradient-to-r ${link.color}`} />
                    <div className="p-5">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${link.color}
                                    flex items-center justify-center mb-4
                                    group-hover:scale-110 transition-transform`}>
                        <link.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{link.title}</h3>
                      <p className="text-sm text-gray-500">{link.description}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { label: 'Guides', value: guides.length, icon: BookOpen },
                { label: 'Checklisten', value: checklists.length, icon: CheckSquare },
                { label: 'Prompts', value: prompts.length, icon: MessageSquare },
                { label: 'Tools', value: tools.length, icon: Puzzle },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <stat.icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Featured Guides */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Empfohlene Guides</h2>
                  <p className="text-gray-500">Starte hier, wenn du neu bist</p>
                </div>
                <Link
                  to="/toolkit/guides"
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
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
                    className="group bg-white rounded-2xl border border-purple-100
                             hover:border-purple-300 hover:shadow-lg transition-all overflow-hidden"
                  >
                    {guide.coverImage && (
                      <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100
                                    overflow-hidden">
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
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {guide.estimatedTime}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600
                                   transition-colors">
                        {guide.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{guide.description}</p>

                      {guide.tools && guide.tools.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {guide.tools.slice(0, 3).map((tool) => (
                            <span
                              key={tool}
                              className="px-2 py-0.5 bg-purple-50 text-purple-600
                                       rounded text-xs font-medium"
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
              <section className="mb-12">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6
                              border border-red-200">
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
                        className="inline-flex items-center gap-2 mt-4 text-red-600
                                 hover:text-red-700 font-medium"
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
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Deine Build-Journey
              </h2>

              <div className="relative">
                {/* Connection Line */}
                <div className="absolute left-6 top-12 bottom-12 w-0.5 bg-purple-200
                              hidden md:block" />

                <div className="space-y-6">
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
                      <div className="relative z-10 flex items-center justify-center w-12 h-12
                                    bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl
                                    text-white font-bold shadow-lg group-hover:scale-110
                                    transition-transform">
                        {item.step}
                      </div>
                      <div className="flex-1 bg-white rounded-xl p-4 border border-purple-100
                                    group-hover:border-purple-300 group-hover:shadow-md transition-all">
                        <div className="flex items-center gap-2 mb-1">
                          <item.icon className="w-4 h-4 text-purple-600" />
                          <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        </div>
                        <p className="text-sm text-gray-500">{item.description}</p>
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
                  <h2 className="text-2xl font-bold text-gray-900">Tool-Vergleich</h2>
                  <p className="text-gray-500">Finde das richtige Tool für dich</p>
                </div>
                <Link
                  to="/toolkit/tools"
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
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
                    className="bg-white rounded-xl p-4 border border-purple-100
                             hover:border-purple-300 hover:shadow-md transition-all group"
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
                    <h3 className="font-semibold text-gray-900 group-hover:text-purple-600
                                 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-1">{tool.tagline}</p>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
