/**
 * LaunchOS Data Room Hook
 * Vollstaendiges Data Room Management
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { useOptionalVentureContext } from '@/contexts/VentureContext';

// ==================== TYPES ====================

export interface DataRoomFolder {
  id: string;
  userId: string;
  ventureId?: string;
  name: string;
  description?: string;
  parentId?: string;
  sortOrder: number;
  icon: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  children?: DataRoomFolder[];
  files?: DataRoomFile[];
}

export interface DataRoomFile {
  id: string;
  userId: string;
  ventureId?: string;
  folderId?: string;
  name: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  fileType?: string;
  deliverableId?: string;
  isConfidential: boolean;
  watermarkEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccessLink {
  id: string;
  userId: string;
  ventureId?: string;
  name: string;
  token: string;
  passwordHash?: string;
  allowedFolders?: string[];
  allowedFiles?: string[];
  expiresAt?: Date;
  maxViews?: number;
  currentViews: number;
  downloadAllowed: boolean;
  isActive: boolean;
  createdAt: Date;
  lastAccessedAt?: Date;
}

export interface AccessLogEntry {
  id: string;
  accessLinkId: string;
  action: 'view' | 'download' | 'link_accessed';
  fileId?: string;
  folderId?: string;
  visitorIp?: string;
  visitorUserAgent?: string;
  visitorEmail?: string;
  accessedAt: Date;
}

// Default folder structure for DD
export const DEFAULT_FOLDER_STRUCTURE = [
  { name: '1. Unternehmen', icon: 'building', color: '#9333ea', description: 'Grundlegende Unternehmensdokumente' },
  { name: '2. Finanzen', icon: 'dollar-sign', color: '#22c55e', description: 'Finanzielle Unterlagen' },
  { name: '3. Team', icon: 'users', color: '#3b82f6', description: 'Team und Organisation' },
  { name: '4. Produkt', icon: 'box', color: '#f59e0b', description: 'Produkt und Technologie' },
  { name: '5. Markt', icon: 'trending-up', color: '#ec4899', description: 'Markt und Wettbewerb' },
  { name: '6. Rechtliches', icon: 'scale', color: '#6366f1', description: 'Rechtliche Dokumente' },
  { name: '7. Sonstiges', icon: 'folder', color: '#64748b', description: 'Weitere Dokumente' },
];

export interface UseDataRoomReturn {
  folders: DataRoomFolder[];
  files: DataRoomFile[];
  accessLinks: AccessLink[];
  isLoading: boolean;
  error: string | null;

  // Folders
  createFolder: (data: Partial<DataRoomFolder>) => Promise<DataRoomFolder | null>;
  updateFolder: (id: string, data: Partial<DataRoomFolder>) => Promise<boolean>;
  deleteFolder: (id: string) => Promise<boolean>;

  // Files
  uploadFile: (folderId: string | null, file: File, metadata?: Partial<DataRoomFile>) => Promise<DataRoomFile | null>;
  updateFile: (id: string, data: Partial<DataRoomFile>) => Promise<boolean>;
  deleteFile: (id: string) => Promise<boolean>;
  moveFile: (fileId: string, newFolderId: string | null) => Promise<boolean>;

  // Access Links
  createAccessLink: (data: Partial<AccessLink>) => Promise<AccessLink | null>;
  updateAccessLink: (id: string, data: Partial<AccessLink>) => Promise<boolean>;
  revokeAccessLink: (id: string) => Promise<boolean>;
  getAccessLog: (linkId: string) => Promise<AccessLogEntry[]>;

  // Struktur
  getFolderTree: () => DataRoomFolder[];
  getFilesInFolder: (folderId: string | null) => DataRoomFile[];
  initializeDefaultStructure: () => Promise<boolean>;

  refresh: () => Promise<void>;
}

// ==================== HOOK ====================

export function useDataRoom(): UseDataRoomReturn {
  const { user } = useAuth();
  const ventureContext = useOptionalVentureContext();
  const activeVenture = ventureContext?.activeVenture;
  const [folders, setFolders] = useState<DataRoomFolder[]>([]);
  const [files, setFiles] = useState<DataRoomFile[]>([]);
  const [accessLinks, setAccessLinks] = useState<AccessLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map DB row to Folder
  const mapFolder = (row: Record<string, unknown>): DataRoomFolder => ({
    id: row.id as string,
    userId: row.user_id as string,
    ventureId: row.venture_id as string | undefined,
    name: row.name as string,
    description: row.description as string | undefined,
    parentId: row.parent_id as string | undefined,
    sortOrder: row.sort_order as number,
    icon: row.icon as string,
    color: row.color as string,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  });

  // Map DB row to File
  const mapFile = (row: Record<string, unknown>): DataRoomFile => ({
    id: row.id as string,
    userId: row.user_id as string,
    ventureId: row.venture_id as string | undefined,
    folderId: row.folder_id as string | undefined,
    name: row.name as string,
    description: row.description as string | undefined,
    fileUrl: row.file_url as string,
    fileName: row.file_name as string,
    fileSize: row.file_size as number | undefined,
    fileType: row.file_type as string | undefined,
    deliverableId: row.deliverable_id as string | undefined,
    isConfidential: row.is_confidential as boolean,
    watermarkEnabled: row.watermark_enabled as boolean,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  });

  // Map DB row to AccessLink
  const mapAccessLink = (row: Record<string, unknown>): AccessLink => ({
    id: row.id as string,
    userId: row.user_id as string,
    ventureId: row.venture_id as string | undefined,
    name: row.name as string,
    token: row.token as string,
    passwordHash: row.password_hash as string | undefined,
    allowedFolders: row.allowed_folders as string[] | undefined,
    allowedFiles: row.allowed_files as string[] | undefined,
    expiresAt: row.expires_at ? new Date(row.expires_at as string) : undefined,
    maxViews: row.max_views as number | undefined,
    currentViews: row.current_views as number,
    downloadAllowed: row.download_allowed as boolean,
    isActive: row.is_active as boolean,
    createdAt: new Date(row.created_at as string),
    lastAccessedAt: row.last_accessed_at ? new Date(row.last_accessed_at as string) : undefined,
  });

  // Map DB row to AccessLogEntry
  const mapAccessLog = (row: Record<string, unknown>): AccessLogEntry => ({
    id: row.id as string,
    accessLinkId: row.access_link_id as string,
    action: row.action as 'view' | 'download' | 'link_accessed',
    fileId: row.file_id as string | undefined,
    folderId: row.folder_id as string | undefined,
    visitorIp: row.visitor_ip as string | undefined,
    visitorUserAgent: row.visitor_user_agent as string | undefined,
    visitorEmail: row.visitor_email as string | undefined,
    accessedAt: new Date(row.accessed_at as string),
  });

  // Load folders
  const loadFolders = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) {
      setFolders([]);
      return;
    }

    try {
      let query = supabase
        .from('data_room_folders')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order');

      if (activeVenture) {
        query = query.eq('venture_id', activeVenture.id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setFolders((data || []).map(mapFolder));
    } catch (err) {
      console.error('Error loading folders:', err);
      setError('Fehler beim Laden der Ordner');
    }
  }, [user, activeVenture]);

  // Load files
  const loadFiles = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) {
      setFiles([]);
      return;
    }

    try {
      let query = supabase
        .from('data_room_files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (activeVenture) {
        query = query.eq('venture_id', activeVenture.id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setFiles((data || []).map(mapFile));
    } catch (err) {
      console.error('Error loading files:', err);
      setError('Fehler beim Laden der Dateien');
    }
  }, [user, activeVenture]);

  // Load access links
  const loadAccessLinks = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) {
      setAccessLinks([]);
      return;
    }

    try {
      let query = supabase
        .from('data_room_access_links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (activeVenture) {
        query = query.eq('venture_id', activeVenture.id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setAccessLinks((data || []).map(mapAccessLink));
    } catch (err) {
      console.error('Error loading access links:', err);
    }
  }, [user, activeVenture]);

  // Create folder
  const createFolder = useCallback(
    async (data: Partial<DataRoomFolder>): Promise<DataRoomFolder | null> => {
      if (!user || !isSupabaseConfigured()) return null;

      try {
        const maxOrder = Math.max(...folders.map((f) => f.sortOrder), -1);

        const { data: newFolder, error } = await supabase
          .from('data_room_folders')
          .insert({
            user_id: user.id,
            venture_id: activeVenture?.id,
            name: data.name,
            description: data.description,
            parent_id: data.parentId,
            sort_order: maxOrder + 1,
            icon: data.icon || 'folder',
            color: data.color || '#9333ea',
          })
          .select()
          .single();

        if (error) throw error;

        await loadFolders();
        return mapFolder(newFolder);
      } catch (err) {
        console.error('Error creating folder:', err);
        setError('Fehler beim Erstellen des Ordners');
        return null;
      }
    },
    [user, activeVenture, folders, loadFolders]
  );

  // Update folder
  const updateFolder = useCallback(
    async (id: string, data: Partial<DataRoomFolder>): Promise<boolean> => {
      if (!isSupabaseConfigured()) return false;

      try {
        const updateData: Record<string, unknown> = {};

        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.parentId !== undefined) updateData.parent_id = data.parentId;
        if (data.sortOrder !== undefined) updateData.sort_order = data.sortOrder;
        if (data.icon !== undefined) updateData.icon = data.icon;
        if (data.color !== undefined) updateData.color = data.color;

        const { error } = await supabase.from('data_room_folders').update(updateData).eq('id', id);

        if (error) throw error;

        await loadFolders();
        return true;
      } catch (err) {
        console.error('Error updating folder:', err);
        setError('Fehler beim Aktualisieren');
        return false;
      }
    },
    [loadFolders]
  );

  // Delete folder
  const deleteFolder = useCallback(
    async (id: string): Promise<boolean> => {
      if (!isSupabaseConfigured()) return false;

      try {
        const { error } = await supabase.from('data_room_folders').delete().eq('id', id);

        if (error) throw error;

        await loadFolders();
        await loadFiles(); // Files might have been orphaned
        return true;
      } catch (err) {
        console.error('Error deleting folder:', err);
        setError('Fehler beim Loeschen');
        return false;
      }
    },
    [loadFolders, loadFiles]
  );

  // Upload file
  const uploadFile = useCallback(
    async (
      folderId: string | null,
      file: File,
      metadata?: Partial<DataRoomFile>
    ): Promise<DataRoomFile | null> => {
      if (!user || !isSupabaseConfigured()) return null;

      try {
        // Generate unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `data-room/${user.id}/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage.from('files').getPublicUrl(filePath);

        // Create file record
        const { data: newFile, error } = await supabase
          .from('data_room_files')
          .insert({
            user_id: user.id,
            venture_id: activeVenture?.id,
            folder_id: folderId,
            name: metadata?.name || file.name,
            description: metadata?.description,
            file_url: urlData.publicUrl,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            is_confidential: metadata?.isConfidential || false,
            watermark_enabled: metadata?.watermarkEnabled || false,
          })
          .select()
          .single();

        if (error) throw error;

        await loadFiles();
        return mapFile(newFile);
      } catch (err) {
        console.error('Error uploading file:', err);
        setError('Fehler beim Hochladen');
        return null;
      }
    },
    [user, activeVenture, loadFiles]
  );

  // Update file
  const updateFile = useCallback(
    async (id: string, data: Partial<DataRoomFile>): Promise<boolean> => {
      if (!isSupabaseConfigured()) return false;

      try {
        const updateData: Record<string, unknown> = {};

        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.folderId !== undefined) updateData.folder_id = data.folderId;
        if (data.isConfidential !== undefined) updateData.is_confidential = data.isConfidential;
        if (data.watermarkEnabled !== undefined) updateData.watermark_enabled = data.watermarkEnabled;

        const { error } = await supabase.from('data_room_files').update(updateData).eq('id', id);

        if (error) throw error;

        await loadFiles();
        return true;
      } catch (err) {
        console.error('Error updating file:', err);
        setError('Fehler beim Aktualisieren');
        return false;
      }
    },
    [loadFiles]
  );

  // Delete file
  const deleteFile = useCallback(
    async (id: string): Promise<boolean> => {
      if (!isSupabaseConfigured()) return false;

      try {
        const { error } = await supabase.from('data_room_files').delete().eq('id', id);

        if (error) throw error;

        await loadFiles();
        return true;
      } catch (err) {
        console.error('Error deleting file:', err);
        setError('Fehler beim Loeschen');
        return false;
      }
    },
    [loadFiles]
  );

  // Move file
  const moveFile = useCallback(
    async (fileId: string, newFolderId: string | null): Promise<boolean> => {
      return updateFile(fileId, { folderId: newFolderId || undefined });
    },
    [updateFile]
  );

  // Create access link
  const createAccessLink = useCallback(
    async (data: Partial<AccessLink>): Promise<AccessLink | null> => {
      if (!user || !isSupabaseConfigured()) return null;

      try {
        const { data: newLink, error } = await supabase
          .from('data_room_access_links')
          .insert({
            user_id: user.id,
            venture_id: activeVenture?.id,
            name: data.name,
            allowed_folders: data.allowedFolders,
            allowed_files: data.allowedFiles,
            expires_at: data.expiresAt?.toISOString(),
            max_views: data.maxViews,
            download_allowed: data.downloadAllowed ?? true,
          })
          .select()
          .single();

        if (error) throw error;

        await loadAccessLinks();
        return mapAccessLink(newLink);
      } catch (err) {
        console.error('Error creating access link:', err);
        setError('Fehler beim Erstellen des Links');
        return null;
      }
    },
    [user, activeVenture, loadAccessLinks]
  );

  // Update access link
  const updateAccessLink = useCallback(
    async (id: string, data: Partial<AccessLink>): Promise<boolean> => {
      if (!isSupabaseConfigured()) return false;

      try {
        const updateData: Record<string, unknown> = {};

        if (data.name !== undefined) updateData.name = data.name;
        if (data.allowedFolders !== undefined) updateData.allowed_folders = data.allowedFolders;
        if (data.allowedFiles !== undefined) updateData.allowed_files = data.allowedFiles;
        if (data.expiresAt !== undefined) updateData.expires_at = data.expiresAt?.toISOString();
        if (data.maxViews !== undefined) updateData.max_views = data.maxViews;
        if (data.downloadAllowed !== undefined) updateData.download_allowed = data.downloadAllowed;
        if (data.isActive !== undefined) updateData.is_active = data.isActive;

        const { error } = await supabase.from('data_room_access_links').update(updateData).eq('id', id);

        if (error) throw error;

        await loadAccessLinks();
        return true;
      } catch (err) {
        console.error('Error updating access link:', err);
        setError('Fehler beim Aktualisieren');
        return false;
      }
    },
    [loadAccessLinks]
  );

  // Revoke access link
  const revokeAccessLink = useCallback(
    async (id: string): Promise<boolean> => {
      return updateAccessLink(id, { isActive: false });
    },
    [updateAccessLink]
  );

  // Get access log
  const getAccessLog = useCallback(async (linkId: string): Promise<AccessLogEntry[]> => {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('data_room_access_log')
        .select('*')
        .eq('access_link_id', linkId)
        .order('accessed_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(mapAccessLog);
    } catch (err) {
      console.error('Error loading access log:', err);
      return [];
    }
  }, []);

  // Get folder tree
  const getFolderTree = useCallback((): DataRoomFolder[] => {
    const buildTree = (parentId?: string): DataRoomFolder[] => {
      return folders
        .filter((f) => f.parentId === parentId)
        .map((folder) => ({
          ...folder,
          children: buildTree(folder.id),
          files: files.filter((f) => f.folderId === folder.id),
        }));
    };

    return buildTree(undefined);
  }, [folders, files]);

  // Get files in folder
  const getFilesInFolder = useCallback(
    (folderId: string | null): DataRoomFile[] => {
      return files.filter((f) => f.folderId === folderId);
    },
    [files]
  );

  // Initialize default structure
  const initializeDefaultStructure = useCallback(async (): Promise<boolean> => {
    if (!user || !isSupabaseConfigured()) return false;

    try {
      // Check if folders already exist
      if (folders.length > 0) return true;

      // Create default folders
      for (let i = 0; i < DEFAULT_FOLDER_STRUCTURE.length; i++) {
        const folderDef = DEFAULT_FOLDER_STRUCTURE[i];
        await supabase.from('data_room_folders').insert({
          user_id: user.id,
          venture_id: activeVenture?.id,
          name: folderDef.name,
          description: folderDef.description,
          icon: folderDef.icon,
          color: folderDef.color,
          sort_order: i,
        });
      }

      await loadFolders();
      return true;
    } catch (err) {
      console.error('Error initializing folders:', err);
      setError('Fehler beim Erstellen der Ordnerstruktur');
      return false;
    }
  }, [user, activeVenture, folders.length, loadFolders]);

  // Refresh all data
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([loadFolders(), loadFiles(), loadAccessLinks()]);
    } finally {
      setIsLoading(false);
    }
  }, [loadFolders, loadFiles, loadAccessLinks]);

  // Load on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    folders,
    files,
    accessLinks,
    isLoading,
    error,
    createFolder,
    updateFolder,
    deleteFolder,
    uploadFile,
    updateFile,
    deleteFile,
    moveFile,
    createAccessLink,
    updateAccessLink,
    revokeAccessLink,
    getAccessLog,
    getFolderTree,
    getFilesInFolder,
    initializeDefaultStructure,
    refresh,
  };
}

export default useDataRoom;
