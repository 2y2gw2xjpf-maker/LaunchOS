-- ============================================================
-- CHAT MESSAGES SCHEMA FIX
-- Add missing columns for tool_calls and tool_results
-- ============================================================

-- Add missing columns to chat_messages table
DO $$
BEGIN
  -- Add tool_calls column for storing Claude tool calls
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'tool_calls') THEN
    ALTER TABLE chat_messages ADD COLUMN tool_calls JSONB;
  END IF;

  -- Add tool_results column for storing tool execution results
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'tool_results') THEN
    ALTER TABLE chat_messages ADD COLUMN tool_results JSONB;
  END IF;

  -- Add attachments column for file attachments
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'attachments') THEN
    ALTER TABLE chat_messages ADD COLUMN attachments JSONB;
  END IF;
END $$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created
  ON chat_messages(session_id, created_at);

-- Comment on columns for documentation
COMMENT ON COLUMN chat_messages.tool_calls IS 'Claude tool calls made during this message';
COMMENT ON COLUMN chat_messages.tool_results IS 'Results from tool executions';
COMMENT ON COLUMN chat_messages.attachments IS 'File attachments (images, documents)';
