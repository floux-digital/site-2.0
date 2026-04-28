import type { MetadataRoute } from 'next'
import { cases, services } from '@/lib/data'

const BASE = 'https://flouxdigital.com.br'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/sobre`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/servicos`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/cases`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ]

  const caseRoutes: MetadataRoute.Sitemap = cases.map((c) => ({
    url: `${BASE}/cases/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const serviceRoutes: MetadataRoute.Sitemap = services
    .flatMap((s) => s.subservices)
    .map((sub) => ({
      url: `${BASE}/servicos/${sub.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }))

  return [...staticRoutes, ...caseRoutes, ...serviceRoutes]
}
