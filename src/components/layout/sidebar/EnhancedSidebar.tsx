import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  Star,
  GitCompare,
  Compass,
  Calculator,
  Map,
  FileText,
  Layers,
  Settings,
  FolderOpen,
  Users,
  Database,
  BarChart3,
  Wrench,
  Rocket,
  MoreHorizontal,
  X,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useStore } from '@/store';
import { Button } from '@/components/ui';
import { SidebarHeader } from './SidebarHeader';
import { ProjectFolder } from './ProjectFolder';
import { AnalysisItem } from './AnalysisItem';
import { SaveAnalysisDialog } from './SaveAnalysisDialog';

export const EnhancedSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

  const {
    sidebarOpen,
    setSidebarOpen,
    // History
    analyses,
    projects,
    activeAnalysisId,
    searchQuery,
    isHistoryLoading,
    hasUnsavedChanges,
    initializeHistory,
    setSearchQuery,
    saveCurrentAsAnalysis,
    setActiveAnalysis,
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
    location.pathname.startsWith('/launch');

  if (!showSidebar) return null;

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
    }));
    setShowSaveDialog(false);
    doStartNewAnalysis();
  };

  const handleDiscardAndNew = () => {
    setShowSaveDialog(false);
    doStartNewAnalysis();
  };

  const handleSelectAnalysis = (id: string) => {
    setActiveAnalysis(id);
    // TODO: Load analysis data into store
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

  // All navigation items for desktop sidebar
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Founders Journey', href: '/journey', icon: Map },
    { name: 'Bewertung', href: '/valuation', icon: Calculator },
    { name: "Builder's Toolkit", href: '/toolkit', icon: Wrench },
    { name: 'Was tun?', href: '/whats-next', icon: Compass },
    { name: 'Investoren', href: '/investors', icon: Users },
    { name: 'Data Room', href: '/data-room', icon: Database },
    { name: 'Dokumente', href: '/deliverables', icon: FolderOpen },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Vergleich', href: '/compare', icon: GitCompare },
    { name: 'Daten-Level', href: '/tier-selection', icon: Layers },
    { name: 'Launch Checklist', href: '/launch/checklist', icon: Rocket },
  ];

  // Mobile bottom nav: most important items for quick access
  const mobileNavItems = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Journey', href: '/journey', icon: Map },
    { name: 'Toolkit', href: '/toolkit', icon: Wrench },
    { name: 'Bewertung', href: '/valuation', icon: Calculator },
  ];

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
        {/* Collapse Toggle Button at Top */}
        <div className="px-3 pt-4 pb-2 flex justify-end">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              'w-11 h-11 rounded-full flex items-center justify-center',
              'bg-gradient-to-r from-purple-600 to-pink-600',
              'hover:shadow-lg hover:shadow-purple-500/30 transition-all',
              'active:scale-95'
            )}
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-4 h-4 text-white" />
            ) : (
              <ChevronRight className="w-4 h-4 text-white" />
            )}
          </button>
        </div>

        {/* Header */}
        <SidebarHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewAnalysis={handleNewAnalysisClick}
          isCollapsed={!sidebarOpen}
        />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
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

              {/* Ungrouped Analyses */}
              {ungroupedAnalyses.length > 0 && (
                <div className="mt-4">
                  {sidebarOpen && (
                    <div className="px-3 py-2">
                      <span className="text-xs font-medium text-charcoal/60 uppercase tracking-wider">
                        Recents
                      </span>
                    </div>
                  )}
                  <div className="px-2 space-y-1">
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
                </div>
              )}

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
            </div>
          )}
        </div>

        {/* Tier Status Display */}
        {currentTierInfo && (
          <div className="border-t border-purple-100 px-3 py-3">
            <button
              onClick={() => navigate('/tier-selection')}
              className={cn(
                'w-full flex items-center gap-3 p-2 rounded-xl transition-all',
                'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100',
                'hover:border-purple-200 hover:shadow-sm'
              )}
            >
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Layers className="w-4 h-4 text-white" />
              </div>
              {sidebarOpen && (
                <div className="flex-1 text-left">
                  <p className="text-xs text-purple-600 font-medium">Daten-Level</p>
                  <p className="text-sm font-semibold text-charcoal">{currentTierInfo.name}</p>
                  <p className="text-[10px] text-charcoal/50">Confidence: {currentTierInfo.confidence}</p>
                </div>
              )}
              {sidebarOpen && (
                <Settings className="w-4 h-4 text-purple-400" />
              )}
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="border-t border-purple-100 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2 transition-colors',
                  isActive ? 'text-purple-600 bg-purple-50' : 'text-charcoal/60 hover:bg-purple-50'
                )}
              >
                <Icon className="w-5 h-5" />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
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
                  {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.name}
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
