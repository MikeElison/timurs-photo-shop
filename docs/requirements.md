# Agreed requirements

Seller: Timurs, UK. Keep administration simple for a nontechnical owner. Michael is a Java developer learning AI-assisted development: explain decisions, changes, and verification.

Stack: TypeScript, React/Next.js, PostgreSQL, private object storage, Stripe Checkout. Hosting undecided; no commitment to Crazy Domains. Prefer low operating costs and modest managed services. Source: current chat and “Photo Shop Backend Build”, read 29 October 2026.

## Milestone 1

Local gallery and photo-details pages; labelled sample content and sample prices; personal/commercial selection; GBP/EUR/USD display. No deployment or live payments.

## Later milestones

- Simple private administration for uploads, metadata, prices, publication, and orders.
- Public resized, permanently watermarked previews; private high-resolution originals.
- Explicit personal/commercial prices per currency, stored in minor units. Preserve purchased price, currency, and licence terms in order records.
- Stripe Checkout; server-side verified, idempotent payment handling before granting downloads.
- Automatic purchase emails and temporary secure downloads; server-side entitlement checks for renewed links.
- Guest checkout and optional private minimal accounts; email verification before attaching earlier purchases with the same email. Never trust an unverified email claim. Purchase history and repeat downloads.
- Email sign-in links were proposed in planning; confirm provider and final authentication design later.

## Decide before launch

Real images and branding; file types/sizes; actual prices; final licence terms; applicable tax/consumer/privacy obligations; download policy; email and authentication providers; hosting budget and providers; backup/recovery; Timurs’s ownership of payment accounts. No need for credentials during milestone 1.
