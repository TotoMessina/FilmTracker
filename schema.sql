-- ==============================================================================
-- FILMTRACKER - ESQUEMA COMPLETO Y CONSOLIDADO PARA SUPABASE
-- ==============================================================================
-- Instrucciones:
-- 1. Ve a tu proyecto de Supabase -> SQL Editor.
-- 2. Pega y ejecuta todo este script.
-- 3. Recuerda actualizar tu URL y Anon Key en `js/config.js`.
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLA: PROFILES (Perfiles de Usuario)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    avatar_url TEXT,
    updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can see own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

CREATE POLICY "Profiles are viewable by everyone." 
    ON public.profiles FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert their own profile." 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);


-- ==============================================================================
-- 3. TABLA: MOVIES (Caché local de TMDB)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.movies (
    tmdb_id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    poster_path TEXT,
    backdrop_path TEXT,
    release_date DATE,
    runtime INTEGER, -- En minutos
    genres JSONB DEFAULT '[]'::jsonb, -- Array de {id, name}
    production_countries JSONB DEFAULT '[]'::jsonb, -- Array de {iso_3166_1, name}
    production_companies JSONB DEFAULT '[]'::jsonb, -- Array de {id, name, logo_path, origin_country}
    cast_data JSONB DEFAULT '[]'::jsonb, -- Array de {id, name, character, profile_path}
    vote_average NUMERIC,
    overview TEXT,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Si la tabla ya existía previamente con columnas faltantes, las añadimos de forma idempotente:
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS production_companies JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS cast_data JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Movies are viewable by everyone." ON public.movies;
DROP POLICY IF EXISTS "Authenticated users can insert movies." ON public.movies;
DROP POLICY IF EXISTS "Authenticated users can update movies." ON public.movies;

CREATE POLICY "Movies are viewable by everyone." 
    ON public.movies FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users can insert movies." 
    ON public.movies FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update movies." 
    ON public.movies FOR UPDATE 
    USING (auth.role() = 'authenticated');


-- ==============================================================================
-- 4. TABLA: LOGS (Diario de Películas Vistas)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tmdb_id INTEGER NOT NULL REFERENCES public.movies(tmdb_id) ON DELETE CASCADE,
    watched_at DATE DEFAULT CURRENT_DATE,
    rating NUMERIC CHECK (rating >= 0 AND rating <= 10), -- Escala 0 a 10
    review TEXT, -- Reseña pública
    notes TEXT, -- Notas privadas
    platform TEXT, -- Netflix, HBO, Cine, etc.
    format TEXT, -- 4K, IMAX, DVD, etc.
    company TEXT, -- Acompañamiento
    is_rewatch BOOLEAN DEFAULT false,
    custom_poster_path TEXT, -- Póster alternativo elegido por el usuario
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.logs ADD COLUMN IF NOT EXISTS custom_poster_path TEXT;

ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Logs viewable by everyone." ON public.logs;
DROP POLICY IF EXISTS "Logs are viewable by everyone." ON public.logs;
DROP POLICY IF EXISTS "Users can see own logs." ON public.logs;
DROP POLICY IF EXISTS "Users can insert their own logs." ON public.logs;
DROP POLICY IF EXISTS "Users can update their own logs." ON public.logs;
DROP POLICY IF EXISTS "Users can delete their own logs." ON public.logs;

CREATE POLICY "Logs are viewable by everyone." 
    ON public.logs FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert their own logs." 
    ON public.logs FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own logs." 
    ON public.logs FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logs." 
    ON public.logs FOR DELETE 
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS logs_user_id_idx ON public.logs(user_id);
CREATE INDEX IF NOT EXISTS logs_tmdb_id_idx ON public.logs(tmdb_id);
CREATE INDEX IF NOT EXISTS logs_watched_at_idx ON public.logs(watched_at DESC);
CREATE INDEX IF NOT EXISTS logs_created_at_idx ON public.logs(created_at DESC);


-- ==============================================================================
-- 5. TABLA: WATCHLIST (Películas por Ver)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.watchlist (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tmdb_id INTEGER NOT NULL REFERENCES public.movies(tmdb_id) ON DELETE CASCADE,
    title TEXT, -- Almacenado o autollenado para consultas directas
    added_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, tmdb_id)
);

