import { parseQuote } from './pricing';

export async function fetchExchangeQuote(now = new Date(), request = fetch) {
  // The provider's "latest" feed can be dated tomorrow around a day boundary.
  // Request today's UTC date explicitly, while retaining strict validation of
  // the returned date. The dated URL also keeps cached responses day-specific.
  const url = new URL('https://api.frankfurter.dev/v2/rates');
  url.searchParams.set('base', 'GBP');
  url.searchParams.set('quotes', 'EUR,USD');
  url.searchParams.set('date', now.toISOString().slice(0, 10));
  // Only currency codes and the date leave the server, never photo data/prices.
  const response = await request(url.toString(), {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error('Exchange-rate service unavailable.');
  return parseQuote(await response.json(), now);
}
