-- MIGRATION: Analytics Dashboard
-- Created: 2026-01-18

-- ═══════════════════════════════════════════════════════════════
-- ANALYTICS VIEWS
-- ═══════════════════════════════════════════════════════════════

-- Valuation History View
-- Speichert Bewertungshistorie fuer Trendanalyse
CREATE TABLE IF NOT EXISTS valuation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venture_id UUID REFERENCES ventures(id) ON DELETE CASCADE,

  -- Bewertungsdaten
  valuation_amount DECIMAL(15, 2) NOT NULL,
  valuation_method TEXT NOT NULL,
  currency TEXT DEFAULT 'EUR',

  -- Kontext
  notes TEXT,

  -- Timestamps
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pipeline Stats Materialized View
CREATE OR REPLACE VIEW pipeline_stats_view AS
SELECT
  user_id,
  venture_id,
  pipeline_stage,
  COUNT(*) as contact_count,
  COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_count,
  AVG(fit_score) as avg_fit_score
FROM investor_contacts
WHERE is_archived = false
GROUP BY user_id, venture_id, pipeline_stage;

-- Activity Summary View
CREATE OR REPLACE VIEW activity_summary_view AS
SELECT
  ia.user_id,
  ic.venture_id,
  ia.type as activity_type,
  COUNT(*) as activity_count,
  MAX(ia.activity_date) as last_activity_date
FROM investor_activities ia
JOIN investor_contacts ic ON ia.contact_id = ic.id
WHERE ia.activity_date >= NOW() - INTERVAL '30 days'
GROUP BY ia.user_id, ic.venture_id, ia.type;

-- ═══════════════════════════════════════════════════════════════
-- ANALYTICS FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- Get Dashboard Stats Function
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_user_id UUID, p_venture_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  result JSON;
  v_total_contacts INTEGER;
  v_active_conversations INTEGER;
  v_term_sheets INTEGER;
  v_closed_deals INTEGER;
  v_total_activities INTEGER;
  v_follow_ups_due INTEGER;
BEGIN
  -- Total Contacts
  SELECT COUNT(*) INTO v_total_contacts
  FROM investor_contacts
  WHERE user_id = p_user_id
    AND (p_venture_id IS NULL OR venture_id = p_venture_id)
    AND is_archived = false;

  -- Active Conversations (meeting_scheduled, meeting_done, follow_up)
  SELECT COUNT(*) INTO v_active_conversations
  FROM investor_contacts
  WHERE user_id = p_user_id
    AND (p_venture_id IS NULL OR venture_id = p_venture_id)
    AND pipeline_stage IN ('meeting_scheduled', 'meeting_done', 'follow_up')
    AND is_archived = false;

  -- Term Sheets
  SELECT COUNT(*) INTO v_term_sheets
  FROM investor_contacts
  WHERE user_id = p_user_id
    AND (p_venture_id IS NULL OR venture_id = p_venture_id)
    AND pipeline_stage IN ('term_sheet', 'due_diligence')
    AND is_archived = false;

  -- Closed Deals
  SELECT COUNT(*) INTO v_closed_deals
  FROM investor_contacts
  WHERE user_id = p_user_id
    AND (p_venture_id IS NULL OR venture_id = p_venture_id)
    AND pipeline_stage = 'closed_won'
    AND is_archived = false;

  -- Total Activities (last 30 days)
  SELECT COUNT(*) INTO v_total_activities
  FROM investor_activities ia
  JOIN investor_contacts ic ON ia.contact_id = ic.id
  WHERE ia.user_id = p_user_id
    AND (p_venture_id IS NULL OR ic.venture_id = p_venture_id)
    AND ia.activity_date >= NOW() - INTERVAL '30 days';

  -- Follow-ups Due
  SELECT COUNT(*) INTO v_follow_ups_due
  FROM investor_contacts
  WHERE user_id = p_user_id
    AND (p_venture_id IS NULL OR venture_id = p_venture_id)
    AND next_follow_up IS NOT NULL
    AND next_follow_up <= NOW() + INTERVAL '7 days'
    AND is_archived = false;

  result := json_build_object(
    'totalContacts', v_total_contacts,
    'activeConversations', v_active_conversations,
    'termSheets', v_term_sheets,
    'closedDeals', v_closed_deals,
    'totalActivities', v_total_activities,
    'followUpsDue', v_follow_ups_due
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get Pipeline Funnel Data
CREATE OR REPLACE FUNCTION get_pipeline_funnel(p_user_id UUID, p_venture_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(row_to_json(t))
  INTO result
  FROM (
    SELECT
      pipeline_stage as stage,
      COUNT(*) as count
    FROM investor_contacts
    WHERE user_id = p_user_id
      AND (p_venture_id IS NULL OR venture_id = p_venture_id)
      AND is_archived = false
    GROUP BY pipeline_stage
    ORDER BY
      CASE pipeline_stage
        WHEN 'lead' THEN 1
        WHEN 'researching' THEN 2
        WHEN 'contacted' THEN 3
        WHEN 'meeting_scheduled' THEN 4
        WHEN 'meeting_done' THEN 5
        WHEN 'follow_up' THEN 6
        WHEN 'term_sheet' THEN 7
        WHEN 'due_diligence' THEN 8
        WHEN 'closed_won' THEN 9
        WHEN 'closed_lost' THEN 10
        WHEN 'on_hold' THEN 11
      END
  ) t;

  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get Recent Activities
CREATE OR REPLACE FUNCTION get_recent_activities(p_user_id UUID, p_venture_id UUID DEFAULT NULL, p_limit INTEGER DEFAULT 10)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(row_to_json(t))
  INTO result
  FROM (
    SELECT
      ia.id,
      ia.type,
      ia.title,
      ia.description,
      ia.activity_date,
      ic.name as contact_name,
      ic.company as contact_company
    FROM investor_activities ia
    JOIN investor_contacts ic ON ia.contact_id = ic.id
    WHERE ia.user_id = p_user_id
      AND (p_venture_id IS NULL OR ic.venture_id = p_venture_id)
    ORDER BY ia.activity_date DESC
    LIMIT p_limit
  ) t;

  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get Upcoming Follow-ups
CREATE OR REPLACE FUNCTION get_upcoming_follow_ups(p_user_id UUID, p_venture_id UUID DEFAULT NULL, p_limit INTEGER DEFAULT 5)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(row_to_json(t))
  INTO result
  FROM (
    SELECT
      id,
      name,
      company,
      next_follow_up,
      follow_up_note,
      pipeline_stage,
      priority
    FROM investor_contacts
    WHERE user_id = p_user_id
      AND (p_venture_id IS NULL OR venture_id = p_venture_id)
      AND next_follow_up IS NOT NULL
      AND is_archived = false
    ORDER BY next_follow_up ASC
    LIMIT p_limit
  ) t;

  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE valuation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own valuation history"
  ON valuation_history FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_valuation_history_user ON valuation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_valuation_history_venture ON valuation_history(venture_id);
CREATE INDEX IF NOT EXISTS idx_valuation_history_recorded ON valuation_history(recorded_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- GRANT PERMISSIONS
-- ═══════════════════════════════════════════════════════════════

GRANT EXECUTE ON FUNCTION get_dashboard_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_pipeline_funnel TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_activities TO authenticated;
GRANT EXECUTE ON FUNCTION get_upcoming_follow_ups TO authenticated;
