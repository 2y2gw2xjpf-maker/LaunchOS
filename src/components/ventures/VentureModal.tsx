/**
 * LaunchOS Venture Modal
 * Erstellen und Bearbeiten von Ventures
 */

import { useState, useEffect } from 'react';
import { useOptionalVentureContext } from '@/contexts/VentureContext';
import type { Venture } from '@/contexts/VentureContext';
import { X, Rocket, Palette } from 'lucide-react';

interface VentureModalProps {
  isOpen: boolean;
  onClose: () => void;
  editVenture?: Venture | null;
}

const INDUSTRIES = [
  'HealthTech', 'FinTech', 'EdTech', 'E-Commerce', 'SaaS', 'Marketplace',
  'AI/ML', 'CleanTech', 'PropTech', 'FoodTech', 'Mobility', 'Other'
];

const STAGES = [
  { value: 'idea' as const, label: 'Idee', description: 'Noch kein Produkt' },
  { value: 'pre-seed' as const, label: 'Pre-Seed', description: 'MVP in Entwicklung' },
  { value: 'seed' as const, label: 'Seed', description: 'Erste Kunden' },
  { value: 'series-a' as const, label: 'Series A', description: 'Product-Market-Fit' },
  { value: 'series-b' as const, label: 'Series B', description: 'Skalierung' },
  { value: 'growth' as const, label: 'Growth', description: 'Profitabel' },
];

const FUNDING_PATHS = [
  { value: 'bootstrap' as const, label: 'Bootstrap', description: 'Ohne externe Investoren' },
  { value: 'investor' as const, label: 'Investor', description: 'VC/Angel-finanziert' },
  { value: 'hybrid' as const, label: 'Hybrid', description: 'Mix aus beidem' },
  { value: 'undecided' as const, label: 'Unentschieden', description: 'Noch offen' },
];

export function VentureModal({ isOpen, onClose, editVenture }: VentureModalProps) {
  const ventureContext = useOptionalVentureContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize form based on editVenture
  const getInitialForm = () => ({
    name: editVenture?.name || '',
    tagline: editVenture?.tagline || '',
    industry: editVenture?.industry || '',
    stage: editVenture?.stage || 'idea',
    fundingPath: editVenture?.fundingPath || 'undecided',
    fundingGoal: editVenture?.fundingGoal || '',
    teamSize: editVenture?.teamSize || 1,
    primaryColor: editVenture?.branding?.primary_color || '#9333ea',
    secondaryColor: editVenture?.branding?.secondary_color || '#ec4899',
  });

  const [form, setForm] = useState(getInitialForm);

  // Reset form when editVenture or isOpen changes - using key pattern instead
  // The parent should remount this component or pass a key when editVenture changes
  useEffect(() => {
    if (isOpen) {
      setForm(getInitialForm());
      setShowDeleteConfirm(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editVenture?.id, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !ventureContext) return;

    setIsSubmitting(true);

    const ventureData: Partial<Venture> = {
      name: form.name,
      tagline: form.tagline || undefined,
      industry: form.industry || undefined,
      stage: form.stage as Venture['stage'],
      fundingPath: form.fundingPath as Venture['fundingPath'],
      fundingGoal: form.fundingGoal || undefined,
      teamSize: form.teamSize,
      branding: {
        primary_color: form.primaryColor,
        secondary_color: form.secondaryColor,
        font: 'Plus Jakarta Sans',
      },
    };

    let success = false;
    if (editVenture) {
      success = await ventureContext.updateVenture(editVenture.id, ventureData);
    } else {
      const newVenture = await ventureContext.createVenture(ventureData);
      success = !!newVenture;
    }

    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!editVenture || !ventureContext) return;

    setIsSubmitting(true);
    const success = await ventureContext.deleteVenture(editVenture.id);
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-purple-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: form.primaryColor }}
            >
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editVenture ? 'Venture bearbeiten' : 'Neues Venture'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name & Tagline */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venture Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="z.B. HealthOS"
                className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="z.B. Die Zukunft der Gesundheitsversorgung"
                className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none"
              />
            </div>
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Branche
            </label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((industry) => (
                <button
                  key={industry}
                  type="button"
                  onClick={() => setForm({ ...form, industry })}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    form.industry === industry
                      ? 'bg-purple-500 text-white'
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>

          {/* Stage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stage
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {STAGES.map((stage) => (
                <button
                  key={stage.value}
                  type="button"
                  onClick={() => setForm({ ...form, stage: stage.value })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    form.stage === stage.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <p className="font-medium text-gray-900">{stage.label}</p>
                  <p className="text-xs text-gray-500">{stage.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Funding Path */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Funding-Strategie
            </label>
            <div className="grid grid-cols-2 gap-3">
              {FUNDING_PATHS.map((path) => (
                <button
                  key={path.value}
                  type="button"
                  onClick={() => setForm({ ...form, fundingPath: path.value })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    form.fundingPath === path.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <p className="font-medium text-gray-900">{path.label}</p>
                  <p className="text-xs text-gray-500">{path.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Funding Goal & Team Size */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Funding-Ziel
              </label>
              <input
                type="text"
                value={form.fundingGoal}
                onChange={(e) => setForm({ ...form, fundingGoal: e.target.value })}
                placeholder="z.B. 500.000"
                className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team-Groesse
              </label>
              <input
                type="number"
                min="1"
                value={form.teamSize}
                onChange={(e) => setForm({ ...form, teamSize: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none"
              />
            </div>
          </div>

          {/* Branding */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Palette className="w-4 h-4 inline mr-1" />
              Branding-Farben
            </label>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer"
                />
                <span className="text-sm text-gray-600">Primaer</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.secondaryColor}
                  onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer"
                />
                <span className="text-sm text-gray-600">Sekundaer</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {editVenture ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Loeschen
              </button>
            ) : (
              <div />
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !form.name.trim()}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50 transition-all"
              >
                {isSubmitting ? 'Speichern...' : editVenture ? 'Speichern' : 'Anlegen'}
              </button>
            </div>
          </div>
        </form>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-white/95 flex items-center justify-center p-6 rounded-2xl">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Venture loeschen?
              </h3>
              <p className="text-gray-600 mb-6">
                Alle Daten (Chats, Bewertungen, Dokumente) werden geloescht.
                Dies kann nicht rueckgaengig gemacht werden.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                >
                  {isSubmitting ? 'Loeschen...' : 'Endgueltig loeschen'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VentureModal;
