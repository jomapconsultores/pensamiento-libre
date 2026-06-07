import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendNotification, contactNotificationHtml } from '@/lib/email';

interface ContactPayload {
  name?: string;
  email?: string;
  topic?: string;
  message?: string;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ContactPayload;
    const name = body.name?.trim();
    const email = body.email?.trim();
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

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Contact] Error:', err);
    return NextResponse.json({ error: 'Error procesando el mensaje.' }, { status: 500 });
  }
}
