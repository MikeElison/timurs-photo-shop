# Agreed requirements

Seller: Timurs, UK. Keep administration simple for a nontechnical owner. Michael is a Java developer learning AI-assisted development: explain decisions, changes, and verification.

Stack: TypeScript, React/Next.js, PostgreSQL, private object storage, Stripe Checkout. Hosting undecided; no commitment to Crazy Domains. Prefer low operating costs and modest managed services. Source: current chat and “Photo Shop Backend Build”, read 29 October 2026.

## Milestone 1

Local gallery and photo-details pages; labelled sample content and sample prices; personal/commercial selection; GBP/EUR/USD display. No deployment or live payments.

## Later milestones

- Simple private administration for uploads, metadata, prices, publication, and orders.
- Public resized, permanently watermarked previews; private high-resolution originals.
- GBP base prices with optional dated EUR/USD suggestions, rounded to the nearest 0.50 with a 0.50 minimum and manual overrides. Confirmed prices remain explicit amounts per currency, stored in minor units. Preserve purchased price, currency, and licence terms in order records.
- Stripe Checkout; server-side verified, idempotent payment handling before granting downloads.
- Automatic purchase emails and temporary secure downloads; server-side entitlement checks for renewed links.
- Guest checkout and optional private minimal accounts; email verification before attaching earlier purchases with the same email. Never trust an unverified email claim. Purchase history and repeat downloads.
- Email sign-in links were proposed in planning; confirm provider and final authentication design later.

## Decide before launch

Real images and branding; file types/sizes; actual prices; final licence terms; applicable tax/consumer/privacy obligations; download policy; email and authentication providers; hosting budget and providers; backup/recovery; Timurs’s ownership of payment accounts. No need for credentials during milestone 1.

## Milestone 2 — local photo administration

Implemented locally: isolated PostgreSQL catalogue; JPEG/PNG upload (20 MiB, 50 MP limits); private original preservation; resized, permanently watermarked, metadata-stripped previews; draft/published state; editing metadata and explicit prices in all three currencies. Uploaded photo prices drive the gallery/details selector. Original sample illustrations remain labelled.

Administration is deliberately development-only with loopback Host and same-origin mutation checks, not a production authentication system. The database uses a private Unix socket. Private filesystem storage stands in for future object storage. Payments, customers, accounts, emails, deployment, and deletion/replacement of originals remain outside this milestone. Actual licence terms are still pending. Git excludes all uploaded files and database data.

## Price suggestion workflow

Administration offers an explicit suggestion button using Frankfurter daily reference rates. While a quote is loaded in an edit session, GBP edits update linked EUR/USD fields; editing a foreign field overrides it. Review and save confirms fixed prices. Opening the page or changes to future exchange rates do not reprice the catalogue. Failures preserve entered prices and allow manual entry. Source/date are displayed while editing; only final prices persist. Existing purchases must retain the original price, currency, and licence when purchasing is implemented.

## Milestone 3 — local administrator sign-in and test purchases

Implemented: allowlisted email-link admin sign-in with short-lived single-use links, expiring server sessions and logout; hosted Stripe test Checkout integration; server-side price/licence snapshots in order records; signed-webhook fulfilment with idempotent email enqueueing; private local email outbox; expiring purchase-access and original-download tokens. Administration and draft previews now require a valid session. No real payments, external emails, customer accounts, or deployment are enabled. Stripe end-to-end verification requires a configured test account and CLI webhook forwarding. See docs/test-purchases.md.
