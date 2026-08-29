# Gitea Docs ![badge](https://gitea.com/gitea/docs/actions/workflows/build-and-publish.yaml/badge.svg)

The sources of [docs.gitea.com](https://docs.gitea.com), built with
[Astro](https://astro.build) and [Starlight](https://starlight.astro.build).

The site covers three products, all served from this repository:

| Product | Content | Versions | Languages |
| --- | --- | --- | --- |
| Docs | `docs/`, `versioned_docs/`, `i18n/` | next, 1.27 … 1.22 | English, 简体中文, 繁體中文 |
| API | `static/swagger-*.json`, `static/openapi3-*.json` | next, 1.27 … 1.22 | English |
| Runner | `runner-docs/`, `runner-docs_versioned_docs/` | develop, 3 … 0 | English |

The enterprise documentation is built and deployed from its own repository and
reached through `/enterprise/`, which a Cloudflare worker maintained elsewhere
routes to that deployment.

## Development

```shell
make install       # pnpm install
make serve-fast    # english, the version served at the root, starts in seconds
make serve         # the whole matrix, every version and language
make build         # production build into sites/docs/dist
make check         # type checks the site and its components
```

Search is built by Pagefind while the site is built, so it only answers on the
built site: use `make serve-built` to try it. With the Algolia credentials
(`PUBLIC_DOCSEARCH_APP_ID`, `PUBLIC_DOCSEARCH_API_KEY`) set, DocSearch is used
instead and works in `make serve` too.

`GITEA_DOCS_PRODUCTS`, `GITEA_DOCS_VERSIONS` and `GITEA_DOCS_LOCALES` (comma
separated) restrict what is built, which is what `make serve-fast` uses.
`GITEA_DOCS_STRICT_LINKS=true` turns the warnings about unresolved relative
markdown links into a build error.

`sites/docs/README.md` documents how the sources are mapped onto the site.

## Writing

Pages are plain markdown with the same frontmatter and admonitions as before:
frontmatter `slug`, `sidebar_position` and `sidebar_label` keep working, and so
do the `:::note` style admonitions and the `@version@` style release variables.
Relative `*.md` links are rewritten to urls while the site is built.

The order of the top level sidebar groups comes from `sidebars.js` (and
`versioned_sidebars/` for released versions), the label and order of every other
group from the `_category_.json` of its directory.

## Cutting a version

```shell
make cut-version PRODUCT=docs VERSION=1.28
make cut-version PRODUCT=runner VERSION=4
```

This freezes the current tree, its translations and its sidebar. The label of
the version, its release variables (`@version@`, `@dockerVersion@`, ...) and
which version is served at the root live in
`packages/content-loader/src/products.ts` and are edited by hand afterwards.
That file is the single source of truth for the product, version and language
matrix.

## API docs

The definitions rendered under `/api/` live in `static/`:
`swagger-latest.json` (gitea main) and `swagger-<minor>.json` (released
versions) hold the swagger 2.0 document every gitea version ships,
`openapi3-latest.json` and `openapi3-<minor>.json` the openapi 3.0 document
gitea generates since 1.27. The openapi 3.0 document is what gets rendered
where it exists, and both are offered for download on the overview page of the
version, since code generators cannot read the rendered pages (and several of
them reject swagger 2.0).

```shell
make update-api-docs         # refresh latest + every released version
make update-api-docs-latest  # refresh only the documents of gitea main
```

The documents of gitea main are refreshed automatically: the `update api spec
files` workflow runs every 12 hours and opens a pull request whenever gitea main
changed. Released versions are updated by hand when a new gitea version is
documented.

## Runner docs

| Version | Content | URL |
| --- | --- | --- |
| develop | `runner-docs/` | `/runner/develop/` |
| current series | `runner-docs_versioned_docs/version-3/` | `/runner/` |
| older series | `runner-docs_versioned_docs/version-2/` | `/runner/2/` |

A version directory covers a whole release series (`version-3` documents every
`3.x` release), so a patch release only needs a content update, not a new
folder. Use floating image tags (`gitea/runner:3`) and links to the runner's
`main` branch in those pages to keep them valid across patch releases.

Its sidebar is written by hand: `runner-sidebars.js` for develop, and
`runner-docs_versioned_sidebars/version-<version>-sidebars.json` per documented
version.

The pages under `reference/` are generated from the runner sources — the command
line reference from `--help`, the example configuration from `generate-config`:

```shell
make update-runner-docs           # develop docs, from the main branch of gitea/runner
make update-runner-docs-released  # every series, from its newest stable tag
./update_runner_docs.sh v3.0.2 runner-docs_versioned_docs/version-3/reference
```

These are refreshed automatically as well: the `update runner reference`
workflow runs weekly and opens a pull request whenever the runner's CLI or
example configuration changed. Generating them needs Go, since the script builds
the runner binary.

## Deployment

`main` is built and published by the `Build and Publish Docs site` workflow, to
S3/CloudFront and to Cloudflare Pages. `cloudflare/_headers` sets the cache
policy and `cloudflare/_redirects` keeps the urls the site used to serve; both
are copied next to the build output by that workflow.
`cloudflare/docsearch-crawler.json` is the Algolia crawler configuration.

`/enterprise/` is served by another deployment and routed to it by a Cloudflare
worker that lives outside this repository.
