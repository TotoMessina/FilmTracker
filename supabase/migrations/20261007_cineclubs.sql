-- ==============================================================================
-- CINECLUBS (Clubes de Cine) - MIGRACIÓN PARA SUPABASE
-- ==============================================================================

-- 1. TABLA: CINECLUBS
CREATE TABLE IF NOT EXISTS public.cineclubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    current_movie_tmdb_id INTEGER REFERENCES public.movies(tmdb_id) ON DELETE SET NULL,
    voting_deadline TIMESTAMPTZ,
    discussion_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. TABLA: CINECLUB_MEMBERS
CREATE TABLE IF NOT EXISTS public.cineclub_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.cineclubs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    has_watched BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(club_id, user_id)
);

-- 3. TABLA: CINECLUB_POLLS
CREATE TABLE IF NOT EXISTS public.cineclub_polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.cineclubs(id) ON DELETE CASCADE,
    options JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array de { tmdb_id, title, poster_path, votes: string[] }
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TABLA: CINECLUB_MESSAGES
CREATE TABLE IF NOT EXISTS public.cineclub_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.cineclubs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_spoiler BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Índices de Rendimiento
CREATE INDEX IF NOT EXISTS idx_cineclubs_creator ON public.cineclubs(creator_id);
CREATE INDEX IF NOT EXISTS idx_cineclub_members_club ON public.cineclub_members(club_id);
CREATE INDEX IF NOT EXISTS idx_cineclub_members_user ON public.cineclub_members(user_id);
CREATE INDEX IF NOT EXISTS idx_cineclub_polls_club ON public.cineclub_polls(club_id);
CREATE INDEX IF NOT EXISTS idx_cineclub_messages_club ON public.cineclub_messages(club_id, created_at DESC);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.cineclubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cineclub_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cineclub_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cineclub_messages ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: CINECLUBS
DROP POLICY IF EXISTS "Cineclubs visibles para todos" ON public.cineclubs;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear cineclubs" ON public.cineclubs;
DROP POLICY IF EXISTS "Administradores o creador pueden actualizar cineclub" ON public.cineclubs;

CREATE POLICY "Cineclubs visibles para todos"
    ON public.cineclubs FOR SELECT
    USING (true);

CREATE POLICY "Usuarios autenticados pueden crear cineclubs"
    ON public.cineclubs FOR INSERT
    WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Administradores o creador pueden actualizar cineclub"
    ON public.cineclubs FOR UPDATE
    USING (auth.uid() = creator_id OR EXISTS (
        SELECT 1 FROM public.cineclub_members
        WHERE club_id = public.cineclubs.id AND user_id = auth.uid() AND role = 'admin'
    ));

-- POLÍTICAS: CINECLUB_MEMBERS
DROP POLICY IF EXISTS "Miembros visibles para todos" ON public.cineclub_members;
DROP POLICY IF EXISTS "Usuarios pueden unirse a cineclubs" ON public.cineclub_members;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio estado o admin del club" ON public.cineclub_members;
DROP POLICY IF EXISTS "Usuarios pueden salir del cineclub" ON public.cineclub_members;

CREATE POLICY "Miembros visibles para todos"
    ON public.cineclub_members FOR SELECT
    USING (true);

CREATE POLICY "Usuarios pueden unirse a cineclubs"
    ON public.cineclub_members FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar su propio estado o admin del club"
    ON public.cineclub_members FOR UPDATE
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.cineclub_members m
        WHERE m.club_id = public.cineclub_members.club_id AND m.user_id = auth.uid() AND m.role = 'admin'
    ));

CREATE POLICY "Usuarios pueden salir del cineclub"
    ON public.cineclub_members FOR DELETE
    USING (auth.uid() = user_id);

-- POLÍTICAS: CINECLUB_POLLS
DROP POLICY IF EXISTS "Votaciones visibles para todos" ON public.cineclub_polls;
DROP POLICY IF EXISTS "Miembros pueden crear o actualizar votaciones" ON public.cineclub_polls;

CREATE POLICY "Votaciones visibles para todos"
    ON public.cineclub_polls FOR SELECT
    USING (true);

CREATE POLICY "Miembros pueden crear o actualizar votaciones"
    ON public.cineclub_polls FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.cineclub_members
        WHERE club_id = public.cineclub_polls.club_id AND user_id = auth.uid()
    ));

-- POLÍTICAS: CINECLUB_MESSAGES
DROP POLICY IF EXISTS "Mensajes visibles para todos los usuarios" ON public.cineclub_messages;
DROP POLICY IF EXISTS "Miembros pueden enviar mensajes" ON public.cineclub_messages;

CREATE POLICY "Mensajes visibles para todos los usuarios"
    ON public.cineclub_messages FOR SELECT
    USING (true);

CREATE POLICY "Miembros pueden enviar mensajes"
    ON public.cineclub_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id AND EXISTS (
        SELECT 1 FROM public.cineclub_members
        WHERE club_id = public.cineclub_messages.club_id AND user_id = auth.uid()
    ));
