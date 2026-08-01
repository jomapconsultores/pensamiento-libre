import { supabaseAdmin } from '@/lib/supabase';
import { requireAdminUser } from '@/lib/adminAuth';
import { EmptyState, formatDate } from '@/components/admin/DataTable';
import { ExportCSV } from '@/components/admin/ExportCSV';

export const dynamic = 'force-dynamic';

export default async function AdminMessagesPage() {
  // Exige sesion y bloquea a quien arrastra una clave temporal sin cambiar.
  await requireAdminUser();

  const { data, error } = await supabaseAdmin()
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return <EmptyState message={`Error: ${error.message}`} />;
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-navy">Mensajes de contacto</h1>
          <p className="text-brand-navy/60 mt-1">{data?.length ?? 0} mensaje(s) totales.</p>
        </div>
        <ExportCSV
          filename="mensajes-contacto"
          headers={[
            { key: 'created_at', label: 'Fecha' },
            { key: 'name', label: 'Nombre' },
            { key: 'email', label: 'Email' },
            { key: 'topic', label: 'Asunto' },
            { key: 'message', label: 'Mensaje' },
          ]}
          rows={data ?? []}
        />
      </header>

      {!data || data.length === 0 ? (
        <EmptyState message="Aún no llegan mensajes." />
      ) : (
        <div className="bg-white rounded-2xl border border-brand-navy/10 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-cream/40 text-brand-navy/70 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Asunto</th>
                <th className="px-4 py-3 font-semibold">Mensaje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-navy/10">
              {data.map((m) => (
                <tr key={m.id} className="hover:bg-brand-cream/30">
                  <td className="px-4 py-3 whitespace-nowrap text-brand-navy/70">
                    {formatDate(m.created_at)}
                  </td>
                  <td className="px-4 py-3 font-medium text-brand-navy">{m.name}</td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${m.email}`} className="text-brand-gold hover:underline">
                      {m.email}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded bg-brand-navy/10 text-brand-navy text-xs">
                      {m.topic}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-brand-navy/80 max-w-md">{m.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
