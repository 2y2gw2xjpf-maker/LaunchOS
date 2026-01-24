import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Puzzle, Search, Star, ExternalLink, ArrowRight,
  BarChart3, Code, Database, Cloud, GraduationCap
} from 'lucide-react';
import { useToolkit } from '@/hooks/useToolkit';
import { Header, EnhancedSidebar, PageContainer } from '@/components/layout';

const RATING_LABELS = {
  ui: { label: 'UI/Frontend', icon: Code },
  backend: { label: 'Backend', icon: BarChart3 },
  database: { label: 'Database', icon: Database },
  deployment: { label: 'Deployment', icon: Cloud },
  learningCurve: { label: 'Lernkurve', icon: GraduationCap },
};

function RatingStars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <div
          key={star}
          className={`w-2 h-2 rounded-full ${
            star <= value ? 'bg-purple-500' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

export default function ToolsPage() {
  const { tools, isLoading } = useToolkit();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  const filteredTools = tools.filter(tool =>
    !searchQuery ||
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.tagline?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleToolSelection = (slug: string) => {
    if (selectedTools.includes(slug)) {
      setSelectedTools(selectedTools.filter(s => s !== slug));
    } else if (selectedTools.length < 2) {
      setSelectedTools([...selectedTools, slug]);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <EnhancedSidebar />
        <PageContainer withSidebar maxWidth="wide">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-2 border-brand border-t-transparent animate-spin mx-auto mb-4" />
              <p className="text-charcoal/60">Tools werden geladen...</p>
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
          <h1 className="font-display text-display-sm text-charcoal mb-2">AI-Coding Tools</h1>
          <p className="text-charcoal/60">
            Vergleiche die beliebtesten AI-Coding-Tools und finde das richtige für dein Projekt
          </p>
        </motion.div>

        {/* Search & Compare */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-card p-4 mb-6"
        >
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Suche nach Tools..."
                  className="w-full pl-10 pr-4 py-2.5 border border-purple-200 rounded-xl
                           focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none bg-white"
                />
              </div>
            </div>

            {/* Compare Button */}
            {selectedTools.length === 2 && (
              <Link
                to={`/toolkit/tools/compare?tools=${selectedTools.join(',')}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white
                         rounded-xl hover:bg-purple-700 transition-colors font-medium"
              >
                Vergleichen
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            {selectedTools.length === 1 && (
              <p className="text-sm text-charcoal/50">
                Wähle noch ein Tool zum Vergleichen
              </p>
            )}
          </div>
        </motion.div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white/80 backdrop-blur-sm rounded-2xl border-2 overflow-hidden transition-all ${
                selectedTools.includes(tool.slug)
                  ? 'border-purple-500 shadow-lg shadow-purple-100'
                  : 'border-purple-100 hover:border-purple-300'
              }`}
            >
              {/* Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold text-white"
                      style={{ backgroundColor: tool.color || '#9333ea' }}
                    >
                      {tool.logoUrl ? (
                        <img src={tool.logoUrl} alt={tool.name} className="w-8 h-8" />
                      ) : (
                        tool.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-charcoal">{tool.name}</h3>
                      {tool.isFeatured && (
                        <span className="flex items-center gap-1 text-xs text-amber-600">
                          <Star className="w-3 h-3" fill="currentColor" />
                          Empfohlen
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleToolSelection(tool.slug)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      selectedTools.includes(tool.slug)
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-charcoal/60 hover:bg-gray-200'
                    }`}
                  >
                    {selectedTools.includes(tool.slug) ? 'Ausgewählt' : 'Vergleichen'}
                  </button>
                </div>

                <p className="text-sm text-charcoal/60 mb-4">{tool.tagline}</p>

                {/* Ratings */}
                <div className="space-y-2">
                  {Object.entries(RATING_LABELS).map(([key, { label }]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-charcoal/60">{label}</span>
                      <RatingStars value={tool.ratings[key as keyof typeof tool.ratings] || 0} />
                    </div>
                  ))}
                </div>

                {/* Best For */}
                {tool.bestFor && tool.bestFor.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-medium text-charcoal/50 mb-2">Ideal für:</p>
                    <div className="flex flex-wrap gap-1">
                      {tool.bestFor.slice(0, 3).map((useCase) => (
                        <span
                          key={useCase}
                          className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs"
                        >
                          {useCase}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pricing */}
                {tool.pricingModel && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-charcoal/60">
                      <span className="font-medium">Preis:</span>{' '}
                      {tool.pricingDetails || tool.pricingModel}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <Link
                  to={`/toolkit/tools/${tool.slug}`}
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  Details ansehen
                </Link>
                {tool.websiteUrl && (
                  <a
                    href={tool.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-charcoal/50 hover:text-charcoal/70 text-sm"
                  >
                    Website
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTools.length === 0 && (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100">
            <Puzzle className="w-12 h-12 text-charcoal/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-charcoal mb-2">Keine Tools gefunden</h3>
            <p className="text-charcoal/60 max-w-md mx-auto">
              {searchQuery
                ? 'Versuche eine andere Suchanfrage'
                : 'Die Tool-Datenbank muss noch initialisiert werden. Führe die Toolkit-Migrations in Supabase aus.'}
            </p>
          </div>
        )}

        {/* Comparison Matrix */}
        {tools.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-charcoal mb-6">Vergleichs-Übersicht</h2>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-sm font-medium text-charcoal/50">Tool</th>
                    {Object.entries(RATING_LABELS).map(([key, { label, icon: Icon }]) => (
                      <th key={key} className="px-4 py-4 text-center text-sm font-medium text-charcoal/50">
                        <div className="flex flex-col items-center gap-1">
                          <Icon className="w-4 h-4" />
                          <span>{label}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tools.map((tool) => (
                    <tr key={tool.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link
                          to={`/toolkit/tools/${tool.slug}`}
                          className="flex items-center gap-3 hover:text-purple-600"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                            style={{ backgroundColor: tool.color || '#9333ea' }}
                          >
                            {tool.name.charAt(0)}
                          </div>
                          <span className="font-medium text-charcoal">{tool.name}</span>
                        </Link>
                      </td>
                      {Object.keys(RATING_LABELS).map((key) => (
                        <td key={key} className="px-4 py-4 text-center">
                          <div className="flex justify-center">
                            <RatingStars value={tool.ratings[key as keyof typeof tool.ratings] || 0} />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </PageContainer>
    </div>
  );
}
