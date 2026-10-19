'use client';

// Next 15 no permite `ssr: false` en un Server Component: la carga diferida
// (solo en el navegador) vive aquí, en un componente de cliente.
import dynamic from 'next/dynamic';

export const CmajPageLazy = dynamic(
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
