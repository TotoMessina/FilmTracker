# FilmTracker — Documentación Completa del Proyecto (v1.0 Vanilla JS)

> Generado el 2026-09-29 antes de la migración a React.
> Este archivo preserva todas las funcionalidades, flujos, estructura de datos y decisiones de diseño del proyecto original en Vanilla JS + Supabase.

---

## 1. Visión General

**FilmTracker** es una aplicación web tipo "Diario de Cine" personal y social, comparable a Letterboxd pero más enfocada en la experiencia del usuario individual con capas de gamificación y comunidad.

### Stack Tecnológico (v1 - Vanilla JS)
| Capa | Tecnología |
|------|-----------|
| Frontend | HTML5, CSS3, JavaScript ES6+ Modules |
| Backend / DB | Supabase (PostgreSQL + Auth + Realtime) |
| API de Películas | TMDB (The Movie Database) |
| Gráficos | Chart.js |
| Mapa | Leaflet.js (cargado dinámicamente) |
| Tipografías | Google Fonts: Inter, Outfit |
| Iconos | Font Awesome 6 |

### Credenciales configuradas (js/config.js)
```javascript
export const CONFIG = {
    TMDB_API_KEY: '31841cf8ea5ec78f32d856ec6e773ea0',
    TMDB_READ_TOKEN: 'eyJhbGciOiJIUzI1NiJ9...',
    SUPABASE_URL: 'https://prakhmvsmwsdixulifkk.supabase.co',
    SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    TMDB_BASE_URL: 'https://api.themoviedb.org/3',
    TMDB_IMAGE_BASE: 'https://image.tmdb.org/t/p/w500',
    TMDB_BACKDROP_BASE: 'https://image.tmdb.org/t/p/original'
};
```

---

## 2. Arquitectura del Proyecto (v1)

```
FilmTracker-main/
├── index.html              # Landing page / Login + Registro
├── app.html                # Shell principal de la app (SPA)
├── schema.sql              # UNICO ARCHIVO CONSERVADO (schema consolidado)
├── css/
│   └── style.css           # Estilos globales + variables CSS
└── js/
    ├── config.js            # Credenciales API
    ├── supabase-client.js   # Singleton del cliente Supabase
    ├── auth.js              # Lógica de Login / Registro
    ├── tmdb-api.js          # Wrapper para TMDB API
    ├── app.js               # Router principal + lógica global (1148 líneas)
    └── features/
        ├── dashboard.js     # Dashboard principal
        ├── diary.js         # Diario de películas vistas
        ├── logging.js       # Modal de registro/edición de película
        ├── watchlist.js     # Lista de películas pendientes
        ├── stats.js         # Estadísticas y gráficos
        ├── social.js        # Comunidad, búsqueda y sugerencias
        ├── chat.js          # Mensajería directa en tiempo real
        ├── badges.js        # Sistema de logros/badges
        ├── connections.js   # Actores frecuentes ("Conexiones")
        ├── awards.js        # Tracker de premios (Oscars)
        ├── map.js           # Mapa de países de películas
        ├── tournament.js    # Torneo de películas tipo bracket
        ├── ticket.js        # Ticket visual para películas en cine
        ├── movie_details.js # Modal de detalle de película
        └── blacklist.js     # Lista negra / películas ocultas
```

---

## 3. Base de Datos (Supabase / PostgreSQL)

### Tablas

#### `profiles`
Creada automáticamente vía trigger al registrarse en Supabase Auth.
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID PK | FK → auth.users |
| `username` | TEXT UNIQUE | Derivado del email al registrarse |
| `avatar_url` | TEXT | URL de avatar (ui-avatars.com por defecto) |
| `updated_at` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |

#### `movies`
Caché local de datos de TMDB para evitar llamadas a la API en cada consulta.
| Columna | Tipo | Notas |
|---------|------|-------|
| `tmdb_id` | INTEGER PK | ID de TMDB |
| `title` | TEXT | |
| `poster_path` | TEXT | |
| `backdrop_path` | TEXT | |
| `release_date` | DATE | |
| `runtime` | INTEGER | En minutos |
| `genres` | JSONB | [{id, name}] |
| `production_countries` | JSONB | [{iso_3166_1, name}] |
| `production_companies` | JSONB | [{id, name, logo_path, origin_country}] |
| `cast_data` | JSONB | [{id, name, character, profile_path}] — top 10 actores |
| `vote_average` | NUMERIC | |
| `overview` | TEXT | |
| `updated_at` | TIMESTAMPTZ | |

