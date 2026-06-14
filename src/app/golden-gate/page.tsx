import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const GoldenGatePage = dynamic(
  () => import('@/components/GoldenGatePage').then((m) => ({ default: m.GoldenGatePage })),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: 'Golden Gate English Center — Aprende Inglés en Cuenca | TOEFL · Cambridge',
  description:
    'Centro de inglés en Cuenca con certificaciones TOEFL y Cambridge. Clases presenciales y virtuales con metodología activa. Inscríbete: +593 96 305 1347',
};

export default function GoldenGatePageRoute() {
  return <GoldenGatePage />;
}
