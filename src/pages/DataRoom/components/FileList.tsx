/**
 * Datei-Liste mit Drag & Drop Upload
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, Trash2, Eye, Lock, MoreVertical,
  Upload, File, FileImage, FileSpreadsheet, Presentation
} from 'lucide-react';
import type { DataRoomFile, DataRoomFolder } from '@/hooks/useDataRoom';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

interface FileListProps {
  files: DataRoomFile[];
  folder: DataRoomFolder | null;
  onUpload: (files: File[]) => void;
  onDeleteFile: (id: string) => void;
  onViewFile: (file: DataRoomFile) => void;
  onEditFile: (file: DataRoomFile) => void;
  isUploading?: boolean;
}

// File type icon mapping
function getFileIcon(fileType?: string) {
  if (!fileType) return File;
  if (fileType.startsWith('image/')) return FileImage;
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) return FileSpreadsheet;
  if (fileType.includes('presentation') || fileType.includes('powerpoint')) return Presentation;
  if (fileType.includes('pdf') || fileType.includes('document')) return FileText;
  return File;
}

function formatFileSize(bytes?: number) {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date) {
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function FileList({
  files,
  folder,
  onUpload,
  onDeleteFile,
  onViewFile,
  onEditFile,
  isUploading,
}: FileListProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      onUpload(droppedFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className={cn(
        'flex-1 transition-colors rounded-xl',
        isDragOver && 'bg-purple-50 ring-2 ring-purple-300 ring-dashed'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-medium text-gray-900">
            {folder ? folder.name : 'Alle Dateien'}
          </h3>
          <p className="text-sm text-gray-500">
            {files.length} {files.length === 1 ? 'Datei' : 'Dateien'}
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Hochladen...' : 'Hochladen'}
          </Button>
        </div>
      </div>

      {/* Drop Zone */}
      {isDragOver && (
        <div className="mb-4 p-8 border-2 border-dashed border-purple-300 rounded-xl bg-purple-50 text-center">
          <Upload className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="text-purple-600 font-medium">Dateien hier ablegen</p>
        </div>
      )}

      {/* File List */}
      {files.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Keine Dateien in diesem Ordner</p>
          <p className="text-sm text-gray-400 mt-1">
            Ziehe Dateien hierher oder klicke auf Hochladen
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {files.map((file, index) => {
              const Icon = getFileIcon(file.fileType);

              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className="group flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all"
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-purple-600" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">{file.name}</p>
                      {file.isConfidential && (
                        <Lock className="w-3.5 h-3.5 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{formatFileSize(file.fileSize)}</span>
                      <span>{formatDate(file.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onViewFile(file)}
                      className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Anzeigen"
                    >
                      <Eye className="w-4 h-4 text-gray-400 hover:text-purple-600" />
                    </button>
                    <a
                      href={file.fileUrl}
                      download={file.fileName}
                      className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Herunterladen"
                    >
                      <Download className="w-4 h-4 text-gray-400 hover:text-purple-600" />
                    </a>
                    <button
                      onClick={() => {
                        if (confirm('Datei wirklich loeschen?')) {
                          onDeleteFile(file.id);
                        }
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Loeschen"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default FileList;
