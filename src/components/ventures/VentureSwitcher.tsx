/**
 * LaunchOS Venture Switcher
 * Dropdown zum Wechseln zwischen Ventures
 */

import { useState } from 'react';
import { useOptionalVentureContext } from '@/contexts/VentureContext';
import {
  ChevronDown, Plus, Rocket, Check, Settings,
  Building2, Briefcase, Lightbulb
} from 'lucide-react';

interface VentureSwitcherProps {
  onCreateNew?: () => void;
  onManage?: (ventureId: string) => void;
}

const STAGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'idea': Lightbulb,
  'pre-seed': Rocket,
  'seed': Building2,
  'series-a': Briefcase,
  'series-b': Briefcase,
  'growth': Briefcase,
};

export function VentureSwitcher({ onCreateNew, onManage }: VentureSwitcherProps) {
  const ventureContext = useOptionalVentureContext();
  const [isOpen, setIsOpen] = useState(false);

  // Graceful handling wenn kein Context verfügbar
  if (!ventureContext) {
    return null;
  }

  const { ventures, activeVenture, setActiveVenture, isLoading } = ventureContext;

  if (isLoading) {
    return (
      <div className="h-10 w-48 bg-purple-100 animate-pulse rounded-lg" />
    );
  }

  if (ventures.length === 0) {
    return (
      <button
        onClick={onCreateNew}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:shadow-lg transition-all"
      >
        <Plus className="w-4 h-4 text-white" />
        <span className="text-white font-medium text-sm whitespace-nowrap">Venture anlegen</span>
      </button>
    );
  }

  const StageIcon = activeVenture?.stage
    ? STAGE_ICONS[activeVenture.stage] || Rocket
    : Rocket;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-white border border-purple-200 rounded-lg hover:border-purple-400 transition-all min-w-[200px]"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: activeVenture?.branding?.primary_color || '#9333ea',
          }}
        >
          <StageIcon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-medium text-gray-900 truncate max-w-[120px]">
            {activeVenture?.name || 'Venture wählen'}
          </p>
          <p className="text-xs text-gray-500 capitalize">
            {activeVenture?.stage?.replace('-', ' ') || 'Kein Stage'}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-purple-200 rounded-xl shadow-xl z-50 overflow-hidden">
            {/* Ventures List */}
            <div className="max-h-64 overflow-y-auto">
              {ventures.map((venture) => {
                const VentureIcon = venture.stage
                  ? STAGE_ICONS[venture.stage] || Rocket
                  : Rocket;
                const isActive = venture.id === activeVenture?.id;

                return (
                  <div
                    key={venture.id}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors ${
                      isActive ? 'bg-purple-50' : ''
                    }`}
                  >
                    <button
                      onClick={() => {
                        setActiveVenture(venture.id);
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-3 flex-1"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: venture.branding?.primary_color || '#9333ea',
                        }}
                      >
                        <VentureIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">{venture.name}</p>
                        <p className="text-xs text-gray-500">
                          {venture.industry || 'Keine Branche'} • {venture.stage?.replace('-', ' ') || 'Kein Stage'}
                        </p>
                      </div>
                      {isActive && (
                        <Check className="w-4 h-4 text-purple-500" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onManage?.(venture.id);
                        setIsOpen(false);
                      }}
                      className="p-1.5 hover:bg-purple-100 rounded-lg"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Create New */}
            <div className="border-t border-purple-100 p-2">
              <button
                onClick={() => {
                  onCreateNew?.();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-purple-500" />
                </div>
                <span className="font-medium text-purple-600">Neues Venture anlegen</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default VentureSwitcher;
