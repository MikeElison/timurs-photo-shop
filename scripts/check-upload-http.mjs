// Integration regression: run against npm run dev. Every request is deliberately
// invalid, so this exercises real Next.js multipart limits without saving photos.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
// Use the installed framework's serializer rather than hand-writing its wire format.
const { encodeReply } = require('next/dist/compiled/react-server-dom-turbopack/client.node');
const base = 'http://127.0.0.1:3000';
const admin = await fetch(`${base}/admin`);
assert.equal(admin.status, 200, 'Start npm run dev with LOCAL_CATALOG=1 first');
assert.ok((await admin.text()).includes('Your photo collection'), 'The local catalogue must be ready');
const manifest = JSON.parse(await readFile('.next/dev/server/server-reference-manifest.json', 'utf8'));
const entry = Object.entries(manifest.node).find(([, action]) => action.exportedName === 'uploadPhoto');
assert.ok(entry, 'The development upload action must be compiled');
const [actionId] = entry;
async function request(size) {
  const form = new FormData();
  for (const currency of ['GBP', 'EUR', 'USD']) {
    for (const kind of ['personal', 'commercial']) {
      form.set(`${currency}-${kind}`, '1.00');
    }
  }
  form.set('title', 'Regression test — must never be saved');
  form.set('collection', 'Regression tests');
  form.set('description', 'Invalid request used only to verify upload limits.');
  form.set('photo', new Blob([new Uint8Array(size)]), 'invalid-regression-file.jpg');
  const response = await fetch(`${base}/admin`, {
    method: 'POST', headers: { 'Next-Action': actionId, Origin: base }, body: await encodeReply([{ message: '' }, form]),
    signal: AbortSignal.timeout(30000),
  });
  return { status: response.status, body: await response.text() };
}
for (const mib of [9, 11, 20]) {
  const result = await request(mib * 1024 * 1024);
  assert.equal(result.status, 200, `${mib} MiB should reach application validation`);
  assert.ok(result.body.includes('Could not read this image.'), `${mib} MiB multipart body was not parsed completely`);
  console.log(`PASS ${mib} MiB: complete multipart parsing, rejected for deliberately invalid image data`);
}
const tooLarge = await request(20 * 1024 * 1024 + 1);
assert.equal(tooLarge.status, 200);
assert.ok(tooLarge.body.includes('Choose a JPEG or PNG up to 20 MiB.'), `The per-file limit must reject 20 MiB + 1 byte: ${tooLarge.body.slice(0, 1200)}`);
console.log('PASS 20 MiB + 1 byte: rejected by application file-size validation');
const oversizedBody = await request(21.5 * 1024 * 1024);
assert.ok(oversizedBody.status >= 400);
assert.ok(/Body exceeded|body.*limit|too large/i.test(oversizedBody.body), 'Oversized action body must be rejected before multipart truncation');
console.log('PASS 21.5 MiB: rejected by the action body limit');
