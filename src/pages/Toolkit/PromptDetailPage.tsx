import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MessageSquare, ChevronRight, Copy, Check,
  Bookmark, ThumbsUp
} from 'lucide-react';
import { useToolkit } from '@/hooks/useToolkit';
import type { ToolkitPrompt, PromptVariable } from '@/hooks/useToolkit';
import { EnhancedSidebar } from '@/components/layout/sidebar/EnhancedSidebar';
import { Header } from '@/components/layout/Header';

export default function PromptDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const {
    getPrompt,
    fillPromptTemplate,
    incrementPromptCopy,
    isBookmarked,
    toggleBookmark
  } = useToolkit();

  const [prompt, setPrompt] = useState<ToolkitPrompt | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPrompt = async () => {
      if (!slug) return;

      setIsLoading(true);
      const data = await getPrompt(slug);
      setPrompt(data);

      // Initialize variable values with placeholders
      if (data?.variables) {
        const initialValues: Record<string, string> = {};
        data.variables.forEach((v: PromptVariable) => {
          initialValues[v.name] = '';
        });
        setVariableValues(initialValues);
      }

      setIsLoading(false);
    };

    loadPrompt();
  }, [slug, getPrompt]);

  const filledPrompt = useMemo(() => {
    if (!prompt) return '';
    return fillPromptTemplate(prompt.promptTemplate, variableValues);
  }, [prompt, variableValues, fillPromptTemplate]);

  const handleCopy = async () => {
    if (!prompt) return;

    await navigator.clipboard.writeText(filledPrompt);
    setCopied(true);
    await incrementPromptCopy(prompt.id);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

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

  if (!prompt) {
    return (
      <div className="flex h-screen bg-gray-50">
        <EnhancedSidebar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Prompt nicht gefunden</h2>
          <Link to="/toolkit/prompts" className="text-purple-600 hover:text-purple-700">
            Zurück zu allen Prompts
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

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {/* Breadcrumb */}
          <div className="bg-white border-b border-purple-100">
            <div className="max-w-4xl mx-auto px-6 py-3">
              <nav className="flex items-center gap-2 text-sm">
                <Link to="/toolkit" className="text-gray-500 hover:text-purple-600">
                  Toolkit
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link to="/toolkit/prompts" className="text-gray-500 hover:text-purple-600">
                  Prompts
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 font-medium truncate">{prompt.title}</span>
              </nav>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Back Link */}
            <Link
              to="/toolkit/prompts"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Alle Prompts
            </Link>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500
                                flex items-center justify-center">
                    <MessageSquare className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{prompt.title}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      {prompt.targetTool && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-sm font-medium">
                          {prompt.targetTool === 'any' ? 'Universal' : prompt.targetTool}
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {prompt.copyCount}x kopiert
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleBookmark('prompt', prompt.id)}
                  className={`p-3 rounded-xl transition-colors ${
                    isBookmarked('prompt', prompt.id)
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Bookmark className="w-5 h-5" fill={isBookmarked('prompt', prompt.id) ? 'currentColor' : 'none'} />
                </button>
              </div>

              {prompt.description && (
                <p className="text-gray-600 mt-4">{prompt.description}</p>
              )}

              {prompt.useCase && (
                <div className="mt-4 p-4 bg-purple-50 rounded-xl">
                  <p className="text-sm text-purple-700">
                    <span className="font-medium">Wann nutzen:</span> {prompt.useCase}
                  </p>
                </div>
              )}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Variable Inputs */}
              {prompt.variables && prompt.variables.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl border border-purple-100 p-6"
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Variablen anpassen</h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Fülle die Felder aus, um den Prompt zu personalisieren.
                  </p>

                  <div className="space-y-4">
                    {prompt.variables.map((variable: PromptVariable) => (
                      <div key={variable.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {variable.label}
                          {variable.required && <span className="text-red-500">*</span>}
                        </label>
                        {variable.type === 'textarea' ? (
                          <textarea
                            value={variableValues[variable.name] || ''}
                            onChange={(e) => setVariableValues(prev => ({
                              ...prev,
                              [variable.name]: e.target.value
                            }))}
                            placeholder={variable.placeholder}
                            rows={3}
                            className="w-full px-4 py-2 border border-purple-200 rounded-xl
                                     focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none resize-none"
                          />
                        ) : variable.type === 'select' && variable.options ? (
                          <select
                            value={variableValues[variable.name] || ''}
                            onChange={(e) => setVariableValues(prev => ({
                              ...prev,
                              [variable.name]: e.target.value
                            }))}
                            className="w-full px-4 py-2 border border-purple-200 rounded-xl
                                     focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none bg-white"
                          >
                            <option value="">Bitte wählen...</option>
                            {variable.options.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={variableValues[variable.name] || ''}
                            onChange={(e) => setVariableValues(prev => ({
                              ...prev,
                              [variable.name]: e.target.value
                            }))}
                            placeholder={variable.placeholder}
                            className="w-full px-4 py-2 border border-purple-200 rounded-xl
                                     focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Preview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={prompt.variables && prompt.variables.length > 0 ? '' : 'lg:col-span-2'}
              >
                <div className="bg-white rounded-2xl border border-purple-100 overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-purple-100">
                    <h2 className="text-lg font-semibold text-gray-900">Prompt Vorschau</h2>
                    <button
                      onClick={handleCopy}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                               transition-all ${
                        copied
                          ? 'bg-green-500 text-white'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Kopiert!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Kopieren
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-6 bg-gray-50 max-h-[500px] overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {filledPrompt}
                    </pre>
                  </div>
                </div>

                {/* Example Output */}
                {prompt.exampleOutput && (
                  <div className="mt-6 bg-white rounded-2xl border border-purple-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-purple-100">
                      <h2 className="text-lg font-semibold text-gray-900">Beispiel-Output</h2>
                    </div>
                    <div className="p-6 bg-green-50">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {prompt.exampleOutput}
                      </pre>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Tags */}
            {prompt.tags && prompt.tags.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {prompt.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Helpful */}
            <div className="mt-8 py-6 border-t border-purple-100">
              <div className="flex items-center gap-4">
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700
                           rounded-xl hover:bg-purple-200 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Hilfreich ({prompt.helpfulCount})
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
