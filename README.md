# FilmTracker - Tu Diario de Cine 🎬

FilmTracker es una aplicación web moderna y dinámica diseñada para los amantes del cine. Permite rastrear películas vistas, descubrir nuevos títulos, analizar estadísticas personales y conectar con una comunidad de cinéfilos.

![FilmTracker Banner](./css/screenshot_placeholder.png)
*(Nota: Incluye una captura de pantalla de tu aplicación aquí)*

## ✨ Características Principales

FilmTracker ofrece una experiencia completa para el seguimiento de películas:

*   **📊 Dashboard Personalizado**: Vista general de tu actividad reciente, películas favoritas y estadísticas rápidas.
*   **🔎 Búsqueda Potente**: Encuentra películas utilizando la API de TMDB, con detalles completos, reparto y recomendaciones.
*   **📓 Diario de Cine**: Registra las películas que ves, califícalas y añade reseñas personales.
*   **🔖 Watchlist**: Guarda películas que quieres ver en el futuro.
*   **📈 Estadísticas Avanzadas**: Gráficos interactivos sobre tus géneros favoritos, directores más vistos y hábitos de visualización (powered by Chart.js).
*   **🏆 Premios y Torneos**: Participa en predicciones de premios y torneos de películas entre usuarios.
*   **🌍 Cine-Traveler (Mapa)**: Visualiza el origen de las películas que has visto en un mapa interactivo.
*   **🤝 Comunidad y Social**: Sigue a otros usuarios, ve sus actividades y chatea en tiempo real.
*   **🧩 Conexiones**: Descubre conexiones entre actores y películas (tipo "Six Degrees of Kevin Bacon").
*   **🎖️ Badges y Gamificación**: Desbloquea logros por tu actividad cinéfila.

## 🛠️ Tecnologías Utilizadas

El proyecto está construido utilizando tecnologías web modernas estándar, sin necesidad de frameworks pesados de compilación para el frontend principal, lo que lo hace ligero y fácil de desplegar.

*   **Frontend**:
    *   HTML5 Semántico
    *   CSS3 (Variables, Flexbox, Grid, Diseño Responsivo)
    *   JavaScript (ES6+ Modules)
*   **Backend / Servicios**:
    *   **[Supabase](https://supabase.com/)**: Base de datos (PostgreSQL), Autenticación y Realtime.
    *   **[TMDB API](https://www.themoviedb.org/documentation/api)**: Fuente de datos para metadata de películas, imágenes y créditos.
*   **Librerías Clave**:
    *   *Chart.js*: Para visualización de datos y estadísticas.
    *   *Leaflet / Vector Maps* (según implementación de Mapas).
    *   *FontAwesome 6*: Iconografía.
    *   *Google Fonts*: Tipografías (Inter, Outfit).

## 🚀 Configuración e Instalación

Sigue estos pasos para correr el proyecto localmente:

### 1. Prerrequisitos
*   Una cuenta en [Supabase](https://supabase.com/).
*   Una API Key de [The Movie Database (TMDB)](https://www.themoviedb.org/settings/api).
*   Un servidor web local (como Live Server en VS Code o Python SimpleHTTPServer) para soportar módulos ES6.

### 2. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/filmtracker.git
cd filmtracker
```

### 3. Configuración de Variables de Entorno
El archivo `js/config.js` maneja las credenciales. Asegúrate de configurar tus propias claves:

1.  Abre `js/config.js`.
2.  Reemplaza los valores con tus propias credenciales:

```javascript
export const CONFIG = {
    TMDB_API_KEY: 'TU_TMDB_API_KEY',
    TMDB_READ_TOKEN: 'TU_TMDB_READ_TOKEN',
    SUPABASE_URL: 'TU_SUPABASE_URL',
    SUPABASE_KEY: 'TU_SUPABASE_ANON_KEY',
    // ... otras configuraciones
};
```

### 4. Configurar Base de Datos (Supabase)
Necesitas crear las tablas necesarias en tu proyecto de Supabase. Ejecuta los scripts SQL proporcionados en el editor SQL de Supabase en el siguiente orden aproximado:

1.  `schema.sql` (Tablas base: users, movies, reviews)
2.  `schema_social.sql` (Funciones sociales: follows, feed)
3.  `schema_relationships.sql`, `schema_badges.sql`, etc. (Resto de funcionalidades)

### 5. Ejecutar la Aplicación
Dado que el proyecto usa Módulos de ES6 (`import`/`export`), necesitas servir los archivos a través de un servidor HTTP. **No puedes simplemente abrir el `index.html` haciendo doble clic.**

*   **Opción A (VS Code)**: Instala la extensión "Live Server", haz clic derecho en `index.html` y selecciona "Open with Live Server".
*   **Opción B (Python)**:
    ```bash
    python -m http.server 8000
    ```
    Luego abre `http://localhost:8000` en tu navegador.
*   **Opción C (Node)**:
    ```bash
    npx serve .
    ```

## 📱 Estructura del Proyecto

```
/
├── index.html          # Landing page y Login/Registro
├── app.html            # Aplicación principal (Dashboard)
├── css/                # Estilos globales y específicos
├── js/
│   ├── app.js          # Punto de entrada de la lógica de la app
│   ├── auth.js         # Manejo de autenticación
│   ├── config.js       # Configuración y claves API
│   ├── tmdb-api.js     # Cliente para la API de TMDB
│   └── features/       # Módulos de funcionalidades (Dashboard, Diario, etc.)
└── *.sql               # Scripts de esquema de base de datos
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Siéntete libre de usarlo y modificarlo.

---
Hecho con ❤️ para los amantes del cine.
