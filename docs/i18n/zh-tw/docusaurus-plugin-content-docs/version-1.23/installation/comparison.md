---
date: "2018-05-07T13:00:00+02:00"
slug: "comparison"
sidebar_position: 5
aliases:
  - /zh-tw/comparison
---

# 與其他 Git 託管的比較

為了幫助您決定 Gitea 是否適合您的需求，這裡是它與其他 Git 自託管選項的比較。

請注意，我們不會定期檢查其他產品的功能變更，因此此列表可能已過時。如果您發現需要在下表中更新的內容，請[打開一個問題](https://github.com/go-gitea/gitea/issues/new/choose)。

_表格中使用的符號：_

- _✓ - 支援_

- _⁄ - 支援但功能有限_

- _✘ - 不支援_

- _⚙️ - 通過第三方軟件支援_

## 一般功能

| 功能                            | Gitea                                               | GitHub EE | GitLab CE | GitLab EE | BitBucket | RhodeCode CE | RhodeCode EE |
| ------------------------------- | --------------------------------------------------- | --------- | --------- | --------- | --------- | ------------ | ------------ |
| 開源且免費                      | ✓                                                   | ✘         | ✓         | ✘         | ✘         | ✓            | ✓            |
| 低 RAM/ CPU 使用量              | ✓                                                   | ✘         | ✘         | ✘         | ✘         | ✘            | ✘            |
| 多資料庫支援                    | ✓                                                   | ✘         | ⁄         | ⁄         | ✓         | ✓            | ✓            |
| 多操作系統支援                  | ✓                                                   | ✘         | ✘         | ✘         | ✘         | ✓            | ✓            |
| 易於升級                        | ✓                                                   | ✘         | ✓         | ✓         | ✘         | ✓            | ✓            |
| 遠程遙測                        | **✘**                                               | ✓         | ✓         | ✓         | ✓         | ✘            | ✘            |
| 第三方渲染工具支援              | ✓                                                   | ✘         | ✘         | ✘         | ✓         | ✘            | ✘            |
| WebAuthn (2FA)                  | ✓                                                   | ✓         | ✓         | ✓         | ✓         | ✘            | ✓            |
| 廣泛的 API                      | ✓                                                   | ✓         | ✓         | ✓         | ✓         | ✓            | ✓            |
| 內置包/容器註冊表               | ✓                                                   | ✓         | ✓         | ✓         | ✘         | ✘            | ✘            |
| 同步提交到外部儲存庫（推送鏡像）  | ✓                                                   | ✘         | ✓         | ✓         | ✘         | ✓            | ✓            |
| 從外部儲存庫同步提交（拉取鏡像）  | ✓                                                   | ✘         | ✓         | ✓         | ✘         | ✓            | ✓            |
| 淺色和深色主題                  | ✓                                                   | ✓         | ✓         | ✓         | ✘         | ✘            | ✘            |
| 自訂主題支援                  | ✓                                                   | ✘         | ✘         | ✘         | ✓         | ✓            | ✓            |
| Markdown 支援                   | ✓                                                   | ✓         | ✓         | ✓         | ✓         | ✓            | ✓            |
| CSV 支援                        | ✓                                                   | ✓         | ✘         | ✘         | ✓         | ✘            | ✘            |
| 'GitHub / GitLab 頁面'          | [⚙️][gitea-pages-server], [⚙️][gitea-caddy-plugin]  | ✓         | ✓         | ✓         | ✘         | ✘            | ✘            |
| Gists / Snippets                | [⚙️][opengist]                                      | ✓         | ✓         | ✓         | ✓         | ✓            | ✓            |
| 特定儲存庫的 wiki（作為儲存庫本身） | ✓                                                   | ✓         | ✓         | ✓         | /         | ✘            | ✘            |
| 部署令牌                        | ✓                                                   | ✓         | ✓         | ✓         | ✓         | ✓            | ✓            |
| 具有寫權限的儲存庫令牌            | ✓                                                   | ✓         | ✓         | ✓         | ✓         | ✓            | ✓            |
| RSS 提要                        | ✓                                                   | ✓         | ✘         | ✘         | ✘         | ✓            | ✓            |
| 內置 CI/CD                      | ✓                                                   | ✓         | ✓         | ✓         | ✘         | ✘            | ✘            |
| 子組：組內組                    | [✘](https://github.com/go-gitea/gitea/issues/1872)  | ✘         | ✓         | ✓         | ✘         | ✓            | ✓            |
| 與其他實例的交互                | [/](https://github.com/go-gitea/gitea/issues/18240) | ✘         | ✘         | ✘         | ✘         | ✘            | ✘            |
| Markdown 中的 Mermaid 圖表      | ✓                                                   | ✓         | ✓         | ✓         | ✘         | ✘            | ✘            |
| Markdown 中的數學語法           | ✓                                                   | ✓         | ✓         | ✓         | ✘         | ✓            | ✓            |

## 程式碼管理

| 功能                                  | Gitea                                               | GitHub EE | GitLab CE | GitLab EE | BitBucket | RhodeCode CE | RhodeCode EE |
| ------------------------------------- | --------------------------------------------------- | --------- | --------- | --------- | --------- | ------------ | ------------ |
| 儲存庫主題                              | ✓                                                   | ✓         | ✓         | ✓         | ✘         | ✘            | ✘            |
| 儲存庫程式碼搜索                          | ✓                                                   | ✓         | ✓         | ✓         | ✓         | ✓            | ✓            |
| 全域程式碼搜索                          | ✓                                                   | ✓         | ✘         | ✓         | ✓         | ✓            | ✓            |
| Git LFS 2.0                           | ✓                                                   | ✓         | ✓         | ✓         | ✓         | ✓            | ✓            |
| 組里程碑                              | [✘](https://github.com/go-gitea/gitea/issues/14622) | ✘         | ✓         | ✓         | ✘         | ✘            | ✘            |
| 細粒度使用者角色（程式碼、問題、Wiki 等） | ✓                                                   | ✘         | ✓         | ✓         | ✘         | ✘            | ✘            |
| 驗證提交者                            | ⁄                                                   | ?         | ✓         | ✓         | ✓         | ✘            | ✘            |
| GPG 簽名提交                          | ✓                                                   | ✓         | ✓         | ✓         | ✓         | ✓            | ✓            |
| SSH 簽名提交                          | ✓                                                   | ✓         | ✓         | ✓         | ?         | ✘            | ✘            |
| 拒絕未簽名的提交                      | ✓                                                   | ✓         | ✓         | ✓         | ✓         | ✓            | ✓            |
| 從其他服務遷移儲存庫                    | ✓                                                   | ✓         | ✓         | ✓         | ✓         | ✓            | ✓            |
| 儲存庫活動頁面                          | ✓                                                   | ✓         | ✓         | ✓         | ✓         | ✓            | ✓            |
| 分支管理器                            | ✓                                                   | ✓         | ✓         | ✓         | ✓         | ✓            | ✓            |
| 建立新分支                            | ✓                                                   | ✓         | ✓         | ✓         | ✘         | ✘            | ✘            |
| 網頁程式碼編輯器                        | ✓                                                   | ✓         | ✓         | ✓         | ✓         | ✓            | ✓            |
| 提交圖                                | ✓                                                   | ✓         | ✓         | ✓         | ✓         | ✓            | ✓            |
| 模板儲存庫                              | ✓                                                   | ✓         | ✘         | ✓         | ✓         | ✘            | ✘            |
| Git Blame                             | ✓                                                   | ✓         | ✓         | ✓         | ✓         | ✓            | ✓            |
| 圖像更改的可視比較                    | ✓                                                   | ✓         | ?         | ?         | ?         | ✘            | ✘            |

- Gitea 具有內置的儲存庫級程式碼搜索
- 更好的程式碼搜索支援可以透過[使用儲存庫索引器](../administration/repo-indexer.md)來實現

## 問題跟蹤器

| Feature                       | Gitea                                               | GitHub EE | GitLab CE | GitLab EE | BitBucket | RhodeCode CE | RhodeCode EE |
| ----------------------------- | --------------------------------------------------- | --------- | --------- | --------- | --------- | ------------ | ------------ |
| Issue tracker                 | ✓                                                   | ✓         | ✓         | ✓         | /         | ✘            | ✘            |
| Issue templates               | ✓                                                   | ✓         | ✓         | ✓         | ✘         | ✘            | ✘            |
| Labels                        | ✓                                                   | ✓         | ✓         | ✓         | ✘         | ✘            | ✘            |
| Time tracking                 | ✓                                                   | ✓         | ✓         | ✓         | ✘         | ✘            | ✘            |
| Multiple assignees for issues | ✓                                                   | ✓         | ✘         | ✓         | ✘         | ✘            | ✘            |
| Related issues                | ✘                                                   | ⁄         | ✓         | ✓         | ✘         | ✘            | ✘            |
| Confidential issues           | [✘](https://github.com/go-gitea/gitea/issues/3217)  | ✘         | ✓         | ✓         | ✘         | ✘            | ✘            |
| Comment reactions             | ✓                                                   | ✓         | ✓         | ✓         | ✘         | ✘            | ✘            |
| Lock Discussion               | ✓                                                   | ✓         | ✓         | ✓         | ✘         | ✘            | ✘            |
| Batch issue handling          | ✓                                                   | ✓         | ✓         | ✓         | ✘         | ✘            | ✘            |
| Projects                      | [/](https://github.com/go-gitea/gitea/issues/14710) | ✘         | ✓         | ✓         | ✘         | ✘            | ✘            |
| Create branch from issue      | [✘](https://github.com/go-gitea/gitea/issues/20226) | ✘         | ✓         | ✓         | ✘         | ✘            | ✘            |
| Convert comment to new issue  | ✓                                                   | ✓         | ✓         | ✓         | ✘         | ✘            | ✘            |
| Issue search                  | ✓                                                   | ✓         | ✓         | ✓         | ✓         | ✘            | ✘            |
| Global issue search           | [/](https://github.com/go-gitea/gitea/issues/2434)  | ✓         | ✓         | ✓         | ✓         | ✘            | ✘            |
| Issue dependency              | ✓                                                   | ✘         | ✘         | ✘         | ✘         | ✘            | ✘            |
| Create issue via email        | [✘](https://github.com/go-gitea/gitea/issues/6226)  | ✘         | ✓         | ✓         | ✓         | ✘            | ✘            |
| Service Desk                  | [✘](https://github.com/go-gitea/gitea/issues/6219)  | ✘         | ✓         | ✓         | ✘         | ✘            | ✘            |

## Pull/Merge requests

| Feature                                         | Gitea                                              | GitHub EE | GitLab CE | GitLab EE | BitBucket | RhodeCode CE | RhodeCode EE |
| ----------------------------------------------- | -------------------------------------------------- | --------- | --------- | --------- | --------- | ------------ | ------------ |
| Pull/Merge requests                             | ✓                                                  | ✓         | ✓         | ✓         | ✓         | ✓            | ✓            |
| Squash merging                                  | ✓                                                  | ✓         | ✓         | ✓         | ✓         | ✓            | ✓            |
| Rebase merging                                  | ✓                                                  | ✓         | ✓         | ✓         | ✓         | ✓            | ✓            |
| Pull/Merge request inline comments              | ✓                                                  | ✓         | ✓         | ✓         | ✓         | ✓            | ✓            |
| Pull/Merge request approval                     | ✓                                                  | ✓         | ✓         | ✓         | ✓         | ✓            | ✓            |
| Pull/Merge require approval                     | ✓                                                  | ✓         | ✘         | ✓         | ✓         | ✓            | ✓            |
| Pull/Merge multiple reviewers                   | ✓                                                  | ✓         | ✘         | ✓         | ✓         | ✓            | ✓            |
| Merge conflict resolution                       | [✘](https://github.com/go-gitea/gitea/issues/9014) | ✓         | ✓         | ✓         | ✓         | ✘            | ✘            |
| Restrict push and merge access to certain users | ✓                                                  | ✓         | ✓         | ✓         | ✓         | ✓            | ✓            |
| Revert specific commits                         | ✓                                                  | ✓         | ✓         | ✓         | ✓         | ✘            | ✘            |
| Pull/Merge requests templates                   | ✓                                                  | ✓         | ✓         | ✓         | ✘         | ✘            | ✘            |
| Cherry-picking changes                          | ✓                                                  | ✘         | ✓         | ✓         | ✘         | ✘            | ✓            |
| Download Patch                                  | ✓                                                  | ✓         | ✓         | ✓         | /         | ✓            | ✓            |
| Merge queues                                    | ✓                                                  | ✓         | ✘         | ✓         | ✘         | ✘            | ✘            |

## 3rd-party integrations

| Feature                                        | Gitea                                              | GitHub EE | GitLab CE | GitLab EE | BitBucket | RhodeCode CE | RhodeCode EE |
| ---------------------------------------------- | -------------------------------------------------- | --------- | --------- | --------- | --------- | ------------ | ------------ |
| Webhooks                                       | ✓                                                  | ✓         | ✓         | ✓         | ✓         | ✓            | ✓            |
| Git Hooks                                      | ✓                                                  | ✓         | ✓         | ✓         | ✓         | ✓            | ✓            |
| AD / LDAP integration                          | ✓                                                  | ✓         | ✓         | ✓         | ✓         | ✓            | ✓            |
| Multiple LDAP / AD server support              | ✓                                                  | ✘         | ✘         | ✓         | ✓         | ✓            | ✓            |
| LDAP user synchronization                      | ✓                                                  | ✓         | ✓         | ✓         | ✓         | ✘            | ✓            |
| SAML 2.0 service provider                      | [✘](https://github.com/go-gitea/gitea/issues/5512) | ✓         | ✓         | ✓         | ✓         | ✘            | ✓            |
| OpenID Connect support                         | ✓                                                  | ✓         | ✓         | ✓         | ?         | ✘            | ✓            |
| OAuth 2.0 integration (external authorization) | ✓                                                  | ⁄         | ✓         | ✓         | ?         | ✘            | ✓            |
| Act as OAuth 2.0 provider                      | ✓                                                  | ✓         | ✓         | ✓         | ✓         | ✘            | ✘            |
| Two factor authentication (2FA)                | ✓                                                  | ✓         | ✓         | ✓         | ✓         | ✘            | ✓            |
| Integration with the most common services      | ✓                                                  | ⁄         | ✓         | ✓         | ⁄         | ✓            | ✓            |
| Incorporate external CI/CD                     | ✓                                                  | ✓         | ✓         | ✓         | ✓         | ✓            | ✓            |

[gitea-caddy-plugin]: https://github.com/42wim/caddy-gitea
[gitea-pages-server]: https://codeberg.org/Codeberg/pages-server
[opengist]: https://github.com/thomiceli/opengist
