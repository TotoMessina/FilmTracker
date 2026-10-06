# 🎬 FilmTracker — Documento Integral del Proyecto y Arquitectura

> **Propósito de este documento:**  
> Este archivo resume en detalle **qué es, qué tecnologías utiliza, qué funcionalidades implementa actualmente y cómo está estructurado FilmTracker**. Está diseñado para ser compartido con modelos de Inteligencia Artificial (LLMs), arquitectos de software o diseñadores de producto para realizar análisis, auditorías y sesiones de brainstorming de nuevas ideas y mejoras.

---

## 1. 📌 Resumen Ejecutivo y Propuesta de Valor

**FilmTracker** es una plataforma web progresiva (PWA) de nueva generación diseñada para cinéfilos apasionados. Combina la funcionalidad de registro y bitácora personal de visionados (estilo *Letterboxd* o *Trakt.tv*) con herramientas sociales comunitarias, gamificación interactiva y una **suite avanzada de Inteligencia Artificial generativa** impulsada por **Groq AI**.

### Pilares Fundamentales:
1. **Bitácora y Diario Personal:** Registro exhaustivo de películas con calificaciones (1-10★), reseñas, notas privadas, plataformas, formatos físicos/digitales, rewatches y acompañantes.
2. **Descubrimiento y Cartelera:** Exploración en tiempo real conectada con la base de datos global de **TMDB (The Movie Database)**, con detección inteligente de películas en cines actuales diferenciadas por **Estrenos** vs **Reestrenos**.
3. **Comunidad y Conexión Humana:** Feed social en vivo, cálculo algorítmico de compatibilidad cinéfila entre usuarios, listas compartidas colaborativas y mensajería directa interna.
4. **Gamificación y Coleccionismo:** Logros e insignias desbloqueables (*Badges*), mapa mundial de cine (*Cine-Traveler*), torneos interactivos de llaves eliminatorias (*Mundial de Cine*) y generación de tickets virtuales de cine coleccionables.
5. **Inteligencia Artificial Cinéfila:** Asistente conversacional (*CineBuddy*), recomendaciones según estado de ánimo (*Mood Picker*), organizador de listas, redactor de bios y reseñas, asesor de premios Oscar (*Awards Coach*) y resumen anual narrativo (*Cine Wrapped*).
6. **Experiencia de Usuario Premium y Móvil:** Interfaz oscura cinematográfica con acentos dorados y escarlata, soporte PWA offline/invitado completo y diseño responsive para móviles, tablets y monitores ultrawide.

---

## 2. 🛠️ Stack Tecnológico y Arquitectura

