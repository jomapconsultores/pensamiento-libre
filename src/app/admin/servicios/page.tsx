import { supabaseAdmin } from '@/lib/supabase';
import { EmptyState, formatDate, formatMoney } from '@/components/admin/DataTable';
import { ExportCSV } from '@/components/admin/ExportCSV';

export const dynamic = 'force-dynamic';

export default async function AdminServicesPage() {
  const { data, error } = await supabaseAdmin()
    .from('service_payments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return <EmptyState message={`Error: ${error.message}`} />;

  const total = (data ?? []).reduce((acc, s) => acc + (s.amount_cents ?? 0), 0);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-navy">Pagos por servicios</h1>
          <p className="text-brand-navy/60 mt-1">
            {data?.length ?? 0} pago(s) · Total: <strong>{formatMoney(total)}</strong>
          </p>
        </div>
        <ExportCSV
          filename="pagos-servicios"
          headers={[
            { key: 'created_at', label: 'Fecha' },
            { key: 'buyer_email', label: 'Comprador' },
            { key: 'service_id', label: 'Servicio' },
            { key: 'amount_cents', label: 'Monto (centavos)' },
            { key: 'currency', label: 'Moneda' },
            { key: 'status', label: 'Estado' },
          ]}
          rows={data ?? []}
        />
      </header>

      {!data || data.length === 0 ? (
        <EmptyState message="Aún no hay pagos de servicios registrados." />
      ) : (
        <div className="bg-white rounded-2xl border border-brand-navy/10 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-cream/40 text-brand-navy/70 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Comprador</th>
                <th className="px-4 py-3 font-semibold">Servicio</th>
                <th className="px-4 py-3 font-semibold">Monto</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-navy/10">
              {data.map((s) => (
                <tr key={s.id} className="hover:bg-brand-cream/30">
                  <td className="px-4 py-3 whitespace-nowrap text-brand-navy/70">
                    {formatDate(s.created_at)}
                  </td>
                  <td className="px-4 py-3">{s.buyer_email ?? 'Anónimo'}</td>
                  <td className="px-4 py-3 capitalize">{s.service_id}</td>
                  <td className="px-4 py-3 font-bold text-brand-navy">
                    {formatMoney(s.amount_cents, s.currency)}
                  </td>
                  <td className="px-4 py-3 text-brand-navy/70">{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
