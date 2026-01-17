import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, ChevronDown, Lightbulb, Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type Severity = 'critical' | 'warning' | 'info';

interface PitfallCardProps {
  pitfall: {
    id: string;
    title: string;
    description: string;
    severity: Severity;
    solution?: string;
    tools?: string[];
    category?: string;
  };
  defaultExpanded?: boolean;
}

const severityConfig: Record<Severity, { icon: typeof AlertTriangle; color: string; bgColor: string; label: string }> = {
  critical: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    label: 'Kritisch',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
    label: 'Warnung',
  },
  info: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    label: 'Info',
  },
};

export function PitfallCard({ pitfall, defaultExpanded = false }: PitfallCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const config = severityConfig[pitfall.severity];
  const Icon = config.icon;

  return (
    <div className={cn('rounded-xl border transition-all', config.bgColor)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-start gap-3 text-left"
      >
        <div className={cn('p-2 rounded-lg', config.bgColor.replace('50', '100'))}>
          <Icon className={cn('w-5 h-5', config.color)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                config.bgColor.replace('50', '100'),
                config.color
              )}
            >
              {config.label}
            </span>
            {pitfall.category && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                {pitfall.category}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900">{pitfall.title}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{pitfall.description}</p>
        </div>

        <ChevronDown
          className={cn('w-5 h-5 text-gray-400 transition-transform flex-shrink-0', isExpanded && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Full description */}
              <div className="pl-12">
                <p className="text-gray-700">{pitfall.description}</p>
              </div>

              {/* Solution */}
              {pitfall.solution && (
                <div className="bg-green-50 rounded-lg p-4 ml-12">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900 mb-1">Lösung</h4>
                      <p className="text-sm text-green-800">{pitfall.solution}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Affected tools */}
              {pitfall.tools && pitfall.tools.length > 0 && (
                <div className="pl-12">
                  <p className="text-sm text-gray-500 mb-2">Betrifft:</p>
                  <div className="flex flex-wrap gap-2">
                    {pitfall.tools.map((tool) => (
                      <span key={tool} className="px-2 py-1 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
