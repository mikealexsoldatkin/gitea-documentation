---
date: "2017-04-15T14:56:00+02:00"
slug: "customizing-gitea-v1.23"
sidebar_position: 100
aliases:
  - /zh-tw/customizing-gitea
---

# 自訂 Gitea

自訂 Gitea 通常使用 `CustomPath` 文件夾進行 - 預設情況下，這是工作目錄（WorkPath）中的 `custom` 文件夾，但如果您的構建設定不同，則可能會有所不同。這是覆蓋設定設定、模板等的中心位置。您可以使用 `gitea help` 檢查 `CustomPath`。您還可以在 _站點管理_ 頁面的 _設定_ 標籤中找到路徑。您可以透過設定 `GITEA_CUSTOM` 環境變量或使用 `gitea` 二進制文件上的 `--custom-path` 選項來覆蓋 `CustomPath`。（該選項將覆蓋環境變量。）

如果 Gitea 是從二進制文件部署的，則所有預設路徑都將相對於 Gitea 二進制文件。如果從發行版安裝，這些路徑可能會修改為 Linux 文件系統標準。Gitea 將嘗試建立所需的文件夾，包括 `custom/`。發行版可能會使用 `/etc/gitea/` 提供 `custom` 的符號鏈接。

應用程式設定可以在 `CustomConf` 文件中找到，預設情況下為 `$GITEA_CUSTOM/conf/app.ini`，但如果您的構建設定不同，則可能會有所不同。同樣，`gitea help` 將允許您查看此變量，您可以使用 `gitea` 二進制文件上的 `--config` 選項來覆蓋它。

