export const MAX_IMPORT_ROWS = 100;
export const MAX_FILE_SIZE = 2 * 1024 * 1024;
export const IMPORT_ACCEPT = '.xlsx,.xls,.ods,.csv,.tsv,.txt,.md,.json';

export interface ImportMovie {
  title: string;
  year: number | null;
  rating: number | null;
  watched_at: string | null;
  review: string;
  notes: string;
}

export interface Candidate {
  id: number;
  title: string;
  original_title?: string;
  release_date?: string;
}

export interface MatchedMovie {
  row: ImportMovie;
  candidates: Candidate[];
  selectedId: number | null;
  reason: string;
}

const aliases: Record<string, keyof ImportMovie> = {
  titulo: 'title', pelicula: 'title', title: 'title', name: 'title', nombre: 'title',
  ano: 'year', year: 'year', anio: 'year',
  puntaje: 'rating', puntuacion: 'rating', rating: 'rating', nota: 'rating',
  fecha: 'watched_at', fechavista: 'watched_at', watchedat: 'watched_at', watcheddate: 'watched_at',
  resena: 'review', review: 'review', notas: 'notes', notes: 'notes',
};
const key = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');
const blank = (v: unknown) => v === null || v === undefined || v === '';

export function validateMovie(input: unknown, scale = 10): ImportMovie {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Registro inválido.');
  const raw = input as Record<string, unknown>;
  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  if (!title || title.length > 300) throw new Error('El título es obligatorio (máximo 300 caracteres).');
  const number = (v: unknown) => typeof v === 'number' ? v : typeof v === 'string' && /^\d+(?:[.,]\d+)?$/.test(v.trim()) ? Number(v.replace(',', '.')) : NaN;
  const rating = blank(raw.rating) ? null : number(raw.rating);
  if (rating !== null && (!Number.isFinite(rating) || rating < 0 || rating > scale)) throw new Error(`Puntaje inválido para “${title}”: usá la escala 0–${scale}.`);
  const year = blank(raw.year) ? null : number(raw.year);
  if (year !== null && (!Number.isInteger(year) || year < 1880 || year > 2200)) throw new Error(`Año inválido para “${title}”.`);
  let date = blank(raw.watched_at) ? null : raw.watched_at instanceof Date ? raw.watched_at.toISOString().slice(0, 10) : String(raw.watched_at).trim();
  if (date) {
    const match = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) date = `${match[3]}-${match[2]}-${match[1]}`;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) throw new Error(`Fecha inválida para “${title}”: usá AAAA-MM-DD.`);
  }
  const text = (v: unknown) => blank(v) ? '' : String(v);
  if (text(raw.review).length > 5000 || text(raw.notes).length > 5000) throw new Error('Las reseñas y notas admiten hasta 5000 caracteres.');
  return { title, year, rating: rating === null ? null : Math.round(rating * 10 / scale * 10) / 10, watched_at: date, review: text(raw.review), notes: text(raw.notes) };
}

export function parseTable(table: unknown[][], scale: number): ImportMovie[] {
  const rows = table.filter(row => row.some(v => !blank(v)));
  if (!rows.length) throw new Error('El archivo está vacío.');
  const fields = rows[0].map(v => aliases[key(String(v))]);
  if (!fields.includes('title')) throw new Error('Falta la columna Título (también se acepta Película, Title o Name).');
  const known = fields.filter(Boolean);
  if (new Set(known).size !== known.length) throw new Error('Hay columnas repetidas para el mismo campo.');
  if (rows.length - 1 > MAX_IMPORT_ROWS) throw new Error(`El máximo es ${MAX_IMPORT_ROWS} películas por archivo.`);
  return rows.slice(1).map((row, index) => {
    const record: Record<string, unknown> = {};
    fields.forEach((field, col) => { if (field) record[field] = row[col]; });
    try { return validateMovie(record, scale); } catch (error) { throw new Error(`Fila ${index + 2}: ${(error as Error).message}`); }
  });
}

export async function readImportFile(file: File, scale: number): Promise<{ rows?: ImportMovie[]; text?: string }> {
  if (!file.size || file.size > MAX_FILE_SIZE) throw new Error('El archivo debe tener contenido y pesar hasta 2 MB.');
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (['xlsx', 'xls', 'ods', 'csv', 'tsv'].includes(ext || '')) {
    const XLSX = await import('xlsx');
    const isText = ext === 'csv' || ext === 'tsv';
    const book = XLSX.read(isText ? await file.text() : await file.arrayBuffer(), { type: isText ? 'string' : 'array', cellDates: true, raw: true, sheetRows: MAX_IMPORT_ROWS + 2 });
    const name = book.SheetNames.includes('Peliculas') ? 'Peliculas' : book.SheetNames[0];
    if (!name) throw new Error('No hay hojas para importar.');
    const sheet = book.Sheets[name];
    const range = sheet['!fullref'] || sheet['!ref'];
    if (range && XLSX.utils.decode_range(range).e.r > MAX_IMPORT_ROWS) throw new Error(`El máximo es ${MAX_IMPORT_ROWS} películas. Eliminá las filas adicionales.`);
    return { rows: parseTable(XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '', raw: true }), scale) };
  }
  if (!['txt', 'md', 'json'].includes(ext || '')) throw new Error('Formato no compatible. Usá Excel, ODS, CSV, TSV, TXT, Markdown o JSON.');
  const text = await file.text();
  if (text.length > 40000 || text.includes('\u0000')) throw new Error('El texto debe ser legible y tener hasta 40.000 caracteres.');
  return { text };
}

export async function downloadTemplate() {
  const XLSX = await import('xlsx');
  const book = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([['Título', 'Año', 'Puntaje', 'Fecha vista', 'Reseña', 'Notas']]);
  sheet['!cols'] = [{ wch: 38 }, { wch: 12 }, { wch: 14 }, { wch: 18 }, { wch: 50 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(book, sheet, 'Peliculas');
  const guide = XLSX.utils.aoa_to_sheet([
    ['Campo', 'Cómo completarlo'], ['Título', 'Obligatorio. Nombre original o en español. Una película por fila.'],
    ['Año', 'Opcional. Año de estreno; ayuda a distinguir remakes.'], ['Puntaje', 'Opcional. De 0 a 10; el cero es un puntaje válido. Vacío = sin puntaje.'],
    ['Fecha vista', 'Opcional. AAAA-MM-DD. Vacío = fecha desconocida.'], ['Reseña', 'Opcional. Se publicará en tu diario.'], ['Notas', 'Opcional. Notas personales.'],
    ['Importación', 'Completá la hoja Peliculas, hasta 100 filas. Revisá las asociaciones antes de guardar.'],
    ['Otras escalas', 'Si tus puntajes van de 0 a 5 o de 0 a 100, seleccioná esa escala al cargar.'],
    ['Duplicados', 'Se omiten películas que ya están en tu diario; no se reemplazan puntajes existentes.'],
  ]);
  guide['!cols'] = [{ wch: 20 }, { wch: 100 }];
  XLSX.utils.book_append_sheet(book, guide, 'Instrucciones');
  XLSX.writeFile(book, 'FilmTracker-plantilla.xlsx');
}
