-- Board Questions table for SSC/HSC board exam questions
-- Stores board exam questions with filtering by exam type, year, board, subject

CREATE TABLE IF NOT EXISTS board_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Filter dimensions
  exam_type TEXT NOT NULL CHECK (exam_type IN ('SSC', 'HSC')),
  year INTEGER NOT NULL,
  board TEXT NOT NULL, -- e.g. 'dhaka', 'comilla', 'jessore', 'all'
  subject TEXT NOT NULL, -- e.g. 'math', 'physics', 'chemistry'
  
  -- Question classification
  question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'cq', 'saq')),
  question_number INTEGER,
  
  -- Question content (flexible JSON to support MCQ/CQ/SAQ)
  question_data JSONB NOT NULL DEFAULT '{}',
  
  -- Metadata
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Unique constraint to prevent duplicates
  UNIQUE(exam_type, year, board, subject, question_type, question_number)
);

-- Index for fast filtering
CREATE INDEX IF NOT EXISTS idx_board_questions_filters 
  ON board_questions (exam_type, year, board, subject);

CREATE INDEX IF NOT EXISTS idx_board_questions_type 
  ON board_questions (question_type);

-- Enable RLS
ALTER TABLE board_questions ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read
CREATE POLICY "Authenticated users can read board questions"
  ON board_questions FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage board questions"
  ON board_questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Comment
COMMENT ON TABLE board_questions IS 'Board exam questions (SSC/HSC) filterable by exam, year, board, subject';