ALTER TABLE public.watchlist ADD COLUMN IF NOT EXISTS title TEXT;

ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Watchlist viewable by everyone." ON public.watchlist;
DROP POLICY IF EXISTS "Watchlists are viewable by everyone." ON public.watchlist;
DROP POLICY IF EXISTS "Users can see own watchlist." ON public.watchlist;
DROP POLICY IF EXISTS "Users can insert into own watchlist." ON public.watchlist;
DROP POLICY IF EXISTS "Users can update own watchlist." ON public.watchlist;
DROP POLICY IF EXISTS "Users can delete from own watchlist." ON public.watchlist;

CREATE POLICY "Watchlist viewable by everyone." 
    ON public.watchlist FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert into own watchlist." 
    ON public.watchlist FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlist." 
    ON public.watchlist FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from own watchlist." 
    ON public.watchlist FOR DELETE 
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS watchlist_user_id_idx ON public.watchlist(user_id);
CREATE INDEX IF NOT EXISTS watchlist_added_at_idx ON public.watchlist(added_at DESC);


-- ==============================================================================
-- 6. TABLA: RELATIONSHIPS (Seguidores / Siguiendo)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.relationships (
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (follower_id, following_id)
);

ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Relationships are viewable by everyone." ON public.relationships;
DROP POLICY IF EXISTS "Users can follow others." ON public.relationships;
DROP POLICY IF EXISTS "Users can unfollow." ON public.relationships;

CREATE POLICY "Relationships are viewable by everyone." 
    ON public.relationships FOR SELECT 
    USING (true);

CREATE POLICY "Users can follow others." 
    ON public.relationships FOR INSERT 
    WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow." 
    ON public.relationships FOR DELETE 
    USING (auth.uid() = follower_id);

CREATE INDEX IF NOT EXISTS relationships_follower_idx ON public.relationships(follower_id);
CREATE INDEX IF NOT EXISTS relationships_following_idx ON public.relationships(following_id);


-- ==============================================================================
-- 7. TABLA: LOG_COMPANIONS (Acompañantes en visualizaciones)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.log_companions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id UUID NOT NULL REFERENCES public.logs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.log_companions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read log companions" ON public.log_companions;
DROP POLICY IF EXISTS "Users can add companions to their own logs" ON public.log_companions;
DROP POLICY IF EXISTS "Users can update companions of their own logs" ON public.log_companions;
DROP POLICY IF EXISTS "Users can delete companions of their own logs" ON public.log_companions;

CREATE POLICY "Public read log companions" 
    ON public.log_companions FOR SELECT 
    USING (true);

CREATE POLICY "Users can add companions to their own logs" 
    ON public.log_companions FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.logs 
            WHERE logs.id = log_companions.log_id 
            AND logs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update companions of their own logs" 
    ON public.log_companions FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.logs 
            WHERE logs.id = log_companions.log_id 
            AND logs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete companions of their own logs" 
    ON public.log_companions FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.logs 
            WHERE logs.id = log_companions.log_id 
            AND logs.user_id = auth.uid()
        )
    );

CREATE INDEX IF NOT EXISTS log_companions_log_id_idx ON public.log_companions(log_id);
CREATE INDEX IF NOT EXISTS log_companions_user_id_idx ON public.log_companions(user_id);


-- ==============================================================================
-- 8. TABLA: MESSAGES (Chat / Mensajería Directa)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can mark messages as read" ON public.messages;
DROP POLICY IF EXISTS "Users can delete sent messages" ON public.messages;

