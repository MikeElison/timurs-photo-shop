import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
export const metadata: Metadata = { title: 'Timurs — Photography', description: 'Local sample photography shop. Stripe test mode only · No real payments.', robots: { index: false, follow: false } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><div className="notice">LOCAL PROTOTYPE · Sample artwork is labelled · Stripe test mode only · No real payments</div><header><Link className="brand" href="/">TIMURS<span>PHOTOGRAPHY</span></Link><nav aria-label="Main navigation"><Link href="/">The collection ↗</Link>{process.env.NODE_ENV === 'development' && process.env.LOCAL_CATALOG === '1' && <Link href="/admin">Manage photos</Link>}</nav></header><main>{children}</main><footer><span>Timurs · Photography shop in progress</span><span>Local development · Test payments only.</span></footer></body></html>;
}
