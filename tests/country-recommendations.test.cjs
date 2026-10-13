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
function setup(options = {}) {
  const calls = { filters: [], users: [], details: [], prompts: [] };
  const history = options.history ?? [{ tmdb_id: 1, rating: 9, movie: { title: 'Favorite', genres: [{ id: 18, name: 'Drama' }] } }];
  const movies = options.movies ?? [1, 2, 3, 4, 5, 6].map(id => ({ id, title: `Film ${id}`, release_date: id === 6 ? '2999-01-01' : '2020-01-01', production_countries: [{ iso_3166_1: id === 5 ? 'US' : 'AR' }], overview: 'Synopsis', poster_path: '/poster.jpg' }));
  const db = {
    auth: { getUser: async () => ({ data: { user: options.unauthorized ? null : { id: 'signed-in-user' } } }) },
    from: () => ({ select() { return this; }, eq(key, value) { calls.users.push([key, value]); return this; }, order() { return this; }, range: async (start, end) => ({ data: history.slice(start, end + 1) }) }),
  };
  const route = compile('src/app/api/ai/country-recommendations/route.ts', {
    '@/lib/supabase/client': { createAuthenticatedClient: () => db },
    '@/lib/services/cineMap': helpers,
    '@/lib/tmdb/client': {
      STREAMING_PROVIDERS: [{ id: 8, name: 'Netflix' }, { id: 11, name: 'MUBI' }],
      discoverMovies: async filters => { calls.filters.push(filters); if (options.discoveryFails?.(filters)) throw new Error('TMDB temporarily unavailable'); return { results: movies }; },
      getMovieDetails: async id => { calls.details.push(id); if (options.detailFails?.(id)) throw new Error('TMDB temporarily unavailable'); return movies.find(movie => movie.id === id); },
    },
    '@/lib/groq/client': { GROQ_MODEL_LARGE: 'test-model', default: { chat: { completions: { create: async payload => {
      const prompt = JSON.parse(payload.messages[1].content); calls.prompts.push(prompt);
      const failure = options.aiFailures?.[calls.prompts.length - 1];
      if (failure instanceof Error) throw failure;
      if (failure) return { choices: [{ finish_reason: failure.finishReason || 'stop', message: { content: failure.content || '{}' } }] };
      return { choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ recommendations: options.picks ?? prompt.candidates.slice(0, 3).map(movie => ({ id: movie.id, reason: 'Por tu afinidad con el drama de Favorite.' })) }) } }] };
    } } } } },
  });
  process.env.GROQ_API_KEY = 'test-placeholder';
  const request = (body = { countryCode: 'AR', userId: 'someone-else' }, authenticated = true) => new Request('http://localhost/api/ai/country-recommendations', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(authenticated ? { Authorization: 'Bearer test-token' } : {}) }, body: JSON.stringify(body) });
  return { ...route, calls, request };
}
test('requires valid authentication and country', async () => {
  const api = setup();
  assert.equal((await api.POST(api.request({}, false))).status, 401);
  assert.equal((await api.POST(api.request({ countryCode: 'ZZ' }))).status, 400);
  const unauthorized = setup({ unauthorized: true });
  assert.equal((await unauthorized.POST(unauthorized.request())).status, 401);
});
test('uses signed-in history and only verified, unseen, released candidates', async () => {
  const api = setup();
  const response = await api.POST(api.request());
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).recommendations.map(movie => movie.id), [2, 3, 4]);
  assert.deepEqual(api.calls.users, [['user_id', 'signed-in-user']]);
  assert.ok(api.calls.filters.every(filter => filter.originCountry === 'AR'));
  assert.ok(!api.calls.details.includes(1) && !api.calls.details.includes(6));
  assert.deepEqual(api.calls.prompts[0].history.highestRated, [{ title: 'Favorite', rating: 9 }]);
  assert.deepEqual(api.calls.prompts[0].candidates.map(movie => movie.id), [2, 3, 4]);
  assert.match(response.headers.get('cache-control'), /no-store/);
});
test('rejects hallucinated IDs and duplicate recommendations', async () => {
  for (const ids of [[2, 3, 999], [2, 2, 3]]) {
    const api = setup({ picks: ids.map(id => ({ id, reason: 'A reason' })) });
    assert.equal((await api.POST(api.request())).status, 502);
  }
});
test('empty history gives actionable error without invoking AI', async () => {
  const api = setup({ history: [] });
  assert.equal((await api.POST(api.request())).status, 422);
  assert.equal(api.calls.prompts.length, 0);
});
test('sparse catalog returns honest fewer recommendations', async () => {
  const api = setup({ movies: [{ id: 9, title: 'Rare film', release_date: '2020-01-01', production_countries: [{ iso_3166_1: 'AR' }] }] });
  const response = await api.POST(api.request());
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.recommendations.length, 1);
  assert.match(body.notice, /1 pel/);
  const empty = setup({ movies: [] });
  assert.equal((await (await empty.POST(empty.request())).json()).recommendations.length, 0);
  assert.equal(empty.calls.prompts.length, 0);
});
test('paginates history so watched films beyond first page stay excluded', async () => {
  const history = Array.from({ length: 500 }, () => ({ tmdb_id: 100, rating: null, movie: null }));
  history.push({ tmdb_id: 2, rating: 0, movie: { title: 'Disliked', genres: [] } });
  const api = setup({ history });
  const response = await api.POST(api.request());
  assert.equal(response.status, 200);
  assert.ok(!(await response.json()).recommendations.some(movie => movie.id === 2));
  assert.equal(api.calls.users.length, 2);
  assert.equal(api.calls.prompts[0].history.lowestRated[0].rating, 0);
});
test('recovers from transient Groq failures and invalid or truncated output', async () => {
  for (const failure of [Object.assign(new Error('temporary'), { status: 503 }), { content: '{broken' }, { finishReason: 'length' }, { content: 'null' }]) {
    const api = setup({ aiFailures: [failure] });
    assert.equal((await api.POST(api.request())).status, 200);
    assert.equal(api.calls.prompts.length, 2);
  }
});
test('rate limits are classified without repeated quota consumption', async () => {
  const api = setup({ aiFailures: [Object.assign(new Error('quota'), { status: 429 })] });
  const response = await api.POST(api.request());
  assert.equal(response.status, 429);
  assert.equal((await response.json()).code, 'AI_RATE_LIMIT');
  assert.equal(api.calls.prompts.length, 1);
});
test('a failed discovery page does not discard usable candidates', async () => {
  const api = setup({ discoveryFails: query => query.page === 2 || !!query.genres });
  assert.equal((await api.POST(api.request())).status, 200);
});
test('complete catalog outage is distinguished from an empty catalog', async () => {
  for (const options of [{ discoveryFails: () => true }, { detailFails: () => true }]) {
    const api = setup(options);
    const response = await api.POST(api.request());
    assert.equal(response.status, 503);
    assert.equal((await response.json()).code, 'CATALOG_UNAVAILABLE');
    assert.equal(api.calls.prompts.length, 0);
  }
});
test('a later detail batch failing does not discard already verified movies', async () => {
  const movies = Array.from({ length: 14 }, (_, i) => ({ id: i + 2, title: `Film ${i}`, release_date: '2020-01-01', production_countries: [{ iso_3166_1: 'AR' }] }));
  const api = setup({ movies, detailFails: id => id >= 8 });
  assert.equal((await api.POST(api.request())).status, 200);
});
test('persistent upstream errors stop after two attempts with safe diagnostics', async () => {
  const failure = Object.assign(new Error('private provider payload'), { status: 500 });
  const api = setup({ aiFailures: [failure, failure] });
  const response = await api.POST(api.request());
  assert.equal(response.status, 503);
  assert.equal((await response.json()).code, 'AI_UNAVAILABLE');
  assert.equal(api.calls.prompts.length, 2);
});
test('platform filtering uses OR and verifies subscription availability in the viewing region', async () => {
  const provider = (id, name) => ({ provider_id: id, provider_name: name });
  const movie = (id, results) => ({ id, title: `Film ${id}`, release_date: '2020-01-01', production_countries: [{ iso_3166_1: 'JP' }], 'watch/providers': { results } });
  const api = setup({ movies: [
    movie(2, { AR: { flatrate: [provider(8, 'Netflix')] } }),
    movie(3, { AR: { flatrate: [provider(11, 'MUBI')] } }),
    movie(4, { AR: { rent: [provider(8, 'Netflix')] } }),
    movie(5, { JP: { flatrate: [provider(8, 'Netflix')] } }),
    movie(6, {}),
  ] });
  const response = await api.POST(api.request({ countryCode: 'JP', providerIds: [8, 11], watchRegion: 'AR' }));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body.recommendations.map(movie => movie.id), [2, 3]);
  assert.deepEqual(body.recommendations.map(movie => movie.platforms), [['Netflix'], ['MUBI']]);
  assert.ok(api.calls.filters.every(filter => filter.watchProviders === '8|11' && filter.watchRegion === 'AR' && filter.originCountry === 'JP' && filter.watchMonetizationTypes === 'flatrate'));
  assert.match(body.notice, /Argentina/);
});
test('empty availability does not silently remove the platform filter', async () => {
  const api = setup();
  const response = await api.POST(api.request({ countryCode: 'AR', providerIds: [8], watchRegion: 'MX' }));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body.recommendations, []);
  assert.match(body.notice, /quitar el filtro/);
  assert.equal(api.calls.prompts.length, 0);
});
test('invalid provider and region inputs are rejected before external calls', async () => {
  for (const filter of [{ providerIds: ['8'] }, { providerIds: [999] }, { providerIds: '8|11' }, { watchRegion: 'ZZ' }, { watchRegion: 123 }]) {
    const api = setup();
    assert.equal((await api.POST(api.request({ countryCode: 'AR', ...filter }))).status, 400);
    assert.equal(api.calls.filters.length, 0);
  }
});
