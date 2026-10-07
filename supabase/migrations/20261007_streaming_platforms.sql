-- ==============================================================================
-- STREAMING PLATFORMS POR USUARIO - MIGRACIÓN PARA SUPABASE
-- ==============================================================================

-- Añadir columna streaming_platforms a la tabla public.profiles si no existe
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streaming_platforms INTEGER[] DEFAULT '{}'::integer[];

-- Comentario explicativo
COMMENT ON COLUMN public.profiles.streaming_platforms IS 'Array de IDs de TMDB correspondientes a las plataformas de streaming activas del usuario (ej: 8 para Netflix, 337 para Disney+, 119 para Prime Video, etc.)';
