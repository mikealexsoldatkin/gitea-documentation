/**
 * Single source of truth for the product x version x language matrix.
 *
 * Everything else (content loading, sidebars, the version and language
 * pickers, search facets and the sitemap) is derived from this file, so
 * adding a version or a language is a one line change here.
 */

export type LocaleId = 'en-us' | 'zh-cn' | 'zh-tw';

export type ProductId = 'docs' | 'api' | 'runner' | 'enterprise';

/** Values substituted for `@name@` placeholders in the markdown sources. */
export interface VersionVariables {
  goVersion: string;
  minGoVersion: string;
  minNodeVersion: string;
  version: string;
  sourceVersion: string;
  sourceBranch: string;
  dockerVersion: string;
  displayVersion: string;
}

export interface VersionDef {
  /** Stable identifier, e.g. `1.27`, `next`, `3`, `develop`. */
  id: string;
  /** Label shown in the version picker. */
  label: string;
  /**
   * Route segment inserted after the product base. Empty for the version
   * served at the product root (docs 1.27 at `/`, runner 3 at `/runner/`).
   */
  path: string;
  /** Marks the version served at the product root. */
  latest?: boolean;
  /** Starlight banner shown on every page of the version. */
  banner?: 'unreleased' | 'unmaintained';
  /** Content directories, relative to the repository root, per language. */
  sources: Partial<Record<LocaleId, string>>;
  /**
   * Swagger 2.0 document, relative to the repository root (api product only).
   * Every documented gitea version ships one.
   */
  schema?: string;
  /**
   * OpenAPI 3.0 document, relative to the repository root (api product only).
   * Gitea generates it since 1.27; it is what gets rendered and what the code
   * generators that rejected the swagger 2.0 document can read.
   */
  openapi3?: string;
  variables?: VersionVariables;
}

export interface ProductDef {
  id: ProductId;
  label: string;
  /** Route segment shared by every version, empty for the docs product. */
  base: string;
  /** Languages the product is published in, in display order. */
  locales: LocaleId[];
  versions: VersionDef[];
  /** Recreate the docusaurus `_category_.json` index pages for the product. */
  categoryPages?: boolean;
  /** Set for products served by another deployment (enterprise). */
  externalBaseUrl?: string;
}

export const locales: Record<LocaleId, { label: string; lang: string }> = {
  'en-us': { label: 'English', lang: 'en-US' },
  'zh-cn': { label: '简体中文', lang: 'zh-CN' },
  'zh-tw': { label: '繁體中文', lang: 'zh-TW' },
};

export const defaultLocale: LocaleId = 'en-us';

const variables: Record<string, VersionVariables> = {
  next: {
    goVersion: '1.26',
    minGoVersion: '1.26',
    minNodeVersion: '22',
    version: 'main-nightly',
    sourceVersion: 'main',
    sourceBranch: 'main',
    dockerVersion: 'nightly',
    displayVersion: '1.28-dev',
  },
  '1.27': {
    goVersion: '1.26',
    minGoVersion: '1.26',
    minNodeVersion: '24',
    version: '1.27.2',
    sourceVersion: 'v1.27.2',
    sourceBranch: 'release/v1.27',
    dockerVersion: '1.27.2',
    displayVersion: '1.27.2',
  },
  '1.26': {
    goVersion: '1.26',
    minGoVersion: '1.26',
    minNodeVersion: '22',
    version: '1.26.4',
    sourceVersion: 'v1.26.4',
    sourceBranch: 'release/v1.26',
    dockerVersion: '1.26.4',
    displayVersion: '1.26.4',
  },
  '1.25': {
    goVersion: '1.25',
    minGoVersion: '1.25',
    minNodeVersion: '22',
    version: '1.25.5',
    sourceVersion: 'v1.25.0',
    sourceBranch: 'release/v1.25',
    dockerVersion: '1.25.5',
    displayVersion: '1.25.5',
  },
  '1.24': {
    goVersion: '1.24',
    minGoVersion: '1.24',
    minNodeVersion: '22',
    version: '1.24.7',
    sourceVersion: 'v1.24.0',
    sourceBranch: 'release/v1.24',
    dockerVersion: '1.24.7',
    displayVersion: '1.24.7',
  },
  '1.23': {
    goVersion: '1.23',
    minGoVersion: '1.22',
    minNodeVersion: '18',
    version: '1.23.8',
    sourceVersion: 'v1.23.8',
    sourceBranch: 'release/v1.23',
    dockerVersion: '1.23.8',
    displayVersion: '1.23.8',
  },
  '1.22': {
    goVersion: '1.22',
    minGoVersion: '1.22',
    minNodeVersion: '18',
    version: '1.22.6',
    sourceVersion: 'v1.22.6',
    sourceBranch: 'release/v1.22',
    dockerVersion: '1.22.6',
    displayVersion: '1.22.6',
  },
};

