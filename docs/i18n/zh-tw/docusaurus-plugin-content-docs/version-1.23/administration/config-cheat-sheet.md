---
date: "2016-12-26T16:00:00+02:00"
slug: "config-cheat-sheet"
sidebar_position: 30
aliases:
  - /zh-tw/config-cheat-sheet
---

# 設定備忘單

這是一份 Gitea 設定文件的備忘單。它包含了大多數可以設定的設定以及它們的預設值。

對 Gitea 設定文件的任何更改應該在 `custom/conf/app.ini` 或任何相應的位置進行。從發行版安裝時，通常會在 `/etc/gitea/conf/app.ini` 中找到。

這裡提供的預設值是最佳努力（不是自動生成的）。它們在 [app.example.ini](https://github.com/go-gitea/gitea/blob/main/custom/conf/app.example.ini) 中準確記錄（s/main/\<tag|release\>）。任何格式為 `%(X)s` 的字符串都是由 [ini](https://github.com/go-ini/ini/#recursive-values) 提供的功能，用於遞歸讀取值。

在下面的預設值中，形式為 `$XYZ` 的值指的是環境變量。（但是，請參閱 `environment-to-ini`。）形式為 _`XxYyZz`_ 的值指的是作為預設設定一部分列出的值。這些符號形式不會在您自己的 `app.ini` 文件中工作，僅在此處作為文件列出。

包含 `#` 或 `;` 的值必須使用 `` ` `` 或 `"""` 引號。

:::info
Gitea 設定更改需要完全重啟才能生效。
:::

## 預設設定（非 `app.ini` 設定）

這些值是環境依賴的，但構成了許多值的基礎。它們將在運行 `gitea help` 或啟動時作為預設設定的一部分報告。它們在那裡發出的順序略有不同，但我們將在這裡按設定順序列出它們。

- _`AppPath`_：這是運行 gitea 二進制文件的絕對路徑。
- _`AppWorkPath`_：這指的是 `gitea` 二進制文件的“工作路徑”。它是通過使用以下層次結構中的第一個設定來確定的：
  - `app.ini` 中的 `WORK_PATH` 選項
  - 傳遞給二進制文件的 `--work-path` 標誌
  - 環境變量 `$GITEA_WORK_DIR`
  - 構建時設定的內置值（請參閱從源程式碼構建）
  - 否則，它預設為 _`AppPath`_ 的目錄
  - 如果上述任何一個是相對路徑，則它們將相對於 _`AppPath`_ 的目錄變為絕對路徑
- _`CustomPath`_：這是自訂模板和其他選項的基本目錄。
  它是通過使用以下層次結構中的第一個設定來確定的：
  - 傳遞給二進制文件的 `--custom-path` 標誌
  - 環境變量 `$GITEA_CUSTOM`
  - 構建時設定的內置值（請參閱從源程式碼構建）
  - 否則，它預設為 _`AppWorkPath`_`/custom`
  - 如果上述任何一個是相對路徑，則它們將相對於 _`AppWorkPath`_ 的目錄變為絕對路徑
- _`CustomConf`_：這是 `app.ini` 文件的路徑。
  - 傳遞給二進制文件的 `--config` 標誌
  - 構建時設定的內置值（請參閱從源程式碼構建）
  - 否則，它預設為 _`CustomPath`_`/conf/app.ini`
  - 如果上述任何一個是相對路徑，則它們將相對於 _`CustomPath`_ 的目錄變為絕對路徑

此外，還有 _`StaticRootPath`_，可以在構建時設定為內置值，但否則預設為 _`AppWorkPath`_

## 總體（`DEFAULT`）

- `APP_NAME`：**Gitea: Git with a cup of tea**：應用程式名稱，用於頁面標題。
- `RUN_USER`：**_當前操作系統使用者名稱_/`$USER`/`$USERNAME` 例如 git**：Gitea 將以此使用者運行。
  這應該是一個專用的系統（非使用者）帳戶。不正確設定此項將導致 Gitea 無法啟動。
- `RUN_MODE`：**prod**：應用程式運行模式，影響性能和調試：`dev` 或 `prod`，預設為 `prod`。模式 `dev` 使 Gitea 更易於開發和調試，除 `dev` 以外的值被視為 `prod`，適用於生產使用。
- `WORK_PATH`：**_the-work-path_**：工作目錄，請參閱上面的 AppWorkPath 註釋。

<a id="repository-repository"></a>
## 儲存庫（`repository`）

- `ROOT`：**%(APP_DATA_PATH)s/gitea-repositories**：儲存所有儲存庫資料的根路徑。
  相對路徑解釋為 **_`AppWorkPath`_/%(ROOT)s**。
- `SCRIPT_TYPE`：**bash**：此伺服器支援的腳本類型。通常這是 `bash`，
  但有些使用者報告只有 `sh` 可用。
- `DETECTED_CHARSETS_ORDER`：**UTF-8, UTF-16BE, UTF-16LE, UTF-32BE, UTF-32LE, ISO-8859, windows-1252, ISO-8859, windows-1250, ISO-8859, ISO-8859, ISO-8859, windows-1253, ISO-8859, windows-1255, ISO-8859, windows-1251, windows-1256, KOI8-R, ISO-8859, windows-1254, Shift_JIS, GB18030, EUC-JP, EUC-KR, Big5, ISO-2022, ISO-2022, ISO-2022, IBM424_rtl, IBM424_ltr, IBM420_rtl, IBM420_ltr**：檢測到的字符集的優先順序 - 如果檢測到的字符集具有相同的置信度，則列表中較早的字符集將優先於較晚的字符集。添加 `defaults` 將在該點放置未命名的字符集。
- `ANSI_CHARSET`：**_empty_**：預設的 ANSI 字符集，用於覆蓋非 UTF-8 字符集。
- `FORCE_PRIVATE`：**false**：強制每個新儲存庫為私有。
- `DEFAULT_PRIVATE`：**last**：建立新儲存庫時的預設私有設定。
  \[last, private, public\]
- `DEFAULT_PUSH_CREATE_PRIVATE`：**true**：使用推送建立時的預設私有設定。
- `MAX_CREATION_LIMIT`：**-1**：每個使用者的全域最大建立限制，
  `-1` 表示無限制。
- `PREFERRED_LICENSES`：**Apache License 2.0,MIT License**：首選許可證，放在列表頂部。名稱必須與 options/license 或 custom/options/license 中的文件名匹配。
- `DISABLE_HTTP_GIT`：**false**：禁用通過 HTTP 協議與儲存庫交互的功能。
- `USE_COMPAT_SSH_URI`：**false**：在使用預設 SSH 端口時強制使用 ssh:// 克隆 URL 而不是 scp 風格的 URI。
- `GO_GET_CLONE_URL_PROTOCOL`：**https**：`go get` 請求返回儲存庫 URL 的協議，預設為 https。
- `ACCESS_CONTROL_ALLOW_ORIGIN`：**_empty_**：Access-Control-Allow-Origin 標頭的值，
  預設不顯示。

  :::warning
  如果您未給出正確的值，這可能對您的網站有害。
  :::

- `DEFAULT_CLOSE_ISSUES_VIA_COMMITS_IN_ANY_BRANCH`：**false**：如果非預設分支上的提交標記為已關閉，則關閉問題。
- `ENABLE_PUSH_CREATE_USER`：**false**：允許使用者將本地儲存庫推送到 Gitea 並自動為使用者建立它們。
- `ENABLE_PUSH_CREATE_ORG`：**false**：允許使用者將本地儲存庫推送到 Gitea 並自動為組織建立它們。
- `DISABLED_REPO_UNITS`：**_empty_**：全域禁用的儲存庫單元的逗號分隔列表。允許的值：\[repo.issues, repo.ext_issues, repo.pulls, repo.wiki, repo.ext_wiki, repo.projects, repo.packages, repo.actions\]
- `DEFAULT_REPO_UNITS`：**repo.code,repo.releases,repo.issues,repo.pulls,repo.wiki,repo.projects,repo.packages,repo.actions**：預設的新儲存庫單元的逗號分隔列表。允許的值：\[repo.code, repo.releases, repo.issues, repo.pulls, repo.wiki, repo.projects, repo.packages, repo.actions\]。注意：目前無法停用程式碼和版本。如果您指定預設儲存庫單元，您應該仍然列出它們以確保未來的相容性。外部 wiki 和問題跟蹤器無法預設啟用，因為它需要額外的設定。無論是否在預設列表中，禁用的儲存庫單元都不會添加到新儲存庫中。
- `DEFAULT_FORK_REPO_UNITS`：**repo.code,repo.pulls**：預設的分叉儲存庫單元的逗號分隔列表。允許的值和規則與 `DEFAULT_REPO_UNITS` 相同。
- `DEFAULT_MIRROR_REPO_UNITS`：**repo.code,repo.releases,repo.issues,repo.wiki,repo.projects,repo.packages**：預設的鏡像儲存庫單元的逗號分隔列表。允許的值和規則與 `DEFAULT_REPO_UNITS` 相同。
- `DEFAULT_TEMPLATE_REPO_UNITS`：**repo.code,repo.releases,repo.issues,repo.pulls,repo.wiki,repo.projects,repo.packages**：預設的模板儲存庫單元的逗號分隔列表。允許的值和規則與 `DEFAULT_REPO_UNITS` 相同。
- `PREFIX_ARCHIVE_FILES`：**true**：通過將它們放在以儲存庫命名的目錄中來為存檔文件添加前綴。
- `DISABLE_MIGRATIONS`：**false**：禁用遷移功能。
- `DISABLE_STARS`：**false**：禁用星標功能。
- `DEFAULT_BRANCH`：**main**：所有儲存庫的預設分支名稱。
- `ALLOW_ADOPTION_OF_UNADOPTED_REPOSITORIES`：**false**：允許非管理員使用者採用未採用的儲存庫
- `ALLOW_DELETION_OF_UNADOPTED_REPOSITORIES`：**false**：允許非管理員使用者刪除未採用的儲存庫
- `DISABLE_DOWNLOAD_SOURCE_ARCHIVES`：**false**：不允許從 UI 下載源程式碼存檔文件
- `ALLOW_FORK_WITHOUT_MAXIMUM_LIMIT`：**true**：允許無最大數量限制的分叉儲存庫

### 儲存庫 - 編輯器（`repository.editor`）

- `LINE_WRAP_EXTENSIONS`：**.txt,.md,.markdown,.mdown,.mkd,.livemd,**：在 Monaco 編輯器中應換行的文件擴展名列表。用逗號分隔擴展名。要換行沒有擴展名的文件，只需放置一個逗號
- `PREVIEWABLE_FILE_MODES`：**markdown**：具有預覽 API 的有效文件模式，例如 `api/v1/markdown`。用逗號分隔值。如果文件擴展名不匹配，則不會顯示編輯模式中的預覽選項卡。

### 儲存庫 - 拉取請求（`repository.pull-request`）

- `WORK_IN_PROGRESS_PREFIXES`：**WIP:,\[WIP\]**：用於拉取請求標題中標記為進行中的前綴列表。這些是大小寫不敏感的匹配。
- `CLOSE_KEYWORDS`：**close**, **closes**, **closed**, **fix**, **fixes**, **fixed**, **resolve**, **resolves**, **resolved**：用於拉取請求評論中自動關閉相關問題的關鍵字列表
- `REOPEN_KEYWORDS`：**reopen**, **reopens**, **reopened**：用於拉取請求評論中自動重新打開相關問題的關鍵字列表
- `DEFAULT_MERGE_STYLE`：**merge**：設定儲存庫建立的預設合併樣式，有效選項：`merge`, `rebase`, `rebase-merge`, `squash`, `fast-forward-only`
- `DEFAULT_MERGE_MESSAGE_COMMITS_LIMIT`：**50**：在預設的合併消息中，包含最多這麼多的提交。設定為 `-1` 以包含所有提交
- `DEFAULT_MERGE_MESSAGE_SIZE`：**5120**：在預設的合併消息中，限制提交消息的大小。設定為 `-1` 以無限制。僅在 `POPULATE_SQUASH_COMMENT_WITH_COMMIT_MESSAGES` 為 `true` 時使用。
- `DEFAULT_MERGE_MESSAGE_ALL_AUTHORS`：**false**：在預設的合併消息中，遍歷所有提交以包含所有作者，否則僅使用有限列表中的作者
- `DEFAULT_MERGE_MESSAGE_MAX_APPROVERS`：**10**：在預設的合併消息中，限制列為 `Reviewed-by:` 的審批者數量。設定為 `-1` 以包含所有。
- `DEFAULT_MERGE_MESSAGE_OFFICIAL_APPROVERS_ONLY`：**true**：在預設的合併消息中，僅包括正式允許審查的審批者。
- `POPULATE_SQUASH_COMMENT_WITH_COMMIT_MESSAGES`：**false**：在預設的壓縮合併消息中，包含組成拉取請求的所有提交的提交消息。
- `ADD_CO_COMMITTER_TRAILERS`：**true**：如果提交者與作者不匹配，則在合併提交消息中添加共同作者和共同提交者的尾部。
- `TEST_CONFLICTING_PATCHES_WITH_GIT_APPLY`：**false**：PR 補丁使用三方合併方法進行測試，以發現是否存在衝突。如果此設定設定為 **true**，則將使用 `git apply` 重新測試衝突的補丁 - 這是 1.18（及更早版本）中的先前行為，但效率較低。如果您發現需要此設定，請報告。
- `RETARGET_CHILDREN_ON_MERGE`：**true**：在合併父拉取請求時，將子拉取請求重新定位到父拉取請求分支目標。僅適用於目標相同儲存庫的合併 PR。

### 儲存庫 - 問題（`repository.issue`）

- `LOCK_REASONS`：**Too heated,Off-topic,Resolved,Spam**：可以鎖定拉取請求或問題的原因列表
- `MAX_PINNED`：**3**：每個儲存庫的最大固定問題數量。設定為 0 以禁用固定問題。

### 儲存庫 - 上傳（`repository.upload`）

- `ENABLED`：**true**：是否啟用儲存庫文件上傳
- `TEMP_PATH`：**data/tmp/uploads**：上傳的路徑（內容在 Gitea 重啟時會被刪除）
- `ALLOWED_TYPES`：**_empty_**：允許的文件擴展名（`.zip`）、MIME 類型（`text/plain`）或通配符類型（`image/*`、`audio/*`、`video/*`）的逗號分隔列表。空值或 `*/*` 允許所有類型。
- `FILE_MAX_SIZE`：**50**：每個文件的最大大小（以 MB 為單位）。
- `MAX_FILES`：**5**：每次上傳的最大文件數量

### 儲存庫 - 發行（`repository.release`）

- `ALLOWED_TYPES`：**_empty_**：允許的文件擴展名（`.zip`）、MIME 類型（`text/plain`）
