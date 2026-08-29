---
date: "2020-01-25T21:00:00-03:00"
slug: "cmd-embedded"
sidebar_position: 20
aliases:
  - /zh-tw/cmd-embedded
---

# 嵌入式資料提取工具

Gitea 的可執行文件包含運行所需的所有資源：模板、圖像、樣式表和翻譯。可以透過將替換文件放置在 `custom` 目錄中的匹配路徑中來覆蓋其中的任何資源（請參閱 [自訂 Gitea](../administration/customizing-gitea.md)）。

要獲取嵌入資源的副本以供編輯，可以從操作系統的 shell 介面使用 CLI 的 `embedded` 命令。

:::note
嵌入式資料提取工具包含在 Gitea 1.12 及更高版本中。
:::

## 列出資源

要列出嵌入在 Gitea 可執行文件中的資源，請使用以下語法：

```sh
gitea embedded list [--include-vendored] [patterns...]
```

`--include-vendored` 標誌使命令包括供應商文件，這些文件通常被排除在外；即，Gitea 所需的外部庫中的文件（例如 [octicons](https://octicons.github.com/) 等）。

可以提供文件搜索模式列表。Gitea 使用 [gobwas/glob](https://github.com/gobwas/glob) 進行其 glob 語法。以下是一些範例：

- 列出所有模板文件，在任何虛擬目錄中：`**.tmpl`
- 列出所有郵件模板文件：`templates/mail/**.tmpl`
- 列出 `public/assets/img` 內的所有文件：`public/assets/img/**`

不要忘記對模式使用引號，因為空格、`*` 和其他字符可能對您的命令 shell 有特殊含義。

如果未提供任何模式，則列出所有文件。

### 範例：列出所有嵌入文件

列出所有路徑中包含 `openid` 的嵌入文件：

```sh
$ gitea embedded list '**openid**'
public/assets/img/auth/openid_connect.svg
public/assets/img/openid-16x16.png
templates/user/auth/finalize_openid.tmpl
templates/user/auth/signin_openid.tmpl
templates/user/auth/signup_openid_connect.tmpl
templates/user/auth/signup_openid_navbar.tmpl
templates/user/auth/signup_openid_register.tmpl
templates/user/settings/security_openid.tmpl
```

## 提取資源

要提取嵌入在 Gitea 可執行文件中的資源，請使用以下語法：

```sh
gitea [--config {file}] embedded extract [--destination {dir}|--custom] [--overwrite|--rename] [--include-vendored] {patterns...}
```

`--config` 選項告訴 Gitea `app.ini` 設定文件的位置（如果它不在預設位置）。此選項僅與 `--custom` 標誌一起使用。

`--destination` 選項告訴 Gitea 文件必須提取到的目錄。預設是當前目錄。

`--custom` 標誌告訴 Gitea 將文件直接提取到 `custom` 目錄中。為了使其工作，命令需要知道 `app.ini` 設定文件的位置（`--config`），並且根據設定，從 Gitea 通常啟動的目錄運行。詳情請參閱 [自訂 Gitea](../administration/customizing-gitea.md)。

`--overwrite` 標誌允許覆蓋目標目錄中的任何現有文件。

`--rename` 標誌告訴 Gitea 將目標目錄中的任何現有文件重命名為 `filename.bak`。以前的 `.bak` 文件將被覆蓋。

必須提供至少一個文件搜索模式；請參閱上面的 `list` 子命令以瞭解模式語法和範例。

### 重要通知

確保**僅提取那些需要自訂的文件**。`custom` 目錄中存在的文件不會被 Gitea 的升級過程升級。當 Gitea 升級到新版本（通過替換可執行文件）時，許多嵌入文件將發生變化。Gitea 將尊重並使用 `custom` 目錄中找到的任何文件，即使它們是舊的且不相容。

### 範例：提取郵件模板

將郵件模板提取到臨時目錄：

```sh
$ mkdir tempdir
$ gitea embedded extract --destination tempdir 'templates/mail/**.tmpl'
Extracting to tempdir:
tempdir/templates/mail/auth/activate.tmpl
tempdir/templates/mail/auth/activate_email.tmpl
tempdir/templates/mail/auth/register_notify.tmpl
tempdir/templates/mail/auth/reset_passwd.tmpl
tempdir/templates/mail/issue/assigned.tmpl
tempdir/templates/mail/issue/default.tmpl
tempdir/templates/mail/notify/collaborator.tmpl
```
