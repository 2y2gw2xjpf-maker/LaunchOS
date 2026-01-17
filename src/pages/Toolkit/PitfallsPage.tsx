import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Search, ChevronDown, ChevronUp,
  AlertOctagon, AlertCircle, Info, ExternalLink
} from 'lucide-react';
import { useToolkit } from '@/hooks/useToolkit';
import { EnhancedSidebar } from '@/components/layout/sidebar/EnhancedSidebar';
import { Header } from '@/components/layout/Header';

const SEVERITY_CONFIG = {
  critical: {
    label: 'Kritisch',
    icon: AlertOctagon,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    iconColor: 'text-red-600',
    badgeBg: 'bg-red-100',
  },
  warning: {
    label: 'Warnung',
    icon: AlertCircle,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    iconColor: 'text-amber-600',
    badgeBg: 'bg-amber-100',
  },
  info: {
    label: 'Info',
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-600',
    badgeBg: 'bg-blue-100',
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Datenbank',
  auth: 'Authentifizierung',
  deployment: 'Deployment',
  security: 'Security',
};

export default function PitfallsPage() {
  const { pitfalls, tools, isLoading } = useToolkit();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredPitfalls = useMemo(() => {
    return pitfalls.filter(pitfall => {
      const matchesSearch = !searchQuery ||
        pitfall.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pitfall.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || pitfall.category === selectedCategory;
      const matchesSeverity = !selectedSeverity || pitfall.severity === selectedSeverity;
      const matchesTool = !selectedTool ||
        !pitfall.affectedTools ||
        pitfall.affectedTools.length === 0 ||
        pitfall.affectedTools.includes(selectedTool);

      return matchesSearch && matchesCategory && matchesSeverity && matchesTool;
    });
  }, [pitfalls, searchQuery, selectedCategory, selectedSeverity, selectedTool]);

  // Group pitfalls by category
  const groupedPitfalls = useMemo(() => {
    return filteredPitfalls.reduce((acc, pitfall) => {
      const category = pitfall.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(pitfall);
      return acc;
    }, {} as Record<string, typeof pitfalls>);
  }, [filteredPitfalls]);

  const categories = [...new Set(pitfalls.map(p => p.category))];

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <EnhancedSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Pitfalls werden geladen...</p>
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
          <div className="max-w-5xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Häufige Fehler</h1>
              </div>
              <p className="text-gray-500">
                Diese Fehler machen fast alle Anfänger mit AI-Coding-Tools. Lerne aus den Fehlern anderer!
              </p>
            </div>

            {/* Warning Banner */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 text-white mb-8"
            >
              <div className="flex items-start gap-4">
                <AlertOctagon className="w-8 h-8 shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Bevor du startest</h3>
                  <p className="text-red-100">
                    {pitfalls.filter(p => p.severity === 'critical').length} kritische Fehler können
                    zu Sicherheitslücken, Datenverlust oder hohen Kosten führen.
                    Lies diese unbedingt durch!
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-purple-100 p-4 mb-8">
              <div className="flex flex-wrap gap-4">
                {/* Search */}
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Suche nach Fehlern..."
                      className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-xl
                               focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="px-4 py-2 border border-purple-200 rounded-xl bg-white
                           focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none"
                >
                  <option value="">Alle Kategorien</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{CATEGORY_LABELS[cat] || cat}</option>
                  ))}
                </select>

                {/* Severity Filter */}
                <select
                  value={selectedSeverity || ''}
                  onChange={(e) => setSelectedSeverity(e.target.value || null)}
                  className="px-4 py-2 border border-purple-200 rounded-xl bg-white
                           focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none"
                >
                  <option value="">Alle Schweregrade</option>
                  <option value="critical">Kritisch</option>
                  <option value="warning">Warnung</option>
                  <option value="info">Info</option>
                </select>

                {/* Tool Filter */}
                <select
                  value={selectedTool || ''}
                  onChange={(e) => setSelectedTool(e.target.value || null)}
                  className="px-4 py-2 border border-purple-200 rounded-xl bg-white
                           focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none"
                >
                  <option value="">Alle Tools</option>
                  {tools.map(tool => (
                    <option key={tool.slug} value={tool.slug}>{tool.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <p className="text-sm text-gray-500 mb-4">
              {filteredPitfalls.length} {filteredPitfalls.length === 1 ? 'Fehler' : 'Fehler'} gefunden
            </p>

            {/* Pitfalls by Category */}
            <div className="space-y-8">
              {Object.entries(groupedPitfalls).map(([category, categoryPitfalls]) => (
                <section key={category}>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    {CATEGORY_LABELS[category] || category}
                    <span className="text-sm font-normal text-gray-500">
                      ({categoryPitfalls.length})
                    </span>
                  </h2>

                  <div className="space-y-3">
                    {categoryPitfalls.map((pitfall, index) => {
                      const severity = SEVERITY_CONFIG[pitfall.severity];
                      const SeverityIcon = severity.icon;
                      const isExpanded = expandedId === pitfall.id;

                      return (
                        <motion.div
                          key={pitfall.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={`rounded-xl border ${severity.borderColor} ${severity.bgColor} overflow-hidden`}
                        >
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : pitfall.id)}
                            className="w-full px-5 py-4 flex items-start gap-4 text-left"
                          >
                            <SeverityIcon className={`w-5 h-5 ${severity.iconColor} shrink-0 mt-0.5`} />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className={`font-semibold ${severity.textColor}`}>
                                  {pitfall.title}
                                </h3>
                                <span className={`px-2 py-0.5 ${severity.badgeBg} ${severity.textColor}
                                               rounded text-xs font-medium`}>
                                  {severity.label}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{pitfall.description}</p>

                              {/* Affected Tools */}
                              {pitfall.affectedTools && pitfall.affectedTools.length > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs text-gray-500">Betrifft:</span>
                                  {pitfall.affectedTools.map(tool => (
                                    <span
                                      key={tool}
                                      className="px-2 py-0.5 bg-white/50 text-gray-600 rounded text-xs"
                                    >
                                      {tool}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                            )}
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="px-5 pb-5 pt-0 border-t border-gray-200/50 ml-9 space-y-4">
                                  {/* Why Bad */}
                                  {pitfall.whyBad && (
                                    <div className="mt-4">
                                      <h4 className="text-sm font-medium text-gray-700 mb-1">
                                        Warum ist das problematisch?
                                      </h4>
                                      <p className="text-sm text-gray-600">{pitfall.whyBad}</p>
                                    </div>
                                  )}

                                  {/* Solution */}
                                  {pitfall.solution && (
                                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                      <h4 className="text-sm font-medium text-green-800 mb-1">
                                        Lösung
                                      </h4>
                                      <p className="text-sm text-green-700">{pitfall.solution}</p>
                                    </div>
                                  )}

                                  {/* Links */}
                                  {(pitfall.relatedGuideId || pitfall.externalLink) && (
                                    <div className="flex items-center gap-4 pt-2">
                                      {pitfall.relatedGuideId && (
                                        <Link
                                          to={`/toolkit/guides/${pitfall.relatedGuideId}`}
                                          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                                        >
                                          Passender Guide
                                        </Link>
                                      )}
                                      {pitfall.externalLink && (
                                        <a
                                          href={pitfall.externalLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
                                        >
                                          Mehr erfahren
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            {/* Empty State */}
            {filteredPitfalls.length === 0 && (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Fehler gefunden</h3>
                <p className="text-gray-500">
                  Versuche andere Filter oder eine andere Suchanfrage
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
