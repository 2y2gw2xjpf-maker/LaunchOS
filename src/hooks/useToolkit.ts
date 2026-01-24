// src/hooks/useToolkit.ts

import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/components/auth';
import { useOptionalVentureContext } from '@/contexts/VentureContext';

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

export interface ToolkitCategory {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
}

export interface ToolkitGuide {
  id: string;
  categoryId?: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  coverImage?: string;
  contentMd: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: string;
  tools?: string[];
  tags?: string[];
  authorName: string;
  authorAvatar?: string;
  viewCount: number;
  helpfulCount: number;
  isFeatured: boolean;
  publishedAt: Date;
}

export interface ToolkitChecklist {
  id: string;
  categoryId?: string;
  slug: string;
  title: string;
  description?: string;
  icon?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: string;
  tags?: string[];
  isFeatured: boolean;
  items?: ToolkitChecklistItem[];
}

export interface ToolkitChecklistItem {
  id: string;
  checklistId: string;
  title: string;
  description?: string;
  helpText?: string;
  helpLink?: string;
  section?: string;
  sortOrder: number;
  isCritical: boolean;
  isCompleted?: boolean;
  completedAt?: Date;
  notes?: string;
}

export interface ToolkitPrompt {
  id: string;
  categoryId?: string;
  slug: string;
  title: string;
  description?: string;
  useCase?: string;
  promptTemplate: string;
  variables?: PromptVariable[];
  exampleOutput?: string;
  targetTool?: string;
  tags?: string[];
  copyCount: number;
  helpfulCount: number;
  isFeatured: boolean;
}

export interface PromptVariable {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export interface ToolkitTool {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  description?: string;
  websiteUrl?: string;
  docsUrl?: string;
  pricingUrl?: string;
  ratings: {
    ui: number;
    backend: number;
    database: number;
    deployment: number;
    learningCurve: number;
  };
  strengths?: string[];
  weaknesses?: string[];
  bestFor?: string[];
  notFor?: string[];
  pricingModel?: string;
  pricingDetails?: string;
  techStack?: string[];
  integrations?: string[];
  proTips?: string[];
  commonMistakes?: string[];
  logoUrl?: string;
  color?: string;
  isFeatured: boolean;
}

export interface ToolkitPitfall {
  id: string;
  category: string;
  title: string;
  description: string;
  whyBad?: string;
  solution?: string;
  affectedTools?: string[];
  severity: 'info' | 'warning' | 'critical';
  relatedGuideId?: string;
  externalLink?: string;
  icon?: string;
}

export interface ChecklistProgress {
  total: number;
  completed: number;
  percentage: number;
  criticalTotal: number;
  criticalCompleted: number;
  allCriticalDone: boolean;
}

// ══════════════════════════════════════════════════════════════
// HOOK
// ══════════════════════════════════════════════════════════════

interface UseToolkitReturn {
  // Data
  categories: ToolkitCategory[];
  guides: ToolkitGuide[];
  checklists: ToolkitChecklist[];
  prompts: ToolkitPrompt[];
  tools: ToolkitTool[];
  pitfalls: ToolkitPitfall[];
  bookmarks: { type: string; id: string }[];

  // Loading
  isLoading: boolean;
  error: string | null;

  // Guides
  getGuide: (slug: string) => Promise<ToolkitGuide | null>;
  getGuidesByCategory: (categorySlug: string) => ToolkitGuide[];
  getGuidesByTool: (toolSlug: string) => ToolkitGuide[];
  getFeaturedGuides: () => ToolkitGuide[];
  incrementGuideView: (guideId: string) => Promise<void>;
  markGuideHelpful: (guideId: string) => Promise<void>;

  // Checklists
  getChecklist: (slug: string) => Promise<ToolkitChecklist | null>;
  getChecklistWithItems: (slug: string) => Promise<ToolkitChecklist | null>;
  getChecklistProgress: (checklistId: string) => Promise<ChecklistProgress | null>;
  toggleChecklistItem: (checklistId: string, itemId: string, completed: boolean, notes?: string) => Promise<boolean>;

