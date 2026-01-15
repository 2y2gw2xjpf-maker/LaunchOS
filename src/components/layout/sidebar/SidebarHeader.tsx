import * as React from 'react';
import { Plus, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

interface SidebarHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewAnalysis: () => void;
  isCollapsed: boolean;
}

export const SidebarHeader = ({
  searchQuery,
  onSearchChange,
  onNewAnalysis,
  isCollapsed,
}: SidebarHeaderProps) => {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  if (isCollapsed) {
    return (
      <div className="p-2 space-y-2">
        <Button
          variant="gold"
          size="icon"
          onClick={onNewAnalysis}
          className="w-full h-10"
          title="Neue Analyse"
        >
          <Plus className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="w-full h-10"
          title="Suchen"
        >
          <Search className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 border-b border-navy/10">
      <Button variant="gold" onClick={onNewAnalysis} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Neue Analyse
      </Button>

      <AnimatePresence>
        {isSearchOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Analysen suchen..."
                className={cn(
                  'w-full pl-9 pr-8 py-2 text-sm rounded-lg',
                  'border border-navy/10 bg-white',
                  'focus:border-navy/30 focus:outline-none'
                )}
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-navy/5 rounded"
                >
                  <X className="w-3 h-3 text-charcoal/40" />
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => setIsSearchOpen(true)}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 text-sm text-charcoal/60',
              'rounded-lg hover:bg-navy/5 transition-colors'
            )}
          >
            <Search className="w-4 h-4" />
            <span>Suchen...</span>
          </button>
        )}
      </AnimatePresence>
    </div>
  );
};
