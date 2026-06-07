import type { Metadata } from 'next';
import { MembershipCards } from '@/components/MembershipCards';

export const metadata: Metadata = {
  title: 'Membresías | Fundación Pensamiento Libre',
  description:
    'Conviértete en miembro y apoya nuestra misión cada mes. Accede a beneficios exclusivos.',
};

export default function MembresiasPage() {
  return (
    <>
      <section className="hero-bg py-20">
        <div className="container-page text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-brand-navy">
            Hazte miembro
          </h1>
          <p className="mt-6 text-lg md:text-xl text-brand-navy/70 max-w-3xl mx-auto">
            Al convertirte en miembro sostienes mensualmente nuestros programas y
            recibes beneficios diseñados para tu crecimiento.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page">
          <MembershipCards />
        </div>
      </section>
    </>
  );
}