- **Framework Web:** [Next.js 15](https://nextjs.org/) con arquitectura **App Router** (`src/app/`).
- **Lenguaje:** **TypeScript 5** estricto con tipado completo de datos y APIs.
- **Estilizado & Diseño:** **Tailwind CSS v4** con soporte nativo de utilidades modernas, variables de tema y animaciones personalizadas (efectos glassmorphism, gradientes cinemáticos, skeletons animados, badges temáticos).
- **Base de Datos & Backend:** [Supabase](https://supabase.com/) (PostgreSQL con Row Level Security, Supabase Auth con confirmación de correo y almacenamiento de metadatos de usuario).
- **APIs de Cine:** [The Movie Database (TMDB) API v3](https://www.themoviedb.org/documentation/api) con soporte de pósters, backdrops, reparto (`cast_data`), productoras, trailers en YouTube y plataformas de streaming.
- **Motor de Inteligencia Artificial:** [Groq Cloud SDK](https://groq.com/) con modelos de ultra-baja latencia (ej. `llama-3.3-70b-versatile`, `mixtral-8x7b-32768`), prompts adaptados en español latinoamericano, extracción estructurada de JSON y sistemas de caché en memoria con fallbacks locales resilientes.
- **PWA (Progressive Web App):** Service Worker nativo (`public/sw.js`), `manifest.json`, íconos optimizados para Android y iOS (`apple-touch-icon.png`), con soporte de modo Invitado (*Guest Mode*) mediante `localStorage`.
- **Efectos y Microinteracciones:** `canvas-confetti` para hitos y celebraciones, íconos vectoriales modernos de `lucide-react`.

---

## 3. 🗺️ Mapa de Rutas y Páginas de la Aplicación

| Ruta | Nombre del Módulo | Descripción Principal |
| :--- | :--- | :--- |
| `/` | **Dashboard** | Pantalla principal: películas en tendencia, accesos directos, resumen de actividad reciente, llamadas a la acción cinéfilas. |
| `/search` | **Descubrir / Cartelera** | Buscador en vivo de TMDB con filtros de géneros y años, más la sección **En Cines** con badges de *Estreno* y *Reestreno*. |
| `/movie/[id]` | **Detalle de Película** | Ficha completa: póster, tráiler oficial embebido, reparto, director, datos técnicos, plataformas de streaming disponibles y botón de registro. |
| `/diary` | **Diario Cinéfilo** | Bitácora cronológica con filtros por fecha y puntuación, notas de 1 a 10★, formatos, plataformas y si fue rewatch. |
| `/watchlist` | **Watchlist & Listas Compartidas** | Gestión de películas por ver, ordenamiento inteligente con IA y creación de listas compartidas colaborativas con otros usuarios. |
| `/stats` | **Estadísticas & Logros** | Métricas del usuario (horas, días, promedio de nota, géneros y plataformas más vistas), sistema de Badges y banner de Cine Wrapped. |
| `/wrapped` | **Cine Wrapped Anual** | Resumen anual épico estilo Spotify Wrapped narrado por IA con 7 capítulos, estadísticas anuales, watermark y función de compartir. |
| `/awards` | **Premios y Oscars Tracker** | Monitoreo de candidatas a los Oscars 2026, 2025 y 2024, cálculo de progreso hacia la gala y el **Coach de Premios con IA**. |
| `/tournament` | **Mundial de Cine** | Juego interactivo tipo torneo de eliminación directa (octavos a final) enfrentando películas 1 vs 1. |
| `/map` | **Cine-Traveler** | Mapa del mundo que ilumina los países de origen de las películas que el usuario ha registrado. |
| `/connections` | **Conexiones Cinéfilas** | Algoritmo que calcula el % de compatibilidad cinéfila y títulos en común entre el usuario y miembros de la comunidad. |
| `/social` | **Comunidad & Feed** | Muro social con reseñas recientes de otros cinéfilos, perfiles públicos y comentarios. |
| `/chat` | **Mensajes Directos** | Mensajería privada en tiempo real entre cinéfilos conectados. |
| `/ai-chat` | **CineBuddy IA** | Chat conversacional interactivo con una IA cinéfila experta para recomendaciones y debates. |
| `/profile` / `/profile/[id]` | **Perfil de Usuario** | Vista pública/privada con avatar, bio (con generador de IA), selector de plataformas de streaming propias y estadísticas. |
| `/auth` | **Autenticación** | Login y registro con Supabase Auth, validación de contraseñas y advertencia clara de confirmación de email. |

---

## 4. 🧠 Suite de Inteligencia Artificial (Groq Endpoints)

Todas las rutas API de IA se encuentran en `src/app/api/ai/`:

1. **`awards-coach` (`/api/ai/awards-coach/route.ts`):**
   - Recibe la temporada de premios, nominados con estado de visto/pendiente y watchlist del usuario.
   - Genera estrategia de las mejores 3 películas a ver para maximizar categorías cubiertas, predicción de Mejor Película, dato curioso histórico y diagnóstico de meta hacia la ceremonia. Caché de 6 horas.
2. **`year-wrapped` (`/api/ai/year-wrapped/route.ts`):**
   - Procesa estadísticas completas del año (horas, mes pico, géneros, actores, mejor/peor película, rewatches, visitas al cine).
   - Redacta una historia épica en 7 capítulos (Apertura, Cifras, Género del alma, Momento cumbre, Tropiezo, Personalidad cinéfila, Cierre). Caché de 7 días.
3. **`cinema-buddy` (`/api/ai/cinema-buddy/route.ts`):**
   - Motor conversacional cinéfilo para charlar de cine clásico, moderno, directores, teorías y recomendaciones contextuales.
4. **`quick-picks` (`/api/ai/quick-picks/route.ts`):**
   - Sugerencias inmediatas según situación concreta (ej. "noche de citas", "película corta de menos de 90 min", "para ver solo un domingo", etc.).
5. **`mood-picker` (`/api/ai/mood-picker/route.ts`):**
   - Recomendaciones hiperpersonalizadas vinculadas al estado de ánimo emocional del usuario.
6. **`bio-generator` (`/api/ai/bio-generator/route.ts`):**
   - Analiza el diario y las películas favoritas del usuario para escribir una biografía cinéfila ingeniosa y original para su perfil.
7. **`review-helper` (`/api/ai/review-helper/route.ts`):**
   - Asistente para usuarios que quieren redactar o enriquecer sus críticas sin caer en clichés o spoilers.
8. **`watchlist-priority` (`/api/ai/watchlist-priority/route.ts`):**
   - Ordena y prioriza la lista de películas pendientes del usuario según valor cinematográfico, accesibilidad y tiempo disponible.
9. **`recommend` (`/api/ai/recommend/route.ts`):**
   - Motor de recomendaciones analíticas basadas en el historial previo y calificaciones del usuario.

---

## 5. 💎 Componentes y Funcionalidades Destacadas

### A. Registro Cinéfilo Completo (`LogMovieModal.tsx`)
- Búsqueda directa o invocación desde cualquier ficha.
- Selector de calificación en escala de 1 a 10 con estrellas interactivas.
- Formato físico o digital: Cine, Streaming, Blu-ray 4K, DVD, VHS, etc.
- Plataforma donde se vio (Netflix, Max, Disney+, Cine, etc.).
- Etiqueta de *Rewatch* (re-visionado).
- Selección de acompañantes de entre los amigos o contactos registrados.
- Celebración visual con confeti al guardar.

### B. Entrada de Cine Virtual (`CinemaTicketModal.tsx`)
- Al registrar o ver una película, el usuario puede generar un boleto de cine retro-moderno con textura de papel, código de barras, número de sala/butaca, póster y fecha, diseñado para compartir en historias de Instagram o redes sociales.

### C. Sistema de Cines y Detección de Reestrenos (`src/lib/services/cinema.ts`)
- Consulta en tiempo real las películas en cartelera de cines (`now_playing` de TMDB).
- Algoritmo que compara la fecha de estreno original con la fecha de exhibición en salas:
  - Si la película se estrenó hace más de 180 días (o años anteriores) y está en salas, se etiqueta automáticamente como **🎟️ REESTRENO**.
  - Si es reciente, se etiqueta como **🔥 ESTRENO**.

### D. Selector de Plataformas de Streaming del Usuario (`StreamingPlatformsSelector.tsx`)
- En el perfil, el usuario marca qué servicios tiene contratados (Netflix, Prime Video, Disney+, Max, Paramount+, Apple TV+, MUBI, etc.).
- Permite a la app filtrar o destacar si una película recomendada está disponible en los servicios que el usuario realmente paga.

### E. Gamificación & Badges (`src/lib/gamification/badges.ts`)
- Insignias automáticas según hitos alcanzados:
  - *Newbie* (primer log)
  - *Cinemaniaco* (50+ películas)
  - *Devorador de Festivales* (películas internacionales)
  - *Nostálgico* (cine clásico)
  - *Maratonista* (horas acumuladas)
  - *Explorador Global* (países diversos)

### F. Listas Compartidas (`SharedWatchlistsSection.tsx` & `sharedWatchlists.ts`)
- Creación de listas conjuntas entre amigos o parejas (ej. "Películas para ver juntos", "Maratón de Terror").
- Sincronización en Supabase para que ambos puedan agregar, marcar como vista o votar.

### G. Algoritmo de Compatibilidad Cinéfila (`/connections`)
- Compara los conjuntos de películas vistas de ambos usuarios.
- Evalúa similitud de puntuaciones para películas en común y coincidencia de géneros preferidos, generando un porcentaje de afinidad (ej. "82% de compatibilidad").

---

## 6. 📂 Estructura de Carpetas del Proyecto

```text
FilmTracker-main/
├── public/
│   ├── icons/ (icon-192.png, icon-512.png)
│   ├── apple-touch-icon.png
│   ├── manifest.json (Configuración PWA)
│   └── sw.js (Service Worker PWA)
├── src/
│   ├── app/
│   │   ├── ai-chat/ (Chat con CineBuddy IA)
│   │   ├── api/ai/ (9 endpoints especializados de IA)
│   │   ├── auth/ (Login, Registro, Confirmación email)
│   │   ├── awards/ (Tracker de Oscars + Coach IA)
│   │   ├── chat/ (Mensajería privada)
│   │   ├── connections/ (Compatibilidad cinéfila)
│   │   ├── diary/ (Diario cronológico)
│   │   ├── map/ (Cine-Traveler / Mapa mundial)
│   │   ├── movie/[id]/ (Ficha técnica y streaming)
│   │   ├── profile/ (Perfil propio y de otros usuarios)
│   │   ├── search/ (Buscador y cartelera en cines)
│   │   ├── social/ (Feed social y reseñas de comunidad)
│   │   ├── stats/ (Estadísticas y logros)
│   │   ├── tournament/ (Mundial de cine)
│   │   ├── watchlist/ (Lista personal y compartida)
│   │   ├── wrapped/ (Cine Wrapped anual con IA)
│   │   ├── layout.tsx & globals.css
│   │   └── page.tsx (Dashboard principal)
│   ├── components/
│   │   ├── ai/ (QuickRecommenderModal, etc.)
│   │   ├── auth/ (Formularios de autenticación)
│   │   ├── awards/ (AICoach trophy panel)
│   │   ├── layout/ (Sidebar, Navbar, MobileNav)
│   │   ├── movies/ (MovieCard, LogMovieModal, CinemaTicketModal, MoodPicker)
│   │   ├── profile/ (BioGenerator, StreamingPlatformsSelector)
│   │   ├── ui/ (Botones, modales, skeletons)
│   │   └── watchlist/ (SharedWatchlistsSection)
│   └── lib/
│       ├── context/ (AuthContext, AppContext con confetti y modales globales)
│       ├── gamification/ (badges.ts)
│       ├── groq/ (client.ts, types.ts)
│       ├── services/ (cinema.ts, collections.ts, sharedWatchlists.ts, streamingPlatforms.ts)
│       ├── supabase/ (client.ts, types.ts)
│       ├── tmdb/ (client.ts)
│       └── utils/ (formatting.ts)
├── vercel.json
├── package.json
└── tsconfig.json
```

---

## 7. 🚀 Prompt y Guía para Pedir Ideas a otra IA

Podés copiar el siguiente prompt y enviárselo a cualquier IA junto con este archivo para obtener propuestas de valor:

```markdown
Hola. Te comparto la documentación completa de "FilmTracker", una aplicación web moderna (Next.js 15, TypeScript, Tailwind CSS, Supabase, TMDB y Groq AI) orientada a cinéfilos para registrar visionados, interactuar en comunidad y aprovechar herramientas avanzadas de IA.

Por favor, revisá el documento FILMTRACKER_OVERVIEW.md y proponé ideas innovadoras de alto impacto en las siguientes áreas:

1. Nuevas dinámicas de Gamificación y Retos Cinéfilos (ej. retos mensuales, maratones temáticas, trivias automáticas basadas en lo que el usuario vio).
2. Funcionalidades Sociales de alto engagement (ej. clubes de cine virtuales con votación semanal, watch parties asíncronas, predicciones colaborativas de taquilla o premios).
3. Casos de uso disruptivos de IA que aún no tengamos (ej. búsqueda por descripción de escenas vagas "una peli donde viajan en tren y hay un reloj de arena", generador de pósters alternativos, debates simulados entre directores famosos sobre una peli).
4. Integraciones externas y monetización ética (Letterboxd import/export, sincronización de calendarios para estrenos en cines locales, modelos Pro/Premium para cinéfilos hardcore).
5. Mejoras de UX/UI y retención diaria en móviles y PWA.

Priorizá ideas viables que aprovechen el stack actual y eleven la experiencia visual y la adicción positiva de los usuarios.
```
