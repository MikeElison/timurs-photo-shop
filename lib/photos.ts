export type Currency = 'GBP' | 'EUR' | 'USD';
export type Prices = Record<Currency, { personal: number; commercial: number }>;
export type Photo = { slug: string; title: string; collection: string; description: string; preview: string; sample: boolean; width: number; height: number; prices: Prices };
export const currencies: Currency[] = ['GBP', 'EUR', 'USD'];
export const photos = [
  { slug: 'quiet-tide', title: 'Quiet tide', collection: 'Coast', description: 'An imagined shoreline in soft evening light. A sample illustration standing in for a future photograph.', palette: ['#b8c4c3', '#5c8086', '#ded2bb'] },
  { slug: 'highland-light', title: 'Highland light', collection: 'Landscape', description: 'Layers of imagined hills beneath a pale sky. Sample artwork for exploring the shop layout.', palette: ['#c6c9bd', '#546956', '#879176'] },
  { slug: 'last-light', title: 'Last light', collection: 'Landscape', description: 'Warm light over an imagined open landscape. Sample artwork, not a photograph by Timurs.', palette: ['#d8b899', '#8a6658', '#b68f6a'] },
];
// Explicit sample prices in minor units; these are not exchange-rate conversions.
export const prices: Prices = {
  GBP: { personal: 1500, commercial: 6500 },
  EUR: { personal: 1800, commercial: 7800 },
  USD: { personal: 2000, commercial: 8500 },
};
export function money(amount: number, currency: Currency) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount / 100);
}
