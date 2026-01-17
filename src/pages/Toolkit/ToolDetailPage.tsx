import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ChevronRight, ExternalLink, Star, Check, X,
  Lightbulb, AlertTriangle, Code, BarChart3, Database, Cloud, GraduationCap
} from 'lucide-react';
import { useToolkit } from '@/hooks/useToolkit';
import { EnhancedSidebar } from '@/components/layout/sidebar/EnhancedSidebar';
import { Header } from '@/components/layout/Header';

const RATING_LABELS = {
  ui: { label: 'UI/Frontend', icon: Code, description: 'Qualität der generierten UIs' },
  backend: { label: 'Backend', icon: BarChart3, description: 'Fähigkeit für Server-Logik' },
  database: { label: 'Database', icon: Database, description: 'Datenbank-Integration' },
  deployment: { label: 'Deployment', icon: Cloud, description: 'Einfachheit des Deployments' },
  learningCurve: { label: 'Lernkurve', icon: GraduationCap, description: '5 = einfach zu lernen' },
};

function RatingBar({ value, label, description }: { value: number; label: string; description: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">{value}/5</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / 5) * 100}%` }}
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
        />
      </div>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}

export default function ToolDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { getTool, getGuidesByTool, getPromptsByTool, getPitfallsByTool, isLoading } = useToolkit();

  const tool = getTool(slug || '');
  const relatedGuides = getGuidesByTool(slug || '');
  const relatedPrompts = getPromptsByTool(slug || '');
  const relatedPitfalls = getPitfallsByTool(slug || '');

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

  if (!tool) {
    return (
      <div className="flex h-screen bg-gray-50">
        <EnhancedSidebar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Tool nicht gefunden</h2>
          <Link to="/toolkit/tools" className="text-purple-600 hover:text-purple-700">
            Zurück zu allen Tools
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <EnhancedSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto">
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
                <span className="text-gray-900 font-medium">{tool.name}</span>
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
              Alle Tools
            </Link>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-purple-100 p-8 mb-8"
            >
              <div className="flex items-start gap-6">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shrink-0"
                  style={{ backgroundColor: tool.color || '#9333ea' }}
                >
                  {tool.logoUrl ? (
                    <img src={tool.logoUrl} alt={tool.name} className="w-12 h-12" />
                  ) : (
                    tool.name.charAt(0)
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{tool.name}</h1>
                    {tool.isFeatured && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                        <Star className="w-4 h-4" fill="currentColor" />
                        Empfohlen
                      </span>
                    )}
                  </div>
                  <p className="text-xl text-gray-600 mb-4">{tool.tagline}</p>
                  <p className="text-gray-500">{tool.description}</p>

                  {/* Links */}
                  <div className="flex items-center gap-4 mt-6">
                    {tool.websiteUrl && (
                      <a
                        href={tool.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white
                                 rounded-xl hover:bg-purple-700 transition-colors font-medium"
                      >
                        Website
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {tool.docsUrl && (
                      <a
                        href={tool.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700
                                 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                      >
                        Dokumentation
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Ratings */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl border border-purple-100 p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Bewertungen</h2>
                  <div className="space-y-4">
                    {Object.entries(RATING_LABELS).map(([key, { label, description }]) => (
                      <RatingBar
                        key={key}
                        value={tool.ratings[key as keyof typeof tool.ratings] || 0}
                        label={label}
                        description={description}
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  {tool.strengths && tool.strengths.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-green-50 rounded-2xl p-6 border border-green-200"
                    >
                      <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                        <Check className="w-5 h-5" />
                        Stärken
                      </h3>
                      <ul className="space-y-2">
                        {tool.strengths.map((strength, i) => (
                          <li key={i} className="flex items-start gap-2 text-green-800">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {/* Weaknesses */}
                  {tool.weaknesses && tool.weaknesses.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-red-50 rounded-2xl p-6 border border-red-200"
                    >
                      <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                        <X className="w-5 h-5" />
                        Schwächen
                      </h3>
                      <ul className="space-y-2">
                        {tool.weaknesses.map((weakness, i) => (
                          <li key={i} className="flex items-start gap-2 text-red-800">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 shrink-0" />
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>

                {/* Pro Tips */}
                {tool.proTips && tool.proTips.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-purple-50 rounded-2xl p-6 border border-purple-200"
                  >
                    <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      Pro-Tipps
                    </h3>
                    <ul className="space-y-3">
                      {tool.proTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-3 text-purple-800">
                          <span className="px-2 py-0.5 bg-purple-200 text-purple-700 rounded text-xs font-medium shrink-0">
                            #{i + 1}
                          </span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Common Mistakes */}
                {tool.commonMistakes && tool.commonMistakes.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-amber-50 rounded-2xl p-6 border border-amber-200"
                  >
                    <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Häufige Fehler
                    </h3>
                    <ul className="space-y-2">
                      {tool.commonMistakes.map((mistake, i) => (
                        <li key={i} className="flex items-start gap-2 text-amber-800">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 shrink-0" />
                          {mistake}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Use Cases */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl border border-purple-100 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ideal für</h3>
                  {tool.bestFor && tool.bestFor.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tool.bestFor.map((useCase) => (
                        <span
                          key={useCase}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                        >
                          {useCase}
                        </span>
                      ))}
                    </div>
                  )}

                  {tool.notFor && tool.notFor.length > 0 && (
                    <>
                      <h4 className="text-sm font-medium text-gray-700 mt-4 mb-2">Nicht geeignet für</h4>
                      <div className="flex flex-wrap gap-2">
                        {tool.notFor.map((useCase) => (
                          <span
                            key={useCase}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                          >
                            {useCase}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>

                {/* Pricing */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl border border-purple-100 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Preise</h3>
                  {tool.pricingModel && (
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-2">
                      {tool.pricingModel}
                    </span>
                  )}
                  {tool.pricingDetails && (
                    <p className="text-gray-600 text-sm">{tool.pricingDetails}</p>
                  )}
                  {tool.pricingUrl && (
                    <a
                      href={tool.pricingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm mt-3"
                    >
                      Preise ansehen
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </motion.div>

                {/* Tech Stack */}
                {tool.techStack && tool.techStack.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl border border-purple-100 p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {tool.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Related Guides */}
                {relatedGuides.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl border border-purple-100 p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Passende Guides</h3>
                    <div className="space-y-3">
                      {relatedGuides.slice(0, 3).map((guide) => (
                        <Link
                          key={guide.id}
                          to={`/toolkit/guides/${guide.slug}`}
                          className="block p-3 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors"
                        >
                          <h4 className="font-medium text-gray-900 text-sm">{guide.title}</h4>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
