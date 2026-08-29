import { PagefindUI as PagefindDefaultUI } from '@pagefind/default-ui';
import { t } from '../config/strings';
import { parseSearchFilters, searchFilterMetaName, type SearchFilters } from './search-filters';

/**
 * Pagefind builds a single index for the whole site, so a search started in the
 * 1.23 docs answers with the pages of every other version as well, usually with
 * the latest release on top. The pages carry `product` and `version` filters
 * (see `src/components/MarkdownContent.astro`), this subclass selects the ones
 * of the page the modal was opened on and offers a checkbox to search all
 * versions instead, in which case the results are labelled with their version.
 *
 * Starlight creates the search ui itself and has no option for per page
 * filters, so its `@pagefind/default-ui` import is redirected here by the
 * `gitea-pagefind-filters` plugin in `astro.config.mjs`.
 */

type PagefindResult = {
  meta?: Record<string, string>;
  filters?: Record<string, string[]>;
};

type PagefindUIOptions = Record<string, unknown> & {
  element?: string | HTMLElement;
  processResult?: (result: PagefindResult) => void;
};

export class PagefindUI extends PagefindDefaultUI {
  constructor(options: PagefindUIOptions) {
    const filters = pageFilters();
    // shared with `processResult`, which pagefind calls for every result of
    // every search, long after the constructor has returned
    const state = { scoped: Object.keys(filters).length > 0 };
    const processResult = options.processResult;

    super({
      ...options,
      processResult: (result: PagefindResult) => {
        processResult?.(result);
        if (!state.scoped) labelResult(result);
      },
    });

    if (!state.scoped) return;
    this.triggerFilters(filters);

    const root = rootElement(options.element);
    if (!root) return;
    addScopeToggle(root, (allVersions) => {
      state.scoped = !allVersions;
      // the selected filters are a reactive prop of the pagefind ui, setting
      // them runs the current search again
      this.triggerFilters(allVersions ? {} : filters);
    });
  }
}

/** The scope of the page the search was opened on, written by `src/lib/search.ts`. */
function pageFilters(): SearchFilters {
  const meta = document.querySelector<HTMLMetaElement>(`meta[name="${searchFilterMetaName}"]`);
  return parseSearchFilters(meta?.content);
}

function rootElement(element: string | HTMLElement | undefined): HTMLElement | null {
  if (element instanceof HTMLElement) return element;
  return document.querySelector<HTMLElement>(element ?? '[data-pagefind-ui]');
}

function strings() {
  return t(document.documentElement.lang.toLowerCase());
}

/** `Search all versions`, below the search input. */
function addScopeToggle(root: HTMLElement, onChange: (allVersions: boolean) => void): void {
  const label = document.createElement('label');
  label.className = 'gitea-search-scope';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.addEventListener('change', () => onChange(checkbox.checked));

  const text = document.createElement('span');
  text.textContent = strings().searchAllVersions;

  label.append(checkbox, text);
  const form = root.querySelector('.pagefind-ui__form');
  if (form) form.insertAdjacentElement('afterend', label);
  else root.append(label);
}

/**
 * While all versions are searched the same page shows up once per version, so
 * the version (and the product, for the api and the runner) is appended to the
 * title of a result.
 */
function labelResult(result: PagefindResult): void {
  const version = result.filters?.version?.[0];
  const product = result.filters?.product?.[0];
  if (!version || !result.meta?.title) return;

  const products = strings().products;
  const label = product && product !== 'docs' ? `${products[product] ?? product} ${version}` : version;
  result.meta.title = `${result.meta.title} · ${label}`;
}
