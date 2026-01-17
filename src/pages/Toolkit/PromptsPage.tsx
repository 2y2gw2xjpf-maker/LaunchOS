import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Search, Copy, Check, Star, Bookmark } from 'lucide-react';
import { useToolkit } from '@/hooks/useToolkit';
import { EnhancedSidebar } from '@/components/layout/sidebar/EnhancedSidebar';
import { Header } from '@/components/layout/Header';

export default function PromptsPage() {
  const { prompts, tools, isBookmarked, toggleBookmark, incrementPromptCopy, isLoading } = useToolkit();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredPrompts = useMemo(() => {
    return prompts.filter(prompt => {
      const matchesSearch = !searchQuery ||
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTool = !selectedTool || prompt.targetTool === selectedTool || prompt.targetTool === 'any';

      return matchesSearch && matchesTool;
    });
  }, [prompts, searchQuery, selectedTool]);

  const handleCopyPrompt = async (prompt: typeof prompts[0]) => {
    await navigator.clipboard.writeText(prompt.promptTemplate);
    setCopiedId(prompt.id);
    await incrementPromptCopy(prompt.id);

    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <EnhancedSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Prompts werden geladen...</p>
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
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Prompt-Bibliothek</h1>
              </div>
              <p className="text-gray-500">
                Copy-Paste Prompts für AI-Coding-Tools - getestet und optimiert für beste Ergebnisse
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
                      placeholder="Suche nach Prompts..."
                      className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-xl
                               focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none"
                    />
                  </div>
                </div>

                {/* Tool Filter */}
                <select
                  value={selectedTool || ''}
                  onChange={(e) => setSelectedTool(e.target.value || null)}
                  className="px-4 py-2 border border-purple-200 rounded-xl bg-white
                           focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none"
                >
                  <option value="">Alle Tools</option>
                  <option value="any">Universal</option>
                  {tools.map(tool => (
                    <option key={tool.slug} value={tool.slug}>{tool.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <p className="text-sm text-gray-500 mb-4">
              {filteredPrompts.length} {filteredPrompts.length === 1 ? 'Prompt' : 'Prompts'} gefunden
            </p>

            {/* Prompts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPrompts.map((prompt, index) => (
                <motion.div
                  key={prompt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl border border-purple-100 overflow-hidden
                           hover:border-purple-300 hover:shadow-lg transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500
                                      flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{prompt.title}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            {prompt.targetTool && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                {prompt.targetTool === 'any' ? 'Universal' : prompt.targetTool}
                              </span>
                            )}
                            {prompt.isFeatured && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                                <Star className="w-3 h-3" fill="currentColor" />
                                Empfohlen
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleBookmark('prompt', prompt.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isBookmarked('prompt', prompt.id)
                            ? 'bg-purple-100 text-purple-600'
                            : 'hover:bg-purple-50 text-gray-400'
                        }`}
                      >
                        <Bookmark className="w-4 h-4" fill={isBookmarked('prompt', prompt.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <p className="text-sm text-gray-500 mb-4">{prompt.description}</p>

                    {prompt.useCase && (
                      <p className="text-sm text-purple-600 bg-purple-50 px-3 py-2 rounded-lg mb-4">
                        <span className="font-medium">Wann nutzen:</span> {prompt.useCase}
                      </p>
                    )}

                    {/* Preview */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <pre className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-4 font-mono">
                        {prompt.promptTemplate.substring(0, 200)}
                        {prompt.promptTemplate.length > 200 && '...'}
                      </pre>
                    </div>

                    {/* Tags */}
                    {prompt.tags && prompt.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {prompt.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500">
                        {prompt.copyCount}x kopiert
                      </span>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/toolkit/prompts/${prompt.slug}`}
                          className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg
                                   text-sm font-medium transition-colors"
                        >
                          Details
                        </Link>
                        <button
                          onClick={() => handleCopyPrompt(prompt)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                                   transition-all ${
                            copiedId === prompt.id
                              ? 'bg-green-500 text-white'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                        >
                          {copiedId === prompt.id ? (
                            <>
                              <Check className="w-4 h-4" />
                              Kopiert!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Kopieren
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {filteredPrompts.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Prompts gefunden</h3>
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