#### `logs`
El núcleo de la app — cada entrada es un "Yo vi esta película".
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK | → profiles |
| `tmdb_id` | INTEGER FK | → movies |
| `watched_at` | DATE | DEFAULT CURRENT_DATE |
| `rating` | NUMERIC | 0 a 10, pasos de 0.5 |
| `review` | TEXT | Reseña pública |
| `notes` | TEXT | Notas privadas |
| `platform` | TEXT | Netflix / HBO Max / Disney+ / Prime Video / Cine / Archivo |
| `format` | TEXT | Normal / 4K / IMAX / DVD / Proyección |
| `company` | TEXT | Legado, reemplazado por log_companions |
| `is_rewatch` | BOOLEAN | DEFAULT false |
| `custom_poster_path` | TEXT | Póster alternativo elegido por el usuario |
| `created_at` | TIMESTAMPTZ | |

#### `watchlist`
| Columna | Tipo | Notas |
|---------|------|-------|
| `user_id` | UUID PK FK | → profiles |
| `tmdb_id` | INTEGER PK FK | → movies |
| `title` | TEXT | Autollenado por trigger desde movies |
| `added_at` | TIMESTAMPTZ | |

#### `relationships`
Grafo social (seguidores / siguiendo).
| Columna | Tipo | Notas |
|---------|------|-------|
| `follower_id` | UUID PK FK | → profiles |
| `following_id` | UUID PK FK | → profiles |
| `created_at` | TIMESTAMPTZ | |

#### `log_companions`
"Con quién la viste" — usuarios etiquetados en un log.
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID PK | |
| `log_id` | UUID FK | → logs |
| `user_id` | UUID FK | → profiles |
| `created_at` | TIMESTAMPTZ | |

#### `messages`
Chat privado entre usuarios.
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID PK | |
| `sender_id` | UUID FK | → profiles |
| `receiver_id` | UUID FK | → profiles |
| `content` | TEXT | |
| `is_read` | BOOLEAN | DEFAULT false |
| `created_at` | TIMESTAMPTZ | |

#### `user_badges`
Logros desbloqueados.
| Columna | Tipo | Notas |
|---------|------|-------|
| `user_id` | UUID PK FK | → profiles |
| `badge_code` | TEXT PK | Ver lista en sección 5.15 |
| `earned_at` | TIMESTAMPTZ | |

#### `hidden_items`
Lista negra — películas ocultas de las recomendaciones.
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK | → profiles |
| `tmdb_id` | INTEGER | Sin FK a movies, puede ser de TMDB directo |
| `media_type` | TEXT | DEFAULT 'movie' |
| `created_at` | TIMESTAMPTZ | |

### Vista: `diary_logs`
Vista denormalizada que une `logs` con `movies`. Usada por el motor de recomendaciones en `app.js`.
Expone: `id, user_id, tmdb_id, title, poster_path, watched_date (alias de watched_at), watched_at, rating, review, notes, platform, format, company, is_rewatch, custom_poster_path, created_at`

### Triggers
- **`on_auth_user_created`**: Al crear un usuario en `auth.users`, automáticamente crea su fila en `public.profiles` con username derivado del email.
- **`trg_watchlist_title`**: Al insertar en `watchlist`, si `title` es null, lo rellena desde `movies`.

### Realtime
- La tabla `messages` está publicada en `supabase_realtime` para el chat en tiempo real.

---

## 4. Flujos de Autenticación

### Registro (`auth.js`)
1. Usuario ingresa email + contraseña en `index.html`.
2. Se llama a `supabase.auth.signUp()` con `options.data = { username, avatar_url }`.
3. El trigger `handle_new_user()` crea automáticamente la fila en `profiles`.
4. Username = parte antes del `@` del email.
5. Avatar = URL generada con `ui-avatars.com`.

