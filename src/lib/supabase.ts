import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[Supabase] Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. Configura .env.local.'
  );
}

export function supabaseBrowser(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
}

let cachedAdmin: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (!SUPABASE_SERVICE_KEY) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY no está configurada. Necesaria para escrituras desde el servidor.'
    );
  }
  if (!cachedAdmin) {
    cachedAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cachedAdmin;
}

export type ContactMessageRow = {
  id?: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  created_at?: string;
};

export type DonationRow = {
  id?: string;
  stripe_session_id: string;
  stripe_customer_id?: string | null;
  amount_cents: number;
  currency: string;
  donor_email?: string | null;
  recurring: boolean;
  status: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
};

export type MembershipRow = {
  id?: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  tier: 'basic' | 'premium' | string;
  status: string;
  member_email?: string | null;
  current_period_end?: string | null;
  created_at?: string;
};

export type NewsletterSubscriberRow = {
  id?: string;
  email: string;
  source?: string | null;
  created_at?: string;
};
