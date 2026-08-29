---
date: "2023-05-23T09:00:00+08:00"

slug: "cmd-embedded"
sidebar_position: 20

aliases:
  - /zh-tw/cmd-embedded
---

# 嵌入資源提取工具

Gitea 的可執行文件包含了運行所需的所有資源：模板、圖片、樣式表和翻譯文件。你可以透過在 `custom` 目錄下的相應路徑中放置替換文件來覆蓋其中的任何資源（詳見 [自訂 Gitea 設定](../administration/customizing-gitea.md)）。

要獲取嵌入資源的副本以進行編輯，可以使用 CLI 中的 `embedded` 命令，通過操作系統的 shell 執行。

**注意：** 嵌入資源提取工具包含在 Gitea 1.12 及以上版本中。

## 資源列表

要列出嵌入在 Gitea 可執行文件中的資源，請使用以下語法：

```sh
gitea embedded list [--include-vendored] [patterns...]
```

`--include-vendored` 標誌使命令包括被供應的文件，這些文件通常被排除在外；即來自外部庫的文件，這些文件是 Gitea 所需的（例如 [octicons](https://octicons.github.com/) 等）。

可以提供一系列文件搜索模式。Gitea 使用 [gobwas/glob](https://github.com/gobwas/glob) 作為其 glob 語法。以下是一些範例：

- 列出所有模板文件，無論在哪個虛擬目錄下：`**.tmpl`
- 列出所有郵件模板文件：`templates/mail/**.tmpl`
  列出 `public/assets/img` 目錄下的所有文件：`public/assets/img/**`

不要忘記為模式使用引號，因為空格、`*` 和其他字符可能對命令行解釋器有特殊含義。

如果未提供模式，則列出所有文件。

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

`--config` 選項用於告知 Gitea `app.ini` 設定文件的位置（如果不在預設位置）。此選項僅在使用 `--custom` 標誌時使用。

`--destination` 選項用於指定提取文件的目標目錄。預設為當前目錄。

`--custom` 標誌告知 Gitea 直接將文件提取到 `custom` 目錄中。為使其正常工作，該命令需要知道 `app.ini` 設定文件的位置（通過 `--config` 指定），並且根據設定的不同，需要從 Gitea 通常啟動的目錄運行。有關詳細資訊，請參閱 [自訂 Gitea 設定](../administration/customizing-gitea.md)。

`--overwrite` 標誌允許覆蓋目標目錄中的任何現有文件。

`--rename` 標誌告知 Gitea 將目標目錄中的任何現有文件重命名為 `filename.bak`。之前的 `.bak` 文件將被覆蓋。

至少需要提供一個文件搜索模式；有關模式的語法和範例，請參閱上述 `list` 子命令。

### 重要提示

請確保**只提取需要自訂的文件**。位於 `custom` 目錄中的文件不會受到 Gitea 的升級過程的影響。當 Gitea 升級到新版本（通過替換可執行文件）時，許多嵌入文件將發生變化。Gitea 將尊重並使用在 `custom` 目錄中找到的任何文件，即使這些文件是舊的和不相容的。

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
