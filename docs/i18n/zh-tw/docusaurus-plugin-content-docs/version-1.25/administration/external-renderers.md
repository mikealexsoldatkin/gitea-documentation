---
date: "2023-05-23T09:00:00+08:00"
slug: "external-renderers"
sidebar_position: 60

aliases:
  - /zh-tw/external-renderers
---

# 外部渲染器

Gitea 通過外部二進制文件支援自訂文件渲染（例如 Jupyter notebooks、asciidoc 等），只需要進行以下步驟：

- 安裝外部二進制文件
- 在您的 `app.ini` 文件中添加一些設定
- 重新啟動 Gitea 實例

此功能支援整個文件的渲染。如果您想要在 Markdown 中渲染程式碼塊，您需要使用 JavaScript 進行一些操作。請參閱 [自訂 Gitea 設定](../administration/customizing-gitea.md) 頁面上的一些範例。

## 安裝外部二進制文件

為了通過外部二進制文件進行文件渲染，必須安裝它們的關聯套件。
如果您正在使用 Docker 鏡像，則您的 `Dockerfile` 應該包含以下內容：

```docker
FROM docker.gitea.com/gitea:@dockerVersion@
[...]

COPY custom/app.ini /data/gitea/conf/app.ini
[...]

RUN apk --no-cache add asciidoctor freetype freetype-dev gcc g++ libpng libffi-dev pandoc python3-dev py3-pyzmq pipx
# 安裝其他您需要的外部渲染器的軟件包

RUN pipx install jupyter docutils --include-deps
# 在上面添加您需要安裝的任何其他 Python 軟件包
```

## `app.ini` 文件設定

在您的自訂 `app.ini` 文件中為每個外部渲染器添加一個 `[markup.XXXXX]` 部分：

```ini
[markup.asciidoc]
ENABLED = true
FILE_EXTENSIONS = .adoc,.asciidoc
RENDER_COMMAND = "asciidoctor -s -a showtitle --out-file=- -"
; 輸入不是標準輸入而是文件
IS_INPUT_FILE = false

[markup.jupyter]
ENABLED = true
FILE_EXTENSIONS = .ipynb
RENDER_COMMAND = "jupyter nbconvert --stdin --stdout --to html --template basic"
IS_INPUT_FILE = false

[markup.restructuredtext]
ENABLED = true
FILE_EXTENSIONS = .rst
RENDER_COMMAND = "timeout 30s pandoc +RTS -M512M -RTS -f rst"
IS_INPUT_FILE = false
```

