import { supabaseAdmin } from '@/lib/supabase';
import { requireAdminUser } from '@/lib/adminAuth';
import { StatCard } from '@/components/admin/StatCard';
import { formatDate, formatMoney } from '@/components/admin/DataTable';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function loadStats() {
  const supa = supabaseAdmin();

  const [messages, newsletter, donations, memberships, services] = await Promise.all([
    supa.from('contact_messages').select('id', { count: 'exact', head: true }),
    supa.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
    supa.from('donations').select('amount_cents, currency, recurring'),
    supa.from('memberships').select('id, status', { count: 'exact' }),
    supa.from('service_payments').select('amount_cents, currency'),
  ]);

  const donationTotal = (donations.data ?? []).reduce(
    (acc, d) => acc + (d.amount_cents ?? 0),
    0
  );
  const recurringDonors = (donations.data ?? []).filter((d) => d.recurring).length;
  const activeMembers = (memberships.data ?? []).filter((m) => m.status === 'active').length;
  const servicesTotal = (services.data ?? []).reduce(
    (acc, s) => acc + (s.amount_cents ?? 0),
    0
  );

  const [recentMessages, recentDonations] = await Promise.all([
    supa.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(5),
    supa.from('donations').select('*').order('created_at', { ascending: false }).limit(5),
  ]);

  return {
    counts: {
      messages: messages.count ?? 0,
      newsletter: newsletter.count ?? 0,
      donations: donations.data?.length ?? 0,
      donationTotal,
      recurringDonors,
      activeMembers,
      servicesTotal,
      services: services.data?.length ?? 0,
    },
    recent: {
      messages: recentMessages.data ?? [],
      donations: recentDonations.data ?? [],
    },
  };
}

export default async function AdminHomePage() {
  // Exige sesión y bloquea a quien arrastra una clave temporal sin cambiar.
  await requireAdminUser();
  const { counts, recent } = await loadStats();

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-display font-bold text-brand-navy">Resumen general</h1>
        <p className="text-brand-navy/60 mt-1">Datos en tiempo real desde Supabase.</p>
      </header>

      <section>
        <h2 className="text-lg font-bold text-brand-navy mb-4">Comunidad</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Mensajes recibidos" value={counts.messages} accent="navy" />
          <StatCard label="Newsletter" value={counts.newsletter} hint="suscriptores únicos" accent="sky" />
          <StatCard label="Miembros activos" value={counts.activeMembers} accent="gold" />
          <StatCard label="Donantes mensuales" value={counts.recurringDonors} accent="green" />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-brand-navy mb-4">Ingresos</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="Total donaciones"
            value={formatMoney(counts.donationTotal)}
            hint={`${counts.donations} transacción(es)`}
            accent="gold"
          />
          <StatCard
            label="Ingresos por servicios"
            value={formatMoney(counts.servicesTotal)}
            hint={`${counts.services} pago(s)`}
            accent="sky"
          />
          <StatCard
            label="Ingresos totales"
            value={formatMoney(counts.donationTotal + counts.servicesTotal)}
            accent="navy"
          />
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-brand-navy/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-brand-navy">Últimos mensajes</h3>
            <Link href="/admin/mensajes" className="text-sm text-brand-gold hover:underline">
              Ver todos →
            </Link>
          </div>
          {recent.messages.length === 0 ? (
            <p className="text-brand-navy/50 text-sm">Aún no hay mensajes.</p>
          ) : (
            <ul className="divide-y divide-brand-navy/10">
              {recent.messages.map((m) => (
                <li key={m.id} className="py-3">
                  <p className="font-semibold text-brand-navy text-sm">{m.name}</p>
                  <p className="text-xs text-brand-navy/60">{m.email} · {formatDate(m.created_at)}</p>
                  <p className="text-sm text-brand-navy/80 mt-1 line-clamp-2">{m.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-brand-navy/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-brand-navy">Últimas donaciones</h3>
            <Link href="/admin/donaciones" className="text-sm text-brand-gold hover:underline">
              Ver todas →
            </Link>
          </div>
          {recent.donations.length === 0 ? (
            <p className="text-brand-navy/50 text-sm">
              Aún no hay donaciones. Configura Stripe para empezar a recibirlas.
            </p>
          ) : (
            <ul className="divide-y divide-brand-navy/10">
              {recent.donations.map((d) => (
                <li key={d.id} className="py-3 flex justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-brand-navy">
                      {d.donor_email ?? 'Anónimo'}
                    </p>
                    <p className="text-xs text-brand-navy/60">
                      {formatDate(d.created_at)} {d.recurring && '· recurrente'}
                    </p>
                  </div>
                  <p className="font-bold text-brand-navy">
                    {formatMoney(d.amount_cents, d.currency)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
