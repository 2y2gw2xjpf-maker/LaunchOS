-- ============================================================
-- LaunchOS: Program Templates RLS Policy
-- ============================================================
-- Erlaubt allen authentifizierten Benutzern das Lesen von program_templates

-- Enable RLS on program_templates
ALTER TABLE program_templates ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read program templates
DROP POLICY IF EXISTS "Anyone can read program templates" ON program_templates;
CREATE POLICY "Anyone can read program templates"
  ON program_templates FOR SELECT
  USING (true);

-- Note: We use USING (true) because templates are public content
-- that should be available to all users (authenticated or not)
