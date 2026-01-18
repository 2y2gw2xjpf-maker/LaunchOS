-- ===========================================
-- LaunchOS: Venture Tier Data Migration
-- ===========================================
-- Erweitert die ventures Tabelle um tier_level und tier_data
-- für die dynamische Dateneingabe basierend auf Tier-Auswahl

-- Füge tier_level Spalte hinzu (1-4)
ALTER TABLE ventures ADD COLUMN IF NOT EXISTS tier_level INTEGER DEFAULT 1 CHECK (tier_level >= 1 AND tier_level <= 4);

-- Füge tier_data JSONB Spalte hinzu
-- Struktur:
-- {
--   "tier": 1-4,
--   "category": "HealthTech" | "FinTech" | ...,
--   "stage": "idea" | "mvp" | "pre-seed" | "seed" | "series-a",
--   "description": "...",
--   "url": "https://...",
--   "github_url": "https://github.com/...",
--   "pitch_deck_url": "...",
--   "has_financials": true/false,
--   "financials_summary": "...",
--   "completed_at": "2026-01-18T..."
-- }
ALTER TABLE ventures ADD COLUMN IF NOT EXISTS tier_data JSONB DEFAULT '{}'::jsonb;

-- Index für schnellere Abfragen auf tier_data
CREATE INDEX IF NOT EXISTS idx_ventures_tier_data ON ventures USING gin(tier_data);

-- Index für tier_level
CREATE INDEX IF NOT EXISTS idx_ventures_tier_level ON ventures(tier_level);

-- Kommentar für Dokumentation
COMMENT ON COLUMN ventures.tier_level IS 'Ausgewähltes Daten-Level (1=Minimal, 2=Basis, 3=Detailliert, 4=Vollständig)';
COMMENT ON COLUMN ventures.tier_data IS 'Tier-basierte Venture-Daten als JSONB für flexible Speicherung';
