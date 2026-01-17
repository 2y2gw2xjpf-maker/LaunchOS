-- MIGRATION: Investor CRM & Data Room
-- Created: 2026-01-18

-- ═══════════════════════════════════════════════════════════════
-- INVESTOR CRM TABLES
-- ═══════════════════════════════════════════════════════════════

-- Investoren-Kontakte
CREATE TABLE IF NOT EXISTS investor_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venture_id UUID REFERENCES ventures(id) ON DELETE CASCADE,

  -- Basis-Infos
  name TEXT NOT NULL,
  company TEXT,
  role TEXT,
  type TEXT CHECK (type IN ('vc', 'angel', 'family_office', 'corporate', 'accelerator', 'other')),

  -- Kontakt
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  website TEXT,

  -- Investment-Fokus
  investment_focus TEXT[],
  stage_focus TEXT[],
  ticket_size_min INTEGER,
  ticket_size_max INTEGER,
  geography TEXT[],

  -- Pipeline
  pipeline_stage TEXT DEFAULT 'lead' CHECK (pipeline_stage IN (
    'lead', 'researching', 'contacted', 'meeting_scheduled',
    'meeting_done', 'follow_up', 'term_sheet', 'due_diligence',
    'closed_won', 'closed_lost', 'on_hold'
  )),
  pipeline_stage_updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Bewertung
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  fit_score INTEGER CHECK (fit_score >= 0 AND fit_score <= 100),

  -- Follow-up
  next_follow_up DATE,
  follow_up_note TEXT,

  -- Quelle
  source TEXT,
  referred_by TEXT,

  -- Status
  is_archived BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aktivitaeten/Interaktionen
CREATE TABLE IF NOT EXISTS investor_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES investor_contacts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Aktivitaet
  type TEXT NOT NULL CHECK (type IN (
    'email_sent', 'email_received', 'call', 'meeting',
    'linkedin_message', 'intro_request', 'note',
    'stage_change', 'document_shared', 'feedback_received'
  )),
  title TEXT NOT NULL,
  description TEXT,

  -- Verknuepfungen
  related_deliverable_id UUID REFERENCES deliverables(id),

  -- Timestamps
  activity_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags fuer Investoren
CREATE TABLE IF NOT EXISTS investor_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#9333ea',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, name)
);

-- Tag-Zuordnungen
CREATE TABLE IF NOT EXISTS investor_contact_tags (
  contact_id UUID REFERENCES investor_contacts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES investor_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (contact_id, tag_id)
);

-- ═══════════════════════════════════════════════════════════════
-- DATA ROOM TABLES
-- ═══════════════════════════════════════════════════════════════

-- Data Room Ordner
CREATE TABLE IF NOT EXISTS data_room_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venture_id UUID REFERENCES ventures(id) ON DELETE CASCADE,

  -- Struktur
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES data_room_folders(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,

  -- Icon/Farbe
  icon TEXT DEFAULT 'folder',
  color TEXT DEFAULT '#9333ea',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data Room Dateien
CREATE TABLE IF NOT EXISTS data_room_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venture_id UUID REFERENCES ventures(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES data_room_folders(id) ON DELETE SET NULL,

  -- Datei-Info
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,

  -- Verknuepfung zu Deliverable
  deliverable_id UUID REFERENCES deliverables(id),

  -- Einstellungen
  is_confidential BOOLEAN DEFAULT false,
  watermark_enabled BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data Room Zugriffs-Links
CREATE TABLE IF NOT EXISTS data_room_access_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venture_id UUID REFERENCES ventures(id) ON DELETE CASCADE,

  -- Link-Info
  name TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,

  -- Zugriff
  password_hash TEXT,
  allowed_folders UUID[],
  allowed_files UUID[],

  -- Beschraenkungen
  expires_at TIMESTAMPTZ,
  max_views INTEGER,
  current_views INTEGER DEFAULT 0,
  download_allowed BOOLEAN DEFAULT true,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ
);

-- Data Room Zugriffs-Log
CREATE TABLE IF NOT EXISTS data_room_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_link_id UUID REFERENCES data_room_access_links(id) ON DELETE CASCADE,

  -- Zugriff
  action TEXT NOT NULL CHECK (action IN ('view', 'download', 'link_accessed')),
  file_id UUID REFERENCES data_room_files(id),
  folder_id UUID REFERENCES data_room_folders(id),

  -- Visitor Info
  visitor_ip TEXT,
  visitor_user_agent TEXT,
  visitor_email TEXT,

  -- Timestamps
  accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE investor_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_room_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_room_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_room_access_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_room_access_log ENABLE ROW LEVEL SECURITY;

-- Investor CRM Policies
CREATE POLICY "Users can manage own investor contacts"
  ON investor_contacts FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own investor activities"
  ON investor_activities FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own investor tags"
  ON investor_tags FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own contact tags"
  ON investor_contact_tags FOR ALL
  USING (contact_id IN (SELECT id FROM investor_contacts WHERE user_id = auth.uid()));

-- Data Room Policies
CREATE POLICY "Users can manage own data room folders"
  ON data_room_folders FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own data room files"
  ON data_room_files FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own access links"
  ON data_room_access_links FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own access logs"
  ON data_room_access_log FOR SELECT
  USING (access_link_id IN (SELECT id FROM data_room_access_links WHERE user_id = auth.uid()));

-- Public access for data room with token
CREATE POLICY "Public can view data room with valid token"
  ON data_room_files FOR SELECT
  USING (
    id IN (
      SELECT unnest(allowed_files) FROM data_room_access_links
      WHERE is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
    )
    OR folder_id IN (
      SELECT unnest(allowed_folders) FROM data_room_access_links
      WHERE is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
    )
  );

CREATE POLICY "Public can insert access logs"
  ON data_room_access_log FOR INSERT
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_investor_contacts_user ON investor_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_investor_contacts_venture ON investor_contacts(venture_id);
CREATE INDEX IF NOT EXISTS idx_investor_contacts_stage ON investor_contacts(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_investor_contacts_follow_up ON investor_contacts(next_follow_up);
CREATE INDEX IF NOT EXISTS idx_investor_activities_contact ON investor_activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_data_room_folders_user ON data_room_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_data_room_folders_parent ON data_room_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_data_room_files_folder ON data_room_files(folder_id);
CREATE INDEX IF NOT EXISTS idx_data_room_access_links_token ON data_room_access_links(token);
CREATE INDEX IF NOT EXISTS idx_data_room_access_log_link ON data_room_access_log(access_link_id);

-- ═══════════════════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════════════════

-- Updated_at trigger for investor_contacts
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS investor_contacts_updated_at ON investor_contacts;
CREATE TRIGGER investor_contacts_updated_at
  BEFORE UPDATE ON investor_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS data_room_folders_updated_at ON data_room_folders;
CREATE TRIGGER data_room_folders_updated_at
  BEFORE UPDATE ON data_room_folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS data_room_files_updated_at ON data_room_files;
CREATE TRIGGER data_room_files_updated_at
  BEFORE UPDATE ON data_room_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
