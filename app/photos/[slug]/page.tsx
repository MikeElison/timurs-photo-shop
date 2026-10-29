import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { findPhoto } from '../../../lib/catalog';
import { stripeConfigured } from '../../../lib/stripe';
import { isLocalRuntime } from '../../../lib/security';
import LicencePicker from '../../../components/LicencePicker';
export const dynamic = 'force-dynamic';
type PhotoPageProps = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: PhotoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const photo = await findPhoto(slug);
  return { title: `${photo ? photo.title : 'Photo not found'} | Timurs` };
}
export default async function PhotoPage({ params }: PhotoPageProps) {
  const { slug } = await params;
  const photo = await findPhoto(slug);
  if (!photo) notFound();
  return <><Link className="back" href="/">← Back to the collection</Link><section className="detail"><div>
    <img width={photo.width} height={photo.height} className="detail-image" src={photo.preview} alt={`${photo.sample ? 'Sample landscape illustration' : 'Watermarked photograph'}: ${photo.title}`} />
    <p className="image-note">{photo.sample ? 'Watermarked sample artwork · No high-resolution original is included.' : 'Watermarked preview · The original is stored privately. Access is granted only after a confirmed test purchase.'}</p>
    </div><div className="detail-copy"><p className="eyebrow">{photo.collection} / {photo.sample ? 'SAMPLE ARTWORK' : 'WATERMARKED PREVIEW'}</p><h1>{photo.title}</h1><p>{photo.description}</p><LicencePicker prices={photo.prices} sample={photo.sample} photoId={photo.sample ? undefined : photo.slug.slice(6)} checkoutEnabled={isLocalRuntime() && stripeConfigured()}/><p className="image-note">Final licence terms, file specifications, and delivery policies will be agreed before launch.</p></div></section></>;
}
