import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  ArrowLeft, Clock, Eye, ThumbsUp, Bookmark, Share2,
  ChevronRight
} from 'lucide-react';
import { useToolkit } from '@/hooks/useToolkit';
import type { ToolkitGuide } from '@/hooks/useToolkit';
import { EnhancedSidebar } from '@/components/layout/sidebar/EnhancedSidebar';
import { Header } from '@/components/layout/Header';

export default function GuideDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const {
    getGuide,
    getGuidesByTool,
    incrementGuideView,
    markGuideHelpful,
    isBookmarked,
    toggleBookmark
  } = useToolkit();

  const [guide, setGuide] = useState<ToolkitGuide | null>(null);
  const [relatedGuides, setRelatedGuides] = useState<ToolkitGuide[]>([]);
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGuide = async () => {
      if (!slug) return;

      setIsLoading(true);
      const guideData = await getGuide(slug);
      setGuide(guideData);

      if (guideData) {
        // Increment view count
        await incrementGuideView(guideData.id);

        // Get related guides
        if (guideData.tools && guideData.tools.length > 0) {
          const related = getGuidesByTool(guideData.tools[0])
            .filter(g => g.id !== guideData.id)
            .slice(0, 3);
          setRelatedGuides(related);
        }
      }

      setIsLoading(false);
    };

    loadGuide();
  }, [slug, getGuide, getGuidesByTool, incrementGuideView]);

  const handleMarkHelpful = async () => {
    if (!guide || hasMarkedHelpful) return;
    await markGuideHelpful(guide.id);
    setHasMarkedHelpful(true);
    setGuide(prev => prev ? { ...prev, helpfulCount: prev.helpfulCount + 1 } : null);
  };

  const handleShare = async () => {
    if (!guide) return;

    if (navigator.share) {
      await navigator.share({
        title: guide.title,
        text: guide.description,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
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

  if (!guide) {
    return (
      <div className="flex h-screen bg-gray-50">
        <EnhancedSidebar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Guide nicht gefunden</h2>
          <Link to="/toolkit/guides" className="text-purple-600 hover:text-purple-700">
            Zurück zu allen Guides
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
                <Link to="/toolkit/guides" className="text-gray-500 hover:text-purple-600">
                  Guides
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 font-medium truncate">{guide.title}</span>
              </nav>
            </div>
          </div>

          {/* Article */}
          <article className="max-w-4xl mx-auto px-6 py-8">
            {/* Back Link */}
            <Link
              to="/toolkit/guides"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Alle Guides
            </Link>

            {/* Header */}
            <motion.header
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              {/* Meta */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                {guide.difficulty && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    guide.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                    guide.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {guide.difficulty === 'beginner' ? 'Anfänger' :
                     guide.difficulty === 'intermediate' ? 'Mittel' : 'Fortgeschritten'}
                  </span>
                )}
                {guide.estimatedTime && (
                  <span className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-4 h-4" />
                    {guide.estimatedTime}
                  </span>
                )}
                <span className="flex items-center gap-1 text-gray-500">
                  <Eye className="w-4 h-4" />
                  {guide.viewCount} Views
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {guide.title}
              </h1>

              {/* Subtitle */}
              {guide.subtitle && (
                <p className="text-xl text-gray-600 mb-6">{guide.subtitle}</p>
              )}

              {/* Tools */}
              {guide.tools && guide.tools.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {guide.tools.map((tool) => (
                    <Link
                      key={tool}
                      to={`/toolkit/tools/${tool}`}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full
                               text-sm font-medium hover:bg-purple-200 transition-colors"
                    >
                      {tool}
                    </Link>
                  ))}
                </div>
              )}

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500
                              flex items-center justify-center text-white font-medium">
                  {guide.authorName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{guide.authorName}</p>
                  <p className="text-sm text-gray-500">
                    {guide.publishedAt.toLocaleDateString('de-DE', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </motion.header>

            {/* Cover Image */}
            {guide.coverImage && (
              <div className="mb-8 rounded-2xl overflow-hidden">
                <img
                  src={guide.coverImage}
                  alt={guide.title}
                  className="w-full"
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-purple prose-lg max-w-none mb-12">
              <ReactMarkdown
                components={{
                  code: ({ children, className, ...props }) => {
                    const isInline = !className;
                    if (isInline) {
                      return (
                        <code className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-sm" {...props}>
                          {children}
                        </code>
                      );
                    }
                    return (
                      <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto">
                        <code {...props}>{children}</code>
                      </pre>
                    );
                  },
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-purple-500 bg-purple-50
                                          pl-4 py-2 my-4 text-gray-700 rounded-r-lg">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {guide.contentMd}
              </ReactMarkdown>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between py-6 border-t border-b border-purple-100 mb-12">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleMarkHelpful}
                  disabled={hasMarkedHelpful}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                    hasMarkedHelpful
                      ? 'bg-green-100 text-green-700'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" fill={hasMarkedHelpful ? 'currentColor' : 'none'} />
                  Hilfreich ({guide.helpfulCount})
                </button>

                <button
                  onClick={() => toggleBookmark('guide', guide.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                    isBookmarked('guide', guide.id)
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Bookmark className="w-4 h-4" fill={isBookmarked('guide', guide.id) ? 'currentColor' : 'none'} />
                  {isBookmarked('guide', guide.id) ? 'Gespeichert' : 'Speichern'}
                </button>
              </div>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700
                         rounded-xl hover:bg-gray-200 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Teilen
              </button>
            </div>

            {/* Related Guides */}
            {relatedGuides.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Ähnliche Guides</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedGuides.map((relatedGuide) => (
                    <Link
                      key={relatedGuide.id}
                      to={`/toolkit/guides/${relatedGuide.slug}`}
                      className="bg-white rounded-xl p-4 border border-purple-100
                               hover:border-purple-300 hover:shadow-md transition-all"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {relatedGuide.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {relatedGuide.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>
        </main>
      </div>
    </div>
  );
}
