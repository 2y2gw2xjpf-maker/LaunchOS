/**
 * Access Link Manager
 * Verwaltet Zugriffs-Links fuer Investoren
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2, Plus, Copy, Trash2, ExternalLink, Eye, EyeOff,
  Calendar, Users, Download, Clock, Check, X
} from 'lucide-react';
import type { AccessLink, AccessLogEntry, DataRoomFolder } from '@/hooks/useDataRoom';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

interface AccessLinkManagerProps {
  links: AccessLink[];
  folders: DataRoomFolder[];
  onCreateLink: (data: Partial<AccessLink>) => Promise<AccessLink | null>;
  onRevokeLink: (id: string) => Promise<boolean>;
  onGetAccessLog: (linkId: string) => Promise<AccessLogEntry[]>;
}

export function AccessLinkManager({
  links,
  folders,
  onCreateLink,
  onRevokeLink,
  onGetAccessLog,
}: AccessLinkManagerProps) {
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [viewingLogId, setViewingLogId] = React.useState<string | null>(null);
  const [accessLog, setAccessLog] = React.useState<AccessLogEntry[]>([]);
  const [isLoadingLog, setIsLoadingLog] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState({
    name: '',
    allowedFolders: [] as string[],
    expiresIn: '7', // days
    maxViews: '',
    downloadAllowed: true,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsCreating(true);
    try {
      const expiresAt = formData.expiresIn
        ? new Date(Date.now() + parseInt(formData.expiresIn) * 24 * 60 * 60 * 1000)
        : undefined;

      await onCreateLink({
        name: formData.name,
        allowedFolders: formData.allowedFolders.length > 0 ? formData.allowedFolders : undefined,
        expiresAt,
        maxViews: formData.maxViews ? parseInt(formData.maxViews) : undefined,
        downloadAllowed: formData.downloadAllowed,
      });

      setShowCreateForm(false);
      setFormData({
        name: '',
        allowedFolders: [],
        expiresIn: '7',
        maxViews: '',
        downloadAllowed: true,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyLink = (token: string, id: string) => {
    const url = `${window.location.origin}/data-room/view/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const viewAccessLog = async (linkId: string) => {
    if (viewingLogId === linkId) {
      setViewingLogId(null);
      return;
    }

    setViewingLogId(linkId);
    setIsLoadingLog(true);
    try {
      const log = await onGetAccessLog(linkId);
      setAccessLog(log);
    } finally {
      setIsLoadingLog(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpired = (link: AccessLink) => {
    if (!link.expiresAt) return false;
    return link.expiresAt < new Date();
  };

  const isMaxedOut = (link: AccessLink) => {
    if (!link.maxViews) return false;
    return link.currentViews >= link.maxViews;
  };

  const activeLinks = links.filter((l) => l.isActive && !isExpired(l) && !isMaxedOut(l));
  const inactiveLinks = links.filter((l) => !l.isActive || isExpired(l) || isMaxedOut(l));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900">Zugriffs-Links</h3>
          <p className="text-sm text-gray-500">
            Teile dein Data Room sicher mit Investoren
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Neuer Link
        </Button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreate}
            className="bg-gray-50 rounded-xl p-4 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name / Beschreibung *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="z.B. Due Diligence fuer VC XYZ"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zugriff beschraenken auf
              </label>
              <div className="flex flex-wrap gap-2">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        allowedFolders: prev.allowedFolders.includes(folder.id)
                          ? prev.allowedFolders.filter((id) => id !== folder.id)
                          : [...prev.allowedFolders, folder.id],
                      }))
                    }
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                      formData.allowedFolders.includes(folder.id)
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    {folder.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Leer lassen fuer Zugriff auf alle Ordner
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gueltig fuer
                </label>
                <select
                  value={formData.expiresIn}
                  onChange={(e) => setFormData((prev) => ({ ...prev, expiresIn: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-500 outline-none"
                >
                  <option value="1">1 Tag</option>
                  <option value="7">7 Tage</option>
                  <option value="14">14 Tage</option>
                  <option value="30">30 Tage</option>
                  <option value="90">90 Tage</option>
                  <option value="">Unbegrenzt</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max. Aufrufe
                </label>
                <input
                  type="number"
                  value={formData.maxViews}
                  onChange={(e) => setFormData((prev) => ({ ...prev, maxViews: e.target.value }))}
                  placeholder="Unbegrenzt"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Downloads
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, downloadAllowed: !prev.downloadAllowed }))
                  }
                  className={cn(
                    'w-full px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors',
                    formData.downloadAllowed
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-500'
                  )}
                >
                  {formData.downloadAllowed ? (
                    <>
                      <Check className="w-4 h-4 inline mr-1" /> Erlaubt
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 inline mr-1" /> Nicht erlaubt
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowCreateForm(false)}>
                Abbrechen
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isCreating}>
                {isCreating ? 'Erstellen...' : 'Link erstellen'}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Active Links */}
      {activeLinks.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Aktive Links ({activeLinks.length})</h4>
          {activeLinks.map((link) => (
            <div key={link.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Link2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{link.name}</p>
                    <p className="text-xs text-gray-500">
                      Erstellt: {formatDate(link.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyLink(link.token, link.id)}
                    className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Link kopieren"
                  >
                    {copiedId === link.id ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <a
                    href={`/data-room/view/${link.token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Vorschau"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                  <button
                    onClick={() => viewAccessLog(link.id)}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      viewingLogId === link.id ? 'bg-purple-100' : 'hover:bg-purple-50'
                    )}
                    title="Zugriffslog anzeigen"
                  >
                    <Eye className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Link wirklich deaktivieren?')) {
                        onRevokeLink(link.id);
                      }
                    }}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Deaktivieren"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {link.currentViews} {link.maxViews ? `/ ${link.maxViews}` : ''} Aufrufe
                </span>
                {link.expiresAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Gueltig bis: {formatDate(link.expiresAt)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" />
                  {link.downloadAllowed ? 'Download erlaubt' : 'Nur Ansicht'}
                </span>
              </div>

              {/* Access Log */}
              <AnimatePresence>
                {viewingLogId === link.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 pt-4 border-t border-gray-100"
                  >
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Zugriffsprotokoll</h5>
                    {isLoadingLog ? (
                      <div className="py-4 text-center">
                        <div className="w-5 h-5 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />
                      </div>
                    ) : accessLog.length === 0 ? (
                      <p className="text-sm text-gray-400 py-2">Noch keine Zugriffe</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {accessLog.map((entry) => (
                          <div key={entry.id} className="flex items-center gap-3 text-sm">
                            <span className="text-gray-400">{formatDate(entry.accessedAt)}</span>
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded text-xs font-medium',
                                entry.action === 'download'
                                  ? 'bg-blue-100 text-blue-700'
                                  : entry.action === 'view'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              )}
                            >
                              {entry.action === 'download'
                                ? 'Download'
                                : entry.action === 'view'
                                ? 'Angesehen'
                                : 'Link geoeffnet'}
                            </span>
                            {entry.visitorEmail && (
                              <span className="text-gray-600">{entry.visitorEmail}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {/* Inactive Links */}
      {inactiveLinks.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-400">
            Inaktive Links ({inactiveLinks.length})
          </h4>
          {inactiveLinks.map((link) => (
            <div
              key={link.id}
              className="bg-gray-50 rounded-xl border border-gray-100 p-4 opacity-60"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <EyeOff className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-600">{link.name}</p>
                  <p className="text-xs text-gray-400">
                    {isExpired(link)
                      ? 'Abgelaufen'
                      : isMaxedOut(link)
                      ? 'Max. Aufrufe erreicht'
                      : 'Deaktiviert'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {links.length === 0 && !showCreateForm && (
        <div className="text-center py-12">
          <Link2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Noch keine Zugriffs-Links erstellt</p>
          <p className="text-sm text-gray-400 mt-1">
            Erstelle einen Link, um dein Data Room mit Investoren zu teilen
          </p>
        </div>
      )}
    </div>
  );
}

export default AccessLinkManager;
