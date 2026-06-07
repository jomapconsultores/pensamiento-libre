import { supabaseAdmin } from '@/lib/supabase';
import { EmptyState, formatDate } from '@/components/admin/DataTable';
import { ExportCSV } from '@/components/admin/ExportCSV';

export const dynamic = 'force-dynamic';

export default async function AdminMembershipsPage() {
  const { data, error } = await supabaseAdmin()
    .from('memberships')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return <EmptyState message={`Error: ${error.message}`} />;

  const active = (data ?? []).filter((m) => m.status === 'active').length;

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-navy">Membresías</h1>
          <p className="text-brand-navy/60 mt-1">
            {data?.length ?? 0} membresía(s) · {active} activa(s).
          </p>
        </div>
        <ExportCSV
          filename="membresias"
          headers={[
            { key: 'created_at', label: 'Inicio' },
            { key: 'member_email', label: 'Email' },
            { key: 'tier', label: 'Plan' },
            { key: 'status', label: 'Estado' },
            { key: 'current_period_end', label: 'Renueva' },
            { key: 'stripe_subscription_id', label: 'Stripe Sub' },
          ]}
          rows={data ?? []}
        />
      </header>

      {!data || data.length === 0 ? (
        <EmptyState message="Aún no hay miembros. Configura Stripe + planes de suscripción." />
      ) : (
        <div className="bg-white rounded-2xl border border-brand-navy/10 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-cream/40 text-brand-navy/70 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Inicio</th>
                <th className="px-4 py-3 font-semibold">Miembro</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Renueva</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-navy/10">
              {data.map((m) => (
                <tr key={m.id} className="hover:bg-brand-cream/30">
                  <td className="px-4 py-3 whitespace-nowrap text-brand-navy/70">
                    {formatDate(m.created_at)}
                  </td>
                  <td className="px-4 py-3">{m.member_email ?? '—'}</td>
                  <td className="px-4 py-3 capitalize">{m.tier}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs ${
                        m.status === 'active'
                          ? 'bg-brand-green/15 text-brand-green'
                          : 'bg-brand-navy/10 text-brand-navy/70'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-brand-navy/70 whitespace-nowrap">
                    {formatDate(m.current_period_end)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
