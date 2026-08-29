import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { Loader, LoaderContext } from 'astro/loaders';
import { glob as tinyglob } from 'tinyglobby';
import {
  categoryRouteId,
  labelFromDirname,
  readCategoryMeta,
  type CategoryMeta,
} from './categories.js';
import { internalLinks, rewriteLinks } from './links.js';
import {
  applyVariables,
  extractTitle,
  normalizeAdmonitions,
  splitFrontmatter,
} from './markdown.js';
import {
  defaultLocale,
  resolveSegments,
  routeIdOf,
  routeIdToPath,
  routeSuffix,
  scopeFromEnv,
  segmentOf,
  type ScopeFilter,
  type Segment,
} from './segments.js';

export * from './categories.js';
export * from './links.js';
export * from './markdown.js';
export * from './products.js';
export * from './segments.js';
export * from './sidebar.js';

export interface GiteaDocsLoaderOptions {
  /** Repository root, the directory holding `docs/`, `versioned_docs/`, ... */
  root: string | URL;
  /** Restricts the loaded matrix, defaults to the environment scope. */
  scope?: ScopeFilter;
  /** Fails the build on a broken internal link instead of warning. */
  strictLinks?: boolean;
}

/** A page read from disk, before it is rendered. */
interface ParsedPage {
  segment: Segment;
  /** Path of the source file, relative to the repository root. */
  file: string;
  /** Path of the source file, relative to the version directory. */
  relative: string;
  /** Directory of the source file, relative to the version directory. */
  dir: string;
  id: string;
  title: string;
  order?: number;
  description?: string;
  tableOfContents: boolean;
  sidebarLabel?: string;
  body: string;
  digest: string;
}

const extensions = ['md', 'mdx'];
const concurrency = 8;
/** Path starlight expects the docs collection to live at. */
const collectionRoot = 'src/content/docs';
const sourceRepo = 'https://gitea.com/gitea/docs/src/branch/main';
const awesomeRepo = 'https://gitea.com/gitea/awesome-gitea/src/branch/main/README.md';
/** Bumped when a content transform changes, so cached entries are rebuilt. */
const transformVersion = '2';

/**
 * Loads the gitea documentation straight out of the content directories, which
 * keep the layout the docusaurus site used, instead of copying them into
 * `src/content/docs`. Every source file is mapped to its final route by the
 * product matrix, so the release and translation workflows are untouched.
 */
export function giteaDocsLoader(options: GiteaDocsLoaderOptions): Loader {
  const root = typeof options.root === 'string' ? options.root : fileURLToPath(options.root);
  const segments = resolveSegments(options.scope ?? scopeFromEnv());
  const strictLinks = options.strictLinks ?? process.env.GITEA_DOCS_STRICT_LINKS === 'true';
  // a scoped build does not know the routes of the parts it left out, so links
  // between products are only checked when everything is loaded
  const checkKnownLinks = segments.length === resolveSegments().length;

  return {
    name: 'gitea-docs-loader',
    async load(context) {
      const { logger, store, watcher } = context;
      if (segments.length === 0) logger.warn('no content segment matched the current scope');

      const started = Date.now();
      const untouched = new Set(store.keys());

      const patterns = segments.map(
        (segment) => `${segment.dir}/**/[^_]*.{${extensions.join(',')}}`,
      );
      const files = (await tinyglob(patterns, { cwd: root, dot: false })).sort();

      // first pass: read every file, so links can be resolved to routes before
      // anything is rendered
      const parsed: ParsedPage[] = [];
      await forEach(files, async (file) => {
        const segment = segmentOf(segments, file);
        if (!segment) return;
        const page = await parseFile(context, root, segment, file);
        if (page) parsed.push(page);
      });

      const routes = new Map<Segment, Map<string, string>>();
      const known = new Set<string>();
      for (const page of parsed) {
        let group = routes.get(page.segment);
        if (!group) routes.set(page.segment, (group = new Map()));
        group.set(page.relative, routeIdToPath(page.id));
        known.add(routeIdToPath(page.id));
      }

      const categories = await resolveCategories(root, segments, parsed);
      for (const category of categories) known.add(routeIdToPath(category.id));

      // second pass: normalize, resolve links and render
      let broken = 0;
      await forEach(parsed, async (page) => {
        broken += await renderPage(
          context,
          root,
          page,
          routes.get(page.segment)!,
          checkKnownLinks ? known : undefined,
        );
        untouched.delete(page.id);
      });

      for (const category of categories) {
        await renderCategory(context, category);
        untouched.delete(category.id);
      }

      for (const id of untouched) store.delete(id);

      const message = `loaded ${store.keys().length} pages from ${
        segments.length
      } content directories in ${Date.now() - started}ms`;
      if (broken === 0) logger.info(message);
      else if (strictLinks) throw new Error(`${broken} broken internal links found`);
      else logger.warn(`${message}, ${broken} broken internal links`);

      if (!watcher) return;
      // dev: a change reloads everything, the second pass needs the route table
      for (const segment of segments) watcher.add(path.join(root, segment.dir));
      const reload = async (changed: string) => {
        const file = path.relative(root, changed).split(path.sep).join('/');
        if (!/\.mdx?$/.test(file) || !segmentOf(segments, file)) return;
        await this.load(context);
      };
      watcher.on('change', reload);
      watcher.on('add', reload);
      watcher.on('unlink', reload);
    },
  };
}

