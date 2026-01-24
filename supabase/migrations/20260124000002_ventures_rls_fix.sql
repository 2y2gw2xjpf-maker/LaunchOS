-- ============================================================
-- LaunchOS: Fix Venture RLS Policies
-- ============================================================
-- Stellt sicher, dass alle CRUD-Operationen auf ventures erlaubt sind

-- Zuerst alle bestehenden Policies droppen
DROP POLICY IF EXISTS "Users can manage own ventures" ON ventures;
DROP POLICY IF EXISTS "Users can view own ventures" ON ventures;
DROP POLICY IF EXISTS "Users can insert own ventures" ON ventures;
DROP POLICY IF EXISTS "Users can update own ventures" ON ventures;
DROP POLICY IF EXISTS "Users can delete own ventures" ON ventures;

-- Separate Policies für jede Operation (mehr Kontrolle)

-- SELECT: User kann eigene Ventures sehen
CREATE POLICY "Users can view own ventures"
  ON ventures FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: User kann Ventures für sich selbst erstellen
CREATE POLICY "Users can insert own ventures"
  ON ventures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: User kann eigene Ventures aktualisieren
CREATE POLICY "Users can update own ventures"
  ON ventures FOR UPDATE
  USING (auth.uid() = user_id);

-- DELETE: User kann eigene Ventures löschen
CREATE POLICY "Users can delete own ventures"
  ON ventures FOR DELETE
  USING (auth.uid() = user_id);

-- Stelle sicher, dass RLS aktiviert ist
ALTER TABLE ventures ENABLE ROW LEVEL SECURITY;

-- Grant permissions für authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON ventures TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
