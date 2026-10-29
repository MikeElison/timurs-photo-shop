import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { photos } from '../../../lib/photos';
import LicencePicker from '../../../components/LicencePicker';
export function generateStaticParams() { return photos.map(({ slug }) => ({ slug })); }
type PhotoPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PhotoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const photo = photos.find(photo => photo.slug === slug);
  return { title: `${photo ? photo.title : 'Photo not found'} | Timurs` };
}

export default async function PhotoPage({ params }: PhotoPageProps) {
  const { slug } = await params;
  const photo = photos.find(photo => photo.slug === slug);
  if (!photo) notFound();
  return <><Link className="back" href="/">← Back to the collection</Link><section className="detail"><div><img width={800} height={1000} className="detail-image" src={`/previews/${photo.slug}.svg`} alt={`Sample landscape illustration: ${photo.title}`} /><p className="image-note">Watermarked sample artwork · No high-resolution original is included.</p></div><div className="detail-copy"><p className="eyebrow">{photo.collection} / SAMPLE ARTWORK</p><h1>{photo.title}</h1><p>{photo.description}</p><LicencePicker/><p className="image-note">Final licence terms, file specifications, and delivery policies will be agreed before launch.</p></div></section></>;
}
