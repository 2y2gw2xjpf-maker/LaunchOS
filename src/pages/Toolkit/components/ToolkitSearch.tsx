import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, BookOpen, CheckSquare, MessageSquare,
  Puzzle, AlertTriangle, ArrowRight
} from 'lucide-react';
import { useToolkit } from '@/hooks/useToolkit';
import { cn } from '@/lib/utils/cn';

interface SearchResult {
  type: 'guide' | 'checklist' | 'prompt' | 'tool' | 'pitfall';
  id: string;
  slug: string;
  title: string;
  description?: string;
}

interface ToolkitSearchProps {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

const TYPE_CONFIG = {
  guide: {
    icon: BookOpen,
    label: 'Guide',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    path: '/toolkit/guides',
  },
  checklist: {
    icon: CheckSquare,
    label: 'Checklist',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    path: '/toolkit/checklists',
  },
  prompt: {
    icon: MessageSquare,
    label: 'Prompt',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    path: '/toolkit/prompts',
  },
  tool: {
    icon: Puzzle,
    label: 'Tool',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    path: '/toolkit/tools',
  },
  pitfall: {
    icon: AlertTriangle,
    label: 'Fehler',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    path: '/toolkit/pitfalls',
  },
};

export function ToolkitSearch({ placeholder = 'Suche nach Guides, Prompts, Tools...', className, autoFocus }: ToolkitSearchProps) {
  const { guides, checklists, prompts, tools, pitfalls } = useToolkit();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const searchResults = useMemo((): SearchResult[] => {
    if (!query.trim() || query.length < 2) return [];

    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search guides
    guides.forEach((guide) => {
      if (
        guide.title.toLowerCase().includes(lowerQuery) ||
        guide.description?.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          type: 'guide',
          id: guide.id,
          slug: guide.slug,
          title: guide.title,
          description: guide.description,
        });
      }
    });

    // Search checklists
    checklists.forEach((checklist) => {
      if (
        checklist.title.toLowerCase().includes(lowerQuery) ||
        checklist.description?.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          type: 'checklist',
          id: checklist.id,
          slug: checklist.slug,
          title: checklist.title,
          description: checklist.description,
        });
      }
    });

    // Search prompts
    prompts.forEach((prompt) => {
      if (
        prompt.title.toLowerCase().includes(lowerQuery) ||
        prompt.description?.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          type: 'prompt',
          id: prompt.id,
          slug: prompt.slug,
          title: prompt.title,
          description: prompt.description,
        });
      }
    });

    // Search tools
    tools.forEach((tool) => {
      if (
        tool.name.toLowerCase().includes(lowerQuery) ||
        tool.tagline?.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          type: 'tool',
          id: tool.id,
          slug: tool.slug,
          title: tool.name,
          description: tool.tagline,
        });
      }
    });

    // Search pitfalls
    pitfalls.forEach((pitfall) => {
      if (
        pitfall.title.toLowerCase().includes(lowerQuery) ||
        pitfall.description?.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          type: 'pitfall',
          id: pitfall.id,
          slug: pitfall.id, // Pitfalls use id as identifier
          title: pitfall.title,
          description: pitfall.description,
        });
      }
    });

    return results.slice(0, 8); // Limit to 8 results
  }, [query, guides, checklists, prompts, tools, pitfalls]);

  const handleClear = useCallback(() => {
    setQuery('');
  }, []);

  const handleResultClick = useCallback(() => {
    setQuery('');
    setIsFocused(false);
  }, []);

  const showDropdown = isFocused && query.length >= 2;

  return (
    <div className={cn('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            'w-full pl-12 pr-10 py-3 border border-purple-200 rounded-xl',
            'focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none',
            'bg-white transition-all'
          )}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-purple-100 shadow-xl z-50 overflow-hidden"
          >
            {searchResults.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {searchResults.map((result) => {
                  const config = TYPE_CONFIG[result.type];
                  const Icon = config.icon;
                  const path =
                    result.type === 'pitfall'
                      ? `${config.path}#${result.slug}`
                      : `${config.path}/${result.slug}`;

                  return (
                    <Link
                      key={`${result.type}-${result.id}`}
                      to={path}
                      onClick={handleResultClick}
                      className="flex items-start gap-3 p-4 hover:bg-purple-50 transition-colors border-b border-gray-50 last:border-b-0"
                    >
                      <div className={cn('p-2 rounded-lg', config.bgColor)}>
                        <Icon className={cn('w-4 h-4', config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 truncate">{result.title}</span>
                          <span className={cn('px-2 py-0.5 rounded text-xs font-medium', config.bgColor, config.color)}>
                            {config.label}
                          </span>
                        </div>
                        {result.description && (
                          <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{result.description}</p>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center">
                <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Keine Ergebnisse für "{query}"</p>
                <p className="text-sm text-gray-400 mt-1">Versuche andere Suchbegriffe</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
