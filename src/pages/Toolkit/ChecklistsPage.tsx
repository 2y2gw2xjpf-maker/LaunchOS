import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckSquare, Clock, Search, Star } from 'lucide-react';
import { useToolkit } from '@/hooks/useToolkit';
import type { ChecklistProgress } from '@/hooks/useToolkit';
import { Header, EnhancedSidebar, PageContainer } from '@/components/layout';

export default function ChecklistsPage() {
  const { checklists, categories, getChecklistProgress, isLoading } = useToolkit();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, ChecklistProgress>>({});

  useEffect(() => {
    const loadProgress = async () => {
      const map: Record<string, ChecklistProgress> = {};
      for (const checklist of checklists) {
        const progress = await getChecklistProgress(checklist.id);
        if (progress) {
          map[checklist.id] = progress;
        }
      }
      setProgressMap(map);
    };

    if (checklists.length > 0) {
      loadProgress();
    }
  }, [checklists, getChecklistProgress]);

  const filteredChecklists = useMemo(() => {
    return checklists.filter(checklist => {
      const matchesSearch = !searchQuery ||
        checklist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        checklist.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || checklist.categoryId === selectedCategory;
      const matchesDifficulty = !selectedDifficulty || checklist.difficulty === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [checklists, searchQuery, selectedCategory, selectedDifficulty]);

  const checklistCategories = categories.filter(c =>
    checklists.some(cl => cl.categoryId === c.id)
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
              <p className="text-charcoal/60">Checklisten werden geladen...</p>
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
          <h1 className="font-display text-display-sm text-charcoal mb-2">Checklisten</h1>
          <p className="text-charcoal/60">
            Interaktive Checklisten um sicherzustellen, dass dein Produkt wirklich fertig ist
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
                  placeholder="Suche nach Checklisten..."
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
              {checklistCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
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
          {filteredChecklists.length} {filteredChecklists.length === 1 ? 'Checkliste' : 'Checklisten'} gefunden
        </p>

        {/* Checklists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChecklists.map((checklist, index) => {
            const progress = progressMap[checklist.id];

            return (
              <motion.div
                key={checklist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/toolkit/checklists/${checklist.slug}`}
                  className="block bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100
                           hover:border-purple-300 hover:shadow-lg transition-all overflow-hidden group"
                >
                  {/* Progress Bar */}
                  {progress && (
                    <div className="h-2 bg-gray-100">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600
                                    flex items-center justify-center">
                        <CheckSquare className="w-6 h-6 text-white" />
                      </div>
                      {checklist.isFeatured && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 rounded-full">
                          <Star className="w-3 h-3 text-purple-600" fill="currentColor" />
                          <span className="text-xs font-medium text-purple-600">Empfohlen</span>
                        </div>
                      )}
                    </div>

                    <h3 className="font-semibold text-charcoal mb-2 group-hover:text-purple-600 transition-colors">
                      {checklist.title}
                    </h3>
                    <p className="text-sm text-charcoal/60 line-clamp-2 mb-4">
                      {checklist.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm">
                      {checklist.difficulty && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          checklist.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                          checklist.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {checklist.difficulty === 'beginner' ? 'Anfänger' :
                           checklist.difficulty === 'intermediate' ? 'Mittel' : 'Fortgeschritten'}
                        </span>
                      )}
                      {checklist.estimatedTime && (
                        <span className="flex items-center gap-1 text-charcoal/50">
                          <Clock className="w-3 h-3" />
                          {checklist.estimatedTime}
                        </span>
                      )}
                    </div>

                    {/* Progress Info */}
                    {progress && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-charcoal/50">
                            {progress.completed} von {progress.total} erledigt
                          </span>
                          <span className={`font-medium ${
                            progress.percentage === 100 ? 'text-green-600' :
                            progress.percentage > 50 ? 'text-yellow-600' : 'text-charcoal/60'
                          }`}>
                            {progress.percentage}%
                          </span>
                        </div>
                        {!progress.allCriticalDone && progress.criticalTotal > 0 && (
                          <p className="text-xs text-red-500 mt-2">
                            {progress.criticalTotal - progress.criticalCompleted} kritische Punkte offen
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredChecklists.length === 0 && (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100">
            <CheckSquare className="w-12 h-12 text-charcoal/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-charcoal mb-2">Keine Checklisten gefunden</h3>
            <p className="text-charcoal/60 max-w-md mx-auto">
              {searchQuery || selectedCategory || selectedDifficulty
                ? 'Versuche andere Filter oder eine andere Suchanfrage'
                : 'Die Checklisten-Datenbank muss noch initialisiert werden. Führe die Toolkit-Migrations in Supabase aus.'}
            </p>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
