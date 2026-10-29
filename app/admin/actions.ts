'use server';
import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { db } from '../../lib/db';
import { requireLocalAdmin } from '../../lib/admin-access';
import { photoFields, InputError, isPhotoId, uploadFile } from '../../lib/catalog-validation';
import { makePreview, storePhoto, removePhoto } from '../../lib/photo-storage';
export type ActionState = { message: string; ok?: boolean };
function failure(error: unknown): ActionState {
  if (error instanceof InputError) return { message: error.message };
  console.error('Catalogue operation failed:', error);
  return { message: 'Could not save this photo. Check that npm run db:start has completed, then try again.' };
}
function refresh() { revalidatePath('/'); revalidatePath('/admin'); revalidatePath('/photos/[slug]', 'page'); }
export async function uploadPhoto(_previous: ActionState, form: FormData): Promise<ActionState> {
  await requireLocalAdmin(true);
  try {
    const fields = photoFields(form);
    const file = uploadFile(form.get('photo'));
    const bytes = Buffer.from(await file.arrayBuffer());
    let processed;
    try { processed = await makePreview(bytes); }
    catch (error) {
      if (error instanceof InputError) throw error;
      throw new InputError('Could not read this image. Use a valid, single JPEG or PNG of at most 50 megapixels.');
    }
    const id = randomUUID();
    await storePhoto(id, bytes, processed.preview);
    try {
      await db.query('INSERT INTO photos(id,title,collection,description,width,height,prices) VALUES($1,$2,$3,$4,$5,$6,$7)', [id, fields.title, fields.collection, fields.description, processed.width, processed.height, fields.prices]);
    } catch (error) { await removePhoto(id); throw error; }
    refresh();
    return { message: 'Draft saved. Review its preview below, then publish when ready.', ok: true };
  } catch (error) { return failure(error); }
}
export async function updatePhoto(_previous: ActionState, form: FormData): Promise<ActionState> {
  await requireLocalAdmin(true);
  try {
    const id = form.get('id');
    if (typeof id !== 'string' || !isPhotoId(id)) throw new InputError('Invalid photo identifier.');
    const fields = photoFields(form);
    const status = form.get('status');
    if (status !== 'published' && status !== 'draft') throw new InputError('Choose Draft or Published.');
    const result = await db.query('UPDATE photos SET title=$2, collection=$3, description=$4, prices=$5, published=$6 WHERE id=$1', [id, fields.title, fields.collection, fields.description, fields.prices, status === 'published']);
    if (!result.rowCount) throw new InputError('This photo no longer exists.');
    refresh();
    return { message: status === 'published' ? 'Saved and published to the gallery.' : 'Saved as a draft; hidden from the gallery.', ok: true };
  } catch (error) { return failure(error); }
}
