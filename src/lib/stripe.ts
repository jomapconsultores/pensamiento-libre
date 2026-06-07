import Stripe from 'stripe';

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY no está configurado. Agrega tu clave secreta de Stripe en .env.local.'
    );
  }
  cached = new Stripe(key, {
    apiVersion: '2025-02-24.acacia',
    typescript: true,
    appInfo: {
      name: 'Fundacion Pensamiento Libre',
      version: '0.1.0',
    },
  });
  return cached;
}

export const STRIPE_CONFIG = {
  donationPriceId: process.env.STRIPE_DONATION_PRICE_ID,
  membershipBasicPriceId: process.env.STRIPE_MEMBERSHIP_BASIC_PRICE_ID,
  membershipPremiumPriceId: process.env.STRIPE_MEMBERSHIP_PREMIUM_PRICE_ID,
  serviceTallerPriceId: process.env.STRIPE_SERVICE_TALLER_PRICE_ID,
  serviceConsultaPriceId: process.env.STRIPE_SERVICE_CONSULTA_PRICE_ID,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
};
