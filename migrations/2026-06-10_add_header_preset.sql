-- Add header_preset column to papers table
-- Stores the selected header preset style (school_classic, primary_classic, kids_illustrated, modern_academy, nctb_board)
ALTER TABLE papers
ADD COLUMN IF NOT EXISTS header_preset text DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN papers.header_preset IS 'Header preset style: school_classic, primary_classic, kids_illustrated, modern_academy, nctb_board, or null for auto-detect';
