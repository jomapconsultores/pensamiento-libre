import { Resend } from 'resend';

let cached: Resend | null = null;

function getResend(): Resend | null {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  cached = new Resend(key);
  return cached;
}

const FROM = process.env.EMAIL_FROM ?? 'Fundación Pensamiento Libre <onboarding@resend.dev>';
const TO = process.env.CONTACT_EMAIL ?? 'jomapconsultores@gmail.com';

interface SendArgs {
  to?: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendNotification({ to, subject, html, replyTo }: SendArgs) {
  const resend = getResend();
  if (!resend) {
    console.log('[Email] RESEND_API_KEY no configurado, mensaje no enviado:', subject);
    return { skipped: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: to ?? TO,
      subject,
      html,
      replyTo,
    });
    if (error) {
      console.error('[Email] Error Resend:', error);
      return { error };
    }
    return { id: data?.id };
  } catch (err) {
    console.error('[Email] Excepción:', err);
    return { error: err };
  }
}

export function contactNotificationHtml(args: {
  name: string;
  email: string;
  topic: string;
  message: string;
}) {
  const safe = (s: string) => s.replace(/[<>&]/g, (c) =>
    c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&amp;'
  );
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1e3a6d; color: white; padding: 24px; border-radius: 12px 12px 0 0;">
        <h1 style="margin:0; font-size:20px;">📬 Nuevo mensaje en pensamientolibre.org</h1>
      </div>
      <div style="background: #fdf8ed; padding: 24px; border-radius: 0 0 12px 12px;">
        <p style="margin:0 0 12px;"><strong>De:</strong> ${safe(args.name)} &lt;${safe(args.email)}&gt;</p>
        <p style="margin:0 0 12px;"><strong>Asunto:</strong> ${safe(args.topic)}</p>
        <hr style="border:none; border-top:1px solid #d4a017; margin:16px 0;">
        <p style="margin:0; white-space:pre-wrap; line-height:1.6;">${safe(args.message)}</p>
        <div style="margin-top:24px; padding-top:16px; border-top:1px solid #1e3a6d22;">
          <a href="mailto:${safe(args.email)}" style="display:inline-block; background:#d4a017; color:#1e3a6d; padding:10px 20px; border-radius:999px; font-weight:bold; text-decoration:none;">Responder</a>
        </div>
      </div>
    </div>
  `;
}

export function donationNotificationHtml(args: {
  donor: string;
  amount: string;
  recurring: boolean;
}) {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #d4a017; color: white; padding: 24px; border-radius: 12px 12px 0 0;">
        <h1 style="margin:0; font-size:20px;">💛 ¡Nueva donación recibida!</h1>
      </div>
      <div style="background: #fdf8ed; padding: 24px; border-radius: 0 0 12px 12px;">
        <p style="font-size: 18px; margin: 0;">
          <strong>${args.donor}</strong> donó
          <span style="color:#1e3a6d; font-size: 24px; font-weight: bold;">${args.amount}</span>
          ${args.recurring ? '<span style="background:#1e3a6d;color:white;padding:2px 8px;border-radius:6px;font-size:12px;margin-left:6px;">MENSUAL</span>' : ''}
        </p>
        <p style="color:#1e3a6d99; margin-top: 16px; font-size:14px;">Mira el detalle en el panel admin.</p>
      </div>
    </div>
  `;
}