/** Localized content of the gitea docs, as laid out by the docusaurus tree. */
function docsSources(version: 'current' | string): VersionDef['sources'] {
  const dir = version === 'current' ? 'docs' : `versioned_docs/version-${version}`;
  const i18nDir = (locale: LocaleId) =>
    `i18n/${locale}/docusaurus-plugin-content-docs/${
      version === 'current' ? 'current' : `version-${version}`
    }`;
  return {
    'en-us': dir,
    'zh-cn': i18nDir('zh-cn'),
    'zh-tw': i18nDir('zh-tw'),
  };
}

const docsProduct: ProductDef = {
  id: 'docs',
  label: 'Docs',
  base: '',
  locales: ['en-us', 'zh-cn', 'zh-tw'],
  categoryPages: true,
  versions: [
    {
      id: 'next',
      label: variables.next.displayVersion,
      path: 'next',
      banner: 'unreleased',
      sources: docsSources('current'),
      variables: variables.next,
    },
    {
      id: '1.27',
      label: variables['1.27'].displayVersion,
      path: '',
      latest: true,
      sources: docsSources('1.27'),
      variables: variables['1.27'],
    },
    ...['1.26', '1.25', '1.24', '1.23', '1.22'].map(
      (id): VersionDef => ({
        id,
        label: variables[id]!.displayVersion,
        path: id,
        sources: docsSources(id),
        variables: variables[id],
      }),
    ),
  ],
};

/**
 * Runner docs: one directory per release series, english only for now.
 * The label is the newest release of the series, which is also the tag the
 * generated reference pages of that directory come from, so it has to be
 * bumped here when a new runner release is documented.
 */
const runnerSeries: { id: string; latestRelease: string }[] = [
  { id: '3', latestRelease: '3.3.0' },
  { id: '2', latestRelease: '2.3.0' },
  { id: '1', latestRelease: '1.0.8' },
  { id: '0', latestRelease: '0.6.1' },
];

const runnerProduct: ProductDef = {
  id: 'runner',
  label: 'Runner',
  base: 'runner',
  locales: ['en-us'],
  versions: [
    {
      id: 'develop',
      label: 'develop',
      path: 'develop',
      banner: 'unreleased',
      sources: { 'en-us': 'runner-docs' },
    },
    ...runnerSeries.map(
      ({ id, latestRelease }, index): VersionDef => ({
        id,
        label: latestRelease,
        path: index === 0 ? '' : id,
        latest: index === 0,
        sources: { 'en-us': `runner-docs_versioned_docs/version-${id}` },
      }),
    ),
  ],
};

/** API reference, rendered from the swagger documents by starlight-openapi. */
const apiProduct: ProductDef = {
  id: 'api',
  label: 'API',
  base: 'api',
  locales: ['en-us'],
  versions: [
    {
      id: 'next',
      label: variables.next.displayVersion,
      path: 'next',
      banner: 'unreleased',
      sources: {},
      schema: 'static/swagger-latest.json',
      openapi3: 'static/openapi3-latest.json',
    },
    {
      id: '1.27',
      label: variables['1.27'].displayVersion,
      path: '',
      latest: true,
      sources: {},
      schema: 'static/swagger-27.json',
      openapi3: 'static/openapi3-27.json',
    },
    ...['1.26', '1.25', '1.24', '1.23', '1.22'].map(
      (id): VersionDef => ({
        id,
        label: variables[id]!.displayVersion,
        path: id,
        sources: {},
        schema: `static/swagger-${id.split('.')[1]}.json`,
      }),
    ),
  ],
};

/** Served by a separate cloudflare pages project, linked from the header. */
const enterpriseProduct: ProductDef = {
  id: 'enterprise',
  label: 'Enterprise',
  base: 'enterprise',
  locales: ['en-us', 'zh-cn'],
  versions: [],
  externalBaseUrl: 'https://docs.gitea.com/enterprise',
};

export const products: ProductDef[] = [docsProduct, apiProduct, runnerProduct, enterpriseProduct];

export function getProduct(id: ProductId): ProductDef {
  const product = products.find((candidate) => candidate.id === id);
  if (!product) throw new Error(`unknown product: ${id}`);
  return product;
}

export function getVersion(productId: ProductId, versionId: string): VersionDef {
  const version = getProduct(productId).versions.find((candidate) => candidate.id === versionId);
  if (!version) throw new Error(`unknown version: ${productId}@${versionId}`);
  return version;
}

/**
 * Route prefix of a (product, version, locale) triple, without leading or
 * trailing slash: `""`, `next`, `1.26`, `zh-cn/next`, `runner/2`.
 *
 * The docs are the site itself and keep the language in front, as starlight
 * expects. The other products are self contained, so their language goes inside
 * the product: `/runner/zh-cn/3/`, not `/zh-cn/runner/3/`. Only english is
 * published for them today, the layout is reserved for when that changes.
 */
export function routePrefix(product: ProductDef, version: VersionDef, locale: LocaleId): string {
  const language = locale === defaultLocale ? '' : locale;
  return product.base
    ? [product.base, language, version.path].filter(Boolean).join('/')
    : [language, version.path].filter(Boolean).join('/');
}
