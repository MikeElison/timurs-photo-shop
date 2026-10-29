'use client';
import { useEffect, useState, useTransition } from 'react';
import { getExchangeQuote } from '../app/admin/pricing-actions';
import { currencies, type Prices } from '../lib/photos';
import { applySuggestions, inputsFromPrices, licenceKinds, suggestedPrice, type ForeignPriceKey, type FxQuote, type PriceKey } from '../lib/pricing';
export default function PriceEditor({ initialPrices, prefix, onBusyChange }: { initialPrices: Prices; prefix: string; onBusyChange: (busy: boolean) => void }) {
  const [inputs, setInputs] = useState(() => inputsFromPrices(initialPrices));
  const [quote, setQuote] = useState<FxQuote>();
  const [overrides, setOverrides] = useState<Partial<Record<ForeignPriceKey, boolean>>>({});
  const [message, setMessage] = useState('');
  const [loading, startLoading] = useTransition();
  useEffect(() => { onBusyChange(loading); }, [loading, onBusyChange]);
  function update(key: PriceKey, value: string) {
    const next = { ...inputs, [key]: value };
    if (!key.startsWith('GBP-')) setOverrides(previous => ({ ...previous, [key]: true }));
    try { setInputs(quote && key.startsWith('GBP-') ? applySuggestions(next, quote, overrides) : next); setMessage(''); }
    catch (error) { setInputs(next); setMessage(error instanceof Error ? error.message : 'Could not suggest prices.'); }
  }
  function loadSuggestions() {
    startLoading(async () => {
      try {
        const result = await getExchangeQuote();
        if (result.error) { setMessage(result.error); return; }
        const next = applySuggestions(inputs, result.quote!, overrides);
        setInputs(next); setQuote(result.quote); setMessage('Suggestions updated. Review these amounts, then save to confirm. Manual overrides were preserved.');
      } catch { setMessage('Could not fetch exchange rates. Your prices have not changed.'); }
    });
  }
  function useSuggestion(key: ForeignPriceKey) {
    if (!quote) return;
    const [currency, kind] = key.split('-') as ['EUR' | 'USD', 'personal' | 'commercial'];
    try {
      const value = suggestedPrice(inputs[`GBP-${kind}`], quote.rates[currency]);
      setInputs(previous => ({ ...previous, [key]: value }));
      setOverrides(previous => ({ ...previous, [key]: false })); setMessage('');
    } catch { setMessage('Enter a valid GBP price before using its suggestion.'); }
  }
  return <fieldset className="price-editor" disabled={loading}>
    <legend>Licence prices</legend>
    <p id={`${prefix}-price-note`}>Enter the two GBP prices, then choose suggestions. EUR/USD round to the nearest 0.50 (minimum 0.50). Editing a suggested amount makes it a manual override. Saved prices change only when you save.</p>
    <button className="secondary-button" type="button" onClick={loadSuggestions}>{loading ? 'Fetching rates…' : quote ? 'Refresh rate suggestions' : 'Suggest EUR/USD from GBP'}</button>
    {quote && <p className="rate-note">Frankfurter reference rates dated {quote.date}: £1 = €{quote.rates.EUR} / US${quote.rates.USD}. Changing GBP now updates linked suggestions.</p>}
    <div className="price-fields">{currencies.map(currency => <fieldset key={currency} aria-describedby={`${prefix}-price-note`}><legend>{currency}</legend>{licenceKinds.map(kind => {
      const key = `${currency}-${kind}` as PriceKey;
      const foreignKey = key as ForeignPriceKey;
      return <div key={kind}><label>{kind === 'personal' ? 'Personal' : 'Commercial'} ({currency})<input name={key} inputMode="decimal" type="text" pattern="[0-9]{1,6}(\.[0-9]{1,2})?" value={inputs[key]} onChange={event => update(key, event.target.value)} required/></label>{currency !== 'GBP' && <><small>{overrides[foreignKey] ? 'Manual override' : quote ? 'Linked suggestion' : 'Entered price'}</small>{quote && overrides[foreignKey] && <button className="text-button" type="button" onClick={() => useSuggestion(foreignKey)}>Use suggestion for {kind} ({currency})</button>}</>}</div>;
    })}</fieldset>)}</div>
    <p role="status">{message}</p>
  </fieldset>;
}
