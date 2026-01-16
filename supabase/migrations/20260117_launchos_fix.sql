-- ============================================================
-- LAUNCHOS COMPLETE - All tables and fixes
-- ============================================================

-- ============================================================
-- VENTURES TABLE (must be created first)
-- ============================================================

CREATE TABLE IF NOT EXISTS ventures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  industry TEXT,
  stage TEXT CHECK (stage IS NULL OR stage IN ('idea', 'pre-seed', 'seed', 'series-a', 'series-b', 'growth')),
  company_type TEXT,
  funding_path TEXT CHECK (funding_path IS NULL OR funding_path IN ('bootstrap', 'investor', 'hybrid', 'undecided')),
  funding_goal TEXT,
  monthly_revenue NUMERIC,
  team_size INTEGER DEFAULT 1,
  logo_url TEXT,
  branding JSONB DEFAULT '{"primary_color": "#9333ea", "secondary_color": "#ec4899", "font": "Plus Jakarta Sans"}'::jsonb,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nur EIN Venture kann aktiv sein pro User
CREATE UNIQUE INDEX IF NOT EXISTS idx_ventures_active_per_user
  ON ventures(user_id)
  WHERE is_active = true;

-- RLS fuer Ventures
ALTER TABLE ventures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own ventures" ON ventures;
CREATE POLICY "Users can manage own ventures"
  ON ventures FOR ALL
  USING (auth.uid() = user_id);

-- Trigger Funktion fuer updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ventures_updated_at ON ventures;
CREATE TRIGGER ventures_updated_at
  BEFORE UPDATE ON ventures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Add venture_id to existing tables
-- ============================================================

-- Add venture_id to deliverables if missing
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deliverables') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deliverables' AND column_name = 'venture_id') THEN
      ALTER TABLE deliverables ADD COLUMN venture_id UUID REFERENCES ventures(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Add venture_id to chat_sessions if missing
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_sessions') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_sessions' AND column_name = 'venture_id') THEN
      ALTER TABLE chat_sessions ADD COLUMN venture_id UUID REFERENCES ventures(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Indexes for venture_id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deliverables' AND column_name = 'venture_id') THEN
    CREATE INDEX IF NOT EXISTS idx_deliverables_venture ON deliverables(venture_id);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_sessions' AND column_name = 'venture_id') THEN
    CREATE INDEX IF NOT EXISTS idx_chat_sessions_venture ON chat_sessions(venture_id);
  END IF;
END $$;

-- Trigger for deliverables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deliverables') THEN
    DROP TRIGGER IF EXISTS deliverables_updated_at ON deliverables;
    CREATE TRIGGER deliverables_updated_at
      BEFORE UPDATE ON deliverables
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- ============================================================
-- PROGRAMS TABLES
-- ============================================================

-- Program Templates
CREATE TABLE IF NOT EXISTS program_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  steps JSONB NOT NULL,
  estimated_duration TEXT,
  category TEXT,
  target_stage TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Program Executions
CREATE TABLE IF NOT EXISTS program_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venture_id UUID REFERENCES ventures(id) ON DELETE CASCADE,
  template_id UUID REFERENCES program_templates(id) ON DELETE SET NULL,
  template_slug TEXT NOT NULL,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'paused', 'completed', 'failed', 'cancelled')),
  current_step INTEGER DEFAULT 0,
  steps_completed JSONB DEFAULT '[]'::jsonb,
  deliverables_created UUID[] DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  paused_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- RLS for Program Executions
ALTER TABLE program_executions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own program executions" ON program_executions;
CREATE POLICY "Users can manage own program executions"
  ON program_executions FOR ALL
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_program_executions_user ON program_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_program_executions_status ON program_executions(status);

-- ============================================================
-- SEED DATA: Program Templates
-- ============================================================

INSERT INTO program_templates (slug, title, description, steps, estimated_duration, category, target_stage) VALUES
(
  'investor-ready',
  'Investor-Ready Programm',
  'Alle Unterlagen fuer dein Investoren-Gespraech in einem Durchgang erstellen',
  '[
    {
      "id": "profile-check",
      "title": "Profil pruefen",
      "description": "Ueberpruefe ob alle Informationen vollstaendig sind",
      "type": "check",
      "required_fields": ["company_name", "industry", "stage"]
    },
    {
      "id": "pitch-deck",
      "title": "Pitch Deck erstellen",
      "description": "10-12 Slides im Sequoia-Format",
      "type": "generate",
      "deliverable_type": "pitch_deck"
    },
    {
      "id": "financial-model",
      "title": "Finanzmodell erstellen",
      "description": "3-Jahres Projektion mit P&L und Cash Flow",
      "type": "generate",
      "deliverable_type": "financial_model"
    },
    {
      "id": "investor-research",
      "title": "Investoren recherchieren",
      "description": "Passende VCs und Angels basierend auf Branche und Stage",
      "type": "research",
      "deliverable_type": "investor_list"
    },
    {
      "id": "outreach",
      "title": "Outreach E-Mails vorbereiten",
      "description": "Personalisierte Anschreiben fuer Top-10 Investoren",
      "type": "generate",
      "deliverable_type": "outreach_emails"
    }
  ]'::jsonb,
  '45-60 Minuten',
  'funding',
  ARRAY['pre-seed', 'seed', 'series-a']
),
(
  'market-validation',
  'Markt-Validierung',
  'Analysiere deinen Markt und validiere deine Annahmen',
  '[
    {
      "id": "market-size",
      "title": "Marktgroesse bestimmen",
      "description": "TAM, SAM, SOM berechnen",
      "type": "research"
    },
    {
      "id": "competitor-analysis",
      "title": "Wettbewerbsanalyse",
      "description": "Direkte und indirekte Wettbewerber identifizieren",
      "type": "research"
    },
    {
      "id": "customer-personas",
      "title": "Kunden-Personas erstellen",
      "description": "Ideale Kundenprofile definieren",
      "type": "generate"
    },
    {
      "id": "validation-plan",
      "title": "Validierungsplan",
      "description": "Naechste Schritte zur Marktvalidierung",
      "type": "generate"
    }
  ]'::jsonb,
  '30-45 Minuten',
  'validation',
  ARRAY['idea', 'pre-seed']
),
(
  'legal-setup',
  'Rechtliche Grundlagen',
  'Alle rechtlichen Dokumente und Checklisten fuer deine Gruendung',
  '[
    {
      "id": "company-type",
      "title": "Rechtsform pruefen",
      "description": "GmbH vs UG vs Einzelunternehmen",
      "type": "check"
    },
    {
      "id": "founder-agreement",
      "title": "Gruendervereinbarung",
      "description": "Grundlagen fuer Co-Founder Agreements",
      "type": "generate",
      "deliverable_type": "legal_docs"
    },
    {
      "id": "checklist",
      "title": "Gruendungs-Checkliste",
      "description": "Alle Schritte fuer die formale Gruendung",
      "type": "generate"
    }
  ]'::jsonb,
  '20-30 Minuten',
  'legal',
  ARRAY['idea', 'pre-seed']
)
ON CONFLICT (slug) DO NOTHING;
