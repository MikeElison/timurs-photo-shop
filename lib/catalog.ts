import 'server-only';
import { db } from './db';
import { photos, prices, type Photo } from './photos';
import { isPhotoId } from './catalog-validation';
export type CataloguePhoto = Photo & { id: string; published: boolean };
type Row = { id: string; title: string; collection: string; description: string; width: number; height: number; prices: Photo['prices']; published: boolean };
function fromRow(row: Row): CataloguePhoto {
  return { ...row, slug: `photo-${row.id}`, preview: `/previews/${row.id}`, sample: false };
}
export const samplePhotos: Photo[] = photos.map(photo => ({ ...photo, preview: `/previews/${photo.slug}.svg`, sample: true, width: 800, height: 1000, prices }));
export async function listUploaded(publishedOnly = true): Promise<CataloguePhoto[]> {
  if (process.env.LOCAL_CATALOG !== '1') return [];
  const result = await db.query<Row>('SELECT id, title, collection, description, width, height, prices, published FROM photos WHERE ($1::boolean = false OR published = true) ORDER BY created_at DESC, id', [publishedOnly]);
  return result.rows.map(fromRow);
}
export async function galleryPhotos(): Promise<Photo[]> { return [...await listUploaded(), ...samplePhotos]; }
export async function findUploaded(id: string, publishedOnly = true): Promise<CataloguePhoto | undefined> {
  if (!isPhotoId(id) || process.env.LOCAL_CATALOG !== '1') return undefined;
  const result = await db.query<Row>('SELECT id, title, collection, description, width, height, prices, published FROM photos WHERE id = $1 AND ($2::boolean = false OR published = true)', [id, publishedOnly]);
  return result.rows[0] ? fromRow(result.rows[0]) : undefined;
}
export async function findPhoto(slug: string) {
  return samplePhotos.find(photo => photo.slug === slug) ?? (slug.startsWith('photo-') ? findUploaded(slug.slice(6)) : undefined);
}