/** Runs `task` over `items` with a bounded number of concurrent tasks. */
async function forEach<T>(items: T[], task: (item: T) => Promise<void>): Promise<void> {
  let index = 0;
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (index < items.length) await task(items[index++]!);
    }),
  );
}

/** Reads a source file and works out where it is served. */
async function parseFile(
  context: LoaderContext,
  root: string,
  segment: Segment,
  file: string,
): Promise<ParsedPage | undefined> {
  const { generateDigest, logger } = context;
  const contents = await fs.readFile(path.join(root, file), 'utf-8').catch((error: Error) => {
    logger.error(`error reading ${file}: ${error.message}`);
    return undefined;
  });
  if (contents === undefined) return undefined;

  const substituted = applyVariables(contents, segment.version.variables);
  const { frontmatter, body: rawBody } = splitFrontmatter(substituted);
  // a translated `slug` moves the page, exactly like it did under docusaurus
  const id = routeIdOf(segment, routeSuffix(segment, file, asString(frontmatter.slug)));
  const { title: headingTitle, body } = extractTitle(rawBody);
  const title = asString(frontmatter.title) ?? headingTitle;
  if (!title) logger.warn(`no title found for ${file}`);

  const relative = file.slice(segment.dir.length + 1);
  const dir = path.posix.dirname(relative);

  return {
    segment,
    file,
    relative,
    dir: dir === '.' ? '' : dir,
    id,
    title: title ?? relative.replace(/\.mdx?$/, ''),
    order: typeof frontmatter.sidebar_position === 'number' ? frontmatter.sidebar_position : undefined,
    description: asString(frontmatter.description),
    tableOfContents: frontmatter.toc !== false,
    sidebarLabel: asString(frontmatter.sidebar_label),
    body,
    digest: generateDigest(`${transformVersion}\u0000${substituted}`),
  };
}

/** Normalizes, resolves the links of and renders a page. Returns broken links. */
async function renderPage(
  context: LoaderContext,
  root: string,
  page: ParsedPage,
  routes: Map<string, string>,
  known: Set<string> | undefined,
): Promise<number> {
  const { logger, parseData, renderMarkdown, store } = context;
  const { segment } = page;

  let broken = 0;
  const report = (target: string) => {
    broken += 1;
    logger.warn(`broken link to ${target} in ${page.file}`);
  };

  let body = normalizeAdmonitions(page.body);
  body = rewriteLinks(body, {
    dir: page.dir,
    resolve: (source) => routes.get(source),
    onBroken: report,
  });

  if (known) {
    for (const target of internalLinks(body)) {
      const [pathname] = target.split('#');
      if (pathname && !known.has(pathname) && !known.has(`${pathname}/`)) report(target);
    }
  }

  const digest = context.generateDigest(`${page.digest}\u0000${broken}`);
  if (store.get(page.id)?.digest === digest) return broken;

  // starlight resolves locale fallbacks through the path of the entry inside
  // `src/content/docs`, which the sources do not have. Give every entry a
  // synthetic one matching its route and point the edit link at the real file.
  const filePath = `${collectionRoot}/${page.id}.md`;
  const data = await parseData({
    id: page.id,
    filePath,
    data: {
      title: page.title,
      editUrl: editUrlOf(page.file),
      ...(page.description ? { description: page.description } : {}),
      ...(page.tableOfContents ? {} : { tableOfContents: false }),
      gitea: {
        product: segment.product.id,
        version: segment.version.id,
        locale: segment.locale,
        prefix: segment.prefix,
        dir: page.dir,
        name: path.posix.basename(page.relative).replace(/\.mdx?$/, ''),
        ...(page.order === undefined ? {} : { order: page.order }),
      },
      sidebar: {
        ...(page.order === undefined ? {} : { order: page.order }),
        ...(page.sidebarLabel ? { label: page.sidebarLabel } : {}),
      },
    },
  });

  const rendered = await renderMarkdown(body, {
    fileURL: pathToFileURL(path.join(root, page.file)),
  });
  store.set({ id: page.id, data, body, filePath, digest, rendered });
  return broken;
}