  // Prompts
  getPrompt: (slug: string) => Promise<ToolkitPrompt | null>;
  getPromptsByTool: (toolSlug: string) => ToolkitPrompt[];
  getFeaturedPrompts: () => ToolkitPrompt[];
  incrementPromptCopy: (promptId: string) => Promise<void>;
  fillPromptTemplate: (template: string, variables: Record<string, string>) => string;

  // Tools
  getTool: (slug: string) => ToolkitTool | undefined;
  compareTwoTools: (slug1: string, slug2: string) => { tool1: ToolkitTool; tool2: ToolkitTool } | null;

  // Pitfalls
  getPitfallsByCategory: (category: string) => ToolkitPitfall[];
  getPitfallsByTool: (toolSlug: string) => ToolkitPitfall[];
  getCriticalPitfalls: () => ToolkitPitfall[];

  // Bookmarks
  isBookmarked: (type: string, id: string) => boolean;
  toggleBookmark: (type: string, id: string) => Promise<boolean>;

  // Search
  search: (query: string) => {
    guides: ToolkitGuide[];
    checklists: ToolkitChecklist[];
    prompts: ToolkitPrompt[];
    tools: ToolkitTool[];
  };

  // Refresh
  refresh: () => Promise<void>;
}

export function useToolkit(): UseToolkitReturn {
  const { user } = useAuth();
  const ventureContext = useOptionalVentureContext();
  const activeVenture = ventureContext?.activeVenture;

  const [categories, setCategories] = useState<ToolkitCategory[]>([]);
  const [guides, setGuides] = useState<ToolkitGuide[]>([]);
  const [checklists, setChecklists] = useState<ToolkitChecklist[]>([]);
  const [prompts, setPrompts] = useState<ToolkitPrompt[]>([]);
  const [tools, setTools] = useState<ToolkitTool[]>([]);
  const [pitfalls, setPitfalls] = useState<ToolkitPitfall[]>([]);
  const [bookmarks, setBookmarks] = useState<{ type: string; id: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track if initial load has been done to prevent re-fetching
  const hasLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);

  // ════════════════════════════════════════════════════════════
  // DATA LOADING
  // ════════════════════════════════════════════════════════════

  const loadCategories = useCallback(async () => {
    console.log('[useToolkit] Loading categories...');
    const { data, error } = await supabase
      .from('toolkit_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    console.log('[useToolkit] Categories result:', { count: data?.length, error });
    if (error) throw error;

    setCategories((data || []).map(c => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      icon: c.icon,
      color: c.color,
      sortOrder: c.sort_order,
    })));
  }, []);

  const loadGuides = useCallback(async () => {
    console.log('[useToolkit] Loading guides...');
    const { data, error } = await supabase
      .from('toolkit_guides')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    console.log('[useToolkit] Guides result:', { count: data?.length, error });
    if (error) throw error;

    setGuides((data || []).map(g => ({
      id: g.id,
      categoryId: g.category_id,
      slug: g.slug,
      title: g.title,
      subtitle: g.subtitle,
      description: g.description,
      coverImage: g.cover_image,
      contentMd: g.content_md,
      difficulty: g.difficulty,
      estimatedTime: g.estimated_time,
      tools: g.tools,
      tags: g.tags,
      authorName: g.author_name,
      authorAvatar: g.author_avatar,
      viewCount: g.view_count,
      helpfulCount: g.helpful_count,
      isFeatured: g.is_featured,
      publishedAt: new Date(g.published_at),
    })));
  }, []);

