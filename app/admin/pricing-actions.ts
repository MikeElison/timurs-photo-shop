'use server';
import { requireLocalAdmin } from '../../lib/admin-access';
import type { FxQuote } from '../../lib/pricing';
import { fetchExchangeQuote } from '../../lib/exchange-rates';
export async function getExchangeQuote(): Promise<{ quote: FxQuote; error?: never } | { quote?: never; error: string }> {
  await requireLocalAdmin(true);
  try {
    return { quote: await fetchExchangeQuote() };
  } catch {
    return { error: 'Recent exchange rates are unavailable. Your prices have not changed. You can enter EUR/USD prices manually or try again.' };
  }
}
