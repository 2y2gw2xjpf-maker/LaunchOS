import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen,
  Upload,
  Link2,
  Search,
  FolderPlus,
  LayoutGrid,
  List,
  Eye,
} from 'lucide-react';
import { useDataRoom, type DataRoomFolder, type DataRoomFile } from '@/hooks/useDataRoom';
import { FolderTree } from './components/FolderTree';
import { FileList } from './components/FileList';
import { AccessLinkManager } from './components/AccessLinkManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
type ViewMode = 'grid' | 'list';
type Tab = 'files' | 'access';

export default function DataRoom() {
  const {
    folders,
    files,
    accessLinks,
    isLoading,
    createFolder,
    updateFolder,
    deleteFolder,
    uploadFile,
    updateFile,
    deleteFile,
    createAccessLink,
    revokeAccessLink,
    getAccessLog,
    getFolderTree,
    getFilesInFolder,
    initializeDefaultStructure,
    refresh,
  } = useDataRoom();

  const [activeTab, setActiveTab] = useState<Tab>('files');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderParentId, setNewFolderParentId] = useState<string | undefined>(undefined);
  const [editingFolder, setEditingFolder] = useState<DataRoomFolder | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Get folder tree for navigation - MUST be before any early returns
  const folderTree = getFolderTree();

  // Filter files based on selected folder and search - MUST be before any early returns
  const filteredFiles = files.filter((file) => {
    const matchesFolder = selectedFolderId ? file.folderId === selectedFolderId : true;
    const matchesSearch = searchQuery
      ? file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.description?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesFolder && matchesSearch;
  });

  // Get current folder
  const currentFolder = folders.find((f) => f.id === selectedFolderId) || null;

  // Handle folder creation
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    await createFolder({
      name: newFolderName,
      parentId: newFolderParentId,
    });

    setNewFolderName('');
    setNewFolderParentId(undefined);
    setShowNewFolderModal(false);
  };

  // Handle file upload
  const handleFileUpload = async (uploadedFiles: File[]) => {
    setIsUploading(true);
    try {
      for (const file of uploadedFiles) {
        await uploadFile(selectedFolderId, file);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Handle view file
  const handleViewFile = (file: DataRoomFile) => {
    window.open(file.fileUrl, '_blank');
  };

  // Handle edit file
  const handleEditFile = (file: DataRoomFile) => {
    // For now just open, could show edit modal later
    console.log('Edit file:', file);
  };

  // Stats calculation
  const stats = {
    totalFiles: files.length,
    totalFolders: folders.length,
    activeLinks: accessLinks.filter((l) => l.isActive).length,
    totalViews: accessLinks.reduce((sum, l) => sum + l.currentViews, 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Data Room</h1>
                <p className="text-sm text-slate-400">
                  Sichere Dokumente für Investoren
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Initialize Default Folders */}
              {folders.length === 0 && (
                <Button
                  onClick={initializeDefaultStructure}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Standard-Struktur erstellen
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalFolders}</p>
                  <p className="text-xs text-slate-400">Ordner</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalFiles}</p>
                  <p className="text-xs text-slate-400">Dateien</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.activeLinks}</p>
                  <p className="text-xs text-slate-400">Aktive Links</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalViews}</p>
                  <p className="text-xs text-slate-400">Gesamt-Aufrufe</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mt-6">
            <button
              onClick={() => setActiveTab('files')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'files'
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FolderOpen className="w-4 h-4 inline-block mr-2" />
              Dateien & Ordner
            </button>
            <button
              onClick={() => setActiveTab('access')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'access'
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Link2 className="w-4 h-4 inline-block mr-2" />
              Zugriffs-Links
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'files' ? (
            <motion.div
              key="files"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-12 gap-6"
            >
              {/* Sidebar - Folder Tree */}
              <div className="col-span-3">
                <div className="bg-slate-800/50 rounded-xl border border-white/5 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-white">Ordner</h3>
                    <button
                      onClick={() => {
                        setNewFolderParentId(undefined);
                        setShowNewFolderModal(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                    >
                      <FolderPlus className="w-4 h-4" />
                    </button>
                  </div>

                  <FolderTree
                    folders={folderTree}
                    selectedFolderId={selectedFolderId}
                    onSelectFolder={setSelectedFolderId}
                    onCreateFolder={(parentId) => {
                      setNewFolderParentId(parentId);
                      setShowNewFolderModal(true);
                    }}
                    onEditFolder={setEditingFolder}
                    onDeleteFolder={deleteFolder}
                  />
                </div>
              </div>

              {/* Main Content - File List */}
              <div className="col-span-9">
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Dateien suchen..."
                        className="pl-10 w-64 bg-slate-800/50 border-white/10"
                      />
                    </div>
                    {currentFolder && (
                      <span className="text-sm text-slate-400">
                        in <span className="text-white">{currentFolder.name}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-800/50 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded transition-colors ${
                          viewMode === 'grid'
                            ? 'bg-purple-500 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded transition-colors ${
                          viewMode === 'list'
                            ? 'bg-purple-500 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* File List */}
                <div className="bg-slate-800/50 rounded-xl border border-white/5 p-4">
                  <FileList
                    files={filteredFiles}
                    folder={currentFolder}
                    onUpload={handleFileUpload}
                    onDeleteFile={deleteFile}
                    onViewFile={handleViewFile}
                    onEditFile={handleEditFile}
                    isUploading={isUploading}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="access"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-slate-800/50 rounded-xl border border-white/5 p-6">
                <AccessLinkManager
                  links={accessLinks}
                  folders={folders}
                  onCreateLink={createAccessLink}
                  onRevokeLink={revokeAccessLink}
                  onGetAccessLog={getAccessLog}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New Folder Modal */}
      <AnimatePresence>
        {showNewFolderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowNewFolderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 rounded-xl border border-white/10 p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Neuer Ordner
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-2">
                    Ordnername
                  </label>
                  <Input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="z.B. Finanzdokumente"
                    className="bg-slate-900/50 border-white/10"
                    autoFocus
                  />
                </div>

                {newFolderParentId && (
                  <p className="text-sm text-slate-400">
                    Wird erstellt in:{' '}
                    <span className="text-white">
                      {folders.find((f) => f.id === newFolderParentId)?.name}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowNewFolderModal(false)}
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Erstellen
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Folder Modal */}
      <AnimatePresence>
        {editingFolder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setEditingFolder(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 rounded-xl border border-white/10 p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Ordner bearbeiten
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-2">
                    Ordnername
                  </label>
                  <Input
                    value={editingFolder.name}
                    onChange={(e) => setEditingFolder({ ...editingFolder, name: e.target.value })}
                    className="bg-slate-900/50 border-white/10"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setEditingFolder(null)}
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={async () => {
                    await updateFolder(editingFolder.id, { name: editingFolder.name });
                    setEditingFolder(null);
                  }}
                  disabled={!editingFolder.name.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  Speichern
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
