'use client';
import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import { uploadPhoto, updatePhoto } from '../app/admin/actions';
import { currencies, prices, type Photo } from '../lib/photos';
type EditablePhoto = Photo & { id: string; published: boolean };
export default function PhotoForm({ photo }: { photo?: EditablePhoto }) {
  const [state, action, pending] = useActionState(photo ? updatePhoto : uploadPhoto, { message: '' });
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok && !photo) formRef.current?.reset(); }, [state, photo]);
  const prefix = photo?.id ?? 'new';
  const [visibility, setVisibility] = useState(photo?.published ? 'published' : 'draft');
  useEffect(() => { setVisibility(photo?.published ? 'published' : 'draft'); }, [photo?.published]);
  return <form method="post" ref={formRef} className="photo-form" onSubmit={event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // React's automatic action-form reset can restore a stale visibility selection.
    // Dispatch explicitly so edits stay visible; only a successful new upload resets.
    startTransition(() => action(data));
  }}>
    <fieldset disabled={pending}>
      <legend>{photo ? 'Edit photo and prices' : 'Add a photo'}</legend>
      {photo ? <input type="hidden" name="id" value={photo.id}/> : <label>Original image<input name="photo" type="file" accept="image/jpeg,image/png" required/><small>JPEG or PNG · up to 20 MiB and 50 megapixels. Images too small or narrow to watermark are rejected. The original stays private.</small></label>}
      <label>Title<input name="title" maxLength={120} defaultValue={photo?.title} required/></label>
      <label>Collection<input name="collection" maxLength={80} defaultValue={photo?.collection} required/></label>
      <label>Description<textarea name="description" maxLength={2000} defaultValue={photo?.description} required rows={3}/></label>
      <p id={`${prefix}-price-note`}>Prices in each currency (sample defaults; choose your own).</p>
      <div className="price-fields">{currencies.map(currency => <fieldset key={currency} aria-describedby={`${prefix}-price-note`}><legend>{currency}</legend>{(['personal', 'commercial'] as const).map(kind => <label key={kind}>{kind === 'personal' ? 'Personal' : 'Commercial'} ({currency})<input name={`${currency}-${kind}`} inputMode="decimal" type="text" pattern="[0-9]{1,6}(\.[0-9]{1,2})?" defaultValue={((photo?.prices ?? prices)[currency][kind] / 100).toFixed(2)} required/></label>)}</fieldset>)}</div>
      {photo && <label>Visibility<select name="status" value={visibility} onChange={event => setVisibility(event.target.value)}><option value="draft">Draft — hidden from gallery</option><option value="published">Published — preview visible in gallery</option></select></label>}
      <button className="primary-button" type="submit">{pending ? 'Saving…' : photo ? 'Save changes' : 'Upload and save draft'}</button>
    </fieldset>
    <p role="status" className={state.ok ? 'success' : 'form-error'}>{state.message}</p>
  </form>;
}
