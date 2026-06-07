-- Add metadata column to papers table for storing additional paper-level data
-- This will store things like 'level' (primary/higher) and other metadata

ALTER TABLE papers
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT false;

-- Create index on deleted for faster queries
CREATE INDEX IF NOT EXISTS idx_papers_deleted ON papers(deleted) WHERE deleted = false;

-- Comment
COMMENT ON COLUMN papers.metadata IS 'Additional paper metadata (e.g., level: "primary"|"higher")';
