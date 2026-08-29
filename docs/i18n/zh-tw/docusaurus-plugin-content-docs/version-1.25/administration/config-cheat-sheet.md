---
date: "2016-12-26T16:00:00+02:00"
slug: "config-cheat-sheet"
sidebar_position: 30

aliases:
  - /zh-tw/config-cheat-sheet
---

# 設定說明

這是針對 Gitea 設定文件的說明，
你可以瞭解 Gitea 的強大設定。

需要說明的是，你的所有改變請修改 `custom/conf/app.ini` 文件而不是源文件。
如果是從發行版本完成的安裝，
設定文件的路徑為`/etc/gitea/conf/app.ini`。

所有預設值可以透過 [app.example.ini](https://github.com/go-gitea/gitea/blob/main/custom/conf/app.example.ini) 查看到。
標註了 :exclamation: 的設定項表明除非你真的理解這個設定項的意義，否則最好使用預設值。

包含`#`或者`;`的變量必須使用引號( `` ` `` 或者 `"` )包裹，否則會被解析為註釋。

本文件使用以下約定：

- `[section].FOO_BAR` 或 `[section]FOO_BAR`: 一個位於 INI 文件 `[section]` 段中的設定項。
- `FooBar`: 這是一個 Gitea 內部變量，不是一個設定項，僅用於描述相關邏輯。
- `$FOO_BAR`: 這是一個環境變量，Gitea 可能會使用它的值，但是它不能直接用於設定文件中。
- `{FOO_BAR}/something` 或 `{FooBar}/something`: 這個值會預設使用設定項 `FOO_BAR` 或者內部變量 `FooBar`。

**注意:** 修改完設定文件後，需要重啟 Gitea 服務才能生效。

## 使用環境變量設定 Gitea

我們提供了 [environment-to-ini](https://github.com/go-gitea/gitea/tree/main/contrib/environment-to-ini) 工具
來幫助通過環境變量生成 Gitea 的 `app.ini` 設定文件。

## 預設設定 (非`app.ini`設定文件)

這些值取決於環境，但構成了許多值的基礎。當運行 `gitea help`或啟動時，它們將
作為預設設定的一部分進行報告。它們在那裡發出的順序略有不同，但我們將按照設定的順序在這裡列出。

- _`AppPath`_: Gitea 二進制可執行文件的絕對路徑
- _`AppWorkPath`_: Gitea 可執行文件的工作目錄。 該設定可以透過以下幾種方式設定，優先級依次遞減:
  - `app.ini`中的`WORK_PATH`設定項
  - 啟動 Gitea 時的`--work-path`命令行參數
  - `$GITEA_WORK_DIR`環境變量
  - 在編譯時設定的內置值（參見從源程式碼編譯）
  - 預設為 _`AppPath`_ 的目錄
  - 如果上述任何路徑為相對路徑，將自動解析為相對於 _`AppPath`_ 目錄的絕對路徑
- _`CustomPath`_: 這是用於自訂模板和其他選項的基礎目錄。
  它是通過使用以下層次結構中的第一個設定的內容來確定的：
  - 通過傳遞給二進制文件的`--custom-path`標誌
  - 環境變量 `$GITEA_CUSTOM`
  - 在構建時設定的內置值（參見從源程式碼構建）
  - 否則，預設為 _`AppWorkPath`_`/custom`
  - 如果上述任何路徑是相對路徑，則會相對於 _`AppWorkPath`_ 目錄進行處理，
    使其變為絕對路徑。
- _`CustomConf`_: 這是指向`app.ini`文件的路徑。
  - 這是指向`app.ini`文件的路徑。
  - 在構建時設定的內置值（參見從源程式碼構建）
  - 否則，預設為 _`CustomPath`_`/conf/app.ini`
  - 如果上述任何路徑是相對路徑，則會相對於*`CustomPath`*目錄進行處理。

此外，還有*`StaticRootPath`*，可以在構建時設定為內置值，否則將預設為 _`AppWorkPath`_。

## Overall (`DEFAULT`)

- `APP_NAME`: **Gitea: Git with a cup of tea** 應用名稱，在網頁的標題中顯示。
- `RUN_USER`: **_current OS username_/`$USER`/`$USERNAME` e.g. git**: 運行 Gitea 的使用者，
  應當是一個專用的系統帳號(非使用者使用，推薦建立一個專用的`git`使用者). 如果在你自己的個人電腦使用改成你自己的使用者名稱。
  該設定如果設定不正確，Gitea 可能崩潰。
- `RUN_MODE`: **prod**: 應用的運行模式，對運行性能和問題排除有影響: `dev` 或者 `prod`,預設為 `prod`。 `dev`模式有助於開發和問題排查, 除設定為`dev` 外，均被視為 `prod`.
- `WORK_PATH`: **_the-work-path_**: 工作目錄, 前文有提及.

<a id="repository-repository"></a>
## 儲存庫 (`repository`)

- `ROOT`: **`{APP_DATA_PATH}/gitea-repositories`**: 存放 git 工程的根目錄，建議填絕對路徑。
  相對路徑將被解析為**`{AppWorkPath}/{ROOT}`**.
- `SCRIPT_TYPE`: **bash**: 伺服器支援的 Shell 類型，通常是`bash`，
  但有些伺服器也有可能是`sh`。
- `DETECTED_CHARSETS_ORDER`: **UTF-8, UTF-16BE, UTF-16LE, UTF-32BE, UTF-32LE, ISO-8859, windows-1252, ISO-8859, windows-1250, ISO-8859, ISO-8859, ISO-8859, windows-1253, ISO-8859, windows-1255, ISO-8859, windows-1251, windows-1256, KOI8-R, ISO-8859, windows-1254, Shift_JIS, GB18030, EUC-JP, EUC-KR, Big5, ISO-2022, ISO-2022, ISO-2022, IBM424_rtl, IBM424_ltr, IBM420_rtl, IBM420_ltr**: 檢測到的字符集的決定性順序 - 如果檢測到的字符集具有相等的置信度，則優先選擇列表中較早出現的字符集，而不是較晚出現的字符集。添加“defaults”將會將未命名的字符集放置在該點。
- `ANSI_CHARSET`: **_empty_**: 預設的 ANSI 字符集，用於覆蓋非 UTF-8 字符集。
- `FORCE_PRIVATE`: **false**: 強制使每個新儲存庫變為私有。
- `DEFAULT_PRIVATE`: **last**: 建立新儲存庫時預設為私有：`last`, `private`, `public`。
- `DEFAULT_PUSH_CREATE_PRIVATE`: **true**: 使用推送建立新儲存庫時預設為私有。
- `MAX_CREATION_LIMIT`: **-1**: 每個使用者的全域儲存庫建立上限,
  `-1` 代表無限制.
- `PREFERRED_LICENSES`: **Apache License 2.0,MIT License**: 要放置在列表頂部的指定許可證。
  名稱必須與 options/license 或 custom/options/license 中的文件名匹配。
- `DISABLE_HTTP_GIT`: **false**: 禁用 HTTP 協議與儲存庫進行
  交互的能力。
- `USE_COMPAT_SSH_URI`: **false**: 當使用預設的 SSH 端口時，強制使用 ssh://克隆 URL，
  而不是 scp-style uri。
- `GO_GET_CLONE_URL_PROTOCOL`: **https**: 用於 "go get" 請求的值，返回儲存庫的 URL 作為 https 或 ssh，
  預設為 https。
- `ACCESS_CONTROL_ALLOW_ORIGIN`: **_empty_**:用於 Access-Control-Allow-Origin 標頭的值，
  預設不提供。
  警告：如果您不提供正確的值，這可能對您的網站造成危害。
- `DEFAULT_CLOSE_ISSUES_VIA_COMMITS_IN_ANY_BRANCH`: **false**: 如果非預設分支上的提交將問題標記為已關閉，則關閉該問題。
- `ENABLE_PUSH_CREATE_USER`: **false**: 允許使用者將本地儲存庫推送到 Gitea，併為使用者自動建立它們。
- `ENABLE_PUSH_CREATE_ORG`: **false**: 允許使用者將本地儲存庫推送到 Gitea，併為組織自動建立它們。
- `DISABLED_REPO_UNITS`: **_empty_**: 逗號分隔的全域禁用的儲存庫單元列表。允許的值是：: \[repo.issues, repo.ext_issues, repo.pulls, repo.wiki, repo.ext_wiki, repo.projects, repo.packages, repo.actions\]
- `DEFAULT_REPO_UNITS`: **repo.code,repo.releases,repo.issues,repo.pulls,repo.wiki,repo.projects,repo.packages,repo.actions**: 逗號分隔的預設新儲存庫單元列表。允許的值是：: \[repo.code, repo.releases, repo.issues, repo.pulls, repo.wiki, repo.projects, repo.packages, repo.actions\]. 注意：目前無法停用程式碼和發佈。如果您指定了預設的儲存庫單元，您仍應將它們列出以保持未來的相容性。外部 wiki 和問題跟蹤器不能預設啟用，因為它需要額外的設定。禁用的儲存庫單元將不會添加到新的儲存庫中，無論它是否在預設列表中。
- `DEFAULT_FORK_REPO_UNITS`: **repo.code,repo.pulls**: 逗號分隔的預設分叉儲存庫單元列表。允許的值和規則與`DEFAULT_REPO_UNITS`相同。
- `DEFAULT_MIRROR_REPO_UNITS`: **repo.code,repo.releases,repo.issues,repo.wiki,repo.projects,repo.packages**: 逗號分隔的預設鏡像儲存庫單元列表。允許的值和規則與`DEFAULT_REPO_UNITS`相同。
- `DEFAULT_TEMPLATE_REPO_UNITS`: **repo.code,repo.releases,repo.issues,repo.pulls,repo.wiki,repo.projects,repo.packages**: 逗號分隔的預設模板儲存庫單元列表。允許的值和規則與`DEFAULT_REPO_UNITS`相同。
- `PREFIX_ARCHIVE_FILES`: **true**: 通過將存檔文件放置在以儲存庫命名的目錄中來添加前綴。
- `DISABLE_MIGRATIONS`: **false**: 禁用遷移功能。
- `DISABLE_STARS`: **false**: 禁用點贊功能。
- `DEFAULT_BRANCH`: **main**: 所有儲存庫的預設分支名稱。
- `ALLOW_ADOPTION_OF_UNADOPTED_REPOSITORIES`: **false**: 允許非管理員使用者認領未被認領的儲存庫。
- `ALLOW_DELETION_OF_UNADOPTED_REPOSITORIES`: **false**: 允許非管理員使用者刪除未被認領的儲存庫。
- `DISABLE_DOWNLOAD_SOURCE_ARCHIVES`: **false**: 不允許從使用者介面下載源程式碼存檔文件。
- `ALLOW_FORK_WITHOUT_MAXIMUM_LIMIT`: **true**: 允許無限制得派生儲存庫。

### 儲存庫 - 編輯器 (`repository.editor`)

- `LINE_WRAP_EXTENSIONS`: **.txt,.md,.markdown,.mdown,.mkd,.livemd,**: 在 Monaco 編輯器中應該換行的文件擴展名列表。用逗號分隔擴展名。要對沒有擴展名的文件進行換行，只需放置一個逗號。
- `PREVIEWABLE_FILE_MODES`: **markdown**: 具有預覽 API 的有效文件模式，例如 `api/v1/markdown`。用逗號分隔各個值。如果文件擴展名不匹配，編輯模式下的預覽選項卡將不會顯示。

### 儲存庫 - 合併請求 (`repository.pull-request`)

- `WORK_IN_PROGRESS_PREFIXES`: **WIP:,\[WIP\]**: 在拉取請求標題中用於標記工作正在進行中的前綴列表。
  這些前綴在不區分大小寫的情況下進行匹配。
- `CLOSE_KEYWORDS`: **close**, **closes**, **closed**, **fix**, **fixes**, **fixed**, **resolve**, **resolves**, **resolved**: 在拉取請求評論中用於自動關閉相關問題的關鍵詞列表。
- `REOPEN_KEYWORDS`: **reopen**, **reopens**, **reopened**: 在拉取請求評論中用於自動重新打開相關問題的
  關鍵詞列表。
- `DEFAULT_MERGE_STYLE`: **merge**: 設定建立儲存庫的預設合併方式，可選: `merge`, `rebase`, `rebase-merge`, `squash`, `fast-forward-only`
- `DEFAULT_MERGE_MESSAGE_COMMITS_LIMIT`: **50**: 在預設合併消息中，對於`squash`提交，最多包括此數量的提交。設定為 -1 以包括所有提交。
- `DEFAULT_MERGE_MESSAGE_SIZE`: **5120**: 在預設的合併消息中，對於`squash`提交，限制提交消息的大小。設定為 `-1`以取消限制。僅在`POPULATE_SQUASH_COMMENT_WITH_COMMIT_MESSAGES`為`true`時使用。
- `DEFAULT_MERGE_MESSAGE_ALL_AUTHORS`: **false**: 在預設合併消息中，對於`squash`提交，遍歷所有提交以包括所有作者的`Co-authored-by`，否則僅使用限定列表中的作者。
- `DEFAULT_MERGE_MESSAGE_MAX_APPROVERS`: **10**:在預設合併消息中，限制列出的審批者數量為`Reviewed-by`:。設定為 `-1` 以包括所有審批者。
- `DEFAULT_MERGE_MESSAGE_OFFICIAL_APPROVERS_ONLY`: **true**: 在預設合併消息中，僅包括官方允許審查的審批者。
- `POPULATE_SQUASH_COMMENT_WITH_COMMIT_MESSAGES`: **false**: 在預設的 squash 合併消息中，包括構成拉取請求的所有提交的提交消息。
- `ADD_CO_COMMITTER_TRAILERS`: **true**: 如果提交者與作者不匹配，在合併提交消息中添加`co-authored-by`和`co-committed-by`標記。
- `TEST_CONFLICTING_PATCHES_WITH_GIT_APPLY`:使用三方合併方法測試`PR Patch`以發現是否存在衝突。如果此設定`true`，將使用`git apply`重新測試衝突的`PR Pathch` - 這是 1.18（和之前版本）中的先前行為，但效率相對較低。如果發現需要此設定，請報告。

### 儲存庫 - 工單 (`repository.issue`)

- `LOCK_REASONS`: **Too heated,Off-topic,Resolved,Spam**: 合併請求或工單被鎖定的原因列表。
- `MAX_PINNED`: **3**: 每個儲存庫的最大可固定工單數量。設定為 0 禁用固定工單。

### 儲存庫 - 文件上傳 (`repository.upload`)

- `ENABLED`: **true**: 是否啟用儲存庫文件上傳。
- `TEMP_PATH`: **data/tmp/uploads**: 文件上傳的臨時保存路徑(在 Gitea 重啟的時候該目錄會被清空)。
- `ALLOWED_TYPES`: **_empty_**: 以逗號分割的列表，代表支援上傳的文件類型。(`.zip`), mime 類型 (`text/plain`) or 通配符類型 (`image/*`, `audio/*`, `video/*`). 為空或者 `*/*`代表允許所有類型文件。
- `FILE_MAX_SIZE`: **50**: 每個文件的最大大小(MB)。
- `MAX_FILES`: **5**: 每次上傳的最大文件數。

### 儲存庫 - 版本發佈 (`repository.release`)

- `ALLOWED_TYPES`: **_empty_**: 允許發佈的文件類型列表，用逗號分隔 。如壓縮包類型(`.zip`), mime 類型 (`text/plain`) ，也支援通配符 (`image/*`, `audio/*`, `video/*`)。 空值或者 `*/*` 代表允許所有類型。
- `DEFAULT_PAGING_NUM`: **10**: 預設的發佈版本頁面分頁大小
- 關於版本發佈相關的附件設定，詳見`附件`部分。

### 儲存庫 - Signing (`repository.signing`)

- `SIGNING_KEY`: **default**: \[none, KEYID, default \]: 用於簽名的密鑰
- `SIGNING_NAME` &amp; `SIGNING_EMAIL`: 如果`SIGNING_KEY`提供了一個 KEYID，將使用這些作為簽名者的姓名和電子電子郵件地址。這些應與密鑰的公開姓名和電子電子郵件地址相匹配。
- `INITIAL_COMMIT`: **always**: \[never, pubkey, twofa, always\]: 簽名初始提交。
  - `never`: 永不簽名
  - `pubkey`: 僅在使用者具有公鑰時簽名
  - `twofa`: 僅在使用者使用雙因素身份驗證登入時簽名
  - `always`: 始終簽名
  - 除了 never 和 always 之外的選項可以組合為逗號分隔的列表。
- `DEFAULT_TRUST_MODEL`: **collaborator**: \[collaborator, committer, collaboratorcommitter\]: 用於驗證提交的預設信任模型。
  - `collaborator`: 信任協作者密鑰簽名的簽名。
  - `committer`: 信任與提交者匹配的簽名（這與 GitHub 匹配，並會強制 Gitea 簽名的提交具有 Gitea 作為提交者）。
  - `collaboratorcommitter`: 信任與提交者匹配的協作者密鑰簽名的簽名。
- `WIKI`: **never**: \[never, pubkey, twofa, always, parentsigned\]: 對 wiki 提交進行簽名。
- `CRUD_ACTIONS`: **pubkey, twofa, parentsigned**: \[never, pubkey, twofa, parentsigned, always\]: 對 CRUD 操作進行簽名。
  - 與上面相同的選項，增加了：
  - `parentsigned`: 僅在父提交進行了簽名時才進行簽名。
- `MERGES`: **pubkey, twofa, basesigned, commitssigned**: \[never, pubkey, twofa, approved, basesigned, commitssigned, always\]: 對合併操作進行簽名。
  - `approved`: 僅對已批准的合併操作進行簽名，適用於受保護的分支。
  - `basesigned`: 僅在基礎儲存庫的父提交進行了簽名時才進行簽名。
  - `headsigned`: 僅在頭分支的頭提交進行了簽名時才進行簽名。
  - `commitssigned`: 僅在頭分支中的所有提交到合併點都進行了簽名時才進行簽名。

### 儲存庫 - Local (`repository.local`)

- `LOCAL_COPY_PATH`: **tmp/local-repo**:臨時本地儲存庫副本的路徑。預設為 tmp/local-repo（內容在 Gitea 重新啟動時被刪除）

### 儲存庫 - MIME type mapping (`repository.mimetype_mapping`)

設定用於根據可下載文件的文件擴展名設定預期的 MIME 類型。設定以鍵值對的形式呈現，文件擴展名以`.`開頭。

以下設定在下載具有`.apk`文件擴展名的文件時設定`Content-Type: application/vnd.android.package-archive`頭部。

```ini
.apk=application/vnd.android.package-archive
```

## 跨域 (`cors`)

- `ENABLED`: **false**: 啟用 CORS 頭部（預設禁用）
- `ALLOW_DOMAIN`: **\***: 允許請求的域名列表
- `METHODS`: **GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS**: 允許發起的請求方式列表
- `MAX_AGE`: **10m**: 緩存響應的最大時間
- `ALLOW_CREDENTIALS`: **false**: 允許帶有憑據的請求
- `HEADERS`: **Content-Type,User-Agent**: 允許請求攜帶的頭部
- `X_FRAME_OPTIONS`: **SAMEORIGIN**: 詳見 `X-Frame-Options`HTTP 頭部.

<a id="介面"></a>
## 介面 (`ui`)

- `EXPLORE_PAGING_NUM`: **20**: 探索頁面每頁顯示的儲存庫數量。
- `ISSUE_PAGING_NUM`: **20**: 工單頁面每頁顯示的工單數量。
- `MEMBERS_PAGING_NUM`: **20**: 組織成員頁面每頁顯示的成員數量。
- `FEED_MAX_COMMIT_NUM`: **5**: 活動流頁面顯示的最大提交數量。
- `FEED_PAGING_NUM`: **20**: 活動流頁面顯示的最大活動數量。
- `SITEMAP_PAGING_NUM`: **20**: 在單個子 SiteMap 中顯示的項數。
- `GRAPH_MAX_COMMIT_NUM`: **100**: 提交圖中顯示的最大 commit 數量。
- `CODE_COMMENT_LINES`: **4**: 在程式碼評論中能夠顯示的最大程式碼行數。
- `DEFAULT_THEME`: **gitea-auto**: 在 Gitea 安裝時候設定的預設主題，自訂的主題可以透過 `{CustomPath}/public/assets/css/theme-*.css` 提供。
- `SHOW_USER_EMAIL`: **true**: 使用者的電子郵件是否應該顯示在`Explore Users`頁面中。
- `THEMES`: **_empty_**: 所有可用的主題（由 `{CustomPath}/public/assets/css/theme-*.css` 提供）。允許使用者選擇個性化的主題，
- `MAX_DISPLAY_FILE_SIZE`: **8388608**: 能夠顯示文件的最大大小（預設為 8MiB）。
- `REACTIONS`: 使用者可以在問題（Issue）、Pull Request（PR）以及評論中選擇的所有可選的反應。
  這些值可以是表情符號別名（例如：:smile:）或 Unicode 表情符號。
  對於自訂的反應，在 public/assets/img/emoji/ 目錄下添加一個緊密裁剪的正方形圖像，文件名為 reaction_name.png。
- `CUSTOM_EMOJIS`: **gitea, codeberg, gitlab, git, github, gogs**: 不在 utf8 標準中定義的額外表情符號。
  預設情況下，我們支援 Gitea 表情符號（:gitea:）。要添加更多表情符號，請將它們複製到 public/assets/img/emoji/ 目錄下，
  並將其添加到此設定中。
- `DEFAULT_SHOW_FULL_NAME`: **false**: 是否在可能的情況下顯示使用者的全名。如果沒有設定全名，則將使用使用者名稱。
- `SEARCH_REPO_DESCRIPTION`: **true**: 是否在探索頁面上的儲存庫搜索中搜索描述。
- `ONLY_SHOW_RELEVANT_REPOS`: **false** 在沒有指定關鍵字並使用預設排序時，是否僅在探索頁面上顯示相關的儲存庫。
  如果一個儲存庫是分叉或者沒有元資料（沒有描述、圖標、主題），則被視為不相關的儲存庫。

### 介面 - 管理員 (`ui.admin`)

- `USER_PAGING_NUM`: **50**: 單頁顯示的使用者數量。
- `REPO_PAGING_NUM`: **50**: 單頁顯示的儲存庫數量。
- `NOTICE_PAGING_NUM`: **25**: 單頁顯示的通知數量。
- `ORG_PAGING_NUM`: **50**: 單頁顯示的組織數量。

### 介面 - 使用者 (`ui.user`)

- `REPO_PAGING_NUM`: **15**: 單頁顯示的儲存庫數量。
- `ORG_PAGING_NUM`: **15**: 個人資訊頁展示的組織數量。

### 介面 - 元資訊 (`ui.meta`)

- `AUTHOR`: **Gitea - Git with a cup of tea**: 主頁的作者元標籤。
- `DESCRIPTION`: **Gitea (Git with a cup of tea) is a painless self-hosted Git service written in Go**: 主頁的描述元標籤。
- `KEYWORDS`: **go,git,self-hosted,gitea**: 首頁關鍵詞元標籤。

### 介面 - 通知 (`ui.notification`)

- `MIN_TIMEOUT`: **10s**: 這些選項控制通知端點定期輪詢以更新通知計數。在頁面加載後，通知計數將在` MIN_TIMEOUT`之後進行檢查。如果通知計數未更改，超時時間將按照`TIMEOUT_STEP`增加到`MAX_TIMEOUT`。將 `MIN_TIMEOUT`設定為 -1 以關閉該功能。
- `MAX_TIMEOUT`: **60s**.
- `TIMEOUT_STEP`: **10s**.
- `EVENT_SOURCE_UPDATE_TIME`: **10s**: 該設定確定了查詢資料庫以更新通知計數的頻率。如果瀏覽器客戶端支援`EventSource`和`SharedWorker`，則優先使用`SharedWorker`而不是輪詢通知端點。將其設定為 -1 可以禁用 `EventSource`。

### 介面 - SVG Images (`ui.svg`)

- `ENABLE_RENDER`: **true**: 是否將 SVG 文件呈現為圖像。如果禁用了 SVG 渲染，SVG 文件將顯示為文本，無法作為圖像嵌入到 Markdown 文件中。

### 介面 - CSV Files (`ui.csv`)

- `MAX_FILE_SIZE`: **524288** (512kb): 以位元組為單位允許將 CSV 文件呈現為表格的最大文件大小（將其設定為 0 表示沒有限制）。
- `MAX_ROWS`: **2500** : 最大允許的 CSV 文件行數。 (設定為 0 不限制)

## Markdown (`markdown`)

- `ENABLE_HARD_LINE_BREAK_IN_COMMENTS`: **true**: 在評論中將軟換行符呈現為硬換行符，
  這意味著段落之間的單個換行符將導致換行，
  並且不需要在段落後添加尾隨空格來強制換行。
- `ENABLE_HARD_LINE_BREAK_IN_DOCUMENTS`: **false**: 在文件中將軟換行符呈現為硬換行符，
  這意味著段落之間的單個換行符將導致換行，
  並且不需要在段落後添加尾隨空格來強制換行。
- `CUSTOM_URL_SCHEMES`: 使用逗號分隔的列表（ftp、git、svn）來指示要在 Markdown 中呈現的附加 URL 超鏈接。
  以 http 和 https 開頭的 URL 始終顯示。
  如果此條目為空，則允許所有 URL 方案。
- `FILE_EXTENSIONS`: **.md,.markdown,.mdown,.mkd,.livemd**: 應呈現/編輯為 Markdown 的文件擴展名列表。使用逗號分隔擴展名。要將沒有任何擴展名的文件呈現為 Markdown，請只需放置一個逗號。
- `ENABLE_MATH`: **true**: 啟用對`\(...\)`, `\[...\]`, `$...$`和`$$...$$` 作為數學塊的檢測。

<a id="server-server"></a>
## 伺服器 (`server`)

- `APP_DATA_PATH`: **_`AppWorkPath`_/data**: 這是儲存資料的預設根路徑。
- `PROTOCOL`: **http**: \[http, https, fcgi, http+unix, fcgi+unix\]
- `USE_PROXY_PROTOCOL`: **false**: 在連接中預期`PROXY`協議頭。
- `PROXY_PROTOCOL_TLS_BRIDGING`: **false**: 協議為 https 時，在`TLS`協商後預期`PROXY`協議頭。
- `PROXY_PROTOCOL_HEADER_TIMEOUT`: **5s**: 等待`PROXY`協議頭的超時時間（設定為`0`表示沒有超時）。
- `PROXY_PROTOCOL_ACCEPT_UNKNOWN`: **false**:接受帶有未知類型的`PROXY`協議頭。
- `DOMAIN`: **localhost**: 此伺服器的域名。
- `ROOT_URL`: **`{PROTOCOL}://{DOMAIN}:{HTTP_PORT}/`**:
  覆蓋自動生成的公共 URL。
  如果內部 URL 和外部 URL 不匹配（例如在 Docker 中），這很有用。
- `STATIC_URL_PREFIX`: **_empty_**:
  覆蓋此選項以從不同的 URL 請求靜態資源。
  這包括 CSS 文件、圖片、JS 文件和 Web 字體。
  頭像圖片是動態資源，仍由 Gitea 提供。
  選項可以是不同的路徑，例如`/static`, 也可以是另一個域，例如`https://cdn.example.com`.
  請求會變成 `{ROOT_URL}/static/assets/css/index.css` 或 `https://cdn.example.com/assets/css/index.css`
  靜態文件位於 Gitea 源程式碼儲存庫的`public/`目錄中。
  您可以將`STATIC_URL_PREFIX`請求代理到 Gitea 伺服器以提供靜態資源，或者將手動構建的 Gitea 資源從 `$GITEA_BUILD/public`複製到靜態位置，例如`/var/www/assets`。確保`$STATIC_URL_PREFIX/assets/css/index.css`指向`/var/www/assets/css/index.css`。

- `HTTP_ADDR`: **0.0.0.0**: HTTP 監聽地址。
  - 如果 `PROTOCOL` 設定為 `fcgi`，Gitea 將在由
    `HTTP_ADDR` 和 `HTTP_PORT` 設定設定定義的 TCP 套接字上監聽 FastCGI 請求。
  - 如果 `PROTOCOL` 設定為 `http+unix` 或 `fcgi+unix`，則應該是要使用的 Unix 套接字文件的名稱。相對路徑將相對於 _`AppWorkPath`_ 被轉換為絕對路徑。
- `HTTP_PORT`: **3000**: HTTP 監聽端口。
  - 如果 `PROTOCOL` 設定為 `fcgi`，Gitea 將在由 `HTTP_ADDR` 和 `HTTP_PORT`
    設定設定定義的 TCP 套接字上監聽 FastCGI 請求。
- `UNIX_SOCKET_PERMISSION`: **666**: Unix 套接字的權限。
- `LOCAL_ROOT_URL`: **`{PROTOCOL}://{HTTP_ADDR}:{HTTP_PORT}/`**:
  用於訪問網路服務的 Gitea 工作器（例如 SSH 更新）的本地（DMZ）URL。
  在大多數情況下，您不需要更改預設值。
  僅在您的 SSH 伺服器節點與 HTTP 節點不同的情況下才修改它。對於不同的協議，預設值不同。如果 `PROTOCOL`
  是 `http+unix`，則預設值為 `http://unix/`。如果 `PROTOCOL` 是 `fcgi` 或 `fcgi+unix`，則預設值為
  `{PROTOCOL}://{HTTP_ADDR}:{HTTP_PORT}/`。如果監聽在 `0.0.0.0`，則預設值為
  `{PROTOCOL}://localhost:{HTTP_PORT}/`，
  否則預設值為 `{PROTOCOL}://{HTTP_ADDR}:{HTTP_PORT}/`。
- `LOCAL_USE_PROXY_PROTOCOL`: **`{USE_PROXY_PROTOCOL}`**: 在進行本地連接時傳遞 PROXY 協議頭。
  如果本地連接將經過代理，請將其設定為 false。
- `PER_WRITE_TIMEOUT`: **30s**: 連接的任何寫操作的超時時間。（將其設定為 -1
  以禁用所有超時。）
- `PER_WRITE_PER_KB_TIMEOUT`: **10s**: 連接每寫入 1 KB 的超時時間。
- `DISABLE_SSH`: **false**: 當 SSH 不可用時禁用 SSH 功能。
- `START_SSH_SERVER`: **false**: 啟用時，使用內置的 SSH 伺服器。
- `SSH_SERVER_USE_PROXY_PROTOCOL`: **false**: 在與內置 SSH 伺服器建立連接時，期望 PROXY 協議頭。
- `BUILTIN_SSH_SERVER_USER`: **`{RUN_USER}`**: 用於內置 SSH 伺服器的使用者名稱。
- `SSH_USER`: **BUILTIN_SSH_SERVER_USER**: 在克隆 URL 中顯示的 SSH 使用者名稱。
  如果設定為 `(DOER_USERNAME)`，將使用當前登入使用者名稱作為克隆用的 SSH 使用者名稱。
  此設定項僅為自己設定 SSH 反向代理的高級使用者準備，
  大多數使用者應當把它留空，或者按需修改 `BUILTIN_SSH_SERVER_USER`。
- `SSH_DOMAIN`: **`{DOMAIN}`**: 此伺服器的域名，用於顯示的克隆 URL。
- `SSH_PORT`: **22**: 顯示在克隆 URL 中的 SSH 端口。
- `SSH_LISTEN_HOST`: **0.0.0.0**: 內置 SSH 伺服器的監聽地址。
- `SSH_LISTEN_PORT`: **`{SSH_PORT}`**: 內置 SSH 伺服器的端口。
- `SSH_ROOT_PATH`: **~/.ssh**: SSH 目錄的根路徑。
- `SSH_CREATE_AUTHORIZED_KEYS_FILE`: **true**: 當 Gitea 不使用內置 SSH 伺服器時，預設情況下 Gitea 會建立一個 authorized_keys 文件。如果您打算使用 AuthorizedKeysCommand 功能，您應該關閉此選項。
- `SSH_AUTHORIZED_KEYS_BACKUP`: **false**: 在重寫所有密鑰時啟用 SSH 授權密鑰備份，預設值為 false。
- `SSH_TRUSTED_USER_CA_KEYS`: **_empty_**: 指定信任的證書頒發機構的公鑰，用於對使用者證書進行身份驗證。多個密鑰應以逗號分隔。例如 `ssh-<algorithm> <key>` 或 `ssh-<algorithm> <key1>, ssh-<algorithm> <key2>`。有關詳細資訊，請參閱 `sshd` 設定手冊中的 `TrustedUserCAKeys` 部分。當為空時，不會建立文件，並且 `SSH_AUTHORIZED_PRINCIPALS_ALLOW` 預設為 `off`。
- `SSH_TRUSTED_USER_CA_KEYS_FILENAME`: **`RUN_USER`/.ssh/gitea-trusted-user-ca-keys.pem**: Gitea 將管理的 `TrustedUserCaKeys` 文件的絕對路徑。如果您正在運行自己的 SSH 伺服器，並且想要使用 Gitea 管理的文件，您還需要修改您的 `sshd_config` 來指向此文件。官方的 Docker 映像將自動工作，無需進一步設定。
- `SSH_AUTHORIZED_PRINCIPALS_ALLOW`: **off** 或 **username, email**: \[off, username, email, anything\]：指定允許使用者用作 principal 的值。當設定為 `anything` 時，對 principal 字符串不執行任何檢查。當設定為 `off` 時，不允許設定授權的 principal。
- `SSH_CREATE_AUTHORIZED_PRINCIPALS_FILE`: **false/true**: 當 Gitea 不使用內置 SSH 伺服器且 `SSH_AUTHORIZED_PRINCIPALS_ALLOW` 不為 `off` 時，預設情況下 Gitea 會建立一個 authorized_principals 文件。
- `SSH_AUTHORIZED_PRINCIPALS_BACKUP`: **false/true**: 在重寫所有密鑰時啟用 SSH 授權 principal 備份，預設值為 true（如果 `SSH_AUTHORIZED_PRINCIPALS_ALLOW` 不為 `off`）。
- `SSH_AUTHORIZED_KEYS_COMMAND_TEMPLATE`: **`{{.AppPath}} --config={{.CustomConf}} serv key-{{.Key.ID}}`**: 設定用於傳遞授權密鑰的命令模板。可能的密鑰是：AppPath、AppWorkPath、CustomConf、CustomPath、Key，其中 Key 是 `models/asymkey.PublicKey`，其他是 shellquoted 字符串。
- `SSH_SERVER_CIPHERS`: **chacha20-poly1305@openssh.com, aes128-ctr, aes192-ctr, aes256-ctr, aes128-gcm@openssh.com, aes256-gcm@openssh.com**: 對於內置的 SSH 伺服器，選擇支援的 SSH 連接的加密方法，對於系統 SSH，此設定無效。
- `SSH_SERVER_KEY_EXCHANGES`: **curve25519-sha256, ecdh-sha2-nistp256, ecdh-sha2-nistp384, ecdh-sha2-nistp521, diffie-hellman-group14-sha256, diffie-hellman-group14-sha1**: 對於內置 SSH 伺服器，選擇支援的 SSH 連接的密鑰交換算法，對於系統 SSH，此設定無效。
- `SSH_SERVER_MACS`: **hmac-sha2-256-etm@openssh.com, hmac-sha2-256, hmac-sha1**: 對於內置 SSH 伺服器，選擇支援的 SSH 連接的 MAC 算法，對於系統 SSH，此設定無效。
- `SSH_SERVER_HOST_KEYS`: **ssh/gitea.rsa, ssh/gogs.rsa**: 對於內置 SSH 伺服器，選擇要提供為主機密鑰的密鑰對。私鑰應在 `SSH_SERVER_HOST_KEY` 中，公鑰在 `SSH_SERVER_HOST_KEY.pub` 中。相對路徑會相對於 `APP_DATA_PATH` 轉為絕對路徑。如果不存在密鑰，將為您建立一個 4096 位的 RSA 密鑰。
- `SSH_KEY_TEST_PATH`: **/tmp**: 在使用 `ssh-keygen` 測試公共 SSH 密鑰時要在其中建立臨時文件的目錄，預設為系統臨時目錄。
- `SSH_KEYGEN_PATH`: **_empty_**: 使用 `ssh-keygen` 解析公共 SSH 密鑰。該值將傳遞給 shell。預設情況下，Gitea 會自行進行解析。
- `SSH_EXPOSE_ANONYMOUS`: **false**: 啟用將 SSH 克隆 URL 暴露給匿名訪問者，預設為 false。
- `SSH_PER_WRITE_TIMEOUT`: **30s**: 對 SSH 連接的任何寫入設定超時。（將其設定為 -1 可以禁用所有超時。）
- `SSH_PER_WRITE_PER_KB_TIMEOUT`: **10s**: 對寫入 SSH 連接的每 KB 設定超時。
- `MINIMUM_KEY_SIZE_CHECK`: **true**: 指示是否檢查最小密鑰大小與相應類型。
- `OFFLINE_MODE`: **true**: 禁用 CDN 用於靜態文件和 Gravatar 用於個人資料圖片。
- `CERT_FILE`: **https/cert.pem**: 用於 HTTPS 的證書文件路徑。在鏈接時，伺服器證書必須首先出現，然後是中間 CA 證書（如果有）。如果 `ENABLE_ACME=true`，則此設定會被忽略。路徑相對於 `CUSTOM_PATH`。
- `KEY_FILE`: **https/key.pem**: 用於 HTTPS 的密鑰文件路徑。如果 `ENABLE_ACME=true`，則此設定會被忽略。路徑相對於 `CUSTOM_PATH`。
- `STATIC_ROOT_PATH`: **_`StaticRootPath`_**: 模板和靜態文件路徑的上一級。
- `APP_DATA_PATH`: **data**（在 Docker 上為 **/data/gitea**）：應用程式資料的預設路徑。相對路徑會相對於 _`AppWorkPath`_ 轉為絕對路徑。
- `STATIC_CACHE_TIME`: **6h**: 對 `custom/`、`public/` 和所有上傳的頭像的靜態資源的 Web 瀏覽器緩存時間。請注意，在 `RUN_MODE` 為 "dev" 時，此緩存會被禁用。
- `ENABLE_GZIP`: **false**: 為運行時生成的內容啟用 gzip 壓縮，靜態資源除外。
- `ENABLE_PPROF`: **false**: 應用程式分析（內存和 CPU）。對於 "web" 命令，它會在 `localhost:6060` 上監聽。對於 "serv" 命令，它會將資料轉儲到磁盤上的 `PPROF_DATA_PATH` 中，文件名為 `(cpuprofile|memprofile)_<username>_<temporary id>`。
- `PPROF_DATA_PATH`: **_`AppWorkPath`_/data/tmp/pprof**: `PPROF_DATA_PATH`，當您將 Gitea 作為服務啟動時，請使用絕對路徑。
- `LANDING_PAGE`: **home**: 未經身份驗證使用者的登入頁面 \[home, explore, organizations, login, **custom**]。其中 custom 可以是任何 URL，例如 "/org/repo" 或甚至是 `https://anotherwebsite.com`。
- `LFS_START_SERVER`: **false**: 啟用 Git LFS 支援。
- `LFS_CONTENT_PATH`: **`{APP_DATA_PATH}/lfs`**: 預設的 LFS 內容路徑（如果它在本地儲存中）。**已棄用**，請使用 `[lfs]` 中的設定。
- `LFS_JWT_SECRET`: **_empty_**: LFS 身份驗證密鑰，將其更改為唯一的字符串。你可以透過 Gitea 子命令來生成此字符串。轉到 [Command Line](administration/command-line.md#generate)。
- `LFS_JWT_SECRET_URI`: **_empty_**: 代替在設定中定義 LFS_JWT_SECRET，可以使用此設定選項為 Gitea 提供包含密鑰的文件的路徑（範例值：`file:/etc/gitea/lfs_jwt_secret`）。
- `LFS_HTTP_AUTH_EXPIRY`: **24h**: LFS 身份驗證的有效期，以 time.Duration 表示，超過此期限的推送可能會失敗。
- `LFS_MAX_FILE_SIZE`: **0**: 允許的最大 LFS 文件大小（以位元組為單位，設定為 0 為無限制）。
- `LFS_LOCKS_PAGING_NUM`: **50**: 每頁返回的最大 LFS 鎖定數。
- `REDIRECT_OTHER_PORT`: **false**: 如果為 true 並且 `PROTOCOL` 為 https，則允許將 http 請求重定向到 Gitea 監聽的 https 端口的 `PORT_TO_REDIRECT`。
- `REDIRECTOR_USE_PROXY_PROTOCOL`: **`{USE_PROXY_PROTOCOL}`**: 在連接到 https 重定向器時，需要 PROXY 協議頭。
- `PORT_TO_REDIRECT`: **80**: http 重定向服務監聽的端口。當 `REDIRECT_OTHER_PORT` 為 true 時使用。
- `SSL_MIN_VERSION`: **TLSv1.2**: 設定最低支援的 SSL 版本。
- `SSL_MAX_VERSION`: **_empty_**: 設定最大支援的 SSL 版本。
- `SSL_CURVE_PREFERENCES`: **X25519,P256**: 設定首選的曲線。
- `SSL_CIPHER_SUITES`: **ecdhe_ecdsa_with_aes_256_gcm_sha384,ecdhe_rsa_with_aes_256_gcm_sha384,ecdhe_ecdsa_with_aes_128_gcm_sha256,ecdhe_rsa_with_aes_128_gcm_sha256,ecdhe_ecdsa_with_chacha20_poly1305,ecdhe_rsa_with_chacha20_poly1305**: 設定首選的密碼套件。
  - 如果沒有對 AES 套件的硬件支援，預設情況下，ChaCha 套件將優先於 AES 套件。
  - 根據 Go 1.18 的支援的套件有：
    - TLS 1.0 - 1.2 套件
      - "rsa_with_rc4_128_sha"
      - "rsa_with_3des_ede_cbc_sha"
      - "rsa_with_aes_128_cbc_sha"
      - "rsa_with_aes_256_cbc_sha"
      - "rsa_with_aes_128_cbc_sha256"
      - "rsa_with_aes_128_gcm_sha256"
      - "rsa_with_aes_256_gcm_sha384"
      - "ecdhe_ecdsa_with_rc4_128_sha"
      - "ecdhe_ecdsa_with_aes_128_cbc_sha"
      - "ecdhe_ecdsa_with_aes_256_cbc_sha"
      - "ecdhe_rsa_with_rc4_128_sha"
      - "ecdhe_rsa_with_3des_ede_cbc_sha"
      - "ecdhe_rsa_with_aes_128_cbc_sha"
      - "ecdhe_rsa_with_aes_256_cbc_sha"
      - "ecdhe_ecdsa_with_aes_128_cbc_sha256"
      - "ecdhe_rsa_with_aes_128_cbc_sha256"
      - "ecdhe_rsa_with_aes_128_gcm_sha256"
      - "ecdhe_ecdsa_with_aes_128_gcm_sha256"
      - "ecdhe_rsa_with_aes_256_gcm_sha384"
      - "ecdhe_ecdsa_with_aes_256_gcm_sha384"
      - "ecdhe_rsa_with_chacha20_poly1305_sha256"
      - "ecdhe_ecdsa_with_chacha20_poly1305_sha256"
    - TLS 1.3 套件
      - "aes_128_gcm_sha256"
      - "aes_256_gcm_sha384"
      - "chacha20_poly1305_sha256"
    - 別名
      - "ecdhe_rsa_with_chacha20_poly1305" 是 "ecdhe_rsa_with_chacha20_poly1305_sha256" 的別名
      - "ecdhe_ecdsa_with_chacha20_poly1305" 是 "ecdhe_ecdsa_with_chacha20_poly1305_sha256" 的別名
- `ENABLE_ACME`: **false**: 通過 ACME 能力的證書頒發機構（CA）伺服器（預設為 Let's Encrypt）啟用自動證書管理的標誌。如果啟用，將忽略 `CERT_FILE` 和 `KEY_FILE`，並且 CA 必須將 `DOMAIN` 解析為此 Gitea 伺服器。確保設定了 DNS 記錄，並且端口 `80` 或端口 `443` 可以被 CA 伺服器訪問（預設情況下是公共互聯網），並重定向到相應的端口 `PORT_TO_REDIRECT` 或 `HTTP_PORT`。
- `ACME_URL`: **_empty_**: CA 的 ACME 目錄 URL，例如自託管的 [smallstep CA 伺服器](https://github.com/smallstep/certificates)，它可以是 `https://ca.example.com/acme/acme/directory`。如果留空，預設使用 Let's Encrypt 的生產 CA（還要檢查 `LETSENCRYPT_ACCEPTTOS`）。
- `ACME_ACCEPTTOS`: **false**: 這是一個明確的檢查，您是否接受 ACME 提供者的服務條款。預設為 Let's Encrypt 的 [服務條款](https://letsencrypt.org/documents/LE-SA-v1.2-November-15-2017.pdf)。
- `ACME_DIRECTORY`: **https**: 證書管理器用於緩存證書和私鑰等資訊的目錄。
- `ACME_EMAIL`: **_empty_**: 用於 ACME 註冊的電子郵件。通常用於通知有關已頒發的證書的問題。
- `ACME_CA_ROOT`: **_empty_**: CA 的根證書。如果留空，預設使用系統的信任鏈。
- `ALLOW_GRACEFUL_RESTARTS`: **true**: 在 SIGHUP 時執行優雅重啟。
- `GRACEFUL_HAMMER_TIME`: **60s**: 在重新啟動後，父進程將停止接受新連接，並允許請求在停止之前完成。如果耗時超過此時間，則會強制關閉關閉。
- `STARTUP_TIMEOUT`: **0**: 如果啟動超過提供的時間，將關閉伺服器。在 Windows 上設定這將向 SVC 主機發送一個等待提示，告訴 SVC 主機啟動可能需要一些時間。請注意，啟動由監聽器（HTTP/HTTPS/SSH）的打開來確定。索引程式可能需要更長時間啟動，可能具有自己的超時時間。

## 資料庫 (`database`)

- `DB_TYPE`: **mysql**: 資料庫類型 \[mysql, postgres, mssql, sqlite3\]。
- `HOST`: **127.0.0.1:3306**: 資料庫主機地址和端口或 unix 套接字的絕對路徑 \[mysql, postgres\]（例如：/var/run/mysqld/mysqld.sock）。
- `NAME`: **gitea**: 資料庫名稱。
- `USER`: **root**: 資料庫使用者名稱。
- `PASSWD`: **_empty_**: 資料庫密碼。如果密碼包含特殊字符，請使用 \`your password\` 或 """your password"""。
- `SCHEMA`: **_empty_**: 對於 PostgreSQL，如果與 "public" 不同的模式。模式必須事先存在，使用者必須對其具有建立特權，並且使用者搜索路徑必須設定為首先查找模式（例如 `ALTER USER user SET SEARCH_PATH = schema_name,"$user",public;`）。
- `SSL_MODE`: **disable**: MySQL 或 PostgreSQL 資料庫是否啟用 SSL 模式，僅適用於 MySQL 和 PostgreSQL。
  - MySQL 的有效值：
    - `true`：啟用 TLS，並針對資料庫伺服器證書根證書進行驗證。選擇此選項時，請確保用於驗證資料庫伺服器證書的根證書（例如 CA 證書）位於資料庫伺服器和 Gitea 伺服器的系統證書儲存中。有關如何將 CA 證書添加到證書儲存的說明，請參閱系統文件。
    - `false`：禁用 TLS。
    - `disable`：`false` 的別名，與 PostgreSQL 相容。
    - `skip-verify`：啟用 TLS，但不進行資料庫伺服器證書驗證。如果資料庫伺服器上有自簽名或無效證書，請使用此選項。
    - `prefer`：啟用 TLS，並回退到非 TLS 連接。
  - PostgreSQL 的有效值：
    - `disable`：禁用 TLS。
    - `require`：啟用 TLS，但不進行任何驗證。
    - `verify-ca`：啟用 TLS，並對資料庫伺服器證書進行根證書驗證。
    - `verify-full`：啟用 TLS，並驗證資料庫伺服器名稱是否與給定的證書的 "Common Name" 或 "Subject Alternative Name" 欄位匹配。
- `SQLITE_TIMEOUT`：**500**: 僅適用於 SQLite3 的查詢超時。
- `SQLITE_JOURNAL_MODE`：**""**: 更改 SQlite3 的日誌模式。可以用於在高負載導致寫入擁塞時啟用 [WAL 模式](https://www.sqlite.org/wal.html)。有關可能的值，請參閱 [SQlite3 文件](https://www.sqlite.org/pragma.html#pragma_journal_mode)。預設為資料庫文件的預設值，通常為 DELETE。
- `ITERATE_BUFFER_SIZE`：**50**: 用於迭代的內部緩衝區大小。
- `PATH`：**data/gitea.db**: 僅適用於 SQLite3 的資料庫文件路徑。
- `LOG_SQL`：**false**: 記錄已執行的 SQL。
- `DB_RETRIES`：**10**: 允許多少次 ORM 初始化 / DB 連接嘗試。
- `DB_RETRY_BACKOFF`：**3s**: 如果發生故障，等待另一個 ORM 初始化 / DB 連接嘗試的 time.Duration。
- `MAX_OPEN_CONNS`：**0**: 資料庫最大打開連接數 - 預設為 0，表示沒有限制。
- `MAX_IDLE_CONNS`：**2**: 連接池上的最大空閒資料庫連接數，預設為 2 - 這將限制為 `MAX_OPEN_CONNS`。
- `CONN_MAX_LIFETIME`：**0 或 3s**: 設定 DB 連接可以重用的最長時間 - 預設為 0，表示沒有限制（除了 MySQL，其中為 3s - 請參見 #6804 和 #7071）。
- `AUTO_MIGRATION`：**true**: 是否自動執行資料庫模型遷移。

請參見 #8540 和 #8273 以獲取有關 `MAX_OPEN_CONNS`、`MAX_IDLE_CONNS` 和 `CONN_MAX_LIFETIME` 的適當值及其與端口耗盡的關係的進一步討論。

## 索引 (`indexer`)

- `ISSUE_INDEXER_TYPE`: **bleve**: 工單索引類型，當前支援：`bleve`、`db`、`elasticsearch` 或 `meilisearch`。
- `ISSUE_INDEXER_CONN_STR`：\*\*\*\* : 工單索引連接字符串，僅適用於 elasticsearch 和 meilisearch（例如：`http://elastic:password@localhost:9200`）或者（例如：`http://:apikey@localhost:7700`）。
- `ISSUE_INDEXER_NAME`：**gitea_issues**: 工單索引器名稱，在 ISSUE_INDEXER_TYPE 為 elasticsearch 或 meilisearch 時可用。
- `ISSUE_INDEXER_PATH`：**indexers/issues.bleve**: 用於工單搜索的索引文件；在 ISSUE*INDEXER_TYPE 為 bleve 和 elasticsearch 時可用。相對路徑將相對於 *`AppWorkPath`\_ 進行絕對路徑化。

- `REPO_INDEXER_ENABLED`：**false**: 啟用程式碼搜索（佔用大量磁盤空間，約為儲存庫大小的 6 倍）。
- `REPO_INDEXER_REPO_TYPES`：**sources,forks,mirrors,templates**: 儲存庫索引器單元。要索引的專案可以是 `sources`、`forks`、`mirrors`、`templates` 或它們的任何組合，用逗號分隔。如果為空，則預設為僅 `sources`，如果要完全禁用，請參見 `REPO_INDEXER_ENABLED`。
- `REPO_INDEXER_TYPE`：**bleve**: 程式碼搜索引擎類型，可以為 `bleve` 或者 `elasticsearch`。
- `REPO_INDEXER_PATH`：**indexers/repos.bleve**: 用於程式碼搜索的索引文件。
- `REPO_INDEXER_CONN_STR`：\*\*\*\*: 程式碼索引器連接字符串，在 `REPO_INDEXER_TYPE` 為 elasticsearch 時可用。例如：`http://elastic:password@localhost:9200`
- `REPO_INDEXER_NAME`：**gitea_codes**: 程式碼索引器名稱，在 `REPO_INDEXER_TYPE` 為 elasticsearch 時可用。

- `REPO_INDEXER_INCLUDE`：**empty**: 逗號分隔的 glob 模式列表（參見 [https://github.com/gobwas/glob](https://github.com/gobwas/glob)）以用於**包括**在索引中。使用 `**.txt` 匹配任何具有 .txt 擴展名的文件。空列表表示包括所有文件。
- `REPO_INDEXER_EXCLUDE`：**empty**: 逗號分隔的 glob 模式列表（參見 [https://github.com/gobwas/glob](https://github.com/gobwas/glob)）以用於**排除**在索引中。即使在 `REPO_INDEXER_INCLUDE` 中匹配，也不會索引與此列表匹配的文件。
- `REPO_INDEXER_EXCLUDE_VENDORED`：**true**: 從索引中排除 vendored 文件。
- `MAX_FILE_SIZE`：**1048576**: 要索引的文件的最大位元組數。
- `STARTUP_TIMEOUT`：**30s**: 如果索引器啟動時間超過此超時時間 - 則失敗。（此超時時間將添加到上面的錘子時間中，用於子進程 - 因為 bleve 不會在上一個父進程關閉之前啟動）。設定為 -1 表示永不超時。

## 隊列 (`queue` and `queue.*`)

[queue] 設定在 `[queue.*]` 下為各個隊列設定預設值，並允許為各個隊列設定單獨的設定覆蓋。（不過請參見下文。）

- `TYPE`：**level**: 通用隊列類型，當前支援：`level`（在內部使用 LevelDB）、`channel`、`redis`、`dummy`。無效的類型將視為 `level`。
- `DATADIR`：**queues/common**: 用於儲存 level 隊列的基本 DataDir。單獨的隊列的 `DATADIR` 可以在 `queue.name` 部分進行設定。相對路徑將根據 `{APP_DATA_PATH}` 變為絕對路徑。
- `LENGTH`：**100000**: 通道隊列阻塞之前的最大隊列大小
- `BATCH_LENGTH`：**20**: 在傳遞給處理程式之前批處理資料
- `CONN_STR`：**redis://127.0.0.1:6379/0**: redis 隊列類型的連接字符串。對於 `redis-cluster`，使用 `redis+cluster://127.0.0.1:6379/0`。可以使用查詢參數來設定選項。類似地，LevelDB 選項也可以使用：**leveldb://relative/path?option=value** 或 **leveldb:///absolute/path?option=value** 進行設定，並將覆蓋 `DATADIR`。
- `QUEUE_NAME`：**\_queue**: 預設的 redis 和磁盤隊列名稱的後綴。單獨的隊列將預設為 **`name`**`QUEUE_NAME`，但可以在特定的 `queue.name` 部分中進行覆蓋。
- `SET_NAME`：**\_unique**: 將添加到預設的 redis 和磁盤隊列 `set` 名稱中以用於唯一隊列的後綴。單獨的隊列將預設為 **`name`**`QUEUE_NAME`_`SET_NAME`_，但可以在特定的 `queue.name` 部分中進行覆蓋。
- `MAX_WORKERS`：**(dynamic)**: 隊列的最大工作協程數。預設值為 "CpuNum/2"，限制在 1 到 10 之間。

Gitea 建立以下非唯一隊列：

- `code_indexer`
- `issue_indexer`
- `notification-service`
- `task`
- `mail`
- `push_update`

以及以下唯一隊列：

- `repo_stats_update`
- `repo-archive`
- `mirror`
- `pr_patch_checker`

## Admin (`admin`)

- `DEFAULT_EMAIL_NOTIFICATIONS`: **enabled**: 使用者電子郵件通知的預設設定（使用者可設定）。選項：enabled、onmention、disabled
- `DISABLE_REGULAR_ORG_CREATION`: **false**: 禁止普通（非管理員）使用者建立組織。
- `USER_DISABLED_FEATURES`:**_empty_** 禁用的使用者特性，當前允許為空或者 `deletion`，`manage_ssh_keys`， `manage_gpg_keys` 未來可以增加更多設定。
  - `deletion`: 使用者不能通過介面或者 API 刪除他自己。
  - `manage_ssh_keys`: 使用者不能通過介面或者 API 設定 SSH Keys。
  - `manage_gpg_keys`: 使用者不能設定 GPG 密鑰。

<a id="安全性"></a>
<a id="security-security"></a>
## 安全性 (`security`)

- `INSTALL_LOCK`: **false**: 控制是否能夠訪問安裝嚮導頁面，設定為 `true` 則禁止訪問安裝嚮導頁面。
- `SECRET_KEY`: **\<每次安裝時隨機生成\>**: 全域伺服器安全密鑰。這個密鑰非常重要，如果丟失將無法解密加密的資料（例如 2FA）。
- `SECRET_KEY_URI`: **_empty_**: 與定義 `SECRET_KEY` 不同，此選項可用於使用儲存在文件中的密鑰（範例值：`file:/etc/gitea/secret_key`）。它不應該像 `SECRET_KEY` 一樣容易丟失。
- `LOGIN_REMEMBER_DAYS`: **31**: 在要求重新登入之前，記住使用者的登入狀態多長時間（以天為單位）。
- `COOKIE_REMEMBER_NAME`: **gitea_incredible**: 保存自動登入資訊的 Cookie 名稱。
- `REVERSE_PROXY_AUTHENTICATION_USER`: **X-WEBAUTH-USER**: 反向代理認證的 HTTP 頭部名稱，用於提供使用者資訊。
- `REVERSE_PROXY_AUTHENTICATION_EMAIL`: **X-WEBAUTH-EMAIL**: 反向代理認證的 HTTP 頭部名稱，用於提供郵箱資訊。
- `REVERSE_PROXY_AUTHENTICATION_FULL_NAME`: **X-WEBAUTH-FULLNAME**: 反向代理認證的 HTTP 頭部名稱，用於提供全名資訊。
- `REVERSE_PROXY_LIMIT`: **1**: 解釋 X-Forwarded-For 標頭或 X-Real-IP 標頭，並將其設定為請求的遠程 IP。
  可信代理計數。設定為零以不使用這些標頭。
- `REVERSE_PROXY_TRUSTED_PROXIES`: **127.0.0.0/8,::1/128**: 逗號分隔的受信任代理伺服器的 IP 地址和網路列表。使用 `*` 來信任全部。
- `DISABLE_GIT_HOOKS`: **true**: 設定為 `false` 以允許具有 Git 鉤子權限的使用者建立自訂 Git 鉤子。
  警告：自訂 Git 鉤子可用於在主機操作系統上執行任意程式碼。這允許使用者訪問和修改此設定文件和 Gitea 資料庫，並中斷 Gitea 服務。
  透過修改 Gitea 資料庫，使用者可以獲得 Gitea 管理員權限。
  它還使他們可以訪問正在運行 Gitea 實例的操作系統上使用者可用的其他資源，並以 Gitea 操作系統使用者的名義執行任意操作。
  這可能對您的網站或操作系統造成危害。
  在必要之前，請在更改現有 git 儲存庫中的鉤子之前進行調整。
- `DISABLE_WEBHOOKS`: **false**: 設定為 `true` 以禁用 Webhooks 功能。
- `ONLY_ALLOW_PUSH_IF_GITEA_ENVIRONMENT_SET`: **true**: 設定為 `false` 以允許本地使用者在未設定 Gitea 環境的情況下推送到 Gitea 儲存庫。不建議這樣做，如果您希望本地使用者推送到 Gitea 儲存庫，應該適當地設定環境。
- `IMPORT_LOCAL_PATHS`: **false**: 設定為 `false` 以防止所有使用者（包括管理員）從伺服器上導入本地路徑。
- `INTERNAL_TOKEN`: **\<每次安裝時隨機生成，如果未設定 URI\>**: 用於驗證 Gitea 二進制文件內部通信的密鑰。
- `INTERNAL_TOKEN_URI`: **_empty_**: 與在設定中定義 `INTERNAL_TOKEN` 不同，此設定選項可用於將包含內部令牌的文件的路徑提供給 Gitea（範例值：`file:/etc/gitea/internal_token`）。
- `PASSWORD_HASH_ALGO`: **pbkdf2**: 要使用的哈希算法 \[argon2、pbkdf2、pbkdf2_v1、pbkdf2_hi、scrypt、bcrypt\]，argon2 和 scrypt 將消耗大量內存。
  - 注意：`pbkdf2` 哈希的預設參數已更改 - 先前的設定可作為 `pbkdf2_v1` 使用，但不建議使用。
  - 可以透過在算法後使用 `$` 進行調整：
    - `argon2$<time>$<memory>$<threads>$<key-length>`
    - `bcrypt$<cost>`
    - `pbkdf2$<iterations>$<key-length>`
    - `scrypt$<n>$<r>$<p>$<key-length>`
  - 預設值為：
    - `argon2`：`argon2$2$65536$8$50`
    - `bcrypt`：`bcrypt$10`
    - `pbkdf2`：`pbkdf2$50000$50`
    - `pbkdf2_v1`：`pbkdf2$10000$50`
    - `pbkdf2_v2`：`pbkdf2$50000$50`
    - `pbkdf2_hi`：`pbkdf2$320000$50`
    - `scrypt`：`scrypt$65536$16$2$50`
  - 使用此功能調整算法參數存在一定風險。
- `CSRF_COOKIE_HTTP_ONLY`: **true**: 設定為 false 以允許 JavaScript 讀取 CSRF cookie。
- `MIN_PASSWORD_LENGTH`: **6**: 新使用者的最小密碼長度。
- `PASSWORD_COMPLEXITY`: **off**: 要求通過最小複雜性的字符類別的逗號分隔列表。如果留空或沒有指定有效值，則禁用檢查（off）：
  - lower - 使用一個或多個小寫拉丁字符
  - upper - 使用一個或多個大寫拉丁字符
  - digit - 使用一個或多個數字
  - spec - 使用一個或多個特殊字符，如 `` !"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~ ``
  - off - 不檢查密碼複雜性
- `PASSWORD_CHECK_PWN`: **false**: 檢查密碼是否在 [HaveIBeenPwned](https://haveibeenpwned.com/Passwords) 中曝光。
- `SUCCESSFUL_TOKENS_CACHE_SIZE`: **20**: 緩存成功的令牌哈希。API 令牌在資料庫中儲存為 pbkdf2 哈希，但這意味著在存在多個 API 操作時可能會有顯著的哈希負載。此緩存將在 LRU 緩存中儲存成功的哈希令牌，以在性能和安全性之間保持平衡。

## Camo (`camo`)

- `ENABLED`: **false**: 啟用媒體代理，目前僅支援圖像。
- `SERVER_URL`: **_empty_**: Camo 伺服器的 URL，如果啟用 camo，則**必填**。
- `HMAC_KEY`: **_empty_**: 為 URL 編碼提供 HMAC 密鑰，如果啟用 camo，則**必填**。
- `ALWAYS`: **false**: 設定為 true 以在 HTTP 和 HTTPS 內容上使用 camo，否則僅代理非 HTTPS URL。`ALLWAYS` 已經過期，並且會在未來版本中刪除。

## OpenID (`openid`)

- `ENABLE_OPENID_SIGNIN`: **true**: 允許透過 OpenID 進行身份驗證。
- `ENABLE_OPENID_SIGNUP`: **! DISABLE_REGISTRATION**: 允許透過 OpenID 進行註冊。
- `WHITELISTED_URIS`: **_empty_**: 如果非空，是一組匹配 OpenID URI 的 POSIX 正則表達式模式，用於允許訪問。
- `BLACKLISTED_URIS`: **_empty_**: 如果非空，是一組匹配 OpenID URI 的 POSIX 正則表達式模式，用於阻止訪問。

## OAuth2 Client (`oauth2_client`)

- `REGISTER_EMAIL_CONFIRM`: _[service]_ **REGISTER_EMAIL_CONFIRM**: 設定此項以啟用或禁用 OAuth2 自動註冊的電子郵件確認。（覆蓋`[service]`部分的`REGISTER\_EMAIL\_CONFIRM`設定）
- `OPENID_CONNECT_SCOPES`: **_empty_**: 附加的 OpenID 連接範圍的列表。（`openid`已隱式添加）
- `ENABLE_AUTO_REGISTRATION`: **false**: 為新的 OAuth2 使用者自動建立使用者帳戶。
- `USERNAME`: **nickname**: 新 OAuth2 帳戶的使用者名稱來源：
  - userid - 使用 userid / sub 屬性
  - nickname - 使用 nickname 屬性
  - email - 使用 email 屬性的使用者名稱部分
- `UPDATE_AVATAR`: **false**: 如果 OAuth2 提供程式中有可用的頭像，則進行頭像更新。更新將在每次登入時執行。
- `ACCOUNT_LINKING`: **login**: 如果帳戶/電子郵件已存在，如何處理：
  - disabled - 顯示錯誤
  - login - 顯示帳戶鏈接登入
  - auto - 自動與帳戶鏈接（請注意，這將因為提供相同的使用者名稱或電子郵件而自動授予現有帳戶的存取權限。您必須確保這不會導致身份驗證提供程式出現問題。）

## Service (`service`)

- `ACTIVE_CODE_LIVE_MINUTES`: **180**: 確認帳戶/電子郵件註冊的時間限制（分鐘）。
- `RESET_PASSWD_CODE_LIVE_MINUTES`: **180**: 確認忘記密碼重置流程的時間限制（分鐘）。
- `REGISTER_EMAIL_CONFIRM`: **false**: 啟用此項以要求通過郵件確認註冊。需要啟用`Mailer`。
- `REGISTER_MANUAL_CONFIRM`: **false**: 啟用此項以手動確認新的註冊。需要禁用`REGISTER_EMAIL_CONFIRM`。
- `DISABLE_REGISTRATION`: **false**: 禁用註冊，之後只有管理員可以為使用者建立帳戶。
- `REQUIRE_EXTERNAL_REGISTRATION_PASSWORD`: **false**: 啟用此項以強制通過外部方式建立的帳戶（通過 GitHub、OpenID Connect 等）建立密碼。警告：啟用此項將降低安全性，因此只有在您知道自己在做什麼時才應啟用它。
- `REQUIRE_SIGNIN_VIEW`: **false**: 啟用此項以強制使用者登入以查看任何頁面或使用 API。
- `ENABLE_NOTIFY_MAIL`: **false**: 啟用此項以在發生某些情況（如建立問題）時向儲存庫的觀察者發送電子郵件。需要啟用`Mailer`。
- `ENABLE_BASIC_AUTHENTICATION`: **true**: 禁用此項以禁止使用 HTTP BASIC 和使用者的密碼進行身份驗證。請注意，如果禁用此項，您將無法使用密碼存取權杖 API 端點。此外，這僅會禁用使用密碼的 BASIC 身份驗證，而不會禁用令牌或 OAuth Basic。
- `ENABLE_REVERSE_PROXY_AUTHENTICATION`: **false**: 啟用此項以允許反向代理身份驗證。
- `ENABLE_REVERSE_PROXY_AUTO_REGISTRATION`: **false**: 啟用此項以允許反向身份驗證的自動註冊。
- `ENABLE_REVERSE_PROXY_EMAIL`: **false**: 啟用此項以允許使用提供的電子郵件而不是生成的電子郵件進行自動註冊。
- `ENABLE_REVERSE_PROXY_FULL_NAME`: **false**: 啟用此項以允許使用提供的全名進行自動註冊。
- `ENABLE_CAPTCHA`: **false**: 啟用此項以對註冊使用驗證碼驗證。
- `REQUIRE_CAPTCHA_FOR_LOGIN`: **false**: 啟用此項以要求登入使用驗證碼驗證。您還必須啟用`ENABLE_CAPTCHA`。
- `REQUIRE_EXTERNAL_REGISTRATION_CAPTCHA`: **false**: 啟用此項以強制對外部帳戶（即 GitHub、OpenID Connect 等）使用驗證碼驗證。您還必須啟用`ENABLE_CAPTCHA`。
- `CAPTCHA_TYPE`: **image**: \[image、recaptcha、hcaptcha、mcaptcha、cfturnstile\]
- `RECAPTCHA_SECRET`: **""**: 訪問 https://www.google.com/recaptcha/admin 以獲取 recaptcha 的密鑰。
- `RECAPTCHA_SITEKEY`: **""**: 訪問 https://www.google.com/recaptcha/admin 以獲取 recaptcha 的站點密鑰。
- `RECAPTCHA_URL`: **https://www.google.com/recaptcha/** ：設定 recaptcha 網址，允許使用 recaptcha net。
- `HCAPTCHA_SECRET`: **""**: 註冊 https://www.hcaptcha.com/ 以獲取 hcaptcha 的密鑰。
- `HCAPTCHA_SITEKEY`: **""**: 註冊 https://www.hcaptcha.com/ 以獲取 hcaptcha 的站點密鑰。
- `MCAPTCHA_SECRET`: **""**: 訪問您的 mCaptcha 實例以獲取 mCaptcha 的密鑰。
- `MCAPTCHA_SITEKEY`: **""**: 訪問您的 mCaptcha 實例以獲取 mCaptcha 的站點密鑰。
- `MCAPTCHA_URL` **https://demo.mcaptcha.org/** ：設定 mCaptcha 的 URL。
- `CF_TURNSTILE_SECRET` **""**: 訪問 https://dash.cloudflare.com/?to=/:account/turnstile 以獲取 cloudflare turnstile 的密鑰。
- `CF_TURNSTILE_SITEKEY` **""**: 訪問 https://dash.cloudflare.com/?to=/:account/turnstile 以獲取 cloudflare turnstile 的站點密鑰。
- `DEFAULT_KEEP_EMAIL_PRIVATE`: **false**: 預設情況下，將使用者設定為保持其電子電子郵件地址私有。
- `DEFAULT_ALLOW_CREATE_ORGANIZATION`: **true**: 預設情況下，允許新使用者建立組織。
- `DEFAULT_USER_IS_RESTRICTED`: **false**: 預設情況下，為新使用者分配受限權限。
- `DEFAULT_ENABLE_DEPENDENCIES`: **true**: 啟用此項以預設啟用依賴項。
- `ALLOW_CROSS_REPOSITORY_DEPENDENCIES` : **true** 啟用此項以允許從使用者被授予存取權限的任何儲存庫上進行依賴項操作。
- `USER_LOCATION_MAP_URL`: **""**: 一個顯示使用者在地圖上位置的地圖服務 URL。位置將作為轉義的查詢參數附加到 URL 中。
- `ENABLE_USER_HEATMAP`: **true**: 啟用此項以在使用者個人資料上顯示熱圖。
- `ENABLE_TIMETRACKING`: **true**: 啟用時間跟蹤功能。
- `DEFAULT_ENABLE_TIMETRACKING`: **true**: 預設情況下，允許儲存庫預設使用時間跟蹤。
- `DEFAULT_ALLOW_ONLY_CONTRIBUTORS_TO_TRACK_TIME`: **true**: 僅允許具有寫權限的使用者跟蹤時間。
- `EMAIL_DOMAIN_ALLOWLIST`: **_empty_**: 如果非空，逗號分隔的域名列表，只能用於在此實例上註冊，支援通配符。
- `EMAIL_DOMAIN_BLOCKLIST`: **_empty_**: 如果非空，逗號分隔的域名列表，不能用於在此實例上註冊，支援通配符。
- `SHOW_REGISTRATION_BUTTON`: **! DISABLE_REGISTRATION**: 顯示註冊按鈕
- `SHOW_MILESTONES_DASHBOARD_PAGE`: **true** 啟用此項以顯示里程碑儀表板頁面 - 查看所有使用者的里程碑
- `AUTO_WATCH_NEW_REPOS`: **true** 啟用此項以在建立新儲存庫時讓所有組織使用者觀看新儲存庫
- `AUTO_WATCH_ON_CHANGES`: **false** 啟用此項以在首次提交後使使用者觀看儲存庫
- `DEFAULT_USER_VISIBILITY`: **public**: 為使用者設定預設的可見性模式，可以是"public"、"limited"或"private"。
- `ALLOWED_USER_VISIBILITY_MODES`: **public,limited,private**: 設定使用者可以具有的可見性模式
- `DEFAULT_ORG_VISIBILITY`: **public**: 為組織設定預設的可見性模式，可以是"public"、"limited"或"private"。
- `DEFAULT_ORG_MEMBER_VISIBLE`: **false**: 如果添加到組織時將使用者的成員身份可見，設定為 True。
- `ALLOW_ONLY_INTERNAL_REGISTRATION`: **false**: 設定為 True 以強制僅通過 Gitea 進行註冊。
- `ALLOW_ONLY_EXTERNAL_REGISTRATION`: **false**: 設定為 True 以強制僅使用第三方服務進行註冊。
- `NO_REPLY_ADDRESS`: **noreply.DOMAIN**: 如果使用者將 KeepEmailPrivate 設定為 True，則在 Git 日誌中的使用者電子電子郵件地址的域部分的值。DOMAIN 解析為 server.DOMAIN 中的值。
  使用者的電子郵件將被替換為小寫的使用者名稱、"@"和 NO_REPLY_ADDRESS 的連接。
- `USER_DELETE_WITH_COMMENTS_MAX_TIME`: **0**: 使用者刪除後，評論將保留的最短時間。
- `VALID_SITE_URL_SCHEMES`: **http, https**: 使用者個人資料的有效站點 URL 方案

### Service - Explore (`service.explore`)

- `REQUIRE_SIGNIN_VIEW`: **false**: 僅允許已登入的使用者查看探索頁面。
- `DISABLE_USERS_PAGE`: **false**: 禁用使用者探索頁面。
- `DISABLE_ORGANIZATIONS_PAGE`: **false**: 禁用組織探索頁面。
- `DISABLE_CODE_PAGE`: **false**: 禁用程式碼探索頁面。

## SSH Minimum Key Sizes (`ssh.minimum_key_sizes`)

定義允許的算法及其最小密鑰長度（使用-1 來禁用某個類型）：

- `ED25519`：**256**
- `ECDSA`：**256**
- `RSA`：**3071**: 我們在這裡設定為 2047，因為一個其他方面有效的 3072 RSA 密鑰可能被報告為 3071 長度。
- `DSA`：**-1**: 預設情況下禁用 DSA。設定為**1024**以重新啟用，但請注意可能需要重新設定您的 SSHD 提供者

## Webhook (`webhook`)

- `QUEUE_LENGTH`: **1000**: 鉤子任務隊列長度。編輯此值時要小心。
- `DELIVER_TIMEOUT`: **5**: 發送 Webhook 的交付超時時間（秒）。
- `ALLOWED_HOST_LIST`: **external**: 出於安全原因，Webhook 僅能調用允許的主機。以逗號分隔的列表。
  - 內置網路：
    - `loopback`：IPv4 的 127.0.0.0/8 和 IPv6 的 ::1/128，包括 localhost。
    - `private`：RFC 1918（10.0.0.0/8，172.16.0.0/12，192.168.0.0/16）和 RFC 4193（FC00::/7）。也稱為 LAN/Intranet。
    - `external`：一個有效的非私有單播 IP，您可以訪問公共互聯網上的所有主機。
    - `*`：允許所有主機。
  - CIDR 列表：IPv4 的 `1.2.3.0/8` 和 IPv6 的 `2001:db8::/32`
  - 通配符主機：`*.mydomain.com`，`192.168.100.*`
- `SKIP_TLS_VERIFY`: **false**: 允許不安全的證書。
- `PAGING_NUM`: **10**: 一頁中顯示的 Webhook 歷史事件數量。
- `PROXY_URL`: **_empty_**: 代理伺服器 URL，支援 http://、https://、socks://，留空將遵循環境的 http_proxy/https_proxy 設定。如果未提供，將使用全域代理設定。
- `PROXY_HOSTS`: **_empty_**: 需要代理的主機名的逗號分隔列表。支援通配符模式 (\*)；使用 \*\* 來匹配所有主機。如果未提供，將使用全域代理設定。

## 郵件 (`mailer`)

⚠️ 此部分適用於 Gitea 1.18 及更高版本。如果您使用的是 Gitea 1.17 或更早版本，請閱讀以下鏈接獲取更多資訊：
[Gitea 1.17 app.ini 範例](https://github.com/go-gitea/gitea/blob/release/v1.17/custom/conf/app.example.ini)
和
[Gitea 1.17 設定文件](https://github.com/go-gitea/gitea/blob/release/v1.17/docs/content/doc/advanced/config-cheat-sheet.zh-tw.md)

- `ENABLED`: **false**: 是否啟用郵件服務。
- `PROTOCOL`: **_empty_**: 郵件服務協議，可選擇 "smtp"、"smtps"、"smtp+starttls"、"smtp+unix"、"sendmail"、"dummy"。在 Gitea 1.18 之前，郵件服務協議由 `MAILER_TYPE` 和 `IS_TLS_ENABLED` 兩個設定共同決定。
  - SMTP 類族，如果您的提供者沒有明確說明使用的是哪個協議，但提供了一個端口，您可以設定 SMTP_PORT，它將被推斷出來。
  - **sendmail** 使用操作系統的 `sendmail` 命令，而不是 SMTP。這在 Linux 系統上很常見。
  - **dummy** 將郵件消息發送到日誌，作為測試階段。
  - 請注意，啟用 sendmail 將忽略所有其他 `mailer` 設定，除了 `ENABLED`、`FROM`、`SUBJECT_PREFIX` 和 `SENDMAIL_PATH`。
  - 啟用 dummy 將忽略所有設定，除了 `ENABLED`、`SUBJECT_PREFIX` 和 `FROM`。
- `SMTP_ADDR`: **_empty_**: 郵件伺服器地址，例如 smtp.gmail.com。對於 smtp+unix，這應該是一個到 unix socket 的路徑。在 1.18 之前，此設定與 `SMTP_PORT` 合併，名稱為 `HOST`。
- `SMTP_PORT`: **_empty_**: 郵件伺服器端口。如果未指定協議，將透過此設定進行推斷。常用端口如下。在 1.18 之前，此設定與 `SMTP_ADDR` 合併，名稱為 `HOST`。
  - 25：不安全的簡單郵件傳輸協議（insecure SMTP）
  - 465：安全的簡單郵件傳輸協議（SMTP Secure）
  - 587：StartTLS
- `USE_CLIENT_CERT`: **false**: 使用客戶端證書進行 TLS/SSL 加密。
- `CLIENT_CERT_FILE`: **custom/mailer/cert.pem**: 客戶端證書文件。
- `CLIENT_KEY_FILE`: **custom/mailer/key.pem**: 客戶端密鑰文件。
- `FORCE_TRUST_SERVER_CERT`: **false**: 如果設定為 `true`，將完全忽略伺服器證書驗證錯誤。此選項不安全。考慮將證書添加到系統信任儲存中。
- `USER`: **_empty_**: 郵件使用者的使用者名稱（通常是發件人的電子電子郵件地址）。
- `PASSWD`: **_empty_**: 郵件使用者的密碼。如果密碼中使用了特殊字符，請使用 \`your password\` 進行引用。
  - 請注意：只有在 SMTP 伺服器通信通過 TLS 加密（可以透過 `STARTTLS` 實現）或 SMTP 主機是 localhost 時，才支援身份驗證。有關更多資訊，請參閱 [郵件設定](../administration/email-setup.md)。
- `ENABLE_HELO`: **true**: 啟用 HELO 操作。
- `HELO_HOSTNAME`: **（從系統檢索）**: HELO 主機名。
- `FROM`: **_empty_**: 郵件的發件人地址，符合 RFC 5322。這可以是一個電子電子郵件地址，也可以是 "Name" \<email@example.com\> 格式。
- `ENVELOPE_FROM`: **_empty_**: 在 SMTP 郵件信封上設定的地址作為發件地址。設定為 `<>` 以發送一個空地址。
- `SUBJECT_PREFIX`: **_empty_**: 放置在電子郵件主題行之前的前綴。
- `SENDMAIL_PATH`: **sendmail**: 操作系統上 `sendmail` 的位置（可以是命令或完整路徑）。
- `SENDMAIL_ARGS`: **_empty_**: 指定任何額外的 sendmail 參數。（注意：您應該知道電子電子郵件地址可能看起來像選項 - 如果您的 `sendmail` 命令帶有選項，您必須設定選項終止符 `--`）
- `SENDMAIL_TIMEOUT`: **5m**: 通過 sendmail 發送電子郵件的預設超時時間。
- `SENDMAIL_CONVERT_CRLF`: **true**: 大多數版本的 sendmail 偏好使用 LF 換行符，而不是 CRLF 換行符。如果您的 sendmail 版本需要 CRLF 換行符，請將此設定為 false。
- `SEND_BUFFER_LEN`: **100**: 郵件隊列的緩衝區長度。**已棄用**，請在 `[queue.mailer]` 中使用 `LENGTH`。
- `SEND_AS_PLAIN_TEXT`: **false**: 僅以純文本形式發送郵件，不包括 HTML 備選方案。

## 入站郵件 (`email.incoming`)

- `ENABLED`: **false**: 啟用處理入站郵件。
- `REPLY_TO_ADDRESS`: **_empty_**: 包括 `%{token}` 佔位符的電子電子郵件地址，該佔位符將根據使用者/操作進行替換。範例：`incoming+%{token}@example.com`。佔位符必須出現在地址的使用者部分（在 `@` 之前）。
- `HOST`: **_empty_**: IMAP 伺服器主機。
- `PORT`: **_empty_**: IMAP 伺服器端口。
- `USERNAME`: **_empty_**: 接收帳戶的使用者名稱。
- `PASSWORD`: **_empty_**: 接收帳戶的密碼。
- `USE_TLS`: **false**: IMAP 伺服器是否使用 TLS。
- `SKIP_TLS_VERIFY`: **false**: 如果設定為 `true`，將完全忽略伺服器證書驗證錯誤。此選項不安全。
- `MAILBOX`: **INBOX**: 入站郵件將到達的郵箱名稱。
- `DELETE_HANDLED_MESSAGE`: **true**: 是否應從郵箱中刪除已處理的消息。
- `MAXIMUM_MESSAGE_SIZE`: **10485760**: 要處理的消息的最大大小。忽略更大的消息。將其設定為 0 以允許每種大小。

## 緩存 (`cache`)

- `ADAPTER`: **memory**: 緩存引擎，可以為 `memory`, `redis`, `redis-cluster`, `twoqueue` 和 `memcache`. (`twoqueue` 代表緩衝區固定的 LRU 緩存)
- `INTERVAL`: **60**: 垃圾回收間隔(秒)，只對`memory`和`towqueue`有效。
- `HOST`: **_empty_**: 緩存設定。`redis`, `redis-cluster`，`memcache`設定連接字符串;`twoqueue` 設定隊列參數
  - Redis: `redis://:macaron@127.0.0.1:6379/0?pool_size=100&idle_timeout=180s`
  - Redis-cluster `redis+cluster://:macaron@127.0.0.1:6379/0?pool_size=100&idle_timeout=180s`
  - Memcache: `127.0.0.1:9090;127.0.0.1:9091`
  - TwoQueue LRU cache: `{"size":50000,"recent_ratio":0.25,"ghost_ratio":0.5}` 或者 `50000`，代表緩衝區的緩存對象容量
- `ITEM_TTL`: **16h**: 緩存專案失效時間，設定為 -1 則禁用緩存

### 緩存 - 最後提交緩存設定 (`cache.last_commit`)

- `ITEM_TTL`: **8760h**: 如果未使用，保持緩存中的專案的時間，將其設定為 -1 會禁用緩存。
- `COMMITS_COUNT`: **1000**: 僅在儲存庫的提交計數大於時啟用緩存。

## 會話 (`session`)

- `PROVIDER`: **memory**: 會話儲存引擎 \[memory, file, redis, redis-cluster, db, mysql, couchbase, memcache, postgres\]。設定為 `db` 將會重用 `[database]` 的設定資訊。
- `PROVIDER_CONFIG`: **data/sessions**: 對於文件，為根路徑；對於 db，為空（將使用資料庫設定）；對於其他引擎，為連接字符串。相對路徑將根據 _`AppWorkPath`_ 絕對化。
- `COOKIE_SECURE`: **_empty_**: `true` 或 `false`。啟用此選項以強制在所有會話訪問中使用 HTTPS。如果沒有設定，當 ROOT_URL 是 https 鏈接的時候預設設定為 true。
- `COOKIE_NAME`: **i_like_gitea**: 用於會話 ID 的 cookie 名稱。
- `GC_INTERVAL_TIME`: **86400**: GC 間隔時間，以秒為單位。
- `SESSION_LIFE_TIME`: **86400**: 會話生命週期，以秒為單位，預設為 86400（1 天）。
- `DOMAIN`: **_empty_**: 設定 cookie 的域。
- `SAME_SITE`: **lax** \[strict, lax, none\]：為 cookie 設定 SameSite 屬性。

## 圖像 (`picture`)

- `GRAVATAR_SOURCE`: **gravatar**: 頭像來源，可以是 gravatar、duoshuo 或類似 http://cn.gravatar.com/avatar/ 的來源。
  `http://cn.gravatar.com/avatar/`。
- `DISABLE_GRAVATAR`: **false**: 啟用後，只使用內部頭像。**已棄用 [v1.18+]** 該設定已遷移到資料庫中保存，通過管理員面板進行設定。
- `ENABLE_FEDERATED_AVATAR`: **false**: 啟用頭像聯盟支援（參見
  [http://www.libravatar.org](http://www.libravatar.org)）。**已棄用 [v1.18+]** 該設定已遷移到資料庫中保存，通過管理員面板進行設定。

- `AVATAR_STORAGE_TYPE`: **default**: 在 `[storage.xxx]` 中定義的儲存類型。預設為 `default`，如果沒有 `[storage]` 部分，則將讀取 `[storage]`，如果沒有則將是 `local` 類型。
- `AVATAR_UPLOAD_PATH`: **data/avatars**: 儲存使用者頭像圖像文件的路徑。
- `AVATAR_MAX_WIDTH`: **4096**: 頭像的最大寬度，以像素為單位。
- `AVATAR_MAX_HEIGHT`: **4096**: 頭像的最大高度，以像素為單位。
- `AVATAR_MAX_FILE_SIZE`: **1048576**（1MiB）：頭像的最大大小。
- `AVATAR_MAX_ORIGIN_SIZE`: **262144**（256KiB）：如果上傳的文件不大於此位元組大小，則圖像將原樣使用，無需調整大小/轉換。
- `AVATAR_RENDERED_SIZE_FACTOR`: **2**: 渲染的頭像圖像的乘法因子。較大的值在 HiDPI 設備上會產生更細膩的渲染。

- `REPOSITORY_AVATAR_STORAGE_TYPE`: **default**: 在 `[storage.xxx]` 中定義的儲存類型。預設為 `default`，如果沒有 `[storage]` 部分，則將讀取 `[storage]`，如果沒有則將是 `local` 類型。
- `REPOSITORY_AVATAR_UPLOAD_PATH`: **data/repo-avatars**: 儲存庫頭像圖像文件的路徑。
- `REPOSITORY_AVATAR_FALLBACK`: **none**: Gitea 處理缺少儲存庫頭像的方式
  - none = 不顯示任何頭像
  - random = 生成隨機頭像
  - image = 使用預設圖像（在 `REPOSITORY_AVATAR_FALLBACK_IMAGE` 中設定），如果設定為 image 並且未上傳任何圖像。
- `REPOSITORY_AVATAR_FALLBACK_IMAGE`: **/img/repo_default.png**: 作為預設儲存庫頭像的圖像（如果將 `REPOSITORY_AVATAR_FALLBACK` 設定為 image 並且沒有上傳圖像）。

## 專案 (`project`)

預設專案看板的模板：

- `PROJECT_BOARD_BASIC_KANBAN_TYPE`: **待辦，進行中，已完成**
- `PROJECT_BOARD_BUG_TRIAGE_TYPE`: **待分析，高優先級，低優先級，已關閉**

## 工單和合併請求的附件 (`attachment`)

- `ENABLED`: **true**: 是否允許使用者上傳附件。
- `ALLOWED_TYPES`: **.avif,.cpuprofile,.csv,.dmp,.docx,.fodg,.fodp,.fods,.fodt,.gif,.gz,.jpeg,.jpg,.json,.jsonc,.log,.md,.mov,.mp4,.odf,.odg,.odp,.ods,.odt,.patch,.pdf,.png,.pptx,.svg,.tgz,.txt,.webm,.webp,.xls,.xlsx,.zip**: 允許的文件擴展名（`.zip`）、mime 類型（`text/plain`）或通配符類型（`image/*`、`audio/*`、`video/*`）的逗號分隔列表。空值或 `*/*` 允許所有類型。
- `MAX_SIZE`: **2048**: 附件的最大限制（MB）。
- `MAX_FILES`: **5**: 一次最多上傳的附件數量。
- `STORAGE_TYPE`: **local**: 附件的儲存類型，`local` 表示本地磁盤，`minio` 表示相容 S3 的對象儲存服務，如果未設定將使用預設值 `local` 或其他在 `[storage.xxx]` 中定義的名稱。
- `SERVE_DIRECT`: **false**: 允許儲存驅動器重定向到經過身份驗證的 URL 以直接提供文件。目前，只支援 Minio/S3 通過簽名 URL 提供支援，local 不會執行任何操作。
- `PATH`: **attachments**: 儲存附件的路徑，僅當 STORAGE_TYPE 為 `local` 時可用。如果是相對路徑，將會被解析為 `{AppDataPath}/{attachment.PATH}`.
- `MINIO_ENDPOINT`: **localhost:9000**: Minio 端點以連接，僅當 STORAGE_TYPE 為 `minio` 時可用。
- `MINIO_ACCESS_KEY_ID`: Minio accessKeyID 以連接，僅當 STORAGE_TYPE 為 `minio` 時可用。
- `MINIO_SECRET_ACCESS_KEY`: Minio secretAccessKey 以連接，僅當 STORAGE_TYPE 為 `minio` 時可用。
- `MINIO_BUCKET`: **gitea**: Minio 儲存附件的儲存桶，僅當 STORAGE_TYPE 為 `minio` 時可用。
- `MINIO_LOCATION`: **us-east-1**: Minio 儲存桶的位置以建立，僅當 STORAGE_TYPE 為 `minio` 時可用。
- `MINIO_BASE_PATH`: **attachments/**: Minio 儲存桶上的基本路徑，僅當 STORAGE_TYPE 為 `minio` 時可用。
- `MINIO_USE_SSL`: **false**: Minio 啟用 SSL，僅當 STORAGE_TYPE 為 `minio` 時可用。
- `MINIO_INSECURE_SKIP_VERIFY`: **false**: Minio 跳過 SSL 驗證，僅當 STORAGE_TYPE 為 `minio` 時可用。
- `MINIO_CHECKSUM_ALGORITHM`: **default**: Minio 校驗算法：`default`（適用於 MinIO 或 AWS S3）或 `md5`（適用於 Cloudflare 或 Backblaze）
- `MINIO_BUCKET_LOOKUP_TYPE`: **auto**: Minio 的 bucket 查找方式預設為`auto`模式，可將其設定為`dns`（虛擬託管樣式）或`path`（路徑樣式），僅當`STORAGE_TYPE`為`minio`時可用。

## 日誌 (`log`)

- `ROOT_PATH`: **_empty_**: 日誌文件的根目錄。
- `MODE`: **console**: 日誌模式。對於多個模式，請使用逗號分隔。您可以在每個模式的日誌子部分中設定每個模式。 `\[log.writer-mode-name\]`.
- `LEVEL`: **Info**: 日誌級別。可選值：\[Trace, Debug, Info, Warn, Error, Critical, Fatal, None\]
- `STACKTRACE_LEVEL`: **None**: 記錄建立堆棧跟蹤的預設日誌級別（很少有用，不要設定它）。可選值：\[Trace, Debug, Info, Warn, Error, Critical, Fatal, None\]
- `ENABLE_SSH_LOG`: **false**: 將 SSH 日誌保存到日誌文件中。
- `logger.access.MODE`: **_empty_**: "access" 記錄器
- `logger.router.MODE`: **,**: "router" 記錄器，單個逗號表示它將使用上述預設 MODE
- `logger.xorm.MODE`: **,**: "xorm" 記錄器

### 訪問日誌 (`log`)

- `ACCESS_LOG_TEMPLATE`: **`{{.Ctx.RemoteHost}} - {{.Identity}} {{.Start.Format "[02/Jan/2006:15:04:05 -0700]" }} "{{.Ctx.Req.Method}} {{.Ctx.Req.URL.RequestURI}} {{.Ctx.Req.Proto}}" {{.ResponseWriter.Status}} {{.ResponseWriter.Size}} "{{.Ctx.Req.Referer}}" "{{.Ctx.Req.UserAgent}}"`**: 設定用於建立訪問日誌的模板。
  - 可用以下變量：
  - `Ctx`: 請求的 `context.Context`。
  - `Identity`: 登入的 SignedUserName 或 `"-"`（如果未登入）。
  - `Start`: 請求的開始時間。
  - `ResponseWriter`: 請求的 responseWriter。
  - `RequestID`: 與 REQUEST_ID_HEADERS 相匹配的值（預設：如果不匹配則為 `-`）。
  - 您必須非常小心，確保此模板不會引發錯誤或 panic，因為此模板在 panic/recovery 腳本之外運行。
- `REQUEST_ID_HEADERS`: **_empty_**: 您可以在這裡設定由逗號分隔的多個值。它將按照設定的順序進行匹配，最終將在訪問日誌中打印第一個匹配的值。
  - 例如：
  - 在請求頭中：X-Request-ID: **test-id-123**
  - 在 app.ini 中的設定：REQUEST_ID_HEADERS = X-Request-ID
  - 在日誌中打印：127.0.0.1:58384 - - [14/Feb/2023:16:33:51 +0800] "**test-id-123**" ...

### 日誌子部分 (`log.<writer-mode-name>`)

- `MODE`: **name**: 設定此日誌記錄器的模式 - 預設為提供的子部分名稱。這允許您在不同級別上具有兩個不同的文件日誌記錄器。
- `LEVEL`: **log.LEVEL**: 設定此日誌記錄器的日誌級別。預設為全域 `[log]` 部分中設定的 `LEVEL`。
- `STACKTRACE_LEVEL`: **log.STACKTRACE_LEVEL**: 設定記錄堆棧跟蹤的日誌級別。
- `EXPRESSION`: **""**: 用於匹配函數名稱、文件或消息的正則表達式。預設為空。只有匹配表達式的日誌消息纔會保存在記錄器中。
- `FLAGS`: **stdflags**: 逗號分隔的字符串，表示日誌標誌。預設為 `stdflags`，表示前綴：`2009/01/23 01:23:23 ...a/b/c/d.go:23:runtime.Caller() [I]: message`。`none` 表示不要在日誌行前綴中添加任何內容。有關更多資訊，請參見 `modules/log/flags.go`。
- `PREFIX`: **""**: 該記錄器中每個日誌行的附加前綴。預設為空。
- `COLORIZE`: **false**: 是否為日誌行添加顏色

### 控制檯日誌模式 (`log.console` 或 `MODE=console`)

- 對於控制檯記錄器，如果不在 Windows 上或終端被確定為能夠著色，則 `COLORIZE` 預設為 `true`。
- `STDERR`: **false**: 使用 Stderr 而不是 Stdout。

### 文件日誌模式 (`log.file` 或 `MODE=file`)

- `FILE_NAME`: 設定此記錄器的文件名。預設為 `gitea.log`（例外：訪問日誌預設為 `access.log`）。如果是相對路徑，將相對於 `ROOT_PATH`。
- `LOG_ROTATE`: **true**: 旋轉日誌文件。
- `MAX_SIZE_SHIFT`: **28**: 單個文件的最大大小移位，28 表示 256Mb。
- `DAILY_ROTATE`: **true**: 每天旋轉日誌。
- `MAX_DAYS`: **7**: 在 n 天后刪除日誌文件
- `COMPRESS`: **true**: 預設使用 gzip 壓縮舊的日誌文件
- `COMPRESSION_LEVEL`: **-1**: 壓縮級別

### 連接日誌模式 (`log.conn` 或 `MODE=conn`)

- `RECONNECT_ON_MSG`: **false**: 對每個單獨的消息重新連接主機。
- `RECONNECT`: **false**: 當連接丟失時嘗試重新連接。
- `PROTOCOL`: **tcp**: 設定協議，可以是 "tcp"、"unix" 或 "udp"。
- `ADDR`: **:7020**: 設定要連接到的地址。

## 定時任務 (`cron`)

- `ENABLED`: **false**: 是否在後臺運行定期任務。
- `RUN_AT_START`: **false**: 在應用程式啟動時運行定時任務。
- `NOTICE_ON_SUCCESS`: **false**: 設定為 true 時，任務成功完成時將進行通知。

- `SCHEDULE` 接受的格式:
  - 完整的 crontab 語法規範, e.g. `* * * * * ?`
  - 描述符 e.g. `@midnight`, `@every 1h30m` ...
  - 更多詳見: [cron documentation](https://pkg.go.dev/github.com/gogs/cron@v0.0.0-20171120032916-9f6c956d3e14)

### 基本定時任務 - 預設開啟

#### 定時任務 - 刪除舊的儲存庫存檔 (`cron.archive_cleanup`)

- `ENABLED`: **true**: 是否啟用該定時任務。
- `RUN_AT_START`: **true**: 設定在服務啟動時運行。
- `SCHEDULE`: **@midnight**: 使用 Cron 語法的定時任務觸發設定，例如 `@every 1h`。
- `OLDER_THAN`: **24h**: 超過`OLDER_THAN`時間的存檔將被刪除，例如 `12h`。

#### 定時任務 - 更新鏡像儲存庫 (`cron.update_mirrors`)

- `SCHEDULE`: **@every 10m**: 使用 Cron 語法的定時任務觸發設定，例如 `@every 3h`。
- `PULL_LIMIT`: **50**: 將要添加到隊列的鏡像數量限制為此數字（負值表示無限制，0 將導致不會將鏡像加入隊列，從而有效地禁用鏡像更新）。
- `PUSH_LIMIT`: **50**: 將要添加到隊列的鏡像數量限制為此數字（負值表示無限制，0 將導致不會將鏡像加入隊列，從而有效地禁用鏡像更新）。

#### 定時任務 - 健康檢查所有儲存庫 (`cron.repo_health_check`)

- `SCHEDULE`: **@midnight**: Cron 語法，用於安排儲存庫健康檢查。
- `TIMEOUT`: **60s**: 用於健康檢查執行超時的時間持續語法。
- `ARGS`: **_empty_**: `git fsck` 命令的參數，例如 `--unreachable --tags`。在 http://git-scm.com/docs/git-fsck 上了解更多。

#### 定時任務 - 檢查所有儲存庫統計 (`cron.check_repo_stats`)

- `RUN_AT_START`: **true**: 在啟動時運行儲存庫統計檢查。
- `SCHEDULE`: **@midnight**: Cron 語法，用於安排儲存庫統計檢查。

#### 定時任務 - 清理 hook_task 表 (`cron.cleanup_hook_task_table`)

- `ENABLED`: **true**: 啟用清理 hook_task 任務。
- `RUN_AT_START`: **false**: 在啟動時運行清理 hook_task（如果啟用）。
- `SCHEDULE`: **@midnight**: Cron 語法，用於清理 hook_task 表。
- `CLEANUP_TYPE` **OlderThan** OlderThan 或 PerWebhook 方法來清理 hook_task，可以按年齡（即 hook_task 記錄傳遞多久）或按每個 Webhook 保留的數量（即每個 Webhook 保留最新的 x 個傳遞）來清理。
- `OLDER_THAN`: **168h**: 如果 CLEANUP_TYPE 設定為 OlderThan，則早於此表達式的任何傳遞的 hook_task 記錄將被刪除。
- `NUMBER_TO_KEEP`: **10**: 如果 CLEANUP_TYPE 設定為 PerWebhook，則 Webhook 的此數量 hook_task 記錄將被保留（即保留最新的 x 個傳遞）。

#### Cron - 清理過期的包 (`cron.cleanup_packages`)

- `ENABLED`: **true**: 啟用清理過期包任務。
- `RUN_AT_START`: **true**: 在啟動時運行任務（如果啟用）。
- `NOTICE_ON_SUCCESS`: **false**: 每次運行此任務時都會通知。
- `SCHEDULE`: **@midnight**: Cron 語法，用於任務。
- `OLDER_THAN`: **24h**: 未引用的包資料建立超過 OLDER_THAN 時間的包將被刪除。

#### Cron - 更新遷移海報 ID (`cron.update_migration_poster_id`)

- `SCHEDULE`: **@midnight** : 同步之間的間隔作為持續時間，每次實例啟動時都會嘗試同步。

#### Cron - 同步外部使用者 (`cron.sync_external_users`)

- `SCHEDULE`: **@midnight** : 同步之間的間隔作為持續時間，每次實例啟動時都會嘗試同步。
- `UPDATE_EXISTING`: **true**: 建立新使用者，更新現有使用者資料，並禁用不再在外部源中的使用者（預設設定）或僅在 UPDATE_EXISTING 設定為 false 時建立新使用者。

### 擴展的定時任務（預設未啟用）

#### Cron - 垃圾收集所有儲存庫 (`cron.git_gc_repos`)

- `ENABLED`: **false**: 啟用服務。
- `RUN_AT_START`: **false**: 在啟動時運行任務（如果啟用）。
- `SCHEDULE`: **@every 72h**: Cron 語法，用於安排儲存庫存檔清理，例如 `@every 1h`。
- `TIMEOUT`: **60s**: 用於垃圾收集執行超時的時間持續語法。
- `NOTICE_ON_SUCCESS`: **false**: 設定為 true 以打開成功通知。
- `ARGS`: **_empty_**: `git gc` 命令的參數，例如 `--aggressive --auto`。預設值與 [git] -> GC_ARGS 相同。

#### Cron - 使用 Gitea SSH 密鑰更新 '.ssh/authorized_keys' 文件 (`cron.resync_all_sshkeys`)

- `ENABLED`: **false**: 啟用服務。
- `RUN_AT_START`: **false**: 在啟動時運行任務（如果啟用）。
- `NOTICE_ON_SUCCESS`: **false**: 設定為 true 以打開成功通知。
- `SCHEDULE`: **@every 72h**: Cron 語法，用於安排儲存庫存檔清理，例如 `@every 1h`。

#### Cron - 重新同步所有儲存庫的 pre-receive、update 和 post-receive 鉤子 (`cron.resync_all_hooks`)

- `ENABLED`: **false**: 啟用服務。
- `RUN_AT_START`: **false**: 在啟動時運行任務（如果啟用）。
- `NOTICE_ON_SUCCESS`: **false**: 設定為 true 以打開成功通知。
- `SCHEDULE`: **@every 72h**: Cron 語法，用於安排儲存庫存檔清理，例如 `@every 1h`。

#### Cron - 重新初始化所有缺失的 Git 儲存庫，但記錄已存在 (`cron.reinit_missing_repos`)

- `ENABLED`: **false**: 啟用服務。
- `RUN_AT_START`: **false**: 在啟動時運行任務（如果啟用）。
- `NOTICE_ON_SUCCESS`: **false**: 設定為 true 以打開成功通知。
- `SCHEDULE`: **@every 72h**: Cron 語法，用於安排儲存庫存檔清理，例如 `@every 1h`。

#### Cron - 刪除所有缺少 Git 文件的儲存庫 (`cron.delete_missing_repos`)

- `ENABLED`: **false**: 啟用服務。
- `RUN_AT_START`: **false**: 在啟動時運行任務（如果啟用）。
- `NOTICE_ON_SUCCESS`: **false**: 設定為 true 以打開成功通知。
- `SCHEDULE`: **@every 72h**: Cron 語法，用於安排儲存庫存檔清理，例如 `@every 1h`。

#### Cron - 刪除生成的儲存庫頭像 (`cron.delete_generated_repository_avatars`)

- `ENABLED`: **false**: 啟用服務。
- `RUN_AT_START`: **false**: 在啟動時運行任務（如果啟用）。
- `NOTICE_ON_SUCCESS`: **false**: 設定為 true 以打開成功通知。
- `SCHEDULE`: **@every 72h**: Cron 語法，用於安排儲存庫存檔清理，例如 `@every 1h`。

#### Cron - 從資料庫中刪除所有舊的操作 (`cron.delete_old_actions`)

- `ENABLED`: **false**: 啟用服務。
- `RUN_AT_START`: **false**: 在啟動時運行任務（如果啟用）。
- `NOTICE_ON_SUCCESS`: **false**: 設定為 true 以打開成功通知。
- `SCHEDULE`: **@every 168h**: Cron 語法，用於設定多長時間進行檢查。
- `OLDER_THAN`: **8760h**: 早於此表達式的任何操作都將從資料庫中刪除，建議使用 `8760h`（1 年），因為這是熱力圖的最大長度。

#### Cron - 從資料庫中刪除所有舊的系統通知 (`cron.delete_old_system_notices`)

- `ENABLED`: **false**: 啟用服務。
- `RUN_AT_START`: **false**: 在啟動時運行任務（如果啟用）。
- `NO_SUCCESS_NOTICE`: **false**: 設定為 true 以關閉成功通知。
- `SCHEDULE`: **@every 168h**: Cron 語法，用於設定多長時間進行檢查。
- `OLDER_THAN`: **8760h**: 早於此表達式的任何系統通知都將從資料庫中刪除。

#### Cron - 在儲存庫中回收 LFS 指針 (`cron.gc_lfs`)

- `ENABLED`: **false**: 啟用服務。
- `RUN_AT_START`: **false**: 在啟動時運行任務（如果啟用）。
- `SCHEDULE`: **@every 24h**: Cron 語法，用於設定多長時間進行檢查。
- `OLDER_THAN`: **168h**: 只會嘗試回收早於此時間（預設 7 天）的 LFSMetaObject。
- `LAST_UPDATED_MORE_THAN_AGO`: **72h**: 只會嘗試回收超過此時間（預設 3 天）沒有嘗試過回收的 LFSMetaObject。
- `NUMBER_TO_CHECK_PER_REPO`: **100**: 每個儲存庫要檢查的過期 LFSMetaObject 的最小數量。設定為 `0` 以始終檢查所有。

## Git (`git`)

- `PATH`: **""**: Git 可執行文件的路徑。如果為空，Gitea 將在 PATH 環境中搜索。
- `HOME_PATH`: **`{APP_DATA_PATH}/home`**: Git 的 HOME 目錄。
  此目錄將用於包含 Gitea 的 git 調用將使用的`.gitconfig`和可能的`.gnupg`目錄。如果您可以確認 Gitea 是在此環境中唯一運行的應用程式，您可以將其設定為 Gitea 使用者的正常主目錄。
- `DISABLE_DIFF_HIGHLIGHT`: **false**: 禁用已添加和已刪除更改的高亮顯示。
- `MAX_GIT_DIFF_LINES`: **1000**: 在 diff 視圖中允許單個文件的最大行數。
- `MAX_GIT_DIFF_LINE_CHARACTERS`: **5000**: 在 diff 視圖中每行的最大字符數。
- `MAX_GIT_DIFF_FILES`: **100**: 在 diff 視圖中顯示的最大文件數。
- `COMMITS_RANGE_SIZE`: **50**: 設定預設的提交範圍大小
- `BRANCHES_RANGE_SIZE`: **20**: 設定預設的分支範圍大小
- `GC_ARGS`: **_empty_**: 命令`git gc`的參數，例如`--aggressive --auto`。更多資訊請參見http://git-scm.com/docs/git-gc/
- `ENABLE_AUTO_GIT_WIRE_PROTOCOL`: **true**: 如果使用 Git 版本 >= 2.18 時使用 Git wire 協議版本 2，預設為 true，當您始終希望使用 Git wire 協議版本 1 時設定為 false。
  要在使用 OpenSSH 伺服器的情況下為通過 SSH 的 Git 啟用此功能，請將`AcceptEnv GIT_PROTOCOL`添加到您的 sshd_config 文件中。
- `PULL_REQUEST_PUSH_MESSAGE`: **true**: 對於推送到非預設分支的響應，使用 URL 建立拉取請求（如果啟用了該儲存庫的拉取請求）
- `VERBOSE_PUSH`: **true**: 在處理推送時打印有關推送狀態的資訊。
- `VERBOSE_PUSH_DELAY`: **5s**: 僅在推送時間超過此延遲時纔打印詳細資訊。
- `LARGE_OBJECT_THRESHOLD`: **1048576**: （僅限於 Go-Git），不要在內存中緩存大於此大小的對象。（設定為 0 以禁用。）
- `DISABLE_CORE_PROTECT_NTFS`: **false** 將`core.protectNTFS`強制設定為 false。
- `DISABLE_PARTIAL_CLONE`: **false** 禁用使用部分克隆進行 git。

### Git - 超時設定 (`git.timeout`)

- `DEFAULT`: **360**: Git 操作的預設超時時間，單位秒
- `MIGRATE`: **600**: 在遷移外部儲存庫時的超時時間，單位秒
- `MIRROR`: **300**: 在鏡像外部儲存庫時的超時時間，單位秒
- `CLONE`: **300**: 在儲存庫之間進行內部克隆的超時時間，單位秒
- `PULL`: **300**: 在儲存庫之間進行內部拉取的超時時間，單位秒
- `GC`: **60**: git 儲存庫 GC 的超時時間，單位秒

### Git - 設定選項 (`git.config`)

此部分中的鍵/值對將用作 git 設定。
此部分僅執行“設定”設定，從此部分中刪除的設定鍵不會自動從 git 設定中刪除。格式為`some.configKey = value`。

- `diff.algorithm`: **histogram**
- `core.logAllRefUpdates`: **true**
- `gc.reflogExpire`: **90**

## 指標 (`metrics`)

- `ENABLED`: **false**: 啟用/prometheus 的 metrics 端點。
- `ENABLED_ISSUE_BY_LABEL`: **false**: 啟用按標籤統計問題，格式為`gitea_issues_by_label{label="bug"} 2`。
- `ENABLED_ISSUE_BY_REPOSITORY`: **false**: 啟用按儲存庫統計問題，格式為`gitea_issues_by_repository{repository="org/repo"} 5`。
- `TOKEN`: **_empty_**: 如果要在授權中包含指標，則需要指定令牌。相同的令牌需要在 prometheus 參數`bearer_token`或`bearer_token_file`中使用。

## API (`api`)

- `ENABLE_SWAGGER`: **true**: 啟用 API 文件介面 (`/api/swagger`, `/api/v1/swagger`, …). True or false。
- `MAX_RESPONSE_ITEMS`: **50**: API 分頁的最大單頁專案數。
- `DEFAULT_PAGING_NUM`: **30**: API 分頁的預設分頁數。
- `DEFAULT_GIT_TREES_PER_PAGE`: **1000**: Git trees API 的預設單頁專案數。
- `DEFAULT_MAX_BLOB_SIZE`: **10485760** (10MiB): blobs API 的預設最大文件大小。

## OAuth2 (`oauth2`)

- `ENABLED`: **true**: 啟用 OAuth2 提供者。
- `ACCESS_TOKEN_EXPIRATION_TIME`：**3600**: OAuth2 存取權杖的生命週期，以秒為單位。
- `REFRESH_TOKEN_EXPIRATION_TIME`：**730**: OAuth2 刷新令牌的生命週期，以小時為單位。
- `INVALIDATE_REFRESH_TOKENS`：**false**: 檢查刷新令牌是否已被使用。
- `JWT_SIGNING_ALGORITHM`：**RS256**: 用於簽署 OAuth2 令牌的算法。有效值：[`HS256`，`HS384`，`HS512`，`RS256`，`RS384`，`RS512`，`ES256`，`ES384`，`ES512`]。
- `JWT_SECRET`：**_empty_**: OAuth2 訪問和刷新令牌的身份驗證密鑰，請將其更改為唯一的字符串。僅當`JWT_SIGNING_ALGORITHM`設定為`HS256`，`HS384`或`HS512`時才需要此設定。
- `JWT_SECRET_URI`：**_empty_**: 可以使用此設定選項，而不是在設定中定義`JWT_SECRET`，以向 Gitea 提供包含密鑰的文件的路徑（範例值：`file:/etc/gitea/oauth2_jwt_secret`）。
- `JWT_SIGNING_PRIVATE_KEY_FILE`：**jwt/private.pem**: 用於簽署 OAuth2 令牌的私鑰文件路徑。路徑相對於`APP_DATA_PATH`。僅當`JWT_SIGNING_ALGORITHM`設定為`RS256`，`RS384`，`RS512`，`ES256`，`ES384`或`ES512`時才需要此設定。文件必須包含 PKCS8 格式的 RSA 或 ECDSA 私鑰。如果不存在密鑰，則將為您建立一個 4096 位密鑰。
- `MAX_TOKEN_LENGTH`：**32767**: 從 OAuth2 提供者接受的令牌/cookie 的最大長度。
- `DEFAULT_APPLICATIONS`：**git-credential-oauth，git-credential-manager, tea**: 在啟動時預註冊用於某些服務的 OAuth 應用程式。有關可用選項列表，請參閱[OAuth2 文件](/development/oauth2-provider.md)。

## i18n (`i18n`)

- `LANGS`: **en-US,zh-CN,zh-HK,zh-TW,de-DE,fr-FR,nl-NL,lv-LV,ru-RU,uk-UA,ja-JP,es-ES,pt-BR,pt-PT,pl-PL,bg-BG,it-IT,fi-FI,tr-TR,cs-CZ,sv-SE,ko-KR,el-GR,fa-IR,hu-HU,id-ID,ml-IN**:
  在語言選擇器中顯示的區域設定列表。如果使用者瀏覽器的語言與列表中的任何區域設定不匹配，則將使用第一個區域設定作為預設值。

- `NAMES`：**English,簡體中文,繁體中文（香港）,繁體中文（臺灣）,Deutsch,Français,Nederlands,Latviešu,Русский,Українська,日本語,Español,Português do Brasil,Português de Portugal,Polski,Български,Italiano,Suomi,Türkçe,Čeština,Српски,Svenska,한국어,Ελληνικά,فارسی,Magyar nyelv,Bahasa Indonesia,മലയാളം**:
  對應於各區域設定的可見名稱。

## Markup (`markup`)

- `MERMAID_MAX_SOURCE_CHARACTERS`: **5000**: 設定 Mermaid 源的最大大小。(設為-1 代表禁止)

gitea 支援外部渲染工具，你可以設定你熟悉的文件渲染工具. 比如一下將新增一個名字為 asciidoc 的渲染工具。

```ini
[markup.asciidoc]
ENABLED = true
NEED_POSTPROCESS = true
FILE_EXTENSIONS = .adoc,.asciidoc
RENDER_COMMAND = "asciidoctor --embedded --safe-mode=secure --out-file=- -"
IS_INPUT_FILE = false
```

- ENABLED：**false** 設定是否啟動渲染器
- NEED_POSTPROCESS：**true** 設定為**true**以替換鏈接/SHA1 等。
- FILE*EXTENSIONS：\*\*\_empty*\*\* 要由外部命令渲染的文件擴展名列表。多個擴展名需要用逗號分隔。
- RENDER_COMMAND：用於渲染所有匹配的擴展名的外部命令。
- IS_INPUT_FILE：**false** 輸入不是標準輸入，而是一個在`RENDER_COMMAND`之後帶有文件參數的文件。
- RENDER_CONTENT_MODE：**sanitized** 內容將如何呈現。
  - sanitized：對內容進行清理，並在當前頁面內呈現，預設僅允許一些 HTML 標籤和屬性。可以在`[markup.sanitizer.*]`中定義自訂的清理規則。
  - no-sanitizer：禁用清理程式，在當前頁面內呈現內容。這是**不安全**的，如果內容包含惡意程式碼，可能會導致 XSS 攻擊。
  - iframe：在單獨的獨立頁面中呈現內容，並通過 iframe 嵌入到當前頁面中。iframe 處於禁用同源策略的沙箱模式，並且 JS 程式碼與父頁面安全隔離。

兩個特殊的環境變量會傳遞給渲染命令：

- `GITEA_PREFIX_SRC`，其中包含`src`路徑樹中的當前 URL 前綴。用作鏈接的前綴。
- `GITEA_PREFIX_RAW`，其中包含`raw`路徑樹中的當前 URL 前綴。用作圖像路徑的前綴。

如果`RENDER_CONTENT_MODE`為`sanitized`，Gitea 支援自訂用於呈現的 HTML 的清理策略。下面的範例將支援來自 pandoc 的 KaTeX 輸出。

```ini
[markup.sanitizer.TeX]
; Pandoc renders TeX segments as <span>s with the "math" class, optionally
; with "inline" or "display" classes depending on context.
ELEMENT = span
ALLOW_ATTR = class
REGEXP = ^\s*((math(\s+|$)|inline(\s+|$)|display(\s+|$)))+
ALLOW_DATA_URI_IMAGES = true
```

- `ELEMENT`：此策略適用於的元素。必須非空。
- `ALLOW_ATTR`：此策略允許的屬性。必須非空。
- `REGEXP`：用於匹配屬性內容的正則表達式。必須存在，但可以為空，以無條件允許此屬性的白名單。
- `ALLOW_DATA_URI_IMAGES`：**false** 允許資料 URI 圖像（`<img src="data:image/png;base64,..."/>`）。

可以透過添加唯一的子節來定義多個清理規則，例如`[markup.sanitizer.TeX-2]`。
要僅為指定的外部渲染器應用清理規則，它們必須使用渲染器名稱，例如`[markup.sanitizer.asciidoc.rule-1]`。
如果規則在渲染器 ini 節之上定義，或者名稱與渲染器不匹配，則應用於每個渲染器。

## 程式碼高亮映射 (`highlight.mapping`)

- `file_extension 比如 .toml`: **language 比如 ini**。文件擴展名到語言的映射覆蓋。

- Gitea 將使用 `.gitattributes` 文件中的 `linguist-language` 或 `gitlab-language` 屬性來對文件進行高亮顯示，如果可用。
  如果未設定此屬性或語言不可用，則將查找文件擴展名在此映射中或使用啟發式方法來確定文件類型。

## 時間 (`time`)

- `DEFAULT_UI_LOCATION`：在 UI 上的預設時間位置，以便我們可以在 UI 上顯示正確的使用者時間。例如：Asia/Shanghai

## 遷移 (`migrations`)

- `MAX_ATTEMPTS`：**3**: 每次 http/https 請求的最大嘗試次數（用於遷移）。
- `RETRY_BACKOFF`：**3**: 每次 http/https 請求重試的退避時間（秒）。
- `ALLOWED_DOMAINS`：**_empty_**: 允許遷移儲存庫的域名允許列表，預設為空。這意味著允許外部網址。多個域名可以用逗號分隔。支援通配符：`github.com, *.github.com`。
- `BLOCKED_DOMAINS`：**_empty_**: 阻止遷移儲存庫的域名阻止列表，預設為空。多個域名可以用逗號分隔。當 `ALLOWED_DOMAINS` 不為空時，此選項優先級較高，用於拒絕域名。支援通配符。
- `ALLOW_LOCALNETWORKS`：**false**: 允許 RFC 1918、RFC 1122、RFC 4632 和 RFC 4291 中定義的私有地址。如果域名被 `ALLOWED_DOMAINS` 允許，此選項將被忽略。
- `SKIP_TLS_VERIFY`：**false**: 允許跳過 TLS 驗證。

## 聯邦（`federation`）

- `ENABLED`：**false**: 啟用/禁用聯邦功能。
- `SHARE_USER_STATISTICS`：**true**: 如果啟用聯邦，則啟用/禁用節點資訊的使用者統計資訊。
- `MAX_SIZE`：**4**: 聯邦請求和響應的最大大小（MB）。

警告：更改以下設定可能會破壞聯邦功能。

- `ALGORITHMS`：**rsa-sha256, rsa-sha512, ed25519**: HTTP 簽名算法。
- `DIGEST_ALGORITHM`：**SHA-256**: HTTP 簽名摘要算法。
- `GET_HEADERS`：**(request-target), Date**: 用於聯邦請求的 GET 頭部。
- `POST_HEADERS`：**(request-target), Date, Digest**: 用於聯邦請求的 POST 頭部。

## 包（`packages`）

- `ENABLED`：**true**: 啟用/禁用包註冊表功能。
- `CHUNKED_UPLOAD_PATH`：**tmp/package-upload**: 分塊上傳的路徑。預設為 `APP_DATA_PATH` + `tmp/package-upload`。
- `LIMIT_TOTAL_OWNER_COUNT`：**-1**: 單個所有者可以擁有的包版本的最大數量（`-1` 表示無限制）。
- `LIMIT_TOTAL_OWNER_SIZE`：**-1**: 單個所有者可以使用的包的最大大小（`-1` 表示無限制，格式為 `1000`、`1 MB`、`1 GiB`）。
- `LIMIT_SIZE_ALPINE`：**-1**: Alpine 上傳的最大大小（`-1` 表示無限制，格式為 `1000`、`1 MB`、`1 GiB`）。
- `LIMIT_SIZE_CARGO`：**-1**: Cargo 上傳的最大大小（`-1` 表示無限制，格式為 `1000`、`1 MB`、`1 GiB`）。
- `LIMIT_SIZE_CHEF`：**-1**: Chef 上傳的最大大小（`-1` 表示無限制，格式為 `1000`、`1 MB`、`1 GiB`）。
- `LIMIT_SIZE_COMPOSER`：**-1**: Composer 上傳的最大大小（`-1` 表示無限制，格式為 `1000`、`1 MB`、`1 GiB`）。
- `LIMIT_SIZE_CONAN`：**-1**: Conan 上傳的最大大小（`-1` 表示無限制，格式為 `1000`、`1 MB`、`1 GiB`）。
- `LIMIT_SIZE_CONDA`：**-1**: Conda 上傳的最大大小（`-1` 表示無限制，格式為 `1000`、`1 MB`、`1 GiB`）。
- `LIMIT_SIZE_CONTAINER`：**-1**: Container 上傳的最大大小（`-1` 表示無限制，格式為 `1000`、`1 MB`、`1 GiB`）。
- `LIMIT_SIZE_CRAN`：**-1**: CRAN 上傳的最大大小（`-1` 表示無限制，格式為 `1000`、`1 MB`、`1 GiB`）。
- `LIMIT_SIZE_DEBIAN`：**-1**: Debian 上傳的最大大小（`-1` 表示無限制，格式為 `1000`、`1 MB`、`1 GiB`）。
- `LIMIT_SIZE_GENERIC`：**-1**: 通用上傳的最大大小（`-1` 表示無限制，格式為 `1000`、`1 MB`、`1 GiB`）。
- `LIMIT_SIZE_GO`：**-1**: Go 上傳的最大大小（`-1` 表示無限制，格式為 `1000`、`1 MB`、`1 GiB`）。
- `LIMIT_SIZE_HELM`：**-1**: Helm 上傳的最大大小（`-1` 表示無限制，格式為 `1000`、`1 MB`、`1 GiB`）。
- `LIMIT_SIZE_MAVEN`：**-1**: Maven 上傳的最大大小（`-1` 表示無限制，格式為 `1000`、`1 MB`、`1 GiB`）。
- `LIMIT_SIZE_NPM`：**-1**: npm 上傳的最大大小（`-1` 表示無限制，格式為 `1000`、`1 MB`、`1 GiB`）。
- `LIMIT_SIZE_NUGET`：**-1**: NuGet 上傳的最大大小（`-1` 表示無限制，格式為 `1000`、`1 MB`、`1 GiB`）。
- `LIMIT_SIZE_PUB`：**-1**: Pub 上傳的最大大小（`-1` 表示無限制，格式為 `1000`、`1 MB`、`1 GiB`）。
- `LIMIT_SIZE_PYPI`：**-1**: PyPI 上傳的最大大小（`-1` 表示無限制，格式為 `1000`、`1 MB`、`1 GiB`）。
- `LIMIT_SIZE_RPM`：**-1**: RPM 上傳的最大大小（`-1` 表示無限制，格式為 `1000`、`1 MB`、`1 GiB`）。
- `LIMIT_SIZE_RUBYGEMS`：**-1**: RubyGems 上傳的最大大小（`-1` 表示無限制，格式為 `1000`、`1 MB`、`1 GiB`）。
- `LIMIT_SIZE_SWIFT`：**-1**: Swift 上傳的最大大小（`-1` 表示無限制，格式為 `1000`、`1 MB`、`1 GiB`）。
- `LIMIT_SIZE_VAGRANT`：**-1**: Vagrant 上傳的最大大小（`-1` 表示無限制，格式為 `1000`、`1 MB`、`1 GiB`）。

## 鏡像（`mirror`）

- `ENABLED`：**true**: 啟用鏡像功能。設定為 **false** 以禁用所有鏡像。預先存在的鏡像保持有效，但不會更新；可以轉換為常規儲存庫。
- `DISABLE_NEW_PULL`：**false**: 禁用建立**新的**拉取鏡像。預先存在的鏡像保持有效。如果 `mirror.ENABLED` 為 `false`，將被忽略。
- `DISABLE_NEW_PUSH`：**false**: 禁用建立**新的**推送鏡像。預先存在的鏡像保持有效。如果 `mirror.ENABLED` 為 `false`，將被忽略。
- `DEFAULT_INTERVAL`：**8h**: 每次檢查之間的預設間隔。
- `MIN_INTERVAL`：**10m**: 檢查的最小間隔。（必須大於 1 分鐘）。

## LFS (`lfs`)

用於 lfs 資料的儲存設定。當將 `STORAGE_TYPE` 設定為 `xxx` 時，它將從預設的 `[storage]` 或 `[storage.xxx]` 派生。
當派生時，`PATH` 的預設值是 `data/lfs`，`MINIO_BASE_PATH` 的預設值是 `lfs/`。

- `STORAGE_TYPE`：**local**: lfs 的儲存類型，`local` 表示本地磁盤，`minio` 表示 S3 相容對象儲存服務，或者使用 `[storage.xxx]` 中定義的其他名稱。
- `SERVE_DIRECT`：**false**: 允許儲存驅動程式重定向到經過身份驗證的 URL 以直接提供文件。目前，僅支援通過簽名的 URL 提供 Minio/S3，本地不執行任何操作。
- `PATH`：**./data/lfs**: 儲存 LFS 文件的位置，僅在 `STORAGE_TYPE` 為 `local` 時可用。如果未設定，則回退到 `[server]` 部分中已棄用的 `LFS_CONTENT_PATH` 值。
- `MINIO_ENDPOINT`：**localhost:9000**: 連接的 Minio 終端點，僅在 `STORAGE_TYPE` 為 `minio` 時可用。
- `MINIO_ACCESS_KEY_ID`：Minio 的 accessKeyID，僅在 `STORAGE_TYPE` 為 `minio` 時可用。
- `MINIO_SECRET_ACCESS_KEY`：Minio 的 secretAccessKey，僅在 `STORAGE_TYPE` 為 `minio` 時可用。
- `MINIO_BUCKET`：**gitea**: 用於儲存 lfs 的 Minio 桶，僅在 `STORAGE_TYPE` 為 `minio` 時可用。
- `MINIO_LOCATION`：**us-east-1**: 建立桶的 Minio 位置，僅在 `STORAGE_TYPE` 為 `minio` 時可用。
- `MINIO_BASE_PATH`：**lfs/**: 桶上的 Minio 基本路徑，僅在 `STORAGE_TYPE` 為 `minio` 時可用。
- `MINIO_USE_SSL`：**false**: Minio 啟用 ssl，僅在 `STORAGE_TYPE` 為 `minio` 時可用。
- `MINIO_INSECURE_SKIP_VERIFY`：**false**: Minio 跳過 SSL 驗證，僅在 `STORAGE_TYPE` 為 `minio` 時可用。
- `MINIO_BUCKET_LOOKUP_TYPE`: **auto**: Minio 的 bucket 查找方式預設為`auto`模式，可將其設定為`dns`（虛擬託管樣式）或`path`（路徑樣式），僅當`STORAGE_TYPE`為`minio`時可用。

## 儲存 (`storage`)

預設的附件、lfs、頭像、儲存庫頭像、儲存庫歸檔、套件、操作日誌、artifacts 的儲存設定。推薦僅僅設定此 section 並讓其它的 section 從此設定項繼承。

- `STORAGE_TYPE`：**local**: 儲存類型，`local` 表示本地磁盤，`minio` 表示 S3，`azureblob` 表示 azure 對象儲存。
- `SERVE_DIRECT`：**false**: 允許儲存驅動程式重定向到經過身份驗證的 URL 以直接提供文件。目前，僅支援通過簽名的 URL 提供 Minio/S3，本地不執行任何操作。
- `MINIO_ENDPOINT`：**localhost:9000**: 連接的 Minio 終端點，僅在 `STORAGE_TYPE` 為 `minio` 時可用。
- `MINIO_ACCESS_KEY_ID`：Minio 的 accessKeyID，僅在 `STORAGE_TYPE` 為 `minio` 時可用。
- `MINIO_SECRET_ACCESS_KEY`：Minio 的 secretAccessKey，僅在 `STORAGE_TYPE` 為 `minio` 時可用。
- `MINIO_BUCKET`：**gitea**: 用於儲存資料的 Minio 桶，僅在 `STORAGE_TYPE` 為 `minio` 時可用。
- `MINIO_LOCATION`：**us-east-1**: 建立桶的 Minio 位置，僅在 `STORAGE_TYPE` 為 `minio` 時可用。
- `MINIO_USE_SSL`：**false**: Minio 啟用 ssl，僅在 `STORAGE_TYPE` 為 `minio` 時可用。
- `MINIO_INSECURE_SKIP_VERIFY`：**false**: Minio 跳過 SSL 驗證，僅在 `STORAGE_TYPE` 為 `minio` 時可用。
- `MINIO_BUCKET_LOOKUP_TYPE`: **auto**: Minio 的 bucket 查找方式預設為`auto`模式，可將其設定為`dns`（虛擬託管樣式）或`path`（路徑樣式），僅當`STORAGE_TYPE`為`minio`時可用。

- `AZURE_BLOB_ENDPOINT`: **_empty_**: Azure Blob 終端點，僅在 `STORAGE_TYPE` 為 `azureblob` 時可用。例如：https://accountname.blob.core.windows.net 或 http://127.0.0.1:10000/devstoreaccount1
- `AZURE_BLOB_ACCOUNT_NAME`: **_empty_**: Azure Blob 賬號名，僅在 `STORAGE_TYPE` 為 `azureblob` 時可用。
- `AZURE_BLOB_ACCOUNT_KEY`: **_empty_**: Azure Blob 訪問密鑰，僅在 `STORAGE_TYPE` 為 `azureblob` 時可用。
- `AZURE_BLOB_CONTAINER`: **gitea**: 用於儲存資料的 Azure Blob 容器名，僅在 `STORAGE_TYPE` 為 `azureblob` 時可用。

建議的 minio 儲存設定如下：

```ini
[storage]
STORAGE_TYPE = minio
; Minio endpoint to connect only available when STORAGE_TYPE is `minio`
MINIO_ENDPOINT = localhost:9000
; Minio accessKeyID to connect only available when STORAGE_TYPE is `minio`
MINIO_ACCESS_KEY_ID =
; Minio secretAccessKey to connect only available when STORAGE_TYPE is `minio`
MINIO_SECRET_ACCESS_KEY =
; Minio bucket to store the attachments only available when STORAGE_TYPE is `minio`
MINIO_BUCKET = gitea
; Minio location to create bucket only available when STORAGE_TYPE is `minio`
MINIO_LOCATION = us-east-1
; Minio enabled ssl only available when STORAGE_TYPE is `minio`
MINIO_USE_SSL = false
; Minio skip SSL verification available when STORAGE_TYPE is `minio`
MINIO_INSECURE_SKIP_VERIFY = false
SERVE_DIRECT = true
; Minio bucket lookup method defaults to auto mode; set it to `dns` for virtual host style or `path` for path style, only available when STORAGE_TYPE is `minio`
MINIO_BUCKET_LOOKUP_TYPE = auto
```

預設情況下，每個儲存都有其預設的基本路徑，如下所示：

| storage           | default base path  |
| ----------------- | ------------------ |
| attachments       | attachments/       |
| lfs               | lfs/               |
| avatars           | avatars/           |
| repo-avatars      | repo-avatars/      |
| repo-archive      | repo-archive/      |
| packages          | packages/          |
| actions_log       | actions_log/       |
| actions_artifacts | actions_artifacts/ |

並且桶（bucket）、基本路徑或`SERVE_DIRECT`可以是特殊的或被覆蓋的，如果您想要使用不同的設定，您可以：

```ini
[storage.actions_log]
MINIO_BUCKET = gitea_actions_log
SERVE_DIRECT = true
MINIO_BASE_PATH = my_actions_log/ ; default is actions_log/ if blank
```

如果您想為' lfs '自訂一個不同的儲存，如果上面定義了預設儲存

```ini
[lfs]
STORAGE_TYPE = my_minio

[storage.my_minio]
STORAGE_TYPE = minio
; Minio endpoint to connect only available when STORAGE_TYPE is `minio`
MINIO_ENDPOINT = localhost:9000
; Minio accessKeyID to connect only available when STORAGE_TYPE is `minio`
MINIO_ACCESS_KEY_ID =
; Minio secretAccessKey to connect only available when STORAGE_TYPE is `minio`
MINIO_SECRET_ACCESS_KEY =
; Minio bucket to store the attachments only available when STORAGE_TYPE is `minio`
MINIO_BUCKET = gitea
; Minio location to create bucket only available when STORAGE_TYPE is `minio`
MINIO_LOCATION = us-east-1
; Minio enabled ssl only available when STORAGE_TYPE is `minio`
MINIO_USE_SSL = false
; Minio skip SSL verification available when STORAGE_TYPE is `minio`
MINIO_INSECURE_SKIP_VERIFY = false
; Minio bucket lookup method defaults to auto mode; set it to `dns` for virtual host style or `path` for path style, only available when STORAGE_TYPE is `minio`
MINIO_BUCKET_LOOKUP_TYPE = auto
```

### 儲存庫歸檔儲存 (`storage.repo-archive`)

儲存庫歸檔儲存的設定。當將`STORAGE_TYPE`設定為`xxx`時，它將繼承預設的 `[storage]` 或 `[storage.xxx]` 設定。`PATH`的預設值是`data/repo-archive`，`MINIO_BASE_PATH`的預設值是`repo-archive/`。

- `STORAGE_TYPE`: **local**: 儲存類型，`local`表示本地磁盤，`minio`表示與 S3 相容的對象儲存服務，或者使用定義為`[storage.xxx]`的其他名稱。
- `SERVE_DIRECT`: **false**: 允許儲存驅動程式重定向到經過身份驗證的 URL 以直接提供文件。目前，只有 Minio/S3 支援通過簽名 URL，本地不執行任何操作。
- `PATH`: **./data/repo-archive**: 用於儲存歸檔文件的位置，僅在`STORAGE_TYPE`為`local`時可用。
- `MINIO_ENDPOINT`: **localhost:9000**: Minio 端點，僅在`STORAGE_TYPE`為`minio`時可用。
- `MINIO_ACCESS_KEY_ID`: Minio 的 accessKeyID，僅在`STORAGE_TYPE`為`minio`時可用。
- `MINIO_SECRET_ACCESS_KEY`: Minio 的 secretAccessKey，僅在`STORAGE_TYPE`為`minio`時可用。
- `MINIO_BUCKET`: **gitea**: 用於儲存歸檔的 Minio 儲存桶，僅在`STORAGE_TYPE`為`minio`時可用。
- `MINIO_LOCATION`: **us-east-1**: 用於建立儲存桶的 Minio 位置，僅在`STORAGE_TYPE`為`minio`時可用。
- `MINIO_BASE_PATH`: **repo-archive/**: 儲存桶上的 Minio 基本路徑，僅在`STORAGE_TYPE`為`minio`時可用。
- `MINIO_USE_SSL`: **false**: 啟用 Minio 的 SSL，僅在`STORAGE_TYPE`為`minio`時可用。
- `MINIO_INSECURE_SKIP_VERIFY`: **false**: 跳過 Minio 的 SSL 驗證，僅在`STORAGE_TYPE`為`minio`時可用。
- `MINIO_BUCKET_LOOKUP_TYPE`: **auto**: Minio 的 bucket 查找方式預設為`auto`模式，可將其設定為`dns`（虛擬託管樣式）或`path`（路徑樣式），僅當`STORAGE_TYPE`為`minio`時可用。

### 儲存庫歸檔 (`repo-archive`)

- `STORAGE_TYPE`: **local**: 儲存類型，用於操作日誌，`local`表示本地磁盤，`minio`表示與 S3 相容的對象儲存服務，預設為`local`，或者使用定義為`[storage.xxx]`的其他名稱。
- `MINIO_BASE_PATH`: **repo-archive/**: Minio 儲存桶上的基本路徑，僅在`STORAGE_TYPE`為`minio`時可用。

## 代理 (`proxy`)

- `PROXY_ENABLED`: **false**: 啟用代理，如果為 true，所有通過 HTTP 向外部的請求都將受到影響，如果為 false，即使環境設定了 http_proxy/https_proxy 也不會使用
- `PROXY_URL`: **_empty_**: 代理伺服器地址，支援 http://, https//, socks://，為空則不啟用代理而使用環境變量中的 http_proxy/https_proxy
- `PROXY_HOSTS`: **_empty_**: 逗號分隔的多個需要代理的網址，支援 \* 號匹配符號， \*\* 表示匹配所有網站

i.e.

```ini
PROXY_ENABLED = true
PROXY_URL = socks://127.0.0.1:1080
PROXY_HOSTS = *.github.com
```

<a id="actions-actions"></a>
## Actions (`actions`)

- `ENABLED`: **true**: 啟用/禁用操作功能
- `DEFAULT_ACTIONS_URL`: **github**: 獲取操作外掛的預設平台，`github`表示`https://github.com`，`self`表示當前的 Gitea 實例。
- `STORAGE_TYPE`: **local**: 用於操作日誌的儲存類型，`local`表示本地磁盤，`minio`表示與 S3 相容的對象儲存服務，預設為`local`，或者使用定義為`[storage.xxx]`的其他名稱。
- `MINIO_BASE_PATH`: **actions_log/**: Minio 儲存桶上的基本路徑，僅在`STORAGE_TYPE`為`minio`時可用。
- `LOG_RETENTION_DAYS`: **365**: 日誌保留時間（天）。此期限後將刪除舊日誌。
- `LOG_COMPRESSION`: **zstd**: 日誌壓縮方式，`none`表示不壓縮，`zstd`表示 zstd 壓縮。
  其它的壓縮方式如`gzip`是不支援的，因為查看日誌需要可尋址流。
  如果 CPU 或內存不是瓶頸，建議在使用本地磁盤作為日誌儲存時總是使用壓縮。
  對於像 S3 這樣的會對請求次數計費的對象儲存服務，每次查看日誌會導致額外的 2 次獲取請求。
  但它將節省儲存空間和網路帶寬，因此仍然建議使用壓縮。
- `ARTIFACT_RETENTION_DAYS`: **90**: 保留 artifacts 的預設天數。可以透過在`actions/upload-artifact`步驟中設定`retention-days`選項來指定 artifacts 的保留期。
- `ZOMBIE_TASK_TIMEOUT`: **10m**: 殭屍任務超時時間，指具有運行狀態但長時間未更新的任務。
- `ENDLESS_TASK_TIMEOUT`: **3h**: 無盡任務超時時間，指具有運行狀態並持續更新，但長時間未結束的任務。
- `ABANDONED_JOB_TIMEOUT`: **24h**: 被遺棄的作業超時時間，指具有等待狀態但長時間未被 runner 選中並執行的作業。
- `SKIP_WORKFLOW_STRINGS`: **[skip ci],[ci skip],[no ci],[skip actions],[actions skip]**: 提交者可以在提交消息或 PR 標題中放置的字符串，以跳過執行相應的工作流。

`DEFAULT_ACTIONS_URL` 指示 Gitea 操作運行程式應該在哪裡找到帶有相對路徑的操作。
例如，`uses: actions/checkout@v4` 表示 `https://github.com/actions/checkout@v4`，因為 `DEFAULT_ACTIONS_URL` 的值為 `github`。
它可以更改為 `self`，以使其成為 `root_url_of_your_gitea/actions/checkout@v4`。

請注意，對於大多數情況，不建議使用 `self`，因為它可能使名稱在全域範圍內產生歧義。
此外，它要求您將所有所需的操作鏡像到您的 Gitea 實例，這可能不值得。
因此，請僅在您瞭解自己在做什麼的情況下使用 `self`。

在早期版本（`<= 1.19`）中，`DEFAULT_ACTIONS_URL` 可以設定為任何自訂 URL，例如 `https://gitea.com` 或 `http://your-git-server,https://gitea.com`，預設值為 `https://gitea.com`。
然而，後來的更新刪除了這些選項，現在唯一的選項是 `github` 和 `self`，預設值為 `github`。
但是，如果您想要使用其他 Git 伺服器中的操作，您可以在 `uses` 欄位中使用完整的 URL，Gitea 支援此功能（GitHub 不支援）。
例如 `uses: https://gitea.com/actions/checkout@v4` 或 `uses: http://your-git-server/actions/checkout@v4`。

## 其他 (`other`)

- `SHOW_FOOTER_VERSION`: **true**: 在頁面底部顯示 Gitea 的版本。
- `SHOW_FOOTER_TEMPLATE_LOAD_TIME`: **true**: 在頁腳顯示模板執行的時間。
- `SHOW_FOOTER_POWERED_BY`: **true**: 在頁腳顯示“由...提供動力”的文本。
- `ENABLE_SITEMAP`: **true**: 生成 sitemap.
- `ENABLE_FEED`: **true**: 是否啟用 RSS/Atom
