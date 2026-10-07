# 📚 FilmTracker — Guía Maestra de Prompts de Implementación

> **Cómo usar este archivo:**  
> Este documento contiene **15 prompts de desarrollo e inteligencia artificial listos para usar**.  
> Podés copiar cualquiera de estos prompts y enviárselo directamente a un asistente de código (Antigravity, Cursor, Claude Code, ChatGPT) para implementar la funcionalidad paso a paso en **FilmTracker** (Next.js 15, TypeScript, Tailwind CSS, Supabase, TMDB y Groq).

---

## Índice de Funcionalidades

1. [Búsqueda por Descripción de Escena (Reverse Movie Search)](#1-búsqueda-por-descripción-de-escena)
2. [Retos Mensuales Automáticos (Monthly Challenges)](#2-retos-mensuales-automáticos)
3. [Trivias Personalizadas con IA (CineQuiz)](#3-trivias-personalizadas-con-ia)
4. [Sistema de Badges Expandido (Director, Década, Género, Oscars)](#4-sistema-de-badges-expandido)
5. [Cine Wrapped Mensual (Monthly Recap)](#5-cine-wrapped-mensual)
6. [Clubes de Cine Virtuales (CineClubs Colaborativos)](#6-clubes-de-cine-virtuales)
7. [Predicciones de Premios y Quiniela (Awards Prode & Leaderboard)](#7-predicciones-de-premios-y-quiniela)
8. ["Qué Ver Juntos" (Multi-User Matchmaking)](#8-qué-ver-juntos)
9. [Reseñas con Control Inteligente de Spoilers](#9-reseñas-con-control-inteligente-de-spoilers)
10. [Análisis de Sesgos y Gusto Cinéfilo (Taste Bias Analyzer)](#10-análisis-de-sesgos-y-gusto-cinéfilo)
11. [Recomendador "Fuera de tu Zona de Confort"](#11-recomendador-fuera-de-tu-zona-de-confort)
12. [Pitch Sin Spoilers: "Por qué verla ahora"](#12-pitch-sin-spoilers-por-qué-verla-ahora)
13. [Collage Anual / Mensual para Redes (Grid Generator)](#13-collage-visual-para-redes)
14. [Modo "No Sé Qué Ver" (Fast Decision Maker en 3 Clics)](#14-modo-no-sé-qué-ver)
15. [Ranking de Tendencias Comunitarias Propias de FilmTracker](#15-ranking-de-tendencias-comunitarias)

---

## 1. Búsqueda por Descripción de Escena

### 🎯 Objetivo
Permitir al usuario encontrar una película escribiendo recuerdos vagos de una escena (ej: *"una película en blanco y negro donde juegan al ajedrez con la muerte en una playa"* o *"un tipo atrapado en un vagón de tren con una bomba que explota cada 8 minutos"*). La IA deduce los títulos más probables y luego se validan contra TMDB para garantizar pósters, sinopsis y enlaces reales.

### 💻 Prompt para el Agente de Código
```markdown
En el proyecto FilmTracker (Next.js 15 App Router TypeScript), implementá la "Búsqueda por Descripción de Escena":

1. Crear endpoint POST /api/ai/scene-search:
   - Recibir: { query: string }
   - Usar Groq (GROQ_MODEL_LARGE, temp 0.2, max_tokens 512).
   - System Prompt: "Eres un detective cinéfilo prodigioso. El usuario te describirá una escena, fragmento o recuerdo vago de una película. Tu objetivo es identificar de 3 a 5 películas candidatas más probables que coincidan exactamente con la descripción."
   - Retornar JSON con: { candidates: Array<{ title: string, year?: number, reason: string, confidence: "alta" | "media" | "baja" }> }
   - En el backend, para cada candidata llamar a TMDB search/movie para obtener su tmdb_id, title original, poster_path, vote_average y release_date reales. Filtrar las que no existan en TMDB.
   - Devolver la lista combinada con datos reales de TMDB y la explicación de la IA.

2. Integrar en la UI de búsqueda (src/app/search/page.tsx o un modal SceneSearchModal.tsx):
   - Input con ícono de Sparkles y placeholder: "Describí una escena que recuerdes (ej: un tren, un reloj de arena...)"
   - Botón "Identificar Película".
   - Estado de carga con animación de lupa cinéfila.
   - Grid de resultados mostrando la MovieCard con badge de confianza de la IA ("Coincidencia 95%") y la razón por la que encaja con la escena descrita.
   - Botón directo para añadir a Watchlist o registrar en el Diario.
```

---

## 2. Retos Mensuales Automáticos

### 🎯 Objetivo
Generar cada día 1 del mes 3 desafíos cinéfilos personalizados basados en los vacíos del historial del usuario (ej: *"Mirá 3 películas de los años 70"*, *"Explorá un país que no tengas en tu mapa Cine-Traveler"*, *"Completá una película de más de 150 minutos"*).

### 💻 Prompt para el Agente de Código
```markdown
En el proyecto FilmTracker, implementá el sistema de "Retos Mensuales Automáticos":

1. Base de datos / Modelo (Supabase o localStorage para invitados):
   - Tabla user_monthly_challenges: id, user_id, month (YYYY-MM), challenges: JSONB, completed: boolean, created_at.
   - Estructura de cada reto: { id: string, title: string, description: string, targetCount: number, currentCount: number, condition: { type: "decade" | "country" | "runtime" | "genre" | "director", value: any }, completed: boolean }

2. Servicio src/lib/services/challenges.ts:
   - generateMonthlyChallenges(userId, logs, travelerCountries):
     Analiza el historial de logs: si el usuario casi no vio cine de los 70/80, crea un reto de esa década. Si en Cine-Traveler tiene pocos países asiáticos o latinoamericanos, crea un reto geográfico. Si solo ve películas de 90 min, reta a ver una épica de +150m.
   - checkChallengeProgress(log, activeChallenges):
     Cada vez que se guarda un log en LogMovieModal, evalúa si la película cumple las condiciones de los retos activos y avanza el contador. Si llega a targetCount, marca completed: true y dispara triggerConfetti().

3. UI en Dashboard o Stats:
   - Componente MonthlyChallengesCard.tsx:
   - Muestra el mes actual (ej: "Desafíos de Noviembre"), barra de progreso por cada uno de los 3 retos (ej. 2/3 películas de los 70).
   - Badge especial de temporada "Misión Mensual Cumplida" cuando completa los 3.
```

---

## 3. Trivias Personalizadas con IA

### 🎯 Objetivo
Un juego de trivia generado por IA cuyas preguntas se basan únicamente en las películas que el usuario ya marcó como vistas en su diario. Al responder correctamente gana puntos de cinéfilo y badges.

### 💻 Prompt para el Agente de Código
```markdown
Implementá en FilmTracker el módulo de "CineQuiz: Trivias Personalizadas":

1. Endpoint POST /api/ai/generate-trivia:
   - Recibir: { watchedMovies: Array<{ title: string, year: string, director?: string }> } (muestreo aleatorio de 5 a 10 películas del usuario).
   - Usar Groq (GROQ_MODEL_LARGE, temp 0.7, max_tokens 1024).
   - Pedir 5 preguntas de opción múltiple (4 opciones cada una, 1 correcta) sobre tramas, personajes, directores o bandas sonoras de ESAS películas.
   - Formato JSON: { questions: Array<{ id: number, movieTitle: string, question: string, options: string[], correctIndex: number, explanation: string }> }

2. Página src/app/trivia/page.tsx:
   - Si el usuario tiene menos de 5 películas vistas: mostrar aviso "Registrá al menos 5 películas en tu diario para jugar tu trivia personalizada".
   - Flujo de juego estilo quiz interactivo (1 pregunta a la vez con temporizador opcional de 20s).
   - Sonido o animación con Confetti al acertar, color verde en la correcta y rojo en la fallada con la explicación cinéfila.
   - Pantalla final con puntaje (ej: 4/5), título cinéfilo otorgado ("Erudito del Celuloide") y botón para compartir el resultado.
```

---

## 4. Sistema de Badges Expandido

### 🎯 Objetivo
Ampliar el sistema de logros (`src/lib/gamification/badges.ts`) agregando metas avanzadas: completar filmografías de directores célebres, maratones por décadas, directores debutantes y cobertura de los Oscars.

### 💻 Prompt para el Agente de Código
```markdown
Expandí el sistema de Badges en src/lib/gamification/badges.ts y la visualización en src/app/stats/page.tsx:

1. Nuevos Badges a incorporar en ALL_BADGES:
   - NOLAN_DEVOTEE: "Vio al menos 5 películas dirigidas por Christopher Nolan"
   - TARANTINO_ROUND: "Vio al menos 5 películas dirigidas por Quentin Tarantino"
   - GHIBLI_DREAMER: "Vio al menos 4 películas de Studio Ghibli / Hayao Miyazaki"
   - RETRO_70S: "Vio 5 o más películas estrenadas en los años 70"
   - NOIR_MASTER: "Vio 3 películas del género Cine Negro / Misterio clásico"
   - OSCAR_COMPLETIST_2025: "Vio todas las nominadas a Mejor Película de los Oscars 2025"
   - MARATON_TRILOGIA: "Registró 3 películas en un mismo día"
   - CINEMA_FIRST: "Registró 5 películas en la plataforma 'Cine'"

2. Función de verificación automática:
   - En src/lib/gamification/badgeChecker.ts, crear checkNewBadges(userLogs, currentBadges) que evalúe directores (revisando crew/director o cast_data), fechas de lanzamiento y plataformas.
   - Si se desbloquea uno nuevo al guardar un log en LogMovieModal, mostrar un Toast/Modal celebratorio: "¡Nuevo Logro Desbloqueado: Devoto de Nolan 🏆!".
```

---

## 5. Cine Wrapped Mensual

### 🎯 Objetivo
Complementar el Cine Wrapped anual con un resumen mensual accesible cada fin de mes (`/wrapped/monthly` o toggle en `/wrapped`), dando un motivo de retención recurrente a los usuarios.

### 💻 Prompt para el Agente de Código
```markdown
Implementá el "Cine Wrapped Mensual" en FilmTracker:

1. Endpoint POST /api/ai/monthly-wrapped:
   - Recibir: { month: number, year: number, stats: { totalWatched, totalHours, topGenre, bestRated, worstRated, cinemaVisits } }
   - Prompt de Groq: Narrador cinéfilo ágil, tono mensual ("Tu crónica de Octubre").
   - Retornar JSON con 4 tarjetas rápidas:
     * titular_del_mes: Frase que defina su mes
     * destacada_del_mes: Su película cumbre y por qué
     * habito_curioso: Alguna tendencia del mes (ej. "maratoneaste terror las últimas dos semanas")
     * veredicto: Calificación del mes cinéfilo

2. En src/app/wrapped/page.tsx:
   - Agregar selector de vista: Pestañas "Anual" y "Mensual (Selector de Mes)".
   - Si elige mensual y tiene al menos 3 películas ese mes, renderizar las 4 tarjetas en formato vertical 9:16 estilo historias de Instagram para compartir fácilmente con botón de captura/copia.
```

---

## 6. Clubes de Cine Virtuales

### 🎯 Objetivo
Permitir a grupos de amigos o comunidades crear un "CineClub" privado o público: eligen una película por semana mediante votación, fijan fecha límite de visionado y desbloquean el foro de debate sin spoilers cuando todos o la mayoría la hayan visto.

### 💻 Prompt para el Agente de Código
```markdown
Implementá la funcionalidad de "Clubes de Cine" (CineClubs):

1. Esquema Supabase (src/lib/supabase/types.ts y migraciones):
   - cineclubs: id, name, description, cover_url, creator_id, current_movie_tmdb_id, voting_deadline, discussion_date
   - cineclub_members: club_id, user_id, role ('admin' | 'member'), has_watched: boolean
   - cineclub_polls: club_id, options: Array<{ tmdb_id: number, title: string, votes: string[] }>
   - cineclub_messages: club_id, user_id, message: string, is_spoiler: boolean, created_at

2. Páginas:
   - /clubs: Explorar y crear clubes de cine.
   - /clubs/[id]:
     * Hero con la "Película de la Semana / del Mes".
     * Contador de miembros que ya la vieron (ej: 4/6 miembros listos).
     * Sección de votación para la próxima película (los miembros proponen 3 títulos y votan).
     * Muro de discusión: los comentarios de debate sobre la película activa quedan difuminados con advertencia de spoilers hasta que el usuario presione "Ya la vi" o la registre en su diario.
```

---

## 7. Predicciones de Premios y Quiniela

### 🎯 Objetivo
Permitir a los usuarios jugar a predecir los ganadores de los Oscars en cada categoría antes de la gala, con un ranking (leaderboard) entre amigos y la comunidad global.

### 💻 Prompt para el Agente de Código
```markdown
Integrá el sistema de "Prode / Quiniela de Premios" en src/app/awards/page.tsx:

1. Base de datos Supabase:
   - awards_predictions: id, user_id, season_year (2026), predictions: Record<string, number> (categoría -> tmdb_id o nombre del nominado), score: number, submitted_at

2. UI en la página de Premios (/awards):
   - Pestaña "Mi Quiniela":
     * Por cada categoría de la edición activa (Mejor Película, Dirección, Actor, etc.), selector interactivo para marcar "Mi Voto a Ganador 🏆".
     * Botón "Confirmar y Guardar Predicciones".
     * Botón para generar una tarjeta visual o enlace compartible: "Mirá mis predicciones para los Oscars 2026 en FilmTracker".
   - Pestaña "Leaderboard / Ranking":
     * Una vez anunciados los ganadores oficiales (campo isWinner en OSCARS_EDITIONS), calcula 10 puntos por acierto y muestra la tabla de posiciones con los avatares de los usuarios con más aciertos.
```

---

## 8. "Qué Ver Juntos"

### 🎯 Objetivo
Una herramienta para reuniones, parejas o grupos de amigos: elegís de 2 a 4 usuarios de FilmTracker y la app cruza sus historiales para encontrar películas que **ninguno de los participantes haya visto**, ponderando los géneros y calificaciones favoritas de todos.

### 💻 Prompt para el Agente de Código
```markdown
Implementá la herramienta "Qué Ver Juntos" en src/app/connections/page.tsx o una nueva ruta /watch-together:

1. Selector de Amigos:
   - Permite seleccionar entre 1 y 4 usuarios con los que tengas conexión en la app.

2. Lógica del Algoritmo (src/lib/services/watchTogether.ts):
   - Obtener los logs de todos los participantes seleccionados.
   - Crear un Set excluyente con todas las películas que al menos uno ya vio (ninguno debe haberla visto).
   - Cruzar los géneros con mejor promedio de calificación en común entre todos los miembros.
   - Filtrar películas de las Watchlists que coincidan en 2 o más integrantes.
   - Enviar a Groq API (/api/ai/recommend-group) el resumen de gustos compartidos para recibir 3 recomendaciones de consenso explicadas (ej: "Para Juan y Sofía: combina el gusto de Juan por el thriller psicológico con el aprecio de Sofía por la dirección de Denis Villeneuve").

3. UI de Resultados:
   - Muestra las 3 películas seleccionadas con sus plataformas de streaming en común (cruzando los servicios que ambos usuarios tienen marcados en su perfil).
```

---

## 9. Reseñas con Control Inteligente de Spoilers

### 🎯 Objetivo
Evitar arruinar giros de trama en el feed social o fichas de películas: si una reseña contiene spoilers, se oculta con un botón de revelación, pero además la app detecta automáticamente si el lector ya vio la película para desvelarla sin fricción.

### 💻 Prompt para el Agente de Código
```markdown
Implementá el "Control Inteligente de Spoilers" en FilmTracker:

1. En el registro de películas (src/components/movies/LogMovieModal.tsx):
   - Agregar un toggle visible: "Contiene Spoilers ⚠️".
   - Al guardar en Supabase, registrar contains_spoilers: boolean en la tabla logs.

2. Componente de Review Social (src/components/social/ReviewCard.tsx o en /movie/[id]):
   - Prop: { log: Log, currentUserId: string, userWatchedIds: Set<number> }
   - Si contains_spoilers === true:
     * Si userWatchedIds.has(log.tmdb_id): Mostrar la reseña normalmente con un pequeño badge "Spoilers (Visto por ti)".
     * Si NO la vio: Ocultar el texto detrás de un filtro blur con advertencia: "⚠️ Esta reseña contiene spoilers. Hacé clic para leer bajo tu propio riesgo".
```

---

## 10. Análisis de Sesgos y Gusto Cinéfilo

### 🎯 Objetivo
Un reporte divertido y perspicaz generado por IA sobre cómo califica el usuario: detecta si es demasiado generoso con el terror, severo con las comedias románticas, o si califica alto solo películas de más de 2 horas y media.

### 💻 Prompt para el Agente de Código
```markdown
Implementá el "Analizador de Sesgos Cinéfilos (Taste Roast / Bias Analyzer)":

1. Endpoint POST /api/ai/taste-bias:
   - Recibir: { stats: { genreAverages: Record<string, number>, decadeAverages: Record<string, number>, runtimeAverages: Record<string, number>, totalLogs: number } }
   - Usar Groq (GROQ_MODEL_LARGE, temp 0.7).
   - System Prompt: "Eres un crítico de cine ingenioso, observador y con humor sutil. Analizas las estadísticas de calificaciones de un cinéfilo para revelar sus contradicciones, sesgos y placeres culposos con ironía afectuosa."
   - Retornar JSON:
     * diagnosis: string (Diagnóstico general)
     * overvalued_genre: { genre: string, comment: string } (Lo que infla de nota)
     * harsh_criticism: { target: string, comment: string } (Con lo que es implacable)
     * guilty_pleasure_pattern: string
     * advice: string

2. UI en src/app/profile/page.tsx (Pestaña "Mi Criterio"):
   - Botón "Analizar mis Sesgos Cinéfilos".
   - Tarjetas con diseño humorístico y elegante mostrando el desglose con íconos temáticos.
```

---

## 11. Recomendador "Fuera de tu Zona de Confort"

### 🎯 Objetivo
Romper la burbuja de recomendación algorítmica: sugerir una película de un género o época que el usuario nunca mira, pero que tiene un puente temático o estético con algo que calificó con 10★.

### 💻 Prompt para el Agente de Código
```markdown
Implementá la función "Fuera de tu Zona de Confort" en src/app/ai-chat o como modal en /search:

1. Endpoint POST /api/ai/out-of-comfort-zone:
   - Recibir: { favoriteMovies: string[], unexploredGenres: string[] }
   - Prompt de Groq:
     "El usuario ama estas películas: [favoritas], pero prácticamente nunca mira películas de [géneros inexplorados].
      Encuentra UNA película extraordinaria del género inexplorado que funcione como caballo de Troya o puente perfecto hacia sus gustos.
      Explica la analogía: 'Si te fascinó el suspenso y la paranoia de Zodiac, deberías ver esta película clásica de 1957 porque...'"
   - Retornar JSON: { movieTitle: string, year: number, bridgeExplanation: string, whyItWorks: string }
   - Validar con TMDB para traer póster y sinopsis oficial.

2. Componente en UI:
   - Tarjeta "El Salto de Fe": Muestra el póster y la explicación del porqué un fan de su género habitual amará esta propuesta fuera de su radar.
```

---

## 12. Pitch Sin Spoilers: "Por qué verla ahora"

### 🎯 Objetivo
Resolver la indecisión al mirar la Watchlist: un botón en cada película pendiente que genera un pitch de 30 segundos explicando exactamente por qué esa película vale la pena verla hoy mismo, sin revelar nada de la trama.

### 💻 Prompt para el Agente de Código
```markdown
Implementá el asistente "Pitch Sin Spoilers: Por qué verla hoy" en la Watchlist y en la Ficha de Película:

1. Endpoint POST /api/ai/pitch-movie:
   - Recibir: { title: string, year: string, director?: string, genres: string[] }
   - Prompt de Groq (GROQ_MODEL_LARGE, max_tokens 300):
     "Escribe un pitch de 3 oraciones contundentes para convencer a alguien de ver '[title]' esta misma noche.
      REGLA SUPREMA: 0% spoilers. Habla del ritmo, la vibra visual, las actuaciones y la sensación que te deja al terminar. Tono apasionado y conciso."
   - Retornar: { pitch: string, vibeEmoji: string, idealMoment: string } (ej. "Ideal para: un viernes a la medianoche con luces apagadas").

2. En src/app/watchlist/page.tsx y src/app/movie/[id]/page.tsx:
   - Botón con ícono de varita mágica o rayo: "¿Por qué verla hoy?".
   - Abre un popover o micro-modal con el pitch instantáneo en menos de 1 segundo.
```

---

## 13. Collage Visual para Redes

### 🎯 Objetivo
Generar una imagen descargable en formato cuadrícula 3x3 (o tarjeta 9:16) con los pósters de las 9 mejores películas del usuario en el año o mes, lista para publicar en Instagram Stories o Twitter/X.

### 💻 Prompt para el Agente de Código
```markdown
Implementá el "Generador de Collage Cinéfilo para Redes":

1. Componente src/components/profile/MovieGridShareModal.tsx:
   - Recibe: { title: string, subtitle: string, movies: Array<{ title: string, poster_path: string, rating?: number }> } (Top 4 o Top 9 películas).
   - Renderiza un canvas HTML5 / DOM estilizado en resolución 1080x1920 (Instagram Story) o 1080x1080 (Post cuadrado):
     * Fondo oscuro con gradiente premium y logo de FilmTracker en la cabecera.
     * Cuadrícula de pósters en alta resolución.
     * Nombre de usuario y año/mes en tipografía elegante.
   - Botón "Descargar Imagen" (utilizando canvas nativo HTML5 toDataURL('image/png') o html2canvas).
   - Botón de previsualización responsive.
```

---

## 14. Modo "No Sé Qué Ver"

### 🎯 Objetivo
La solución más rápida del mercado contra la parálisis por elección: 3 preguntas directas en pantalla táctil (1. Estado de ánimo, 2. Tiempo disponible, 3. ¿Solo o acompañado?) y la app elige **exactamente 1 sola película** con alta convicción.

### 💻 Prompt para el Agente de Código
```markdown
Implementá el módulo "Modo: No Sé Qué Ver (Decisor en 3 Clics)" en FilmTracker:

1. Ruta /fast-pick o botón flotante en la barra de navegación:
   - Paso 1: "¿Cómo estás hoy?" (4 opciones: "Quiero desconectar", "Busco adrenalina", "Quiero algo que me haga pensar", "Quiero emocionarme/llorar").
   - Paso 2: "¿Cuánto tiempo tenés?" (3 opciones: "Menos de 90 min", "Estándar ~2 horas", "Tengo toda la noche libre").
   - Paso 3: "¿Con quién mirás?" (3 opciones: "Solo/a", "En pareja", "Con amigos o familia").

2. Lógica de selección:
   - Envía las 3 respuestas a /api/ai/quick-decision junto con los servicios de streaming que el usuario tiene activos en su perfil.
   - La IA selecciona UNA SOLA película ideal disponible en sus plataformas.
   - En pantalla se muestra únicamente esa película en una tarjeta protagonista con botón gigante: "Ver Tráiler" y "Donde Verla".
```

---

## 15. Ranking de Tendencias Comunitarias

### 🎯 Objetivo
Un ranking de "Lo más visto y mejor valorado esta semana en FilmTracker", calculado a partir de los logs reales de los usuarios de la base de datos de Supabase, en lugar de mostrar únicamente la tendencia genérica de Hollywood de TMDB.

### 💻 Prompt para el Agente de Código
```markdown
Implementá las "Tendencias Comunitarias de FilmTracker":

1. Endpoint GET /api/community/trending:
   - Consulta en Supabase a la tabla logs con filtro de created_at en los últimos 7 días.
   - Agrupa por tmdb_id, calcula count (visionados en la semana) y promedio de rating otorgado por la comunidad.
   - Hace join con la tabla movies para obtener title, poster_path, backdrop_path.
   - Ordena por cantidad de logs descendente (Top 10 de la semana en la comunidad).
   - Caché de 1 hora.

2. UI en el Dashboard (src/app/page.tsx) o en Comunidad (/social):
   - Sección "🔥 En la pantalla de FilmTracker esta semana":
   - Carrusel de películas destacando cuántos cinéfilos la vieron esta semana y la nota media de la comunidad (ej. "Visto por 28 usuarios • 8.4★ promedio").
```