  const loadChecklists = useCallback(async () => {
    console.log('[useToolkit] Loading checklists...');
    const { data, error } = await supabase
      .from('toolkit_checklists')
      .select('*')
      .eq('is_published', true)
      .order('sort_order');

    console.log('[useToolkit] Checklists result:', { count: data?.length, error });
    if (error) throw error;

    setChecklists((data || []).map(c => ({
      id: c.id,
      categoryId: c.category_id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      icon: c.icon,
      difficulty: c.difficulty,
      estimatedTime: c.estimated_time,
      tags: c.tags,
      isFeatured: c.is_featured,
    })));
  }, []);

  const loadPrompts = useCallback(async () => {
    console.log('[useToolkit] Loading prompts...');
    const { data, error } = await supabase
      .from('toolkit_prompts')
      .select('*')
      .eq('is_published', true)
      .order('sort_order');

    console.log('[useToolkit] Prompts result:', { count: data?.length, error });
    if (error) throw error;

    setPrompts((data || []).map(p => ({
      id: p.id,
      categoryId: p.category_id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      useCase: p.use_case,
      promptTemplate: p.prompt_template,
      variables: p.variables,
      exampleOutput: p.example_output,
      targetTool: p.target_tool,
      tags: p.tags,
      copyCount: p.copy_count,
      helpfulCount: p.helpful_count,
      isFeatured: p.is_featured,
    })));
  }, []);

