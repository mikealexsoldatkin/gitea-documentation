/**
 * The scope of a page for the local (pagefind) search: which product and which
 * version it belongs to. The value is written twice into every page:
 *
 * - as `data-pagefind-filter` inside the indexed body, so the filters end up in
 *   the pagefind index (see `src/components/MarkdownContent.astro`)
 * - as a meta tag, so the search modal can read the scope of the page it is
 *   opened on and filter the results down to it (see `src/lib/pagefind-ui.ts`)
 *
 * Without them the index is one flat list of every version and searching from
 * an old version answers with the pages of the latest one.
 *
 * This module is imported by the client, keep it free of server side imports.
 */

/** Name of the meta tag carrying the scope of the page. */
export const searchFilterMetaName = 'gitea:search-filters';

export type SearchFilters = Record<string, string>;

/** `{ product: 'docs', version: '1.27' }` -> `product:docs,version:1.27`. */
export function formatSearchFilters(filters: SearchFilters): string {
  return Object.entries(filters)
    .map(([name, value]) => `${name}:${value}`)
    .join(',');
}

/** Inverse of `formatSearchFilters`, for the client side. */
export function parseSearchFilters(value: string | null | undefined): SearchFilters {
  const filters: SearchFilters = {};
  for (const pair of (value ?? '').split(',')) {
    const index = pair.indexOf(':');
    if (index < 1) continue;
    const name = pair.slice(0, index).trim();
    const filterValue = pair.slice(index + 1).trim();
    if (name && filterValue) filters[name] = filterValue;
  }
  return filters;
}
