const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
const path = require('node:path');
function compile(file, mocks = {}) {
  const filename = path.resolve(file);
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = new Module(filename, module);
  mod.paths = module.paths;
  mod.require = name => name in mocks ? mocks[name] : require(name);
  mod._compile(source, filename);
  return mod.exports;
}
const helpers = compile('src/lib/import/movies.ts');
function route(match) {
  let calls = 0;
  return compile('src/app/api/import/movies/route.ts', {
    'next/server': { NextResponse: { json: (body, options) => Response.json(body, options) } },
    '@/lib/supabase/client': { supabase: { auth: { getUser: async () => ({ data: { user: { id: 'user' } }, error: null }) } } },
    '@/lib/import/movies': helpers,
    '@/lib/tmdb/client': { searchMovies: async () => ({ results: [{ id: 348, title: 'Alien', release_date: '1979-05-25' }] }) },
    '@/lib/groq/client': { default: { chat: { completions: { create: async () => ({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(++calls === 1 ? { titles: ['Alien'] } : { matches: [match] }) } }] }) } } }, GROQ_MODEL_FAST: 'test' },
  });
}
const request = (year = 1979, authorized = true) => new Request('http://localhost/api/import/movies', { method: 'POST', headers: authorized ? { Authorization: 'Bearer test' } : {}, body: JSON.stringify({ action: 'match', rows: [{ title: 'Alien', year }] }) });
test('unauthenticated requests cannot invoke Groq', async () => {
  const response = await route({}).POST(request(1979, false));
  assert.equal(response.status, 401);
});
test('only a verified, high confidence, year-compatible TMDB ID is selected', async () => {
  const previous = process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY = 'test';
  try {
    for (const [id, confidence, year, expected] of [[348, 'alta', 1979, 348], [999, 'alta', 1979, null], [348, 'media', 1979, null], [348, 'alta', 2010, null]]) {
      const response = await route({ id, confidence, reason: 'Test' }).POST(request(year));
      assert.equal(response.status, 200);
      assert.equal((await response.json()).results[0].selectedId, expected);
    }
  } finally { if (previous === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = previous; }
});
