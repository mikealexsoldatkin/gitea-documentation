---
date: "2017-04-15T14:56:00+02:00"
slug: "customizing-gitea"
sidebar_position: 100

aliases:
  - /zh-tw/customizing-gitea
---

# 自訂 Gitea 設定

Gitea 引用 `custom` 目錄中的自訂設定文件來覆蓋設定、模板等預設設定。

如果從二進制部署 Gitea ，則所有預設路徑都將相對於該 gitea 二進制文件；如果從發行版安裝，則可能會將這些路徑修改為 Linux 文件系統標準。Gitea
將會自動建立包括 `custom/` 在內的必要應用目錄，應用本身的設定存放在
`custom/conf/app.ini` 當中。在發行版中可能會以 `/etc/gitea/` 的形式為 `custom` 設定一個符號鏈接，查看設定詳情請移步：

- [快速備忘單](../administration/config-cheat-sheet.md)
- [完整設定清單](https://github.com/go-gitea/gitea/blob/main/custom/conf/app.example.ini)

如果您在 binary 同目錄下無法找到 `custom` 文件夾，請檢查您的 `GITEA_CUSTOM`
環境變量設定， 因為它可能被設定到了其他地方（可能被一些啟動腳本設定指定了目錄）。

- [環境變量清單](../administration/environment-variables.md)

**注：** 必須完全重啟 Gitea 以使設定生效。

## 使用自訂 /robots.txt

將 [想要展示的內容](http://www.robotstxt.org/) 存放在 `custom` 目錄中的
`robots.txt` 文件來讓 Gitea 使用自訂的`/robots.txt` （預設：空 404）。

## 使用自訂的公共文件

將自訂的公共文件（比如頁面和圖片）作為 webroot 放在 `custom/public/` 中來讓 Gitea 提供這些自訂內容（符號鏈接將被追蹤）。

舉例說明：`image.png` 存放在 `custom/public/assets/`中，那麼它可以透過鏈接 http://gitea.domain.tld/assets/image.png 訪問。

## 修改預設頭像

替換以下目錄中的 png 圖片： `custom/public/assets/img/avatar\_default.png`

## 自訂 Gitea 頁面

您可以改變 Gitea `custom/templates` 的每個單頁面。您可以在 Gitea 源碼的 `templates` 目錄中找到用於覆蓋的模板文件，應用將根據
`custom/templates` 目錄下的路徑結構進行匹配和覆蓋。

包含在 `{{` 和 `}}` 中的任何語句都是 Gitea 的模板語法，如果您不完全理解這些元件，不建議您對它們進行修改。

### 添加鏈接和頁籤

如果您只是想添加額外的鏈接到頂部導航欄或額外的選項卡到儲存庫視圖，您可以將它們放在您 `custom/templates/custom/` 目錄下的 `extra_links.tmpl` 和 `extra_tabs.tmpl` 文件中。

舉例說明：假設您需要在網站放置一個靜態的“關於”頁面，您只需將該頁面放在您的
"custom/public/"目錄下（比如 `custom/public/impressum.html`）並且將它與 `custom/templates/custom/extra_links.tmpl` 鏈接起來即可。

這個鏈接應當使用一個名為“item”的 class 來匹配當前樣式，您可以使用 `{{AppSubUrl}}` 來獲取 base URL:
`<a class="item" href="{{AppSubUrl}}/assets/impressum.html">Impressum</a>`

同理，您可以將頁籤添加到 `extra_tabs.tmpl` 中，使用同樣的方式來添加頁籤。它的具體樣式需要與
`templates/repo/header.tmpl` 中已有的其他選項卡的樣式匹配
([source in GitHub](https://github.com/go-gitea/gitea/blob/main/templates/repo/header.tmpl))

### 頁面的其他新增內容

除了 `extra_links.tmpl` 和 `extra_tabs.tmpl`，您可以在您的 `custom/templates/custom/` 目錄中存放一些其他有用的模板，例如：

- `header.tmpl`，在 `<head>` 標記結束之前的模板，例如添加自訂 CSS 文件
- `body_outer_pre.tmpl`，在 `<body>` 標記開始處的模板
- `body_inner_pre.tmpl`，在頂部導航欄之前，但在主 container 內部的模板，例如添加一個 `<div class="full height">`
- `body_inner_post.tmpl`，在主 container 結束處的模板
- `body_outer_post.tmpl`，在底部 `<footer>` 元素之前.
- `footer.tmpl`，在 `<body>` 標籤結束處的模板，可以在這裡填寫一些附加的 Javascript 腳本。

## 自訂 gitignores，labels， licenses， locales 以及 readmes

將自訂文件放在 `custom/options` 下相應子的文件夾中即可

## 更改 Gitea 外觀

內置主題是“gitea-light”、“gitea-dark”和“gitea-auto”（自動適應操作系統設定）。

預設主題可以透過 `app.ini` 的 [ui](../administration/config-cheat-sheet.md) 部分中的 `DEFAULT_THEME` 進行更改。
