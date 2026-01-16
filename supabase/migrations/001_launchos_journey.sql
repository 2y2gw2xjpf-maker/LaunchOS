-- ===========================================
-- LaunchOS Journey System Migration
-- ===========================================
-- Erweitert das bestehende Schema um Journey Steps,
-- Deliverables, Valuations und Chat

-- ═══════════════════════════════════════════════════════════════
-- ENUMS
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
-- USER PROFILES ERWEITERUNG
-- ═══════════════════════════════════════════════════════════════

-- Erweitere profiles Tabelle um Gründer-spezifische Felder
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS company_type company_type DEFAULT 'not_yet_founded',
  ADD COLUMN IF NOT EXISTS funding_path funding_path DEFAULT 'undecided',
  ADD COLUMN IF NOT EXISTS stage startup_stage DEFAULT 'idea',
  ADD COLUMN IF NOT EXISTS monthly_revenue INTEGER,
  ADD COLUMN IF NOT EXISTS growth_rate DECIMAL,
  ADD COLUMN IF NOT EXISTS team_size INTEGER,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

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
-- CHAT MESSAGES
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

ALTER TABLE user_journey_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverable_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE valuations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Journey Steps sind public readable (System-Daten)
ALTER TABLE journey_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Journey steps are public" ON journey_steps FOR SELECT USING (true);
CREATE POLICY "Journey resources are public" ON journey_resources FOR SELECT USING (true);

-- User Journey Progress
CREATE POLICY "Users own their journey progress" ON user_journey_progress
  FOR ALL USING (user_id = auth.uid());

-- Deliverables
CREATE POLICY "Users own their deliverables" ON deliverables
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users own their versions" ON deliverable_versions
  FOR ALL USING (
    deliverable_id IN (SELECT id FROM deliverables WHERE user_id = auth.uid())
  );

-- Valuations
CREATE POLICY "Users own their valuations" ON valuations
  FOR ALL USING (user_id = auth.uid());

-- Chat
CREATE POLICY "Users own their chat sessions" ON chat_sessions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users own their messages" ON chat_messages
  FOR ALL USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════════════════

CREATE TRIGGER update_journey_progress_updated_at
  BEFORE UPDATE ON user_journey_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_deliverables_updated_at
  BEFORE UPDATE ON deliverables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════════════════════════════

COMMENT ON TABLE journey_steps IS 'System-definierte Gründer-Journey Steps (35 Steps)';
COMMENT ON TABLE journey_resources IS 'Offizielle Quellen und Links pro Step';
COMMENT ON TABLE user_journey_progress IS 'User-spezifischer Fortschritt pro Step';
COMMENT ON TABLE deliverables IS 'Generierte Dokumente (Pitch Deck, Businessplan, etc.)';
COMMENT ON TABLE valuations IS 'Gespeicherte Bewertungen mit Methodik';
COMMENT ON TABLE chat_sessions IS 'Chat-Sitzungen pro User';
COMMENT ON TABLE chat_messages IS 'Nachrichten innerhalb einer Chat-Sitzung';
