/**
 * The few strings the gitea specific components add. Kept here instead of in a
 * starlight i18n collection because the content collection is filled by the
 * loader, which has no place for the ui translation files.
 */
type Strings = {
  versionLabel: string;
  languageLabel: string;
  /** Labels of the products in the header, keyed by product id. */
  products: Record<string, string>;
  /** Titles of the footer columns, keyed by the english title. */
  footer: Record<string, string>;
  signIn: string;
  translationNotice: string;
  translationHelp: string;
  dismissAnnouncement: string;
  /** Checkbox in the search modal, which searches outside the current version. */
  searchAllVersions: string;
  unreleased: (latest: string) => string;
  outdated: (version: string, latest: string) => string;
};

const en: Strings = {
  versionLabel: 'Version',
  languageLabel: 'Language',
  products: { docs: 'Docs', api: 'API', runner: 'Runner', enterprise: 'Enterprise' },
  footer: { Community: 'Community', Code: 'Code', More: 'More' },
  signIn: 'Sign In',
  translationNotice: 'This translation may be behind the english original.',
  translationHelp: 'Help us translate it',
  dismissAnnouncement: 'Dismiss this announcement',
  searchAllVersions: 'Search all versions',
  unreleased: (latest) =>
    `This is the documentation of the next version, still under development. <a href="${latest}">See the latest release</a>.`,
  outdated: (version, latest) =>
    `This is the documentation of ${version}, which is no longer the latest release. <a href="${latest}">See the latest release</a>.`,
};

const strings: Record<string, Strings> = {
  'en-us': en,
  'zh-cn': {
    versionLabel: '版本',
    languageLabel: '语言',
    products: { docs: '文档', api: 'API', runner: 'Runner', enterprise: '企业版' },
    footer: { Community: '社区', Code: '开源代码', More: '更多' },
    signIn: '登录',
    translationNotice: '当前中文文档翻译不是最新版，访问英文版本查看最新内容，或',
    translationHelp: '帮助我们翻译',
    dismissAnnouncement: '关闭此提示',
    searchAllVersions: '搜索所有版本',
    unreleased: (latest) =>
      `这是下一个版本的文档，仍在开发中。<a href="${latest}">查看最新发布版本</a>。`,
    outdated: (version, latest) =>
      `这是 ${version} 的文档，已不是最新发布版本。<a href="${latest}">查看最新发布版本</a>。`,
  },
  'zh-tw': {
    versionLabel: '版本',
    languageLabel: '語言',
    products: { docs: '文件', api: 'API', runner: 'Runner', enterprise: '企業版' },
    footer: { Community: '社區', Code: '開源程式碼', More: '更多' },
    signIn: '登入',
    translationNotice: '當前中文文檔翻譯不是最新版，訪問英文版本查看最新內容，或',
    translationHelp: '幫助我們翻譯',
    dismissAnnouncement: '關閉此提示',
    searchAllVersions: '搜尋所有版本',
    unreleased: (latest) =>
      `這是下一個版本的文檔，仍在開發中。<a href="${latest}">查看最新發布版本</a>。`,
    outdated: (version, latest) =>
      `這是 ${version} 的文檔，已不是最新發布版本。<a href="${latest}">查看最新發布版本</a>。`,
  },
};

export function t(locale: string): Strings {
  return strings[locale] ?? en;
}
