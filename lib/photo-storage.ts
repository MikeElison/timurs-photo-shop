import sharp from 'sharp';
import { mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import path from 'node:path';
import { isPhotoId, InputError } from './catalog-validation';
import { MIN_PREVIEW_SHORT_EDGE, MIN_PREVIEW_LONG_EDGE } from './upload-limits';
const root = path.join(process.cwd(), '.local-data', 'photos');
function directory(id: string) {
  if (!isPhotoId(id)) throw new InputError('Invalid photo identifier.');
  return path.join(root, id);
}
export async function makePreview(bytes: Buffer) {
  const image = sharp(bytes, { limitInputPixels: 50_000_000, failOn: 'warning' });
  const meta = await image.metadata();
  if (!['jpeg', 'png'].includes(meta.format ?? '') || (meta.pages ?? 1) !== 1) throw new InputError('Upload a single JPEG or PNG image.');
  const resized = await image.rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer({ resolveWithObject: true });
  const { width, height } = resized.info;
  if (Math.min(width, height) < MIN_PREVIEW_SHORT_EDGE || Math.max(width, height) < MIN_PREVIEW_LONG_EDGE) {
    throw new InputError('This image is too small or narrow for a readable watermark. Its resized preview must have a short side of at least 180 pixels and a long side of at least 360 pixels.');
  }
  // One watermark covers the image at any size; larger previews receive a tiled mark.
  const tileWidth = Math.min(360, width), tileHeight = Math.min(180, height);
  const watermark = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${tileWidth}" height="${tileHeight}" viewBox="0 0 360 180"><text x="180" y="100" text-anchor="middle" font-family="sans-serif" font-size="29" font-weight="bold" fill="white" stroke="black" stroke-width=".6" opacity=".65" transform="rotate(-20 180 90)">TIMURS · PREVIEW</text></svg>`);
  const preview = await sharp(resized.data).composite([{ input: watermark, tile: true }]).jpeg({ quality: 82 }).toBuffer();
  return { preview, width, height };
}
export async function storePhoto(id: string, original: Buffer, preview: Buffer) {
  const folder = directory(id);
  await mkdir(root, { recursive: true, mode: 0o700 });
  // Claim a new directory atomically. If it already exists, fail outside the
  // cleanup block so an existing original can never be removed by this write.
  await mkdir(folder, { mode: 0o700 });
  try {
    await writeFile(path.join(folder, 'original'), original, { flag: 'wx', mode: 0o600 });
    await writeFile(path.join(folder, 'preview.jpg'), preview, { flag: 'wx', mode: 0o600 });
  } catch (error) { await removePhoto(id); throw error; }
}
export async function removePhoto(id: string) { await rm(directory(id), { recursive: true, force: true }); }
export async function readPreview(id: string) { return readFile(path.join(directory(id), 'preview.jpg')); }
