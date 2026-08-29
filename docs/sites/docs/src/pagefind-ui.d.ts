/**
 * `@pagefind/default-ui` ships no types, only the part `src/lib/pagefind-ui.ts`
 * builds on is declared here.
 */
declare module '@pagefind/default-ui' {
  export class PagefindUI {
    constructor(options: Record<string, unknown>);
    triggerSearch(term: string): void;
    triggerFilters(filters: Record<string, string | string[]>): void;
    destroy(): void;
  }
}
