import { giteaDocsLoader } from '@gitea-docs/content-loader';
import { defineCollection } from 'astro:content';
import { repoRoot } from './config/paths';
import { giteaDocsSchema } from './schema';

export const collections = {
  docs: defineCollection({
    loader: giteaDocsLoader({ root: repoRoot }),
    schema: giteaDocsSchema(),
  }),
};
