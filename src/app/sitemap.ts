import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const now = new Date();
  const routes: { path: string; priority: number; freq: MetadataRoute.Sitemap[0]['changeFrequency'] }[] = [
    { path: '/', priority: 1.0, freq: 'weekly' },
    { path: '/sobre-nosotros', priority: 0.8, freq: 'monthly' },
    { path: '/programas', priority: 0.9, freq: 'monthly' },
    { path: '/servicios', priority: 0.9, freq: 'monthly' },
    { path: '/membresias', priority: 0.9, freq: 'monthly' },
    { path: '/donar', priority: 0.9, freq: 'monthly' },
    { path: '/contacto', priority: 0.7, freq: 'monthly' },
    { path: '/politica-privacidad', priority: 0.3, freq: 'yearly' },
    { path: '/terminos', priority: 0.3, freq: 'yearly' },
  ];

  return routes.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));
}
