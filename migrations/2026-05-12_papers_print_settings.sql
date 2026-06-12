-- Adds a JSONB column to store per-paper print preferences (font, size,
-- spacing, orientation, …). Single column keeps the schema flexible —
-- new preferences can be added without further migrations.
--
-- Run once in the Supabase SQL editor. Safe to re-run (IF NOT EXISTS).
alter table public.papers
  add column if not exists print_settings jsonb;

-- Optional: seed existing rows with the previous hard-coded defaults so the
-- frontend can rely on a non-null object. Skip if you'd rather let the
-- frontend supply defaults on the fly.
update public.papers
   set print_settings = jsonb_build_object(
         'font', 'Noto Serif Bengali',
         'size', '12pt',
         'spacing', '1.6',
         'orientation', 'portrait'
       )
 where print_settings is null;
