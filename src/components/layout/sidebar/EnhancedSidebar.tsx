import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FolderPlus,
  Star,
  GitCompare,
  Compass,
  Calculator,
  Map,
  FileText,
  Layers,
  Settings,
  Users,
  Database,
  BarChart3,
  Wrench,
  Rocket,
  MoreHorizontal,
  X,
  LayoutDashboard,
  CircleHelp,
  ClipboardCheck,
  Clock,
  Building2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useStore } from '@/store';
import { useVentureContext } from '@/contexts/VentureContext';
import { Button } from '@/components/ui';
import { SidebarHeader } from './SidebarHeader';
import { ProjectFolder } from './ProjectFolder';
import { AnalysisItem } from './AnalysisItem';
import { SaveAnalysisDialog } from './SaveAnalysisDialog';
import { DemoVentureBadge } from '@/components/ventures/DemoVentureBadge';

export const EnhancedSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const [openGroups, setOpenGroups] = React.useState<string[]>([]);
  const [recentsOpen, setRecentsOpen] = React.useState(false);

  const {
    sidebarOpen,
    setSidebarOpen,
    // History
    analyses,
    projects,
    activeAnalysisId,
    searchQuery,
    isHistoryLoading,
    hasUnsavedChanges: _hasUnsavedChanges,
    initializeHistory,
    setSearchQuery,
    saveCurrentAsAnalysis,
    startNewAnalysis,
    setHasUnsavedChanges,
    updateAnalysis,
    deleteAnalysis,
    duplicateAnalysis,
    toggleAnalysisFavorite,
    moveAnalysisToProject,
    createProject,
    updateProject,
    deleteProject,
    toggleProjectExpanded,
    getFilteredAnalyses,
    getUngroupedAnalyses,
    getAnalysesByProject,
    restoreAnalysisToStore,
    findAnalysisForVenture,
    loadDemoAnalysis,
    // Comparison
    isInComparison,
    toggleInComparison,
    canCompare,
    getComparisonCount,
    // Current state for saving
    selectedTier,
    wizardData,
    routeResult,
    methodResults,
    completedTasks,
    // Reset functions
    resetWizard,
    resetValuation,
  } = useStore();

  // Get ventures from context (including demo ventures)
  const {
    ventures,
    activeVenture,
    setActiveVenture,
    demoVentures,
    activeDemoVenture,
    isDemoMode,
    enterDemoMode,
    exitDemoMode,
  } = useVentureContext();

  // State for Ventures collapsed
  const [venturesOpen, setVenturesOpen] = React.useState(true);
  const [demoVenturesOpen, setDemoVenturesOpen] = React.useState(false);

  // Initialize history on mount
  React.useEffect(() => {
    initializeHistory();
  }, [initializeHistory]);

  // Only show on certain pages
  const showSidebar =
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/tier-selection') ||
    location.pathname.startsWith('/whats-next') ||
    location.pathname.startsWith('/valuation') ||
    location.pathname.startsWith('/compare') ||
    location.pathname.startsWith('/journey') ||
    location.pathname.startsWith('/about') ||
    location.pathname.startsWith('/settings') ||
    location.pathname.startsWith('/deliverables') ||
    location.pathname.startsWith('/investors') ||
    location.pathname.startsWith('/data-room') ||
    location.pathname.startsWith('/analytics') ||
    location.pathname.startsWith('/toolkit') ||
    location.pathname.startsWith('/launch') ||
    location.pathname.startsWith('/venture') ||
    location.pathname.startsWith('/ventures') ||
    location.pathname.startsWith('/reality-check');

  // Get tier display info
  const tierLabels: Record<string, { name: string; confidence: string }> = {
    minimal: { name: 'Minimal', confidence: '50-60%' },
    basic: { name: 'Basic', confidence: '60-75%' },
    detailed: { name: 'Detailed', confidence: '75-90%' },
    full: { name: 'Full', confidence: '90-95%' },
  };
  const currentTierInfo = selectedTier ? tierLabels[selectedTier] : null;

  // Check if there's any data to save
  const hasData =
    wizardData?.completedSteps?.length > 0 ||
    methodResults?.length > 0 ||
    routeResult !== null ||
    completedTasks?.length > 0;

  const handleNewAnalysisClick = () => {
    // If there's unsaved data, show the save dialog
    if (hasData && !activeAnalysisId) {
      setShowSaveDialog(true);
    } else {
      // Just start fresh
      doStartNewAnalysis();
    }
  };

  const doStartNewAnalysis = () => {
    // Reset all state
    startNewAnalysis();
    resetWizard?.();
    resetValuation?.();
    setHasUnsavedChanges(false);
    // Navigate to the start
    navigate('/dashboard');
  };

  const handleSaveAndNew = async (name: string) => {
    await saveCurrentAsAnalysis(name, null, () => ({
      tier: selectedTier || 'minimal',
      wizardData,
      routeResult,
      methodResults,
      completedTasks,
    }), activeVenture?.id || null);
    setShowSaveDialog(false);
    doStartNewAnalysis();
  };

  const handleDiscardAndNew = () => {
    setShowSaveDialog(false);
    doStartNewAnalysis();
  };

  const handleSelectAnalysis = async (id: string) => {
    // Restore analysis data into store and navigate to whats-next
    const success = await restoreAnalysisToStore(id);
    if (success) {
      navigate('/whats-next');
    }
  };

  const handleRenameAnalysis = async (id: string, newName: string) => {
    await updateAnalysis(id, { name: newName });
  };

  const handleCreateProject = async () => {
    const count = projects.length + 1;
    await createProject(`Projekt ${count}`);
  };

  const filteredAnalyses = searchQuery ? getFilteredAnalyses() : analyses;
  const ungroupedAnalyses = searchQuery
    ? filteredAnalyses.filter((a) => a.projectId === null)
    : getUngroupedAnalyses();
  const favoriteAnalyses = filteredAnalyses.filter((a) => a.isFavorite);

  // Navigation groups for categorized sidebar
  // Flow: Venture → Datenlevel → Was jetzt → Founders Journey
  const navigationGroups = [
    {
      id: 'start',
      label: 'START',
      icon: Compass,
      items: [
        { label: 'Meine Ventures', href: '/ventures', icon: Building2 },
        { label: 'Daten-Level', href: '/tier-selection', icon: Layers },
        { label: 'Was jetzt?', href: '/whats-next', icon: CircleHelp },
        { label: 'Founders Journey', href: '/journey', icon: Rocket },
        { label: 'Reality Check', href: '/reality-check', icon: ShieldAlert },
      ],
    },
    {
      id: 'build',
      label: 'BUILD',
      icon: Wrench,
      items: [
        { label: "Builder's Toolkit", href: '/toolkit', icon: Wrench },
        { label: 'Launch Checklist', href: '/launch/checklist', icon: ClipboardCheck },
      ],
    },
    {
      id: 'validate',
      label: 'VALIDATE',
      icon: Calculator,
      items: [
        { label: 'Bewertung', href: '/valuation', icon: Calculator },
        { label: 'Szenario-Vergleich', href: '/compare', icon: GitCompare },
        { label: 'Methodik', href: '/about/methodology', icon: Map },
      ],
    },
    {
      id: 'fundraise',
      label: 'FUNDRAISE',
      icon: Users,
      items: [
        { label: 'Investoren', href: '/investors', icon: Users },
        { label: 'Data Room', href: '/data-room', icon: Database },
        { label: 'Dokumente', href: '/deliverables', icon: FileText },
      ],
    },
    {
      id: 'insights',
      label: 'INSIGHTS',
      icon: BarChart3,
      items: [
        { label: 'Analytics', href: '/analytics', icon: BarChart3 },
      ],
    },
  ];

  // Toggle group open/closed
  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  // Check if a path is active
  const isActivePath = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + '/');

  // Auto-open group when active page is inside it
  React.useEffect(() => {
    navigationGroups.forEach((group) => {
      if (group.items.some((item) => isActivePath(item.href))) {
        if (!openGroups.includes(group.id)) {
          setOpenGroups((prev) => [...prev, group.id]);
        }
      }
    });
  }, [location.pathname]);

  // All navigation items for mobile "more" menu
  const allNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ...navigationGroups.flatMap((g) =>
      g.items.map((item) => ({ name: item.label, href: item.href, icon: item.icon }))
    ),
  ];

  // Mobile bottom nav: most important items for quick access
  const mobileNavItems = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Journey', href: '/journey', icon: Rocket },
    { name: 'Toolkit', href: '/toolkit', icon: Wrench },
    { name: 'Investoren', href: '/investors', icon: Users },
  ];

  if (!showSidebar) return null;

  return (
    <>
      {/* Save Dialog */}
      <SaveAnalysisDialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSaveAndNew}
        onDiscard={handleDiscardAndNew}
      />

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 300 : 72 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'hidden md:flex flex-col fixed left-0 top-20 bottom-0 z-30',
          'bg-cream border-r border-purple-100'
        )}
      >
        {/* Collapse Toggle Button - positioned on sidebar border */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={cn(
            'absolute -right-5 top-4 z-50',
            'w-10 h-10 rounded-full flex items-center justify-center',
            'bg-gradient-to-r from-purple-600 to-pink-600',
            'hover:shadow-lg hover:shadow-purple-500/30 transition-all',
            'active:scale-95',
            'border-2 border-cream'
          )}
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-4 h-4 text-white" />
          ) : (
            <ChevronRight className="w-4 h-4 text-white" />
          )}
        </button>

        {/* Header */}
        <SidebarHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewAnalysis={handleNewAnalysisClick}
          isCollapsed={!sidebarOpen}
        />

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECTION 1: NAVIGATION (nicht scrollbar, oben)               */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="border-b border-purple-100">
          {/* Active Venture & Tier Status Display */}
          <div className="px-3 py-3 space-y-2">
            {/* Active Venture Display */}
            {activeVenture && sidebarOpen && (
              <button
                onClick={() => navigate('/venture/data-input')}
                className={cn(
                  'w-full flex items-center gap-3 p-2 rounded-xl transition-all',
                  'bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200',
                  'hover:border-purple-300 hover:shadow-sm'
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-[10px] text-purple-600 font-medium uppercase tracking-wide">Aktives Venture</p>
                  <p className="text-sm font-semibold text-charcoal truncate">{activeVenture.name}</p>
                  {activeVenture.industry && (
                    <p className="text-[10px] text-charcoal/50 truncate">{activeVenture.industry}</p>
                  )}
                </div>
              </button>
            )}
            {/* Collapsed Active Venture Icon */}
            {activeVenture && !sidebarOpen && (
              <button
                onClick={() => navigate('/venture/data-input')}
                className={cn(
                  'w-full flex items-center justify-center p-2 rounded-xl transition-all',
                  'bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200',
                  'hover:border-purple-300 hover:shadow-sm'
                )}
                title={activeVenture.name}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
              </button>
            )}

            {/* Tier Status Display */}
            {currentTierInfo && (
              <button
                onClick={() => navigate('/tier-selection')}
                className={cn(
                  'w-full flex items-center gap-3 p-2 rounded-xl transition-all',
                  'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100',
                  'hover:border-purple-200 hover:shadow-sm'
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Layers className="w-4 h-4 text-white" />
                </div>
                {sidebarOpen && (
                  <div className="flex-1 text-left">
                    <p className="text-xs text-purple-600 font-medium">
                      {activeVenture ? `Daten-Level für ${activeVenture.name}` : 'Daten-Level'}
                    </p>
                    <p className="text-sm font-semibold text-charcoal">{currentTierInfo.name}</p>
                    <p className="text-[10px] text-charcoal/50">Confidence: {currentTierInfo.confidence}</p>
                  </div>
                )}
                {sidebarOpen && (
                  <Settings className="w-4 h-4 text-purple-400" />
                )}
              </button>
            )}

            {/* No Venture Selected Hint */}
            {!activeVenture && sidebarOpen && (
              <button
                onClick={() => navigate('/venture/create')}
                className={cn(
                  'w-full flex items-center gap-3 p-2 rounded-xl transition-all',
                  'bg-gray-50 border border-dashed border-gray-200',
                  'hover:border-purple-300 hover:bg-purple-50/50'
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 border-2 border-dashed border-gray-300">
                  <Building2 className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-xs text-gray-500 font-medium">Kein Venture</p>
                  <p className="text-sm font-medium text-purple-600">Venture erstellen</p>
                </div>
              </button>
            )}
          </div>

          {/* Dashboard Link */}
          <button
            onClick={() => navigate('/dashboard')}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-2.5 transition-colors',
              isActivePath('/dashboard')
                ? 'text-purple-600 bg-purple-50'
                : 'text-charcoal/70 hover:bg-purple-50'
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  Dashboard
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Category Groups */}
          <div className="py-1">
            {navigationGroups.map((group) => {
              const isGroupOpen = openGroups.includes(group.id);
              const GroupIcon = group.icon;
              const hasActiveItem = group.items.some((item) => isActivePath(item.href));

              return (
                <div key={group.id}>
                  {/* Category Header */}
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-2 transition-colors',
                      hasActiveItem ? 'text-purple-600' : 'text-charcoal/50 hover:text-charcoal/70'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <GroupIcon className="w-4 h-4" />
                      <AnimatePresence>
                        {sidebarOpen && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                          >
                            {group.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    {sidebarOpen && (
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 transition-transform',
                          isGroupOpen ? 'rotate-0' : '-rotate-90'
                        )}
                      />
                    )}
                  </button>

                  {/* Category Items */}
                  <AnimatePresence>
                    {isGroupOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        <div className={cn('space-y-0.5', sidebarOpen ? 'ml-4' : '')}>
                          {group.items.map((item) => {
                            const ItemIcon = item.icon;
                            const isActive = isActivePath(item.href);

                            return (
                              <button
                                key={item.href}
                                onClick={() => navigate(item.href)}
                                className={cn(
                                  'w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                                  isActive
                                    ? 'bg-purple-100 text-purple-700 font-medium'
                                    : 'text-charcoal/60 hover:bg-purple-50 hover:text-charcoal'
                                )}
                              >
                                <ItemIcon className="w-4 h-4" />
                                <AnimatePresence>
                                  {sidebarOpen && (
                                    <motion.span
                                      initial={{ opacity: 0, width: 0 }}
                                      animate={{ opacity: 1, width: 'auto' }}
                                      exit={{ opacity: 0, width: 0 }}
                                      className="text-sm whitespace-nowrap"
                                    >
                                      {item.label}
                                    </motion.span>
                                  )}
                                </AnimatePresence>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECTION 2: ORDNER & RECENTS (scrollbar, unten)             */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="flex-1 overflow-y-auto scrollbar-hide relative">
          {isHistoryLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="py-2">
              {/* Comparison Button */}
              {canCompare() && (
                <div className="px-3 mb-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/compare')}
                    className="w-full"
                  >
                    <GitCompare className="w-4 h-4 mr-2" />
                    {sidebarOpen ? `${getComparisonCount()} vergleichen` : getComparisonCount()}
                  </Button>
                </div>
              )}

              {/* Favorites */}
              {favoriteAnalyses.length > 0 && (
                <div className="mb-4">
                  <div className="px-3 py-2 flex items-center gap-2">
                    <Star className="w-4 h-4 text-pink-500" />
                    {sidebarOpen && (
                      <span className="text-xs font-medium text-charcoal/60 uppercase tracking-wider">
                        Favoriten
                      </span>
                    )}
                  </div>
                  <div className="px-2 space-y-1">
                    {favoriteAnalyses.map((analysis) => (
                      <AnalysisItem
                        key={analysis.id}
                        analysis={analysis}
                        isActive={analysis.id === activeAnalysisId}
                        isInComparison={isInComparison(analysis.id)}
                        isCollapsed={!sidebarOpen}
                        onSelect={() => handleSelectAnalysis(analysis.id)}
                        onToggleFavorite={() => toggleAnalysisFavorite(analysis.id)}
                        onDelete={() => deleteAnalysis(analysis.id)}
                        onDuplicate={() => duplicateAnalysis(analysis.id)}
                        onRename={(name) => handleRenameAnalysis(analysis.id, name)}
                        onToggleComparison={() => toggleInComparison(analysis.id)}
                        onMoveToProject={(projectId) =>
                          moveAnalysisToProject(analysis.id, projectId)
                        }
                        projects={projects.map((p) => ({
                          id: p.id,
                          name: p.name,
                          color: p.color,
                        }))}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {projects.map((project) => {
                const projectAnalyses = searchQuery
                  ? filteredAnalyses.filter((a) => a.projectId === project.id)
                  : getAnalysesByProject(project.id);

                // Skip empty projects when searching
                if (searchQuery && projectAnalyses.length === 0) return null;

                return (
                  <ProjectFolder
                    key={project.id}
                    project={project}
                    analyses={projectAnalyses}
                    activeAnalysisId={activeAnalysisId}
                    isCollapsed={!sidebarOpen}
                    onToggleExpanded={() => toggleProjectExpanded(project.id)}
                    onUpdateProject={(updates) => updateProject(project.id, updates)}
                    onDeleteProject={() => deleteProject(project.id)}
                    onSelectAnalysis={handleSelectAnalysis}
                    onToggleAnalysisFavorite={toggleAnalysisFavorite}
                    onDeleteAnalysis={deleteAnalysis}
                    onDuplicateAnalysis={duplicateAnalysis}
                    onRenameAnalysis={handleRenameAnalysis}
                    onToggleComparison={toggleInComparison}
                    onMoveAnalysis={moveAnalysisToProject}
                    isInComparison={isInComparison}
                    allProjects={projects}
                  />
                );
              })}

              {/* Create Project Button */}
              {sidebarOpen && (
                <div className="px-3 mt-4">
                  <button
                    onClick={handleCreateProject}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-charcoal/60 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <FolderPlus className="w-4 h-4" />
                    Neuer Ordner
                  </button>
                </div>
              )}

              {/* Ventures - Collapsible */}
              {ventures.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => setVenturesOpen(!venturesOpen)}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-purple-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-500" />
                      {sidebarOpen && (
                        <span className="text-xs font-medium text-charcoal/60 uppercase tracking-wider">
                          Ventures
                        </span>
                      )}
                    </div>
                    {sidebarOpen && (
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 text-charcoal/40 transition-transform',
                          venturesOpen ? 'rotate-0' : '-rotate-90'
                        )}
                      />
                    )}
                  </button>
                  <AnimatePresence>
                    {venturesOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-visible"
                      >
                        <div className="px-2 space-y-1 pb-2">
                          {ventures.map((venture) => {
                            // Find analysis for this venture
                            const ventureAnalysis = findAnalysisForVenture(venture.id);
                            const hasCompletedAnalysis = ventureAnalysis && ventureAnalysis.routeResult;
                            const isOnComparePage = location.pathname === '/compare';

                            return (
                            <button
                              key={venture.id}
                              onClick={async () => {
                                // On compare page: toggle comparison selection instead of navigation
                                if (isOnComparePage && hasCompletedAnalysis) {
                                  toggleInComparison(ventureAnalysis.id);
                                  return;
                                }

                                await setActiveVenture(venture.id);
                                // Check if there's an existing analysis for this venture
                                const existingAnalysis = findAnalysisForVenture(venture.id);
                                if (existingAnalysis) {
                                  // Restore the analysis and go to whats-next
                                  const success = await restoreAnalysisToStore(existingAnalysis.id);
                                  if (success) {
                                    navigate('/whats-next');
                                    return;
                                  }
                                }
                                // No existing analysis - go to data input
                                navigate('/venture/data-input');
                              }}
                              className={cn(
                                'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left',
                                // On compare page: highlight if selected for comparison
                                isOnComparePage && hasCompletedAnalysis && isInComparison(ventureAnalysis.id)
                                  ? 'bg-navy/10 text-navy ring-2 ring-navy/30'
                                  : activeVenture?.id === venture.id
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'text-charcoal/70 hover:bg-purple-50',
                                // Show as disabled if on compare page but no completed analysis
                                isOnComparePage && !hasCompletedAnalysis && 'opacity-50 cursor-not-allowed'
                              )}
                              disabled={isOnComparePage && !hasCompletedAnalysis}
                              title={isOnComparePage && !hasCompletedAnalysis ? 'Keine abgeschlossene Analyse vorhanden' : undefined}
                            >
                              <div className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                                isOnComparePage && hasCompletedAnalysis && isInComparison(ventureAnalysis.id)
                                  ? 'bg-navy/20'
                                  : activeVenture?.id === venture.id
                                  ? 'bg-purple-200'
                                  : 'bg-gray-100'
                              )}>
                                <Building2 className="w-4 h-4" />
                              </div>
                              {sidebarOpen && (
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {venture.name}
                                  </p>
                                  <p className="text-xs text-charcoal/50 truncate">
                                    {venture.industry || 'Keine Branche'}
                                  </p>
                                </div>
                              )}
                              {/* Show comparison checkmark on compare page */}
                              {sidebarOpen && isOnComparePage && hasCompletedAnalysis && isInComparison(ventureAnalysis.id) && (
                                <span className="px-1.5 py-0.5 text-[10px] bg-navy text-white rounded-full">
                                  ✓
                                </span>
                              )}
                              {/* Show active badge when not on compare page */}
                              {sidebarOpen && !isOnComparePage && activeVenture?.id === venture.id && (
                                <span className="px-1.5 py-0.5 text-[10px] bg-green-100 text-green-700 rounded-full">
                                  Aktiv
                                </span>
                              )}
                              {/* Show warning if on compare page but no analysis */}
                              {sidebarOpen && isOnComparePage && !hasCompletedAnalysis && (
                                <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-500 rounded-full">
                                  Keine Analyse
                                </span>
                              )}
                            </button>
                          );
                          })}
                          {/* Button to create new venture */}
                          <button
                            onClick={() => navigate('/venture/create')}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-charcoal/50 hover:bg-purple-50 hover:text-purple-600 transition-all"
                          >
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200">
                              <span className="text-lg">+</span>
                            </div>
                            {sidebarOpen && (
                              <span className="text-sm">Neues Venture</span>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Demo Ventures - Collapsible */}
              {demoVentures.length > 0 && (
                <div className="mt-4 pt-4 border-t border-amber-100/50">
                  <button
                    onClick={() => setDemoVenturesOpen(!demoVenturesOpen)}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-amber-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      {sidebarOpen && (
                        <span className="text-xs font-medium text-charcoal/60 uppercase tracking-wider">
                          Demo Ventures
                        </span>
                      )}
                    </div>
                    {sidebarOpen && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">
                          {demoVentures.length}
                        </span>
                        <ChevronDown
                          className={cn(
                            'w-4 h-4 text-charcoal/40 transition-transform',
                            demoVenturesOpen ? 'rotate-0' : '-rotate-90'
                          )}
                        />
                      </div>
                    )}
                  </button>
                  <AnimatePresence>
                    {demoVenturesOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-visible"
                      >
                        <div className="px-2 space-y-1 pb-2">
                          {/* Demo Mode Exit Hint */}
                          {isDemoMode && sidebarOpen && (
                            <div className="mx-1 mb-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                              <p className="text-xs text-amber-700">
                                Demo-Modus aktiv. Änderungen werden nicht gespeichert.
                              </p>
                              <button
                                onClick={exitDemoMode}
                                className="text-xs text-amber-600 hover:text-amber-800 font-medium mt-1"
                              >
                                Demo beenden →
                              </button>
                            </div>
                          )}
                          {demoVentures.map((venture) => (
                            <button
                              key={venture.id}
                              onClick={async () => {
                                enterDemoMode(venture.id);
                                // Load the demo analysis (creates/links if needed)
                                const success = await loadDemoAnalysis(venture.id);
                                if (success) {
                                  navigate('/whats-next');
                                } else {
                                  // Fallback: just navigate to whats-next
                                  navigate('/whats-next');
                                }
                              }}
                              className={cn(
                                'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left',
                                activeDemoVenture?.id === venture.id
                                  ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300'
                                  : 'text-charcoal/70 hover:bg-amber-50'
                              )}
                            >
                              <div className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                                activeDemoVenture?.id === venture.id
                                  ? 'bg-amber-200'
                                  : 'bg-amber-50'
                              )}>
                                <Sparkles className="w-4 h-4 text-amber-600" />
                              </div>
                              {sidebarOpen && (
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium truncate">
                                      {venture.name}
                                    </p>
                                    <DemoVentureBadge size="small" />
                                  </div>
                                  <p className="text-xs text-charcoal/50 truncate">
                                    {venture.demoDescription}
                                  </p>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Recents - Collapsible */}
              {ungroupedAnalyses.filter((a) => !a.isFavorite).length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => setRecentsOpen(!recentsOpen)}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-purple-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-charcoal/50" />
                      {sidebarOpen && (
                        <span className="text-xs font-medium text-charcoal/60 uppercase tracking-wider">
                          Recents
                        </span>
                      )}
                    </div>
                    {sidebarOpen && (
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 text-charcoal/40 transition-transform',
                          recentsOpen ? 'rotate-0' : '-rotate-90'
                        )}
                      />
                    )}
                  </button>
                  <AnimatePresence>
                    {recentsOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-visible"
                      >
                        <div className="px-2 space-y-1 pb-4">
                          {ungroupedAnalyses
                            .filter((a) => !a.isFavorite)
                            .map((analysis) => (
                              <AnalysisItem
                                key={analysis.id}
                                analysis={analysis}
                                isActive={analysis.id === activeAnalysisId}
                                isInComparison={isInComparison(analysis.id)}
                                isCollapsed={!sidebarOpen}
                                onSelect={() => handleSelectAnalysis(analysis.id)}
                                onToggleFavorite={() => toggleAnalysisFavorite(analysis.id)}
                                onDelete={() => deleteAnalysis(analysis.id)}
                                onDuplicate={() => duplicateAnalysis(analysis.id)}
                                onRename={(name) => handleRenameAnalysis(analysis.id, name)}
                                onToggleComparison={() => toggleInComparison(analysis.id)}
                                onMoveToProject={(projectId) =>
                                  moveAnalysisToProject(analysis.id, projectId)
                                }
                                projects={projects.map((p) => ({
                                  id: p.id,
                                  name: p.name,
                                  color: p.color,
                                }))}
                              />
                            ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </div>

      </motion.aside>

      {/* Mobile Bottom Nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-purple-100"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
      >
        <div className="flex items-center justify-around max-w-md mx-auto px-1 pt-2 pb-1">
          {/* Show most important mobile nav items */}
          {mobileNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-0 flex-1',
                  isActive
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-charcoal/60 active:bg-purple-50'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-[10px] font-medium truncate">{item.name}</span>
              </button>
            );
          })}

          {/* More Menu Button */}
          <button
            onClick={() => setShowMobileMenu(true)}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all flex-1',
              showMobileMenu ? 'text-purple-600 bg-purple-50' : 'text-charcoal/60 active:bg-purple-50'
            )}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium">Mehr</span>
          </button>
        </div>
      </nav>

      {/* Mobile More Menu Overlay */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMenu(false)}
              className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl"
              style={{ maxHeight: '75vh' }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-charcoal">Alle Funktionen</h3>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 -mr-2 hover:bg-gray-100 rounded-xl transition-colors active:bg-gray-200"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* All Navigation Items */}
              <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: 'calc(75vh - 100px)' }}>
                <div className="grid grid-cols-3 gap-3 p-4">
                  {allNavItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.href}
                        onClick={() => {
                          navigate(item.href);
                          setShowMobileMenu(false);
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all min-h-[80px]',
                          isActive
                            ? 'bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700 shadow-sm'
                            : 'bg-gray-50 text-gray-600 active:bg-purple-50'
                        )}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-[11px] font-medium text-center leading-tight line-clamp-2">
                          {item.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Safe area padding for iPhone */}
              <div
                className="bg-white"
                style={{ height: 'max(env(safe-area-inset-bottom, 0px), 12px)' }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
