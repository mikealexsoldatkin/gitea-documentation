---
date: "2023-05-25T16:00:00+02:00"
slug: "faq"
sidebar_position: 5
aliases:
  - /zh-tw/faq
---

# 常見問題

本頁面包含一些常見問題和答案。

有關更多幫助資源，請查看所有[支援選項](help/support.md)。

## 1.x 和 1.x.x 下載之間的區別

以 1.7.x 版本為例。

**注意：**此範例也適用於 Docker 鏡像！

在我們的[下載頁面](https://dl.gitea.com/gitea/)上，您會看到一個 1.7 目錄，以及 1.7.0、1.7.1、1.7.2、1.7.3、1.7.4、1.7.5 和 1.7.6 的目錄。

1.7 目錄和 1.7.0 目錄是**不同**的。1.7 目錄是在每個合併到[`release/v1.7`](https://github.com/go-gitea/gitea/tree/release/v1.7)分支的提交上構建的。

然而，1.7.0 目錄是在建立[`v1.7.0`](https://github.com/go-gitea/gitea/releases/tag/v1.7.0)標籤時建立的構建。

這意味著 1.x 的下載會隨著提交合併到各自的分支而改變（將其視為每個版本的單獨的“main”分支）。

另一方面，1.x.x 的下載應該永遠不會改變。

## 如何從 Gogs/GitHub 等遷移到 Gitea

要從 Gogs 遷移到 Gitea：

- [Gogs 版本 0.11.46.0418](https://github.com/go-gitea/gitea/issues/4286)

要從 GitHub 遷移到 Gitea，您可以使用 Gitea 內置的遷移表單。

為了遷移諸如問題、拉取請求等專案，您需要至少輸入您的使用者名稱。

[Example (requires login)](https://demo.gitea.com/repo/migrate)

要從 GitLab 遷移到 Gitea，您可以使用這個非關聯的工具：

https://github.com/loganinak/MigrateGitlabToGogs

<a id="where-does-gitea-store-what-file"></a>
<a id="Gitea儲存文件的位置"></a>
## Gitea 儲存文件的位置

- _`AppWorkPath`_
  - `--work-path`標誌
  - 或者環境變量`GITEA_WORK_DIR`
  - 或者在構建時設定的內置值
  - 或者包含 Gitea 二進制文件的目錄
- `%(APP_DATA_PATH)`（資料庫、索引器等的預設路徑）
  - `app.ini`中的`APP_DATA_PATH`
  - 或者*`AppWorkPath`*`/data`
- _`CustomPath`_（自訂模板）
  - `--custom-path`標誌
  - 或者環境變量`GITEA_CUSTOM`
  - 或者在構建時設定的內置值
  - 或者*`AppWorkPath`*`/custom`
- HomeDir
  - Unix：環境變量`HOME`
  - Windows：環境變量`USERPROFILE`，或者環境變量`HOMEDRIVE`+`HOMEPATH`
- RepoRootPath
  - `app.ini`中\[repository]部分的`ROOT`（如果是絕對路徑）
  - 否則*`AppWorkPath`*`/ROOT`(如果`app.ini`中\[repository]部分的`ROOT`是相對路徑）
  - 預設值為`%(APP_DATA_PATH)/gitea-repositories`
- INI（設定文件）
  - `--config`標誌
  - 或者在構建時設定的可能內置值
  - 或者 _`CustomPath`_`/conf/app.ini`
- SQLite 資料庫
  - app.ini 中 database 部分的 PATH
  - 或者`%(APP_DATA_PATH)/gitea.db`

## 看不到克隆 URL 或克隆 URL 不正確

有幾個地方可能會導致顯示不正確。

1. 如果使用反向代理，請確保按照[反向代理指南](../administration/reverse-proxies.md)中的正確說明進行設定。
2. 確保在`app.ini`的`server`部分中正確設定了`ROOT_URL`。

如果某些克隆選項未顯示（HTTP/S 或 SSH），可以在`app.ini中`

- `DISABLE_HTTP_GIT`: 如果設為 true, 將會沒有 HTTP/HTTPS 鏈接
- `DISABLE_SSH`: 如果設為 true, 將會沒有 SSH 鏈接
- `SSH_EXPOSE_ANONYMOUS`: 如果設為 false, SSH 鏈接將會對匿名使用者隱藏

## 文件上傳失敗：413 Request Entity Too Large

當反向代理限制文件上傳大小時，會出現此錯誤。

有關使用 nginx 解決此問題，請參閱[反向代理指南](../administration/reverse-proxies.md)。

## 自訂模板無法加載或運行錯誤

Gitea 的自訂模板必須將其添加到正確的位置，否則 Gitea 將無法找到並使用自訂模板。

模板的正確路徑應該相對於`CustomPath`。

1. 要找到`CustomPath`，請在站點管理 -> 設定 中查找自訂文件根路徑。

   如果找不到，請嘗試`echo $GITEA_CUSTOM`。

2. 如果仍然找不到，預設值可以被計算
3. 如果仍然找不到路徑，則可以參考[自訂 Gitea](../administration/customizing-gitea.md)頁面，將模板添加到正確的位置。

## Gitea 是否有"GitHub/GitLab Pages"功能？

Gitea 不提供內置的 Pages 伺服器。您需要一個專用的域名來提供靜態頁面，以避免 CSRF 安全風險。

對於簡單的用法，您可以使用反向代理來重寫和提供 Gitea 的原始文件 URL 中的靜態內容。

還有一些已經可用的第三方服務，比如獨立[pages server](https://codeberg.org/Codeberg/pages-server)的或[caddy plugin](https://github.com/42wim/caddy-gitea)，可以提供所需的功能。

## 活躍使用者與禁止登入使用者

在 Gitea 中，"活躍使用者"是指通過電子郵件激活其帳戶的使用者。

"禁止登入使用者"是指不允許再登入到 Gitea 的使用者。

## 設定日誌記錄

- [官方文件](../administration/logging-config.md)

## 什麼是 Swagger？

[Swagger](https://swagger.io/) 是 Gitea 用於其 API 文件的工具。

所有 Gitea 實例都有內置的 API，無法完全禁用它。
但是，您可以在 app.ini 的 api 部分將 ENABLE_SWAGGER 設定為 false，以禁用其文件顯示。
有關更多資訊，請參閱 Gitea 的[API 文件](development/api-usage.md)。

您可以在上查看最新的 API（例如）https://gitea.com/api/swagger

您還可以在上查看`swagger.json`文件的範例 https://gitea.com/swagger.v1.json

## 調整伺服器用於公共/私有使用

### 防止垃圾郵件發送者

有多種方法可以組合使用來防止垃圾郵件發送者：

1. 通過設定電子郵件域名的白名單或黑名單。
2. 通過設定一些域名或者 OpenID 白名單（見下文）。
3. 在您的`app.ini`中將`ENABLE_CAPTCHA`設定為`true`，並正確設定`RECAPTCHA_SECRET`和 `RECAPTCHA_SITEKEY`。
4. 將`DISABLE_REGISTRATION`設定為`true`，並通過 [CLI](../administration/command-line.md)、[API](development/api-usage.md) 或 Gitea 的管理介面建立新使用者。

### 僅允許/阻止特定的電子郵件域名

您可以在`app.ini`中的`[service]`下的設定`EMAIL_DOMAIN_WHITELIST` 或 `EMAIL_DOMAIN_BLOCKLIST`。

### 僅允許/阻止特定的 OpenID 提供商

您可以在`app.ini`的`[openid]`下設定`WHITELISTED_URI`或`BLACKLISTED_URIS`。

**注意**： 白名單優先，如果白名單非空，則忽略黑名單。

### 僅允許發佈問題的使用者

目前實現這一點的方法是建立/修改一個具有最大存放庫建立限制為 0 的使用者。

### 受限制的使用者

受限制的使用者僅能訪問其組織/團隊成員和協作所在的內容的子集，而忽略組織/存放庫等的公共標誌。

範例用例：一個公司運行一個需要登入的 Gitea 實例。大多數存放庫是公開的（所有同事都可以訪問/瀏覽）。

在某些情況下，某個客戶或第三方需要訪問特定的存放庫，並且只能訪問該存放庫。通過將此類客戶帳戶設定為受限制帳戶，並使用團隊成員身份和/或協作來授予所需的任何存取權限，可以簡單地實現這一點，而無需使所有內容都變為私有。

### 啟用 Fail2ban

使用 [Fail2Ban](../administration/fail2ban-setup.md) 監視並阻止基於日誌模式的自動登入嘗試或其他惡意行為。

## SSHD vs 內建 SSH

SSHD 是大多數 Unix 系統上內建的 SSH 伺服器。

Gitea 還提供了自己的 SSH 伺服器，用於在 SSHD 不可用時使用。

## Gitea 運行緩慢

導致此問題的最常見原因是加載聯合頭像。

您可以透過在`app.ini`中將`ENABLE_FEDERATED_AVATAR`設定為`false`來關閉此功能。

還有一個可能需要更改的選項是在`app.ini`中將`DISABLE_GRAVATAR`設定為`true`。

## 無法建立存放庫/文件

請確保 Gitea 具有足夠的權限來寫入其主目錄和資料目錄。

參見AppDataPath 和 RepoRootPath

**適用於 Arch 使用者的注意事項：**在撰寫本文時，Arch 套件的 systemd 文件包含了以下行：

`ReadWritePaths=/etc/gitea/app.ini`

這將使得 Gitea 無法寫入其他路徑。

## 翻譯不正確/如何添加更多翻譯

我們當前的翻譯是在我們的[Crowdin 專案](https://crowdin.com/project/gitea)上眾包進行的

無論您想要更改翻譯還是添加新的翻譯，都需要在 Crowdin 整合中進行，因為所有翻譯都會被 CI 覆蓋。

## 推送鉤子/ Webhook / Actions 未運行

如果您可以推送但無法在主頁儀表板上看到推送活動，或者推送不觸發 Webhook 和 Actions，可能是 git 鉤子不工作而導致的。

這可能是由於以下原因：

1. Git 鉤子不同步：在站點管理面板上運行“重新同步所有存放庫的 pre-receive、update 和 post-receive 鉤子”
2. Git 存放庫（和鉤子）儲存在一些不支援腳本執行的文件系統上（例如由 NAS 掛載），請確保文件系統支援`chmod a+x any-script`
3. 如果您使用的是 Docker，請確保 Docker Server（而不是客戶端）的版本 >= 20.10.6

## SSH 問題

如果無法通過`ssh`訪問存放庫，但`https`正常工作，請考慮以下情況。

首先，請確保您可以透過 SSH 訪問 Gitea。

`ssh git@myremote.example`

如果連接成功，您應該會收到以下錯誤消息：

```
Hi there, You've successfully authenticated, but Gitea does not provide shell access.
If this is unexpected, please log in with password and setup Gitea under another user.
```

如果您收到以上消息但仍然連接成功，這意味著您的 SSH 密鑰**沒有**由 Gitea 管理。這意味著鉤子不會運行，在其他一些潛在問題中也包括在內。

如果您無法連接，可能是因為您的 SSH 密鑰在本地設定不正確。
這是針對 SSH 而不是 Gitea 的問題，因此在此不涉及。

### SSH 常見錯誤

```
Permission denied (publickey).
fatal: Could not read from remote repository.
```

此錯誤表示伺服器拒絕登入嘗試，
請檢查以下事項：

- 在客戶端：
  - 確保公鑰和私鑰已添加到正確的 Gitea 使用者。
  - 確保遠程 URL 中沒有任何問題。特別是，請確保 ∂
    Git 使用者（@ 之前的部分）的名稱拼寫正確。
  - 確保客戶端機器上的公鑰和私鑰正確無誤。
- 在伺服器上：

  - 確保儲存庫存在並且命名正確。
  - 檢查系統使用者主目錄中的 `.ssh` 目錄的權限。
  - 驗證正確的公鑰是否已添加到 `.ssh/authorized_keys` 中。

  嘗試在 Gitea 管理面板上運行
  `Rewrite '.ssh/authorized_keys' file (for Gitea SSH keys)`。

- 查看 Gitea 日誌。
- 查看 /var/log/auth（或類似的文件）。
- 檢查儲存庫的權限。

以下是一個範例，其中缺少公共 SSH 密鑰，
認證成功，但是其他設定導致 SSH 無法訪問正確的
儲存庫。

```
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

在這種情況下，請檢查以下設定：

- 在伺服器上：
  - 確保`git`系統使用者設定了可用的 shell
    - 使用`getent passwd git | cut -d: -f7`進行驗證
    - 可以使用`usermod`或`chsh`進行修改。
  - 確保`.ssh/authorized_keys`中的`gitea serv`命令使用
    正確的設定文件。

## 遷移帶有標籤的儲存庫後缺失發佈版本

要遷移帶有所有標籤的儲存庫，您需要執行兩個操作：

- 推送標籤到儲存庫：

```
 git push --tags
```

- 在 Gitea 中重新同步所有儲存庫的標籤：

```
gitea admin repo-sync-releases
```

## LFS 問題

針對涉及 LFS 資料上傳的問題

```
batch response: Authentication required: Authorization error: <GITEA_LFS_URL>/info/lfs/objects/batch
Check that you have proper access to the repository
error: failed to push some refs to '<GIT_REPO_URL>'
```

檢查`app.ini`文件中的`LFS_HTTP_AUTH_EXPIRY`值。

預設情況下，LFS 令牌在 20 分鐘後過期。如果您的連接速度較慢或文件較大（或兩者都是），可能無法在時間限制內完成上傳。

您可以將此值設定為`60m`或`120m`。

## 如何在啟動 Gitea 之前建立使用者

Gitea 提供了一個子命令`gitea migrate`來初始化資料庫，然後您可以使用[管理 CLI 命令](../administration/command-line.md#admin)像正常情況下添加使用者。

## 如何啟用密碼重置

沒有密碼重置的設定。當設定了[郵件服務](../administration/email-setup.md)時，密碼重置將自動啟用；否則將被禁用。

## 如何更改使用者的密碼

- 作為管理員，您可以更改任何使用者的密碼（並可選擇強制其在下次登入時更改密碼）...
  - 轉到您的`站點管理 -> 使用者賬戶`頁面並編輯使用者。
- 使用[管理 CLI 命令](../administration/command-line.md#admin)。

  請注意，大多數命令還需要一個[全域標誌](../administration/command-line.md#全域選項)來指向正確的設定。

- 作為**使用者**，您可以更改密碼...

  - 在您的帳號的`設定 -> 帳號`頁面（此方法**需要**您知道當前密碼）。
  - 使用`忘記密碼`鏈接。

  如果`忘記密碼/賬戶恢復`頁面被禁用，請聯繫管理員設定[郵件服務](../administration/email-setup.md)。

## 為什麼我的 Markdown 顯示錯誤

在 Gitea 版本 `1.11` 中，我們轉換為使用[goldmark](https://github.com/yuin/goldmark)進行 Markdown 渲染，它符合[CommonMark](https://commonmark.org/)標準。

如果您在版本`1.11`之前的 Markdown 正常工作，但在升級後無法正常工作，請仔細閱讀 CommonMark 規範，看看問題是由錯誤還是非相容的語法引起的。

如果是後者，通常規範中會列出一種符合標準的替代方法。

## 使用 MySQL 進行升級時出現的錯誤

如果在使用 MySQL 升級 Gitea 時收到以下錯誤：

> `ORM engine initialization failed: migrate: do migrate: Error: 1118: Row size too large...`

請運行 `gitea doctor convert` 或對資料庫中的每個表運行 `ALTER TABLE table_name ROW_FORMAT=dynamic;`。

潛在問題是預設行格式分配給每個表的索引空間
太小。Gitea 要求其表的`ROWFORMAT`為`DYNAMIC`。

如果收到包含`Error 1071: Specified key was too long; max key length is 1000 bytes...`
的錯誤行，則表示您正在嘗試在使用 ISAM 引擎的表上運行 Gitea。儘管在先前版本的 Gitea 中可能是湊巧能夠工作的，但它從未得到官方支援，
您必須使用 InnoDB。您應該對資料庫中的每個表運行`ALTER TABLE table_name ENGINE=InnoDB;`。

## 為什麼 Emoji 只顯示佔位符或單色圖像

Gitea 需要系統或瀏覽器安裝其中一個受支援的 Emoji 字體，例如 Apple Color Emoji、Segoe UI Emoji、Segoe UI Symbol、Noto Color Emoji 和 Twemoji Mozilla。通常，操作系統應該已經提供了其中一個字體，但特別是在 Linux 上，可能需要手動安裝它們。

## SystemD 和 Docker 上的標準輸出日誌

SystemD 上的標準輸出預設會寫入日誌記錄中。您可以嘗試使用 `journalctl`、`journalctl -u gitea` 或 `journalctl <path-to-gitea-binary>`來查看。

類似地，Docker 上的標準輸出可以使用`docker logs <container>`來查看。

要收集日誌以進行幫助和問題報告，請參閱[支援選項](help/support.md)。

## 初始日誌記錄

在 Gitea 讀取設定文件並設定其日誌記錄之前，它會將一些內容記錄到標準輸出，以幫助調試日誌記錄無法工作的情況。

您可以透過設定`--quiet`或`-q`選項來停止此日誌記錄。請注意，這只會在 Gitea 設定自己的日誌記錄之前停止日誌記錄。

如果您報告了錯誤或問題，必須提供這些資訊以恢復初始日誌記錄。

只有在完全設定了所有內容之後，您才應該設定此選項。

## 在資料庫啟動期間出現有關結構預設值的警告

有時，在遷移過程中，舊列和預設值可能在資料庫架構中保持不變。
這可能會導致警告，例如：

```
2020/08/02 11:32:29 ...rm/session_schema.go:360:Sync() [W] Table user Column keep_activity_private db default is , struct default is 0
```

可以安全地忽略這些警告，但您可以透過讓 Gitea 重新建立這些表來停止這些警告，使用以下命令：

```
gitea doctor recreate-table user
```

這將導致 Gitea 重新建立使用者表並將舊資料複製到新表中，
並正確設定預設值。

您可以使用以下命令要求 Gitea 重新建立多個表：

```
gitea doctor recreate-table table1 table2 ...
```

如果您希望 Gitea 重新建立所有表，請使用以下命令：

```
gitea doctor recreate-table
```

在運行這些命令之前，強烈建議您備份資料庫。

## 為什麼查看文件時製表符/縮進顯示錯誤

如果您正在使用 Cloudflare，請在儀表板中關閉自動縮小選項。

`Speed` -> `Optimization` -> 在 `Auto-Minify` 設定中取消選中 `HTML`。

## 如何從硬碟採用儲存庫

- 將您的（裸）儲存庫添加到正確的位置，即您的設定所在的地方（`repository.ROOT`），確保它們位於正確的佈局`<REPO_ROOT>/[user]/[repo].git`。
  - **注意：**目錄名必須為小寫。
  - 您還可以在`<ROOT_URL>/admin/config`中檢查儲存庫根路徑。
- 確保存在要採用儲存庫的使用者/組織。
- 作為管理員，轉到`<ROOT_URL>/admin/repos/unadopted`並搜索。
- 使用者也可以透過設定[`ALLOW_ADOPTION_OF_UNADOPTED_REPOSITORIES`](../administration/config-cheat-sheet.md#存放庫-repository) 獲得類似的權限。
- 如果上述步驟都正確執行，您應該能夠選擇要採用的儲存庫。
  - 如果沒有找到儲存庫，請啟用[調試日誌記錄](../administration/config-cheat-sheet.md#存放庫-repository)以檢查是否有特定錯誤。
