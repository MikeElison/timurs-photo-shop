import { currencies, type Prices } from './photos';
import { MAX_UPLOAD_BYTES } from './upload-limits';
export class InputError extends Error {}
export function textField(form: FormData, key: string, max: number) {
  const value = form.get(key);
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new InputError(`${key}: enter 1–${max} characters.`);
  return value.trim();
}
export function parsePrice(value: FormDataEntryValue | null) {
  if (typeof value !== 'string' || !/^\d{1,6}(\.\d{1,2})?$/.test(value)) throw new InputError('Enter each price as a positive amount with at most two decimal places.');
  const [whole, fraction = ''] = value.split('.');
  const minor = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (minor < 1 || minor > 99999999) throw new InputError('Prices must be between 0.01 and 999999.99.');
  return minor;
}
export function photoFields(form: FormData) {
  const prices = {} as Prices;
  for (const currency of currencies) prices[currency] = { personal: parsePrice(form.get(`${currency}-personal`)), commercial: parsePrice(form.get(`${currency}-commercial`)) };
  return { title: textField(form, 'title', 120), collection: textField(form, 'collection', 80), description: textField(form, 'description', 2000), prices };
}
export const isPhotoId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id);

export function uploadFile(value: FormDataEntryValue | null): File {
  if (!(value instanceof File) || value.size === 0 || value.size > MAX_UPLOAD_BYTES) {
    throw new InputError('Choose a JPEG or PNG up to 20 MiB.');
  }
  return value;
}
