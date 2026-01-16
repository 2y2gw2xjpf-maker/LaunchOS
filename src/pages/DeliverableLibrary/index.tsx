/**
 * LaunchOS Deliverable Library Page
 * Uebersicht aller generierten Dokumente
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useDeliverables,
  DELIVERABLE_LABELS,
  DELIVERABLE_ICONS,
} from '@/hooks/useDeliverables';
import type { DeliverableType } from '@/hooks/useDeliverables';
import { useOptionalVentureContext } from '@/contexts/VentureContext';
import { EnhancedSidebar } from '@/components/layout/sidebar/EnhancedSidebar';
import {
  Download, Trash2, Eye, Plus,
  Calendar, HardDrive, History, Search,
  Filter, Grid, List, FolderOpen, MessageSquare
} from 'lucide-react';

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | DeliverableType;

export default function DeliverableLibrary() {
  const navigate = useNavigate();
  const { deliverables, isLoading, deleteDeliverable, downloadDeliverable, getVersions } = useDeliverables();
  const ventureContext = useOptionalVentureContext();
  const activeVenture = ventureContext?.activeVenture;
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Nur parent deliverables (keine Versionen)
  const parentDeliverables = deliverables.filter(d => !d.parentId);

  // Gefilterte Deliverables
  const filteredDeliverables = parentDeliverables.filter(d => {
    const matchesFilter = filter === 'all' || d.type === filter;
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Gruppiert nach Typ
  const groupedByType = filteredDeliverables.reduce((acc, d) => {
    if (!acc[d.type]) acc[d.type] = [];
    acc[d.type].push(d);
    return acc;
  }, {} as Record<string, typeof deliverables>);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <EnhancedSidebar />

      {/* Main Content */}
      <div className="md:ml-[300px] transition-all duration-200">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <FolderOpen className="w-7 h-7 text-purple-500" />
                  Deliverable Library
                </h1>
                <p className="text-gray-500 mt-1">
                  {activeVenture ? `Dokumente fuer ${activeVenture.name}` : 'Alle generierten Dokumente'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="p-2 hover:bg-purple-50 rounded-lg"
                  title={viewMode === 'grid' ? 'Listenansicht' : 'Rasteransicht'}
                >
                  {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Dokumente suchen..."
                  className="w-full pl-10 pr-4 py-2.5 border border-purple-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as FilterType)}
                  className="px-4 py-2.5 border border-purple-200 rounded-xl focus:border-purple-400 outline-none"
                >
                  <option value="all">Alle Typen</option>
                  {Object.entries(DELIVERABLE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-48 bg-purple-200 rounded-lg" />
              <div className="h-64 bg-purple-100 rounded-xl" />
            </div>
          ) : filteredDeliverables.length === 0 ? (
            <div className="text-center py-16">
              <FolderOpen className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Noch keine Dokumente
              </h3>
              <p className="text-gray-500 mb-6">
                Starte einen Chat und lass dir Dokumente generieren!
              </p>
              <button
                onClick={() => navigate('/whats-next')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <MessageSquare className="w-5 h-5" />
                Zum Chat
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            // Grid View - Grouped by Type
            <div className="space-y-8">
              {Object.entries(groupedByType).map(([type, items]) => (
                <div key={type}>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>{DELIVERABLE_ICONS[type as DeliverableType]}</span>
                    {DELIVERABLE_LABELS[type as DeliverableType]}
                    <span className="text-sm font-normal text-gray-400">({items.length})</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((deliverable) => {
                      const versions = getVersions(deliverable.id);
                      return (
                        <div
                          key={deliverable.id}
                          className="bg-white rounded-xl border border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all overflow-hidden"
                        >
                          {/* Preview Header */}
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-b border-purple-100">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                <span className="text-2xl">
                                  {DELIVERABLE_ICONS[deliverable.type]}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {deliverable.title}
                                </h3>
                                <p className="text-xs text-gray-500">
                                  v{deliverable.version} {deliverable.fileType && `• ${deliverable.fileType.toUpperCase()}`}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="p-4 space-y-3">
                            {deliverable.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {deliverable.description}
                              </p>
                            )}

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(deliverable.createdAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <HardDrive className="w-3.5 h-3.5" />
                                {formatFileSize(deliverable.fileSize)}
                              </span>
                              {versions.length > 1 && (
                                <span className="flex items-center gap-1">
                                  <History className="w-3.5 h-3.5" />
                                  {versions.length} Versionen
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="px-4 pb-4 flex gap-2">
                            <button
                              onClick={() => downloadDeliverable(deliverable.id)}
                              disabled={!deliverable.fileUrl}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-md disabled:opacity-50 transition-all"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Dokument wirklich loeschen?')) {
                                  deleteDeliverable(deliverable.id);
                                }
                              }}
                              className="p-2 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // List View
            <div className="bg-white rounded-xl border border-purple-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Dokument</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Typ</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Version</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Groesse</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Datum</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50">
                  {filteredDeliverables.map((deliverable) => (
                    <tr key={deliverable.id} className="hover:bg-purple-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{DELIVERABLE_ICONS[deliverable.type]}</span>
                          <div>
                            <p className="font-medium text-gray-900">{deliverable.title}</p>
                            <p className="text-xs text-gray-500">{deliverable.fileName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {DELIVERABLE_LABELS[deliverable.type]}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        v{deliverable.version}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatFileSize(deliverable.fileSize)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(deliverable.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => downloadDeliverable(deliverable.id)}
                            disabled={!deliverable.fileUrl}
                            className="p-2 hover:bg-purple-100 rounded-lg disabled:opacity-50"
                          >
                            <Download className="w-4 h-4 text-purple-500" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Dokument wirklich loeschen?')) {
                                deleteDeliverable(deliverable.id);
                              }
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