### Login (`auth.js`)
1. `supabase.auth.signInWithPassword({ email, password })`.
2. Si éxito → redirect a `app.html`.
3. Al cargar `app.html` si no hay sesión → redirect a `index.html`.

### Sesión persistente
- Supabase guarda la sesión en `localStorage` automáticamente.
- `app.js` verifica sesión al iniciar con `supabase.auth.getSession()`.

---

## 5. Funcionalidades y Flujos Detallados

### 5.1 Dashboard (`features/dashboard.js`)

**Vista principal al entrar a la app.**

**Flujo:**
1. Fetch paralelo de:
   - Trending movies del día (TMDB)
   - Estadísticas rápidas del usuario (películas vistas, minutos, racha)
   - Actividad reciente de usuarios seguidos (feed social)
2. Renderiza:
   - **Hero**: Primera película en tendencia con backdrop full-width y gradiente
   - **Quick Stats**: Cards con película count, minutos totales, racha de días
   - **Trending Slider**: Carousel horizontal de películas trending
   - **Community Hub**: Feed de actividad de amigos

**Stats calculadas:**
- `watchedCount`: COUNT de logs del usuario
- `totalRuntime`: Estimación (watchedCount x 100 minutos como aproximación legacy)
- `streak`: Días consecutivos con al menos 1 log en los últimos 10 dias

---

### 5.2 Búsqueda y Descubrimiento (`app.js` — view "search")

**Modos de búsqueda implementados:**
- **`search`**: Búsqueda directa por texto en TMDB
- **`smart`**: Recomendaciones basadas en historial del usuario (toma película aleatoria del diario/watchlist como semilla)
- **`recommendations_log`**: Basado en la última película vista
- **`recommendations_wl`**: Basado en ítem aleatorio de la watchlist
- **`trending`**: Tendencias (día/semana)
- **`top_rated`**: Top rated de TMDB
- **`discover`**: Descubrimiento con filtros avanzados

**Filtros Avanzados (modal):**
- Ordenar por: popularidad, calificación, fecha (asc/desc), recaudación
- Año de lanzamiento (1900 - actual)
- Plataforma de streaming: Netflix (8), Disney+ (337), Prime (119), Max (1899), Apple TV+ (350)
- Género (28 géneros disponibles)

**Infinite scroll**: Al llegar al fondo de la página, carga más resultados (paginación automática).

**Blacklist**: Las películas en `hidden_items` del usuario se filtran del grid. Botón de "ocultar" en cada card.

**UI de cada Movie Card:**
- Póster de TMDB
- Título + año + rating
- Botón "Log" → abre `openLogModal()`
- Botón "Watchlist" → `addToWatchlist()`
- Botón "Más info" → `openMovieDetails()`
- Botón "Ocultar" → `addToBlacklist()`

---

### 5.3 Detalle de Película (`features/movie_details.js`)

**Modal de detalle completo.**

**Fetch de TMDB:**
- `getMovieDetails(id)` con `append_to_response=credits,watch/providers,keywords`
- Reviews de otros usuarios de FilmTracker (de tabla `logs` con review no nula)

**Contenido renderizado:**
- Backdrop hero con gradiente + póster + título + año + duración + rating TMDB
- Sinopsis (overview)
- Géneros como pills
- Plataformas de streaming disponibles (watch/providers, región MX)
- Elenco: top 10 actores con foto y personaje
- Reseñas de usuarios de FilmTracker (rating + review + avatar + username)
- Películas similares (carousel)
- Alerta visual si tiene escena post-créditos (via keywords TMDB: id 179430 o 179431)

**Acciones:**
- **"Registrar / Puntuar"** → `openLogModal(tmdbId)`
- **"Watchlist"** → `addToWatchlist(tmdbId, movieData)`

---

### 5.4 Registro de Película — Log Modal (`features/logging.js`)

**El corazón de la app. Modal para registrar o editar una entrada en el diario.**

**Flujo de apertura:**
1. `openLogModal(tmdbId, existingLog?)` — si se pasa `existingLog` es modo edición
2. Fetch de detalles de la película en TMDB
3. Fetch de acompañantes existentes (si es edición) de `log_companions`
4. Fetch de seguidores del usuario para el "Con quién la viste" (via `getFollowers()`)
5. Detecta si la película tiene escena post-créditos (keywords TMDB)
6. Renderiza el formulario

