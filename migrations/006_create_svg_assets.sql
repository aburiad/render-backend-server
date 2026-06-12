-- Migration: Create svg_assets table for visual_grid questions
-- Purpose: Store SVG icons for primary education (fruits, shapes, animals, etc.)
-- Date: 2026-06-07

CREATE TABLE IF NOT EXISTS svg_assets (
  id BIGSERIAL PRIMARY KEY,
  asset_key TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  svg_content TEXT NOT NULL,
  preview_url TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE svg_assets ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read assets
CREATE POLICY "Authenticated users can read svg_assets"
  ON svg_assets FOR SELECT
  TO authenticated
  USING (true);

-- Service role can do everything
CREATE POLICY "Service role can manage svg_assets"
  ON svg_assets FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_svg_assets_category ON svg_assets(category);
CREATE INDEX IF NOT EXISTS idx_svg_assets_tags ON svg_assets USING GIN(tags);

-- Seed initial SVG assets for common items
INSERT INTO svg_assets (asset_key, category, svg_content, tags) VALUES
  -- Fruits
  ('apple', 'fruit', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.5 2 6 5 6 8c0 2.5 1.5 4 2 5s1 2.5 1 4c0 2-1 3-2 4s-2.5 1-4 1-3-1-4-2-1-2-1-4c0-1.5 1-2.5 1-4S7.5 2 12 2z"/></svg>', ARRAY['fruit', 'food', 'red']),
  ('banana', 'fruit', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 2c-2 0-4 1-5 3-1 2-1 4 0 6s2 3 3 5c1 2 0 4-1 5s-2 1-3 0-1-2-2-3c-1-1-1-3 0-5s1-4 2-6c1-2 3-3 6-3z"/></svg>', ARRAY['fruit', 'food', 'yellow']),
  ('orange', 'fruit', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>', ARRAY['fruit', 'food', 'orange', 'round']),
  ('mango', 'fruit', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><ellipse cx="12" cy="12" rx="9" ry="10"/></svg>', ARRAY['fruit', 'food', 'yellow']),

  -- Shapes
  ('star', 'shape', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>', ARRAY['shape', 'geometric']),
  ('circle', 'shape', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>', ARRAY['shape', 'geometric', 'round']),
  ('square', 'shape', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="20" height="20"/></svg>', ARRAY['shape', 'geometric']),
  ('triangle', 'shape', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2z"/></svg>', ARRAY['shape', 'geometric']),
  ('rectangle', 'shape', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="6" width="20" height="12"/></svg>', ARRAY['shape', 'geometric']),

  -- Animals
  ('cat', 'animal', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8 2 6 4 6 6v2H4c-1 0-2 1-2 2s1 2 2 2h2v6c0 3 2 5 5 5h4c3 0 5-2 5-5v-6h2c1 0 2-1 2-2s-1-2-2-2h-2V6c0-2-2-4-6-4z"/></svg>', ARRAY['animal', 'pet']),
  ('dog', 'animal', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C9 2 7 4 7 6v2H5c-1 0-2 1-2 2s1 2 2 2h2v6c0 3 2 5 5 5h4c3 0 5-2 5-5v-6h2c1 0 2-1 2-2s-1-2-2-2h-2V6c0-2-2-4-5-4z"/></svg>', ARRAY['animal', 'pet']),
  ('bird', 'animal', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8 2 5 4 5 7s1 5 3 6v5l4-2 4 2v-5c2-1 3-4 3-6s-3-5-7-5z"/></svg>', ARRAY['animal', 'flying']),

  -- School items
  ('book', 'school', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4v16l6-2 6 2V4l-6 2-6-2z"/></svg>', ARRAY['school', 'education', 'read']),
  ('pencil', 'school', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>', ARRAY['school', 'education', 'write']),
  ('bag', 'school', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2z"/></svg>', ARRAY['school', 'education', 'bag']),

  -- Nature
  ('sun', 'nature', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>', ARRAY['nature', 'weather', 'hot']),
  ('moon', 'nature', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>', ARRAY['nature', 'weather', 'night']),
  ('flower', 'nature', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-5-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>', ARRAY['nature', 'plant', 'garden']),
  ('tree', 'nature', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 20h16L12 2z"/></svg>', ARRAY['nature', 'plant', 'forest'])
ON CONFLICT (asset_key) DO NOTHING;

-- Add comments
COMMENT ON TABLE svg_assets IS 'SVG asset library for visual_grid questions in primary education';
COMMENT ON COLUMN svg_assets.asset_key IS 'Unique identifier for the asset (e.g., apple, star, triangle)';
COMMENT ON COLUMN svg_assets.category IS 'Category: fruit, shape, animal, school, nature, etc.';
COMMENT ON COLUMN svg_assets.svg_content IS 'Actual SVG code for rendering';
COMMENT ON COLUMN svg_assets.tags IS 'Searchable tags for filtering assets';
