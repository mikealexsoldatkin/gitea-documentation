import { parse as parseYaml } from 'yaml';
import type { VersionVariables } from './products.js';

export interface ParsedFile {
  frontmatter: Record<string, unknown>;
  body: string;
}

const frontmatterPattern = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export function splitFrontmatter(contents: string): ParsedFile {
  const match = contents.match(frontmatterPattern);
  if (!match) return { frontmatter: {}, body: contents };
  const parsed = parseYaml(match[1] ?? '') as Record<string, unknown> | null;
  return { frontmatter: parsed ?? {}, body: contents.slice(match[0].length) };
}

/**
 * Replaces the `@name@` placeholders with the values of the version, the same
 * substitution the docusaurus markdown preprocessor did.
 */
export function applyVariables(contents: string, variables?: VersionVariables): string {
  if (!variables) return contents;
  let result = contents;
  for (const [name, value] of Object.entries(variables)) {
    result = result.replaceAll(`@${name}@`, value);
  }
  return result;
}

/**
 * Starlight renders the page title from the frontmatter, the gitea sources
 * carry it as a leading level one heading instead. Lift it into the
 * frontmatter and drop it from the body so it is not rendered twice.
 */
export function extractTitle(body: string): { title?: string; body: string } {
  // the first level one heading is the title, wherever it sits: a few pages
  // open with an admonition before it
  const match = body.match(/^#\s+(.+?)\s*$/m);
  if (!match || match.index === undefined) return { body };
  return {
    title: match[1],
    body: body.slice(0, match.index) + body.slice(match.index + match[0].length),
  };
}

/**
 * Docusaurus admonitions to starlight asides. The two vocabularies overlap for
 * `note`, `tip`, `caution` and `danger`; `warning` and `info` have to be mapped
 * and titles move from `:::note Title` to `:::note[Title]`.
 */
const asideTypes: Record<string, string> = {
  note: 'note',
  tip: 'tip',
  info: 'note',
  warning: 'caution',
  caution: 'caution',
  danger: 'danger',
};

export function normalizeAdmonitions(body: string): string {
  return body
    .split('\n')
    .flatMap((line) => {
      const match = line.match(/^(\s*):::([a-z]+)(?:\[([^\]]*)\])?[ \t]*(.*)$/);
      if (!match) return [line];
      const [, indent = '', rawType = '', bracketTitle, rest = ''] = match;
      const type = asideTypes[rawType];
      if (!type) return [line];

      // `:::warning some text:::` appears in a few pages, split it up
      const inline = rest.endsWith(':::') ? rest.slice(0, -3).trim() : undefined;
      const title = bracketTitle ?? (inline === undefined ? rest.trim() : '');
      const opening = `${indent}:::${type}${title ? `[${title}]` : ''}`;
      if (inline === undefined) return [opening];
      return inline ? [opening, `${indent}${inline}`, `${indent}:::`] : [opening, `${indent}:::`];
    })
    .join('\n');
}
