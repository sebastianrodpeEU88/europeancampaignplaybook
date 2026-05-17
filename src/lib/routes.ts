export const routes = {
  home: () => '/',
  taxonomy: () => '/taxonomy',
  pillar: (slug: string) => `/taxonomy/${slug}`,
  topic: (slug: string) => `/topics/${slug}`,
  articles: () => '/articles',
  article: (slug: string) => `/articles/${slug}`,
  contributors: () => '/contributors',
  community: () => '/community',
  subscribe: () => '/subscribe',
  euCompliance: () => '/eu-compliance',
} as const;
