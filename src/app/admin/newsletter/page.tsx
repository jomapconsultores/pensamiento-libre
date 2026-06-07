import { supabaseAdmin } from '@/lib/supabase';
import { EmptyState, formatDate } from '@/components/admin/DataTable';

export const dynamic = 'force-dynamic';

export default async function AdminNewsletterPage() {
  const { data, error } = await supabaseAdmin()
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return <EmptyState message={`Error: ${error.message}`} />;

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-navy">Suscriptores newsletter</h1>
          <p className="text-brand-navy/60 mt-1">{data?.length ?? 0} suscriptor(es).</p>
        </div>
        {data && data.length > 0 && (
          <a
            href={`mailto:?bcc=${data.map((s) => s.email).join(',')}`}
            className="btn-outline text-sm"
          >
            Componer email a todos
          </a>
        )}
      </header>

      {!data || data.length === 0 ? (
        <EmptyState message="Aún no hay suscriptores." />
      ) : (
        <div className="bg-white rounded-2xl border border-brand-navy/10 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-cream/40 text-brand-navy/70 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Origen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-navy/10">
              {data.map((s) => (
                <tr key={s.id} className="hover:bg-brand-cream/30">
                  <td className="px-4 py-3 whitespace-nowrap text-brand-navy/70">
                    {formatDate(s.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${s.email}`} className="text-brand-gold hover:underline">
                      {s.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-brand-navy/70">{s.source ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
