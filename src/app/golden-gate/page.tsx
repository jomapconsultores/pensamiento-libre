import type { Metadata } from 'next';
import { GoldenGatePageLazy as GoldenGatePage } from '@/components/GoldenGatePageLazy';

export const metadata: Metadata = {
  title: 'Golden Gate English Center — Aprende Inglés en Cuenca | TOEFL · Cambridge',
  description:
    'Centro de inglés en Cuenca con certificaciones TOEFL y Cambridge. Clases presenciales y virtuales con metodología activa. Inscríbete: +593 96 359 3300',
};

export default function GoldenGatePageRoute() {
  return <GoldenGatePage />;
}
