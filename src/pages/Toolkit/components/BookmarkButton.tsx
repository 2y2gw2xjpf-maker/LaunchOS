import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface BookmarkButtonProps {
  isBookmarked: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function BookmarkButton({
  isBookmarked,
  onToggle,
  size = 'md',
  showLabel = false,
  className,
}: BookmarkButtonProps) {
  const sizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        'rounded-lg transition-all',
        sizes[size],
        isBookmarked ? 'bg-purple-100 text-purple-600' : 'hover:bg-purple-50 text-gray-400 hover:text-purple-500',
        showLabel && 'flex items-center gap-2 px-3',
        className
      )}
      title={isBookmarked ? 'Lesezeichen entfernen' : 'Als Lesezeichen speichern'}
    >
      <Bookmark className={iconSizes[size]} fill={isBookmarked ? 'currentColor' : 'none'} />
      {showLabel && <span className="text-sm font-medium">{isBookmarked ? 'Gespeichert' : 'Speichern'}</span>}
    </button>
  );
}
