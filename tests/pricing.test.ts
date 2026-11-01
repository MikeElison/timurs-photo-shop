import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applySuggestions, inputsFromPrices, parseQuote, suggestedPrice } from '../lib/pricing';
import { prices } from '../lib/photos';
import { fetchExchangeQuote } from '../lib/exchange-rates';
const now = new Date('2026-10-29T12:00:00Z');
const rows = [{ date: '2026-10-28', base: 'GBP', quote: 'EUR', rate: 1.17 }, { date: '2026-10-28', base: 'GBP', quote: 'USD', rate: 1.31 }];
const quote = parseQuote(rows, now);
test('validates dated GBP rates and rejects stale, future, malformed or incomplete responses', () => {
  assert.equal(quote.date, '2026-10-28');
  for (const data of [null, [], [rows[0]], [rows[0], rows[0]], rows.map(row => ({ ...row, rate: 0 })), rows.map(row => ({ ...row, base: 'EUR' })), rows.map(row => ({ ...row, date: '2026-10-01' })), rows.map(row => ({ ...row, date: '2026-10-30' }))]) assert.throws(() => parseQuote(data, now));
});
test('requests today explicitly when the latest feed may already be dated tomorrow', async () => {
  const nearMidnight = new Date('2026-11-01T23:59:59Z');
  const result = await fetchExchangeQuote(nearMidnight, async (input, options) => {
    const url = new URL(String(input));
    assert.equal(url.origin, 'https://api.frankfurter.dev');
    assert.equal(url.pathname, '/v2/rates');
    assert.equal(url.searchParams.get('base'), 'GBP');
    assert.equal(url.searchParams.get('quotes'), 'EUR,USD');
    assert.equal(url.searchParams.get('date'), '2026-11-01');
    assert.ok(options?.signal, 'Rate requests retain their timeout');
    return Response.json(rows.map(row => ({ ...row, date: '2026-11-01' })));
  });
  assert.equal(result.date, '2026-11-01');
  assert.deepEqual(result.rates, quote.rates);
});
test('dated requests still reject future/stale rates and service failures', async () => {
  for (const date of ['2026-11-02', '2026-10-01']) {
    await assert.rejects(fetchExchangeQuote(new Date('2026-11-01T22:00:00Z'), async () =>
      Response.json(rows.map(row => ({ ...row, date })))), /not recent enough/);
  }
  await assert.rejects(fetchExchangeQuote(now, async () => new Response(null, { status: 503 })), /service unavailable/);
});
test('rounds suggested amounts to nearest 0.50 with minimum and maximum bounds', () => {
  assert.equal(suggestedPrice('15.00', 1.17), '17.50');
  assert.equal(suggestedPrice('15.00', 1.31), '19.50');
  assert.equal(suggestedPrice('0.01', 1.17), '0.50');
  for (const rate of [0, -1, Infinity, NaN]) assert.throws(() => suggestedPrice('15', rate));
  assert.throws(() => suggestedPrice('999999.99', 1.31));
});
test('GBP edits update both licences while preserving manual overrides and original saved prices', () => {
  const inputs = inputsFromPrices(prices);
  const next = applySuggestions({ ...inputs, 'GBP-personal': '20', 'USD-personal': '29.99' }, quote, { 'USD-personal': true });
  assert.equal(next['EUR-personal'], '23.50'); assert.equal(next['USD-personal'], '29.99');
  assert.equal(next['EUR-commercial'], '76.00'); assert.equal(next['USD-commercial'], '85.00');
  assert.equal(inputs['GBP-personal'], '15.00'); assert.equal(prices.GBP.personal, 1500);
  const incomplete = applySuggestions({ ...inputs, 'GBP-personal': '' }, quote, {});
  assert.equal(incomplete['EUR-personal'], inputs['EUR-personal']);
});
