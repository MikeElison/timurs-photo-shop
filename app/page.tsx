import type { Metadata } from 'next';
import Link from 'next/link';
import { photos, prices, money } from '../lib/photos';
export const metadata: Metadata = { title: 'The collection | Timurs' };

export default function Gallery() {
  return <><section className="intro"><p className="eyebrow">THE SAMPLE COLLECTION / 01</p><h1>A moment.<br/><em>A different perspective.</em></h1><div className="intro-bottom"><p>A space for photographs of light, landscape, and the quiet in between. Explore this first sketch of Timurs’s shop.</p><span>03 sample studies ↓</span></div></section><section className="gallery" aria-label="Sample gallery">{photos.map((photo, index) => <article key={photo.slug}><Link className="image-link" href={`/photos/${photo.slug}`} aria-label={`View ${photo.title}`}><img src={`/previews/${photo.slug}.svg`} alt={`Sample landscape illustration: ${photo.title}`} /><span className="sample-tag">SAMPLE ARTWORK</span></Link><div className="caption"><div><p className="eyebrow">0{index + 1} / {photo.collection}</p><h2><Link href={`/photos/${photo.slug}`}>{photo.title}</Link></h2></div><span>From {money(prices.GBP.personal, 'GBP')}<small>Sample personal licence</small></span></div></article>)}</section><section className="note"><p className="eyebrow">A NOTE ABOUT THIS PREVIEW</p><h2>A beginning, with room to grow.</h2><p>These are illustrative placeholders, not photographs by Timurs. Titles, prices, and licence descriptions are samples. Real photography and final terms will be added later.</p></section></>;
}
