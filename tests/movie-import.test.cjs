const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
const path = require('node:path');
// Compile the pure import helpers in memory; no test build artifacts are needed.
const filename = path.resolve('src/lib/import/movies.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
const mod = new Module(filename, module);
mod.filename = filename;
mod.paths = module.paths;
mod._compile(compiled.outputText, filename);
const { validateMovie, parseTable, readImportFile, downloadTemplate } = mod.exports;
const XLSX = require('xlsx');

test('optional fields stay empty and zero is a valid rating', () => {
  assert.equal(validateMovie({ title: 'Alien' }).rating, null);
  assert.equal(validateMovie({ title: 'Alien' }).watched_at, null);
  assert.equal(validateMovie({ title: 'Alien', rating: 0 }).rating, 0);
});
test('scales and decimal commas are explicit', () => {
  assert.equal(validateMovie({ title: 'Alien', rating: '4,5' }, 5).rating, 9);
  assert.equal(validateMovie({ title: 'Alien', rating: 85 }, 100).rating, 8.5);
  assert.throws(() => validateMovie({ title: 'Alien', rating: 8 }, 5));
  assert.throws(() => validateMovie({ title: 'Alien', rating: true }));
});
test('invalid dates and missing titles fail with no silent coercion', () => {
  assert.throws(() => validateMovie({ title: 'Alien', watched_at: '2025-02-29' }));
  assert.equal(validateMovie({ title: 'Alien', watched_at: '29/02/2024' }).watched_at, '2024-02-29');
  assert.throws(() => validateMovie({ title: ' ' }));
});
test('Spanish template and Letterboxd columns map correctly', () => {
  assert.deepEqual(parseTable([['Título', 'Año', 'Puntaje', 'Fecha vista'], ['Alien', 1979, 9, '2024-01-02']], 10)[0], { title: 'Alien', year: 1979, rating: 9, watched_at: '2024-01-02', review: '', notes: '' });
  assert.equal(parseTable([['Name', 'Year', 'Rating', 'Watched Date'], ['Alien', 1979, 4.5, '2024-01-02']], 5)[0].rating, 9);
  assert.throws(() => parseTable([['Title', 'Nombre'], ['A', 'B']], 10));
  assert.throws(() => parseTable([['Title'], ...Array.from({ length: 101 }, () => ['Alien'])], 10));
});
test('CSV quoting, semicolons, accents and multiline reviews survive', async () => {
  const file = new File(['Título;Puntaje;Reseña\n"Amélie";"8,5";"Una reseña; con separador\ny salto"'], 'movies.csv');
  const { rows } = await readImportFile(file, 10);
  assert.equal(rows[0].title, 'Amélie');
  assert.equal(rows[0].rating, 8.5);
  assert.equal(rows[0].review, 'Una reseña; con separador\ny salto');
});
test('Excel round trip retains numeric scores and dates', async () => {
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet([['Título', 'Puntaje', 'Fecha vista'], ['Alien', 0, new Date('2024-02-29T00:00:00Z')]]), 'Peliculas');
  const bytes = XLSX.write(book, { type: 'buffer', bookType: 'xlsx' });
  const { rows } = await readImportFile(new File([bytes], 'movies.xlsx'), 10);
  assert.equal(rows[0].rating, 0);
  assert.equal(rows[0].watched_at, '2024-02-29');
});
test('template contains no sample movies that could be imported by accident', async () => {
  const original = XLSX.writeFile;
  let book;
  XLSX.writeFile = value => { book = value; };
  try { await downloadTemplate(); } finally { XLSX.writeFile = original; }
  assert.deepEqual(book.SheetNames, ['Peliculas', 'Instrucciones']);
  assert.equal(XLSX.utils.sheet_to_json(book.Sheets.Peliculas).length, 0);
  assert.equal(XLSX.utils.sheet_to_json(book.Sheets.Peliculas, { header: 1 })[0].length, 6);
});
test('unsupported and oversized files produce actionable errors', async () => {
  await assert.rejects(readImportFile(new File(['text'], 'movies.pdf'), 10), /Formato no compatible/);
  await assert.rejects(readImportFile(new File(['x'.repeat(2 * 1024 * 1024 + 1)], 'movies.txt'), 10), /2 MB/);
});
