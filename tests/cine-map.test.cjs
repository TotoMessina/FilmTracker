const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
const path = require('node:path');
function compile(file, mocks = {}) {
  const filename = path.resolve(file), mod = new Module(filename, module);
  mod.require = name => name in mocks ? mocks[name] : require(name);
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
  return mod.exports;
}
const helpers = compile('src/lib/services/cineMap.ts');
const log = (codes, rating = null, id = 1) => ({ tmdb_id: id, rating, movie: { title: `Film ${id}`, production_countries: codes.map(iso_3166_1 => ({ iso_3166_1 })) } });

test('coproductions count once per country per log; zero is rated and null is excluded', () => {
  const stats = helpers.getCineMapStats([log(['US', 'FR', 'US'], 0), log(['US'], 10), log(['FR'], null)]);
  assert.equal(stats.find(s => s.countryCode === 'US').count, 2);
  assert.equal(stats.find(s => s.countryCode === 'US').avgRating, 5);
  assert.equal(stats.find(s => s.countryCode === 'FR').avgRating, 0);
  assert.equal(stats[0].movies.length, 1);
  assert.equal(helpers.getCineMapStats([log(['AR'])])[0].avgRating, null);
});
test('representative films are distinct and limited to three', () => {
  const stats = helpers.getCineMapStats(Array.from({ length: 5 }, (_, i) => log(['JP'], 8, i)));
  assert.equal(stats[0].count, 5);
  assert.equal(stats[0].movies.length, 3);
});
test('empty and invalid origins do not fabricate visits', () => {
  assert.deepEqual(helpers.normaliseCountries([{ iso_3166_1: '??' }, null, { iso_3166_1: 'ZZ' }]), []);
  assert.equal(helpers.normaliseCountries([{ iso_3166_1: 'ar' }])[0].iso_3166_1, 'AR');
  const empty = helpers.getCineMapInsights([]);
  assert.equal(empty.diversity, 0); assert.equal(empty.suggestion, null);
  assert.equal(helpers.getCineMapInsights([log([])]).unknown, 1);
});
test('world coverage uses 195 countries and excludes territories from numerator', () => {
  assert.equal(helpers.PASSPORT_COUNTRIES.size, 195);
  const stats = helpers.getCineMapInsights([log(['US', 'PR', 'FR', 'PS', 'VA'])]);
  assert.equal(stats.visited, 4);
  assert.equal(stats.diversity, 4 / 195 * 100);
});
test('diversification threshold is strictly greater than 60%', () => {
  const rows = [...Array.from({ length: 6 }, () => log(['AR'])), ...Array.from({ length: 4 }, () => log(['FR']))];
  assert.equal(helpers.getCineMapInsights(rows).suggestion, null);
  assert.match(helpers.getCineMapInsights([...rows, log(['AR'])]).suggestion, /64%/);
});
test('US banner uses actual share; unknown origins are not assumed American', () => {
  const rows = [...Array.from({ length: 19 }, () => log(['US'])), log(['JP'])];
  assert.match(helpers.getCineMapInsights(rows).suggestion, /95%.*EE.UU/);
  assert.equal(helpers.getCineMapInsights([log(['US']), log([])]).suggestion, null);
});
test('map colors reach red at maximum and country geometry matches ISO codes', () => {
  assert.equal(helpers.countryColor(0, 10), '#27272a');
  assert.equal(helpers.countryColor(10, 10), 'rgb(220,38,38)');
  const map = JSON.parse(fs.readFileSync('public/maps/world-countries.json', 'utf8'));
  for (const code of ['US', 'AR', 'FR', 'NO', 'JP']) assert.ok(map.features.some(feature => feature.properties.countryCode === code), code);
  assert.ok(map.features.every(feature => feature.geometry && feature.properties.name));
});
test('country endpoint reads cache, persists authenticated enrichment and reports failed writes', async () => {
  let cached = { production_countries: [] }, writes = 0, calls = 0, failWrite = false;
  const db = { auth: { getUser: async () => ({ data: { user: { id: 'user' } }, error: null }) }, from() {
    let writing = false;
    const query = { select() { return query; }, eq() { return query; }, maybeSingle: async () => ({ data: cached, error: null }),
      update(payload) { writing = true; writes++; assert.deepEqual(Object.keys(payload), ['production_countries']); return query; },
      then(resolve) { resolve({ data: writing && !failWrite ? [{ tmdb_id: 1 }] : null, error: failWrite ? { message: 'Denied' } : null }); },
    }; return query;
  } };
  const route = compile('src/app/api/movies/[id]/country/route.ts', {
    'next/server': { NextResponse: { json: (data, options) => Response.json(data, options) } },
    '@/lib/supabase/client': { supabase: db, createAuthenticatedClient: () => db },
    '@/lib/tmdb/client': { getMovieDetails: async () => { calls++; return { id: 1, production_countries: [{ iso_3166_1: 'AR' }] }; } },
    '@/lib/services/cineMap': helpers,
  });
  const request = token => new Request('http://localhost/api/movies/1/country', { headers: token ? { Authorization: 'Bearer test' } : {} });
  const context = { params: Promise.resolve({ id: '1' }) };
  assert.equal((await route.GET(request(true), { params: Promise.resolve({ id: '-1' }) })).status, 400);
  assert.equal((await (await route.GET(request(true), context)).json()).persisted, true);
  assert.equal(writes, 1);
  failWrite = true;
  assert.equal((await (await route.GET(request(true), context)).json()).persisted, false);
  const beforeGuest = writes;
  assert.equal((await (await route.GET(request(false), context)).json()).countries[0].iso_3166_1, 'AR');
  assert.equal(writes, beforeGuest);
  cached = { production_countries: [{ iso_3166_1: 'FR' }] };
  const beforeCache = calls;
  assert.equal((await (await route.GET(request(false), context)).json()).countries[0].iso_3166_1, 'FR');
  assert.equal(calls, beforeCache);
});
