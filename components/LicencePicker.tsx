"use client";
import { useState } from 'react';
import { currencies, prices, money, type Currency } from '../lib/photos';
export default function LicencePicker() {
  const [currency, setCurrency] = useState<Currency>('GBP');
  const [licence, setLicence] = useState<'personal' | 'commercial'>('personal');
  return <div className="purchase"><label className="currency">Display currency<select value={currency} onChange={event => setCurrency(event.target.value as Currency)}>{currencies.map(code => <option key={code}>{code}</option>)}</select></label><fieldset><legend>Choose a sample licence</legend>{(['personal', 'commercial'] as const).map(kind => <label className={`licence ${licence === kind ? 'selected' : ''}`} key={kind}><input type="radio" name="licence" value={kind} checked={licence === kind} onChange={() => setLicence(kind)}/><span><strong>{kind === 'personal' ? 'Personal' : 'Commercial'}</strong><small>{kind === 'personal' ? 'Illustrative: private enjoyment.' : 'Illustrative: business use.'}</small></span><b>{money(prices[currency][kind], currency)}</b></label>)}</fieldset><p className="total" aria-live="polite">Sample price <strong>{money(prices[currency][licence], currency)}</strong></p><button disabled>Purchasing unavailable in this prototype</button><p className="image-note">No payment is taken. Licence descriptions are placeholders, not legal terms.</p></div>;
}
