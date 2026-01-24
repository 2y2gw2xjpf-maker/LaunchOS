  -- ══════════════════════════════════════════════════════════════
  -- BUILDER'S TOOLKIT - DATABASE SCHEMA
  -- ══════════════════════════════════════════════════════════════

  -- ──────────────────────────────────────────────────────────────
  -- 1. KATEGORIEN
  -- ──────────────────────────────────────────────────────────────

  CREATE TABLE IF NOT EXISTS toolkit_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identifikation
    slug TEXT UNIQUE NOT NULL, -- 'tool-guides', 'checklists', 'prompts', etc.
    name TEXT NOT NULL,
    description TEXT,

    -- Display
    icon TEXT, -- Lucide icon name
    color TEXT, -- Hex color for accent
    sort_order INTEGER DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- ──────────────────────────────────────────────────────────────
  -- 2. GUIDES (Tutorials, Tool-Guides, etc.)
  -- ──────────────────────────────────────────────────────────────

  CREATE TABLE IF NOT EXISTS toolkit_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Kategorisierung
    category_id UUID REFERENCES toolkit_categories(id) ON DELETE SET NULL,
    slug TEXT UNIQUE NOT NULL,

    -- Inhalt
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    cover_image TEXT, -- URL or path

    -- Content (Markdown)
    content_md TEXT NOT NULL,

    -- Metadaten
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    estimated_time TEXT, -- z.B. "15 min", "1-2 Stunden"
    tools TEXT[], -- Array von Tool-Namen: ['lovable', 'cursor', 'supabase']
    tags TEXT[],

    -- Autor (für zukünftige Community-Beiträge)
    author_name TEXT DEFAULT 'LaunchOS Team',
    author_avatar TEXT,

    -- Engagement
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,

    -- Status
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    published_at TIMESTAMPTZ DEFAULT NOW(),

    -- SEO
    meta_title TEXT,
    meta_description TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- ──────────────────────────────────────────────────────────────
  -- 3. CHECKLISTEN
  -- ──────────────────────────────────────────────────────────────

  CREATE TABLE IF NOT EXISTS toolkit_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Kategorisierung
    category_id UUID REFERENCES toolkit_categories(id) ON DELETE SET NULL,
    slug TEXT UNIQUE NOT NULL,

    -- Inhalt
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,

    -- Metadaten
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    estimated_time TEXT,
    tags TEXT[],

    -- Display
    sort_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Checklist Items (die einzelnen Punkte)
  CREATE TABLE IF NOT EXISTS toolkit_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID NOT NULL REFERENCES toolkit_checklists(id) ON DELETE CASCADE,

    -- Inhalt
    title TEXT NOT NULL,
    description TEXT,
    help_text TEXT, -- Zusätzliche Erklärung
    help_link TEXT, -- Link zu weiterführendem Guide

    -- Gruppierung
    section TEXT, -- z.B. "Backend", "Frontend", "Security"
    sort_order INTEGER DEFAULT 0,

    -- Wichtigkeit
    is_critical BOOLEAN DEFAULT false, -- Markiert als "Must Have"

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- User Progress (welche Items hat der User abgehakt)
  CREATE TABLE IF NOT EXISTS toolkit_checklist_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    venture_id UUID REFERENCES ventures(id) ON DELETE CASCADE,
    checklist_id UUID NOT NULL REFERENCES toolkit_checklists(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES toolkit_checklist_items(id) ON DELETE CASCADE,

    -- Status
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    notes TEXT, -- User kann Notizen hinzufügen

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(user_id, venture_id, item_id)
  );

  -- ──────────────────────────────────────────────────────────────
  -- 4. PROMPT-TEMPLATES
  -- ──────────────────────────────────────────────────────────────

  CREATE TABLE IF NOT EXISTS toolkit_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Kategorisierung
    category_id UUID REFERENCES toolkit_categories(id) ON DELETE SET NULL,
    slug TEXT UNIQUE NOT NULL,

    -- Inhalt
    title TEXT NOT NULL,
    description TEXT,
    use_case TEXT, -- Wann diesen Prompt nutzen

    -- Der eigentliche Prompt
    prompt_template TEXT NOT NULL,

    -- Variablen im Prompt (für UI)
    variables JSONB DEFAULT '[]'::jsonb,
    -- Format: [{"name": "project_name", "label": "Projektname", "type": "text", "placeholder": "Mein Startup"}]

    -- Beispiel-Output
    example_output TEXT,

    -- Metadaten
    target_tool TEXT, -- 'lovable', 'bolt', 'cursor', 'claude-code', 'any'
    tags TEXT[],

    -- Engagement
    copy_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,

    -- Display
    sort_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- ──────────────────────────────────────────────────────────────
  -- 5. TOOL-PROFILE (Vergleiche)
  -- ──────────────────────────────────────────────────────────────

  CREATE TABLE IF NOT EXISTS toolkit_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identifikation
    slug TEXT UNIQUE NOT NULL, -- 'lovable', 'bolt', 'cursor', etc.
    name TEXT NOT NULL,
    tagline TEXT,
    description TEXT,

    -- Links
    website_url TEXT,
    docs_url TEXT,
    pricing_url TEXT,

    -- Bewertung (1-5)
    rating_ui INTEGER CHECK (rating_ui BETWEEN 1 AND 5),
    rating_backend INTEGER CHECK (rating_backend BETWEEN 1 AND 5),
    rating_database INTEGER CHECK (rating_database BETWEEN 1 AND 5),
    rating_deployment INTEGER CHECK (rating_deployment BETWEEN 1 AND 5),
    rating_learning_curve INTEGER CHECK (rating_learning_curve BETWEEN 1 AND 5),

    -- Stärken & Schwächen (Arrays)
    strengths TEXT[],
    weaknesses TEXT[],
    best_for TEXT[], -- Anwendungsfälle
    not_for TEXT[], -- Wofür nicht geeignet

    -- Preismodell
    pricing_model TEXT, -- 'free', 'freemium', 'paid', 'usage-based'
    pricing_details TEXT,

    -- Technische Details
    tech_stack TEXT[], -- Was es unter der Haube nutzt
    integrations TEXT[], -- Womit es integriert

    -- Tipps
    pro_tips TEXT[], -- Array von Pro-Tipps
    common_mistakes TEXT[], -- Häufige Fehler

    -- Display
    logo_url TEXT,
    color TEXT, -- Brand color
    sort_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- ──────────────────────────────────────────────────────────────
  -- 6. HÄUFIGE FEHLER / PITFALLS
  -- ──────────────────────────────────────────────────────────────

  CREATE TABLE IF NOT EXISTS toolkit_pitfalls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Kategorisierung
    category TEXT NOT NULL, -- 'frontend', 'backend', 'database', 'auth', 'deployment', 'security'

    -- Inhalt
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    why_bad TEXT, -- Warum ist das ein Problem
    solution TEXT, -- Wie macht man es richtig

    -- Betroffene Tools
    affected_tools TEXT[], -- ['lovable', 'bolt'] oder leer für alle

    -- Schweregrad
    severity TEXT CHECK (severity IN ('info', 'warning', 'critical')),

    -- Links
    related_guide_id UUID REFERENCES toolkit_guides(id),
    external_link TEXT,

    -- Display
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- ──────────────────────────────────────────────────────────────
  -- 7. USER BOOKMARKS & FAVORITES
  -- ──────────────────────────────────────────────────────────────

  CREATE TABLE IF NOT EXISTS toolkit_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Was wurde gebookmarkt
    content_type TEXT NOT NULL CHECK (content_type IN ('guide', 'checklist', 'prompt', 'tool')),
    content_id UUID NOT NULL,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(user_id, content_type, content_id)
  );

  -- ──────────────────────────────────────────────────────────────
  -- RLS POLICIES
  -- ──────────────────────────────────────────────────────────────

  -- Kategorien: Alle können lesen
  ALTER TABLE toolkit_categories ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "Anyone can view categories" ON toolkit_categories;
  CREATE POLICY "Anyone can view categories" ON toolkit_categories FOR SELECT USING (is_active = true);

  -- Guides: Alle können published lesen
  ALTER TABLE toolkit_guides ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "Anyone can view published guides" ON toolkit_guides;
  CREATE POLICY "Anyone can view published guides" ON toolkit_guides FOR SELECT USING (is_published = true);

  -- Checklists: Alle können published lesen
  ALTER TABLE toolkit_checklists ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "Anyone can view published checklists" ON toolkit_checklists;
  CREATE POLICY "Anyone can view published checklists" ON toolkit_checklists FOR SELECT USING (is_published = true);

  ALTER TABLE toolkit_checklist_items ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "Anyone can view checklist items" ON toolkit_checklist_items;
  CREATE POLICY "Anyone can view checklist items" ON toolkit_checklist_items FOR SELECT USING (true);

  -- Progress: User können nur eigene sehen/bearbeiten
  ALTER TABLE toolkit_checklist_progress ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "Users can manage own progress" ON toolkit_checklist_progress;
  CREATE POLICY "Users can manage own progress" ON toolkit_checklist_progress FOR ALL USING (auth.uid() = user_id);

  -- Prompts: Alle können published lesen
  ALTER TABLE toolkit_prompts ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "Anyone can view published prompts" ON toolkit_prompts;
  CREATE POLICY "Anyone can view published prompts" ON toolkit_prompts FOR SELECT USING (is_published = true);

  -- Tools: Alle können lesen
  ALTER TABLE toolkit_tools ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "Anyone can view tools" ON toolkit_tools;
  CREATE POLICY "Anyone can view tools" ON toolkit_tools FOR SELECT USING (true);

  -- Pitfalls: Alle können published lesen
  ALTER TABLE toolkit_pitfalls ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "Anyone can view published pitfalls" ON toolkit_pitfalls;
  CREATE POLICY "Anyone can view published pitfalls" ON toolkit_pitfalls FOR SELECT USING (is_published = true);

  -- Bookmarks: User können nur eigene sehen/bearbeiten
  ALTER TABLE toolkit_bookmarks ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "Users can manage own bookmarks" ON toolkit_bookmarks;
  CREATE POLICY "Users can manage own bookmarks" ON toolkit_bookmarks FOR ALL USING (auth.uid() = user_id);

  -- ──────────────────────────────────────────────────────────────
  -- INDEXES
  -- ──────────────────────────────────────────────────────────────

  CREATE INDEX IF NOT EXISTS idx_toolkit_guides_category ON toolkit_guides(category_id);
  CREATE INDEX IF NOT EXISTS idx_toolkit_guides_slug ON toolkit_guides(slug);
  CREATE INDEX IF NOT EXISTS idx_toolkit_guides_featured ON toolkit_guides(is_featured) WHERE is_featured = true;
  CREATE INDEX IF NOT EXISTS idx_toolkit_guides_tools ON toolkit_guides USING GIN(tools);
  CREATE INDEX IF NOT EXISTS idx_toolkit_guides_tags ON toolkit_guides USING GIN(tags);

  CREATE INDEX IF NOT EXISTS idx_toolkit_checklists_category ON toolkit_checklists(category_id);
  CREATE INDEX IF NOT EXISTS idx_toolkit_checklist_items_checklist ON toolkit_checklist_items(checklist_id);
  CREATE INDEX IF NOT EXISTS idx_toolkit_checklist_progress_user ON toolkit_checklist_progress(user_id);
  CREATE INDEX IF NOT EXISTS idx_toolkit_checklist_progress_checklist ON toolkit_checklist_progress(checklist_id);

  CREATE INDEX IF NOT EXISTS idx_toolkit_prompts_category ON toolkit_prompts(category_id);
  CREATE INDEX IF NOT EXISTS idx_toolkit_prompts_tool ON toolkit_prompts(target_tool);
  CREATE INDEX IF NOT EXISTS idx_toolkit_prompts_tags ON toolkit_prompts USING GIN(tags);

  CREATE INDEX IF NOT EXISTS idx_toolkit_tools_slug ON toolkit_tools(slug);
  CREATE INDEX IF NOT EXISTS idx_toolkit_pitfalls_category ON toolkit_pitfalls(category);

  CREATE INDEX IF NOT EXISTS idx_toolkit_bookmarks_user ON toolkit_bookmarks(user_id);
  CREATE INDEX IF NOT EXISTS idx_toolkit_bookmarks_content ON toolkit_bookmarks(content_type, content_id);

  -- ──────────────────────────────────────────────────────────────
  -- TRIGGERS
  -- ──────────────────────────────────────────────────────────────

  DROP TRIGGER IF EXISTS toolkit_categories_updated_at ON toolkit_categories;
  CREATE TRIGGER toolkit_categories_updated_at
    BEFORE UPDATE ON toolkit_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

  DROP TRIGGER IF EXISTS toolkit_guides_updated_at ON toolkit_guides;
  CREATE TRIGGER toolkit_guides_updated_at
    BEFORE UPDATE ON toolkit_guides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

  DROP TRIGGER IF EXISTS toolkit_checklists_updated_at ON toolkit_checklists;
  CREATE TRIGGER toolkit_checklists_updated_at
    BEFORE UPDATE ON toolkit_checklists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

  DROP TRIGGER IF EXISTS toolkit_checklist_progress_updated_at ON toolkit_checklist_progress;
  CREATE TRIGGER toolkit_checklist_progress_updated_at
    BEFORE UPDATE ON toolkit_checklist_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

  DROP TRIGGER IF EXISTS toolkit_prompts_updated_at ON toolkit_prompts;
  CREATE TRIGGER toolkit_prompts_updated_at
    BEFORE UPDATE ON toolkit_prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

  DROP TRIGGER IF EXISTS toolkit_tools_updated_at ON toolkit_tools;
  CREATE TRIGGER toolkit_tools_updated_at
    BEFORE UPDATE ON toolkit_tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

  -- ──────────────────────────────────────────────────────────────
  -- HELPER FUNCTIONS
  -- ──────────────────────────────────────────────────────────────

  -- Checklist Progress berechnen
  CREATE OR REPLACE FUNCTION get_checklist_progress(
    p_user_id UUID,
    p_venture_id UUID,
    p_checklist_id UUID
  ) RETURNS JSON AS $$
  DECLARE
    v_total INTEGER;
    v_completed INTEGER;
    v_critical_total INTEGER;
    v_critical_completed INTEGER;
  BEGIN
    -- Total items
    SELECT COUNT(*) INTO v_total
    FROM toolkit_checklist_items
    WHERE checklist_id = p_checklist_id;

    -- Completed items
    SELECT COUNT(*) INTO v_completed
    FROM toolkit_checklist_progress
    WHERE user_id = p_user_id
      AND (venture_id = p_venture_id OR (venture_id IS NULL AND p_venture_id IS NULL))
      AND checklist_id = p_checklist_id
      AND is_completed = true;

    -- Critical items
    SELECT COUNT(*) INTO v_critical_total
    FROM toolkit_checklist_items
    WHERE checklist_id = p_checklist_id AND is_critical = true;

    SELECT COUNT(*) INTO v_critical_completed
    FROM toolkit_checklist_progress p
    JOIN toolkit_checklist_items i ON p.item_id = i.id
    WHERE p.user_id = p_user_id
      AND (p.venture_id = p_venture_id OR (p.venture_id IS NULL AND p_venture_id IS NULL))
      AND p.checklist_id = p_checklist_id
      AND p.is_completed = true
      AND i.is_critical = true;

    RETURN json_build_object(
      'total', v_total,
      'completed', v_completed,
      'percentage', CASE WHEN v_total > 0 THEN ROUND((v_completed::decimal / v_total) * 100) ELSE 0 END,
      'critical_total', v_critical_total,
      'critical_completed', v_critical_completed,
      'all_critical_done', v_critical_completed = v_critical_total
    );
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
