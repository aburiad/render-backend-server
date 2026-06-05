-- Add pdf_server_config column to subscription_config table
-- Run this in Supabase SQL Editor

ALTER TABLE subscription_config
ADD COLUMN IF NOT EXISTS pdf_server_config jsonb DEFAULT '{
  "active": "auto",
  "render_url": "https://proshno-shala-pdf.onrender.com",
  "hfspace_url": "https://riadahsan-proshno-shala-pdf.hf.space"
}'::jsonb;