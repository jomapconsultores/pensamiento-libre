export function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-2xl p-12 text-center border border-brand-navy/10">
      <p className="text-brand-navy/60">{message}</p>
    </div>
  );
}

export function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function formatMoney(cents: number, currency = 'usd') {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}
