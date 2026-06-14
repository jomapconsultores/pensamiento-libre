import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const CmajPage = dynamic(
  () => import('@/components/CmajPage').then((m) => ({ default: m.CmajPage })),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full" />
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: 'CMAJ Asociados — Firma Electrónica y Servicios Tributarios | Cuenca',
  description:
    'CMAJ ASOCIADOS S.A.S. ofrece firma electrónica con entrega inmediata, gestión tributaria SRI, compra de notas de crédito y formación profesional en Cuenca, Ecuador.',
};

export default function CmajPageRoute() {
  return <CmajPage />;
}
