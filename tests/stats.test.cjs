const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
const path = require('node:path');
const filename = path.resolve('src/lib/stats.ts');
const mod = new Module(filename, module);
mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
const { calculateStats, filterStatsLogs, watchedDate } = mod.exports;
const movie = { title: 'Alien', runtime: 120, release_date: '1979-05-25', production_countries: [{ name: 'Estados Unidos' }, { name: 'Reino Unido' }], cast_data: [{ name: 'Sigourney Weaver', character: 'Ripley' }, { name: 'Ridley Scott', character: 'Director' }] };
const log = (props = {}) => ({ tmdb_id: 348, rating: null, watched_at: null, movie, ...props });

test('empty histories return finite totals and no fabricated activity', () => {
  const stats = calculateStats([], '2026');
  assert.equal(stats.totalMinutes, 0);
  assert.equal(stats.median, null);
  assert.equal(stats.longestStreak, 0);
  assert.equal(stats.months.length, 12);
  assert.equal(stats.histogram.reduce((n, row) => n + row.count, 0), 0);
});
test('zero and decimal ratings use correct bins and median', () => {
  const stats = calculateStats([log({ rating: 0 }), log({ rating: 8.9 }), log({ rating: 10 }), log({ rating: null })], 'all');
  assert.equal(stats.ratings.length, 3);
  assert.equal(stats.histogram[0].count, 1);
  assert.equal(stats.histogram[8].count, 1);
  assert.equal(stats.histogram[10].count, 1);
  assert.equal(stats.median, 8.9);
  assert.equal(calculateStats([log({ rating: 0 }), log({ rating: 10 })], 'all').median, 5);
});
test('unknown watch dates never use import dates and January stays in its year', () => {
  const rows = [log({ watched_at: '2026-01-01' }), log({ created_at: '2026-10-10' }), log({ watched_at: '2025-12-31' })];
  assert.equal(filterStatsLogs(rows, '2026').length, 1);
  assert.equal(filterStatsLogs(rows, 'all').length, 3);
  assert.equal(watchedDate(log({ watched_at: '2025-02-29' })), null);
  const stats = calculateStats(filterStatsLogs(rows, '2026'), '2026');
  assert.equal(stats.months[0].count, 1);
  assert.equal(stats.weekdays[3].count, 1); // Thursday, in every timezone.
});
test('streaks count consecutive distinct days across year and leap-day boundaries', () => {
  const rows = ['2023-12-31', '2024-01-01', '2024-01-01', '2024-02-28', '2024-02-29', '2024-03-01'].map(watched_at => log({ watched_at }));
  const stats = calculateStats(rows, 'all');
  assert.equal(stats.activeDays, 5);
  assert.equal(stats.longestStreak, 3);
});
test('runtime coverage excludes missing durations, unique titles differ from viewings', () => {
  const stats = calculateStats([log(), log(), log({ tmdb_id: 999, movie: { ...movie, runtime: null } })], 'all');
  assert.equal(stats.totalMinutes, 240);
  assert.equal(stats.knownRuntimes, 2);
  assert.equal(stats.uniqueMovies, 2);
});
test('directors are excluded from actors and coproductions count once per country per viewing', () => {
  const stats = calculateStats([log(), log()], 'all');
  assert.deepEqual(stats.directors, [{ name: 'Ridley Scott', count: 2 }]);
  assert.deepEqual(stats.actors, [{ name: 'Sigourney Weaver', count: 2 }]);
  assert.equal(stats.countries.length, 2);
  assert.equal(stats.countries[0].count, 2);
  assert.deepEqual(stats.decades, [{ name: '1970s', count: 2 }]);
});
test('favorites average multiple ratings for a movie and omit unrated titles', () => {
  const stats = calculateStats([log({ rating: 6 }), log({ rating: 10 }), log({ tmdb_id: 999 })], 'all');
  assert.equal(stats.topMovies.length, 1);
  assert.equal(stats.topMovies[0].rating, 8);
});
test('rolling monthly chart includes empty months and crosses calendar years', () => {
  const stats = calculateStats([log({ watched_at: '2025-11-01' }), log({ watched_at: '2026-10-01' }), log({ watched_at: '2025-10-01' })], 'all', new Date(2026, 9, 10));
  assert.equal(stats.months.length, 12);
  assert.equal(stats.months[0].count, 1);
  assert.equal(stats.months[11].count, 1);
  assert.equal(stats.months.reduce((sum, month) => sum + month.count, 0), 2);
});
