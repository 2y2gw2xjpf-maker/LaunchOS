/**
 * Ordner-Baum Navigation
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder, FolderOpen, ChevronRight, ChevronDown, Plus, MoreVertical,
  Edit2, Trash2, Building2, DollarSign, Users, Box, TrendingUp, Scale
} from 'lucide-react';
import type { DataRoomFolder } from '@/hooks/useDataRoom';
import { cn } from '@/lib/utils/cn';

interface FolderTreeProps {
  folders: DataRoomFolder[];
  selectedFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  onCreateFolder: (parentId?: string) => void;
  onEditFolder: (folder: DataRoomFolder) => void;
  onDeleteFolder: (id: string) => void;
}

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  folder: Folder,
  building: Building2,
  'dollar-sign': DollarSign,
  users: Users,
  box: Box,
  'trending-up': TrendingUp,
  scale: Scale,
};

function FolderItem({
  folder,
  level = 0,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
}: {
  folder: DataRoomFolder;
  level?: number;
  selectedFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  onCreateFolder: (parentId?: string) => void;
  onEditFolder: (folder: DataRoomFolder) => void;
  onDeleteFolder: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [showMenu, setShowMenu] = React.useState(false);

  const hasChildren = folder.children && folder.children.length > 0;
  const isSelected = selectedFolderId === folder.id;
  // Icon from map is available but currently using folder icons directly
  const _Icon = iconMap[folder.icon] || Folder;

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors',
          isSelected ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100 text-gray-700'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelectFolder(folder.id)}
      >
        {/* Expand/Collapse */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="p-0.5 rounded hover:bg-gray-200"
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          ) : (
            <span className="w-4 h-4" />
          )}
        </button>

        {/* Folder Icon */}
        <div
          className="w-6 h-6 rounded flex items-center justify-center"
          style={{ backgroundColor: `${folder.color}20` }}
        >
          {isExpanded && hasChildren ? (
            <FolderOpen className="w-4 h-4" />
          ) : (
            <Folder className="w-4 h-4" />
          )}
        </div>

        {/* Name */}
        <span className="flex-1 text-sm font-medium truncate">{folder.name}</span>

        {/* File count */}
        {folder.files && folder.files.length > 0 && (
          <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
            {folder.files.length}
          </span>
        )}

        {/* Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-all"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[140px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateFolder(folder.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                  Unterordner
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditFolder(folder);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit2 className="w-4 h-4" />
                  Bearbeiten
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFolder(folder.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Loeschen
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Children */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {folder.children!.map((child) => (
              <FolderItem
                key={child.id}
                folder={child}
                level={level + 1}
                selectedFolderId={selectedFolderId}
                onSelectFolder={onSelectFolder}
                onCreateFolder={onCreateFolder}
                onEditFolder={onEditFolder}
                onDeleteFolder={onDeleteFolder}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FolderTree({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
}: FolderTreeProps) {
  return (
    <div className="space-y-1">
      {/* All Files */}
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors',
          selectedFolderId === null ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100 text-gray-700'
        )}
        onClick={() => onSelectFolder(null)}
      >
        <span className="w-5" />
        <Folder className="w-5 h-5" />
        <span className="flex-1 text-sm font-medium">Alle Dateien</span>
      </div>

      {/* Folder Tree */}
      {folders.map((folder) => (
        <FolderItem
          key={folder.id}
          folder={folder}
          selectedFolderId={selectedFolderId}
          onSelectFolder={onSelectFolder}
          onCreateFolder={onCreateFolder}
          onEditFolder={onEditFolder}
          onDeleteFolder={onDeleteFolder}
        />
      ))}

      {/* Add Folder */}
      <button
        onClick={() => onCreateFolder()}
        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
      >
        <span className="w-5" />
        <Plus className="w-4 h-4" />
        Neuer Ordner
      </button>
    </div>
  );
}

export default FolderTree;