**Campos del formulario:**
| Campo | Tipo | Notas |
|-------|------|-------|
| `watched_at` | date | DEFAULT: hoy |
| `is_rewatch` | checkbox | ¿Es rewatch? |
| `rating` | number (0-10, step 0.5) | Tu puntuación |
| `platform` | select | Netflix, HBO Max, Disney+, Prime Video, Cine, Archivo |
| `format` | select | Normal, 4K, IMAX, DVD, Proyección |
| `review` | textarea | Reseña pública |
| `notes` | textarea | Notas privadas |
| `companion` | checkboxes | Usuarios seguidores a etiquetar (log_companions) |

**Feature: Cambio de póster**
- Botón "Cambiar" sobre el póster del formulario
- Abre `getMovieImages(tmdbId)` → muestra grid de pósters alternativos
- El usuario puede elegir un póster distinto (`custom_poster_path`)

**Flujo de guardado:**
1. Upsert de `movieData` en tabla `movies` (cache TMDB local)
2. Si es edición → UPDATE en `logs` + DELETE de `log_companions` anteriores
3. Si es nuevo → INSERT en `logs` + INSERT en `log_companions`
4. Trigger de `checkAndUnlockBadges(userId)` (async, sin bloquear)
5. Alerta "Guardado!"
6. Cierre del modal

---

### 5.5 Diario (`features/diary.js`)

**Vista tabla del historial completo.**

```sql
SELECT logs.*, movies.*
FROM logs JOIN movies ON logs.tmdb_id = movies.tmdb_id
WHERE logs.user_id = $userId
ORDER BY watched_at DESC
```

**Columnas de la tabla UI:**
- Póster (custom o default)
- Título + badge "Rewatch" si aplica
- Fecha de visualización
- Rating con color según valor (verde ≥8, amarillo ≥5, rojo <5)
- Plataforma
- Icono de edición / Botón ticket (si platform === 'Cine')

**Soporte de perfil ajeno:** `renderDiary(containerId, targetUserId)` — sin edición si no es el dueño.

---

### 5.6 Watchlist (`features/watchlist.js`)

**Lista de películas pendientes de ver.**

```sql
SELECT watchlist.*, movies.*
FROM watchlist JOIN movies ON watchlist.tmdb_id = movies.tmdb_id
WHERE watchlist.user_id = $userId
ORDER BY added_at DESC
```

**Funciones:**
- `addToWatchlist(tmdbId, movieData)`: Upsert en `movies` + insert en `watchlist`
- `renderWatchlist(containerId)`: Renderiza grid con filtro de tiempo
- `removeFromWatchlist(tmdbId)`: Delete de la watchlist

**Filtro por tiempo disponible:**
- Tabs: Todas, <90 min, <120 min, <180 min, <240 min (filtra por `movie.runtime`)

**Feature: Película Aleatoria**
- Botón "¿Qué veo hoy?" → selecciona aleatoriamente de la lista filtrada

---

### 5.7 Estadísticas (`features/stats.js`)

**Panel de estadísticas con Chart.js.**

**Stats calculadas:**
1. **Tiempo de Vida** — Total de minutos/horas/días de películas vistas
2. **Distribución de Géneros** — Gráfico de donut con top 8 géneros
3. **Historial de Ratings** — Gráfico de barras / línea temporal
4. **Películas por Mes** — Gráfico de barras de actividad mensual
5. **Plataformas favoritas** — Desglose por donde ve más
6. **País de origen** — Distribución geográfica
7. **Logros (Badges)** — Grid de badges desbloqueados/bloqueados

**Soporte de perfil ajeno:** `renderStats(containerId, targetUserId)`

---

### 5.8 Comunidad y Social (`features/social.js`)

#### Vista Principal — dos secciones:
1. **"Almas Gemelas del Cine"** — Sugerencias de usuarios con gustos similares
2. **Búsqueda de usuarios** — Input para buscar por username (ilike en profiles)

