export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-display font-bold text-brand-navy mb-3">{title}</h2>
      {children}
    </section>
  );
}
