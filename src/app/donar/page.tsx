import type { Metadata } from 'next';
import { DonationForm } from '@/components/DonationForm';

export const metadata: Metadata = {
  title: 'Donar | Fundación Pensamiento Libre',
  description:
    'Realiza una donación única o recurrente. Tu aporte transforma vidas y libera mentes.',
};

const impact = [
  { amount: '$10', text: 'cubre una sesión de orientación psicológica' },
  { amount: '$25', text: 'permite un kit de materiales para taller comunitario' },
  { amount: '$50', text: 'sostiene una beca educativa por un mes' },
  { amount: '$100', text: 'financia un mes de salud mental para una familia' },
];

export default function DonarPage() {
  return (
    <>
      <section className="hero-bg py-20">
        <div className="container-page text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-brand-navy">
            Tu aporte libera mentes
          </h1>
          <p className="mt-6 text-lg md:text-xl text-brand-navy/70 max-w-3xl mx-auto">
            Cada donación, por más pequeña que parezca, multiplica nuestro impacto en
            las comunidades que más lo necesitan.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl font-display font-bold text-brand-navy mb-6">
              Realiza tu donación
            </h2>
            <p className="text-brand-navy/75 mb-8 leading-relaxed">
              Selecciona un monto y modalidad. El pago se procesa de forma segura
              mediante Stripe. Recibirás un recibo por email.
            </p>
            <DonationForm />
          </div>

          <div className="bg-brand-cream/60 rounded-2xl p-8 lg:sticky lg:top-28">
            <h3 className="text-2xl font-display font-bold text-brand-navy mb-6">
              Tu impacto
            </h3>
            <ul className="space-y-4">
              {impact.map((i) => (
                <li key={i.amount} className="flex gap-4 items-start">
                  <span className="flex-shrink-0 w-16 h-16 rounded-xl bg-brand-gold text-white font-bold flex items-center justify-center text-lg">
                    {i.amount}
                  </span>
                  <p className="text-brand-navy/80 pt-3">{i.text}</p>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-brand-navy/60 leading-relaxed">
              Los pagos se procesan con cifrado seguro a través de Stripe. La Fundación
              Pensamiento Libre no almacena datos de tarjetas.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
