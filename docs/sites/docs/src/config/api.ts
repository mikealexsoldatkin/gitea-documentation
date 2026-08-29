import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { getProduct } from '@gitea-docs/content-loader';
import { apiTagDescriptions } from './apiTags';
import { repoRoot } from './paths';

const cacheDir = path.join(repoRoot, 'sites/docs/.cache/openapi');

/**
 * `listAdminWorkflowJobs` to `list-admin-workflow-jobs`. starlight-openapi
 * builds the url of an operation page by slugifying its operation id, and
 * slugifying a camel case identifier just drops the word boundaries, which
 * gives `/api/operations/listadminworkflowjobs/`. Acronyms are kept together,
 * so `getGPGKey` becomes `get-gpg-key` and `userGetOAuth2Application` becomes
 * `user-get-oauth2-application`.
 */
export function kebabCase(value: string): string {
  return value
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]{2,})([A-Z][a-z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

interface Operation {
  operationId?: string;
}

interface SwaggerDocument {
  openapi?: string;
  basePath?: string;
  host?: string;
  schemes?: string[];
  tags?: { name: string; description?: string }[];
  paths?: Record<string, Record<string, Operation | unknown>>;
}

const httpMethods = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch'];

/**
 * Hyphenates the operation ids of a document, which is what the urls of the
 * operation pages are built from.
 *
 * Gitea has operation ids that only differ in case, `userGetOauth2Application`
 * (the list) and `userGetOAuth2Application` (a single one). They already
 * collide today, since the plugin lowercases them, and one of the two pages
 * silently overwrites the other. A colliding id is suffixed with the last path
 * parameter, so the two become `user-get-oauth2-application` and
 * `user-get-oauth2-application-by-id`.
 */
function hyphenateOperationIds(document: SwaggerDocument): void {
  const used = new Set<string>();

  for (const [pathname, pathItem] of Object.entries(document.paths ?? {})) {
    for (const [method, value] of Object.entries(pathItem)) {
      if (!httpMethods.includes(method)) continue;
      const operation = value as Operation;
      if (!operation?.operationId) continue;

      const base = kebabCase(operation.operationId);
      let id = base;
      if (used.has(id)) {
        const parameter = [...pathname.matchAll(/\{([^}]+)\}/g)].at(-1)?.[1];
        if (parameter) id = `${base}-by-${kebabCase(parameter)}`;
        for (let suffix = 2; used.has(id); suffix += 1) id = `${base}-${suffix}`;
      }
      used.add(id);
      operation.operationId = id;
    }
  }
}

/**
 * `update_api_docs.sh` rewrites `basePath` of the swagger documents to the full
 * `https://gitea.com/api/v1` url, which redoc accepted but is not valid swagger
 * 2.0: the host belongs into `host` and the scheme into `schemes`. Normalize a
 * copy instead of touching the sources, which the docusaurus site still reads.
 *
 * The openapi 3.0 documents keep the url in `servers`, where a full url is
 * valid, so only the operation ids and the tags are touched for those.
 */
function normalizeSchema(source: string, name: string): string {
  const document = JSON.parse(readFileSync(source, 'utf-8')) as SwaggerDocument;

  if (document.basePath && /^https?:\/\//.test(document.basePath)) {
    const url = new URL(document.basePath);
    document.host = url.host;
    document.schemes = [url.protocol.replace(':', '')];
    document.basePath = url.pathname;
  }

  // the operation id is only used to build the url of the operation page, it is
  // not rendered anywhere, so hyphenating it only makes the urls readable
  hyphenateOperationIds(document);

  describeTags(document);

  mkdirSync(cacheDir, { recursive: true });
  const target = path.join(cacheDir, name);
  writeFileSync(target, JSON.stringify(document));
  return target;
}

/**
 * Gives every tag used by the document a description, so starlight-openapi
 * builds a landing page for it and the api overview can link to those instead
 * of listing every operation.
 */
function describeTags(document: SwaggerDocument): void {
  const used = new Set<string>();
  for (const pathItem of Object.values(document.paths ?? {})) {
    for (const value of Object.values(pathItem)) {
      for (const tag of (value as { tags?: string[] })?.tags ?? []) used.add(tag);
    }
  }

  const described = new Map(document.tags?.map((tag) => [tag.name, tag]) ?? []);
  for (const name of [...used].sort()) {
    const description = described.get(name)?.description ?? apiTagDescriptions[name];
    if (description) described.set(name, { name, description });
  }
  document.tags = [...described.values()];
}

/**
 * One starlight-openapi schema per documented api version, each mounted at the
 * route of its version: `/api/` for the latest release, `/api/1.26/` and
 * `/api/next/` for the others.
 */
export const apiSchemas = getProduct('api')
  .versions.filter((version) => version.schema)
  .map((version) => ({
    base: ['api', version.path].filter(Boolean).join('/'),
    label: `API ${version.label}`,
    // gitea generates an openapi 3.0 document since 1.27, render it where it
    // exists: it is the same api, described in the format the tooling expects
    schema: normalizeSchema(
      path.join(repoRoot, version.openapi3 ?? version.schema!),
      `${version.id}.json`,
    ),
    // the schema group is lifted to the top level of the sidebar in
    // src/middleware/api.ts, so the tag groups below it start collapsed and
    // starlight opens the one holding the current operation
    sidebar: {
      collapsed: true,
      label: `API ${version.label}`,
      // http method badges, coloured per method in src/styles/custom.css
      operations: { badges: true },
    },
  }));

export interface SpecDownload {
  label: string;
  href: string;
}

/**
 * The documents of a version, as they are served from `static/`. Shown on the
 * overview page of the version: the rendered reference is not something a code
 * generator can read, the documents are.
 */
export function specDownloads(versionId: string): SpecDownload[] {
  const version = getProduct('api').versions.find((candidate) => candidate.id === versionId);
  if (!version) return [];

  const downloads: SpecDownload[] = [];
  if (version.openapi3) downloads.push({ label: 'OpenAPI 3.0', href: staticHref(version.openapi3) });
  if (version.schema) downloads.push({ label: 'Swagger 2.0', href: staticHref(version.schema) });
  return downloads;
}

/** `static/openapi3-27.json` is published as `/openapi3-27.json`. */
function staticHref(file: string): string {
  return `/${file.replace(/^static\//, '')}`;
}
