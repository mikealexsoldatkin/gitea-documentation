/**
 * Descriptions of the operation tags of the gitea api.
 *
 * The swagger documents gitea generates carry no top level `tags` section, so
 * starlight-openapi treats every tag as "minimal": it builds no landing page
 * for it and the api overview can only list all operations at once. Adding the
 * descriptions here gives every tag a page of its own, which is what the
 * overview links to.
 *
 * Each line summarizes what the operations of that tag actually cover; edit
 * them here, they are the same for every documented version.
 */
export const apiTagDescriptions: Record<string, string> = {
  admin: 'Instance administration: users, organizations, runners, cron jobs and system hooks.',
  issue: 'Issues and pull request conversations: comments, labels, milestones, reactions and timelines.',
  miscellaneous: 'Markdown rendering, signing keys, server version and instance metadata.',
  notification: 'Notification threads and subscriptions of the authenticated user.',
  organization: 'Organizations and their teams, members, repositories and settings.',
  package: 'Package registries: listing, inspecting and deleting published packages.',
  repository:
    'Repositories and their contents, branches, tags, releases, pull requests, webhooks and actions.',
  settings: 'Instance settings exposed to clients: api, attachment, repository and ui limits.',
  user: 'The authenticated user and other users: keys, tokens, follows, stars and applications.',
};