CREATE POLICY "Users can read their own messages" 
    ON public.messages FOR SELECT 
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" 
    ON public.messages FOR INSERT 
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark messages as read" 
    ON public.messages FOR UPDATE 
    USING (auth.uid() = receiver_id);

CREATE POLICY "Users can delete sent messages" 
    ON public.messages FOR DELETE 
    USING (auth.uid() = sender_id);

CREATE INDEX IF NOT EXISTS messages_conversation_idx ON public.messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS messages_unread_idx ON public.messages(receiver_id, is_read);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at ASC);


-- ==============================================================================
-- 9. TABLA: USER_BADGES (Gamificación y Logros)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_badges (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_code TEXT NOT NULL, -- 'NEWBIE', 'FAN', 'CRITIC', 'MARATHON', 'GLOBETROTTER'
    earned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, badge_code)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Badges viewable by everyone." ON public.user_badges;
DROP POLICY IF EXISTS "System/Users can insert own badges." ON public.user_badges;
DROP POLICY IF EXISTS "Users can insert own badges." ON public.user_badges;

CREATE POLICY "Badges viewable by everyone." 
    ON public.user_badges FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert own badges." 
    ON public.user_badges FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS user_badges_user_id_idx ON public.user_badges(user_id);


-- ==============================================================================
-- 10. TABLA: HIDDEN_ITEMS (Blacklist / Ocultar de Recomendaciones)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.hidden_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tmdb_id INTEGER NOT NULL,
    media_type TEXT DEFAULT 'movie',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (user_id, tmdb_id)
);

ALTER TABLE public.hidden_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own hidden items." ON public.hidden_items;
DROP POLICY IF EXISTS "Users can insert own hidden items." ON public.hidden_items;
DROP POLICY IF EXISTS "Users can delete own hidden items." ON public.hidden_items;

CREATE POLICY "Users can view own hidden items." 
    ON public.hidden_items FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hidden items." 
    ON public.hidden_items FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own hidden items." 
    ON public.hidden_items FOR DELETE 
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS hidden_items_user_id_idx ON public.hidden_items(user_id);


-- ==============================================================================
-- 11. VISTA: DIARY_LOGS (Utilizada en Recomendaciones y Feed Inteligente)
-- ==============================================================================
CREATE OR REPLACE VIEW public.diary_logs WITH (security_invoker = true) AS
SELECT 
    l.id,
    l.user_id,
    l.tmdb_id,
    m.title,
    m.poster_path,
    l.watched_at AS watched_date,
    l.watched_at,
    l.rating,
    l.review,
    l.notes,
    l.platform,
    l.format,
    l.company,
    l.is_rewatch,
    l.custom_poster_path,
    l.created_at
FROM public.logs l
LEFT JOIN public.movies m ON l.tmdb_id = m.tmdb_id;

-- Permisos para que PostgREST y usuarios autenticados / anónimos puedan consultar la vista
GRANT SELECT ON public.diary_logs TO anon, authenticated;


-- ==============================================================================
-- 12. TRIGGERS Y FUNCIONES AUTOMÁTICAS
-- ==============================================================================

-- A) Autocrear perfil cuando un usuario se registra en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    raw_username TEXT;
    final_username TEXT;
BEGIN
    raw_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        split_part(NEW.email, '@', 1),
        'user_' || SUBSTRING(NEW.id::text, 1, 8)
    );
    final_username := raw_username;

    -- Si el username ya existe, añade un sufijo corto para evitar colisión
    IF EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) THEN
        final_username := raw_username || '_' || SUBSTRING(NEW.id::text, 1, 4);
    END IF;

    INSERT INTO public.profiles (id, username, avatar_url)
    VALUES (
        NEW.id,
        final_username,
        COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            'https://ui-avatars.com/api/?name=' || final_username || '&background=random'
        )
    )
    ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = NOW();

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Fallback seguro para no bloquear el registro del usuario
    INSERT INTO public.profiles (id, username, avatar_url)
    VALUES (
        NEW.id,
        'user_' || SUBSTRING(NEW.id::text, 1, 8),
        'https://ui-avatars.com/api/?name=User&background=random'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- B) Autollenar título en watchlist a partir de la tabla movies si no se provee