- [快速備忘單](../administration/config-cheat-sheet.md)
- [完整列表](https://github.com/go-gitea/gitea/blob/main/custom/conf/app.example.ini)

如果無法找到 `CustomPath` 文件夾，請檢查 `gitea help`，請檢查 `GITEA_CUSTOM` 環境變量；這可以用於覆蓋預設路徑到其他位置。例如，`GITEA_CUSTOM` 可能由啟動腳本設定。您可以在站點管理頁面的“設定”標籤下檢查是否設定了該值。

- [環境變量列表](../administration/environment-variables.md)

:::note
Gitea 必須完全重啟才能看到設定更改。
:::

## 提供自訂公共文件

要使 Gitea 提供自訂公共文件（如頁面和圖像），請使用文件夾 `$GITEA_CUSTOM/public/` 作為 webroot。將遵循符號鏈接。
目前，僅提供以下文件：

- `public/robots.txt`
- `public/.well-known/` 文件夾中的文件
- `public/assets/` 文件夾中的文件

例如，儲存在 `$GITEA_CUSTOM/public/assets/` 中的文件 `image.png` 可以透過 url `http://gitea.domain.tld/assets/image.png` 訪問。

## 更改徽標

要構建自訂徽標和/或圖標，克隆 Gitea 源程式碼庫，替換 `assets/logo.svg` 和/或 `assets/favicon.svg`，然後運行 `make generate-images`。`assets/favicon.svg` 僅用於圖標。這將更新以下輸出文件，然後您可以將它們放置在伺服器上的 `$GITEA_CUSTOM/public/assets/img` 中：

- `public/assets/img/logo.svg` - 用於站點圖標、應用程式圖標
- `public/assets/img/logo.png` - 用於 Open Graph
- `public/assets/img/avatar_default.png` - 用作預設頭像圖像
- `public/assets/img/apple-touch-icon.png` - 用於 iOS 設備的書籤
- `public/assets/img/favicon.svg` - 用於圖標
- `public/assets/img/favicon.png` - 用於不支援 SVG 圖標的瀏覽器

如果源圖像不是矢量格式，您可以嘗試使用工具（如[這個](https://www.aconvert.com/image/png-to-svg/)）將光柵圖像轉換為矢量圖像。

## 自訂 Gitea 頁面和資源

Gitea 的可執行文件包含運行所需的所有資源：模板、圖像、樣式表和翻譯。可以透過將替換文件放置在 `custom` 目錄中的匹配路徑中來覆蓋其中的任何資源。例如，要替換為 C++ 儲存庫提供的預設 `.gitignore`，我們需要替換 `options/gitignore/C++`。為此，必須將替換文件放置在 `$GITEA_CUSTOM/options/gitignore/C++` 中（請參閱本文件頂部有關 `CustomPath` 目錄位置的說明）。

Gitea 的每個頁面都可以更改。動態內容是使用 [go 模板](https://pkg.go.dev/html/template) 生成的，可以透過將替換文件放置在 `$GITEA_CUSTOM/templates` 目錄下來修改。

要獲取任何嵌入文件（包括模板），可以使用 [`gitea embedded` 工具](../administration/cmd-embedded.md)。或者，它們可以在 Gitea 源程式碼的 [`templates`](https://github.com/go-gitea/gitea/tree/main/templates) 目錄中找到（注意：範例鏈接來自 `main` 分支。確保使用與您使用的版本相容的模板）。

請注意，任何包含在 `{{` 和 `}}` 之間的語句都是 Gitea 的模板語法，應在完全理解這些元件之前不要觸摸。

### 自訂起始頁/首頁

從 `templates` 為您的 Gitea 版本複製 [`home.tmpl`](https://github.com/go-gitea/gitea/blob/main/templates/home.tmpl) 到 `$GITEA_CUSTOM/templates`。
根據需要進行編輯。
不要忘記重啟您的 Gitea 以應用更改。

### 添加鏈接和標籤

如果您只想在頂部導航欄或頁腳中添加額外的鏈接，或在儲存庫視圖中添加額外的標籤，可以將它們放在 `extra_links.tmpl`（添加到導航欄的鏈接）、`extra_links_footer.tmpl`（添加到頁腳左側的鏈接）和 `extra_tabs.tmpl` 中，放置在您的 `$GITEA_CUSTOM/templates/custom/` 目錄中。

例如，假設您在德國，必須添加著名的法律要求的“Impressum”/關於頁面，列出誰對網站內容負責：
只需將其放置在您的 "$GITEA_CUSTOM/public/assets/" 目錄下（例如 `$GITEA_CUSTOM/public/assets/impressum.html`），並將鏈接放置在 `$GITEA_CUSTOM/templates/custom/extra_links.tmpl` 或 `$GITEA_CUSTOM/templates/custom/extra_links_footer.tmpl` 中。

為了匹配當前樣式，鏈接應具有類名“item”，您可以使用 `{{AppSubUrl}}` 獲取基本 URL：
`<a class="item" href="{{AppSubUrl}}/assets/impressum.html">Impressum</a>`

有關更多資訊，請參閱 [添加法律頁面](../administration/adding-legal-pages.md)。

您可以以相同的方式添加新標籤，將它們放在 `extra_tabs.tmpl` 中。
匹配其他標籤樣式所需的確切 HTML 位於文件 `templates/repo/header.tmpl` 中
（[GitHub 中的源程式碼](https://github.com/go-gitea/gitea/blob/main/templates/repo/header.tmpl)）

### 頁面的其他添加

除了 `extra_links.tmpl` 和 `extra_tabs.tmpl`，還有其他有用的模板，您可以將它們放在 `$GITEA_CUSTOM/templates/custom/` 目錄中：

- `header.tmpl`，在 `<head>` 標籤結束之前，您可以添加自訂 CSS 文件。
- `body_outer_pre.tmpl`，在 `<body>` 開始之後。
- `body_inner_pre.tmpl`，在頂部導航欄之前，但已經在主容器 `<div class="full height">` 內。
- `body_inner_post.tmpl`，在主容器結束之前。
- `body_outer_post.tmpl`，在底部 `<footer>` 元素之前。
- `footer.tmpl`，在 `<body>` 標籤結束之前，是添加 JavaScript 的好地方。

### 使用 Gitea 變量

可以在自訂模板中使用各種 Gitea 變量。

首先，_臨時_ 啟用開發模式：在您的 `app.ini` 中將 `RUN_MODE = prod` 更改為 `RUN_MODE = dev`。然後將 `{{ $ | DumpVar }}` 添加到任何模板中，重啟 Gitea 並刷新該頁面；這將轉儲所有可用變量。

找到您需要的資料，並使用相應的變量；例如，如果您需要儲存庫的名稱，則可以使用 `{{.Repository.Name}}`。

如果您需要以某種方式轉換這些資料，並且不熟悉 Go，一個簡單的解決方法是將資料添加到 DOM 並添加一個小的 JavaScript 腳本塊來操作資料。

### 範例：PlantUML

您可以使用 PlantUML 伺服器將 [PlantUML](https://plantuml.com/) 支援添加到 Gitea 的 markdown 中。
資料被編碼並發送到 PlantUML 伺服器，該伺服器生成圖片。有一個在線演示伺服器位於 http://www.plantuml.com/plantuml，但如果您（或您的使用者）有敏感資料，您可以設定自己的 [PlantUML 伺服器](https://plantuml.com/server)。要設定 PlantUML 渲染，從 https://gitea.com/davidsvantesson/plantuml-code-highlight 複製 JavaScript 文件並將它們放在您的 `$GITEA_CUSTOM/public/assets/` 文件夾中。然後將以下內容添加到 `$GITEA_CUSTOM/templates/custom/footer.tmpl`：

```html
<script>
  $(async () => {
    if (!$(".language-plantuml").length) return;
    await Promise.all([
      $.getScript("https://your-gitea-server.com/assets/deflate.js"),
      $.getScript("https://your-gitea-server.com/assets/encode.js"),
      $.getScript(
        "https://your-gitea-server.com/assets/plantuml_codeblock_parse.js"
      ),
    ]);
    // 用您的 plantuml 服務器地址替換調用
    parsePlantumlCodeBlocks("https://www.plantuml.com/plantuml");
  });
</script>
```

然後您可以將以下塊添加到您的 markdown 中：

```plantuml
Alice -> Bob: Authentication Request
Bob --> Alice: Authentication Response

Alice -> Bob: Another authentication Request
Alice <-- Bob: Another authentication Response
```

該腳本將檢測帶有 `class="language-plantuml"` 的標籤，但您可以透過提供第二個參數給 `parsePlantumlCodeBlocks` 來更改此設定。

### 範例：STL 預覽

您可以透過添加以下內容直接在 Gitea 中顯示 STL 文件：

```html
<script>
  function lS(src) {
    return new Promise(function (resolve, reject) {
      let s = document.createElement("script");
      s.src = src;
      s.addEventListener("load", () => {
        resolve();
      });
      document.body.appendChild(s);
    });
  }

  if ($('.view-raw>a[href$=".stl" i]').length) {
    $("body").append(
      '<link href="/assets/Madeleine.js/src/css/Madeleine.css" rel="stylesheet">'
    );
    Promise.all([
      lS("/assets/Madeleine.js/src/lib/stats.js"),
      lS("/assets/Madeleine.js/src/lib/detector.js"),
      lS("/assets/Madeleine.js/src/lib/three.min.js"),
      lS("/assets/Madeleine.js/src/Madeleine.js"),
    ]).then(function () {
      $(".view-raw")
        .attr("id", "view-raw")
        .attr("style", "padding: 0;margin-bottom: -10px;");
      new Madeleine({
        target: "view-raw",
        data: $('.view-raw>a[href$=".stl" i]').attr("href"),
        path: "/assets/Madeleine.js/src",
      });
      $('.view-raw>a[href$=".stl"]').remove();
    });
  }
</script>
```

到文件 `$GITEA_CUSTOM/templates/custom/footer.tmpl`

您還需要下載庫 [Madeleine.js](https://github.com/beige90/Madeleine.js) 的內容並將其放置在 `$GITEA_CUSTOM/public/assets/` 文件夾下。

您應該最終得到類似於以下結構的文件夾：

```
$GITEA_CUSTOM/templates
-- custom
    `-- footer.tmpl

$GITEA_CUSTOM/public/assets/
-- Madeleine.js
   |-- LICENSE
   |-- README.md
   |-- css
   |   |-- pygment_trac.css
   |   `-- stylesheet.css
   |-- examples
   |   |-- ajax.html
   |   |-- index.html
   |   `-- upload.html
   |-- images
   |   |-- bg_hr.png
   |   |-- blacktocat.png
   |   |-- icon_download.png
   |   `-- sprite_download.png
   |-- models
   |   |-- dino2.stl
   |   |-- ducati.stl
   |   |-- gallardo.stl
   |   |-- lamp.stl
   |   |-- octocat.stl
   |   |-- skull.stl
   |   `-- treefrog.stl
   `-- src
       |-- Madeleine.js
       |-- css
       |   `-- Madeleine.css
       |-- icons
       |   |-- logo.png
       |   |-- madeleine.eot
       |   |-- madeleine.svg
       |   |-- madeleine.ttf
       |   `-- madeleine.woff
       `-- lib
           |-- MadeleineConverter.js
           |-- MadeleineLoader.js
           |-- detector.js
           |-- stats.js
           `-- three.min.js
```

然後重啟 Gitea 並在您的 Gitea 實例上打開 STL 文件。

## 自訂 Gitea 郵件

`$GITEA_CUSTOM/templates/mail` 文件夾允許更改 Gitea 的每封郵件的正文。
可以在 Gitea 源程式碼的 [`templates/mail`](https://github.com/go-gitea/gitea/tree/main/templates/mail) 目錄中找到要覆蓋的模板。
通過在 `$GITEA_CUSTOM/templates/mail` 下製作文件副本來覆蓋，使用與源相匹配的完整路徑結構。

任何包含在 `{{` 和 `}}` 之間的語句都是 Gitea 的模板語法，應在完全理解這些元件之前不要觸摸。

## 向 Gitea 添加分析

可以向 Gitea 添加 Google Analytics、Matomo（以前稱為 Piwik）和其他分析服務。要添加跟蹤程式碼，請參閱本文件的“頁面的其他添加”部分，並將 JavaScript 添加到 `$GITEA_CUSTOM/templates/custom/header.tmpl` 文件中。

## 自訂 gitignores、標籤、許可證、本地化和 readmes

將自訂文件放置在 `custom/options` 下的相應子文件夾中。

:::note
文件不應具有文件擴展名，例如 `Labels` 而不是 `Labels.txt`
:::

### gitignores

要添加自訂 .gitignore，請將包含現有 [.gitignore 規則](https://git-scm.com/docs/gitignore) 的文件添加到 `$GITEA_CUSTOM/options/gitignore`

## 自訂 git 設定

從 Gitea 1.20 開始，您可以透過 `git.config` 部分自訂 git 設定。

### 啟用簽名 git 推送

要啟用簽名 git 推送，請設定以下兩個選項：

```ini
[git.config]
receive.advertisePushOptions = true
receive.certNonceSeed = <randomstring>
```

`certNonceSeed` 應設定為隨機字符串並保持祕密。

### 標籤

從 Gitea 1.19 開始，您可以將遵循 [YAML 標籤格式](https://github.com/go-gitea/gitea/blob/main/options/label/Advanced.yaml) 的文件添加到 `$GITEA_CUSTOM/options/label`：

```yaml
labels:
  - name: "foo/bar" # 在下拉列表中顯示的標籤名稱
    exclusive: true # 是否使用專用命名空間進行範圍標籤。範圍分隔符為 /
    color: aabbcc # 十六進制顏色編碼
    description: Some label # 標籤意圖的長描述
```

仍然可以使用 [舊文件格式](https://github.com/go-gitea/gitea/blob/main/options
