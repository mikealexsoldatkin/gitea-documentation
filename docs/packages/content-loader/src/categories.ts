import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Segment } from './segments.js';

/** `_category_.json`, the docusaurus per directory sidebar metadata. */
export interface CategoryMeta {
  label?: string;
  position?: number;
  collapsed?: boolean;
  link?: {
    type?: string;
    slug?: string;
    title?: string;
    description?: string;
  };
}

export const categoryFile = '_category_.json';

export async function readCategoryMeta(dir: string): Promise<CategoryMeta | undefined> {
  try {
    return JSON.parse(await fs.readFile(path.join(dir, categoryFile), 'utf-8')) as CategoryMeta;
  } catch {
    return undefined;
  }
}

/** Fallback label for a directory without `_category_.json`. */
export function labelFromDirname(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function slugifyLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Route id of the index page docusaurus generates for a category.
 *
 * Top level categories are declared by `sidebars.js` without a slug and end up
 * under `/category/<label>`; nested ones keep the slug of their
 * `_category_.json`. Both are reproduced so the existing urls keep working.
 */
export function categoryRouteId(
  segment: Segment,
  relativeDir: string,
  /** Metadata of the default language, translations do not move a category. */
  meta: CategoryMeta | undefined,
): string | undefined {
  const isTopLevel = !relativeDir.includes('/');
  const label = meta?.label ?? labelFromDirname(relativeDir.split('/').at(-1) ?? relativeDir);
  if (isTopLevel) {
    return [segment.prefix, 'category', slugifyLabel(label)].filter(Boolean).join('/');
  }
  if (meta?.link?.type !== 'generated-index') return undefined;
  const slug = (meta.link.slug ?? `/${relativeDir}`).replace(/^\/+|\/+$/g, '');
  return [segment.prefix, slug].filter(Boolean).join('/');
}