CREATE OR REPLACE FUNCTION public.handle_watchlist_title()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.title IS NULL THEN
        SELECT title INTO NEW.title FROM public.movies WHERE tmdb_id = NEW.tmdb_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_watchlist_title ON public.watchlist;
CREATE TRIGGER trg_watchlist_title
    BEFORE INSERT OR UPDATE ON public.watchlist
    FOR EACH ROW EXECUTE PROCEDURE public.handle_watchlist_title();


-- ==============================================================================
-- 13. CONFIGURACIÓN DE REALTIME (Para chat y notificaciones instantáneas)
-- ==============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    END IF;
END $$;

-- ==============================================================================
-- 14. COLECCIONES DE PELÍCULAS DE USUARIOS (user_collections)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_collections (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    cover_poster_path TEXT,
    movies JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_user_collections_user_id ON public.user_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_created_at ON public.user_collections(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.user_collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Colecciones visibles para todos los usuarios" ON public.user_collections;
DROP POLICY IF EXISTS "Los usuarios pueden crear sus propias colecciones" ON public.user_collections;
DROP POLICY IF EXISTS "Los usuarios pueden editar sus propias colecciones" ON public.user_collections;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus propias colecciones" ON public.user_collections;

-- Políticas de RLS:
-- 1. Lectura pública (seguidores y cualquier usuario autenticado pueden ver las colecciones)
CREATE POLICY "Colecciones visibles para todos los usuarios"
    ON public.user_collections FOR SELECT
    USING (true);

-- 2. Inserción: sólo el dueño
CREATE POLICY "Los usuarios pueden crear sus propias colecciones"
    ON public.user_collections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 3. Actualización: sólo el dueño
CREATE POLICY "Los usuarios pueden editar sus propias colecciones"
    ON public.user_collections FOR UPDATE
    USING (auth.uid() = user_id);

-- 4. Eliminación: sólo el dueño
CREATE POLICY "Los usuarios pueden eliminar sus propias colecciones"
    ON public.user_collections FOR DELETE
    USING (auth.uid() = user_id);

-- ==============================================================================
-- 15. WATCHLISTS COMPARTIDAS (shared_watchlists)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.shared_watchlists (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    members JSONB DEFAULT '[]'::jsonb,
    movies JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_shared_watchlists_created_by ON public.shared_watchlists(created_by);
CREATE INDEX IF NOT EXISTS idx_shared_watchlists_updated_at ON public.shared_watchlists(updated_at DESC);

-- Habilitar RLS
ALTER TABLE public.shared_watchlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Shared watchlists son visibles para todos los usuarios" ON public.shared_watchlists;
DROP POLICY IF EXISTS "Usuarios pueden crear watchlists compartidas" ON public.shared_watchlists;
DROP POLICY IF EXISTS "Participantes pueden actualizar watchlists compartidas" ON public.shared_watchlists;
DROP POLICY IF EXISTS "Creador puede eliminar su watchlist compartida" ON public.shared_watchlists;

-- Políticas de RLS:
-- 1. Lectura pública / entre participantes
CREATE POLICY "Shared watchlists son visibles para todos los usuarios"
    ON public.shared_watchlists FOR SELECT
    USING (true);

-- 2. Inserción: sólo usuarios autenticados
CREATE POLICY "Usuarios pueden crear watchlists compartidas"
    ON public.shared_watchlists FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- 3. Actualización: participantes o creador
CREATE POLICY "Participantes pueden actualizar watchlists compartidas"
    ON public.shared_watchlists FOR UPDATE
    USING (true);

-- 4. Eliminación: sólo el creador
CREATE POLICY "Creador puede eliminar su watchlist compartida"
    ON public.shared_watchlists FOR DELETE
    USING (auth.uid() = created_by);

-- Fin del script

