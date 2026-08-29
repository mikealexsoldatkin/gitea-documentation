---
date: "2019-04-05T16:00:00+02:00"
slug: "faq"
sidebar_position: 5
aliases:
  - /zh-tw/faq
---

# 常見問題

此頁面包含一些常見問題和答案。

如需更多幫助資源，請查看所有[支援選項](help/support.md)。

## 1.x 和 1.x.x 下載之間的區別，如何獲取最新的穩定版本並修復錯誤？

以版本 1.20.x 為例。

在我們的[下載頁面](https://dl.gitea.com/gitea/)上，您將看到 1.20 目錄以及 1.20.0、1.20.1 目錄。

1.20 目錄是每次合併提交到 [`release/v1.20`](https://github.com/go-gitea/gitea/tree/release/v1.20) 分支時構建的夜間構建。

1.20.0 目錄是當 [`v1.20.0`](https://github.com/go-gitea/gitea/releases/tag/v1.20.0) 標籤建立時建立的發布構建。

夜間構建（1.x）下載將隨著提交合併到各自的分支而變化，它們包含在標籤發布之前的最新更改/修復。

如果錯誤修復針對 1.20.1，但 1.20.1 尚未發布，您可以獲取 "1.20-nightly" 構建以獲取錯誤修復。

## 如何找到設定文件 "app.ini"

這取決於您如何安裝 Gitea。如果您沒有手動設定自訂路徑或設定文件的路徑，那麼設定文件 (app.ini) 應該存在於 Gitea 工作路徑的 "custom/conf" 目錄中。一些套件供應商可能會使用 "/etc/gitea" 來儲存設定文件，而其他供應商則不會。

您可以透過檢查 Gitea 的啟動日誌或閱讀 Gitea 網站管理員 -> 設定摘要來手動查找設定文件 (app.ini)。

如果您使用的是一些隔離環境（如容器 docker），您看到的路徑通常不是主機文件系統中的實際路徑。在這種情況下，您需要檢查容器的文件系統卷映射並找出主機上設定文件的實際路徑。

<a id="where-does-gitea-store-what-file"></a>
## Gitea 儲存文件的位置

- _`AppWorkPath`_
  - `app.ini` 中的 `WORK_PATH` 選項
  - 否則 `--work-path` 標誌
  - 否則環境變量 `GITEA_WORK_DIR`
  - 否則在構建時設定的內置值
  - 否則包含 Gitea 二進制文件的目錄
- `AppDataPath`（預設為資料庫、索引器等）
  - `app.ini` 中的 `APP_DATA_PATH`
  - 否則 _`AppWorkPath`_`/data`
- _`CustomPath`_（自訂模板）
  - `--custom-path` 標誌
  - 否則環境變量 `GITEA_CUSTOM`
  - 否則在構建時設定的內置值
  - 否則 _`AppWorkPath`_`/custom`
- HomeDir
  - Unix：環境變量 `HOME`
  - Windows：環境變量 `USERPROFILE`，否則環境變量 `HOMEDRIVE`+`HOMEPATH`
- RepoRootPath
  - `app.ini` 中 \[repository] 部分的 `ROOT`（如果是絕對路徑）
  - 否則 _`AppWorkPath`_`/ROOT`（如果 `app.ini` 中 \[repository] 部分的 `ROOT` 是相對路徑）
  - 預設 `%(APP_DATA_PATH)/gitea-repositories`
- INI（設定文件）
  - `--config` 標誌
  - 構建時設定的可能內置值
  - 否則 _`CustomPath`_`/conf/app.ini`
- SQLite 資料庫
  - `app.ini` 中 `database` 部分的 `PATH`
  - 否則 `%(APP_DATA_PATH)/gitea.db`

## 看不到克隆 URL 或克隆 URL 不正確

有幾個地方可能會導致顯示不正確。

1. 如果使用反向代理，請確保您已按照[反向代理指南](../administration/reverse-proxies.md)中的正確指示進行操作
2. 確保您已正確設定 `app.ini` 中 `server` 部分的 `ROOT_URL`

如果某些克隆選項未顯示（HTTP/S 或 SSH），可以在 `app.ini` 中檢查以下選項

- `DISABLE_HTTP_GIT`：如果設定為 true，則不會有 HTTP/HTTPS 連接
- `DISABLE_SSH`：如果設定為 true，則不會有 SSH 連接
- `SSH_EXPOSE_ANONYMOUS`：如果設定為 false，則匿名使用者將隱藏 SSH 連接

## 文件上傳失敗：413 Request Entity Too Large

當反向代理限制文件上傳大小時，會出現此錯誤。

請參閱[反向代理指南](../administration/reverse-proxies.md)以獲取 nginx 的解決方案。

## 自訂模板未加載或工作不正確

Gitea 的自訂模板必須添加到正確的位置，否則 Gitea 將無法找到並使用它們。

模板的正確路徑將相對於 `CustomPath`

1. 要查找 `CustomPath`，請在網站管理 -> 設定中查找自訂文件根路徑
2. 如果您仍然無法找到路徑，可以在上面計算預設值
3. 一旦您找到了正確的自訂路徑，您可以參考[自訂 Gitea](../administration/customizing-gitea.md)頁面將模板添加到正確的位置。

## Gitea 是否有 "GitHub/GitLab pages" 功能？

Gitea 沒有內置的 Pages 伺服器。您需要一個專用域來提供靜態頁面以避免 CSRF 安全風險。

對於簡單的使用，您可以使用反向代理來重寫並從 Gitea 的原始文件 URL 提供靜態內容。

已經有可用的第三方服務，如獨立的[pages 伺服器](https://codeberg.org/Codeberg/pages-server)或[caddy 外掛](https://github.com/42wim/caddy-gitea)，可以提供所需的功能。

## 活躍使用者與禁止登入使用者

在 Gitea 中，“活躍”使用者是指通過電子郵件激活其帳戶的使用者。

“禁止登入”使用者是指不再允許登入 Gitea 的使用者

## 什麼是 Swagger？

[Swagger](https://swagger.io/) 是 Gitea 用於其 API 文件的工具。

所有 Gitea 實例都有內置的 API，無法完全禁用它。
但是，您可以透過在 `app.ini` 的 `api` 部分中設定 `ENABLE_SWAGGER` 為 `false` 來禁用顯示其文件。
有關更多資訊，請參閱 Gitea 的 [API 文件](development/api-usage.md)。

您可以在 https://gitea.com/api/swagger 上查看最新的 API（例如）

您還可以在 https://gitea.com/swagger.v1.json 上查看 `swagger.json` 文件的範例

## 調整您的伺服器以供公用/私用

### 防止垃圾郵件

有多種方法可以結合使用來防止垃圾郵件。

1. 通過白名單或黑名單某些電子郵件域
2. 通過僅白名單某些域與 OpenID（見下文）
3. 在 `app.ini` 中設定 `ENABLE_CAPTCHA` 為 `true` 並正確設定 `RECAPTCHA_SECRET` 和 `RECAPTCHA_SITEKEY`
4. 設定 `DISABLE_REGISTRATION` 為 `true` 並通過 [CLI](../administration/command-line.md)、[API](development/api-usage.md) 或 Gitea 的管理 UI 建立新使用者

### 只允許/阻止某些電子郵件域

您可以在 `app.ini` 的 `[service]` 部分中設定 `EMAIL_DOMAIN_WHITELIST` 或 `EMAIL_DOMAIN_BLOCKLIST`

### 只允許/阻止某些 OpenID 提供商

您可以在 `app.ini` 的 `[openid]` 部分中設定 `WHITELISTED_URIS` 或 `BLACKLISTED_URIS`

:::note
白名單優先，如果它不是空白的，則忽略黑名單。
:::

### 僅限問題使用者

目前的實現方式是建立/修改使用者，將其最大儲存庫建立限制設定為 0。

### 受限使用者

受限使用者僅限於根據其組織/團隊成員資格和協作關係訪問部分內容，忽略組織/儲存庫等的公共標誌。

範例用例：一家公司運行一個需要登入的 Gitea 實例。大多數儲存庫是公共的（所有同事都可以訪問/瀏覽）。

某個時候，客戶或第三方需要訪問特定儲存庫並且僅限於該儲存庫。將此類客戶帳戶設定為受限並使用團隊成員資格和/或協作關係授予所需的存取權限是一種簡單的方法，無需將所有內容設定為私有。

### 啟用 Fail2ban

使用 [Fail2Ban](../administration/fail2ban-setup.md) 監控並阻止基於日誌模式的自動登入嘗試或其他惡意行為

## SSHD 與內置 SSH

SSHD 是大多數 Unix 系統上的內置 SSH 伺服器。

Gitea 也提供了自己的 SSH 伺服器，用於 SSHD 不可用時使用。

## 翻譯不正確/如何添加更多翻譯

我們的翻譯目前在我們的 [Crowdin 專案](https://crowdin.com/project/gitea) 上進行群眾外包

無論您是想更改翻譯還是添加新翻譯，都需要在那裡進行，因為所有翻譯都會在我們的 CI 中通過 Crowdin 整合進行覆蓋。

## 推送 Hook / Webhook / Actions 未運行

如果您可以推送但在主頁面板上看不到推送活動，或者推送未觸發 webhook 和 Actions 工作流，這可能是 git hooks 未正常工作。

有幾種可能性：

1. git hooks 不同步：在網站管理面板上運行“重新同步所有儲存庫的 pre-receive、update 和 post-receive hooks”
2. git 儲存庫（和 hooks）儲存在某些文件系統上（例如由 NAS 掛載）不支援腳本執行，確保文件系統支援 `chmod a+x any-script`
3. 如果您使用 docker，確保 Docker 伺服器（不是客戶端）>= 20.10.6

## SSH 問題

如果您無法通過 `ssh` 訪問儲存庫，但 `https` 正常工作，請考慮查看以下內容。

首先，確保您可以透過 SSH 訪問 Gitea。

`ssh git@myremote.example`

如果連接成功，您應該會收到如下錯誤消息：

```
Hi there, You've successfully authenticated, but Gitea does not provide shell access.
If this is unexpected, please log in with password and setup Gitea under another user.
```

如果您沒有收到上述消息但仍然連接，這意味著您的 SSH 密鑰**未**由 Gitea 管理。這意味著 hooks 不會運行，還有其他潛在問題。

如果您無法連接，您的 SSH 密鑰可能在本地設定不正確。
這是特定於 SSH 而不是 Gitea 的問題，因此不在此處涵蓋。

### SSH 常見錯誤

```
Permission denied (publickey).
fatal: Could not read from remote repository.
```

此錯誤表示伺服器拒絕了登入嘗試，請檢查以下內容：

- 在客戶端：
  - 確保公鑰和私鑰已添加到正確的 Gitea 使用者。
  - 確保遠程 URL 中沒有問題。特別是，確保 Git 使用者名稱（在 `@` 之前）拼寫正確。
  - 確保客戶端機器上的公鑰和私鑰正確。
- 在伺服器上：

  - 確保儲存庫存在並且名稱正確。
  - 檢查系統使用者主目錄中 `.ssh` 目錄的權限。
  - 驗證正確的公鑰已添加到 `.ssh/authorized_keys`。

    嘗試在 Gitea 管理面板上運行“重寫 '.ssh/authorized_keys' 文件（用於 Gitea SSH 密鑰）”。

  - 閱讀 Gitea 日誌。
  - 閱讀 /var/log/auth（或類似）。
  - 檢查儲存庫的權限。

以下是缺少公鑰的範例，其中身份驗證成功，但某些其他設定阻止 SSH 訪問正確的儲存庫。

```
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

在這種情況下，請查看以下設定：

- 在伺服器上：
  - 確保 `git` 系統使用者設定了可用的 shell
    - 使用 `getent passwd git | cut -d: -f7` 驗證
    - 可以使用 `usermod` 或 `chsh` 進行修改。
  - 確保 `.ssh/authorized_keys` 中的 `gitea serv` 命令使用正確的設定文件。

## 遷移帶有標籤的儲存庫後缺少發布

要遷移帶有所有標籤的儲存庫，您需要做兩件事：

- 將標籤推送到儲存庫：

```
 git push --tags
```

- 在 Gitea 中（重新）同步所有儲存庫的標籤：

```
gitea admin repo-sync-releases
```

## 如何在啟動 Gitea 之前建立使用者

Gitea 提供了一個子命令 `gitea migrate` 來初始化資料庫，之後您可以使用 [admin CLI 命令](../administration/command-line.md#admin) 像正常一樣添加使用者。

## 如何啟用密碼重置

沒有密碼重置的設定。當設定了[郵件服務](../administration/email-setup.md)時，它會啟用，否則禁用。

## 如何更改使用者的密碼

- 作為**管理員**，您可以更改任何使用者的密碼（並可選擇強制他們在下次登入時更改）...

  - 通過導航到您的 `網站管理 -> 用戶帳戶` 頁面並編輯使用者。
  - 通過使用 [admin CLI 命令](../administration/command-line.md#admin)。

    請記住，大多數命令還需要一個[全域標誌](../administration/command-line.md#global-options)來指向正確的設定。

- 作為**使用者**，您可以更改它...

  - 在您的帳戶 `設置 -> 帳戶` 頁面（此方法**需要**您知道當前密碼）。
  - 通過使用 `忘記密碼` 連結。

    如果 `忘記密碼/帳戶恢復` 頁面被禁用，請聯繫您的管理員設定[郵件服務](../administration/email-setup.md)。

## 資料庫啟動期間有關結構預設值的警告

有時在進行遷移時，舊列和預設值可能會保留在資料庫模式中。這可能會導致如下警告：

```
2020/08/02 11:32:29 ...rm/session_schema.go:360:Sync() [W] Table user Column keep_activity_private db default is , struct default is 0
```

這些警告可以安全地忽略，但您可以透過讓 Gitea 重新建立這些表來停止這些警告：

```
gitea doctor recreate-table user
```

這將使 Gitea 重新建立使用者表並將舊資料複製到新表中，並適當設定預設值。

您可以讓 Gitea 重新建立多個表：

```
gitea doctor recreate-table table1 table2 ...
```

如果您希望 Gitea 重新建立所有表，只需調用：

```
gitea doctor recreate-table
```

強烈建議在運行這些命令之前備份您的
