/**
 * Modal zum Erstellen/Bearbeiten von Kontakten
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Building2, Mail, Phone, Linkedin, Globe,
  Calendar, DollarSign, MapPin, Target, Plus
} from 'lucide-react';
import { Button } from '@/components/ui';
import {
  type InvestorContact,
  type InvestorTag,
  type InvestorType,
  type PipelineStage,
  INVESTOR_TYPES,
  PIPELINE_STAGES,
} from '@/hooks/useInvestorCRM';
import { cn } from '@/lib/utils/cn';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<InvestorContact>) => Promise<void>;
  contact?: InvestorContact;
  initialStage?: PipelineStage;
  tags: InvestorTag[];
  onCreateTag: (name: string, color: string) => Promise<InvestorTag | null>;
}

export function ContactModal({
  isOpen,
  onClose,
  onSave,
  contact,
  initialStage,
  tags,
  onCreateTag,
}: ContactModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [showTagInput, setShowTagInput] = React.useState(false);
  const [newTagName, setNewTagName] = React.useState('');

  // Form state
  const [formData, setFormData] = React.useState<Partial<InvestorContact>>({
    name: '',
    company: '',
    role: '',
    type: undefined,
    email: '',
    phone: '',
    linkedinUrl: '',
    website: '',
    investmentFocus: [],
    stageFocus: [],
    ticketSizeMin: undefined,
    ticketSizeMax: undefined,
    geography: [],
    pipelineStage: 'lead',
    priority: 'medium',
    fitScore: undefined,
    nextFollowUp: undefined,
    followUpNote: '',
    source: 'manual',
    referredBy: '',
  });

  const [selectedTagIds, setSelectedTagIds] = React.useState<string[]>([]);
  const [focusInput, setFocusInput] = React.useState('');
  const [geoInput, setGeoInput] = React.useState('');

  // Reset form when contact changes
  React.useEffect(() => {
    if (contact) {
      setFormData({
        ...contact,
        nextFollowUp: contact.nextFollowUp,
      });
      setSelectedTagIds(contact.tags?.map((t) => t.id) || []);
    } else {
      setFormData({
        name: '',
        company: '',
        role: '',
        type: undefined,
        email: '',
        phone: '',
        linkedinUrl: '',
        website: '',
        investmentFocus: [],
        stageFocus: [],
        ticketSizeMin: undefined,
        ticketSizeMax: undefined,
        geography: [],
        pipelineStage: initialStage || 'lead',
        priority: 'medium',
        fitScore: undefined,
        nextFollowUp: undefined,
        followUpNote: '',
        source: 'manual',
        referredBy: '',
      });
      setSelectedTagIds([]);
    }
  }, [contact, initialStage, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving contact:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addFocus = () => {
    if (focusInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        investmentFocus: [...(prev.investmentFocus || []), focusInput.trim()],
      }));
      setFocusInput('');
    }
  };

  const removeFocus = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      investmentFocus: prev.investmentFocus?.filter((_, i) => i !== index),
    }));
  };

  const addGeo = () => {
    if (geoInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        geography: [...(prev.geography || []), geoInput.trim()],
      }));
      setGeoInput('');
    }
  };

  const removeGeo = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      geography: prev.geography?.filter((_, i) => i !== index),
    }));
  };

  const handleCreateTag = async () => {
    if (newTagName.trim()) {
      const tag = await onCreateTag(newTagName.trim(), '#9333ea');
      if (tag) {
        setSelectedTagIds((prev) => [...prev, tag.id]);
        setNewTagName('');
        setShowTagInput(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {contact ? 'Kontakt bearbeiten' : 'Neuer Kontakt'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                    placeholder="Max Mustermann"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unternehmen
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.company || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                    placeholder="Venture Capital GmbH"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rolle
                </label>
                <input
                  type="text"
                  value={formData.role || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                  placeholder="Partner"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Typ
                </label>
                <select
                  value={formData.type || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, type: e.target.value as InvestorType }))
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                >
                  <option value="">Auswaehlen...</option>
                  {INVESTOR_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-Mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                    placeholder="max@vc.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                    placeholder="+49 123 456789"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn
                </label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={formData.linkedinUrl || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, linkedinUrl: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                    placeholder="linkedin.com/in/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                    placeholder="www.vc.com"
                  />
                </div>
              </div>
            </div>

            {/* Investment Focus */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Investment-Fokus
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={focusInput}
                  onChange={(e) => setFocusInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFocus())}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                  placeholder="z.B. HealthTech, FinTech..."
                />
                <Button type="button" variant="secondary" onClick={addFocus}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.investmentFocus?.map((focus, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded-lg"
                  >
                    {focus}
                    <button type="button" onClick={() => removeFocus(i)} className="hover:text-purple-900">
                      x
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Ticket Size & Geography */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ticket Min (EUR)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.ticketSizeMin || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        ticketSizeMin: e.target.value ? parseInt(e.target.value) : undefined,
                      }))
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                    placeholder="100000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ticket Max (EUR)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.ticketSizeMax || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        ticketSizeMax: e.target.value ? parseInt(e.target.value) : undefined,
                      }))
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                    placeholder="500000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fit-Score (%)
                </label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.fitScore || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        fitScore: e.target.value ? parseInt(e.target.value) : undefined,
                      }))
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                    placeholder="80"
                  />
                </div>
              </div>
            </div>

            {/* Geography */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Geographie
              </label>
              <div className="flex gap-2 mb-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={geoInput}
                    onChange={(e) => setGeoInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGeo())}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                    placeholder="z.B. DACH, Europe..."
                  />
                </div>
                <Button type="button" variant="secondary" onClick={addGeo}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.geography?.map((geo, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-lg"
                  >
                    {geo}
                    <button type="button" onClick={() => removeGeo(i)} className="hover:text-blue-900">
                      x
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Pipeline & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pipeline Stage
                </label>
                <select
                  value={formData.pipelineStage || 'lead'}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, pipelineStage: e.target.value as PipelineStage }))
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                >
                  {PIPELINE_STAGES.map((stage) => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioritaet
                </label>
                <div className="flex gap-2">
                  {(['high', 'medium', 'low'] as const).map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, priority }))}
                      className={cn(
                        'flex-1 px-4 py-2 rounded-xl border-2 font-medium transition-colors',
                        formData.priority === priority
                          ? priority === 'high'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : priority === 'medium'
                            ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                            : 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      )}
                    >
                      {priority === 'high' ? 'Hoch' : priority === 'medium' ? 'Mittel' : 'Niedrig'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Follow-up */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Naechstes Follow-up
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={
                      formData.nextFollowUp
                        ? formData.nextFollowUp.toISOString().split('T')[0]
                        : ''
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        nextFollowUp: e.target.value ? new Date(e.target.value) : undefined,
                      }))
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Follow-up Notiz
                </label>
                <input
                  type="text"
                  value={formData.followUpNote || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, followUpNote: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                  placeholder="z.B. Pitch Deck nachfassen"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() =>
                      setSelectedTagIds((prev) =>
                        prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                      )
                    }
                    className={cn(
                      'px-3 py-1 text-sm rounded-lg border-2 transition-colors',
                      selectedTagIds.includes(tag.id)
                        ? 'border-current'
                        : 'border-transparent bg-gray-100'
                    )}
                    style={
                      selectedTagIds.includes(tag.id)
                        ? { backgroundColor: `${tag.color}20`, color: tag.color, borderColor: tag.color }
                        : {}
                    }
                  >
                    {tag.name}
                  </button>
                ))}
                {showTagInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Tag-Name"
                      className="px-3 py-1 text-sm border border-gray-200 rounded-lg focus:border-purple-500 outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleCreateTag}
                      className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg"
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowTagInput(false);
                        setNewTagName('');
                      }}
                      className="px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded-lg"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowTagInput(true)}
                    className="px-3 py-1 text-sm text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Neuer Tag
                  </button>
                )}
              </div>
            </div>

            {/* Source */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quelle
                </label>
                <select
                  value={formData.source || 'manual'}
                  onChange={(e) => setFormData((prev) => ({ ...prev, source: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                >
                  <option value="manual">Manuell</option>
                  <option value="referral">Empfehlung</option>
                  <option value="event">Event</option>
                  <option value="cold_outreach">Cold Outreach</option>
                  <option value="inbound">Inbound</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empfohlen von
                </label>
                <input
                  type="text"
                  value={formData.referredBy || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, referredBy: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                  placeholder="Name des Empfehlenden"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="secondary" onClick={onClose}>
                Abbrechen
              </Button>
              <Button type="submit" variant="primary" disabled={isLoading || !formData.name?.trim()}>
                {isLoading ? 'Speichern...' : contact ? 'Aktualisieren' : 'Erstellen'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default ContactModal;
