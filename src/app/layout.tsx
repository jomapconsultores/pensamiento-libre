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

export const metadata: Metadata = {
  title: 'Fundación Pensamiento Libre — Desarrollo personal integral',
  description:
    'Fundación Pensamiento Libre impulsa el desarrollo personal integral a través de salud mental, educación consciente y crecimiento humano. Súmate como voluntario, miembro o donante.',
  keywords: [
    'fundación',
    'pensamiento libre',
    'desarrollo personal',
    'salud mental',
    'educación',
    'voluntariado',
    'donaciones',
  ],
  openGraph: {
    title: 'Fundación Pensamiento Libre',
    description: 'Libera tu mente, transforma tu vida.',
    images: ['/logo.png'],
    locale: 'es_ES',
    type: 'website',
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
