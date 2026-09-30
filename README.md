# FilmTracker — Plataforma Web Cinéfila (Next.js + React + Tailwind + Supabase + TMDB)

Bienvenido a la versión moderna y escalable de **FilmTracker**, reconstruida desde cero con **Next.js (App Router)**, **React 19**, **Tailwind CSS v4**, **TypeScript**, **Supabase** y **The Movie Database (TMDB)**.

---

## 🚀 Características Principales

1. **Dashboard Cinematográfico**:
   - Hero banner dinámico con la película en tendencia del día y backdrop de alta definición.
   - Tarjetas de estadísticas en tiempo real: conteo de películas vistas, horas totales y racha de días activos.
   - Carrusel de tendencias del día y obras maestras mejor valoradas según TMDB.
   - Feed de actividad reciente de tu diario.

2. **Descubrimiento y Búsqueda Avanzada (`/search`)**:
   - Búsqueda en vivo con debounce por título de película.
   - Modos rápidos: *Explorar Catálogo*, *Tendencias Semanales*, *Más Valoradas*.
   - Filtros avanzados: proveedores de streaming (Netflix, Disney+, Prime Video, Max, Apple TV+), 19 géneros cinematográficos, año de estreno y ordenamiento.
   - **Sistema de Blacklist**: Oculta películas para que no aparezcan en tus recomendaciones.

3. **Ficha Completa de Película (`/movie/[id]`)**:
   - Póster, backdrop original, año, duración y calificación promedio de TMDB.
   - **Alerta de Escena Post-créditos**: Detecta automáticamente si la película tiene escena adicional post-créditos mediante keywords de TMDB.
   - Dónde verla: plataformas de streaming con sus logos oficiales.
   - Reparto principal (Top 10 actores con personaje y foto).
   - Reseñas de la comunidad y carrusel de títulos similares.

4. **Registro Completo de Películas (Log Modal)**:
   - Calificación visual de 0 a 10 (con saltos de 0.5 puntos).
   - Fecha de visualización y selector de Rewatch (si ya la habías visto).
   - Plataforma (Netflix, HBO Max, Disney+, Prime, Cine, Archivo físico).
   - Formato (Normal, 4K HDR, IMAX, DVD, Proyección).
   - Reseña pública y notas personales privadas.
   - Etiquetado de acompañantes con quienes viste la película.
   - **Selector de Póster Alternativo**: Elige entre las distintas versiones de póster oficiales de TMDB.
   - Desbloqueo automático de logros / badges y confeti conmemorativo.

5. **Diario de Cine (`/diary`)**:
   - Historial cronológico con fecha, póster personalizado o por defecto, rewatch tag, calificación y plataforma.
   - Botón de edición para modificar cualquier registro anterior.
   - **Ticket de Cine Retro (`/diary` -> platform: Cine)**: Al pulsar el icono de entrada en películas vistas en el cine, se despliega un ticket vintage coleccionable con código de barras, estrellas y opción de compartir.

6. **Watchlist & "¿Qué veo hoy?" (`/watchlist`)**:
   - Listado de películas pendientes por ver.
   - Filtro rápido por duración: `< 90 min`, `< 2 horas`, `< 3 horas`, `< 4 horas`.
   - Selector aleatorio interactivo con celebración.

7. **Mundial / Torneo Eliminatorio de Películas (`/tournament`)**:
   - Cuadro eliminatorio interactivo estilo bracket (Cuartos de final → Semifinales → Gran Final).
   - Duelos cara a cara donde votas por tu película preferida hasta coronar a la campeona.
   - Botón directo para registrar a la ganadora en tu diario.

8. **Estadísticas Detalladas (`/stats`)**:
   - Tiempo de vida frente a la pantalla (minutos, horas y días enteros).
   - Puntuación promedio y desglose de rewatches.
   - Ranking de géneros favoritos y plataformas de visualización.
   - Galería de logros y badges desbloqueados (Palomitas Frescas, Cinéfilo Auténtico, La Pluma de Oro, Maratonista de Sofá, Trotamundos, etc.).

9. **Conexiones / Actores Fetiche (`/connections`)**:
   - Algoritmo que calcula qué actores de reparto aparecen con mayor frecuencia en tus películas vistas.

10. **Cine-Traveler: Mapa Mundial (`/map`)**:
    - Pasaporte cinéfilo que agrupa las películas vistas por su país de origen (banderas, conteos y lista de títulos).

11. **Tracker de Temporada de Premios (`/awards`)**:
    - Seguimiento de nominaciones a los Oscars 2026 por categoría con barra de progreso.

12. **Comunidad y Almas Gemelas (`/social`)**:
    - Algoritmo de "Almas Gemelas del Cine" (compatibilidad de gustos cinéfilos).
    - Buscador de usuarios y sistema de seguimiento (Follow / Unfollow).
    - Feed social de la comunidad en tiempo real.

13. **Mensajería en Tiempo Real (`/chat`)**:
    - Chat directo entre usuarios conectado mediante canales Realtime de Supabase.

14. **Autenticación & Modo Demo (`/auth`)**:
    - Registro e inicio de sesión seguro con Supabase Auth.
    - Modo Invitado / Demo de 1 clic para probar inmediatamente la aplicación sin credenciales previas.

---

## 🛠️ Configuración de Variables de Entorno

El archivo `.env.local` ya se encuentra creado con las credenciales por defecto. Si deseas apuntar a un nuevo proyecto de Supabase, solo actualiza las siguientes variables:

```env
# TMDB (The Movie Database)
NEXT_PUBLIC_TMDB_API_KEY=31841cf8ea5ec78f32d856ec6e773ea0
NEXT_PUBLIC_TMDB_READ_TOKEN=eyJhbGciOiJIUzI1NiJ9...
NEXT_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3
NEXT_PUBLIC_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p/w500
NEXT_PUBLIC_TMDB_BACKDROP_BASE=https://image.tmdb.org/t/p/original

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

---

## 🗄️ Base de Datos en Supabase

En la raíz del proyecto tienes el archivo `schema.sql` listo para ser ejecutado en el **SQL Editor** de tu panel de Supabase:
1. Ve a tu proyecto en [Supabase](https://supabase.com).
2. Entra en la sección **SQL Editor**.
3. Copia el contenido de `schema.sql` y ejecútalo.
4. Creará automáticamente las tablas (`profiles`, `movies`, `logs`, `watchlist`, `relationships`, `log_companions`, `messages`, `user_badges`, `hidden_items`), índices, triggers de sincronización y políticas RLS.

---

## 💻 Comandos Disponibles

- Iniciar servidor de desarrollo:
  ```bash
  npm run dev
  ```
- Compilar para producción:
  ```bash
  npm run build
  ```
- Iniciar en producción:
  ```bash
  npm start
  ```
