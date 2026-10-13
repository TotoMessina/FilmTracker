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
const helpers = compile('src/lib/groq/directorsCut.ts');
const result = {
  primaryDirector: { name: 'Denis Villeneuve', percentage: 60, reason: 'Preferís la contemplación.' },
  secondaryDirector: { name: 'David Fincher', percentage: 25, reason: 'Te atrae la precisión.' },
  thirdDirector: { name: 'Agnès Varda', percentage: 15, reason: 'Buscás miradas personales.' },
  headline: 'Paciencia visual con lupa de detective.', deepDive: 'Te gusta mirar con atención. El detalle cuenta.', blindSpot: 'Quizás exploraste poco la comedia.',
};
const logs = [0, 10, null].map(rating => ({ tmdb_id: 1, rating, movie: { runtime: rating === null ? null : 120, release_date: '1999-01-01', genres: [{ name: 'Drama' }] } }));
const stats = helpers.buildDirectorsCutStats(logs, new Map([[1, ['Directora A', 'Directora A', 'Director B']]]));

test('co-directors count once per viewing, zero is rated and null is not', () => {
  assert.equal(stats.totalLogs, 3);
  assert.equal(stats.topDirectors.length, 2);
  assert.deepEqual(stats.topDirectors.find(d => d.name === 'Directora A'), { name: 'Directora A', watchCount: 3, avgRating: 5 });
  assert.deepEqual(stats.topGenres, [{ name: 'Drama', avgRating: 5 }]);
  assert.deepEqual(stats.decadeDistribution, { '1990s': 3 });
  assert.equal(stats.avgRuntime, 120);
  assert.equal(helpers.isDirectorsCutStats(stats), true);
});
test('missing metadata does not invent directors, decades or runtime', () => {
  const data = helpers.buildDirectorsCutStats([{ tmdb_id: 1, rating: null }], new Map());
  assert.equal(data.avgRuntime, 0);
  assert.deepEqual(data.decadeDistribution, {});
  assert.deepEqual(data.topDirectors, []);
  assert.equal(helpers.isDirectorsCutStats(data), false);
});
test('input and output validation reject malformed data and inconsistent percentages', () => {
  assert.equal(helpers.isDirectorsCutStats({ ...stats, decadeDistribution: null }), false);
  assert.equal(helpers.isDirectorsCutStats({ ...stats, totalLogs: 0 }), false);
  assert.equal(helpers.isDirectorsCutResult(result), true);
  assert.equal(helpers.isDirectorsCutResult({ ...result, thirdDirector: { ...result.thirdDirector, percentage: 20 } }), false);
  assert.equal(helpers.isDirectorsCutResult({ ...result, secondaryDirector: { ...result.secondaryDirector, name: result.primaryDirector.name } }), false);
});
test('client loads all pages and fetches credits once per unique movie', async () => {
  let creditCalls = 0, pages = 0;
  const service = compile('src/lib/services/directorsCut.ts', {
    '@/lib/groq/directorsCut': helpers,
    '@/lib/tmdb/client': { getMovieCredits: async () => { creditCalls++; return { crew: [{ job: 'Director', name: 'Directora A' }, { job: 'Producer', name: 'Otra persona' }] }; } },
    '@/lib/supabase/client': { supabase: { from() {
      const query = { select() { return query; }, eq() { return query; }, order() { return query; }, range(offset) { pages++; return Promise.resolve({ data: offset === 0 ? Array.from({ length: 500 }, () => logs[0]) : [logs[1]], error: null }); } };
      return query;
    } } },
  });
  const data = await service.loadDirectorsCutStats('user', () => {});
  assert.equal(pages, 2); assert.equal(creditCalls, 1);
  assert.equal(data.totalLogs, 501); assert.equal(data.topDirectors[0].watchCount, 501);
});
test('API uses requested Groq model and temperature, rejects bad input and incomplete output', async () => {
  const old = process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY = 'test';
  let calls = 0, finish = 'stop';
  const route = compile('src/app/api/ai/directors-cut/route.ts', {
    '@/lib/groq/directorsCut': helpers,
    'next/server': { NextResponse: { json: (body, options) => Response.json(body, options) } },
    '@/lib/groq/client': { GROQ_MODEL_LARGE: 'large', default: { chat: { completions: { create: async options => {
      calls++; assert.equal(options.model, 'large'); assert.equal(options.temperature, 0.8);
      return { choices: [{ finish_reason: finish, message: { content: JSON.stringify(result) } }] };
    } } } } },
  });
  const request = data => new Request('http://localhost/api/ai/directors-cut', { method: 'POST', body: JSON.stringify(data) });
  try {
    assert.equal((await route.POST(request({}))).status, 400); assert.equal(calls, 0);
    const response = await route.POST(request(stats));
    assert.equal(response.status, 200); assert.deepEqual(await response.json(), result);
    finish = 'length'; assert.equal((await route.POST(request(stats))).status, 502);
  } finally { if (old === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = old; }
});
test('share helper downloads when unsupported and does not download on cancellation', async () => {
  const previousNavigator = Object.getOwnPropertyDescriptor(global, 'navigator'), previousDocument = global.document;
  let downloads = 0;
  const share = compile('src/lib/utils/shareCanvas.ts');
  global.document = { createElement: () => ({ click: () => downloads++ }) };
  const canvas = { toBlob: callback => callback(new Blob(['png'])), toDataURL: () => 'data:image/png;base64,a' };
  try {
    Object.defineProperty(global, 'navigator', { configurable: true, value: {} });
    assert.equal(await share.shareCanvas(canvas, 'dna.png', 'DNA', 'Text'), 'downloaded');
    assert.equal(downloads, 1);
    Object.defineProperty(global, 'navigator', { configurable: true, value: { canShare: () => true, share: async () => { throw new DOMException('Cancelled', 'AbortError'); } } });
    assert.equal(await share.shareCanvas(canvas, 'dna.png', 'DNA', 'Text'), 'cancelled');
    assert.equal(downloads, 1);
  } finally { global.document = previousDocument; if (previousNavigator) Object.defineProperty(global, 'navigator', previousNavigator); else delete global.navigator; }
});
test('export wraps long text and grows canvas to contain every block', () => {
  const previousDocument = global.document, draws = [];
  const context = { font: '', measureText(text) { return { width: text.length * parseFloat(this.font.split(' ')[1]) * 0.6 }; }, createLinearGradient() { return { addColorStop() {} }; }, fillRect() {}, strokeRect() {}, fillText(text, x, y) { draws.push({ text, x, y, width: this.measureText(text).width }); } };
  const canvas = { width: 0, height: 0, getContext: () => context };
  global.document = { createElement: () => canvas };
  try {
    const image = compile('src/lib/utils/directorsCutImage.ts').drawDirectorsCutImage({ ...result, blindSpot: 'UnaPalabraMuyLarga'.repeat(20) }, 'cinéfilo');
    assert.equal(image.width, 1080);
    assert.ok(draws.every(draw => draw.width <= 900 && draw.y < image.height - 60));
    assert.ok(draws.some(draw => draw.text.includes('Varda')));
  } finally { global.document = previousDocument; }
});
