-- Add production_companies to movies table
ALTER TABLE movies 
ADD COLUMN IF NOT EXISTS production_companies jsonb;

-- Comment: This column will store an array of objects: {id, name, logo_path, origin_country}
