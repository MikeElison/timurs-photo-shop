# Local sign-in and test purchases

This milestone remains on your Mac. Emails use a private local outbox, and Stripe live keys/events are rejected. The implementation is not ready for live commerce or internet deployment.

## 1. Start and sign in

```sh
npm install
npm run db:start
npm run dev
```

Use **http://127.0.0.1:3000** consistently. If you intentionally change the port/host, set `APP_URL` in `.env.local` to that exact loopback origin and restart Next.js. Do not use a tunnel.

Your administrator address has already been authorised in the local database. On a new machine, authorise it from the terminal:

```sh
npm run admin:add -- your-email@example.com
```

Open `/admin/sign-in`, enter the authorised address, and request a link. Open the newest `.txt` email in `.local-data/mail/` using VS Code or Finder, follow its link, then choose **Confirm sign-in**. The link expires after ten minutes and works once. Opening the link alone does not consume it. You are signed in for eight hours; **Sign out** revokes that session immediately. Unauthorised emails receive the same on-screen response but do not receive a link. At most five links can be requested for an authorised address in fifteen minutes while outstanding.

The allowlist and sessions live in the ignored local database, not Git. Any person with full access to your Mac's private files/database can inspect the local outbox; it is a development substitute for actual email delivery. There is no public admin registration.

Signed-in administration now has **Orders**, **Email outbox**, and **Sign out** links. Authentication is checked again by every upload/edit/rate action and every draft-preview request.

## 2. Create your Stripe test environment

Create/sign in to your [Stripe account](https://dashboard.stripe.com/) and use a **sandbox/test environment**. Obtain its secret API key; it starts with `sk_test_`. Add it to the ignored `.env.local`, never to source code or chat:

```dotenv
LOCAL_CATALOG=1
APP_URL=http://127.0.0.1:3000
STRIPE_SECRET_KEY=sk_test_your_actual_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_actual_listener_secret
```

The webhook secret comes from the listener in the next step. Preserve your existing `.env.local` settings. No publishable key is needed for this hosted Checkout integration.

Install the [official Stripe CLI](https://docs.stripe.com/stripe-cli) following its installation instructions. Authenticate it to the same test environment, then keep this running in a separate terminal:

```sh
stripe login
stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded --forward-to http://127.0.0.1:3000/api/stripe/webhook
```

Copy the listener's `whsec_…` secret into `.env.local`, then restart Next.js. A freshly started listener may use a different secret. Without both keys configured, the site explains that test checkout is unavailable. Do not use `sk_live_` keys; this application deliberately rejects them.

## 3. Exercise the full journey

1. Sign in as administrator, upload a photo, choose prices, and publish it. The original three sample illustrations cannot be purchased.
2. Open that photo's public details page. Choose the currency/licence, enter a test buyer email, and click **Buy in Stripe test mode**.
3. On Stripe's test Checkout page, use [Stripe's documented test details](https://docs.stripe.com/testing), such as `4242 4242 4242 4242`, a future expiry, and any three-digit CVC. No real card or funds are involved.
4. Wait for the verified webhook to mark the order paid. The browser's return page never grants access itself.
5. In administration, inspect **Orders** and **Email outbox**. A paid order has one purchase email. The email file also appears in `.local-data/mail/`.
6. Copy the private purchase-access URL from that email into the browser. It displays the recorded price, currency, and test licence terms. **Download original** creates a five-minute download URL and streams the exact original file.
7. Use the purchase-access email link again to generate another download URL. Try a random or expired download token and confirm it fails. Return the photo to draft: a previously paid purchase should still work.

Email delivery is local only; nothing reaches the buyer's real inbox yet. Access links are bearer credentials: anyone with a link can use it until expiry. Purchase-access links last 30 days and generated download links five minutes for this test milestone; these are provisional test policies, not final shop terms. Final licence wording is still pending and all recorded licences are clearly marked TEST.

## Implementation and failure recovery

- PostgreSQL stores order snapshots, including email, photo title, licence text/version, currency, integer amount, test Checkout session, and payment state. Changing photo prices later does not change an existing order.
- Prices always come from the server-side published catalogue. Client-submitted amounts are not used. Originals remain outside `public/`.
- Checkout creation uses an idempotency key. Fulfilment locks the order row and validates a retrieved, paid, test-mode Stripe session against its recorded amount, currency, session ID, and metadata.
- The webhook verifies Stripe's signature over the raw request body. Duplicate or concurrent payment notifications do not create duplicate entitlements/emails. A failed delivery returns an error so Stripe can retry.
- Payment confirmation and the email outbox entry commit together. Local delivery uses the same UUID filename on retries. If local email delivery fails, retry the webhook, open the protected outbox page, or run `npm run mail:flush`.
- Purchase/access/download token hashes are stored in entitlement tables. Plaintext access links exist in the private email outbox, as they would in actual emails. Session cookies are HttpOnly and SameSite=Strict. The local HTTP development cookie is not Secure; internet deployment requires HTTPS and a deployment-specific security review.
- Requests/links containing tokens should not be shared or copied into issues. Private responses use no-store and origin-only referrer headers. Next.js development request logs may contain test URLs; do not publish those logs.
- Unpaid and mismatched sessions cannot grant access. Pending/cancelled attempts do not receive purchase emails. Authentication, checkout, and downloads are disabled in production mode for this local milestone.
- Refunds/disputes, account purchase history, email-based guest-to-account linking, real email delivery, tax handling, object-storage downloads, final policies, monitoring, and deployment remain later work.

## Verification

Keep the database and development server running, then run:

```sh
npm test
npm run test:integration
npm run test:uploads:http
npm run build
npm run typecheck
```

Integration tests use disposable database rows, synthetic Stripe sessions, generated images, and a test admin session, then clean them up. They test the actual sign-in cookie/logout and download HTTP handlers. Synthetic sessions test our fulfilment logic; they do **not** prove that an actual Stripe Checkout payment/webhook works. Run the full journey above after configuring a real Stripe test account.
