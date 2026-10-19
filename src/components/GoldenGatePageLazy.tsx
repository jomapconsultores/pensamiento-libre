'use client';

// Next 15 no permite `ssr: false` en un Server Component: la carga diferida
// (solo en el navegador) vive aquí, en un componente de cliente.
import dynamic from 'next/dynamic';

export const GoldenGatePageLazy = dynamic(
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
