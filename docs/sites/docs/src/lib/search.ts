import { locales, type LocaleId } from '@gitea-docs/content-loader';
import type { GiteaMeta } from '../schema';
import { formatSearchFilters, searchFilterMetaName } from './search-filters';

/** Product and version of a page, the scope both search backends filter on. */
export function searchFilters(meta: GiteaMeta): Record<string, string> {
  return { product: meta.product, version: meta.version };
}

/**
 * Search facets of a page. The docsearch crawler turns the `docsearch:*` tags
 * into the `product`, `version` and `language` facets the search modal filters
 * on. `gitea:search-filters` is the same scope for the pagefind fallback, which
 * is what the published site currently uses. Either way a search stays inside
 * the product, version and language being read.
 */
export function searchMetaTags(meta: GiteaMeta): {
  tag: 'meta';
  attrs: { name: string; content: string };
}[] {
  return [
    { tag: 'meta', attrs: { name: 'docsearch:product', content: meta.product } },
    { tag: 'meta', attrs: { name: 'docsearch:version', content: meta.version } },
    {
      tag: 'meta',
      attrs: { name: 'docsearch:language', content: locales[meta.locale as LocaleId]?.lang ?? meta.locale },
    },
    {
      tag: 'meta',
      attrs: { name: searchFilterMetaName, content: formatSearchFilters(searchFilters(meta)) },
    },
  ];
}
