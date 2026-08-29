# Astro + Starlight site

Renders the gitea documentation with [Starlight](https://starlight.astro.build):
the docs (6 versions x 3 languages), the runner docs (4 series) and the api
reference (7 swagger documents). The enterprise docs stay in their own
deployment and are linked from the header.

The content directories are the ones the site has always used — `docs/`,
`versioned_docs/`, `i18n/`, `runner-docs/`, `runner-docs_versioned_docs/` and
`static/swagger-*.json` (plus `static/openapi3-*.json` since gitea 1.27) — so
the release scripts and the translation workflow stay unchanged.

## Running it

Everything is driven from the repository root, see the `README.md` there:

```shell
make serve-fast    # english, the version served at the root, starts in seconds
make serve         # whole matrix, api included
make serve-built   # build and serve it, the only way to try the search locally
make build
make check
```

`GITEA_DOCS_PRODUCTS`, `GITEA_DOCS_VERSIONS` and `GITEA_DOCS_LOCALES` (comma
separated) restrict the matrix, which is what `make serve-fast` uses.

## How it is put together

`packages/content-loader` holds the product matrix and the astro content loader.
`src/products.ts` is the single source of truth for product x version x language
and drives everything else: content loading, sidebars, the version and language
pickers, the version banner, the search facets and the api schemas.

| Source | Route |
| --- | --- |
| `versioned_docs/version-1.27/` | `/` |
| `docs/` | `/next/` |
| `versioned_docs/version-1.26/` | `/1.26/` |
| `i18n/zh-cn/docusaurus-plugin-content-docs/version-1.27/` | `/zh-cn/` |
| `runner-docs_versioned_docs/version-3/` | `/runner/` |
| `runner-docs/` | `/runner/develop/` |
| `static/openapi3-27.json` | `/api/` |
| `static/openapi3-latest.json` | `/api/next/` |
| `static/swagger-26.json` | `/api/1.26/` |

The loader reads the markdown in two passes. The first one works out the route
of every file, the second normalizes and renders it:

- substitutes the version variables (`@version@`, `@dockerVersion@`, ...)
- lifts the leading `# heading` into the starlight `title`
- maps `sidebar_position` to `sidebar.order` and honours the docusaurus `slug`,
  including the translations that moved a page
- rewrites the relative `*.md` links to urls, resolving them against the file
  and against the version root, and reports the ones that do not resolve
- turns the docusaurus admonitions into starlight asides (`:::warning` to
  `:::caution`, `:::info` to `:::note`, `:::note Title` to `:::note[Title]`)
- recreates the index pages of `_category_.json` (`/category/installation/`,
  `/usage/actions/`)

Sidebars are built per (product, version, language) from `_category_.json` and
from the docusaurus sidebar files (`sidebars.js`, `versioned_sidebars/`,
`runner-sidebars.js`, `runner-docs_versioned_sidebars/`), and selected in
`src/routeData.ts`, since starlight only supports a single static sidebar.

Set `GITEA_DOCS_STRICT_LINKS=true` to fail the build on a broken internal link
instead of warning.

## Products and languages

The docs are the site itself, so their language comes first: `/zh-cn/1.26/`.
The runner and the api are separate products and keep their language inside the
product, `/runner/zh-cn/3/`, which is reserved: both are published in english
only today. Starlight builds a fallback page in every configured language for
every english page, so `/zh-cn/runner/` would exist; the post build integration
removes those directories and `cloudflare/_redirects` sends them to the
english page.

The version served at the root of a product has no number in its url: docs 1.27
is `/`, runner 3 is `/runner/` and api 1.27 is `/api/`. `/1.27/`, `/runner/3/`
and `/api/1.27/` are redirected onto them in `cloudflare/_redirects`.

## Api reference

`starlight-openapi` generates a page per operation from the documents
`update_api_docs.sh` maintains: the openapi 3.0 document for the versions that
have one (gitea >= 1.27), the swagger 2.0 one for the older versions. Both
describe the same api and use the same operation ids, so the urls of the
operation pages do not depend on which one is rendered. Three adjustments
happen at build time:

- the swagger 2.0 documents set `basePath` to the full
  `https://gitea.com/api/v1` url, which redoc accepted but is not valid swagger
  2.0. A normalized copy is written to `.cache/openapi/` instead of touching the
  sources. The openapi 3.0 documents keep that url in `servers`, where it is
  valid, and only get the operation ids and the tag descriptions adjusted.
- both documents of a version are linked for download from its overview page,
  see `specDownloads()` in `src/config/api.ts` and
  `src/components/ApiOverviewTags.astro`.
- the plugin slugifies the base path, so `/api/1.26/` is generated as
  `/api/126/`. `src/integrations/postbuild.ts` renames the directories and
  rewrites the links once the build is done.

## Search

Algolia docsearch, enabled when `PUBLIC_DOCSEARCH_APP_ID` and
`PUBLIC_DOCSEARCH_API_KEY` are set, pagefind otherwise, so a fork without
credentials still gets search. Every page carries `docsearch:product`,
`docsearch:version` and `docsearch:language` meta tags; the crawler turns them
into facets and `src/config/docsearch.ts` filters the search on the product,
version and language being read. `cloudflare/docsearch-crawler.json` holds the
crawler configuration and only indexes the versions people read.

Pagefind builds one index for the whole site, so the same scope has to be
applied on its side as well, otherwise a search started in the 1.23 docs answers
with the pages of the latest release:

- `src/components/MarkdownContent.astro` wraps the content in the
  `data-pagefind-filter` elements that put `product` and `version` into the
  index. One filter per element, pagefind reads the whole attribute as a single
  `name:value` pair.
- the same scope is written to the `gitea:search-filters` meta tag by
  `src/lib/search.ts`.
- starlight builds the search ui with a build time configuration and has no
  option for per page filters, so its `@pagefind/default-ui` import is
  redirected to the subclass in `src/lib/pagefind-ui.ts` by the
  `gitea-pagefind-filters` plugin in `astro.config.mjs`. It selects the filters
  of the page the modal was opened on and adds the "Search all versions"
  checkbox, which drops them again and labels the results with their version.
  A starlight upgrade that moves the import fails the build, the
  `gitea-pagefind-filters-check` integration verifies that the redirect ran.

## Deployment

`cloudflare/_headers` and `cloudflare/_redirects` are copied next to the build
output by the publish workflow. `/enterprise/*` is routed to the enterprise
pages project by a Cloudflare worker maintained outside this repository.

## Differences between `pnpm dev` and the deployed site

- `/api/1.26/` is served at `/api/126/`, the renaming happens after the build.
- `/zh-cn/runner/` still answers, the fallback pages are removed after the build.
- `/1.27/`, `/runner/3/` and `/api/1.27/` are cloudflare redirects, so they only
  work on the deployed site.
- search is built by pagefind at build time and only answers on the built site,
  unless the algolia docsearch credentials are set; `make serve-built` builds and
  serves it locally.
- a scoped run only builds part of the matrix, so the products and versions left
  out answer with the 404 page; `pnpm dev` serves everything.
