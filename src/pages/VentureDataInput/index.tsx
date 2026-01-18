/**
 * LaunchOS Venture Data Input Page
 * Dynamisches Formular basierend auf ausgewähltem Tier-Level
 *
 * Tier 1: Nur Grundlagen (Branche + Stage)
 * Tier 2: + Produktbeschreibung
 * Tier 3: + URL/Website
 * Tier 4: + GitHub, Pitch Deck, Financials
 */

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  FileText,
  Link as LinkIcon,
  Github,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Header, PageContainer } from '@/components/layout';
import { EnhancedSidebar } from '@/components/layout/sidebar/EnhancedSidebar';
import { Button } from '@/components/ui';
import { useVentureContext } from '@/contexts/VentureContext';
import { useStore } from '@/store';
import { cn } from '@/lib/utils/cn';

// ==================== CONSTANTS ====================

const INDUSTRIES = [
  'HealthTech',
  'FinTech',
  'EdTech',
  'E-Commerce',
  'SaaS',
  'Marketplace',
  'AI/ML',
  'CleanTech',
  'FoodTech',
  'PropTech',
  'InsurTech',
  'LegalTech',
  'HRTech',
  'LogTech',
  'Gaming',
  'Media/Content',
  'Mobility',
  'Cybersecurity',
  'Sonstige',
];

const STAGES = [
  { value: 'idea', label: 'Idee', description: 'Noch kein Produkt, nur Konzept' },
  { value: 'mvp', label: 'MVP', description: 'Erster Prototyp vorhanden' },
  { value: 'pre-seed', label: 'Pre-Seed', description: 'Erste User oder Traction' },
  { value: 'seed', label: 'Seed', description: 'Product-Market Fit gefunden' },
  { value: 'series-a', label: 'Series A', description: 'Skalierungsphase' },
];

const TIER_LABELS = ['Minimal', 'Basis', 'Detailliert', 'Vollständig'];

// ==================== TYPES ====================

interface TierData {
  tier: number;
  category: string;
  stage: string;
  description: string;
  url: string;
  github_url: string;
  pitch_deck_url: string;
  has_financials: boolean;
  financials_summary: string;
  completed_at: string | null;
}

// ==================== COMPONENT ====================

