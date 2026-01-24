import { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ChevronRight, Check, X, ExternalLink,
  Code, BarChart3, Database, Cloud, GraduationCap
} from 'lucide-react';
import { useToolkit } from '@/hooks/useToolkit';
import { EnhancedSidebar } from '@/components/layout/sidebar/EnhancedSidebar';
import { Header } from '@/components/layout/Header';

const RATING_LABELS = {
  ui: { label: 'UI/Frontend', icon: Code },
  backend: { label: 'Backend', icon: BarChart3 },
  database: { label: 'Database', icon: Database },
  deployment: { label: 'Deployment', icon: Cloud },
  learningCurve: { label: 'Lernkurve', icon: GraduationCap },
};

function RatingComparison({ value1, value2, label }: { value1: number; value2: number; label: string }) {
  // Max value calculation available for future styling needs
  const _maxValue = Math.max(value1, value2);

  return (
    <div className="grid grid-cols-3 gap-4 items-center py-3 border-b border-gray-100">
      <div className="flex items-center justify-end gap-2">
        <span className={`text-lg font-bold ${value1 >= value2 ? 'text-purple-600' : 'text-gray-400'}`}>
          {value1}
        </span>
        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden flex justify-end">
          <div
            className={`h-full ${value1 >= value2 ? 'bg-purple-500' : 'bg-gray-400'}`}
            style={{ width: `${(value1 / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="text-center text-sm font-medium text-gray-600">{label}</div>

      <div className="flex items-center gap-2">
        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${value2 >= value1 ? 'bg-pink-500' : 'bg-gray-400'}`}
            style={{ width: `${(value2 / 5) * 100}%` }}
          />
        </div>
        <span className={`text-lg font-bold ${value2 >= value1 ? 'text-pink-600' : 'text-gray-400'}`}>
          {value2}
        </span>
      </div>
    </div>
  );
}

export default function ToolComparePage() {
  const [searchParams] = useSearchParams();
  const { compareTwoTools, isLoading } = useToolkit();

  const toolSlugs = searchParams.get('tools')?.split(',') || [];

  const comparison = useMemo(() => {
    if (toolSlugs.length !== 2) return null;
    return compareTwoTools(toolSlugs[0], toolSlugs[1]);
  }, [toolSlugs, compareTwoTools]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <EnhancedSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="flex h-screen bg-gray-50">
        <EnhancedSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
            <div className="max-w-4xl mx-auto px-6 py-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Wähle zwei Tools zum Vergleichen</h2>
              <p className="text-gray-500 mb-8">
                Gehe zur Tool-Übersicht und wähle zwei Tools aus, um sie zu vergleichen.
              </p>
              <Link
                to="/toolkit/tools"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white
                         rounded-xl hover:bg-purple-700 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Zur Tool-Übersicht
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const { tool1, tool2 } = comparison;

  return (
    <div className="flex h-screen bg-gray-50">
      <EnhancedSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {/* Breadcrumb */}
          <div className="bg-white border-b border-purple-100">
            <div className="max-w-5xl mx-auto px-6 py-3">
              <nav className="flex items-center gap-2 text-sm">
                <Link to="/toolkit" className="text-gray-500 hover:text-purple-600">
                  Toolkit
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link to="/toolkit/tools" className="text-gray-500 hover:text-purple-600">
                  Tools
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 font-medium">Vergleich</span>
              </nav>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-6 py-8">
            {/* Back Link */}
            <Link
              to="/toolkit/tools"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück zur Übersicht
            </Link>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 gap-8 mb-8"
            >
              {/* Tool 1 */}
              <Link
                to={`/toolkit/tools/${tool1.slug}`}
                className="text-center group"
              >
                <div
                  className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center
                           text-3xl font-bold text-white group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: tool1.color || '#9333ea' }}
                >
                  {tool1.name.charAt(0)}
                </div>
                <h2 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                  {tool1.name}
                </h2>
                <p className="text-sm text-gray-500">{tool1.tagline}</p>
              </Link>

              {/* VS */}
              <div className="flex items-center justify-center">
                <span className="text-4xl font-bold text-gray-300">VS</span>
              </div>

              {/* Tool 2 */}
              <Link
                to={`/toolkit/tools/${tool2.slug}`}
                className="text-center group"
              >
                <div
                  className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center
                           text-3xl font-bold text-white group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: tool2.color || '#ec4899' }}
                >
                  {tool2.name.charAt(0)}
                </div>
                <h2 className="text-xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors">
                  {tool2.name}
                </h2>
                <p className="text-sm text-gray-500">{tool2.tagline}</p>
              </Link>
            </motion.div>

            {/* Ratings Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-purple-100 p-6 mb-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Bewertungs-Vergleich</h3>
              {Object.entries(RATING_LABELS).map(([key, { label }]) => (
                <RatingComparison
                  key={key}
                  value1={tool1.ratings[key as keyof typeof tool1.ratings] || 0}
                  value2={tool2.ratings[key as keyof typeof tool2.ratings] || 0}
                  label={label}
                />
              ))}
            </motion.div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* Tool 1 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                {tool1.strengths && tool1.strengths.length > 0 && (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Stärken
                    </h4>
                    <ul className="space-y-2">
                      {tool1.strengths.slice(0, 4).map((s, i) => (
                        <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                          <span className="w-1 h-1 bg-green-500 rounded-full mt-2 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {tool1.weaknesses && tool1.weaknesses.length > 0 && (
                  <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                      <X className="w-4 h-4" />
                      Schwächen
                    </h4>
                    <ul className="space-y-2">
                      {tool1.weaknesses.slice(0, 4).map((w, i) => (
                        <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                          <span className="w-1 h-1 bg-red-500 rounded-full mt-2 shrink-0" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>

              {/* Tool 2 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                {tool2.strengths && tool2.strengths.length > 0 && (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Stärken
                    </h4>
                    <ul className="space-y-2">
                      {tool2.strengths.slice(0, 4).map((s, i) => (
                        <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                          <span className="w-1 h-1 bg-green-500 rounded-full mt-2 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {tool2.weaknesses && tool2.weaknesses.length > 0 && (
                  <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                      <X className="w-4 h-4" />
                      Schwächen
                    </h4>
                    <ul className="space-y-2">
                      {tool2.weaknesses.slice(0, 4).map((w, i) => (
                        <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                          <span className="w-1 h-1 bg-red-500 rounded-full mt-2 shrink-0" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Use Cases */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-purple-100 p-6 mb-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Wann welches Tool nutzen?</h3>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Nutze <span style={{ color: tool1.color || '#9333ea' }}>{tool1.name}</span> wenn:
                  </h4>
                  {tool1.bestFor && tool1.bestFor.length > 0 && (
                    <ul className="space-y-2">
                      {tool1.bestFor.map((useCase, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          {useCase}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Nutze <span style={{ color: tool2.color || '#ec4899' }}>{tool2.name}</span> wenn:
                  </h4>
                  {tool2.bestFor && tool2.bestFor.length > 0 && (
                    <ul className="space-y-2">
                      {tool2.bestFor.map((useCase, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          {useCase}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Pricing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl border border-purple-100 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Preisvergleich</h3>
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">
                    {tool1.pricingModel || 'Keine Angabe'}
                  </p>
                  <p className="font-medium text-gray-900">{tool1.pricingDetails || '-'}</p>
                  {tool1.pricingUrl && (
                    <a
                      href={tool1.pricingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-purple-600 text-sm mt-2"
                    >
                      Details <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">
                    {tool2.pricingModel || 'Keine Angabe'}
                  </p>
                  <p className="font-medium text-gray-900">{tool2.pricingDetails || '-'}</p>
                  {tool2.pricingUrl && (
                    <a
                      href={tool2.pricingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-pink-600 text-sm mt-2"
                    >
                      Details <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
