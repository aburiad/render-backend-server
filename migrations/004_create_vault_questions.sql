-- Vault Questions Table
-- Stores pre-built, verified questions per chapter for the "Add to Cart" feature.
-- These are textbook-based, human-reviewed questions (200 MCQ + 100 CQ + 100 Short per chapter).

CREATE TABLE IF NOT EXISTS vault_questions (
  id BIGSERIAL PRIMARY KEY,
  class_num INTEGER NOT NULL,
  subject TEXT NOT NULL DEFAULT 'math',
  chapter_id TEXT NOT NULL,
  chapter_title_bn TEXT,
  chapter_title_en TEXT,
  question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'cq', 'saq')),
  question_number INTEGER,
  question_data JSONB NOT NULL DEFAULT '{}',
  source TEXT DEFAULT 'vault',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_num, subject, chapter_id, question_type, question_number)
);

-- RLS: Authenticated users can read, only service_role can write
ALTER TABLE vault_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read vault_questions"
  ON vault_questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can do everything"
  ON vault_questions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_vault_class_subject ON vault_questions(class_num, subject);
CREATE INDEX IF NOT EXISTS idx_vault_chapter ON vault_questions(class_num, subject, chapter_id);
CREATE INDEX IF NOT EXISTS idx_vault_type ON vault_questions(question_type);