#### Sistema de Sugerencias (`getSuggestedUsers()`)
**Algoritmo:**
1. Toma las películas del usuario con rating >= 8 (últimas 30)
2. Busca otros usuarios que también hayan puntuado esas películas con >= 8
3. Agrupa por usuario → cuenta películas en común
4. Excluye usuarios ya seguidos
5. Fallback: añade usuarios aleatorios si hay pocos matches
6. Para cada candidato calcula "% de compatibilidad" via `calculateCompatibility()`

**`calculateCompatibility(uid1, uid2)`:**
- Busca películas en común con rating >= 6 de ambos
- Calcula intersección de géneros favoritos
- Devuelve % basado en overlap (max 100%)

#### Perfil de Usuario (`app.js` — hash `#profile?id=X`)
- Header con avatar, username, contadores de seguidores/siguiendo
- Botón Follow/Unfollow
- Badge "Te sigue" / "Mutuo"
- Tabs: Diario | Estadísticas | Watchlist del usuario seleccionado

#### Funciones de Red Social
- `toggleFollow(targetUserId)` — Follow/Unfollow con check de existencia previa
- `getRelationshipStatus(targetUserId)` — Retorna `{ isMe, isFollowing, isFollower }`
- `getNetworkCounts(userId)` — Cuenta seguidores y siguiendo
- `getFollowers(userId)` / `getFollowing(userId)` — Lista de perfiles
- `getFriendsActivity()` — Feed de actividad de usuarios seguidos (últimos 20 logs)

---

### 5.9 Chat (`features/chat.js`)

**Mensajería directa en tiempo real.**

#### Flujo Desktop
1. `renderChatList()` — Sidebar con lista de usuarios que el usuario sigue
2. Click en usuario → `renderConversation(targetUserId)`
3. Se renderiza el chat en el panel derecho (`chatArea`)

#### Flujo Mobile
- Click en usuario → `openChatModal(targetUserId)` — modal fullscreen

#### `renderChatIntoContainer(container, targetUserId, isModal)`
1. Fetch perfil del destinatario
2. Fetch historial de mensajes (últimos 50, ordenados ASC por `created_at`)
3. Marca mensajes no leídos como leídos (`UPDATE messages SET is_read = true`)
4. Renderiza burbujas de chat (estilo iMessage: propio a la derecha, ajeno a la izquierda)
5. Scroll automático al último mensaje

#### Realtime (`setupRealtime`)
- Subscripción a `postgres_changes` en tabla `messages`
- Filter: `receiver_id=eq.${myId}`
- Al recibir INSERT → si el `sender_id` coincide con el chat abierto, append la burbuja

#### Notificación de mensajes no leídos
- `checkUnreadCount()` — COUNT de mensajes con `is_read = false` del usuario
- Si > 0 → muestra badge numérico en el ítem "Mensajes" del sidebar

---

### 5.10 Conexiones (`features/connections.js`)

**"Tus Actores Fetiche" — actores que aparecen en múltiples películas vistas.**

**Flujo:**
1. Fetch de todos los logs del usuario con `cast_data` de la película
2. Agrupa actores por ID, cuenta apariciones, lista películas
3. Filtra actores que aparecen en >= 2 películas
4. Ordena por frecuencia descendente
5. Renderiza grid de cards con foto del actor, nombre, cantidad de películas, lista de títulos

---

### 5.11 Mapa / Cine-Traveler (`features/map.js`)

**Mapa interactivo de países de origen de las películas vistas.**

**Flujo:**
1. Fetch de logs del usuario con `production_countries` (JSONB)
2. Agrupa por `iso_3166_1` → cuenta películas y lista títulos por país
3. Carga Leaflet.js dinámicamente desde CDN
4. Renderiza mapa oscuro (Carto Dark tiles)
5. Añade `CircleMarker` por país (26 países con coordenadas hardcodeadas)
   - Radio proporcional al conteo (min 10, max 30)
   - Popup con nombre del país, cantidad y primeros 5 títulos
6. Scroll horizontal debajo del mapa con ranking de países

**Países con coordenadas:**
US, GB, FR, DE, ES, IT, JP, KR, CN, IN, BR, MX, CA, AU, NZ, AR, CL, CO, SE, NO, DK, FI, IE, RU (24 paises)

---

### 5.12 Premios / Awards (`features/awards.js`)

