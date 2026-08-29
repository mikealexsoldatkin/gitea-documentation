/**
 * Rewrites the relative markdown links of the sources to the urls of the built
 * site. Docusaurus resolved `../administration/config-cheat-sheet.md` against
 * the directory of the file it appeared in; astro serves urls, so the target
 * has to be looked up in the route table of the version.
 */

export interface LinkContext {
  /** Directory of the source file, relative to the version directory. */
  dir: string;
  /** Route of a source path, relative to the version directory. */
  resolve(sourcePath: string): string | undefined;
  /** Called for every link that cannot be resolved. */
  onBroken(target: string): void;
}

const markdownLink = /(\]\()([^)\s]+)((?:\s+"[^"]*")?\))/g;
const referenceLink = /^(\s*\[[^\]]+\]:\s*)(\S+)(.*)$/gm;

/** Normalizes `a/b/../c` without resorting to the node path module. */
function normalize(pathname: string): string {
  const parts: string[] = [];
  for (const part of pathname.split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') parts.pop();
    else parts.push(part);
  }
  return parts.join('/');
}

function rewriteTarget(target: string, context: LinkContext): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('//') || target.startsWith('#')) {
    return target;
  }
  const [pathname = '', hash = ''] = splitHash(target);
  if (!/\.mdx?$/.test(pathname)) return target;

  // docusaurus resolved a link against the directory of the file first and
  // against the root of the version second, both spellings are in the sources
  const route =
    context.resolve(normalize(`${context.dir}/${pathname}`)) ?? context.resolve(normalize(pathname));
  if (!route) {
    context.onBroken(target);
    return target;
  }
  return `${route}${hash}`;
}

function splitHash(target: string): [string, string] {
  const index = target.indexOf('#');
  return index === -1 ? [target, ''] : [target.slice(0, index), target.slice(index)];
}

export function rewriteLinks(body: string, context: LinkContext): string {
  return body
    .replace(markdownLink, (_match, open: string, target: string, close: string) =>
      `${open}${rewriteTarget(target, context)}${close}`,
    )
    .replace(referenceLink, (_match, open: string, target: string, rest: string) =>
      `${open}${rewriteTarget(target, context)}${rest}`,
    );
}

/**
 * Internal page links of a page, used by the link checker. Links to a file
 * (images, archives, ...) are left out, they are served from `public/`.
 */
export function internalLinks(body: string): string[] {
  const found: string[] = [];
  for (const match of body.matchAll(markdownLink)) {
    const target = match[2] ?? '';
    if (!target.startsWith('/') || target.startsWith('//')) continue;
    const [pathname = ''] = target.split('#');
    if (pathname.split('/').at(-1)?.includes('.')) continue;
    found.push(target);
  }
  return found;
}
