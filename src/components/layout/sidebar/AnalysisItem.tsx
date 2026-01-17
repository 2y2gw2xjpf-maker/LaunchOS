import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star,
  MoreHorizontal,
  Trash2,
  Copy,
  FolderInput,
  Pencil,
  GitCompare,
  GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { SavedAnalysis } from '@/types';

interface AnalysisItemProps {
  analysis: SavedAnalysis;
  isActive: boolean;
  isInComparison: boolean;
  isCollapsed: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onRename: (newName: string) => void;
  onToggleComparison: () => void;
  onMoveToProject: (projectId: string | null) => void;
  projects: Array<{ id: string; name: string; color: string }>;
  dragHandleProps?: Record<string, unknown>;
}

export const AnalysisItem = ({
  analysis,
  isActive,
  isInComparison,
  isCollapsed,
  onSelect,
  onToggleFavorite,
  onDelete,
  onDuplicate,
  onRename,
  onToggleComparison,
  onMoveToProject,
  projects,
  dragHandleProps,
}: AnalysisItemProps) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = React.useState(false);
  const [showMoveMenu, setShowMoveMenu] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState(analysis.name);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Close menu on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
        setShowMoveMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSelect = () => {
    onSelect();
    navigate('/whats-next');
  };

  const handleRename = () => {
    if (editName.trim() && editName !== analysis.name) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Heute';
    if (days === 1) return 'Gestern';
    if (days < 7) return `Vor ${days} Tagen`;
    return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  };

  const getRouteColor = (route?: string) => {
    switch (route) {
      case 'bootstrap':
        return 'bg-brand-100 text-brand-600';
      case 'investor':
        return 'bg-accent-100 text-accent-500';
      case 'hybrid':
        return 'bg-brand-100 text-charcoal';
      default:
        return 'bg-charcoal/10 text-charcoal/60';
    }
  };

  if (isCollapsed) {
    return (
      <button
        onClick={handleSelect}
        className={cn(
          'w-full p-2 rounded-lg transition-colors relative group',
          isActive ? 'bg-brand-100' : 'hover:bg-brand-50',
          isInComparison && 'ring-2 ring-accent-300'
        )}
        title={analysis.name}
      >
        <div
          className={cn(
            'w-11 h-11 rounded-lg flex items-center justify-center text-xs font-semibold',
            getRouteColor(analysis.routeResult?.recommendation)
          )}
        >
          {analysis.name.charAt(0).toUpperCase()}
        </div>
        {analysis.isFavorite && (
          <Star className="absolute top-1 right-1 w-3 h-3 text-accent-500 fill-accent-500" />
        )}
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'group relative rounded-xl transition-all',
        isActive ? 'bg-brand-100' : 'hover:bg-brand-50',
        isInComparison && 'ring-2 ring-accent-300'
      )}
    >
      <div className="flex items-start gap-2 p-3">
        {/* Drag Handle */}
        <div
          {...dragHandleProps}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing pt-1"
        >
          <GripVertical className="w-4 h-4 text-charcoal/30" />
        </div>

        {/* Main Content */}
        <button onClick={handleSelect} className="flex-1 text-left min-w-0">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') {
                  setEditName(analysis.name);
                  setIsEditing(false);
                }
              }}
              className="w-full px-2 py-1 text-sm font-medium rounded border border-brand-200 focus:border-brand-300 focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <p className="text-sm font-medium text-charcoal truncate">{analysis.name}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            {analysis.routeResult && (
              <span
                className={cn(
                  'text-[10px] font-medium px-1.5 py-0.5 rounded',
                  getRouteColor(analysis.routeResult.recommendation)
                )}
              >
                {analysis.routeResult.recommendation === 'bootstrap'
                  ? 'Bootstrap'
                  : analysis.routeResult.recommendation === 'investor'
                  ? 'Investor'
                  : 'Hybrid'}
              </span>
            )}
            <span className="text-[10px] text-charcoal/40">{formatDate(analysis.updatedAt)}</span>
          </div>
        </button>

        {/* Favorite */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="p-1 rounded hover:bg-brand-100 transition-colors"
        >
          <Star
            className={cn(
              'w-4 h-4',
              analysis.isFavorite ? 'text-accent-500 fill-accent-500' : 'text-charcoal/20'
            )}
          />
        </button>

        {/* Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded hover:bg-brand-100 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="w-4 h-4 text-charcoal/40" />
          </button>

          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-medium border border-brand-100 py-1 z-50"
            >
              <button
                onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-charcoal hover:bg-brand-50"
              >
                <Pencil className="w-4 h-4" />
                Umbenennen
              </button>
              <button
                onClick={() => {
                  onDuplicate();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-charcoal hover:bg-brand-50"
              >
                <Copy className="w-4 h-4" />
                Duplizieren
              </button>
              <button
                onClick={() => {
                  onToggleComparison();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-charcoal hover:bg-brand-50"
              >
                <GitCompare className="w-4 h-4" />
                {isInComparison ? 'Aus Vergleich entfernen' : 'Zum Vergleich hinzufügen'}
              </button>

              {/* Move to folder submenu */}
              <div className="relative">
                <button
                  onClick={() => setShowMoveMenu(!showMoveMenu)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-charcoal hover:bg-brand-50"
                >
                  <FolderInput className="w-4 h-4" />
                  Verschieben...
                </button>

                {showMoveMenu && (
                  <div className="absolute left-full top-0 ml-1 w-40 bg-white rounded-xl shadow-medium border border-brand-100 py-1">
                    <button
                      onClick={() => {
                        onMoveToProject(null);
                        setShowMenu(false);
                        setShowMoveMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-charcoal hover:bg-brand-50"
                    >
                      Ohne Ordner
                    </button>
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => {
                          onMoveToProject(project.id);
                          setShowMenu(false);
                          setShowMoveMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-charcoal hover:bg-brand-50"
                      >
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: project.color }}
                        />
                        {project.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-brand-100 my-1" />
              <button
                onClick={() => {
                  onDelete();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Löschen
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
