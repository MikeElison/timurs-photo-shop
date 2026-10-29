import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { storePhoto, readPreview, removePhoto } from '../lib/photo-storage';

test('a rejected duplicate ID preserves the original and preview', async () => {
  const id = randomUUID();
  const original = Buffer.from('disposable regression original');
  const preview = Buffer.from('disposable regression preview');
  try {
    await storePhoto(id, original, preview);
    await assert.rejects(storePhoto(id, Buffer.from('replacement'), Buffer.from('replacement')), { code: 'EEXIST' });
    assert.deepEqual(await readFile(path.join('.local-data/photos', id, 'original')), original);
    assert.deepEqual(await readPreview(id), preview);
  } finally { await removePhoto(id); }
});

test('a failed new write removes only its own incomplete directory', async () => {
  const id = randomUUID();
  try {
    // Inject a filesystem write failure after the original has been written.
    await assert.rejects(storePhoto(id, Buffer.from('disposable original'), null as unknown as Buffer));
    await assert.rejects(stat(path.join('.local-data/photos', id)), { code: 'ENOENT' });
  } finally { await removePhoto(id); }
});
