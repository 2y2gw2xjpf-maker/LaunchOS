import { Link } from 'react-router-dom';
import { Clock, Eye, ThumbsUp, Bookmark, BookOpen } from 'lucide-react';
import type { ToolkitGuide } from '@/hooks/useToolkit';
import { cn } from '@/lib/utils/cn';

interface GuideCardProps {
  guide: ToolkitGuide;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

export function GuideCard({ guide, isBookmarked, onToggleBookmark }: GuideCardProps) {
  const difficultyConfig = {
    beginner: { label: 'Anfänger', className: 'bg-green-100 text-green-700' },
    intermediate: { label: 'Mittel', className: 'bg-yellow-100 text-yellow-700' },
    advanced: { label: 'Fortgeschritten', className: 'bg-red-100 text-red-700' },
  };

  const difficulty = guide.difficulty ? difficultyConfig[guide.difficulty] : null;

  return (
    <div className="group bg-white rounded-2xl border border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all overflow-hidden">
      {/* Cover Image */}
      <Link to={`/toolkit/guides/${guide.slug}`}>
        <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 relative overflow-hidden">
          {guide.coverImage ? (
            <img
              src={guide.coverImage}
              alt={guide.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-purple-300" />
            </div>
          )}
          {guide.isFeatured && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
              Empfohlen
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        {/* Meta */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {difficulty && (
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', difficulty.className)}>
              {difficulty.label}
            </span>
          )}
          {guide.estimatedTime && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {guide.estimatedTime}
            </span>
          )}
        </div>

        {/* Title & Description */}
        <Link to={`/toolkit/guides/${guide.slug}`}>
          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
            {guide.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{guide.description}</p>

        {/* Tools Tags */}
        {guide.tools && guide.tools.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {guide.tools.slice(0, 3).map((tool) => (
              <span key={tool} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs font-medium">
                {tool}
              </span>
            ))}
            {guide.tools.length > 3 && (
              <span className="px-2 py-0.5 text-gray-400 text-xs">+{guide.tools.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-purple-50">
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {guide.viewCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" />
              {guide.helpfulCount || 0}
            </span>
          </div>
          {onToggleBookmark && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleBookmark();
              }}
              className={cn(
                'p-2 rounded-lg transition-colors',
                isBookmarked ? 'bg-purple-100 text-purple-600' : 'hover:bg-purple-50 text-gray-400'
              )}
            >
              <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
