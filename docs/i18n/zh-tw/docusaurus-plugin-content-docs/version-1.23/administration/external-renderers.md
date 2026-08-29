---
date: "2018-11-23:00:00+02:00"
slug: "external-renderers"
sidebar_position: 60
aliases:
  - /zh-tw/external-renderers
---

# 外部渲染器

Gitea 支援透過外部二進位檔案進行自訂檔案渲染（例如 Jupyter 筆記本、asciidoc 等），只需：

- 安裝外部二進位檔案
- 在 `app.ini` 檔案中添加一些設定
- 重新啟動你的 Gitea 實例

這支援整個檔案的渲染。如果你想在 markdown 中渲染程式碼區塊，你需要使用 JavaScript。請參閱 [自訂 Gitea](../administration/customizing-gitea.md) 頁面上的一些範例。

## 安裝外部二進位檔案

為了透過外部二進位檔案進行檔案渲染，必須安裝其相關的套件。
如果你使用 Docker 映像檔，你的 `Dockerfile` 應該包含如下內容：

```docker
FROM docker.gitea.com/gitea:@dockerVersion@
[...]

COPY custom/app.ini /data/gitea/conf/app.ini
[...]

RUN apk --no-cache add asciidoctor freetype freetype-dev gcc g++ libpng libffi-dev pandoc python3-dev py3-pyzmq pipx
# 安裝任何其他你需要的外部渲染器套件

RUN pipx install jupyter docutils --include-deps --global
# 添加任何其他你可能需要安裝的 Python 套件
```

## `app.ini` 檔案設定

在你的自訂 `app.ini` 中為每個外部渲染器添加一個 `[markup.XXXXX]` 部分：

```ini
[markup.asciidoc]
ENABLED = true
FILE_EXTENSIONS = .adoc,.asciidoc
RENDER_COMMAND = "asciidoctor -s -a showtitle --out-file=- -"
; 輸入不是標準輸入而是檔案
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

如果你的外部標記依賴於生成的 HTML 元素上的額外類和屬性，你可能需要啟用自訂的清理策略。Gitea 使用 [`bluemonday`](https://godoc.org/github.com/microcosm-cc/bluemonday) 套件作為我們的 HTML 清理器。下面的範例可以用來支援來自 [`pandoc`](https://pandoc.org/) 的伺服器端 [KaTeX](https://katex.org/) 渲染輸出。

```ini
[markup.sanitizer.TeX]
; Pandoc 將 TeX 段落渲染為帶有 "math" 類的 <span>，根據上下文可選地帶有 "inline" 或 "display" 類。
; - 注意這與我們的 markdown 解析器內建的數學支援不同，後者使用 <code>
ELEMENT = span
ALLOW_ATTR = class
REGEXP = ^\s*((math(\s+|$)|inline(\s+|$)|display(\s+|$)))+

[markup.markdown]
ENABLED         = true
FILE_EXTENSIONS = .md,.markdown
RENDER_COMMAND  = pandoc -f markdown -t html --katex
```

你必須在每個部分中定義 `ELEMENT` 和 `ALLOW_ATTR`。

要定義多個條目，請添加唯一的字母數字後綴（例如 `[markup.sanitizer.1]` 和 `[markup.sanitizer.something]`）。

要僅對特定外部渲染器應用清理規則，它們必須使用渲染器名稱，例如 `[markup.sanitizer.asciidoc.rule-1]`，`[markup.sanitizer.<renderer>.rule-1]`。

**注意**：如果規則定義在渲染器 ini 部分之上或名稱不匹配渲染器，則應用於每個渲染器。

一旦你的設定更改完成，重新啟動 Gitea 以使更改生效。

**注意**：在 Gitea 1.12 之前，有一個單一的 `markup.sanitiser` 部分，具有為多個規則重新定義的鍵，但這種設定方法存在重大問題，因此需要通過多個部分進行設定。

### 範例：HTML

直接渲染 HTML 檔案：

```ini
[markup.html]
ENABLED         = true
FILE_EXTENSIONS = .html,.htm
RENDER_COMMAND  = cat
; 輸入不是標準輸入而是檔案
IS_INPUT_FILE   = true

[markup.sanitizer.html.1]
ELEMENT = div
ALLOW_ATTR = class

[markup.sanitizer.html.2]
ELEMENT = a
ALLOW_ATTR = class
```

### 範例：Office DOCX

使用 [`pandoc`](https://pandoc.org/) 顯示 Office DOCX 檔案：

```ini
[markup.docx]
ENABLED = true
FILE_EXTENSIONS = .docx
RENDER_COMMAND = "pandoc --from docx --to html --self-contained --template /path/to/basic.html"

[markup.sanitizer.docx.img]
ALLOW_DATA_URI_IMAGES = true
```

模板檔案具有以下內容：

```
$body$
```

### 範例：Jupyter Notebook

使用 [`nbconvert`](https://github.com/jupyter/nbconvert) 顯示 Jupyter Notebook 檔案：

```ini
[markup.jupyter]
ENABLED = true
FILE_EXTENSIONS = .ipynb
RENDER_COMMAND = "jupyter-nbconvert --stdin --stdout --to html --template basic"

[markup.sanitizer.jupyter.img]
ALLOW_DATA_URI_IMAGES = true
```

## 自訂 CSS

外部渲染器在 .ini 中以 `[markup.XXXXX]` 格式指定，外部渲染器提供的 HTML 將包裹在帶有 `markup` 和 `XXXXX` 類的 `<div>` 中。`markup` 類提供了開箱即用的樣式（如果 `XXXXX` 是 `markdown`，則 `markdown` 也提供樣式）。否則，你可以使用這些類來專門針對渲染的 HTML 內容。

因此，你可以寫一些 CSS：

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

將你的樣式表添加到自訂目錄，例如 `custom/public/assets/css/my-style-XXXXX.css`，並使用自訂標頭檔案 `custom/templates/custom/header.tmpl` 導入它：

```html
<link rel="stylesheet" href="{{AppSubUrl}}/assets/css/my-style-XXXXX.css" />
```
