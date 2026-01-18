/**
 * Venture Create Page
 * Einfaches Formular zum Erstellen eines neuen Ventures
 */

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Rocket, Building2, Briefcase, Sparkles, Loader2 } from 'lucide-react';
import { Header, EnhancedSidebar, PageContainer } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { useVentureContext } from '@/contexts/VentureContext';

// ==================== CONSTANTS ====================

const INDUSTRIES = [
  { value: 'saas', label: 'SaaS / Software' },
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'fintech', label: 'FinTech' },
  { value: 'healthtech', label: 'HealthTech' },
  { value: 'edtech', label: 'EdTech' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'agency', label: 'Agentur / Dienstleistung' },
  { value: 'hardware', label: 'Hardware / IoT' },
  { value: 'ai', label: 'AI / Machine Learning' },
  { value: 'other', label: 'Andere Branche' },
];

const STAGES = [
  { value: 'idea', label: 'Idee', description: 'Noch keine Gründung' },
  { value: 'pre-seed', label: 'Pre-Seed', description: 'Frühe Entwicklung' },
  { value: 'seed', label: 'Seed', description: 'Erste Kunden/Umsätze' },
  { value: 'series-a', label: 'Series A', description: 'Wachstumsphase' },
  { value: 'series-b', label: 'Series B+', description: 'Skalierung' },
  { value: 'growth', label: 'Growth', description: 'Etabliertes Unternehmen' },
];

// ==================== MAIN PAGE ====================

export function VentureCreatePage() {
  const navigate = useNavigate();
  const { createVenture, isLoading: contextLoading, error: contextError } = useVentureContext();

  const [formData, setFormData] = React.useState({
    name: '',
    industry: '',
    stage: 'idea' as 'idea' | 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'growth',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Bitte gib einen Namen ein');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Creating venture with data:', formData);

      const venture = await createVenture({
        name: formData.name.trim(),
        industry: formData.industry || undefined,
        stage: formData.stage,
      });

      console.log('Venture created:', venture);

      if (venture) {
        // Erfolg: Weiterleitung zur Tier-Daten-Eingabe
        navigate('/venture/data-input');
      } else {
        // Context-Fehler anzeigen falls vorhanden
        setError(contextError || 'Venture konnte nicht erstellt werden. Bitte versuche es erneut.');
      }
    } catch (err) {
      console.error('Error creating venture:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = formData.name.trim().length > 0;

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <EnhancedSidebar />
      <PageContainer withSidebar maxWidth="wide">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zum Dashboard
          </Button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-display-sm text-charcoal mb-2">
              Neues Venture erstellen
            </h1>
            <p className="text-charcoal/60">
              Starte mit den Basisdaten deines Startups
            </p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    <Building2 className="w-4 h-4 inline mr-2" />
                    Name deines Ventures *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="z.B. Mein Startup GmbH"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                    autoFocus
                  />
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    <Briefcase className="w-4 h-4 inline mr-2" />
                    Branche (optional)
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all bg-white"
                  >
                    <option value="">Branche auswählen...</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind.value} value={ind.value}>
                        {ind.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stage */}
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-3">
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    Phase
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {STAGES.map((stage) => (
                      <button
                        key={stage.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, stage: stage.value as typeof formData.stage })}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          formData.stage === stage.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-200 bg-white'
                        }`}
                      >
                        <p className={`font-medium ${formData.stage === stage.value ? 'text-purple-700' : 'text-charcoal'}`}>
                          {stage.label}
                        </p>
                        <p className="text-xs text-charcoal/60 mt-1">{stage.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-4"
                  disabled={!isValid || isSubmitting || contextLoading}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Erstelle Venture...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4 mr-2" />
                      Venture erstellen
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* Info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center text-sm text-charcoal/50 mt-6"
          >
            Nach dem Erstellen kannst du weitere Details in der Daten-Eingabe hinzufügen.
          </motion.p>
        </div>
      </PageContainer>
    </div>
  );
}

export default VentureCreatePage;
