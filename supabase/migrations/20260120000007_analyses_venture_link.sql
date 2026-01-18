-- ===========================================
-- LaunchOS: Analyses-Venture Link Migration
-- ===========================================
-- Verknüpft Analysen mit Ventures (1:n Beziehung)
-- Ein Venture kann mehrere Analysen haben

-- Füge venture_id Spalte zur analyses Tabelle hinzu
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS venture_id UUID REFERENCES ventures(id) ON DELETE SET NULL;

-- Index für schnellere Abfragen
CREATE INDEX IF NOT EXISTS idx_analyses_venture_id ON analyses(venture_id);

-- Kommentar für Dokumentation
COMMENT ON COLUMN analyses.venture_id IS 'Verknüpfung zur Venture (optional) - ein Venture kann mehrere Analysen haben';

-- RLS Policy für venture-basierte Abfragen
-- Nutzer können nur Analysen sehen, deren Venture ihnen gehört
-- DROP falls bereits existiert, dann neu erstellen
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view analyses of their ventures" ON analyses;
EXCEPTION WHEN undefined_object THEN
  -- Policy existierte nicht, das ist OK
END;
$$;

CREATE POLICY "Users can view analyses of their ventures"
ON analyses FOR SELECT
USING (
  venture_id IS NULL
  OR venture_id IN (
    SELECT id FROM ventures WHERE user_id = auth.uid()
  )
);
