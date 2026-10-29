import Link from 'next/link';
export const metadata={title:'Test checkout return | Timurs'};
export default function CheckoutReturn(){return <section className="intro"><h1>Check your purchase email</h1><p>This is a test checkout. Payment and download access are confirmed by the server after Stripe’s verified notification arrives.</p><p>Returning here alone does not mark an order paid. The local purchase email contains your private access link.</p><Link href="/">Back to the gallery</Link></section>;}
