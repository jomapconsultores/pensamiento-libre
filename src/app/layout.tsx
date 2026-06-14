import type { Metadata } from 'next';
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
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
