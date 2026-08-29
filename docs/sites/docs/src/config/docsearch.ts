import type { DocSearchClientOptions } from '@astrojs/starlight-docsearch';

/**
 * Algolia docsearch, scoped to what is being read. Every page carries the
 * `docsearch:product`, `docsearch:version` and `docsearch:language` meta tags
 * (see `src/lib/search.ts`), the crawler turns them into facets and the modal
 * filters on them, so searching the 1.26 chinese docs never returns a 1.22
 * english page.
 *
 * The credentials are the public, search only ones and are injected at build
 * time from `PUBLIC_DOCSEARCH_*`.
 */
function facet(name: string): string | undefined {
  return document.querySelector<HTMLMetaElement>(`meta[name="docsearch:${name}"]`)?.content;
}

export default {
  appId: import.meta.env.PUBLIC_DOCSEARCH_APP_ID,
  apiKey: import.meta.env.PUBLIC_DOCSEARCH_API_KEY,
  indexName: import.meta.env.PUBLIC_DOCSEARCH_INDEX_NAME ?? 'gitea',
  searchParameters: {
    facetFilters: [
      ...(facet('language') ? [`language:${facet('language')}`] : []),
      ...(facet('product') ? [`product:${facet('product')}`] : []),
      ...(facet('version') ? [`version:${facet('version')}`] : []),
    ],
  },
} satisfies DocSearchClientOptions;
