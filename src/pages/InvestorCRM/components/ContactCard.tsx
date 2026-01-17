/**
 * Kontakt-Karte fuer Kanban-Board
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Mail, Phone, Linkedin, Calendar, Star,
  MoreVertical, Trash2, Archive, Edit2, ExternalLink
} from 'lucide-react';
import type { InvestorContact, InvestorTag } from '@/hooks/useInvestorCRM';
import { cn } from '@/lib/utils/cn';

interface ContactCardProps {
  contact: InvestorContact;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
  isDragging?: boolean;
}

export function ContactCard({ contact, onEdit, onDelete, onArchive, isDragging }: ContactCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);

  const priorityColors = {
    high: 'border-l-red-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-green-500',
  };

  const typeLabels: Record<string, string> = {
    vc: 'VC',
    angel: 'Angel',
    family_office: 'Family Office',
    corporate: 'Corporate',
    accelerator: 'Accelerator',
    other: 'Sonstige',
  };

  const formatDate = (date?: Date) => {
    if (!date) return null;
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });
  };

  const isOverdue = contact.nextFollowUp && contact.nextFollowUp < new Date();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'bg-white rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer group',
        priorityColors[contact.priority],
        isDragging && 'shadow-lg ring-2 ring-purple-500 ring-opacity-50'
      )}
      onClick={onEdit}
    >
      <div className="p-3">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{contact.name}</h4>
            {contact.company && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Building2 className="w-3 h-3" />
                <span className="truncate">{contact.company}</span>
              </div>
            )}
          </div>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all"
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
                      onEdit();
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
                      onArchive();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Archive className="w-4 h-4" />
                    Archivieren
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
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

        {/* Type & Role */}
        <div className="flex items-center gap-2 mb-2">
          {contact.type && (
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
              {typeLabels[contact.type]}
            </span>
          )}
          {contact.role && (
            <span className="text-xs text-gray-500">{contact.role}</span>
          )}
        </div>

        {/* Contact Info */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:text-purple-600 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
            </a>
          )}
          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:text-purple-600 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          )}
          {contact.linkedinUrl && (
            <a
              href={contact.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hover:text-purple-600 transition-colors"
            >
              <Linkedin className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Tags */}
        {contact.tags && contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {contact.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="px-1.5 py-0.5 text-[10px] font-medium rounded"
                style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
              >
                {tag.name}
              </span>
            ))}
            {contact.tags.length > 3 && (
              <span className="text-[10px] text-gray-400">+{contact.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Follow-up */}
        {contact.nextFollowUp && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs',
              isOverdue ? 'text-red-600' : 'text-gray-500'
            )}
          >
            <Calendar className="w-3 h-3" />
            <span>Follow-up: {formatDate(contact.nextFollowUp)}</span>
          </div>
        )}

        {/* Fit Score */}
        {contact.fitScore !== undefined && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                style={{ width: `${contact.fitScore}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{contact.fitScore}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ContactCard;
