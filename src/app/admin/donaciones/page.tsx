import { supabaseAdmin } from '@/lib/supabase';
import { requireAdminUser } from '@/lib/adminAuth';
import { EmptyState, formatDate, formatMoney } from '@/components/admin/DataTable';
import { ExportCSV } from '@/components/admin/ExportCSV';

export const dynamic = 'force-dynamic';

export default async function AdminDonationsPage() {
  // Exige sesion y bloquea a quien arrastra una clave temporal sin cambiar.
  await requireAdminUser();

  const { data, error } = await supabaseAdmin()
    .from('donations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return <EmptyState message={`Error: ${error.message}`} />;

  const total = (data ?? []).reduce((acc, d) => acc + (d.amount_cents ?? 0), 0);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-navy">Donaciones</h1>
          <p className="text-brand-navy/60 mt-1">
            {data?.length ?? 0} transacción(es) · Total: <strong>{formatMoney(total)}</strong>
          </p>
        </div>
        <ExportCSV
          filename="donaciones"
          headers={[
            { key: 'created_at', label: 'Fecha' },
            { key: 'donor_email', label: 'Donante' },
            { key: 'amount_cents', label: 'Monto (centavos)' },
            { key: 'currency', label: 'Moneda' },
            { key: 'recurring', label: 'Recurrente' },
            { key: 'status', label: 'Estado' },
            { key: 'stripe_session_id', label: 'Stripe Session' },
          ]}
          rows={data ?? []}
        />
      </header>

      {!data || data.length === 0 ? (
        <EmptyState message="Aún no hay donaciones registradas. Configura Stripe y prueba un pago." />
      ) : (
        <div className="bg-white rounded-2xl border border-brand-navy/10 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-cream/40 text-brand-navy/70 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Donante</th>
                <th className="px-4 py-3 font-semibold">Monto</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-navy/10">
              {data.map((d) => (
                <tr key={d.id} className="hover:bg-brand-cream/30">
                  <td className="px-4 py-3 whitespace-nowrap text-brand-navy/70">
                    {formatDate(d.created_at)}
                  </td>
                  <td className="px-4 py-3">{d.donor_email ?? 'Anónimo'}</td>
                  <td className="px-4 py-3 font-bold text-brand-navy">
                    {formatMoney(d.amount_cents, d.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs ${
                        d.recurring
                          ? 'bg-brand-gold/15 text-brand-gold'
                          : 'bg-brand-sky/15 text-brand-sky'
                      }`}
                    >
                      {d.recurring ? 'Mensual' : 'Única'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-brand-navy/70">{d.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
