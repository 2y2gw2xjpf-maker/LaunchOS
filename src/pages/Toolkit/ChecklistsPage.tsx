import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckSquare, Clock, Search, Star } from 'lucide-react';
import { useToolkit } from '@/hooks/useToolkit';
import type { ChecklistProgress } from '@/hooks/useToolkit';
import { EnhancedSidebar } from '@/components/layout/sidebar/EnhancedSidebar';
import { Header } from '@/components/layout/Header';

export default function ChecklistsPage() {
  const { checklists, getChecklistProgress, isLoading } = useToolkit();
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredChecklists = checklists.filter(checklist =>
    !searchQuery ||
    checklist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    checklist.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <EnhancedSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Checklisten werden geladen...</p>
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
                <div className="p-2 bg-green-100 rounded-xl">
                  <CheckSquare className="w-6 h-6 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Checklisten</h1>
              </div>
              <p className="text-gray-500">
                Interaktive Checklisten um sicherzustellen, dass dein Produkt wirklich fertig ist
              </p>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl border border-purple-100 p-4 mb-8">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Suche nach Checklisten..."
                  className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-xl
                           focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none"
                />
              </div>
            </div>

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
                      className="block bg-white rounded-2xl border border-purple-100
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

                        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                          {checklist.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
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
                            <span className="flex items-center gap-1 text-gray-500">
                              <Clock className="w-3 h-3" />
                              {checklist.estimatedTime}
                            </span>
                          )}
                        </div>

                        {/* Progress Info */}
                        {progress && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">
                                {progress.completed} von {progress.total} erledigt
                              </span>
                              <span className={`font-medium ${
                                progress.percentage === 100 ? 'text-green-600' :
                                progress.percentage > 50 ? 'text-yellow-600' : 'text-gray-600'
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
              <div className="text-center py-12">
                <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Checklisten gefunden</h3>
                <p className="text-gray-500">
                  Versuche eine andere Suchanfrage
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
