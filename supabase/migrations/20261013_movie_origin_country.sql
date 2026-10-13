-- NULL means not yet enriched; [] means TMDB has no known origin.
-- Never backfill this field from production_countries: they are different concepts.
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS origin_country text[];
COMMENT ON COLUMN public.movies.origin_country IS 'TMDB origin_country; independent of production countries and filming locations.';
NOTIFY pgrst, 'reload schema';
