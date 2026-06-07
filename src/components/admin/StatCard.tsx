export function StatCard({
  label,
  value,
  hint,
  accent = 'navy',
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: 'navy' | 'gold' | 'sky' | 'green';
}) {
  const accentClasses = {
    navy: 'border-brand-navy/15 from-brand-navy/5',
    gold: 'border-brand-gold/30 from-brand-gold/10',
    sky: 'border-brand-sky/30 from-brand-sky/10',
    green: 'border-brand-green/30 from-brand-green/10',
  };

  return (
    <div className={`bg-gradient-to-br ${accentClasses[accent]} to-white rounded-2xl p-6 border shadow-sm`}>
      <p className="text-sm font-medium text-brand-navy/60 uppercase tracking-wide">{label}</p>
      <p className="mt-3 text-4xl font-bold text-brand-navy">{value}</p>
      {hint && <p className="mt-2 text-sm text-brand-navy/60">{hint}</p>}
    </div>
  );
}
