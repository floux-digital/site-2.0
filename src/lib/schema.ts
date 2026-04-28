export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Floux',
    url: 'https://flouxdigital.com.br',
    logo: 'https://flouxdigital.com.br/floux-by-jeff-bk.svg',
    description:
      'Consultoria de design e tecnologia para negócios. Criamos experiências que entregam valor para seus clientes e crescimento para o seu negócio.',
    foundingDate: '2003',
    founders: [{ '@type': 'Person', name: 'Jeff Monteiro' }],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'São Paulo',
      addressRegion: 'SP',
      addressCountry: 'BR',
    },
    sameAs: ['https://www.linkedin.com/company/floux'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Portuguese',
    },
    serviceType: [
      'Design de Produto',
      'UX Research',
      'Service Design',
      'Design Outsourcing',
      'Design Consulting',
    ],
  }
}

export function webSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Floux',
    url: 'https://flouxdigital.com.br',
    description: 'Consultoria de design e tecnologia para negócios.',
    inLanguage: 'pt-BR',
  }
}

export function webPageSchema(params: {
  title: string
  description: string
  url: string
  breadcrumbs?: { name: string; url: string }[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: params.title,
    description: params.description,
    url: params.url,
    inLanguage: 'pt-BR',
    breadcrumb: params.breadcrumbs
      ? {
          '@type': 'BreadcrumbList',
          itemListElement: params.breadcrumbs.map((b, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: b.name,
            item: b.url,
          })),
        }
      : undefined,
  }
}

export function serviceSchema(params: {
  name: string
  description: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: params.name,
    description: params.description,
    url: params.url,
    provider: {
      '@type': 'Organization',
      name: 'Floux',
      url: 'https://flouxdigital.com.br',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Brazil',
    },
    serviceType: 'Design Consulting',
  }
}

export function articleSchema(params: {
  title: string
  description: string
  url: string
  datePublished?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.title,
    description: params.description,
    url: params.url,
    datePublished: params.datePublished,
    publisher: {
      '@type': 'Organization',
      name: 'Floux',
      logo: {
        '@type': 'ImageObject',
        url: 'https://flouxdigital.com.br/floux-by-jeff-bk.svg',
      },
    },
    inLanguage: 'pt-BR',
  }
}
