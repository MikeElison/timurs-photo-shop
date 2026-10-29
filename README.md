# Timurs’s photography shop

A local Next.js/TypeScript prototype with a gallery, photo-details pages, and simple photo administration backed by PostgreSQL. No payments, customer accounts, purchase emails, or deployment are connected.

## Run on your Mac

Node.js and PostgreSQL tools (`initdb`, `pg_ctl`) must be on PATH. From this project folder:

```sh
npm install
cp .env.example .env.local
npm run db:start
npm run dev
```

Copy `.env.example` only on first setup; preserve an existing `.env.local`. On this Mac, it has already been created. Open http://127.0.0.1:3000, then choose **Manage photos** or visit `/admin`.

`db:start` initializes a separate project database, starts it if needed, and applies the schema migration once. It uses a private Unix socket with no TCP listener. It does not modify other PostgreSQL databases. Running it again preserves your uploads and catalogue. The dev server binds to your computer only.

Stop Next.js with Ctrl+C. Stop the project database with:

```sh
npm run db:stop
```

Start it again with `npm run db:start`. Stopping either server preserves data.

## Add and publish a photo

1. Open **Manage photos**.
2. Choose a JPEG or PNG (up to 20 MiB and 50 megapixels). Images too small or narrow for a readable watermark are rejected. Enter a title, collection, and description.
3. Enter the personal and commercial GBP prices. Choose **Suggest EUR/USD from GBP** to fetch dated reference rates and suggest amounts rounded to the nearest 0.50 (minimum 0.50). While that editor is open, further GBP edits update linked suggestions automatically. Editing a EUR/USD amount makes it a manual override, preserved during rate refreshes; **Use suggestion** links that field again. Existing saved prices are never recalculated just by opening the page. Suggestions must be reviewed and saved explicitly. Amounts accept a decimal point and at most two decimal places; defaults are illustrative.

Rates come from [Frankfurter](https://frankfurter.dev/) and are cached for up to an hour. Only currency codes are sent to the service, never photos or their prices. The source date and rates are shown while editing; rates older than seven days, malformed responses, and network failures leave all prices unchanged. You can always enter prices manually. Saving stores explicit integer prices, so future rate changes do not change them. On a new visit, they appear as entered prices; choose suggestions only when you want to recalculate them. Rate metadata and per-field override markers are not stored; the final amounts are.
4. Choose **Upload and save draft**. Inspect the watermarked preview under **Uploaded photos**.
5. Change **Visibility** to **Published**, then **Save changes**. Open the gallery to see it.
6. Edit its text/prices or return it to **Draft** with the same form. Drafts are omitted from the gallery and public details pages.

A labelled test illustration has been left as a draft on this Mac. It is not photography by Timurs. The original three sample illustrations remain clearly labelled in the gallery. Licence descriptions remain placeholders and purchasing stays disabled, including on uploaded photos.

## Storage and local access

- PostgreSQL holds photo metadata, prices, and publication state.
- `.local-data/photos/<id>/original` contains the exact uploaded original, outside `public/`.
- The generated preview is a JPEG with a maximum dimension of 1600 pixels, embedded repeating watermark, and no original EXIF metadata. The resized preview must retain at least 180 pixels on its shortest side and 360 on its longest, so its watermark stays readable. Only previews have an HTTP handler.
- `.local-data/`, `.env.local`, dependencies, and generated build files are ignored by Git. **Your GitHub push does not back up uploaded photos or the local database.** Retain your source photos separately. A managed storage/database backup plan comes before launch.
- Administration works only in development with `LOCAL_CATALOG=1` and a loopback Host. Mutations require a matching Origin. It has no login yet: any browser on this computer can manage the local catalogue. Keep the app on loopback; do not expose it through a tunnel or LAN. Production-mode requests to `/admin` are rejected. Proper administrator authentication is a later milestone.
- Local filesystem storage is a development stand-in for private object storage. Do not deploy this local storage/database setup.

Without `LOCAL_CATALOG=1`, the original sample gallery still works. If the local database is stopped, the gallery shows a clear notice and sample artwork, and administration shows startup instructions.

## Verify

```sh
npm test
npm run build
npm run typecheck
```

The tests cover exact price parsing, missing currency prices, field lengths, file identifiers, rejected image formats/dimensions, watermarking, preview resizing, metadata removal, original preservation, duplicate-ID safety, failed-write cleanup, readable watermark dimensions, and the exact 20 MiB file-size boundary.

With the local database and development server running, also run:

```sh
npm run test:uploads:http
```

This regression check sends deliberately invalid requests without saving photos. It verifies complete multipart parsing at 9, 11, and 20 MiB, rejection of a file one byte above 20 MiB, and enforcement of the 21 MiB action-body limit. The proxy buffers up to 22 MiB so it does not truncate valid action requests first.

Manual checks: upload → draft → publish → open details → change currency/licence → edit prices → return to draft. Refresh to check persistence. Try an invalid file and a price such as `-1` or `12.345`. Check narrow layouts and keyboard navigation. Purchasing must stay disabled.

A developer HTTP smoke check is available after uploading an illustration titled exactly `TEST UPLOAD — sample illustration` through administration:

```sh
node scripts/check-local-http.mjs
```

It checks gallery/detail visibility, preview response headers, original URL protection, and non-local Host rejection. It also accepts a base URL argument for checking a production-mode server on port 3001, where administration and draft previews must return 404. Next.js can render not-found page content with HTTP 200 after streaming begins; the draft detail check also verifies that the actual photo content is absent.

## How the code fits together

- `app/page.tsx`, `app/photos/[slug]/page.tsx`: server-rendered gallery and details. The slug is similar to a Spring MVC path variable.
- `app/admin/`, `components/PhotoForm.tsx`: administration and form feedback, with server-side upload/update actions.
- `lib/catalog.ts`, `lib/db.ts`: catalogue queries and a small PostgreSQL connection pool. All input values use query parameters.
- `db/migrations/`: versioned database schema. No ORM is needed for this small initial schema.
- `lib/photo-storage.ts`: private filesystem storage and image processing.
- `app/previews/[id]/route.ts`: serves generated previews only, rechecking publication status on each request.
- `lib/admin-access.ts`, `proxy.ts`: local administration checks at the request and action boundaries.
- `components/LicencePicker.tsx`: browser-side currency/licence state; prices are integer pence/cents rather than floating-point currency calculations.
- `scripts/db.mjs`: isolated local database lifecycle and migration setup.
- `docs/requirements.md`: agreed product scope and deferred decisions.

The application needs the database at request time; builds do not require it. No external font or image service is required.
