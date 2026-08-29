import {
  defaultLocale,
  getProduct,
  routePrefix,
  type LocaleId,
} from '@gitea-docs/content-loader';
import { getCollection } from 'astro:content';
import type { GiteaMeta } from '../schema';

const entries = await getCollection('docs');

/** Every route the site serves, used to keep the pickers from linking to a 404. */
const hrefs = new Set(
  entries.map((entry) => {
    const id = entry.id;
    if (id === 'index' || id === '') return '/';
    return `/${id.endsWith('/index') ? id.slice(0, -'/index'.length) : id}/`;
  }),
);

export function exists(href: string): boolean {
  return hrefs.has(href);
}

/**
 * Same page in another version or language. Falls back to the root of the
 * target when the page does not exist there, which happens for a version that
 * did not document the feature yet or for a page a translation has moved.
 */
export function switchHref(
  pathname: string,
  meta: GiteaMeta,
  target: { version?: string; locale?: LocaleId },
): string {
  const product = getProduct(meta.product);
  const version = product.versions.find(
    (candidate) => candidate.id === (target.version ?? meta.version),
  );
  if (!version) return '/';

  const locale = target.locale ?? (meta.locale as LocaleId);
  const prefix = routePrefix(product, version, locale);
  const root = prefix ? `/${prefix}/` : '/';

  const current = meta.prefix ? `/${meta.prefix}/` : '/';
  if (!pathname.startsWith(current)) return root;
  const rest = pathname.slice(current.length);
  const href = `${root}${rest}`;
  return exists(href) ? href : root;
}

export { defaultLocale };