如果您的外部標記語言依賴於在生成的 HTML 元素上的額外類和屬性，您可能需要啟用自訂的清理策略。Gitea 使用 [`bluemonday`](https://godoc.org/github.com/microcosm-cc/bluemonday) 包作為我們的 HTML 清理器。下面的範例可以用於支援從 [`pandoc`](https://pandoc.org/) 輸出的伺服器端 [KaTeX](https://katex.org/) 渲染結果。

```ini
[markup.sanitizer.TeX]
; Pandoc 渲染 TeX 段落為帶有 "math" 類的 <span> 元素，根據上下文可能還帶有 "inline" 或 "display" 類。
; - 請注意，這與我們的 Markdown 解析器中內置的數學支持不同，後者使用 <code> 元素。
ELEMENT = span
ALLOW_ATTR = class
REGEXP = ^\s*((math(\s+|$)|inline(\s+|$)|display(\s+|$)))+

[markup.markdown]
ENABLED         = true
FILE_EXTENSIONS = .md,.markdown
RENDER_COMMAND  = pandoc -f markdown -t html --katex
```

您必須在每個部分中定義 `ELEMENT` 和 `ALLOW_ATTR`。

要定義多個條目，請添加唯一的字母數字後綴（例如，`[markup.sanitizer.1]` 和 `[markup.sanitizer.something]`）。

要僅為特定的外部渲染器應用清理規則，它們必須使用渲染器名稱，例如 `[markup.sanitizer.asciidoc.rule-1]`、`[markup.sanitizer.<renderer>.rule-1]`。

**注意**：如果規則在渲染器 ini 部分之前定義，或者名稱與渲染器不匹配，它將應用於所有渲染器。

完成設定更改後，請重新啟動 Gitea 以使更改生效。

**注意**：在 Gitea 1.12 之前，存在一個名為 `markup.sanitiser` 的單個部分，其中的鍵被重新定義為多個規則，但是，這種設定方法存在重大問題，需要通過多個部分進行設定。

### 範例：HTML

直接渲染 HTML 文件：

```ini
[markup.html]
ENABLED         = true
FILE_EXTENSIONS = .html,.htm
RENDER_COMMAND  = cat
; 輸入不是標準輸入，而是文件
IS_INPUT_FILE   = true

[markup.sanitizer.html.1]
ELEMENT = div
ALLOW_ATTR = class

[markup.sanitizer.html.2]
ELEMENT = a
ALLOW_ATTR = class
```

請注意：此範例中的設定將允許渲染 HTML 文件，並使用 `cat` 命令將文件內容輸出為 HTML。此外，設定中的兩個清理規則將允許 `<div>` 和 `<a>` 元素使用 `class` 屬性。

在進行設定更改後，請重新啟動 Gitea 以使更改生效。

### 範例：Office DOCX

使用 [`pandoc`](https://pandoc.org/) 顯示 Office DOCX 文件：

```ini
[markup.docx]
ENABLED = true
FILE_EXTENSIONS = .docx
RENDER_COMMAND = "pandoc --from docx --to html --self-contained --template /path/to/basic.html"

[markup.sanitizer.docx.img]
ALLOW_DATA_URI_IMAGES = true
```

在此範例中，設定將允許顯示 Office DOCX 文件，並使用 `pandoc` 命令將文件轉換為 HTML 格式。同時，清理規則中的 `ALLOW_DATA_URI_IMAGES` 設定為 `true`，允許使用 Data URI 格式的圖片。

模板文件的內容如下：

```
$body$
```

### 範例：Jupyter Notebook

使用 [`nbconvert`](https://github.com/jupyter/nbconvert) 顯示 Jupyter Notebook 文件：

```ini
[markup.jupyter]
ENABLED = true
FILE_EXTENSIONS = .ipynb
RENDER_COMMAND = "jupyter-nbconvert --stdin --stdout --to html --template basic"

[markup.sanitizer.jupyter.img]
ALLOW_DATA_URI_IMAGES = true
```

在此範例中，設定將允許顯示 Jupyter Notebook 文件，並使用 `nbconvert` 命令將文件轉換為 HTML 格式。同樣，清理規則中的 `ALLOW_DATA_URI_IMAGES` 設定為 `true`，允許使用 Data URI 格式的圖片。

在進行設定更改後，請重新啟動 Gitea 以使更改生效。

## 自訂 CSS

在 `.ini` 文件中，可以使用 `[markup.XXXXX]` 的格式指定外部渲染器，並且由外部渲染器生成的 HTML 將被包裝在一個帶有 `markup` 和 `XXXXX` 類的 `<div>` 中。`markup` 類提供了預定義的樣式（如果 `XXXXX` 是 `markdown`，則使用 `markdown` 類）。否則，您可以使用這些類來針對渲染的 HTML 內容進行定製樣式。

因此，您可以編寫一些 CSS 樣式：

```css
.markup.XXXXX html {
  font-size: 100%;
  overflow-y: scroll;
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
}

.markup.XXXXX body {
  color: #444;
  font-family: Georgia, Palatino, "Palatino Linotype", Times, "Times New Roman",
    serif;
  font-size: 12px;
  line-height: 1.7;
  padding: 1em;
  margin: auto;
  max-width: 42em;
  background: #fefefe;
}

.markup.XXXXX p {
  color: orangered;
}
```

將您的樣式表添加到自訂目錄中，例如 `custom/public/assets/css/my-style-XXXXX.css`，並使用自訂的頭文件 `custom/templates/custom/header.tmpl` 進行導入：

```html
<link rel="stylesheet" href="{{AppSubUrl}}/assets/css/my-style-XXXXX.css" />
```

通過以上步驟，您可以將自訂的 CSS 樣式應用到特定的外部渲染器，使其具有所需的樣式效果。