**Tracker de progreso en la temporada de premios.**

Configuración hardcodeada por temporada:
- `title`: "Oscars 2026"
- `categories`: Array de categorías con `nominees` (cada nominado tiene `id` TMDB y `title`)

**Flujo:**
1. Fetch de todos los `tmdb_id` del usuario desde `logs`
2. Calcula cuántos nominados ha visto y % de progreso
3. Renderiza por categoría con badge "Vista" (borde dorado) o "Pendiente" (opaco)
4. Barra de progreso animada

> **Nota v2**: Los datos de nominees son hardcodeados. En React deberían venir de la DB o de una API.

---

### 5.13 Torneo / Mundial (`features/tournament.js`)

**Bracket eliminatorio de películas de la Watchlist.**

**Mecánica:**
- Requiere mínimo 8 películas en la Watchlist
- Selecciona 8 aleatorias con shuffle
- Organiza en: Cuartos de Final (4 partidos) → Semifinales (2) → Gran Final (1)
- El usuario elige entre dos pósters cara a cara
- Animación de ganador (scale up) y perdedor (opacidad baja)
- Al terminar: pantalla de campeón con opción de registrar como vista o iniciar nuevo torneo

**State machine:**
```javascript
{
    rounds: ['Cuartos de Final', 'Semifinales', 'GRAN FINAL'],
    currentRoundIndex: 0,
    matches: [[movieA, movieB], ...],
    winners: []
}
```

---

### 5.14 Ticket de Cine (`features/ticket.js`)

**Ticket visual retro para películas vistas en el cine.**

**Trigger:** Botón ticket aparece en el Diario solo cuando `log.platform === 'Cine'`.

**Contenido del ticket:**
- Póster de la película
- Título, año, duración
- Fecha de visualización
- Rating con estrellas
- Review (si existe)
- Botón "Compartir" / "Descargar" (stub en v1 — pendiente para v2 con html2canvas)

---

### 5.15 Badges / Gamificación (`features/badges.js`)

**Logros desbloqueados automáticamente al guardar un log.**

#### Badges definidos:
| Código | Nombre | Condición |
|--------|--------|-----------|
| `NEWBIE` | Palomitas Frescas | 1 película registrada |
| `FAN` | Cinéfilo | 10 películas registradas |
| `CRITIC` | La Pluma de Oro | 3 reseñas de más de 10 caracteres |
| `MARATHON` | Maratonista | 3+ películas en el mismo día |
| `GLOBETROTTER` | Trotamundos | Películas de 5+ países distintos |

**Flujo `checkAndUnlockBadges(userId)`:**
1. Fetch de todos los logs del usuario (con movie data)
2. Fetch de badges ya obtenidos
3. Para cada badge no obtenido, ejecuta su función `check(logs)`
4. Si check() retorna true → INSERT en `user_badges`
5. Alert de notificación con nombre y descripción

**Flujo `getBadgesStatus(userId)`:**
- Retorna array de todos los badges con flag `unlocked` y `earnedAt`
- Usado en Estadísticas para el grid de logros

---

### 5.16 Blacklist (`features/blacklist.js`)

**Sistema para ocultar películas de las recomendaciones.**

**Funciones:**
- `initBlacklist()` — Carga IDs de `hidden_items` en un Set en memoria al iniciar
- `isBlacklisted(tmdbId)` — Consulta el Set en memoria O(1)
- `addToBlacklist(tmdbId)` — Optimistic update + insert en DB + dispatch event `blacklist:add`

**Integración:** El grid de descubrimiento filtra `isBlacklisted()` antes de renderizar cada card.

---

## 6. API de TMDB — Endpoints Usados (`tmdb-api.js`)

| Función | Endpoint TMDB | Notas |
|---------|--------------|-------|
| `searchMovies(query)` | `/search/movie` | Idioma: es-MX |
| `getMovieDetails(id)` | `/movie/{id}` | append: credits, watch/providers, keywords |
| `getTrendingMovies(period, page)` | `/trending/movie/{day or week}` | |
| `getRecommendations(id, page)` | `/movie/{id}/recommendations` | |
| `discoverMovies(params)` | `/discover/movie` | Con filtros avanzados |
| `getMovieImages(id)` | `/movie/{id}/images` | Para el selector de póster |
| `getImageUrl(path, size)` | — | Helper: `https://image.tmdb.org/t/p/{size}{path}` |

