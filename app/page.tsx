import type { Metadata } from 'next';
import Link from 'next/link';
import { money } from '../lib/photos';
import { galleryPhotos, samplePhotos } from '../lib/catalog';
export const metadata: Metadata = { title: 'The collection | Timurs' };
export const dynamic = 'force-dynamic';
export default async function Gallery() {
  let photos, unavailable = false;
  try { photos = await galleryPhotos(); }
  catch { photos = samplePhotos; unavailable = true; }
  return <>
    <section className="intro"><p className="eyebrow">THE COLLECTION / 01</p><h1>A moment.<br/><em>A different perspective.</em></h1><div className="intro-bottom"><p>A space for photographs of light, landscape, and the quiet in between. Explore this first sketch of Timurs’s shop.</p><span>{photos.length} studies ↓</span></div></section>
    {unavailable && <p className="catalogue-message" role="status">The local photo database is unavailable. Only sample artwork is shown. Run <code>npm run db:start</code> to see published uploads.</p>}
    <section className="gallery" aria-label="Photo gallery">{photos.map((photo, index) => <article key={photo.slug}>
      <Link className="image-link" href={`/photos/${photo.slug}`} aria-label={`View ${photo.title}`}><img src={photo.preview} width={photo.width} height={photo.height} alt={`${photo.sample ? 'Sample landscape illustration' : 'Watermarked photograph'}: ${photo.title}`} /><span className="sample-tag">{photo.sample ? 'SAMPLE ARTWORK' : 'WATERMARKED PREVIEW'}</span></Link>
      <div className="caption"><div><p className="eyebrow">{String(index + 1).padStart(2, '0')} / {photo.collection}</p><h2><Link href={`/photos/${photo.slug}`}>{photo.title}</Link></h2></div><span>From {money(photo.prices.GBP.personal, 'GBP')}<small>{photo.sample ? 'Sample personal licence' : 'Personal licence'}</small></span></div>
    </article>)}</section>
    <section className="note"><p className="eyebrow">A NOTE ABOUT THIS PREVIEW</p><h2>A beginning, with room to grow.</h2><p>Artwork labelled “Sample” is illustrative and is not photography by Timurs. Uploaded photographs have watermarked previews. Purchasing is unavailable, and licence descriptions remain placeholders.</p></section>
  </>;
}
