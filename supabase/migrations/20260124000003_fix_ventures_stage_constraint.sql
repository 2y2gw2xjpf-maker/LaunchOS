-- ============================================================
-- LaunchOS: Fix Venture Stage Constraint
-- ============================================================
-- Fügt 'mvp' als erlaubten Stage-Wert hinzu

-- Drop the old constraint
ALTER TABLE ventures DROP CONSTRAINT IF EXISTS ventures_stage_check;

-- Add the new constraint with 'mvp' included
ALTER TABLE ventures ADD CONSTRAINT ventures_stage_check
  CHECK (stage IS NULL OR stage IN ('idea', 'mvp', 'pre-seed', 'seed', 'series-a', 'series-b', 'growth'));
