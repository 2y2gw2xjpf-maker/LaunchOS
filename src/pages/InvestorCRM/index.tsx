/**
 * LaunchOS Investor CRM Page
 * Vollstaendiges CRM fuer Investoren-Management
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Building2, Mail, Phone, Trash2, Archive, MoreVertical } from 'lucide-react';
import { Header, EnhancedSidebar, PageContainer } from '@/components/layout';
import { Button } from '@/components/ui';
import {
  useInvestorCRM,
  type InvestorContact,
  type PipelineStage,
  type InvestorType,
  PIPELINE_STAGES,
} from '@/hooks/useInvestorCRM';
import { PipelineBoard } from './components/PipelineBoard';
import { ContactModal } from './components/ContactModal';
import { ContactCard } from './components/ContactCard';
import { ActivityTimeline } from './components/ActivityTimeline';
import { FilterBar } from './components/FilterBar';
import { PipelineStats } from './components/PipelineStats';
import { cn } from '@/lib/utils/cn';

type ViewMode = 'kanban' | 'table';

export default function InvestorCRMPage() {
  const {
    contacts,
    tags,
    isLoading,
    error,
    createContact,
    updateContact,
    deleteContact,
    archiveContact,
    updatePipelineStage,
    addActivity,
    getActivities,
    createTag,
    getContactsByStage,
    getUpcomingFollowUps,
    getPipelineStats,
    refresh,
  } = useInvestorCRM();

  // State
  const [viewMode, setViewMode] = React.useState<ViewMode>('kanban');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedStages, setSelectedStages] = React.useState<PipelineStage[]>([]);
  const [selectedTypes, setSelectedTypes] = React.useState<InvestorType[]>([]);
  const [selectedPriorities, setSelectedPriorities] = React.useState<('high' | 'medium' | 'low')[]>([]);
  const [selectedTagIds, setSelectedTagIds] = React.useState<string[]>([]);

  const [showContactModal, setShowContactModal] = React.useState(false);
  const [editingContact, setEditingContact] = React.useState<InvestorContact | undefined>();
  const [initialStage, setInitialStage] = React.useState<PipelineStage | undefined>();

  const [showDetailPanel, setShowDetailPanel] = React.useState(false);
  const [selectedContact, setSelectedContact] = React.useState<InvestorContact | undefined>();
  const [contactActivities, setContactActivities] = React.useState<Awaited<ReturnType<typeof getActivities>>>([]);
  const [isLoadingActivities, setIsLoadingActivities] = React.useState(false);

  const [showStats, setShowStats] = React.useState(false);

  // Filter contacts
  const filteredContacts = React.useMemo(() => {
    return contacts.filter((contact) => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          contact.name.toLowerCase().includes(query) ||
          contact.company?.toLowerCase().includes(query) ||
          contact.email?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Stage filter
      if (selectedStages.length > 0 && !selectedStages.includes(contact.pipelineStage)) {
        return false;
      }

      // Type filter
      if (selectedTypes.length > 0 && (!contact.type || !selectedTypes.includes(contact.type))) {
        return false;
      }

      // Priority filter
      if (selectedPriorities.length > 0 && !selectedPriorities.includes(contact.priority)) {
        return false;
      }

      // Tag filter
      if (selectedTagIds.length > 0) {
        const contactTagIds = contact.tags?.map((t) => t.id) || [];
        const hasMatchingTag = selectedTagIds.some((id) => contactTagIds.includes(id));
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }, [contacts, searchQuery, selectedStages, selectedTypes, selectedPriorities, selectedTagIds]);

  // Load activities when selecting a contact
  React.useEffect(() => {
    if (selectedContact) {
      setIsLoadingActivities(true);
      getActivities(selectedContact.id)
        .then(setContactActivities)
        .finally(() => setIsLoadingActivities(false));
    }
  }, [selectedContact, getActivities]);

  // Handlers
  const handleAddContact = (stage?: PipelineStage) => {
    setEditingContact(undefined);
    setInitialStage(stage);
    setShowContactModal(true);
  };

  const handleEditContact = (contact: InvestorContact) => {
    setEditingContact(contact);
    setShowContactModal(true);
  };

  const handleViewContact = (contact: InvestorContact) => {
    setSelectedContact(contact);
    setShowDetailPanel(true);
  };

  const handleSaveContact = async (data: Partial<InvestorContact>) => {
    if (editingContact) {
      await updateContact(editingContact.id, data);
    } else {
      await createContact(data);
    }
    setShowContactModal(false);
    setEditingContact(undefined);
  };

  const handleDeleteContact = async (id: string) => {
    if (confirm('Kontakt wirklich loeschen?')) {
      await deleteContact(id);
      if (selectedContact?.id === id) {
        setSelectedContact(undefined);
        setShowDetailPanel(false);
      }
    }
  };

  const handleArchiveContact = async (id: string) => {
    await archiveContact(id);
    if (selectedContact?.id === id) {
      setSelectedContact(undefined);
      setShowDetailPanel(false);
    }
  };

  const handleStageChange = async (contactId: string, newStage: PipelineStage) => {
    await updatePipelineStage(contactId, newStage);
  };

  const handleAddActivity = async (data: Parameters<typeof addActivity>[1]) => {
    if (!selectedContact) return;
    await addActivity(selectedContact.id, data);
    const updatedActivities = await getActivities(selectedContact.id);
    setContactActivities(updatedActivities);
  };

  const handleCreateTag = async (name: string, color: string) => {
    return await createTag(name, color);
  };

  const upcomingFollowUps = getUpcomingFollowUps(7);
  const pipelineStats = getPipelineStats();

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <EnhancedSidebar />

      <PageContainer withSidebar maxWidth="full">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-display-sm text-charcoal mb-1">
                Investor CRM
              </h1>
              <p className="text-charcoal/60">
                {contacts.length} Kontakte in deiner Pipeline
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowStats(!showStats)}>
                {showStats ? 'Pipeline' : 'Statistiken'}
              </Button>
              <Button variant="primary" onClick={() => handleAddContact()}>
                <Plus className="w-4 h-4 mr-2" />
                Neuer Kontakt
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedStages={selectedStages}
            onStagesChange={setSelectedStages}
            selectedTypes={selectedTypes}
            onTypesChange={setSelectedTypes}
            selectedPriorities={selectedPriorities}
            onPrioritiesChange={setSelectedPriorities}
            selectedTagIds={selectedTagIds}
            onTagsChange={setSelectedTagIds}
            tags={tags}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            upcomingFollowUpsCount={upcomingFollowUps.length}
            onShowFollowUps={() => {
              // Filter to show only upcoming follow-ups
              setSearchQuery('');
            }}
          />
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-600">{error}</p>
              <Button variant="secondary" onClick={refresh} className="mt-4">
                Erneut versuchen
              </Button>
            </div>
          ) : showStats ? (
            <PipelineStats contacts={contacts} stats={pipelineStats} />
          ) : viewMode === 'kanban' ? (
            <PipelineBoard
              contacts={filteredContacts}
              onStageChange={handleStageChange}
              onEditContact={handleViewContact}
              onDeleteContact={handleDeleteContact}
              onArchiveContact={handleArchiveContact}
              onAddContact={handleAddContact}
            />
          ) : (
            // Table View
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Kontakt</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Typ</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Stage</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Prioritaet</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Follow-up</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredContacts.map((contact) => {
                    const stageInfo = PIPELINE_STAGES.find((s) => s.value === contact.pipelineStage);
                    const isOverdue = contact.nextFollowUp && contact.nextFollowUp < new Date();

                    return (
                      <tr
                        key={contact.id}
                        onClick={() => handleViewContact(contact)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                              {contact.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{contact.name}</p>
                              {contact.company && (
                                <p className="text-sm text-gray-500">{contact.company}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {contact.type && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                              {contact.type.toUpperCase()}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-1 text-xs font-medium rounded-full"
                            style={{
                              backgroundColor: `${stageInfo?.color}20`,
                              color: stageInfo?.color,
                            }}
                          >
                            {stageInfo?.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'px-2 py-1 text-xs font-medium rounded-full',
                              contact.priority === 'high'
                                ? 'bg-red-100 text-red-700'
                                : contact.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                            )}
                          >
                            {contact.priority === 'high'
                              ? 'Hoch'
                              : contact.priority === 'medium'
                              ? 'Mittel'
                              : 'Niedrig'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {contact.nextFollowUp && (
                            <span
                              className={cn(
                                'text-sm',
                                isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'
                              )}
                            >
                              {contact.nextFollowUp.toLocaleDateString('de-DE')}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditContact(contact);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredContacts.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Keine Kontakte gefunden</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </PageContainer>

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => {
          setShowContactModal(false);
          setEditingContact(undefined);
        }}
        onSave={handleSaveContact}
        contact={editingContact}
        initialStage={initialStage}
        tags={tags}
        onCreateTag={handleCreateTag}
      />

      {/* Detail Panel */}
      <AnimatePresence>
        {showDetailPanel && selectedContact && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setShowDetailPanel(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selectedContact.name}</h2>
                  {selectedContact.company && (
                    <p className="text-sm text-gray-500">{selectedContact.company}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleEditContact(selectedContact)}>
                    Bearbeiten
                  </Button>
                  <button
                    onClick={() => setShowDetailPanel(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <span className="text-xl text-gray-400">x</span>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Contact Info */}
                <div className="space-y-3">
                  {selectedContact.email && (
                    <a
                      href={`mailto:${selectedContact.email}`}
                      className="flex items-center gap-3 text-gray-600 hover:text-purple-600"
                    >
                      <Mail className="w-4 h-4" />
                      {selectedContact.email}
                    </a>
                  )}
                  {selectedContact.phone && (
                    <a
                      href={`tel:${selectedContact.phone}`}
                      className="flex items-center gap-3 text-gray-600 hover:text-purple-600"
                    >
                      <Phone className="w-4 h-4" />
                      {selectedContact.phone}
                    </a>
                  )}
                </div>

                {/* Pipeline Stage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stage</label>
                  <select
                    value={selectedContact.pipelineStage}
                    onChange={(e) => handleStageChange(selectedContact.id, e.target.value as PipelineStage)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-purple-500 outline-none"
                  >
                    {PIPELINE_STAGES.map((stage) => (
                      <option key={stage.value} value={stage.value}>
                        {stage.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                {selectedContact.tags && selectedContact.tags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedContact.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2 py-1 text-sm rounded-lg"
                          style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Investment Focus */}
                {selectedContact.investmentFocus && selectedContact.investmentFocus.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Investment-Fokus</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedContact.investmentFocus.map((focus, i) => (
                        <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded-lg">
                          {focus}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ticket Size */}
                {(selectedContact.ticketSizeMin || selectedContact.ticketSizeMax) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ticket-Groesse</label>
                    <p className="text-gray-600">
                      {selectedContact.ticketSizeMin?.toLocaleString('de-DE')} EUR
                      {selectedContact.ticketSizeMax && ` - ${selectedContact.ticketSizeMax.toLocaleString('de-DE')} EUR`}
                    </p>
                  </div>
                )}

                {/* Activities */}
                <ActivityTimeline
                  activities={contactActivities}
                  onAddActivity={handleAddActivity}
                  isLoading={isLoadingActivities}
                />
              </div>

              {/* Footer Actions */}
              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4">
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleArchiveContact(selectedContact.id)}
                    className="flex-1"
                  >
                    <Archive className="w-4 h-4 mr-1" />
                    Archivieren
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDeleteContact(selectedContact.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
