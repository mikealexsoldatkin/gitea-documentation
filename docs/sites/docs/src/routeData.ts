import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { flattenSidebar, markCurrent, metaFromRouteId } from '@gitea-docs/content-loader';
import { sidebars } from './lib/sidebars';
import { searchMetaTags } from './lib/search';
import { versionBanner } from './lib/versions';

/**
 * Starlight has a single global sidebar, the gitea docs need one per product,
 * version and language. The sidebars are built from the loaded pages and the
 * matching one is selected here, together with the version banner and the
 * search facets of the page.
 */
export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute;
  // the 404 page belongs to no product: the docs are served from the root, so
  // resolving it by route would place it in the docs and show their version and
  // language pickers on a page that is not a documentation page
  if (route.id === '404') return;

  // pages built by starlight-openapi carry no loader metadata, they are placed
  // in the matrix by their route instead
  const routeMeta = metaFromRouteId(route.id);
  const meta =
    route.entry.data.gitea ?? (routeMeta && { ...routeMeta, dir: '', name: '' });
  if (!meta) return;
  // components read the metadata off the entry, so make the resolved one visible
  route.entry.data.gitea = meta;

  // the api sidebar is built by starlight-openapi after this middleware and
  // narrowed down in src/middleware/apiSidebar.ts
  const entries = sidebars.get(meta.prefix);
  if (entries) {
    const sidebar = markCurrent(entries, context.url.pathname);
    route.sidebar = sidebar;

    // pagination is derived from the sidebar, so it has to be recomputed
    const links = flattenSidebar(sidebar);
    const index = links.findIndex((link) => link.isCurrent);
    route.pagination = {
      prev: index > 0 ? links[index - 1] : undefined,
      next: index >= 0 && index < links.length - 1 ? links[index + 1] : undefined,
    };
  }

  const banner = versionBanner(meta);
  if (banner && !route.entry.data.banner) route.entry.data.banner = { content: banner };

  route.head.push(...searchMetaTags(meta));
});
