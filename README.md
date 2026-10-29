# Timurs’s photography shop

Local-only milestone 1: a gallery and photo-details pages. All artwork, titles, prices, and licence descriptions are clearly labelled samples. No payments, accounts, emails, database, originals, or deployment are connected.

## Run on your Mac

From this project folder:

```sh
npm install
npm run dev
```

Open http://localhost:3000. Stop the server with Ctrl+C. The dev server binds to your own computer only.

## Verify

```sh
npm run build
npm run typecheck
```

Manual checks: open each gallery card; switch GBP/EUR/USD and personal/commercial on a details page; confirm sample price changes and purchasing stays disabled; resize to a narrow mobile width; navigate with Tab; open /photos/missing and check the not-found page.

## How the code fits together

- `app/page.tsx`: gallery. Next.js maps this file to `/`.
- `app/photos/[slug]/page.tsx`: details pages. The slug is the URL identifier, similar to a path variable in Spring MVC.
- `components/LicencePicker.tsx`: browser-side React state for currency and licence selection.
- `lib/photos.ts`: typed sample data and integer minor-unit prices (pence/cents), avoiding floating-point price arithmetic.
- `public/previews/`: sample SVG illustrations with a watermark embedded in the file. These are deliberately not real photos or high-resolution originals.
- `docs/requirements.md`: agreed scope and future decisions.

The gallery and details render on the server; only the interactive price selector needs browser-side state. Plain CSS keeps the initial project small. No remote fonts or image services are required.

For production, actual previews must be resized and watermarked on the server before publication. Originals must never enter `public/` or the browser bundle. Watermarks discourage reuse; private originals and server-side purchase authorization provide access protection.
