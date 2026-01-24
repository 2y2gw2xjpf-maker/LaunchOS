import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search } from 'lucide-react';
import { useToolkit } from '@/hooks/useToolkit';
import { Header, EnhancedSidebar, PageContainer } from '@/components/layout';
import { GuideCard } from './components/GuideCard';

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
      <div className="min-h-screen bg-cream">
        <Header />
        <EnhancedSidebar />
        <PageContainer withSidebar maxWidth="wide">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-2 border-brand border-t-transparent animate-spin mx-auto mb-4" />
              <p className="text-charcoal/60">Guides werden geladen...</p>
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
          <h1 className="font-display text-display-sm text-charcoal mb-2">Guides</h1>
          <p className="text-charcoal/60">
            Schritt-für-Schritt Anleitungen für jeden Aspekt deines Produkts
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-card p-4 mb-6"
        >
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Suche nach Guides..."
                  className="w-full pl-10 pr-4 py-2.5 border border-purple-200 rounded-xl
                           focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none bg-white"
                />
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="px-4 py-2.5 border border-purple-200 rounded-xl bg-white
                       focus:border-purple-400 outline-none"
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
              className="px-4 py-2.5 border border-purple-200 rounded-xl bg-white
                       focus:border-purple-400 outline-none"
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
              className="px-4 py-2.5 border border-purple-200 rounded-xl bg-white
                       focus:border-purple-400 outline-none"
            >
              <option value="">Alle Levels</option>
              <option value="beginner">Anfänger</option>
              <option value="intermediate">Mittel</option>
              <option value="advanced">Fortgeschritten</option>
            </select>
          </div>
        </motion.div>

        {/* Results Count */}
        <p className="text-sm text-charcoal/60 mb-4">
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
              <GuideCard
                guide={guide}
                isBookmarked={isBookmarked('guide', guide.id)}
                onToggleBookmark={() => toggleBookmark('guide', guide.id)}
              />
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredGuides.length === 0 && (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100">
            <BookOpen className="w-12 h-12 text-charcoal/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-charcoal mb-2">Keine Guides gefunden</h3>
            <p className="text-charcoal/60 max-w-md mx-auto">
              {searchQuery || selectedCategory || selectedTool || selectedDifficulty
                ? 'Versuche andere Filter oder eine andere Suchanfrage'
                : 'Die Guide-Datenbank muss noch initialisiert werden. Führe die Toolkit-Migrations in Supabase aus.'}
            </p>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
