const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
const path = require('node:path');
function compile(file, mocks = {}) {
  const filename = path.resolve(file);
  const mod = new Module(filename, module);
  mod.require = name => name in mocks ? mocks[name] : require(name);
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
  return mod.exports;
}
const helper = compile('src/lib/groq/recap.ts');
const film = (id, date) => ({ id, title: `Película ${id}`, release_date: date, genres: [{ name: 'Aventura' }] });
const valid = { recap: 'Los personajes buscan su lugar en el mundo.\n\nSus motivaciones los enfrentan a nuevos desafíos.', keyCharacters: ['Ana — una exploradora'], cliffhangerNote: 'Un viaje aún está por comenzar.' };

test('predecessor uses release order, excluding current, undated and unreleased movies', () => {
  const parts = [film(3, '2027-01-01'), film(1, '2020-01-01'), film(4), film(2, '2023-01-01')];
  assert.equal(helper.previousCollectionMovie(film(3, '2027-01-01'), parts, '2026-10-12').id, 2);
  assert.equal(helper.previousCollectionMovie(film(1, '2020-01-01'), parts), null);
  assert.equal(helper.previousCollectionMovie(film(4), parts), null);
  assert.equal(helper.previousCollectionMovie(film(5, '2028-01-01'), parts, '2026-10-12').id, 2);
});
test('ambiguous or invalid release dates do not invent a predecessor', () => {
  assert.equal(helper.previousCollectionMovie(film(3, '2026-01-01'), [film(1, '2024-01-01'), film(2, '2024-01-01')]), null);
  assert.equal(helper.previousCollectionMovie(film(3, '2026-01-01'), [film(1, '2025-02-30')]), null);
});
test('response validation requires all sections and 2–3 paragraphs', () => {
  assert.equal(helper.isRecap(valid), true);
  assert.equal(helper.isRecap({ ...valid, recap: 'One paragraph' }), false);
  assert.equal(helper.isRecap({ ...valid, keyCharacters: [] }), false);
  assert.equal(helper.isRecap({ ...valid, cliffhangerNote: null }), false);
});
test('reopening shares the pending request and reads sessionStorage without a second API call', async () => {
  const oldFetch = global.fetch, oldStorage = global.sessionStorage;
  const storage = new Map();
  let calls = 0;
  global.sessionStorage = { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) };
  global.fetch = async (_url, options) => {
    calls++;
    const data = JSON.parse(options.body);
    assert.equal(data.title, 'Película 1');
    assert.equal(data.sequelTitle, 'Película 2');
    assert.deepEqual(data.genres, ['Aventura']);
    return Response.json(valid);
  };
  try {
    const movie = film(2, '2026-01-01'), previous = film(1, '2020-01-01');
    const [first, concurrent] = await Promise.all([helper.loadRecap(movie, previous), helper.loadRecap(movie, previous)]);
    assert.deepEqual(first, concurrent);
    assert.deepEqual(await helper.loadRecap(movie, previous), first);
    assert.equal(calls, 1);
    assert.ok(storage.has('recap_2'));
    storage.set('recap_2', '{corrupt');
    await helper.loadRecap(movie, previous);
    assert.equal(calls, 2);
  } finally { global.fetch = oldFetch; global.sessionStorage = oldStorage; }
});
test('failures are not cached and can be retried when storage is unavailable', async () => {
  const oldFetch = global.fetch, oldStorage = global.sessionStorage;
  let calls = 0;
  global.sessionStorage = { getItem() { throw Error('Blocked'); }, setItem() { throw Error('Blocked'); } };
  global.fetch = async () => ++calls === 1 ? Response.json({ error: 'Intentá nuevamente' }, { status: 502 }) : Response.json(valid);
  try {
    await assert.rejects(helper.loadRecap(film(8, '2026-01-01'), film(7, '2020-01-01')), /Intentá nuevamente/);
    assert.equal((await helper.loadRecap(film(8, '2026-01-01'), film(7, '2020-01-01'))).data.recap, valid.recap);
    assert.equal(calls, 2);
  } finally { global.fetch = oldFetch; global.sessionStorage = oldStorage; }
});
test('endpoint validates input, uses requested Groq settings and rejects incomplete output', async () => {
  const oldKey = process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY = 'test';
  let calls = 0, finish = 'stop';
  const route = compile('src/app/api/ai/recap-express/route.ts', {
    'next/server': { NextResponse: { json: (data, options) => Response.json(data, options) } },
    '@/lib/groq/recap': helper,
    '@/lib/groq/client': { GROQ_MODEL_LARGE: 'large-model', default: { chat: { completions: { create: async options => {
      calls++;
      assert.equal(options.model, 'large-model');
      assert.equal(options.temperature, 0.3);
      assert.equal(options.max_tokens, 600);
      assert.match(options.messages[0].content, /REGLA ABSOLUTA/);
      return { choices: [{ finish_reason: finish, message: { content: JSON.stringify(valid) } }] };
    } } } } },
  });
  const request = body => new Request('http://localhost/api/ai/recap-express', { method: 'POST', body: JSON.stringify(body) });
  const body = { title: 'Anterior', year: '2020', sequelTitle: 'Secuela', genres: ['Drama'] };
  try {
    assert.equal((await route.POST(request({ ...body, genres: 'Drama' }))).status, 400);
    assert.equal((await route.POST(request(null))).status, 400);
    assert.equal(calls, 0);
    const response = await route.POST(request(body));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), valid);
    finish = 'length';
    assert.equal((await route.POST(request(body))).status, 502);
  } finally { if (oldKey === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = oldKey; }
});
