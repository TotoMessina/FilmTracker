-- ==============================================================================
-- AWARDS PREDICTIONS (Quiniela / Prode de los Oscars) - MIGRACIÓN
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.awards_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    season_year INTEGER NOT NULL,
    predictions JSONB NOT NULL DEFAULT '{}'::jsonb, -- Record<string, number> (categoría -> tmdb_id)
    score INTEGER NOT NULL DEFAULT 0,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, season_year)
);

CREATE INDEX IF NOT EXISTS idx_awards_predictions_season_year ON public.awards_predictions(season_year, score DESC);
CREATE INDEX IF NOT EXISTS idx_awards_predictions_user ON public.awards_predictions(user_id);

ALTER TABLE public.awards_predictions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Predicciones visibles para todos los usuarios" ON public.awards_predictions;
DROP POLICY IF EXISTS "Usuarios pueden crear sus propias predicciones" ON public.awards_predictions;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propias predicciones" ON public.awards_predictions;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propias predicciones" ON public.awards_predictions;

-- 1. Lectura pública (para el Leaderboard de la comunidad)
CREATE POLICY "Predicciones visibles para todos los usuarios"
    ON public.awards_predictions FOR SELECT
    USING (true);

-- 2. Inserción: sólo usuarios autenticados para su propio ID
CREATE POLICY "Usuarios pueden crear sus propias predicciones"
    ON public.awards_predictions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 3. Actualización: sólo el propio usuario
CREATE POLICY "Usuarios pueden actualizar sus propias predicciones"
    ON public.awards_predictions FOR UPDATE
    USING (auth.uid() = user_id);

-- 4. Eliminación: sólo el propio usuario
CREATE POLICY "Usuarios pueden eliminar sus propias predicciones"
    ON public.awards_predictions FOR DELETE
    USING (auth.uid() = user_id);