export const VentureDataInputPage = () => {
  const navigate = useNavigate();
  const { activeVenture, updateVenture } = useVentureContext();
  const { selectedTier } = useStore();

  // Tier-Level basierend auf Store oder Venture
  const tierLevel = React.useMemo(() => {
    const tierMap: Record<string, number> = {
      minimal: 1,
      basic: 2,
      detailed: 3,
      full: 4,
    };
    return tierMap[selectedTier || 'minimal'] || 1;
  }, [selectedTier]);

  const [currentStep, setCurrentStep] = React.useState(1);
  const [formData, setFormData] = React.useState<Omit<TierData, 'tier' | 'completed_at'>>({
    category: '',
    stage: '',
    description: '',
    url: '',
    github_url: '',
    pitch_deck_url: '',
    has_financials: false,
    financials_summary: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Anzahl Schritte basierend auf Tier
  const totalSteps = tierLevel;

  // Bestehende Daten laden
  React.useEffect(() => {
    if (activeVenture?.tierData) {
      const existingData = activeVenture.tierData;
      setFormData({
        category: existingData.category || '',
        stage: existingData.stage || '',
        description: existingData.description || '',
        url: existingData.url || '',
        github_url: existingData.github_url || '',
        pitch_deck_url: existingData.pitch_deck_url || '',
        has_financials: existingData.has_financials || false,
        financials_summary: existingData.financials_summary || '',
      });
    }
  }, [activeVenture]);

  // Validierung pro Step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.category) {
          newErrors.category = 'Bitte wähle eine Branche aus';
        }
        if (!formData.stage) {
          newErrors.stage = 'Bitte wähle eine Phase aus';
        }
        break;
      case 2:
        if (tierLevel >= 2 && formData.description.length < 50) {
          newErrors.description = 'Beschreibung sollte mindestens 50 Zeichen haben';
        }
        break;
      case 3:
        if (tierLevel >= 3 && formData.url && !formData.url.startsWith('http')) {
          newErrors.url = 'URL muss mit http:// oder https:// beginnen';
        }
        break;
      case 4:
        // Optional fields - no validation required
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 1:
        return Boolean(formData.category && formData.stage);
      case 2:
        return tierLevel < 2 || formData.description.length >= 50;
      case 3:
        return tierLevel < 3 || !formData.url || formData.url.startsWith('http');
      case 4:
        return true; // Optional fields
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!activeVenture) return;

    setIsSubmitting(true);
    try {
      const tierData: TierData = {
        ...formData,
        tier: tierLevel,
        completed_at: new Date().toISOString(),
      };

      // Update venture mit tier_data
      await updateVenture(activeVenture.id, {
        tierLevel: tierLevel,
        tierData: tierData,
        industry: formData.category,
        stage: formData.stage as 'idea' | 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'growth',
      });

      // Weiterleiten zum Dashboard oder WhatsNext
      navigate('/whats-next');
    } catch (error) {
      console.error('Error saving tier data:', error);
      setErrors({ submit: 'Fehler beim Speichern. Bitte versuche es erneut.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  // Wenn kein aktives Venture, zeige Hinweis
  if (!activeVenture) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <EnhancedSidebar />
        <PageContainer withSidebar maxWidth="narrow">
          <div className="text-center py-16">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-charcoal mb-2">Kein Venture ausgewählt</h2>
            <p className="text-charcoal/60 mb-6">
              Bitte erstelle zuerst ein Venture, bevor du Daten eingeben kannst.
            </p>
            <Button onClick={() => navigate('/dashboard')}>Zum Dashboard</Button>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <EnhancedSidebar />

      <PageContainer withSidebar maxWidth="narrow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4"
            >
              <Sparkles className="w-8 h-8 text-purple-600" />
            </motion.div>
            <h1 className="font-display text-display-sm text-charcoal mb-2">
              Erzähl uns von {activeVenture.name}
            </h1>
            <p className="text-charcoal/60">
              Je mehr du teilst, desto genauer unsere Analyse und Empfehlungen.
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-charcoal/60">
                Schritt {currentStep} von {totalSteps}
              </span>
              <span className="text-sm font-medium text-purple-600">
                Tier {tierLevel}: {TIER_LABELS[tierLevel - 1]}
              </span>
            </div>
            <div className="h-2 bg-charcoal/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-charcoal/10 shadow-soft p-8">
            <AnimatePresence mode="wait">
              {/* STEP 1: Basics (Alle Tiers) */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-charcoal">Grundlagen</h2>
                      <p className="text-sm text-charcoal/60">In welcher Branche und Phase bist du?</p>
                    </div>
                  </div>

                  {/* Branche */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Branche / Kategorie *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={cn(
                        'w-full px-4 py-3 border rounded-xl bg-white',
                        'focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                        'transition-colors',
                        errors.category ? 'border-red-400' : 'border-charcoal/20'
                      )}
                    >
                      <option value="">Wähle eine Branche...</option>
                      {INDUSTRIES.map((industry) => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-sm text-red-500 mt-1">{errors.category}</p>
                    )}
                  </div>

                  {/* Stage */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Aktuelle Phase *
                    </label>
                    <div className="space-y-3">
                      {STAGES.map((stage) => (
                        <label
                          key={stage.value}
                          className={cn(
                            'flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all',
                            formData.stage === stage.value
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-charcoal/20 hover:border-charcoal/30'
                          )}
                        >
                          <input
                            type="radio"
                            name="stage"
                            value={stage.value}
                            checked={formData.stage === stage.value}
                            onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                            className="sr-only"
                          />
                          <div
                            className={cn(
                              'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                              formData.stage === stage.value
                                ? 'border-purple-500 bg-purple-500'
                                : 'border-charcoal/30'
                            )}
                          >
                            {formData.stage === stage.value && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-charcoal">{stage.label}</p>
                            <p className="text-sm text-charcoal/60">{stage.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.stage && <p className="text-sm text-red-500 mt-1">{errors.stage}</p>}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Beschreibung (Tier 2+) */}
              {currentStep === 2 && tierLevel >= 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-charcoal">Dein Produkt</h2>
                      <p className="text-sm text-charcoal/60">Beschreibe was du baust</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Produktbeschreibung *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Beschreibe dein Produkt in 2-3 Sätzen. Was ist das Problem? Was ist deine Lösung? Wer sind deine Kunden?"
                      rows={6}
                      className={cn(
                        'w-full px-4 py-3 border rounded-xl bg-white resize-none',
                        'focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                        'transition-colors',
                        errors.description ? 'border-red-400' : 'border-charcoal/20'
                      )}
                    />
                    <div className="flex justify-between mt-2">
                      <p className="text-sm text-charcoal/60">
                        {formData.description.length}/500 Zeichen (mind. 50)
                      </p>
                      {formData.description.length >= 50 && (
                        <span className="text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Ausreichend
                        </span>
                      )}
                    </div>
                    {errors.description && (
                      <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: URL (Tier 3+) */}
              {currentStep === 3 && tierLevel >= 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                      <LinkIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-charcoal">Live-Präsenz</h2>
                      <p className="text-sm text-charcoal/60">Zeig uns dein Produkt online</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Website / Landing Page URL
                    </label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://dein-startup.com"
                      className={cn(
                        'w-full px-4 py-3 border rounded-xl bg-white',
                        'focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                        'transition-colors',
                        errors.url ? 'border-red-400' : 'border-charcoal/20'
                      )}
                    />
                    <p className="text-sm text-charcoal/60 mt-2">
                      Wir analysieren deine Landing Page für bessere Empfehlungen.
                    </p>
                    {errors.url && <p className="text-sm text-red-500 mt-1">{errors.url}</p>}
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Vollständig (Tier 4) */}
              {currentStep === 4 && tierLevel >= 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                      <Github className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-charcoal">Tiefenanalyse</h2>
                      <p className="text-sm text-charcoal/60">Für maximale Genauigkeit (optional)</p>
                    </div>
                  </div>

                  {/* GitHub */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      GitHub Repository (optional)
                    </label>
                    <input
                      type="url"
                      value={formData.github_url}
                      onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                      placeholder="https://github.com/username/repo"
                      className="w-full px-4 py-3 border border-charcoal/20 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Pitch Deck */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Pitch Deck URL (optional)
                    </label>
                    <input
                      type="url"
                      value={formData.pitch_deck_url}
                      onChange={(e) => setFormData({ ...formData, pitch_deck_url: e.target.value })}
                      placeholder="https://docsend.com/view/... oder Google Drive Link"
                      className="w-full px-4 py-3 border border-charcoal/20 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Financials */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Finanzielle Projektion (optional)
                    </label>
                    <textarea
                      value={formData.financials_summary}
                      onChange={(e) =>
                        setFormData({ ...formData, financials_summary: e.target.value })
                      }
                      placeholder="MRR, Runway, Burn Rate, Revenue-Projektion..."
                      rows={4}
                      className="w-full px-4 py-3 border border-charcoal/20 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            {errors.submit && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-charcoal/10">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                  currentStep === 1
                    ? 'text-charcoal/30 cursor-not-allowed'
                    : 'text-charcoal/60 hover:text-charcoal'
                )}
              >
                <ArrowLeft className="w-4 h-4" />
                Zurück
              </button>

              <Button
                onClick={handleNext}
                disabled={!isStepValid() || isSubmitting}
                className={cn(
                  'flex items-center gap-2',
                  !isStepValid() && 'opacity-50 cursor-not-allowed'
                )}
              >
                {currentStep === totalSteps ? (
                  <>
                    {isSubmitting ? 'Speichern...' : 'Abschließen'}
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Weiter
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Skip Option */}
          <div className="text-center mt-6">
            <button
              onClick={handleSkip}
              className="text-sm text-charcoal/50 hover:text-charcoal/70 transition-colors"
            >
              Später ausfüllen
            </button>
          </div>
        </motion.div>
      </PageContainer>
    </div>
  );
};

export default VentureDataInputPage;
