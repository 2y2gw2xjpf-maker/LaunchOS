import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen,
  FileText,
  Download,
  Eye,
  Lock,
  AlertCircle,
  ChevronRight,
  File,
  FileSpreadsheet,
  FileImage,
  Presentation,
  Clock,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PublicFile {
  id: string;
  name: string;
  description: string | null;
  fileUrl: string;
  fileName: string;
  fileSize: number | null;
  fileType: string | null;
  folderId: string | null;
  isConfidential: boolean;
  watermarkEnabled: boolean;
}

interface PublicFolder {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  icon: string;
  color: string;
}

interface AccessLinkInfo {
  id: string;
  name: string;
  downloadAllowed: boolean;
  expiresAt: string | null;
  maxViews: number | null;
  currentViews: number;
}

type ViewState = 'loading' | 'password' | 'expired' | 'max_views' | 'not_found' | 'ready';

export default function PublicDataRoom() {
  const { token } = useParams<{ token: string }>();
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [accessLink, setAccessLink] = useState<AccessLinkInfo | null>(null);
  const [folders, setFolders] = useState<PublicFolder[]>([]);
  const [files, setFiles] = useState<PublicFile[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Validate token and check access
  useEffect(() => {
    validateAccess();
  }, [token]);

  const validateAccess = async (enteredPassword?: string) => {
    if (!token) {
      setViewState('not_found');
      return;
    }

    try {
      // Get access link info
      const { data: linkData, error: linkError } = await supabase
        .from('data_room_access_links')
        .select('*')
        .eq('token', token)
        .eq('is_active', true)
        .single();

      if (linkError || !linkData) {
        setViewState('not_found');
        return;
      }

      // Check expiration
      if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
        setViewState('expired');
        return;
      }

      // Check max views
      if (linkData.max_views && linkData.current_views >= linkData.max_views) {
        setViewState('max_views');
        return;
      }

      // Check password
      if (linkData.password_hash && !enteredPassword) {
        setViewState('password');
        return;
      }

      if (linkData.password_hash && enteredPassword) {
        // Simple password check (in production, use proper hashing)
        if (enteredPassword !== linkData.password_hash) {
          setPasswordError('Falsches Passwort');
          return;
        }
      }

      // Access granted - log access and increment views
      await supabase.from('data_room_access_log').insert({
        access_link_id: linkData.id,
        action: 'link_accessed',
        visitor_user_agent: navigator.userAgent,
      });

      await supabase
        .from('data_room_access_links')
        .update({
          current_views: linkData.current_views + 1,
          last_accessed_at: new Date().toISOString(),
        })
        .eq('id', linkData.id);

      setAccessLink({
        id: linkData.id,
        name: linkData.name,
        downloadAllowed: linkData.download_allowed,
        expiresAt: linkData.expires_at,
        maxViews: linkData.max_views,
        currentViews: linkData.current_views + 1,
      });

      // Fetch allowed folders
      if (linkData.allowed_folders && linkData.allowed_folders.length > 0) {
        const { data: foldersData } = await supabase
          .from('data_room_folders')
          .select('*')
          .in('id', linkData.allowed_folders);

        if (foldersData) {
          setFolders(
            foldersData.map((f) => ({
              id: f.id,
              name: f.name,
              description: f.description,
              parentId: f.parent_id,
              icon: f.icon,
              color: f.color,
            }))
          );
        }
      }

      // Fetch allowed files
      const fileIds = linkData.allowed_files || [];
      const folderIds = linkData.allowed_folders || [];

      let filesQuery = supabase.from('data_room_files').select('*');

      if (fileIds.length > 0 && folderIds.length > 0) {
        filesQuery = filesQuery.or(`id.in.(${fileIds.join(',')}),folder_id.in.(${folderIds.join(',')})`);
      } else if (fileIds.length > 0) {
        filesQuery = filesQuery.in('id', fileIds);
      } else if (folderIds.length > 0) {
        filesQuery = filesQuery.in('folder_id', folderIds);
      }

      const { data: filesData } = await filesQuery;

      if (filesData) {
        setFiles(
          filesData.map((f) => ({
            id: f.id,
            name: f.name,
            description: f.description,
            fileUrl: f.file_url,
            fileName: f.file_name,
            fileSize: f.file_size,
            fileType: f.file_type,
            folderId: f.folder_id,
            isConfidential: f.is_confidential,
            watermarkEnabled: f.watermark_enabled,
          }))
        );
      }

      setViewState('ready');
    } catch (error) {
      console.error('Error validating access:', error);
      setViewState('not_found');
    }
  };

  const handlePasswordSubmit = () => {
    setPasswordError('');
    validateAccess(password);
  };

  const handleDownload = async (file: PublicFile) => {
    if (!accessLink?.downloadAllowed) return;

    // Log download
    await supabase.from('data_room_access_log').insert({
      access_link_id: accessLink.id,
      action: 'download',
      file_id: file.id,
      visitor_user_agent: navigator.userAgent,
    });

    // Open file URL
    window.open(file.fileUrl, '_blank');
  };

  const handleView = async (file: PublicFile) => {
    // Log view
    if (accessLink) {
      await supabase.from('data_room_access_log').insert({
        access_link_id: accessLink.id,
        action: 'view',
        file_id: file.id,
        visitor_user_agent: navigator.userAgent,
      });
    }

    window.open(file.fileUrl, '_blank');
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return File;
    if (fileType.includes('pdf')) return FileText;
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return FileSpreadsheet;
    if (fileType.includes('image')) return FileImage;
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return Presentation;
    return File;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  // Filter files by selected folder
  const filteredFiles = selectedFolderId
    ? files.filter((f) => f.folderId === selectedFolderId)
    : files;

  // Render based on state
  if (viewState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Zugriff wird geprüft...</p>
        </div>
      </div>
    );
  }

  if (viewState === 'password') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800/50 rounded-2xl border border-white/10 p-8 w-full max-w-md text-center"
        >
          <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Passwort erforderlich</h1>
          <p className="text-slate-400 mb-6">
            Dieser Data Room ist passwortgeschützt.
          </p>

          <div className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort eingeben"
              className="bg-slate-900/50 border-white/10 text-center"
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            />

            {passwordError && (
              <p className="text-red-400 text-sm">{passwordError}</p>
            )}

            <Button
              onClick={handlePasswordSubmit}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
            >
              Zugang freischalten
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (viewState === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800/50 rounded-2xl border border-white/10 p-8 w-full max-w-md text-center"
        >
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Link abgelaufen</h1>
          <p className="text-slate-400">
            Dieser Zugangslink ist nicht mehr gültig. Bitte kontaktieren Sie den
            Absender für einen neuen Link.
          </p>
        </motion.div>
      </div>
    );
  }

  if (viewState === 'max_views') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800/50 rounded-2xl border border-white/10 p-8 w-full max-w-md text-center"
        >
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <Eye className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Maximale Aufrufe erreicht</h1>
          <p className="text-slate-400">
            Dieser Link wurde bereits die maximale Anzahl an Malen aufgerufen.
            Bitte kontaktieren Sie den Absender für einen neuen Link.
          </p>
        </motion.div>
      </div>
    );
  }

  if (viewState === 'not_found') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800/50 rounded-2xl border border-white/10 p-8 w-full max-w-md text-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Link nicht gefunden</h1>
          <p className="text-slate-400">
            Dieser Zugangslink existiert nicht oder ist nicht mehr aktiv.
          </p>
        </motion.div>
      </div>
    );
  }

  // Ready state - show data room
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{accessLink?.name || 'Data Room'}</h1>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm text-slate-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  Sicherer Zugriff
                </span>
                {accessLink?.expiresAt && (
                  <span className="text-sm text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Gültig bis {new Date(accessLink.expiresAt).toLocaleDateString('de-DE')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Folders */}
          {folders.length > 0 && (
            <div className="col-span-3">
              <div className="bg-slate-800/50 rounded-xl border border-white/5 p-4">
                <h3 className="text-sm font-medium text-white mb-4">Ordner</h3>

                <button
                  onClick={() => setSelectedFolderId(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mb-2 ${
                    selectedFolderId === null
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FolderOpen className="w-4 h-4 inline-block mr-2" />
                  Alle Dateien
                </button>

                {folders
                  .filter((f) => !f.parentId)
                  .map((folder) => (
                    <div key={folder.id}>
                      <button
                        onClick={() => setSelectedFolderId(folder.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                          selectedFolderId === folder.id
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <FolderOpen className="w-4 h-4" style={{ color: folder.color }} />
                        {folder.name}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Main Content - Files */}
          <div className={folders.length > 0 ? 'col-span-9' : 'col-span-12'}>
            <div className="bg-slate-800/50 rounded-xl border border-white/5">
              <div className="p-4 border-b border-white/5">
                <h3 className="text-sm font-medium text-white">
                  {selectedFolderId
                    ? folders.find((f) => f.id === selectedFolderId)?.name
                    : 'Alle Dateien'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {filteredFiles.length} Datei{filteredFiles.length !== 1 ? 'en' : ''}
                </p>
              </div>

              {filteredFiles.length === 0 ? (
                <div className="p-12 text-center">
                  <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Keine Dateien in diesem Ordner</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {filteredFiles.map((file) => {
                    const FileIcon = getFileIcon(file.fileType);
                    return (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                              <FileIcon className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-white">
                                {file.name}
                              </h4>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-slate-500">
                                  {formatFileSize(file.fileSize)}
                                </span>
                                {file.isConfidential && (
                                  <span className="text-xs text-amber-400 flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    Vertraulich
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleView(file)}
                              className="text-slate-400 hover:text-white"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Öffnen
                            </Button>
                            {accessLink?.downloadAllowed && (
                              <Button
                                size="sm"
                                onClick={() => handleDownload(file)}
                                className="bg-purple-500 hover:bg-purple-600"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>

                        {file.description && (
                          <p className="text-xs text-slate-500 mt-2 ml-14">
                            {file.description}
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-slate-500">
          <p>Powered by LaunchOS</p>
        </div>
      </div>
    </div>
  );
}
