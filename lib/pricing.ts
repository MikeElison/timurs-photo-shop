import { parsePrice } from './catalog-validation';
import type { Currency, Prices } from './photos';
export const licenceKinds = ['personal', 'commercial'] as const;
export type Licence = typeof licenceKinds[number];
export type PriceKey = `${Currency}-${Licence}`;
export type PriceInputs = Record<PriceKey, string>;
export type ForeignPriceKey = `${'EUR' | 'USD'}-${Licence}`;
export type FxQuote = { date: string; rates: { EUR: number; USD: number } };
export function inputsFromPrices(prices: Prices): PriceInputs {
  return Object.fromEntries(Object.entries(prices).flatMap(([currency, values]) => licenceKinds.map(kind => [`${currency}-${kind}`, (values[kind] / 100).toFixed(2)]))) as PriceInputs;
}
export function parseQuote(data: unknown, now = new Date()): FxQuote {
  if (!Array.isArray(data) || data.length !== 2) throw new Error('Incomplete exchange-rate response.');
  const rates = {} as FxQuote['rates'];
  let date: string | undefined;
  for (const row of data) {
    if (!row || row.base !== 'GBP' || !['EUR', 'USD'].includes(row.quote) || typeof row.rate !== 'number' || !Number.isFinite(row.rate) || row.rate <= 0 || row.rate > 1000 || typeof row.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)) throw new Error('Invalid exchange-rate response.');
    const stamp = Date.parse(`${row.date}T00:00:00Z`);
    const today = Date.parse(now.toISOString().slice(0, 10));
    if (!Number.isFinite(stamp) || new Date(stamp).toISOString().slice(0, 10) !== row.date || stamp > today || today - stamp > 7 * 86400000) throw new Error('Exchange rates are not recent enough.');
    if ((date && date !== row.date) || row.quote in rates) throw new Error('Inconsistent exchange-rate response.');
    date = row.date;
    rates[row.quote as 'EUR' | 'USD'] = row.rate;
  }
  if (!rates.EUR || !rates.USD || !date) throw new Error('Missing exchange rate.');
  return { date, rates };
}
export function suggestedPrice(gbp: string, rate: number): string {
  if (!Number.isFinite(rate) || rate <= 0 || rate > 1000) throw new Error('Invalid exchange rate.');
  // Round to the nearest 0.50 EUR/USD, with a minimum of 0.50.
  const minor = Math.max(50, Math.round(parsePrice(gbp) * rate / 50) * 50);
  if (minor > 99999999) throw new Error('Converted price exceeds the supported maximum.');
  return (minor / 100).toFixed(2);
}
export function applySuggestions(inputs: PriceInputs, quote: FxQuote, overrides: Partial<Record<ForeignPriceKey, boolean>>): PriceInputs {
  const next = { ...inputs };
  for (const kind of licenceKinds) {
    // Leave foreign prices unchanged while a GBP input is incomplete or invalid.
    try { parsePrice(inputs[`GBP-${kind}`]); } catch { continue; }
    for (const currency of ['EUR', 'USD'] as const) {
      const key = `${currency}-${kind}` as const;
      if (!overrides[key]) next[key] = suggestedPrice(inputs[`GBP-${kind}`], quote.rates[currency]);
    }
  }
  return next;
}
