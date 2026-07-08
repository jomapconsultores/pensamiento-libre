import { NextRequest, NextResponse } from 'next/server';
import { getStripe, STRIPE_CONFIG } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { sendNotification, donationNotificationHtml } from '@/lib/email';
import type Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function persistCheckoutSession(session: Stripe.Checkout.Session) {
  const supa = supabaseAdmin();
  const kind = (session.metadata?.kind ?? '').toString();

  const baseFields = {
    stripe_session_id: session.id,
    stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
    amount_cents: session.amount_total ?? 0,
    currency: session.currency ?? 'usd',
    status: session.payment_status ?? 'unknown',
    metadata: session.metadata ?? {},
  };

  if (kind === 'donation') {
    const donorEmail = session.customer_details?.email ?? session.customer_email ?? null;
    const recurring = session.metadata?.recurring === 'true';
    const { error } = await supa.from('donations').insert({
      ...baseFields,
      donor_email: donorEmail,
      recurring,
    });
    if (error) {
      console.error('[Webhook] Error insert donation:', error);
      throw new Error(`donation insert failed: ${error.message}`);
    }

    void sendNotification({
      subject: `[Pensamiento Libre] Nueva donación${recurring ? ' mensual' : ''}`,
      html: donationNotificationHtml({
        donor: donorEmail ?? 'Donante anónimo',
        amount: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: (session.currency ?? 'usd').toUpperCase(),
        }).format((session.amount_total ?? 0) / 100),
        recurring,
      }),
    });
  } else if (kind === 'service') {
    const { error } = await supa.from('service_payments').insert({
      stripe_session_id: session.id,
      stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
      service_id: (session.metadata?.serviceId ?? 'desconocido').toString(),
      amount_cents: session.amount_total ?? 0,
      currency: session.currency ?? 'usd',
      buyer_email: session.customer_details?.email ?? session.customer_email ?? null,
      status: session.payment_status ?? 'unknown',
      metadata: session.metadata ?? {},
    });
    if (error) {
      console.error('[Webhook] Error insert service payment:', error);
      throw new Error(`service payment insert failed: ${error.message}`);
    }
  } else if (kind === 'membership') {
    // Las membresías se sincronizan principalmente por evento de subscription
    // pero registramos el inicio aquí
    const { error } = await supa.from('memberships').upsert(
      {
        stripe_subscription_id: (session.subscription as string) ?? session.id,
        stripe_customer_id: (session.customer as string) ?? '',
        tier: (session.metadata?.tier ?? 'basic').toString(),
        status: 'active',
        member_email: session.customer_details?.email ?? session.customer_email ?? null,
      },
      { onConflict: 'stripe_subscription_id' }
    );
    if (error) {
      console.error('[Webhook] Error upsert membership:', error);
      throw new Error(`membership upsert failed: ${error.message}`);
    }
  }
}

async function syncSubscription(sub: Stripe.Subscription) {
  const supa = supabaseAdmin();

  // Derivar el tier a partir del price/product de la suscripción.
  // Si no se puede determinar, dejamos `tier` sin definir para conservar
  // el valor existente en la fila (no degradar premium -> basic por defecto).
  const priceId = sub.items.data[0]?.price.id;
  let tier: string | undefined;
  if (priceId && priceId === STRIPE_CONFIG.membershipPremiumPriceId) {
    tier = 'premium';
  } else if (priceId && priceId === STRIPE_CONFIG.membershipBasicPriceId) {
    tier = 'basic';
  } else if (sub.metadata?.tier) {
    tier = sub.metadata.tier.toString();
  }

  const periodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000).toISOString()
    : null;

  const payload: Record<string, unknown> = {
    stripe_subscription_id: sub.id,
    stripe_customer_id: (sub.customer as string) ?? '',
    status: sub.status,
    current_period_end: periodEnd,
  };
  // Solo escribimos `tier` cuando pudimos determinarlo; de lo contrario
  // el upsert conserva el tier ya guardado.
  if (tier) payload.tier = tier;

  const { error } = await supa
    .from('memberships')
    .upsert(payload, { onConflict: 'stripe_subscription_id' });

  if (error) {
    console.error('[Webhook] Error sync subscription:', error);
    throw new Error(`subscription sync failed: ${error.message}`);
  }
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook no configurado' }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'invalid signature';
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await persistCheckoutSession(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      default:
        console.log('[Webhook] Evento sin manejar:', event.type);
    }
  } catch (err) {
    // Una persistencia necesaria falló: respondemos non-2xx para que Stripe
    // REINTENTE el evento en lugar de descartarlo como procesado.
    console.error('[Webhook] Error procesando evento:', err);
    return new Response('Error procesando webhook', { status: 500 });
  }

  return NextResponse.json({ received: true });
}
