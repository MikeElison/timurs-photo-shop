"use client";
import { useState } from 'react';
import { currencies, money, type Currency, type Prices } from '../lib/photos';
export default function LicencePicker({ prices, sample = true, photoId, checkoutEnabled = false }: { prices: Prices; sample?: boolean; photoId?: string; checkoutEnabled?: boolean }) {
  const [currency, setCurrency] = useState<Currency>('GBP');
  const [licence, setLicence] = useState<'personal' | 'commercial'>('personal');
  const [email,setEmail]=useState('');
  const [message,setMessage]=useState('');
  const [pending,setPending]=useState(false);
  async function checkout() {
    setPending(true);setMessage('');
    try {
      const form=new FormData();form.set('photoId',photoId??'');form.set('currency',currency);form.set('licence',licence);form.set('email',email);
      const response=await fetch('/api/checkout',{method:'POST',body:form});const result=await response.json();
      if(!response.ok||!result.url)throw new Error(result.error??'Test checkout is unavailable.');
      window.location.assign(result.url);
    }catch(error){setMessage(error instanceof Error?error.message:'Test checkout failed.');setPending(false);}
  }
  return <div className="purchase"><label className="currency">Display currency<select value={currency} onChange={event => setCurrency(event.target.value as Currency)}>{currencies.map(code => <option key={code}>{code}</option>)}</select></label><fieldset><legend>Choose a {sample ? 'sample ' : ''}licence</legend>{(['personal', 'commercial'] as const).map(kind => <label className={`licence ${licence === kind ? 'selected' : ''}`} key={kind}><input type="radio" name="licence" value={kind} checked={licence === kind} onChange={() => setLicence(kind)}/><span><strong>{kind === 'personal' ? 'Personal' : 'Commercial'}</strong><small>{kind === 'personal' ? 'Illustrative: private enjoyment.' : 'Illustrative: business use.'}</small></span><b>{money(prices[currency][kind], currency)}</b></label>)}</fieldset><p className="total" aria-live="polite">{sample ? 'Sample price' : 'Listed price'} <strong>{money(prices[currency][licence], currency)}</strong></p>{!sample && checkoutEnabled ? <form onSubmit={event=>{event.preventDefault();void checkout();}}><label>Email for your test purchase<input type="email" value={email} onChange={event=>setEmail(event.target.value)} required maxLength={254}/></label><button className="primary-button" disabled={pending}>{pending?'Opening Stripe test checkout…':'Buy in Stripe test mode'}</button><p className="image-note">Use Stripe test payment details only. Purchase emails go to the private local outbox. Licence terms are demonstrations.</p></form>:<p className="image-note">{sample?'Sample artwork cannot be purchased.':'Test checkout requires local Stripe test keys and webhook setup.'}</p>}<p role="status">{message}</p></div>;
}
