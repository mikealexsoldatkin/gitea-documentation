/** Chrome of the site: announcement strip, footer columns and analytics. */

export const announcement = {
  /** Bump to show the strip again to everyone who dismissed the previous one. */
  id: 'gitea-cloud-1',
  href: 'https://about.gitea.com/products/cloud',
  text: 'Try Gitea Cloud ☁️ for 30 days → Accelerate your Development & Deploys!',
};

/** Key the dismissed announcement is remembered under. */
export const announcementStorageKey = 'gitea:announcement-dismissed';

export const footerLinks = [
  {
    title: 'Community',
    items: [
      { label: 'Awesome Gitea', href: 'https://gitea.com/gitea/awesome-gitea' },
      { label: 'Stack Overflow', href: 'https://stackoverflow.com/questions/tagged/gitea' },
      { label: 'Discord', href: 'https://discord.gg/gitea' },
      { label: 'Forum', href: 'https://forum.gitea.com/' },
      { label: 'Twitter', href: 'https://twitter.com/giteaio' },
      { label: 'Mastodon', href: 'https://social.gitea.io/@gitea' },
      { label: 'Bluesky', href: 'https://bsky.app/profile/gitea.com' },
    ],
  },
  {
    title: 'Code',
    items: [
      { label: 'GitHub', href: 'https://github.com/go-gitea/gitea' },
      { label: 'Gitea', href: 'https://gitea.com/gitea' },
      { label: 'Tea CLI', href: 'https://gitea.com/gitea/tea' },
    ],
  },
  {
    title: 'More',
    items: [
      { label: 'Blog', href: 'https://blog.gitea.com/' },
      { label: 'Gitea Cloud', href: 'https://about.gitea.com/products/cloud' },
      { label: 'Enterprise', href: 'https://about.gitea.com/products/gitea' },
    ],
  },
];

export const analytics = {
  gtagId: 'G-KHM0KYT506',
  plausibleDomain: 'docs.gitea.com',
};
