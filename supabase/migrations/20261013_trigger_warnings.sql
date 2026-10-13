-- ==========================================================
-- Migration: Trigger Warnings & Sensitive Content Detector
-- ==========================================================

CREATE TABLE IF NOT EXISTS trigger_warnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id integer NOT NULL,
  category text NOT NULL,  -- ej. 'animal_death', 'jump_scares', 'graphic_violence', 'sexual_content', 'suicide_theme', 'child_peril', 'family_unfriendly'
  label text NOT NULL,     -- ej. '⚠️ Muerte de mascotas en pantalla'
  source text NOT NULL,    -- 'community' | 'ai'
  reported_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  upvotes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Table to track unique votes per user to prevent duplicate upvotes
CREATE TABLE IF NOT EXISTS trigger_warning_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warning_id uuid NOT NULL REFERENCES trigger_warnings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_warning_user_vote UNIQUE(warning_id, user_id)
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_trigger_warnings_tmdb ON trigger_warnings(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_trigger_warnings_reported_by ON trigger_warnings(reported_by, tmdb_id);
CREATE INDEX IF NOT EXISTS idx_trigger_warning_votes_warning ON trigger_warning_votes(warning_id);

-- Row Level Security (RLS)
ALTER TABLE trigger_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE trigger_warning_votes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read trigger warnings
CREATE POLICY "Public read trigger_warnings" 
  ON trigger_warnings FOR SELECT 
  USING (true);

-- Allow authenticated users and service role to insert warnings
CREATE POLICY "Authenticated users insert trigger_warnings" 
  ON trigger_warnings FOR INSERT 
  WITH CHECK (true);

-- Allow update upvotes
CREATE POLICY "Allow update upvotes trigger_warnings" 
  ON trigger_warnings FOR UPDATE 
  USING (true);

-- Allow votes table access
CREATE POLICY "Public read trigger_warning_votes" 
  ON trigger_warning_votes FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users insert trigger_warning_votes" 
  ON trigger_warning_votes FOR INSERT 
  WITH CHECK (true);
