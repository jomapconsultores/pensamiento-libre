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

const moneyFormatters = new Map<string, Intl.NumberFormat>();

function getMoneyFormatter(currency: string) {
  let formatter = moneyFormatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency,
    });
    moneyFormatters.set(currency, formatter);
  }
  return formatter;
}

export function formatMoney(cents: number, currency = 'usd') {
  return getMoneyFormatter(currency.toUpperCase()).format(cents / 100);
}
