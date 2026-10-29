'use server';
import { requireLocalAdmin } from '../../lib/admin-access';
import { parseQuote, type FxQuote } from '../../lib/pricing';
export async function getExchangeQuote(): Promise<{ quote: FxQuote; error?: never } | { quote?: never; error: string }> {
  await requireLocalAdmin(true);
  try {
    // Only currency codes leave the server; photo information and prices are never sent.
    const response = await fetch('https://api.frankfurter.dev/v2/rates?base=GBP&quotes=EUR,USD', { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error('Exchange-rate service unavailable.');
    return { quote: parseQuote(await response.json()) };
  } catch {
    return { error: 'Recent exchange rates are unavailable. Your prices have not changed. You can enter EUR/USD prices manually or try again.' };
  }
}
