import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';
import { dbConfig, localRoot } from './local-db-config.mjs';
const base = process.argv[2] ?? 'http://127.0.0.1:3000';
const client = new pg.Client(dbConfig);
await client.connect();
try {
  const { rows } = await client.query("SELECT id, published FROM photos WHERE title = $1 ORDER BY id", ['TEST UPLOAD — sample illustration']);
  assert.ok(rows.length > 0, 'No matching uploads found. Upload a photo titled exactly "TEST UPLOAD — sample illustration" through /admin first.');
  const gallery = await (await fetch(base)).text();
  // Titles are not unique: verify every matching upload rather than requiring
  // the developer to delete or rename existing test photos.
  for (const { id, published } of rows) {
    assert.equal(gallery.includes(`photo-${id}`), published, 'Gallery visibility matches status');
    const detail = await fetch(`${base}/photos/photo-${id}`);
    if (published) assert.equal(detail.status, 200);
    else { const html = await detail.text(); assert.ok(html.includes('Photo not found.')); assert.ok(!html.includes('Illustrative test upload for verifying')); }
    const preview = await fetch(`${base}/previews/${id}`);
    if (published) {
      assert.equal(preview.status, 200);
      assert.equal(preview.headers.get('content-type'), 'image/jpeg');
      assert.equal(preview.headers.get('cache-control'), 'no-store');
      const original = await readFile(path.join(localRoot, 'photos', id, 'original'));
      assert.notDeepEqual(Buffer.from(await preview.arrayBuffer()), original);
    } else if (base.endsWith(':3001')) assert.equal(preview.status, 404, 'Draft preview unavailable in production');
    for (const route of [`/.local-data/photos/${id}/original`, `/originals/${id}`, `/previews/${id}/original`]) assert.equal((await fetch(base + route)).status, 404, route);
    console.log(`PASS photo-${id}: ${published ? 'published photo' : 'draft'} visibility and original URL protection`);
  }
  if (base.endsWith(':3001')) assert.equal((await fetch(base + '/admin')).status, 404, 'Production admin is disabled');
  const hostStatus = await new Promise((resolve, reject) => {
    const request = http.get(base + '/admin', { headers: { Host: 'untrusted.example:3000' } }, response => { response.resume(); resolve(response.statusCode); });
    request.on('error', reject);
  });
  assert.equal(hostStatus, 404, 'Non-local Host rejected');
  console.log(`PASS ${base}: ${rows.length} matching upload(s) checked; admin boundary verified`);
} finally { await client.end(); }
