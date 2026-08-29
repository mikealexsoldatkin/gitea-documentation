import type { StarlightPlugin } from '@astrojs/starlight/types';

/**
 * Registers the middleware that adjusts the generated api pages. It has to be a
 * plugin so it can ask for `order: 'post'`, which puts it after the
 * starlight-openapi middleware that builds the sidebar groups; list it after
 * `starlightOpenAPI()` in the plugin array.
 */
export function giteaApiSidebar(): StarlightPlugin {
  return {
    name: 'gitea-api',
    hooks: {
      'config:setup': ({ addRouteMiddleware }) => {
        addRouteMiddleware({ entrypoint: './src/middleware/api.ts', order: 'post' });
      },
    },
  };
}
