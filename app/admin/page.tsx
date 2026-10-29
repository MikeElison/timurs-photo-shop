import type { Metadata } from 'next';
import Link from 'next/link';
import { requireLocalAdmin } from '../../lib/admin-access';
import { listUploaded } from '../../lib/catalog';
import PhotoForm from '../../components/PhotoForm';
export const metadata: Metadata = { title: 'Local photo administration | Timurs' };
export const dynamic = 'force-dynamic';
export default async function AdminPage() {
  await requireLocalAdmin();
  let photos;
  try { photos = await listUploaded(false); }
  catch { return <section className="intro"><h1>Start the local database</h1><p>Run <code>npm run db:start</code> in the project terminal, then reload this page.</p></section>; }
  return <section className="admin"><Link href="/">← View gallery</Link><p className="eyebrow">LOCAL DEVELOPMENT ONLY</p><h1>Your photo collection</h1><p>Upload → review the watermarked preview → publish. Purchases use Stripe test mode only.</p><nav aria-label="Administration"><Link href="/admin/orders">Orders</Link><Link href="/admin/mail">Email outbox</Link><form action="/auth/logout" method="post"><button className="text-button">Sign out</button></form></nav><PhotoForm/><h2>Uploaded photos ({photos.length})</h2>{photos.length === 0 && <p>No uploads yet. Your first photo will appear here as a draft.</p>}{photos.map(photo => <article className="admin-photo" key={photo.id}><div><h2>{photo.title}</h2><p className="eyebrow">{photo.published ? 'Published' : 'Draft'}</p><img src={photo.preview} width={photo.width} height={photo.height} alt={`Watermarked preview: ${photo.title}`}/>{photo.published && <p><Link href={`/photos/${photo.slug}`}>Open photo page →</Link></p>}</div><PhotoForm photo={photo}/></article>)}</section>;
}
