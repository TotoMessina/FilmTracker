const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
const path = require('node:path');
const filename = path.resolve('src/lib/services/sharedWatchlists.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const original = { id: 'shared', created_by: 'owner', title: 'Juntos', created_at: '2026-01-01', updated_at: '2026-01-01T00:00:00.000Z', members: [{ id: 'owner' }, { id: 'member' }], movies: [] };

// Independent clients share a fake database, with creator-only INSERT permission.
function client(database, userId) {
  const supabase = { from() {
    let action = 'read', payload, filter;
    const equals = [];
    const execute = () => {
      if (database.error) return { data: null, error: { message: 'Database unavailable' } };
      const existing = database.row;
      if (action === 'create') {
        if (payload.created_by !== userId) return { data: null, error: { message: 'RLS INSERT denied' } };
        database.row = structuredClone(payload);
        return { data: database.row, error: null };
      }
      if (action === 'read') {
        assert.ok(filter.includes(`created_by.eq.${userId}`));
        assert.ok(filter.includes(JSON.stringify([{ id: userId }])));
        const visible = existing && (existing.created_by === userId || existing.members.some(m => m.id === userId));
        return { data: visible ? [structuredClone(existing)] : [], error: null };
      }
      if (!existing || equals.some(([key, value]) => existing[key] !== value)) return { data: null, error: null };
      if (action === 'delete') {
        if (existing.created_by !== userId) return { data: null, error: { message: 'RLS DELETE denied' } };
        database.row = null;
        return { data: { id: existing.id }, error: null };
      }
      if (existing.created_by !== userId && !existing.members.some(m => m.id === userId)) return { data: null, error: { message: 'RLS UPDATE denied' } };
      database.row = { ...existing, ...structuredClone(payload) };
      return { data: structuredClone(database.row), error: null };
    };
    const query = {
      select() { return query; }, or(value) { filter = value; return query; },
      order() { return Promise.resolve(execute()); },
      insert(value) { action = 'create'; payload = value; return query; },
      update(value) { action = 'update'; payload = value; return query; },
      delete() { action = 'delete'; return query; },
      eq(key, value) { equals.push([key, value]); return query; },
      maybeSingle() { return Promise.resolve(execute()); },
      upsert() { throw new Error('Upsert would check creator-only INSERT permissions'); },
    };
    return query;
  } };
  const mod = new Module(filename, module);
  mod.require = name => name === '@/lib/supabase/client' ? { supabase } : require(name);
  mod._compile(compiled, filename);
  return mod.exports;
}

test('a non-creator member adds a movie visible from the creator and another client', async () => {
  const db = { row: structuredClone(original) };
  const member = client(db, 'member');
  const [list] = await member.getSharedWatchlists('member');
  await member.saveSharedWatchlist({ ...list, movies: [{ tmdb_id: 348, title: 'Alien' }] });
  assert.equal((await client(db, 'owner').getSharedWatchlists('owner'))[0].movies[0].tmdb_id, 348);
  assert.equal((await client(db, 'member').getSharedWatchlists('member'))[0].movies.length, 1);
});
test('a stale edit cannot overwrite another participant’s saved movie', async () => {
  const db = { row: structuredClone(original) };
  const member = client(db, 'member');
  await member.saveSharedWatchlist({ ...original, movies: [{ tmdb_id: 348 }] });
  await assert.rejects(client(db, 'owner').saveSharedWatchlist({ ...original, movies: [{ tmdb_id: 550 }] }), /La lista cambió/);
  assert.equal(db.row.movies[0].tmdb_id, 348);
});
test('failed reads and writes propagate instead of reporting local-only success', async () => {
  const db = { row: structuredClone(original), error: true };
  await assert.rejects(client(db, 'member').saveSharedWatchlist(original), /No se pudo guardar/);
  await assert.rejects(client(db, 'member').getSharedWatchlists('member'), /No se pudieron cargar/);
  assert.equal(db.row.movies.length, 0);
});
test('empty server results stay empty, and only the owner creates or deletes', async () => {
  const db = { row: null };
  assert.deepEqual(await client(db, 'member').getSharedWatchlists('member'), []);
  await assert.rejects(client(db, 'member').saveSharedWatchlist(original, true));
  await client(db, 'owner').saveSharedWatchlist(original, true);
  await assert.rejects(client(db, 'member').deleteSharedWatchlist('shared', 'member'));
  await client(db, 'owner').deleteSharedWatchlist('shared', 'owner');
  assert.equal(db.row, null);
});
