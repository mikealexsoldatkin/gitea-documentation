import { readdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { defaultLocale, locales, products, type LocaleId } from '@gitea-docs/content-loader';

/**
 * Two things the generators cannot get right on their own:
 *
 * - starlight-openapi slugifies the base path of a schema, so `/api/1.26/` is
 *   generated as `/api/126/`. The directories are renamed and the links inside
 *   the build are rewritten.
 * - starlight builds a fallback page in every configured language for every
 *   english page. That is what we want for the docs, but the runner and the api
 *   are separate products with their own language list, so `/zh-cn/runner/` has
 *   to go; `cloudflare/_redirects` sends it to the english page.
 */
export function giteaPostBuild(): AstroIntegration {
  return {
    name: 'gitea-post-build',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const dist = fileURLToPath(dir);
        const renames = await renameApiVersions(dist);
        if (renames.length > 0) {
          await rewriteLinks(dist, renames);
          logger.info(
            `renamed the api version directories: ${renames
              .map(([from, to]) => `${from} -> ${to}`)
              .join(', ')}`,
          );
        }

        const pruned = await pruneForeignLocales(dist);
        if (pruned.length > 0) logger.info(`removed the fallback pages of ${pruned.join(', ')}`);
      },
    },
  };
}

/** Same slugification github-slugger applies to a starlight-openapi base path. */
function slugify(segment: string): string {
  return segment.toLowerCase().replace(/[^\w-]/g, '');
}

/** `/api/126/` back to `/api/1.26/`, as the version picker and the old urls expect. */
async function renameApiVersions(dist: string): Promise<[string, string][]> {
  const api = products.find((product) => product.id === 'api');
  if (!api) return [];

  const renames: [string, string][] = [];
  for (const version of api.versions) {
    if (!version.path || slugify(version.path) === version.path) continue;
    try {
      await rename(
        path.join(dist, api.base, slugify(version.path)),
        path.join(dist, api.base, version.path),
      );
      renames.push([slugify(version.path), version.path]);
    } catch {
      // the version was not part of this build
    }
  }
  return renames;
}

async function rewriteLinks(dist: string, renames: [string, string][]): Promise<void> {
  const api = products.find((product) => product.id === 'api')!;
  const replacements = renames.map(
    ([from, to]) => [`/${api.base}/${from}/`, `/${api.base}/${to}/`] as const,
  );

  for await (const file of walk(dist)) {
    if (!/\.(html|xml|js|json)$/.test(file)) continue;
    const contents = await readFile(file, 'utf-8');
    let updated = contents;
    for (const [from, to] of replacements) updated = updated.replaceAll(from, to);
    if (updated !== contents) await writeFile(file, updated);
  }
}

/** Drops the language directories of the products not published in them. */
async function pruneForeignLocales(dist: string): Promise<string[]> {
  const removed: string[] = [];
  for (const product of products) {
    if (!product.base || product.externalBaseUrl) continue;
    for (const locale of Object.keys(locales) as LocaleId[]) {
      if (locale === defaultLocale || product.locales.includes(locale)) continue;
      try {
        await rm(path.join(dist, locale, product.base), { recursive: true });
        removed.push(`/${locale}/${product.base}/`);
      } catch {
        // nothing was built there
      }
    }
  }
  return removed;
}

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}
