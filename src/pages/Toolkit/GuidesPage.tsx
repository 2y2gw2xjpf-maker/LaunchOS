import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Search, Clock, Eye, ThumbsUp, Bookmark } from 'lucide-react';
import { useToolkit } from '@/hooks/useToolkit';
import { EnhancedSidebar } from '@/components/layout/sidebar/EnhancedSidebar';
import { Header } from '@/components/layout/Header';

export default function GuidesPage() {
  const { guides, categories, tools, isBookmarked, toggleBookmark, isLoading } = useToolkit();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const filteredGuides = useMemo(() => {
    return guides.filter(guide => {
      const matchesSearch = !searchQuery ||
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || guide.categoryId === selectedCategory;
      const matchesTool = !selectedTool || guide.tools?.includes(selectedTool);
      const matchesDifficulty = !selectedDifficulty || guide.difficulty === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesTool && matchesDifficulty;
    });
  }, [guides, searchQuery, selectedCategory, selectedTool, selectedDifficulty]);

  const guideCategories = categories.filter(c =>
    guides.some(g => g.categoryId === c.id)
  );

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <EnhancedSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Guides werden geladen...</p>
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

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Guides</h1>
              </div>
              <p className="text-gray-500">
                Schritt-für-Schritt Anleitungen für jeden Aspekt deines Produkts
              </p>
            </div>

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
                      placeholder="Suche nach Guides..."
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
                  {guideCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
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

                {/* Difficulty Filter */}
                <select
                  value={selectedDifficulty || ''}
                  onChange={(e) => setSelectedDifficulty(e.target.value || null)}
                  className="px-4 py-2 border border-purple-200 rounded-xl bg-white
                           focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none"
                >
                  <option value="">Alle Levels</option>
                  <option value="beginner">Anfänger</option>
                  <option value="intermediate">Mittel</option>
                  <option value="advanced">Fortgeschritten</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            <p className="text-sm text-gray-500 mb-4">
              {filteredGuides.length} {filteredGuides.length === 1 ? 'Guide' : 'Guides'} gefunden
            </p>

            {/* Guides Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map((guide, index) => (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="group bg-white rounded-2xl border border-purple-100
                                hover:border-purple-300 hover:shadow-lg transition-all overflow-hidden">
                    {/* Cover Image */}
                    <Link to={`/toolkit/guides/${guide.slug}`}>
                      <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100
                                    relative overflow-hidden">
                        {guide.coverImage ? (
                          <img
                            src={guide.coverImage}
                            alt={guide.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-purple-300" />
                          </div>
                        )}
                        {guide.isFeatured && (
                          <div className="absolute top-3 left-3 px-2 py-1 bg-purple-600
                                        text-white text-xs font-medium rounded-full">
                            Empfohlen
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-5">
                      {/* Meta */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
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

                      {/* Title & Description */}
                      <Link to={`/toolkit/guides/${guide.slug}`}>
                        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600
                                     transition-colors line-clamp-2">
                          {guide.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                        {guide.description}
                      </p>

                      {/* Tools Tags */}
                      {guide.tools && guide.tools.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {guide.tools.slice(0, 3).map((tool) => (
                            <span
                              key={tool}
                              className="px-2 py-0.5 bg-purple-50 text-purple-600
                                       rounded text-xs font-medium"
                            >
                              {tool}
                            </span>
                          ))}
                          {guide.tools.length > 3 && (
                            <span className="px-2 py-0.5 text-gray-400 text-xs">
                              +{guide.tools.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-purple-50">
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {guide.viewCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            {guide.helpfulCount}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleBookmark('guide', guide.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            isBookmarked('guide', guide.id)
                              ? 'bg-purple-100 text-purple-600'
                              : 'hover:bg-purple-50 text-gray-400'
                          }`}
                        >
                          <Bookmark className="w-4 h-4" fill={isBookmarked('guide', guide.id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {filteredGuides.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Guides gefunden</h3>
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
