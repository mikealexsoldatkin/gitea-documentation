import { docsSchema } from '@astrojs/starlight/schema';
import { z } from 'astro:content';

/**
 * Metadata the gitea loader attaches to every page: which part of the product
 * matrix it belongs to and where it sits in the source tree. Used to build the
 * per version sidebars, the version and language pickers and the search facets.
 */
export const giteaMeta = z.object({
  product: z.enum(['docs', 'api', 'runner', 'enterprise']),
  version: z.string(),
  locale: z.string(),
  prefix: z.string(),
  /** Directory of the source file, relative to the version directory. */
  dir: z.string().default(''),
  /** File name without extension, or directory name for a category page. */
  name: z.string().default(''),
  order: z.number().optional(),
  /** Set on the generated index page of a category. */
  category: z.boolean().optional(),
});

export type GiteaMeta = typeof giteaMeta._output;

export const giteaDocsSchema = () => docsSchema({ extend: z.object({ gitea: giteaMeta.optional() }) });
