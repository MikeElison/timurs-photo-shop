import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { parsePrice, photoFields, isPhotoId, uploadFile } from '../lib/catalog-validation';
import { makePreview } from '../lib/photo-storage';
import { currencies } from '../lib/photos';

test('prices use exact minor units and reject ambiguous or invalid amounts', () => {
  assert.equal(parsePrice('0.29'), 29);
  assert.equal(parsePrice('15.5'), 1550);
  assert.equal(parsePrice('999999.99'), 99999999);
  for (const value of ['', '0', '-1', '1.001', '1e2', '1,50', 'Infinity', '1000000', null]) assert.throws(() => parsePrice(value));
});
test('all currencies and both licences are required; text is bounded', () => {
  const data = new FormData();
  data.set('title', '  Test photo  '); data.set('collection', 'Coast'); data.set('description', 'A test photo.');
  for (const currency of currencies) for (const kind of ['personal', 'commercial']) data.set(`${currency}-${kind}`, '12.34');
  assert.equal(photoFields(data).title, 'Test photo');
  data.delete('USD-commercial'); assert.throws(() => photoFields(data));
  data.set('USD-commercial', '1'); data.set('title', 'x'.repeat(121)); assert.throws(() => photoFields(data));
});
test('file identifiers cannot contain paths', () => {
  assert.equal(isPhotoId('02f63074-2c30-42ae-bf91-1b82d4361256'), true);
  for (const value of ['../original', '/etc/passwd', 'quiet-tide', '02f63074-2c30-42ae-bf91-1b82d4361256/../']) assert.equal(isPhotoId(value), false);
});
test('preview is resized, watermarked, metadata stripped; original buffer is unchanged', async () => {
  const input = await sharp({ create: { width: 2400, height: 1200, channels: 3, background: '#497c8e' } }).jpeg().withMetadata({ exif: { IFD0: { Artist: 'Private artist metadata' } } }).toBuffer();
  const before = Buffer.from(input);
  const result = await makePreview(input);
  assert.deepEqual(input, before);
  assert.equal(result.width, 1600); assert.equal(result.height, 800);
  const meta = await sharp(result.preview).metadata();
  assert.equal(meta.format, 'jpeg'); assert.equal(meta.exif, undefined);
  const raw = await sharp(result.preview).raw().toBuffer();
  // A flat-colour input must gain contrast from the burned-in watermark.
  let min = 255, max = 0;
  for (let index = 0; index < raw.length; index += 3) { min = Math.min(min, raw[index]); max = Math.max(max, raw[index]); }
  assert.ok(max - min > 60);
});
test('SVG, corrupt input, and excessive decoded dimensions are rejected', async () => {
  await assert.rejects(makePreview(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"/>')));
  await assert.rejects(makePreview(Buffer.from('not an image')));
  const huge = await sharp({ create: { width: 8000, height: 7000, channels: 3, background: 'white' } }).png().toBuffer();
  await assert.rejects(makePreview(huge));
});

test('images too small or narrow for a readable watermark are rejected', async () => {
  for (const [width, height] of [[20, 20], [10, 1600], [1600, 10], [180, 180], [1000, 10000]]) {
    const input = await sharp({ create: { width, height, channels: 3, background: 'white' } }).png().toBuffer();
    await assert.rejects(makePreview(input), /too small or narrow/i, `${width}×${height} should be rejected`);
  }
});

test('smallest accepted landscape and portrait previews have visible watermarks', async () => {
  for (const [width, height] of [[360, 180], [180, 360]]) {
    const input = await sharp({ create: { width, height, channels: 3, background: 'white' } }).png().toBuffer();
    const result = await makePreview(input);
    assert.equal(result.width, width); assert.equal(result.height, height);
    const raw = await sharp(result.preview).raw().toBuffer();
    assert.ok(raw.some(value => value < 220), 'Watermark must change the white image');
  }
});

test('file validation accepts exactly 20 MiB and rejects empty, missing, or larger files', () => {
  const file = new File([new Uint8Array(20 * 1024 * 1024)], 'boundary.jpg');
  assert.equal(uploadFile(file), file);
  for (const value of [null, 'not a file', new File([], 'empty.jpg'), new File([new Uint8Array(20 * 1024 * 1024 + 1)], 'too-large.jpg')]) {
    assert.throws(() => uploadFile(value), /up to 20 MiB/);
  }
});
