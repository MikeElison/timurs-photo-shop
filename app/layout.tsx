import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
export const metadata: Metadata = { title: 'Timurs — Photography', description: 'Local sample photography shop. No purchases available.', robots: { index: false, follow: false } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><div className="notice">LOCAL PROTOTYPE · Sample artwork and prices · No purchases available</div><header><Link className="brand" href="/">TIMURS<span>PHOTOGRAPHY</span></Link><nav aria-label="Main navigation"><Link href="/">The collection ↗</Link></nav></header><main>{children}</main><footer><span>Timurs · Photography shop in progress</span><span>Sample content only · Made for a slower look.</span></footer></body></html>;
}
