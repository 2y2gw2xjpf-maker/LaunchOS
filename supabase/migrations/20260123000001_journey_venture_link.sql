-- ===========================================
-- LaunchOS: Journey-Venture Link Migration
-- ===========================================
-- Verknüpft Journey-Fortschritt mit Ventures
-- Jedes Venture hat seinen eigenen Journey-Fortschritt

-- Füge venture_id Spalte zur user_journey_progress Tabelle hinzu
ALTER TABLE user_journey_progress ADD COLUMN IF NOT EXISTS venture_id UUID REFERENCES ventures(id) ON DELETE CASCADE;

-- Index für schnellere Abfragen
CREATE INDEX IF NOT EXISTS idx_journey_progress_venture ON user_journey_progress(venture_id);

-- Aktualisiere den UNIQUE Constraint: user_id + venture_id + step_id
-- Erst alten Constraint droppen, dann neuen erstellen
ALTER TABLE user_journey_progress DROP CONSTRAINT IF EXISTS user_journey_progress_user_id_step_id_key;

-- Neuer Constraint mit venture_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_journey_progress_user_venture_step_key'
  ) THEN
    ALTER TABLE user_journey_progress
    ADD CONSTRAINT user_journey_progress_user_venture_step_key
    UNIQUE(user_id, venture_id, step_id);
  END IF;
END;
$$;

-- Kommentar für Dokumentation
COMMENT ON COLUMN user_journey_progress.venture_id IS 'Verknüpfung zum Venture - jedes Venture hat eigenen Journey-Fortschritt';
