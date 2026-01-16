-- ===========================================
-- LaunchOS Complete Database Schema
-- ===========================================
-- Vollständige Migration mit allen Tabellen
-- Kann standalone ausgeführt werden

-- ═══════════════════════════════════════════════════════════════
-- ENUMS (Erstelle nur wenn nicht existiert)
-- ═══════════════════════════════════════════════════════════════

DO $$ BEGIN
  CREATE TYPE journey_phase AS ENUM (
    'foundation', 'legal', 'branding', 'product', 'launch', 'funding', 'growth'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE journey_category AS ENUM (
    'legal', 'finance', 'product', 'marketing', 'operations', 'funding', 'compliance'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE step_status AS ENUM (
    'not_started', 'in_progress', 'completed', 'skipped', 'not_applicable'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE resource_type AS ENUM (
    'official', 'guide', 'template', 'tool', 'service'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE help_type AS ENUM (
    'chat', 'template', 'generate', 'guide'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE company_type AS ENUM (
    'gmbh', 'ug', 'einzelunternehmen', 'gbr', 'ag', 'not_yet_founded'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE funding_path AS ENUM (
    'bootstrap', 'investor', 'grant', 'undecided'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE startup_stage AS ENUM (
    'idea', 'building', 'mvp', 'launched', 'scaling'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE deliverable_type AS ENUM (
    'pitch_deck', 'business_plan', 'financial_model', 'investor_list',
    'valuation_report', 'legal_docs', 'data_room', 'outreach_emails'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- PROFILES TABLE (Basis für alle User-Daten)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  avatar_url TEXT,

  -- Subscription
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'growth', 'scale')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing')),
  stripe_customer_id TEXT,

  -- Gründer-spezifische Felder
  industry TEXT,
  description TEXT,
  company_type company_type DEFAULT 'not_yet_founded',
  funding_path funding_path DEFAULT 'undecided',
  stage startup_stage DEFAULT 'idea',
  monthly_revenue INTEGER,
  growth_rate DECIMAL,
  team_size INTEGER,
  onboarding_completed BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- PROJECTS TABLE (Ordner für Analysen)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#8B5CF6',
  icon TEXT DEFAULT 'folder',
  position INTEGER DEFAULT 0,
  is_expanded BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- ANALYSES TABLE (Gespeicherte Analysen)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('valuation', 'whatsnext', 'actionplan', 'full')),

  -- Flexible JSON storage for analysis data
  data JSONB NOT NULL DEFAULT '{}',

  -- Metadata
  is_favorite BOOLEAN DEFAULT FALSE,
  position INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- JOURNEY STEPS (System-Tabelle - readonly für User)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS journey_steps (
  id TEXT PRIMARY KEY,
  phase journey_phase NOT NULL,
  category journey_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requires TEXT[] DEFAULT '{}',
  can_help BOOLEAN DEFAULT false,
  help_type help_type,
  help_action TEXT,
  estimated_time TEXT,
  estimated_cost TEXT,
  applicable_when JSONB DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resources für jeden Step
CREATE TABLE IF NOT EXISTS journey_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id TEXT REFERENCES journey_steps(id) ON DELETE CASCADE,
  type resource_type NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  is_free BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

-- User Journey Progress
CREATE TABLE IF NOT EXISTS user_journey_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  step_id TEXT REFERENCES journey_steps(id) ON DELETE CASCADE,
  status step_status DEFAULT 'not_started',
  notes TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, step_id)
);

-- ═══════════════════════════════════════════════════════════════
-- DELIVERABLES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type deliverable_type NOT NULL,
  title TEXT NOT NULL,
  content JSONB,
  file_url TEXT,
  file_type TEXT,
  version INTEGER DEFAULT 1,
  parent_id UUID REFERENCES deliverables(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deliverable_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id UUID REFERENCES deliverables(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content JSONB,
  file_url TEXT,
  change_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- VALUATIONS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS valuations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES analyses(id) ON DELETE SET NULL,
  value_low BIGINT,
  value_mid BIGINT,
  value_high BIGINT,
  confidence_score INTEGER,
  confidence_factors JSONB,
  methods_used JSONB,
  inputs JSONB,
  improvement_suggestions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- CHAT
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_position ON projects(user_id, position);
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_project_id ON analyses(project_id);
CREATE INDEX IF NOT EXISTS idx_analyses_type ON analyses(user_id, type);
CREATE INDEX IF NOT EXISTS idx_analyses_favorite ON analyses(user_id, is_favorite);
CREATE INDEX IF NOT EXISTS idx_analyses_created ON analyses(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journey_resources_step ON journey_resources(step_id);
CREATE INDEX IF NOT EXISTS idx_journey_progress_user ON user_journey_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_journey_progress_status ON user_journey_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_deliverables_user ON deliverables(user_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_type ON deliverables(user_id, type);
CREATE INDEX IF NOT EXISTS idx_valuations_user ON valuations(user_id);
CREATE INDEX IF NOT EXISTS idx_valuations_analysis ON valuations(analysis_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(session_id, created_at);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_journey_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverable_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE valuations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Projects
DROP POLICY IF EXISTS "Users can manage own projects" ON projects;
CREATE POLICY "Users can manage own projects" ON projects FOR ALL USING (auth.uid() = user_id);

-- Analyses
DROP POLICY IF EXISTS "Users can manage own analyses" ON analyses;
CREATE POLICY "Users can manage own analyses" ON analyses FOR ALL USING (auth.uid() = user_id);

-- Journey Steps (public readable)
DROP POLICY IF EXISTS "Journey steps are public" ON journey_steps;
CREATE POLICY "Journey steps are public" ON journey_steps FOR SELECT USING (true);
DROP POLICY IF EXISTS "Journey resources are public" ON journey_resources;
CREATE POLICY "Journey resources are public" ON journey_resources FOR SELECT USING (true);

-- User Journey Progress
DROP POLICY IF EXISTS "Users own their journey progress" ON user_journey_progress;
CREATE POLICY "Users own their journey progress" ON user_journey_progress FOR ALL USING (user_id = auth.uid());

-- Deliverables
DROP POLICY IF EXISTS "Users own their deliverables" ON deliverables;
CREATE POLICY "Users own their deliverables" ON deliverables FOR ALL USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users own their versions" ON deliverable_versions;
CREATE POLICY "Users own their versions" ON deliverable_versions FOR ALL USING (
  deliverable_id IN (SELECT id FROM deliverables WHERE user_id = auth.uid())
);

-- Valuations
DROP POLICY IF EXISTS "Users own their valuations" ON valuations;
CREATE POLICY "Users own their valuations" ON valuations FOR ALL USING (user_id = auth.uid());

-- Chat
DROP POLICY IF EXISTS "Users own their chat sessions" ON chat_sessions;
CREATE POLICY "Users own their chat sessions" ON chat_sessions FOR ALL USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users own their messages" ON chat_messages;
CREATE POLICY "Users own their messages" ON chat_messages FOR ALL USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════════

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_analyses_updated_at ON analyses;
CREATE TRIGGER update_analyses_updated_at
  BEFORE UPDATE ON analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_journey_progress_updated_at ON user_journey_progress;
CREATE TRIGGER update_journey_progress_updated_at
  BEFORE UPDATE ON user_journey_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_deliverables_updated_at ON deliverables;
CREATE TRIGGER update_deliverables_updated_at
  BEFORE UPDATE ON deliverables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
