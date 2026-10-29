import Stripe from 'stripe';
export function stripeConfigured() { return /^sk_test_[A-Za-z0-9]+$/.test(process.env.STRIPE_SECRET_KEY ?? '') && (process.env.STRIPE_WEBHOOK_SECRET ?? '').startsWith('whsec_'); }
export function stripeClient() {
  if (!stripeConfigured()) throw new Error('Configure Stripe test keys and the webhook signing secret first.');
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { maxNetworkRetries: 2, timeout: 15000 });
}
