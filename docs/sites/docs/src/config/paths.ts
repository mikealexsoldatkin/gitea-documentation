import { existsSync } from 'node:fs';
import path from 'node:path';

/**
 * Repository root, the directory holding `docs/`, `versioned_docs/` and the
 * other content trees. Looked up from the working directory instead of
 * `import.meta.url`, which points into the bundle once astro has built the
 * server chunks.
 */
function findRepoRoot(start: string): string {
  let current = path.resolve(start);
  for (let depth = 0; depth < 6; depth += 1) {
    if (existsSync(path.join(current, 'versions.json'))) return current;
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  throw new Error(`unable to locate the repository root from ${start}`);
}

export const repoRoot = findRepoRoot(process.cwd());
