-- Migration: Extend vault_questions for Nursery-Class 5
-- Purpose: Add support for primary education question types and class range 0-5
-- Date: 2026-06-07

-- Drop existing constraint if it exists (for idempotency)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'vault_questions_question_type_check'
  ) THEN
    ALTER TABLE vault_questions DROP CONSTRAINT vault_questions_question_type_check;
  END IF;
END $$;

-- Add new expanded question type constraint
ALTER TABLE vault_questions
ADD CONSTRAINT vault_questions_question_type_check
CHECK (question_type IN ('mcq', 'cq', 'saq', 'parent_passage', 'column_matching', 'visual_grid', 'standard_text'));

-- Create index for primary class range (0-5) for faster lookups
CREATE INDEX IF NOT EXISTS idx_vault_primary_class
ON vault_questions(class_num) WHERE class_num <= 5;

-- Add comment for clarity
COMMENT ON COLUMN vault_questions.class_num IS 'Class level: 0=Nursery, 1-5=Primary, 6-10=Secondary';
COMMENT ON COLUMN vault_questions.question_type IS 'Question type: mcq, cq, saq, parent_passage, column_matching, visual_grid, standard_text';
