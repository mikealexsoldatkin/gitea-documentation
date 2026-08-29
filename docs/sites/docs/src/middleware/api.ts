import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { getProduct } from '@gitea-docs/content-loader';

/**
 * Adjusts the pages starlight-openapi generates.
 *
 * The plugin replaces a placeholder group in the sidebar with one group per
 * schema, so an api page would list all seven documented versions. Keep the one
 * of the version being read and lift its entries to the top level: the version
 * is already picked with the version selector. It also titles both the schema
 * overview and every tag page "Overview", which makes the browser tab, the
 * breadcrumbs and the search results ambiguous.
 *
 * This runs after the plugin, which registers its own middleware with
 * `order: 'post'`; `src/routeData.ts` runs before it and must not touch the
 * placeholder, or there would be nothing left for the plugin to replace.
 */
export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute;
  const meta = route.entry.data.gitea;
  if (!meta || meta.product !== 'api') return;

  const version = getProduct('api').versions.find((candidate) => candidate.id === meta.version);
  if (!version) return;

  const group = route.sidebar.find(
    (entry) => entry.type === 'group' && entry.label === `API ${version.label}`,
  );
  if (group && group.type === 'group') route.sidebar = group.entries;

  const tag = route.id.match(/\/operations\/tags\/([^/]+)$/)?.[1];
  const title = tag
    ? tag.charAt(0).toUpperCase() + tag.slice(1)
    : route.id.includes('/operations/')
      ? undefined
      : `Gitea API ${version.label}`;

  if (title) {
    const previous = route.entry.data.title;
    route.entry.data.title = title;
    // the head tags are built before the route middleware runs, so the document
    // title has to be replaced as well
    for (const entry of route.head) {
      if (entry.tag === 'title' && entry.content?.startsWith(previous)) {
        entry.content = entry.content.replace(previous, title);
      }
    }
  }
});