/** The index page docusaurus generated for a category. */
interface ParsedCategory {
  segment: Segment;
  id: string;
  dir: string;
  title: string;
  description?: string;
  order?: number;
  body: string;
}

/**
 * Recreates the index pages docusaurus generated from `_category_.json`, so
 * that `/category/installation/` and `/usage/actions/` keep resolving.
 */
async function resolveCategories(
  root: string,
  segments: Segment[],
  pages: ParsedPage[],
): Promise<ParsedCategory[]> {
  const categories: ParsedCategory[] = [];

  for (const segment of segments) {
    if (!segment.product.categoryPages) continue;
    const segmentPages = pages.filter((page) => page.segment === segment);

    const directories = new Set<string>();
    for (const page of segmentPages) {
      const parts = page.dir ? page.dir.split('/') : [];
      for (let depth = 1; depth <= parts.length; depth += 1) {
        directories.add(parts.slice(0, depth).join('/'));
      }
    }

    // labels come from the language of the segment, routes from the english tree
    const metas = new Map<string, CategoryMeta | undefined>();
    const routeMetas = new Map<string, CategoryMeta | undefined>();
    const englishDir = segment.version.sources[defaultLocale] ?? segment.dir;
    await Promise.all(
      [...directories].map(async (dir) => {
        metas.set(dir, await readCategoryMeta(path.join(root, segment.dir, dir)));
        routeMetas.set(
          dir,
          segment.locale === defaultLocale
            ? metas.get(dir)
            : await readCategoryMeta(path.join(root, englishDir, dir)),
        );
      }),
    );

    const label = (dir: string) =>
      metas.get(dir)?.label ?? labelFromDirname(dir.split('/').at(-1) ?? dir);

    for (const dir of [...directories].sort()) {
      const meta = metas.get(dir);
      const id = categoryRouteId(segment, dir, routeMetas.get(dir));
      if (!id) continue;

      const childDirs = [...directories]
        .filter((candidate) => path.posix.dirname(candidate) === dir)
        .sort((a, b) => (metas.get(a)?.position ?? 0) - (metas.get(b)?.position ?? 0));
      const childPages = segmentPages
        .filter((page) => page.dir === dir)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      const links: string[] = [];
      for (const child of childDirs) {
        const childId = categoryRouteId(segment, child, routeMetas.get(child));
        if (childId) links.push(`- [${label(child)}](${routeIdToPath(childId)})`);
      }
      for (const page of childPages) links.push(`- [${page.title}](${routeIdToPath(page.id)})`);

      const description = meta?.link?.description;
      categories.push({
        segment,
        id,
        dir,
        title: meta?.link?.title ?? label(dir),
        description,
        order: meta?.position,
        body: [description, links.join('\n')].filter(Boolean).join('\n\n'),
      });
    }
  }

  return categories;
}

async function renderCategory(context: LoaderContext, category: ParsedCategory): Promise<void> {
  const { generateDigest, parseData, renderMarkdown, store } = context;
  const digest = generateDigest(`${transformVersion}\u0000${category.title}\u0000${category.body}`);
  if (store.get(category.id)?.digest === digest) return;

  const filePath = `${collectionRoot}/${category.id}.md`;
  const data = await parseData({
    id: category.id,
    filePath,
    data: {
      title: category.title,
      ...(category.description ? { description: category.description } : {}),
      editUrl: false,
      gitea: {
        product: category.segment.product.id,
        version: category.segment.version.id,
        locale: category.segment.locale,
        prefix: category.segment.prefix,
        dir: path.posix.dirname(category.dir) === '.' ? '' : path.posix.dirname(category.dir),
        name: category.dir.split('/').at(-1)!,
        category: true,
        ...(category.order === undefined ? {} : { order: category.order }),
      },
      sidebar: { hidden: true },
    },
  });

  store.set({
    id: category.id,
    data,
    body: category.body,
    filePath,
    digest,
    rendered: await renderMarkdown(category.body),
  });
}

/** Edit link of a source file, relative to the repository root. */
function editUrlOf(file: string): string {
  return file.endsWith('/awesome.md') ? awesomeRepo : `${sourceRepo}/${file}`;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}
