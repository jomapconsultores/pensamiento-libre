/* ------------------------------------------------------------
 * Desarrollado por Marco Antonio Posligua San Martín
 * ------------------------------------------------------------ */
import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Fundación Pensamiento Libre — Desarrollo personal integral',
    template: '%s | Fundación Pensamiento Libre',
  },
  description:
    'Fundación Pensamiento Libre — persona jurídica sin fines de lucro con domicilio en Cuenca, Azuay, Ecuador (Resolución MINEDEC-CZ6-2025-01466-R). Promovemos el desarrollo humano integral en educación, salud mental, deporte y cultura. Súmate como voluntario, miembro o donante.',
  keywords: [
    'fundación',
    'pensamiento libre',
    'desarrollo personal',
    'salud mental',
    'educación',
    'voluntariado',
    'donaciones',
  ],
  authors: [{ name: 'Fundación Pensamiento Libre' }],
  openGraph: {
    title: 'Fundación Pensamiento Libre',
    description: 'Libera tu mente, transforma tu vida.',
    url: SITE_URL,
    siteName: 'Fundación Pensamiento Libre',
    images: [{ url: '/logo.png', width: 900, height: 900, alt: 'Logo Fundación Pensamiento Libre' }],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fundación Pensamiento Libre',
    description: 'Libera tu mente, transforma tu vida.',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/logo.png',
    // iOS recorta el icono a un cuadrado con esquinas redondeadas: se le
    // entrega uno ya cuadrado (180×180) en vez del logotipo original.
    apple: '/apple-touch-icon.png',
  },
  // Instalable desde el navegador del teléfono (Android e iPhone), sin tiendas.
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Pensamiento Libre',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  themeColor: '#12263f',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        {/* Registra el service worker: es lo que hace la web instalable y le da
            una pantalla propia sin conexión. Ver public/sw.js. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) {
              window.addEventListener('load', function () {
                navigator.serviceWorker.register('/sw.js').catch(function () {});
              });
            }`,
          }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        {/* WhatsApp floating button */}
        <a
          href="https://wa.me/593998227061"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Contactar por WhatsApp"
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg bg-[#25D366] hover:bg-[#1ebe5d] hover:scale-110 transition-all duration-200"
        >
          <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      </body>
    </html>
  );
}
