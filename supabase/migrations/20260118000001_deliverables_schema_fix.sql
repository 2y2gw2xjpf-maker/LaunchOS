-- ============================================================
-- DELIVERABLES SCHEMA FIX
-- Add missing columns that the frontend expects
-- ============================================================

-- Add missing columns to deliverables table
DO $$
BEGIN
  -- Add description column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deliverables' AND column_name = 'description') THEN
    ALTER TABLE deliverables ADD COLUMN description TEXT;
  END IF;

  -- Add file_name column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deliverables' AND column_name = 'file_name') THEN
    ALTER TABLE deliverables ADD COLUMN file_name TEXT;
  END IF;

  -- Add file_size column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deliverables' AND column_name = 'file_size') THEN
    ALTER TABLE deliverables ADD COLUMN file_size INTEGER;
  END IF;

  -- Add generated_by column (ai, manual, template)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deliverables' AND column_name = 'generated_by') THEN
    ALTER TABLE deliverables ADD COLUMN generated_by TEXT DEFAULT 'ai';
  END IF;

  -- Add generation_params column (stores parameters used for generation)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deliverables' AND column_name = 'generation_params') THEN
    ALTER TABLE deliverables ADD COLUMN generation_params JSONB DEFAULT '{}';
  END IF;

  -- Add status column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deliverables' AND column_name = 'status') THEN
    ALTER TABLE deliverables ADD COLUMN status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'generating', 'completed', 'failed'));
  END IF;
END $$;

-- Add 'other' to deliverable_type enum if it doesn't exist
DO $$
BEGIN
  -- Check if enum exists and add 'other' if missing
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deliverable_type') THEN
    BEGIN
      ALTER TYPE deliverable_type ADD VALUE IF NOT EXISTS 'other';
    EXCEPTION WHEN duplicate_object THEN
      -- Value already exists, ignore
    END;
  END IF;
END $$;

-- Comment on columns for documentation
COMMENT ON COLUMN deliverables.description IS 'Human-readable description of the deliverable';
COMMENT ON COLUMN deliverables.file_name IS 'Original filename for downloads';
COMMENT ON COLUMN deliverables.file_size IS 'File size in bytes';
COMMENT ON COLUMN deliverables.generated_by IS 'How the deliverable was created: ai, manual, or template';
COMMENT ON COLUMN deliverables.generation_params IS 'Parameters/context used during AI generation';
COMMENT ON COLUMN deliverables.status IS 'Current status: pending, generating, completed, failed';
