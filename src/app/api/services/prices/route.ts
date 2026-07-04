import { NextResponse } from 'next/server';
import { getStripe, STRIPE_CONFIG } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

function formatAmount(unitAmount: number | null | undefined): string | null {
  if (unitAmount == null) return null;
  const amount = unitAmount / 100;
  return `$${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)}`;
}

export async function GET() {
  try {
    const stripe = getStripe();

    const [consulta, taller] = await Promise.all([
      STRIPE_CONFIG.serviceConsultaPriceId
        ? stripe.prices.retrieve(STRIPE_CONFIG.serviceConsultaPriceId)
        : Promise.resolve(null),
      STRIPE_CONFIG.serviceTallerPriceId
        ? stripe.prices.retrieve(STRIPE_CONFIG.serviceTallerPriceId)
        : Promise.resolve(null),
    ]);

    return NextResponse.json({
      consulta: formatAmount(consulta?.unit_amount),
      taller: formatAmount(taller?.unit_amount),
    });
  } catch (err) {
    console.error('[Services Prices] Error:', err);
    // Fail soft: the frontend falls back to its own static price if this returns nulls.
    return NextResponse.json({ consulta: null, taller: null });
  }
}
