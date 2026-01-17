/**
 * Filter- und Suchleiste fuer CRM
 */

import * as React from 'react';
import { Search, Filter, X, LayoutGrid, List, Calendar, Bell } from 'lucide-react';
import { Button } from '@/components/ui';
import {
  type PipelineStage,
  type InvestorType,
  type InvestorTag,
  PIPELINE_STAGES,
  INVESTOR_TYPES,
} from '@/hooks/useInvestorCRM';
import { cn } from '@/lib/utils/cn';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStages: PipelineStage[];
  onStagesChange: (stages: PipelineStage[]) => void;
  selectedTypes: InvestorType[];
  onTypesChange: (types: InvestorType[]) => void;
  selectedPriorities: ('high' | 'medium' | 'low')[];
  onPrioritiesChange: (priorities: ('high' | 'medium' | 'low')[]) => void;
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  tags: InvestorTag[];
  viewMode: 'kanban' | 'table';
  onViewModeChange: (mode: 'kanban' | 'table') => void;
  upcomingFollowUpsCount: number;
  onShowFollowUps: () => void;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedStages,
  onStagesChange,
  selectedTypes,
  onTypesChange,
  selectedPriorities,
  onPrioritiesChange,
  selectedTagIds,
  onTagsChange,
  tags,
  viewMode,
  onViewModeChange,
  upcomingFollowUpsCount,
  onShowFollowUps,
}: FilterBarProps) {
  const [showFilters, setShowFilters] = React.useState(false);

  const hasActiveFilters =
    selectedStages.length > 0 ||
    selectedTypes.length > 0 ||
    selectedPriorities.length > 0 ||
    selectedTagIds.length > 0;

  const clearFilters = () => {
    onStagesChange([]);
    onTypesChange([]);
    onPrioritiesChange([]);
    onTagsChange([]);
  };

  const toggleStage = (stage: PipelineStage) => {
    onStagesChange(
      selectedStages.includes(stage)
        ? selectedStages.filter((s) => s !== stage)
        : [...selectedStages, stage]
    );
  };

  const toggleType = (type: InvestorType) => {
    onTypesChange(
      selectedTypes.includes(type)
        ? selectedTypes.filter((t) => t !== type)
        : [...selectedTypes, type]
    );
  };

  const togglePriority = (priority: 'high' | 'medium' | 'low') => {
    onPrioritiesChange(
      selectedPriorities.includes(priority)
        ? selectedPriorities.filter((p) => p !== priority)
        : [...selectedPriorities, priority]
    );
  };

  const toggleTag = (tagId: string) => {
    onTagsChange(
      selectedTagIds.includes(tagId)
        ? selectedTagIds.filter((id) => id !== tagId)
        : [...selectedTagIds, tagId]
    );
  };

  return (
    <div className="space-y-4">
      {/* Main Bar */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Suchen..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Filter Button */}
        <Button
          variant={hasActiveFilters ? 'primary' : 'secondary'}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filter
          {hasActiveFilters && (
            <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded text-xs">
              {selectedStages.length + selectedTypes.length + selectedPriorities.length + selectedTagIds.length}
            </span>
          )}
        </Button>

        {/* Follow-ups */}
        {upcomingFollowUpsCount > 0 && (
          <Button variant="secondary" onClick={onShowFollowUps}>
            <Bell className="w-4 h-4 mr-2" />
            {upcomingFollowUpsCount} Follow-ups
          </Button>
        )}

        {/* View Toggle */}
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => onViewModeChange('kanban')}
            className={cn(
              'px-3 py-2 transition-colors',
              viewMode === 'kanban' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-50'
            )}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => onViewModeChange('table')}
            className={cn(
              'px-3 py-2 transition-colors',
              viewMode === 'table' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-50'
            )}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
          {/* Stages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline Stage</label>
            <div className="flex flex-wrap gap-2">
              {PIPELINE_STAGES.map((stage) => (
                <button
                  key={stage.value}
                  onClick={() => toggleStage(stage.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-colors',
                    selectedStages.includes(stage.value)
                      ? 'border-current'
                      : 'border-transparent bg-white'
                  )}
                  style={
                    selectedStages.includes(stage.value)
                      ? { backgroundColor: `${stage.color}20`, color: stage.color, borderColor: stage.color }
                      : {}
                  }
                >
                  {stage.label}
                </button>
              ))}
            </div>
          </div>

          {/* Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Investoren-Typ</label>
            <div className="flex flex-wrap gap-2">
              {INVESTOR_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => toggleType(type.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    selectedTypes.includes(type.value)
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prioritaet</label>
            <div className="flex gap-2">
              {(['high', 'medium', 'low'] as const).map((priority) => (
                <button
                  key={priority}
                  onClick={() => togglePriority(priority)}
                  className={cn(
                    'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    selectedPriorities.includes(priority)
                      ? priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {priority === 'high' ? 'Hoch' : priority === 'medium' ? 'Mittel' : 'Niedrig'}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-colors',
                      selectedTagIds.includes(tag.id)
                        ? 'border-current'
                        : 'border-transparent bg-white'
                    )}
                    style={
                      selectedTagIds.includes(tag.id)
                        ? { backgroundColor: `${tag.color}20`, color: tag.color, borderColor: tag.color }
                        : {}
                    }
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Filter zuruecksetzen
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FilterBar;
