# Importación de películas

Acceso: perfil propio → **Importar películas y puntajes**, o `/import`.

- Archivos: XLSX, XLS, ODS, CSV, TSV, TXT, Markdown y JSON. No se admiten PDF, imágenes ni documentos de Word.
- Máximo: 2 MB, 100 películas; texto libre hasta 40.000 caracteres.
- Excel: hoja `Peliculas` si existe; en caso contrario, primera hoja. La plantilla descargable incluye instrucciones y no contiene películas de ejemplo.
- Solo el título es obligatorio. Año de estreno, puntaje, fecha de visionado, reseña y notas son opcionales. Sin fecha se guarda `null`; sin puntaje se guarda `null`, distinto de cero.
- Seleccionar la escala original (5, 10 o 100). Los puntajes se convierten a 0–10, con un decimal.
- Las tablas se leen localmente. Groq extrae los registros del texto libre; después propone títulos alternativos y selecciona entre candidatos reales de TMDB, en lotes de cinco.
- Las asociaciones requieren revisión antes de guardar. IDs ajenos a los candidatos, años incompatibles y confianza media/baja quedan sin seleccionar. Se permite buscar y elegir otra película.
- Las películas que ya tengan un registro en el diario se omiten, incluso si la fecha es diferente. No modifica puntajes existentes ni importa revisiones repetidas de la misma película.
- Cada fila conserva un UUID durante los reintentos. Los resultados se informan por fila y las importaciones exitosas quedan bloqueadas para impedir repeticiones accidentales. La comprobación de duplicados no es una restricción transaccional entre pestañas concurrentes.

## Configuración y verificación

Requiere `GROQ_API_KEY`, configuración TMDB y una sesión Supabase válida. Usa las tablas y políticas existentes; no requiere migración. El endpoint verifica el token con Supabase y el guardado usa la sesión del usuario y sus políticas RLS.

Dependencia de lectura/generación en tiempo de ejecución: SheetJS 0.20.3, instalada desde la distribución oficial: https://docs.sheetjs.com/docs/getting-started/installation/nodejs/.

Pruebas locales: `node --test tests/movie-import.test.cjs tests/movie-import-api.test.cjs`.

Comprobación manual con una cuenta de prueba: descargar y completar la plantilla, analizar, corregir una asociación dudosa, importar, verificar el diario y repetir la carga para comprobar las omisiones. Las pruebas automatizadas usan respuestas simuladas de Groq/TMDB y no escriben en una cuenta real.