  const loadTools = useCallback(async () => {
    console.log('[useToolkit] Loading tools...');
    const { data, error } = await supabase
      .from('toolkit_tools')
      .select('*')
      .order('sort_order');

    console.log('[useToolkit] Tools result:', { count: data?.length, error });
    if (error) throw error;

    setTools((data || []).map(t => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      tagline: t.tagline,
      description: t.description,
      websiteUrl: t.website_url,
      docsUrl: t.docs_url,
      pricingUrl: t.pricing_url,
      ratings: {
        ui: t.rating_ui,
        backend: t.rating_backend,
        database: t.rating_database,
        deployment: t.rating_deployment,
        learningCurve: t.rating_learning_curve,
      },
      strengths: t.strengths,
      weaknesses: t.weaknesses,
      bestFor: t.best_for,
      notFor: t.not_for,
      pricingModel: t.pricing_model,
      pricingDetails: t.pricing_details,
      techStack: t.tech_stack,
      integrations: t.integrations,
      proTips: t.pro_tips,
      commonMistakes: t.common_mistakes,
      logoUrl: t.logo_url,
      color: t.color,
      isFeatured: t.is_featured,
    })));
  }, []);

  const loadPitfalls = useCallback(async () => {
    console.log('[useToolkit] Loading pitfalls...');
    const { data, error } = await supabase
      .from('toolkit_pitfalls')
      .select('*')
      .eq('is_published', true)
      .order('sort_order');

    console.log('[useToolkit] Pitfalls result:', { count: data?.length, error });
    if (error) throw error;

    setPitfalls((data || []).map(p => ({
      id: p.id,
      category: p.category,
      title: p.title,
      description: p.description,
      whyBad: p.why_bad,
      solution: p.solution,
      affectedTools: p.affected_tools,
      severity: p.severity,
      relatedGuideId: p.related_guide_id,
      externalLink: p.external_link,
      icon: p.icon,
    })));
  }, []);

  const loadBookmarks = useCallback(async () => {
    if (!user) {
      setBookmarks([]);
      return;
    }

    const { data, error } = await supabase
      .from('toolkit_bookmarks')
      .select('content_type, content_id')
      .eq('user_id', user.id);

    if (error) throw error;

    setBookmarks((data || []).map(b => ({
      type: b.content_type,
      id: b.content_id,
    })));
  }, [user]);

  // ════════════════════════════════════════════════════════════
  // GUIDES
  // ════════════════════════════════════════════════════════════

  const getGuide = useCallback(async (slug: string): Promise<ToolkitGuide | null> => {
    const cached = guides.find(g => g.slug === slug);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('toolkit_guides')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      categoryId: data.category_id,
      slug: data.slug,
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      coverImage: data.cover_image,
      contentMd: data.content_md,
      difficulty: data.difficulty,
      estimatedTime: data.estimated_time,
      tools: data.tools,
      tags: data.tags,
      authorName: data.author_name,
      authorAvatar: data.author_avatar,
      viewCount: data.view_count,
      helpfulCount: data.helpful_count,
      isFeatured: data.is_featured,
      publishedAt: new Date(data.published_at),
    };
  }, [guides]);

  const getGuidesByCategory = useCallback((categorySlug: string): ToolkitGuide[] => {
    const category = categories.find(c => c.slug === categorySlug);
    if (!category) return [];
    return guides.filter(g => g.categoryId === category.id);
  }, [guides, categories]);

  const getGuidesByTool = useCallback((toolSlug: string): ToolkitGuide[] => {
    return guides.filter(g => g.tools?.includes(toolSlug));
  }, [guides]);

  const getFeaturedGuides = useCallback((): ToolkitGuide[] => {
    return guides.filter(g => g.isFeatured);
  }, [guides]);

  const incrementGuideView = useCallback(async (guideId: string): Promise<void> => {
    await supabase
      .from('toolkit_guides')
      .update({ view_count: (guides.find(g => g.id === guideId)?.viewCount || 0) + 1 })
      .eq('id', guideId);
  }, [guides]);

  const markGuideHelpful = useCallback(async (guideId: string): Promise<void> => {
    const guide = guides.find(g => g.id === guideId);
    if (!guide) return;

    await supabase
      .from('toolkit_guides')
      .update({ helpful_count: guide.helpfulCount + 1 })
      .eq('id', guideId);
  }, [guides]);

  // ════════════════════════════════════════════════════════════
  // CHECKLISTS
  // ════════════════════════════════════════════════════════════

  const getChecklist = useCallback(async (slug: string): Promise<ToolkitChecklist | null> => {
    const cached = checklists.find(c => c.slug === slug);
    return cached || null;
  }, [checklists]);

  const getChecklistWithItems = useCallback(async (slug: string): Promise<ToolkitChecklist | null> => {
    const { data: checklistData, error: checklistError } = await supabase
      .from('toolkit_checklists')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (checklistError || !checklistData) return null;

    const { data: itemsData, error: itemsError } = await supabase
      .from('toolkit_checklist_items')
      .select('*')
      .eq('checklist_id', checklistData.id)
      .order('section')
      .order('sort_order');

    if (itemsError) return null;

    // Get user progress
    let progressData: { item_id: string; is_completed: boolean; completed_at: string | null; notes: string | null }[] = [];
    if (user) {
      const { data: progress } = await supabase
        .from('toolkit_checklist_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('checklist_id', checklistData.id)
        .eq('venture_id', activeVenture?.id || null);

      progressData = progress || [];
    }

    const items: ToolkitChecklistItem[] = (itemsData || []).map(i => {
      const userProgress = progressData.find(p => p.item_id === i.id);
      return {
        id: i.id,
        checklistId: i.checklist_id,
        title: i.title,
        description: i.description,
        helpText: i.help_text,
        helpLink: i.help_link,
        section: i.section,
        sortOrder: i.sort_order,
        isCritical: i.is_critical,
        isCompleted: userProgress?.is_completed || false,
        completedAt: userProgress?.completed_at ? new Date(userProgress.completed_at) : undefined,
        notes: userProgress?.notes || undefined,
      };
    });

    return {
      id: checklistData.id,
      categoryId: checklistData.category_id,
      slug: checklistData.slug,
      title: checklistData.title,
      description: checklistData.description,
      icon: checklistData.icon,
      difficulty: checklistData.difficulty,
      estimatedTime: checklistData.estimated_time,
      tags: checklistData.tags,
      isFeatured: checklistData.is_featured,
      items,
    };
  }, [user, activeVenture]);

  const getChecklistProgress = useCallback(async (checklistId: string): Promise<ChecklistProgress | null> => {
    if (!user) return null;

    const { data, error } = await supabase.rpc('get_checklist_progress', {
      p_user_id: user.id,
      p_venture_id: activeVenture?.id || null,
      p_checklist_id: checklistId,
    });

    if (error) return null;

    return {
      total: data.total,
      completed: data.completed,
      percentage: data.percentage,
      criticalTotal: data.critical_total,
      criticalCompleted: data.critical_completed,
      allCriticalDone: data.all_critical_done,
    };
  }, [user, activeVenture]);

  const toggleChecklistItem = useCallback(async (
    checklistId: string,
    itemId: string,
    completed: boolean,
    notes?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('toolkit_checklist_progress')
        .upsert({
          user_id: user.id,
          venture_id: activeVenture?.id || null,
          checklist_id: checklistId,
          item_id: itemId,
          is_completed: completed,
          completed_at: completed ? new Date().toISOString() : null,
          notes,
        }, {
          onConflict: 'user_id,venture_id,item_id',
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error toggling checklist item:', err);
      return false;
    }
  }, [user, activeVenture]);

  // ════════════════════════════════════════════════════════════
  // PROMPTS
  // ════════════════════════════════════════════════════════════

  const getPrompt = useCallback(async (slug: string): Promise<ToolkitPrompt | null> => {
    const cached = prompts.find(p => p.slug === slug);
    return cached || null;
  }, [prompts]);

  const getPromptsByTool = useCallback((toolSlug: string): ToolkitPrompt[] => {
    return prompts.filter(p => p.targetTool === toolSlug || p.targetTool === 'any');
  }, [prompts]);

  const getFeaturedPrompts = useCallback((): ToolkitPrompt[] => {
    return prompts.filter(p => p.isFeatured);
  }, [prompts]);

  const incrementPromptCopy = useCallback(async (promptId: string): Promise<void> => {
    const prompt = prompts.find(p => p.id === promptId);
    if (!prompt) return;

    await supabase
      .from('toolkit_prompts')
      .update({ copy_count: prompt.copyCount + 1 })
      .eq('id', promptId);
  }, [prompts]);

  const fillPromptTemplate = useCallback((template: string, variables: Record<string, string>): string => {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return result;
  }, []);

  // ════════════════════════════════════════════════════════════
  // TOOLS
  // ════════════════════════════════════════════════════════════

  const getTool = useCallback((slug: string): ToolkitTool | undefined => {
    return tools.find(t => t.slug === slug);
  }, [tools]);

  const compareTwoTools = useCallback((slug1: string, slug2: string) => {
    const tool1 = tools.find(t => t.slug === slug1);
    const tool2 = tools.find(t => t.slug === slug2);
    if (!tool1 || !tool2) return null;
    return { tool1, tool2 };
  }, [tools]);

  // ════════════════════════════════════════════════════════════
  // PITFALLS
  // ════════════════════════════════════════════════════════════

  const getPitfallsByCategory = useCallback((category: string): ToolkitPitfall[] => {
    return pitfalls.filter(p => p.category === category);
  }, [pitfalls]);

  const getPitfallsByTool = useCallback((toolSlug: string): ToolkitPitfall[] => {
    return pitfalls.filter(p =>
      !p.affectedTools ||
      p.affectedTools.length === 0 ||
      p.affectedTools.includes(toolSlug)
    );
  }, [pitfalls]);

  const getCriticalPitfalls = useCallback((): ToolkitPitfall[] => {
    return pitfalls.filter(p => p.severity === 'critical');
  }, [pitfalls]);

  // ════════════════════════════════════════════════════════════
  // BOOKMARKS
  // ════════════════════════════════════════════════════════════

  const isBookmarked = useCallback((type: string, id: string): boolean => {
    return bookmarks.some(b => b.type === type && b.id === id);
  }, [bookmarks]);

  const toggleBookmark = useCallback(async (type: string, id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const existing = bookmarks.find(b => b.type === type && b.id === id);

      if (existing) {
        await supabase
          .from('toolkit_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('content_type', type)
          .eq('content_id', id);

        setBookmarks(prev => prev.filter(b => !(b.type === type && b.id === id)));
      } else {
        await supabase
          .from('toolkit_bookmarks')
          .insert({
            user_id: user.id,
            content_type: type,
            content_id: id,
          });

        setBookmarks(prev => [...prev, { type, id }]);
      }

      return true;
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      return false;
    }
  }, [user, bookmarks]);

  // ════════════════════════════════════════════════════════════
  // SEARCH
  // ════════════════════════════════════════════════════════════

  const search = useCallback((query: string) => {
    const q = query.toLowerCase();

    return {
      guides: guides.filter(g =>
        g.title.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q) ||
        g.tags?.some(t => t.toLowerCase().includes(q))
      ),
      checklists: checklists.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      ),
      prompts: prompts.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      ),
      tools: tools.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.tagline?.toLowerCase().includes(q)
      ),
    };
  }, [guides, checklists, prompts, tools]);

  // ════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ════════════════════════════════════════════════════════════

  const refresh = useCallback(async (force = false) => {
    console.log('[useToolkit] refresh() called, force:', force);

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.warn('[useToolkit] Supabase not configured');
      setIsLoading(false);
      setError('Supabase ist nicht konfiguriert. Bitte die Toolkit-Migrations in Supabase ausführen.');
      hasLoadedRef.current = true;
      return;
    }

    console.log('[useToolkit] Supabase is configured');

    // Prevent concurrent loads
    if (isLoadingRef.current && !force) {
      console.log('[useToolkit] Already loading, skipping');
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    console.log('[useToolkit] Starting to load toolkit data...');

    try {
      await Promise.all([
        loadCategories(),
        loadGuides(),
        loadChecklists(),
        loadPrompts(),
        loadTools(),
        loadPitfalls(),
        loadBookmarks(),
      ]);
      hasLoadedRef.current = true;
      console.log('[useToolkit] Successfully loaded all toolkit data');
    } catch (err: unknown) {
      // Ignore AbortError - this is expected during cleanup
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      // Also check for abort in error message
      const errObj = err as { message?: string };
      if (errObj?.message?.includes('AbortError') || errObj?.message?.includes('aborted')) {
        return;
      }
      console.error('[useToolkit] Error loading toolkit:', err);
      // Check for missing table error
      const errorMessage = errObj?.message || '';
      if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
        setError('Toolkit-Tabellen nicht gefunden. Bitte die Migrations in Supabase ausführen.');
      } else {
        setError('Fehler beim Laden des Toolkits. Prüfe ob die Migrations ausgeführt wurden.');
      }
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [loadCategories, loadGuides, loadChecklists, loadPrompts, loadTools, loadPitfalls, loadBookmarks]);

  useEffect(() => {
    // Only load once on mount
    console.log('[useToolkit] useEffect triggered, hasLoaded:', hasLoadedRef.current);
    if (!hasLoadedRef.current) {
      console.log('[useToolkit] Calling refresh()...');
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  // Re-load bookmarks when user changes
  useEffect(() => {
    if (hasLoadedRef.current) {
      loadBookmarks();
    }
  }, [user, loadBookmarks]);

  return {
    categories,
    guides,
    checklists,
    prompts,
    tools,
    pitfalls,
    bookmarks,
    isLoading,
    error,
    getGuide,
    getGuidesByCategory,
    getGuidesByTool,
    getFeaturedGuides,
    incrementGuideView,
    markGuideHelpful,
    getChecklist,
    getChecklistWithItems,
    getChecklistProgress,
    toggleChecklistItem,
    getPrompt,
    getPromptsByTool,
    getFeaturedPrompts,
    incrementPromptCopy,
    fillPromptTemplate,
    getTool,
    compareTwoTools,
    getPitfallsByCategory,
    getPitfallsByTool,
    getCriticalPitfalls,
    isBookmarked,
    toggleBookmark,
    search,
    refresh,
  };
}
