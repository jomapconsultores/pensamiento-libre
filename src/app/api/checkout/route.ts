import { NextRequest, NextResponse } from 'next/server';
import { getStripe, STRIPE_CONFIG } from '@/lib/stripe';

type CheckoutBody =
  | { type: 'donation'; amount: number; recurring: boolean; donorEmail?: string }
  | { type: 'membership'; tier: 'basic' | 'premium'; donorEmail?: string }
  | { type: 'service'; serviceId: 'taller' | 'consulta'; donorEmail?: string };

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutBody;
    const successUrl = `${STRIPE_CONFIG.siteUrl}/gracias?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${STRIPE_CONFIG.siteUrl}/donar?canceled=1`;

    let session;

    if (body.type === 'donation') {
      if (!body.amount || body.amount < 1) {
        return NextResponse.json({ error: 'Monto inválido' }, { status: 400 });
      }

      const amountCents = Math.round(body.amount * 100);

      session = await getStripe().checkout.sessions.create({
        mode: body.recurring ? 'subscription' : 'payment',
        payment_method_types: ['card'],
        customer_email: body.donorEmail,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: body.recurring ? 'Donación mensual' : 'Donación única',
                description: 'Fundación Pensamiento Libre — Tu aporte transforma vidas.',
              },
              unit_amount: amountCents,
              ...(body.recurring && { recurring: { interval: 'month' } }),
            },
            quantity: 1,
          },
        ],
        metadata: { kind: 'donation', recurring: String(body.recurring) },
        // La suscripción que nace de una donación mensual lleva SUS PROPIAS
        // metadata: las de la sesión no se copian, y sin esto los eventos
        // `customer.subscription.*` llegan sin saber de qué son.
        ...(body.recurring && {
          subscription_data: { metadata: { kind: 'donation', recurring: 'true' } },
        }),
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
    } else if (body.type === 'membership') {
      const priceId =
        body.tier === 'basic'
          ? STRIPE_CONFIG.membershipBasicPriceId
          : STRIPE_CONFIG.membershipPremiumPriceId;

      if (!priceId) {
        return NextResponse.json(
          { error: 'El plan de membresía aún no está configurado en Stripe.' },
          { status: 503 }
        );
      }

      session = await getStripe().checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: body.donorEmail,
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: { kind: 'membership', tier: body.tier },
        // El plan viaja también en la suscripción: es lo único que llega en
        // los eventos posteriores (renovación, cancelación) para saber el tier.
        subscription_data: { metadata: { kind: 'membership', tier: body.tier } },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
    } else if (body.type === 'service') {
      const priceId =
        body.serviceId === 'taller'
          ? STRIPE_CONFIG.serviceTallerPriceId
          : STRIPE_CONFIG.serviceConsultaPriceId;

      if (!priceId) {
        return NextResponse.json(
          { error: 'El servicio aún no está configurado en Stripe.' },
          { status: 503 }
        );
      }

      session = await getStripe().checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: body.donorEmail,
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: { kind: 'service', serviceId: body.serviceId },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
    } else {
      return NextResponse.json({ error: 'Tipo de transacción no soportado' }, { status: 400 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[Checkout] Error:', err);
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