---

## 7. Navegación y Routing

**Routing via hash (`#view` o `#view?param=value`).**

### Vistas disponibles (sidebar nav):
| Hash | Vista |
|------|-------|
| `#dashboard` | Dashboard |
| `#search` | Búsqueda y Descubrimiento |
| `#diary` | Diario |
| `#watchlist` | Watchlist |
| `#stats` | Estadísticas |
| `#connections` | Conexiones (Actores Fetiche) |
| `#awards` | Tracker de Premios |
| `#map` | Cine-Traveler |
| `#tournament` | Mundial de Películas |
| `#social` | Comunidad |
| `#chat` | Mensajes (Chat) |
| `#chat?id=UUID` | Chat con usuario específico |
| `#profile?id=UUID` | Perfil de usuario |

### Mobile Bottom Nav:
Dashboard · Buscar · Chat · Diario · Watchlist · Menú (sidebar overlay)

---

## 8. Diseño / Tema

**Tema oscuro por defecto con soporte de tema claro (toggle en header).**

### Variables CSS principales:
```css
--background: #0a0a0f;       /* Fondo principal */
--surface: #141420;          /* Cards y paneles */
--primary: #E50914;          /* Rojo Netflix / color de acento */
--text: #e0e0f0;             /* Texto principal */
--text-muted: #8888aa;       /* Texto secundario */
--border: rgba(255,255,255,0.08);  /* Bordes */
--gold: #d4af37;             /* Para premios y badges */
--warning: #ffc107;          /* Estrellas de rating */
--success: #46d369;          /* Rating alto */
```

---

## 9. Problemas Conocidos / Deuda Técnica (a resolver en v2 React)

1. **`app.js` de 1148 líneas** — Router, auth, perfil, búsqueda y estado global mezclados en un solo archivo.
2. **HTML generado como strings** — En `logging.js`, `dashboard.js`, etc. — difícil de mantener, sin escape seguro de HTML (riesgo XSS).
3. **Estado global via `window.*`** — `window.handleMovieClick`, `window.removeFromWatchlist`, etc. — antipatrón.
4. **`diary_logs`** — Referenciada en `app.js` como si fuera tabla, es una VISTA. El código asume que `title` y `watched_date` existen.
5. **`watchlist.title`** — La columna `title` solo existe si el trigger la llena al insertar. Hay queries que la seleccionan directamente.
6. **Exposición de API keys** — Las keys de TMDB están en `js/config.js` (cliente) y son visibles en el código fuente del navegador.
7. **Sin paginación real en Diario** — Carga todos los logs de un usuario de una vez (puede ser lento con muchos registros).
8. **Sin optimistic updates** — Excepto `blacklist.js`, todo espera la respuesta de Supabase antes de actualizar la UI.
9. **Leaflet cargado dinámicamente** — Introduce delay perceptible al abrir el mapa por primera vez.
10. **Awards hardcodeados** — La lista de nominados no es dinámica ni actualizable sin modificar el código.

---

## 10. Pendiente / Ideas para v2 React

- [ ] Compartir tickets de cine como imagen (html2canvas)
- [ ] Notificaciones push cuando alguien te sigue o te menciona
- [ ] Listas curadas (ej. "Top 10 de terror", "Mi año 2026")
- [ ] Comparar perfil de dos usuarios side-by-side
- [ ] Import desde Letterboxd (CSV)
- [ ] Páginas públicas de película con SEO (SSR con Next.js)
- [ ] Modo colectivo: diario compartido con amigos
- [ ] Dark/Light theme persistido en Supabase profile
- [ ] Estadísticas de director (no solo actores)
- [ ] Soporte para series / TV (campo `media_type` ya existe en `hidden_items`)
- [ ] Calificación por componentes (guion, fotografía, actuaciones, etc.)
- [ ] Widget de "Película del Día" para compartir en redes sociales

---

*Fin del documento. El próximo paso es inicializar el proyecto React (Vite o Next.js) desde cero.*
