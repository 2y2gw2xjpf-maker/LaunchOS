import { Code, BarChart3, Database, Cloud, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ToolRatingsProps {
  ratings: {
    ui?: number;
    backend?: number;
    database?: number;
    deployment?: number;
    learningCurve?: number;
  };
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

const RATING_CONFIG = {
  ui: { label: 'UI/Frontend', icon: Code, color: 'bg-blue-500' },
  backend: { label: 'Backend', icon: BarChart3, color: 'bg-green-500' },
  database: { label: 'Database', icon: Database, color: 'bg-amber-500' },
  deployment: { label: 'Deployment', icon: Cloud, color: 'bg-purple-500' },
  learningCurve: { label: 'Lernkurve', icon: GraduationCap, color: 'bg-pink-500' },
};

export function ToolRatings({ ratings, size = 'md', showLabels = true }: ToolRatingsProps) {
  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="space-y-2">
      {Object.entries(RATING_CONFIG).map(([key, config]) => {
        const value = ratings[key as keyof typeof ratings] || 0;
        const Icon = config.icon;

        return (
          <div key={key} className="flex items-center gap-3">
            {showLabels && (
              <div className="flex items-center gap-2 w-32">
                <Icon className={cn('w-4 h-4 text-gray-400', size === 'sm' && 'w-3 h-3')} />
                <span className={cn('text-gray-600', textSizes[size])}>{config.label}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((dot) => (
                <div
                  key={dot}
                  className={cn(
                    'rounded-full transition-colors',
                    dotSizes[size],
                    dot <= value ? config.color : 'bg-gray-200'
                  )}
                />
              ))}
            </div>
            {showLabels && <span className={cn('text-gray-500 ml-1', textSizes[size])}>{value}/5</span>}
          </div>
        );
      })}
    </div>
  );
}

// Radar chart version for tool detail page
export function ToolRatingsRadar({ ratings }: { ratings: ToolRatingsProps['ratings'] }) {
  const categories = Object.entries(RATING_CONFIG);
  const centerX = 100;
  const centerY = 100;
  const maxRadius = 80;

  // Calculate points for polygon
  const points = categories.map(([key], index) => {
    const value = ratings[key as keyof typeof ratings] || 0;
    const angle = (index * 2 * Math.PI) / categories.length - Math.PI / 2;
    const radius = (value / 5) * maxRadius;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Background rings
  const rings = [1, 2, 3, 4, 5];

  return (
    <div className="relative w-full max-w-xs mx-auto">
      <svg viewBox="0 0 200 200" className="w-full">
        {/* Background rings */}
        {rings.map((ring) => {
          const ringRadius = (ring / 5) * maxRadius;
          const ringPoints = categories.map(([, ], index) => {
            const angle = (index * 2 * Math.PI) / categories.length - Math.PI / 2;
            return {
              x: centerX + ringRadius * Math.cos(angle),
              y: centerY + ringRadius * Math.sin(angle),
            };
          });
          return (
            <polygon
              key={ring}
              points={ringPoints.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis lines */}
        {categories.map(([, ], index) => {
          const angle = (index * 2 * Math.PI) / categories.length - Math.PI / 2;
          const endX = centerX + maxRadius * Math.cos(angle);
          const endY = centerY + maxRadius * Math.sin(angle);
          return <line key={index} x1={centerX} y1={centerY} x2={endX} y2={endY} stroke="#e5e7eb" strokeWidth="1" />;
        })}

        {/* Data polygon */}
        <polygon points={polygonPoints} fill="rgba(147, 51, 234, 0.2)" stroke="#9333ea" strokeWidth="2" />

        {/* Data points */}
        {points.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r="4" fill="#9333ea" />
        ))}
      </svg>

      {/* Labels */}
      {categories.map(([key, config], index) => {
        const angle = (index * 2 * Math.PI) / categories.length - Math.PI / 2;
        const labelRadius = maxRadius + 25;
        const x = centerX + labelRadius * Math.cos(angle);
        const y = centerY + labelRadius * Math.sin(angle);

        // Adjust position based on quadrant (for potential SVG text rendering)
        let _textAnchor: 'start' | 'middle' | 'end' = 'middle';
        let _dx = 0;
        if (x < centerX - 10) {
          _textAnchor = 'end';
          _dx = -5;
        } else if (x > centerX + 10) {
          _textAnchor = 'start';
          _dx = 5;
        }

        return (
          <div
            key={key}
            className="absolute text-xs text-gray-600 font-medium whitespace-nowrap"
            style={{
              left: `${(x / 200) * 100}%`,
              top: `${(y / 200) * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {config.label}
          </div>
        );
      })}
    </div>
  );
}
