import type { Metadata } from 'next';
import { CmajPageLazy as CmajPage } from '@/components/CmajPageLazy';

export const metadata: Metadata = {
  title: 'CMAJ Asociados — Firma Electrónica y Servicios Tributarios | Cuenca',
  description:
    'CMAJ ASOCIADOS S.A.S. ofrece firma electrónica con entrega inmediata, gestión tributaria SRI, compra de notas de crédito y formación profesional en Cuenca, Ecuador.',
};

export default function CmajPageRoute() {
  return <CmajPage />;
}
