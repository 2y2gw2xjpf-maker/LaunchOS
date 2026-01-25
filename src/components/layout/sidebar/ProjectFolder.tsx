import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Folder,
  MoreHorizontal,
  Pencil,
  Trash2,
  Palette,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Project, SavedAnalysis } from '@/types';
import { AnalysisItem } from './AnalysisItem';
import { DEFAULT_PROJECT_COLORS } from '@/types';

interface ProjectFolderProps {
  project: Project;
  analyses: SavedAnalysis[];
  activeAnalysisId: string | null;
  isCollapsed: boolean;
  onToggleExpanded: () => void;
  onUpdateProject: (updates: Partial<Project>) => void;
  onDeleteProject: () => void;
  onSelectAnalysis: (id: string) => void;
  onToggleAnalysisFavorite: (id: string) => void;
  onDeleteAnalysis: (id: string) => void;
  onDuplicateAnalysis: (id: string) => void;
  onRenameAnalysis: (id: string, newName: string) => void;
  onToggleComparison: (id: string) => void;
  onMoveAnalysis: (analysisId: string, projectId: string | null) => void;
  isInComparison: (id: string) => boolean;
  allProjects: Project[];
  isDropTarget?: boolean;
}

export const ProjectFolder = ({
  project,
  analyses,
  activeAnalysisId,
  isCollapsed,
  onToggleExpanded,
  onUpdateProject,
  onDeleteProject,
  onSelectAnalysis,
  onToggleAnalysisFavorite,
  onDeleteAnalysis,
  onDuplicateAnalysis,
  onRenameAnalysis,
  onToggleComparison,
  onMoveAnalysis,
  isInComparison,
  allProjects,
  isDropTarget,
}: ProjectFolderProps) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState(project.name);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
        setShowColorPicker(false);
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

  const handleRename = () => {
    if (editName.trim() && editName !== project.name) {
      onUpdateProject({ name: editName.trim() });
    }
    setIsEditing(false);
  };

  if (isCollapsed) {
    return (
      <div className="px-2">
        <button
          onClick={onToggleExpanded}
          className={cn(
            'w-full p-2 rounded-lg transition-colors',
            'hover:bg-brand-50',
            isDropTarget && 'ring-2 ring-accent-300 bg-accent-50'
          )}
          title={`${project.name} (${analyses.length})`}
        >
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${project.color}20` }}
          >
            <Folder className="w-4 h-4" style={{ color: project.color }} />
          </div>
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl transition-colors',
        isDropTarget && 'ring-2 ring-accent-300 bg-accent-50'
      )}
    >
      {/* Folder Header */}
      <div className="group flex items-center gap-2 px-3 py-2">
        <button
          onClick={onToggleExpanded}
          className="p-1 rounded hover:bg-brand-100 transition-colors"
        >
          <motion.div
            animate={{ rotate: project.isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-4 h-4 text-charcoal/40" />
          </motion.div>
        </button>

        <div
          className="w-6 h-6 rounded flex items-center justify-center"
          style={{ backgroundColor: `${project.color}20` }}
        >
          <Folder className="w-3.5 h-3.5" style={{ color: project.color }} />
        </div>

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
                setEditName(project.name);
                setIsEditing(false);
              }
            }}
            className="flex-1 px-2 py-1 text-sm font-medium rounded border border-brand-200 focus:border-brand-300 focus:outline-none"
          />
        ) : (
          <button
            onClick={onToggleExpanded}
            className="flex-1 text-left text-sm font-medium text-charcoal truncate"
          >
            {project.name}
          </button>
        )}

        <span className="text-xs text-charcoal/40">{analyses.length}</span>

        {/* Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded hover:bg-brand-100 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-charcoal/40" />
          </button>

          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-medium border border-brand-100 py-1 z-[100]"
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
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-charcoal hover:bg-brand-50"
              >
                <Palette className="w-4 h-4" />
                Farbe ändern
              </button>

              {/* Color Picker - inline below button */}
              {showColorPicker && (
                <div className="px-3 py-2 border-t border-brand-50">
                  <div className="grid grid-cols-8 gap-1.5">
                    {DEFAULT_PROJECT_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          onUpdateProject({ color });
                          setShowMenu(false);
                          setShowColorPicker(false);
                        }}
                        className={cn(
                          'w-5 h-5 rounded transition-transform hover:scale-110',
                          project.color === color && 'ring-2 ring-purple-600 ring-offset-1'
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-brand-100 my-1" />
              <button
                onClick={() => {
                  onDeleteProject();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Ordner löschen
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Analyses */}
      <AnimatePresence>
        {project.isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pl-8 pr-2 pb-2 space-y-1">
              {analyses.length === 0 ? (
                <p className="text-xs text-charcoal/40 py-2 px-2">
                  Keine Analysen in diesem Ordner
                </p>
              ) : (
                analyses.map((analysis) => (
                  <AnalysisItem
                    key={analysis.id}
                    analysis={analysis}
                    isActive={analysis.id === activeAnalysisId}
                    isInComparison={isInComparison(analysis.id)}
                    isCollapsed={false}
                    onSelect={() => onSelectAnalysis(analysis.id)}
                    onToggleFavorite={() => onToggleAnalysisFavorite(analysis.id)}
                    onDelete={() => onDeleteAnalysis(analysis.id)}
                    onDuplicate={() => onDuplicateAnalysis(analysis.id)}
                    onRename={(name) => onRenameAnalysis(analysis.id, name)}
                    onToggleComparison={() => onToggleComparison(analysis.id)}
                    onMoveToProject={(projectId) => onMoveAnalysis(analysis.id, projectId)}
                    projects={allProjects.map((p) => ({
                      id: p.id,
                      name: p.name,
                      color: p.color,
                    }))}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
