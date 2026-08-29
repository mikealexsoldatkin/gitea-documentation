import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  buildSidebars,
  products,
  type DocusaurusSidebarItem,
  type SidebarEntry,
  type SidebarPage,
} from '@gitea-docs/content-loader';
import { getCollection } from 'astro:content';
import { repoRoot } from '../config/paths';

/**
 * Sidebar files of the docusaurus site: the top level order of the docs and the
 * handwritten sidebars of the runner, one per version. Read as is, so cutting a
 * version keeps needing no change here.
 */
function docusaurusSidebars(): Map<string, DocusaurusSidebarItem[]> {
  const sidebars = new Map<string, DocusaurusSidebarItem[]>();
  const require = createRequire(import.meta.url);

  const read = (file: string): Record<string, DocusaurusSidebarItem[]> | undefined => {
    const full = path.join(repoRoot, file);
    if (!existsSync(full)) return undefined;
    try {
      return file.endsWith('.json')
        ? (JSON.parse(readFileSync(full, 'utf-8')) as Record<string, DocusaurusSidebarItem[]>)
        : (require(full) as Record<string, DocusaurusSidebarItem[]>);
    } catch (error) {
      // an unreadable sidebar would silently fall back to the directory tree,
      // which reorders the whole navigation without any other sign
      throw new Error(`unable to read the sidebar ${file}: ${(error as Error).message}`);
    }
  };

  const files: Record<string, string> = {};
  for (const product of products) {
    for (const version of product.versions) {
      if (product.id === 'docs') {
        files[`docs@${version.id}`] =
          version.id === 'next'
            ? 'sidebars.js'
            : `versioned_sidebars/version-${version.id}-sidebars.json`;
      } else if (product.id === 'runner') {
        files[`runner@${version.id}`] =
          version.id === 'develop'
            ? 'runner-sidebars.js'
            : `runner-docs_versioned_sidebars/version-${version.id}-sidebars.json`;
      }
    }
  }

  for (const [key, file] of Object.entries(files)) {
    const config = read(file);
    const items = config && (config.docs ?? config.runner ?? Object.values(config)[0]);
    if (items) sidebars.set(key, items);
  }
  return sidebars;
}

const entries = await getCollection('docs');

const pages: SidebarPage[] = entries.flatMap((entry) => {
  const meta = entry.data.gitea;
  if (!meta) return [];
  const id = entry.id;
  const href =
    id === 'index' || id === ''
      ? '/'
      : `/${id.endsWith('/index') ? id.slice(0, -'/index'.length) : id}/`;
  return [{ id, href, title: entry.data.title, hidden: entry.data.sidebar.hidden, meta }];
});

/** Sidebars of every (product, version, language), keyed by their route prefix. */
export const sidebars: Map<string, SidebarEntry[]> = buildSidebars(pages, docusaurusSidebars());
