// @ts-check
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import starlightDocSearch from '@astrojs/starlight-docsearch';
import starlightOpenAPI, { openAPISidebarGroups } from 'starlight-openapi';
import { apiSchemas } from './src/config/api.js';
import { analytics, announcement, announcementStorageKey } from './src/config/site.js';
import { giteaApiSidebar } from './src/integrations/api.js';
import { giteaPostBuild } from './src/integrations/postbuild.js';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '../..');

// algolia docsearch replaces the local search once the credentials are set; the
// build falls back to pagefind so that a fork without them still gets search
const useDocSearch = Boolean(
  process.env.PUBLIC_DOCSEARCH_APP_ID && process.env.PUBLIC_DOCSEARCH_API_KEY,
);

// set by the `gitea-pagefind-filters` plugin below, checked after the build so
// a starlight upgrade that moves the import fails loudly instead of silently
// serving an unscoped search again
let pagefindUiRedirected = false;

export default defineConfig({
  site: 'https://docs.gitea.com',
  trailingSlash: 'always',
  // images, logos and the swagger documents are served from `static/`
  publicDir: path.join(repoRoot, 'static'),
  // the markdown sources live outside this package, allow the dev server to read them
  vite: {
    server: { fs: { allow: [repoRoot] } },
    plugins: [
      {
        // The api overview of starlight-openapi lists every operation of the
        // document, which repeats the sidebar; swap that section for the tag
        // cards of src/components/ApiOverviewTags.astro. The plugin has no
        // option for it, so the import is redirected instead.
        name: 'gitea-openapi-overview',
        enforce: 'pre',
        resolveId(source, importer) {
          if (
            source === './OverviewNavigationLinks.astro' &&
            importer?.includes('starlight-openapi/components/overview/OverviewSchema.astro')
          ) {
            return path.join(repoRoot, 'sites/docs/src/components/ApiOverviewTags.astro');
          }
          return null;
        },
      },
      {
        // Pagefind indexes every version into one index and starlight builds
        // the search ui with a build time configuration, so a search cannot be
        // scoped to the version being read. Its `@pagefind/default-ui` import
        // is redirected to the subclass in src/lib/pagefind-ui.ts, which
        // selects the filters of the current page.
        name: 'gitea-pagefind-filters',
        enforce: 'pre',
        resolveId(source, importer) {
          if (
            !useDocSearch &&
            source === '@pagefind/default-ui' &&
            importer?.includes('starlight/components/Search.astro')
          ) {
            pagefindUiRedirected = true;
            return path.join(repoRoot, 'sites/docs/src/lib/pagefind-ui.ts');
          }
          return null;
        },
      },
    ],
  },
  // languages the sources tag code blocks with that shiki does not know
  markdown: {
    shikiConfig: {
      langAlias: {
        apacheconf: 'apache',
        conf: 'ini',
        curl: 'bash',
        gitignore: 'text',
        none: 'text',
        plantuml: 'text',
        tmpl: 'handlebars',
      },
    },
  },
  integrations: [
    giteaPostBuild(),
    {
      name: 'gitea-pagefind-filters-check',
      hooks: {
        'astro:build:done': () => {
          if (useDocSearch || pagefindUiRedirected) return;
          throw new Error(
            'the pagefind search ui was not replaced by src/lib/pagefind-ui.ts, ' +
              'the search would return results from every version: check the ' +
              "`gitea-pagefind-filters` plugin against starlight's Search.astro",
          );
        },
      },
    },
    starlight({
      title: 'Gitea Documentation',
      description: 'Git with a cup of tea',
      favicon: '/img/favicon.png',
      logo: { src: './src/assets/gitea.svg', alt: 'Gitea', replacesTitle: true },
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en-US' },
        'zh-cn': { label: '简体中文', lang: 'zh-CN' },
        'zh-tw': { label: '繁體中文', lang: 'zh-TW' },
      },
      plugins: [
        starlightOpenAPI(apiSchemas),
        // after starlight-openapi, so it sees the groups the plugin built
        giteaApiSidebar(),
        ...(useDocSearch
          ? [starlightDocSearch({ clientOptionsModule: './src/config/docsearch.ts' })]
          : []),
      ],
      // one sidebar per product, version and language, selected in the route
      // middleware; starlight only supports a single static one
      customCss: ['./src/styles/theme.css', './src/styles/custom.css'],
      components: {
        Header: './src/components/Header.astro',
        LanguageSelect: './src/components/LanguageSelect.astro',
        MarkdownContent: './src/components/MarkdownContent.astro',
        SiteTitle: './src/components/SiteTitle.astro',
        PageFrame: './src/components/PageFrame.astro',
      },
      head: [
        {
          // hide a dismissed announcement before the first paint, so the page
          // does not jump once the stylesheet and the scripts have loaded
          tag: 'script',
          content: `try{if(localStorage.getItem(${JSON.stringify(
            announcementStorageKey,
          )})===${JSON.stringify(
            announcement.id,
          )})document.documentElement.dataset.giteaAnnouncement='dismissed'}catch(e){}`,
        },
        {
          tag: 'script',
          attrs: { async: true, src: `https://www.googletagmanager.com/gtag/js?id=${analytics.gtagId}` },
        },
        {
          tag: 'script',
          content: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${analytics.gtagId}');`,
        },
        {
          tag: 'script',
          attrs: {
            defer: true,
            'data-domain': analytics.plausibleDomain,
            src: 'https://plausible.io/js/script.js',
          },
        },
        { tag: 'meta', attrs: { property: 'og:logo', content: '/img/gitea.svg' } },
        {
          tag: 'meta',
          attrs: {
            name: 'keywords',
            content:
              'gitea, git, devops, actions, packages, documentation, self-hosted, open-source, version control, gitlab, github',
          },
        },
      ],
      // the api groups are needed here so starlight-openapi pages get a sidebar,
      // the route middleware narrows it down to the version being read
      sidebar: [...openAPISidebarGroups],
      routeMiddleware: './src/routeData.ts',
      // the sources live outside src/content/docs, starlight only runs its
      // markdown transforms (asides, heading anchors) on files below these
      markdown: { processedDirs: ['../..'] },
      pagefind: !useDocSearch,
    }),
  ],
});
