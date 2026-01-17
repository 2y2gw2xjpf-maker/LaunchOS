import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckSquare, ChevronRight, Clock,
  CheckCircle2, Circle, AlertTriangle, Info, ExternalLink
} from 'lucide-react';
import { useToolkit } from '@/hooks/useToolkit';
import type { ToolkitChecklist, ToolkitChecklistItem, ChecklistProgress } from '@/hooks/useToolkit';
import { EnhancedSidebar } from '@/components/layout/sidebar/EnhancedSidebar';
import { Header } from '@/components/layout/Header';

export default function ChecklistDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { getChecklistWithItems, getChecklistProgress, toggleChecklistItem } = useToolkit();

  const [checklist, setChecklist] = useState<ToolkitChecklist | null>(null);
  const [progress, setProgress] = useState<ChecklistProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    const loadChecklist = async () => {
      if (!slug) return;

      setIsLoading(true);
      const data = await getChecklistWithItems(slug);
      setChecklist(data);

      if (data) {
        const progressData = await getChecklistProgress(data.id);
        setProgress(progressData);
      }

      setIsLoading(false);
    };

    loadChecklist();
  }, [slug, getChecklistWithItems, getChecklistProgress]);

  const handleToggleItem = async (item: ToolkitChecklistItem) => {
    if (!checklist) return;

    const newCompleted = !item.isCompleted;
    const success = await toggleChecklistItem(checklist.id, item.id, newCompleted);

    if (success) {
      // Update local state
      setChecklist(prev => {
        if (!prev || !prev.items) return prev;
        return {
          ...prev,
          items: prev.items.map(i =>
            i.id === item.id ? { ...i, isCompleted: newCompleted } : i
          )
        };
      });

      // Refresh progress
      const progressData = await getChecklistProgress(checklist.id);
      setProgress(progressData);
    }
  };

  // Group items by section
  const groupedItems = useMemo(() => {
    if (!checklist?.items) return {};

    return checklist.items.reduce((acc, item) => {
      const section = item.section || 'Allgemein';
      if (!acc[section]) acc[section] = [];
      acc[section].push(item);
      return acc;
    }, {} as Record<string, ToolkitChecklistItem[]>);
  }, [checklist]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <EnhancedSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="flex h-screen bg-gray-50">
        <EnhancedSidebar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Checklist nicht gefunden</h2>
          <Link to="/toolkit/checklists" className="text-purple-600 hover:text-purple-700">
            Zurück zu allen Checklisten
          </Link>
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
          {/* Breadcrumb */}
          <div className="bg-white border-b border-purple-100">
            <div className="max-w-4xl mx-auto px-6 py-3">
              <nav className="flex items-center gap-2 text-sm">
                <Link to="/toolkit" className="text-gray-500 hover:text-purple-600">
                  Toolkit
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link to="/toolkit/checklists" className="text-gray-500 hover:text-purple-600">
                  Checklisten
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 font-medium truncate">{checklist.title}</span>
              </nav>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Back Link */}
            <Link
              to="/toolkit/checklists"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Alle Checklisten
            </Link>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-purple-100 p-6 mb-8"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600
                                flex items-center justify-center">
                    <CheckSquare className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{checklist.title}</h1>
                    <div className="flex items-center gap-3 mt-1">
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
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {checklist.estimatedTime}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {checklist.description && (
                <p className="text-gray-600 mb-6">{checklist.description}</p>
              )}

              {/* Progress */}
              {progress && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Fortschritt</span>
                    <span className="text-sm font-bold text-gray-900">{progress.percentage}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.percentage}%` }}
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {progress.completed} von {progress.total} erledigt
                    </span>
                    {progress.allCriticalDone ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        Alle kritischen Punkte erledigt
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-600">
                        <AlertTriangle className="w-4 h-4" />
                        {progress.criticalTotal - progress.criticalCompleted} kritische Punkte offen
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Checklist Items by Section */}
            <div className="space-y-8">
              {Object.entries(groupedItems).map(([section, items]) => (
                <motion.div
                  key={section}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    {section}
                    <span className="text-sm font-normal text-gray-500">
                      ({items.filter(i => i.isCompleted).length}/{items.length})
                    </span>
                  </h2>

                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={`bg-white rounded-xl border transition-all ${
                          item.isCompleted
                            ? 'border-green-200 bg-green-50/50'
                            : item.isCritical
                            ? 'border-red-200'
                            : 'border-purple-100'
                        }`}
                      >
                        <div
                          className="p-4 cursor-pointer"
                          onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleItem(item);
                              }}
                              className={`mt-0.5 transition-colors ${
                                item.isCompleted ? 'text-green-600' : 'text-gray-400 hover:text-purple-600'
                              }`}
                            >
                              {item.isCompleted ? (
                                <CheckCircle2 className="w-6 h-6" fill="currentColor" />
                              ) : (
                                <Circle className="w-6 h-6" />
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className={`font-medium ${
                                  item.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                                }`}>
                                  {item.title}
                                </h3>
                                {item.isCritical && (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                                    Kritisch
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                              )}
                            </div>

                            {(item.helpText || item.helpLink) && (
                              <Info className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedItem === item.id && (item.helpText || item.helpLink) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 pt-0 border-t border-gray-100 ml-9">
                                {item.helpText && (
                                  <p className="text-sm text-gray-600 mt-3 bg-purple-50 p-3 rounded-lg">
                                    {item.helpText}
                                  </p>
                                )}
                                {item.helpLink && (
                                  <a
                                    href={item.helpLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 mt-3"
                                  >
                                    Mehr erfahren
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Completion Message */}
            {progress && progress.percentage === 100 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white text-center"
              >
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Checklist abgeschlossen!</h3>
                <p className="text-green-100">
                  Du hast alle Punkte dieser Checklist erfolgreich erledigt.
                </p>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
