import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendNotification, contactNotificationHtml } from '@/lib/email';

interface ContactPayload {
  name?: string;
  email?: string;
  phone?: string;
  topic?: string;
  message?: string;
  consent?: boolean;
  consent_text?: string;
  policy_version?: string;
  utm?: Record<string, string>;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const CAPTURE_URL = process.env.MARKETING_CAPTURE_URL;

/**
 * Entrega el contacto al CRM de marketing para clasificarlo y darle seguimiento.
 *
 * Solo se envía si la persona autorizó explícitamente el contacto comercial:
 * responder una consulta y hacer seguimiento son finalidades distintas, y sin
 * ese permiso el lead no sale de aquí. Es no bloqueante a propósito — si el CRM
 * está caído, el mensaje ya quedó guardado y notificado.
 */
async function enviarAlCrm(lead: ContactPayload & { topic: string }) {
  if (!CAPTURE_URL || lead.consent !== true) return;
  const res = await fetch(CAPTURE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      message: lead.message,
      interested_product: lead.topic,
      consent: true,
      consent_text: lead.consent_text,
      policy_version: lead.policy_version,
      utm: lead.utm,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`CRM respondió ${res.status}`);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ContactPayload;
    const name = body.name?.trim();
    const email = body.email?.trim();
    const phone = body.phone?.trim();
    const topic = body.topic?.trim() || 'general';
    const message = body.message?.trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios (nombre, email, mensaje).' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Email inválido.' }, { status: 400 });
    }

    if (message.length < 10) {
      return NextResponse.json(
        { error: 'El mensaje debe tener al menos 10 caracteres.' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin()
      .from('contact_messages')
      .insert({ name, email, topic, message });

    if (error) {
      console.error('[Contact] Error guardando en Supabase:', error);
      return NextResponse.json({ error: 'No se pudo guardar el mensaje.' }, { status: 500 });
    }

    // Notificación por email (no bloqueante)
    void sendNotification({
      subject: `[Pensamiento Libre] Nuevo mensaje: ${topic}`,
      html: contactNotificationHtml({ name, email, topic, message }),
      replyTo: email,
    });

    // Entrega al CRM (no bloqueante, solo con autorización explícita)
    void enviarAlCrm({
      name,
      email,
      phone,
      topic,
      message,
      consent: body.consent === true,
      consent_text: body.consent_text,
      policy_version: body.policy_version,
      utm: body.utm,
    }).catch((err) => console.error('[Contact] No se pudo entregar el lead al CRM:', err));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Contact] Error:', err);
    return NextResponse.json({ error: 'Error procesando el mensaje.' }, { status: 500 });
  }
}
