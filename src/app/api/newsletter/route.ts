import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; source?: string };
    const email = body.email?.trim().toLowerCase();
    const source = body.source?.trim() || 'web';

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Email inválido.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin()
      .from('newsletter_subscribers')
      .upsert({ email, source }, { onConflict: 'email', ignoreDuplicates: true });

    if (error) {
      console.error('[Newsletter] Error:', error);
      return NextResponse.json({ error: 'No se pudo registrar el email.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Newsletter] Error:', err);
    return NextResponse.json({ error: 'Error procesando la solicitud.' }, { status: 500 });
  }
}
