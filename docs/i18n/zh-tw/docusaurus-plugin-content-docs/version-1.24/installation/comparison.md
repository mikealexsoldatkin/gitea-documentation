---
date: "2019-02-14T11:51:04+08:00"
slug: "comparison"
sidebar_position: 5
aliases:
  - /zh-tw/comparison
---

# 對比 Gitea 與其它 Git 託管工具

這裡列出了 Gitea 與其它一些 Git 託管工具之間的異同，以便確認 Gitea 是否能夠滿足您的需求。

請注意，此列表中的某些表項可能已經過時，因為我們並沒有定期檢查其它產品的功能是否有所更改。你可以前往 [Github issue](https://github.com/go-gitea/gitea/issues) 來幫助我們更新過時的內容，感謝！

_表格中的符號含義:_

- _✓ - 支援_

- _⁄ - 部分支援_

- _✘ - 不支援_

- _⚙️ - 由第三方服務或外掛支援_

#### 主要特性

| 特性                             | Gitea                                               | Gogs | GitHub EE | GitLab CE | GitLab EE | BitBucket      | RhodeCode CE |
| -------------------------------- | --------------------------------------------------- | ---- | --------- | --------- | --------- | -------------- | ------------ |
| 開源免費                         | ✓                                                   | ✓    | ✘         | ✓         | ✘         | ✘              | ✓            |
| 低資源開銷 (RAM/CPU)             | ✓                                                   | ✓    | ✘         | ✘         | ✘         | ✘              | ✘            |
| 支援多種資料庫                   | ✓                                                   | ✓    | ✘         | ⁄         | ⁄         | ✓              | ✓            |
| 支援多種操作系統                 | ✓                                                   | ✓    | ✘         | ✘         | ✘         | ✘              | ✓            |
| 升級簡便                         | ✓                                                   | ✓    | ✘         | ✓         | ✓         | ✘              | ✓            |
| 可觀測性                         | **✘**                                               | ✘    | ✓         | ✓         | ✓         | ✓              | ?            |
| 支援第三方渲染工具               | ✓                                                   | ✘    | ✘         | ✘         | ✘         | ✓              | ?            |
| WebAuthn (2FA)                   | ✓                                                   | ✘    | ✓         | ✓         | ✓         | ✓              | ?            |
| 擴展 API                         | ✓                                                   | ✓    | ✓         | ✓         | ✓         | ✓              | ✓            |
| 內置套件/容器註冊中心          | ✓                                                   | ✘    | ✓         | ✓         | ✓         | ✘              | ✘            |
| 同步提交到外部存放庫 (push mirror) | ✓                                                   | ✓    | ✘         | ✓         | ✓         | ✘              | ✓            |
| 同步外部存放庫的提交 (pull mirror) | ✓                                                   | ✘    | ✘         | ✓         | ✓         | ✘              | ?            |
| 淺色和深色主題                   | ✓                                                   | ✘    | ✓         | ✓         | ✓         | ✘              | ?            |
| 自訂主題支援                   | ✓                                                   | ✓    | ✘         | ✘         | ✘         | ✓              | ✘            |
| 支援 Markdown                    | ✓                                                   | ✓    | ✓         | ✓         | ✓         | ✓              | ✓            |
| 支援 CSV                         | ✓                                                   | ✘    | ✓         | ✘         | ✘         | ✓              | ?            |
| Git 驅動的靜態 pages             | [⚙️][gitea-pages-server], [⚙️][gitea-caddy-plugin]  | ✘    | ✓         | ✓         | ✓         | ✘              | ✘            |
| Git 驅動的整合化 wiki            | ✓                                                   | ✓    | ✓         | ✓         | ✓         | ✓ (cloud only) | ✘            |
| 部署令牌                         | ✓                                                   | ✓    | ✓         | ✓         | ✓         | ✓              | ✓            |
| 存放庫寫權限令牌                   | ✓                                                   | ✘    | ✓         | ✓         | ✓         | ✓              | ✓            |
| RSS Feeds                        | ✓                                                   | ✘    | ✓         | ✘         | ✘         | ✘              | ✘            |
| 內置 CI/CD                       | ✓                                                   | ✘    | ✓         | ✓         | ✓         | ✘              | ✘            |
| 子組織：組織內的組織             | [✘](https://github.com/go-gitea/gitea/issues/1872)  | ✘    | ✘         | ✓         | ✓         | ✘              | ✓            |
| 多實例交互                       | [/](https://github.com/go-gitea/gitea/issues/18240) | ✘    | ✘         | ✘         | ✘         | ✘              | ✘            |
| Markdown 繪圖                    | ✓                                                   | ✘    | ✓         | ✓         | ✓         | ✘              | ✘            |
| Markdown 數學公式                | ✓                                                   | ✘    | ✓         | ✓         | ✓         | ✘              | ✘            |

#### 程式碼管理

| 特性                 | Gitea                                               | Gogs | GitHub EE | GitLab CE | GitLab EE | BitBucket | RhodeCode CE |
| -------------------- | --------------------------------------------------- | ---- | --------- | --------- | --------- | --------- | ------------ |
| 存放庫主題描述         | ✓                                                   | ✘    | ✓         | ✓         | ✓         | ✘         | ✘            |
| 存放庫內程式碼搜索       | ✓                                                   | ✘    | ✓         | ✓         | ✓         | ✓         | ✓            |
| 全域程式碼搜索         | ✓                                                   | ✘    | ✓         | ✘         | ✓         | ✓         | ✓            |
| Git LFS 2.0          | ✓                                                   | ✘    | ✓         | ✓         | ✓         | ✓         | ✓            |
| 組織里程碑           | [✘](https://github.com/go-gitea/gitea/issues/14622) | ✘    | ✘         | ✓         | ✓         | ✘         | ✘            |
| 細粒度使用者角色       | ✓                                                   | ✘    | ✘         | ✓         | ✓         | ✘         | ✘            |
| 提交人的身份驗證     | ⁄                                                   | ✘    | ?         | ✓         | ✓         | ✓         | ✘            |
| GPG 簽名的提交       | ✓                                                   | ✘    | ✓         | ✓         | ✓         | ✓         | ✓            |
| SSH 簽名的提交       | ✓                                                   | ✘    | ✓         | ✓         | ✓         | ?         | ?            |
| 拒絕未通過驗證的提交 | ✓                                                   | ✘    | ✓         | ✓         | ✓         | ✓         | ✓            |
| 外部存放庫遷移         | ✓                                                   | ✘    | ✓         | ✓         | ✓         | ✓         | ✓            |
| 存放庫活躍度頁面       | ✓                                                   | ✘    | ✓         | ✓         | ✓         | ✓         | ✓            |
| 分支管理             | ✓                                                   | ✘    | ✓         | ✓         | ✓         | ✓         | ✓            |
| 建立新分支           | ✓                                                   | ✘    | ✓         | ✓         | ✓         | ✘         | ✘            |
| 在線程式碼編輯         | ✓                                                   | ✓    | ✓         | ✓         | ✓         | ✓         | ✓            |
| 提交的統計圖表       | ✓                                                   | ✘    | ✓         | ✓         | ✓         | ✓         | ✓            |
| 模板存放庫             | ✓                                                   | ✘    | ✓         | ✘         | ✓         | ✓         | ✘            |
| Git Blame            | ✓                                                   | ✘    | ✓         | ✓         | ✓         | ✓         | ✘            |
| 可視化鏡像變化       | ✓                                                   | ✘    | ✓         | ?         | ?         | ?         | ?            |

#### 工單管理

| 特性                | Gitea                                              | Gogs                                          | GitHub EE | GitLab CE                                                               | GitLab EE | BitBucket      | RhodeCode CE |
| ------------------- | -------------------------------------------------- | --------------------------------------------- | --------- | ----------------------------------------------------------------------- | --------- | -------------- | ------------ |
| 工單跟蹤            | ✓                                                  | ✓                                             | ✓         | ✓                                                                       | ✓         | ✓ (cloud only) | ✘            |
| 工單模板            | ✓                                                  | ✓                                             | ✓         | ✓                                                                       | ✓         | ✘              | ✘            |
| 標籤                | ✓                                                  | ✓                                             | ✓         | ✓                                                                       | ✓         | ✘              | ✘            |
| 時間跟蹤            | ✓                                                  | ✘                                             | ✓         | ✓                                                                       | ✓         | ✘              | ✘            |
| 支援多個負責人      | ✓                                                  | ✘                                             | ✓         | ✘                                                                       | ✓         | ✘              | ✘            |
| 關聯的工單          | ✘                                                  | ✘                                             | ⁄         | [✓](https://docs.gitlab.com/ce/user/project/issues/related_issues.html) | ✓         | ✘              | ✘            |
| 私密工單            | [✘](https://github.com/go-gitea/gitea/issues/3217) | ✘                                             | ✘         | ✓                                                                       | ✓         | ✘              | ✘            |
| 評論反饋            | ✓                                                  | ✘                                             | ✓         | ✓                                                                       | ✓         | ✘              | ✘            |
| 鎖定討論            | ✓                                                  | ✘                                             | ✓         | ✓                                                                       | ✓         | ✘              | ✘            |
| 工單批處理          | ✓                                                  | ✘                                             | ✓         | ✓                                                                       | ✓         | ✘              | ✘            |
| 工單看板            | [✓](https://github.com/go-gitea/gitea/pull/8346)   | ✘                                             | ✘         | ✓                                                                       | ✓         | ✘              | ✘            |
| 從工單建立分支      | ✘                                                  | ✘                                             | ✘         | ✓                                                                       | ✓         | ✘              | ✘            |
| 從評論建立工單      | ✓                                                  | ✘                                             | ✓         | ✓                                                                       | ✓         | ✘              | ✘            |
| 工單搜索            | ✓                                                  | ✘                                             | ✓         | ✓                                                                       | ✓         | ✓              | ✘            |
| 工單全域搜索        | [✘](https://github.com/go-gitea/gitea/issues/2434) | ✘                                             | ✓         | ✓                                                                       | ✓         | ✓              | ✘            |
| 工單依賴關係        | ✓                                                  | ✘                                             | ✘         | ✘                                                                       | ✘         | ✘              | ✘            |
| 通過 Email 建立工單 | [✘](https://github.com/go-gitea/gitea/issues/6226) | [✘](https://github.com/gogs/gogs/issues/2602) | ✘         | ✓                                                                       | ✓         | ✓              | ✘            |
| 服務檯              | [✘](https://github.com/go-gitea/gitea/issues/6219) | ✘                                             | ✘         | [✓](https://gitlab.com/groups/gitlab-org/-/epics/3103)                  | ✓         | ✘              | ✘            |

#### Pull/Merge requests

| 特性                                 | Gitea                                              | Gogs | GitHub EE | GitLab CE                                                                         | GitLab EE | BitBucket                                                                | RhodeCode CE |
| ------------------------------------ | -------------------------------------------------- | ---- | --------- | --------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------ | ------------ |
| Pull/Merge requests                  | ✓                                                  | ✓    | ✓         | ✓                                                                                 | ✓         | ✓                                                                        | ✓            |
| Squash merging                       | ✓                                                  | ✘    | ✓         | [✓](https://docs.gitlab.com/ce/user/project/merge_requests/squash_and_merge.html) | ✓         | ✓                                                                        | ✓            |
| Rebase merging                       | ✓                                                  | ✓    | ✓         | ✘                                                                                 | ⁄         | ✘                                                                        | ✓            |
| 評論 Pull/Merge request 中的某行程式碼 | ✓                                                  | ✘    | ✓         | ✓                                                                                 | ✓         | ✓                                                                        | ✓            |
| 指定 Pull/Merge request 的審覈人     | ✓                                                  | ✘    | ⁄         | ✓                                                                                 | ✓         | ✓                                                                        | ✓            |
| 解決 Merge 衝突                      | [✘](https://github.com/go-gitea/gitea/issues/5158) | ✘    | ✓         | ✓                                                                                 | ✓         | ✓                                                                        | ✘            |
| 限制某些使用者的 push 和 merge 權限    | ✓                                                  | ✘    | ✓         | ⁄                                                                                 | ✓         | ✓                                                                        | ✓            |
| 回退某些 commits 或 merge request    | [✓](https://github.com/go-gitea/gitea/issues/5158) | ✘    | ✓         | ✓                                                                                 | ✓         | ✓                                                                        | ✘            |
| Pull/Merge requests 模板             | ✓                                                  | ✓    | ✓         | ✓                                                                                 | ✓         | ✘                                                                        | ✘            |
| 查看 Cherry-picking 的更改           | [✓](https://github.com/go-gitea/gitea/issues/5158) | ✘    | ✘         | ✓                                                                                 | ✓         | ✘                                                                        | ✘            |
| 下載 Patch                           | ✓                                                  | ✘    | ✓         | ✓                                                                                 | ✓         | [/](https://jira.atlassian.com/plugins/servlet/mobile#issue/BCLOUD-8323) | ✘            |
| Merge queues                         | ✘                                                  | ✘    | ✓         | ✘                                                                                 | ✓         | ✘                                                                        | ✘            |

#### 第三方整合

| 特性                       | Gitea                                              | Gogs                                          | GitHub EE | GitLab CE | GitLab EE | BitBucket | RhodeCode CE |
| -------------------------- | -------------------------------------------------- | --------------------------------------------- | --------- | --------- | --------- | --------- | ------------ |
| 支援 Webhook               | ✓                                                  | ✓                                             | ✓         | ✓         | ✓         | ✓         | ✓            |
| 自訂 Git 鉤子            | ✓                                                  | ✓                                             | ✓         | ✓         | ✓         | ✓         | ✓            |
| 整合 AD / LDAP             | ✓                                                  | ✓                                             | ✓         | ✓         | ✓         | ✓         | ✓            |
| 支援多個 LDAP / AD 服務    | ✓                                                  | ✓                                             | ✘         | ✘         | ✓         | ✓         | ✓            |
| LDAP 使用者同步              | ✓                                                  | ✘                                             | ✓         | ✓         | ✓         | ✓         | ✓            |
| SAML 2.0 service provider  | [✘](https://github.com/go-gitea/gitea/issues/5512) | [✘](https://github.com/gogs/gogs/issues/1221) | ✓         | ✓         | ✓         | ✓         | ✘            |
| 支援 OpenId 連接           | ✓                                                  | ✘                                             | ✓         | ✓         | ✓         | ?         | ✘            |
| 整合 OAuth 2.0（外部授權） | ✓                                                  | ✘                                             | ⁄         | ✓         | ✓         | ?         | ✓            |
| 作為 OAuth 2.0 provider    | [✓](https://github.com/go-gitea/gitea/pull/5378)   | ✘                                             | ✓         | ✓         | ✓         | ✓         | ✘            |
| 二次驗證 (2FA)             | ✓                                                  | ✓                                             | ✓         | ✓         | ✓         | ✓         | ✘            |
| 整合 Mattermost/Slack      | ✓                                                  | ✓                                             | ⁄         | ✓         | ✓         | ⁄         | ✓            |
| 整合 Discord               | ✓                                                  | ✓                                             | ✓         | ✓         | ✓         | ✘         | ✘            |
| 整合 Microsoft Teams       | ✓                                                  | ✘                                             | ✓         | ✓         | ✓         | ✓         | ✘            |
| 顯示外部 CI/CD 的狀態      | ✓                                                  | ✘                                             | ✓         | ✓         | ✓         | ✓         | ✓            |

[gitea-caddy-plugin]: https://github.com/42wim/caddy-gitea
[gitea-pages-server]: https://codeberg.org/Codeberg/pages-server
