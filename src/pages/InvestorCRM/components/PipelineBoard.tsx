/**
 * Kanban-Board fuer Pipeline-Ansicht
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { InvestorContact, PipelineStage } from '@/hooks/useInvestorCRM';
import { PIPELINE_STAGES } from '@/hooks/useInvestorCRM';
import { ContactCard } from './ContactCard';
import { cn } from '@/lib/utils/cn';

interface PipelineBoardProps {
  contacts: InvestorContact[];
  onStageChange: (contactId: string, newStage: PipelineStage) => void;
  onEditContact: (contact: InvestorContact) => void;
  onDeleteContact: (id: string) => void;
  onArchiveContact: (id: string) => void;
  onAddContact: (stage: PipelineStage) => void;
  visibleStages?: PipelineStage[];
}

// Sortable Contact Wrapper
function SortableContact({
  contact,
  onEdit,
  onDelete,
  onArchive,
}: {
  contact: InvestorContact;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: contact.id,
    data: { contact },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ContactCard
        contact={contact}
        onEdit={onEdit}
        onDelete={onDelete}
        onArchive={onArchive}
        isDragging={isDragging}
      />
    </div>
  );
}

// Pipeline Column
function PipelineColumn({
  stage,
  contacts,
  onEditContact,
  onDeleteContact,
  onArchiveContact,
  onAddContact,
}: {
  stage: { value: PipelineStage; label: string; color: string };
  contacts: InvestorContact[];
  onEditContact: (contact: InvestorContact) => void;
  onDeleteContact: (id: string) => void;
  onArchiveContact: (id: string) => void;
  onAddContact: () => void;
}) {
  return (
    <div className="flex-shrink-0 w-72 bg-gray-50 rounded-xl">
      {/* Column Header */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: stage.color }}
            />
            <span className="font-medium text-gray-900">{stage.label}</span>
            <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
              {contacts.length}
            </span>
          </div>
          <button
            onClick={onAddContact}
            className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Column Content */}
      <div className="p-2 space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-hide">
        <SortableContext items={contacts.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {contacts.map((contact) => (
              <SortableContact
                key={contact.id}
                contact={contact}
                onEdit={() => onEditContact(contact)}
                onDelete={() => onDeleteContact(contact.id)}
                onArchive={() => onArchiveContact(contact.id)}
              />
            ))}
          </AnimatePresence>
        </SortableContext>

        {contacts.length === 0 && (
          <div className="py-8 text-center text-gray-400 text-sm">
            Keine Kontakte
          </div>
        )}
      </div>
    </div>
  );
}

export function PipelineBoard({
  contacts,
  onStageChange,
  onEditContact,
  onDeleteContact,
  onArchiveContact,
  onAddContact,
  visibleStages,
}: PipelineBoardProps) {
  const [activeContact, setActiveContact] = React.useState<InvestorContact | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const stages = visibleStages
    ? PIPELINE_STAGES.filter((s) => visibleStages.includes(s.value))
    : PIPELINE_STAGES;

  const handleDragStart = (event: DragStartEvent) => {
    const contact = contacts.find((c) => c.id === event.active.id);
    if (contact) {
      setActiveContact(contact);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveContact(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find which column we dropped into
    const overContact = contacts.find((c) => c.id === overId);
    const overStage = stages.find((s) => s.value === overId);

    if (overStage) {
      // Dropped on column
      onStageChange(activeId, overStage.value);
    } else if (overContact) {
      // Dropped on another contact - use that contact's stage
      onStageChange(activeId, overContact.pipelineStage);
    }
  };

  const getContactsByStage = (stage: PipelineStage) =>
    contacts.filter((c) => c.pipelineStage === stage);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {stages.map((stage) => (
          <PipelineColumn
            key={stage.value}
            stage={stage}
            contacts={getContactsByStage(stage.value)}
            onEditContact={onEditContact}
            onDeleteContact={onDeleteContact}
            onArchiveContact={onArchiveContact}
            onAddContact={() => onAddContact(stage.value)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeContact && (
          <ContactCard
            contact={activeContact}
            onEdit={() => {}}
            onDelete={() => {}}
            onArchive={() => {}}
            isDragging
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}

export default PipelineBoard;
