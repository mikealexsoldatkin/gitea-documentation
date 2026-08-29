---
date: "2023-05-25T16:00:00+02:00"

slug: "guidelines-frontend"
sidebar_position: 20

aliases:
  - /zh-tw/guidelines-frontend
---

# 前端開發指南

## 背景

Gitea 在其前端中使用[Fomantic-UI](https://fomantic-ui.com/introduction/getting-started.html)（基於[jQuery](https://api.jquery.com)）和 [Vue3](https://vuejs.org/)。

HTML 頁面由[Go HTML Template](https://pkg.go.dev/html/template)渲染。

源文件可以在以下目錄中找到：

- **CSS 樣式**： `web_src/css/`
- **JavaScript 文件**： `web_src/js/`
- **Vue 元件**： `web_src/js/components/`
- **Go HTML 模板**： `templates/`

## 通用準則

我們推薦使用[Google HTML/CSS Style Guide](https://google.github.io/styleguide/htmlcssguide.html)和[Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)。

## Gitea 特定準則

1. 每個功能（Fomantic-UI/jQuery 模組）應放在單獨的文件/目錄中。
2. HTML 的 id 和 class 應使用 kebab-case，最好包含 2-3 個與功能相關的關鍵詞。
3. 在 JavaScript 中使用的 HTML 的 id 和 class 應在整個專案中是唯一的，並且應包含 2-3 個與功能相關的關鍵詞。建議在僅在 JavaScript 中使用的 class 中使用 `js-` 前綴。
4. 不應覆蓋框架提供的 class 的 CSS 樣式。始終使用具有 2-3 個與功能相關的關鍵詞的新 class 名稱來覆蓋框架樣式。Gitea 中的幫助 CSS 類在 `helpers.less` 中。
5. 後端可以透過使用`ctx.PageData["myModuleData"] = map[]{}`將複雜資料傳遞給前端，但不要將整個模型暴露給前端，以避免泄露敏感資料。
6. 簡單頁面和與 SEO 相關的頁面使用 Go HTML 模板渲染生成靜態的 Fomantic-UI HTML 輸出。複雜頁面可以使用 Vue3。
7. 明確變量類型，優先使用`elem.disabled = true`而不是`elem.setAttribute('disabled', 'anything')`，優先使用`$el.prop('checked', var === 'yes')`而不是`$el.prop('checked', var)`。
8. 使用語義化元素，優先使用`<button class="ui button">`而不是`<div class="ui button">`。
9. 避免在 CSS 中使用不必要的`!important`，如果無法避免，添加註釋解釋為什麼需要它。
10. 避免在一個事件監聽器中混合不同的事件，優先為每個事件使用獨立的事件監聽器。
11. 推薦使用自訂事件名稱前綴`ce-`。
12. 建議使用 Tailwind CSS，它可以透過 `tw-` 前綴獲得，例如 `tw-relative`. Gitea 自身的助手類 CSS 使用 `gt-` 前綴（`gt-word-break`），Gitea 自身的私有框架級 CSS 類使用 `g-` 前綴（`g-modal-confirm`）。
13. 儘量避免內聯腳本和樣式，建議將 JS 程式碼放入 JS 文件中並使用 CSS 類。如果內聯腳本和樣式不可避免，請解釋無法避免的原因。

### 可訪問性 / ARIA

在歷史上，Gitea 大量使用了可訪問性不友好的框架 Fomantic UI。
Gitea 使用一些補丁使 Fomantic UI 更具可訪問性（參見 `aria.md`），
但仍然存在許多問題需要大量的工作和時間來修復。

### 框架使用

不建議混合使用不同的框架，這會使程式碼難以維護。
一個 JavaScript 模組應遵循一個主要框架，並遵循該框架的最佳實踐。

推薦的實現方式：

- Vue + Vanilla JS
- Fomantic-UI（jQuery）
- htmx （部分頁面重新加載其他靜態元件）
- Vanilla JS

不推薦的實現方式：

- Vue + Fomantic-UI（jQuery）
- jQuery + Vanilla JS
- htmx + 任何其他需要大量 JavaScript 程式碼或不必要的功能，如 htmx 腳本 (`hx-on`)

為了保持介面一致，Vue 元件可以使用 Fomantic-UI 的 CSS 類。
儘管不建議混合使用不同的框架，
我們使用 htmx 進行簡單的交互。您可以在此 [PR](https://github.com/go-gitea/gitea/pull/28908) 中查看一個簡單交互的範例，其中應使用 htmx。如果您需要更高級的反應性，請不要使用 htmx，請使用其他框架（Vue/Vanilla JS）。
但如果混合使用是必要的，並且程式碼設計良好且易於維護，也可以工作。

### `async` 函數

只有當函數內部存在`await`調用或返回`Promise`時，纔將函數標記為`async`。

不建議使用`async`事件監聽器，這可能會導致問題。
原因是`await`後的程式碼在事件分發之外執行。
參考：https://github.com/github/eslint-plugin-github/blob/main/docs/rules/async-preventdefault.md

如果一個事件監聽器必須是`async`，應在任何`await`之前使用`e.preventDefault()`，
建議將其放在函數的開頭。

如果我們想在非異步上下文中調用`async`函數，
建議使用`const _promise = asyncFoo()`來告訴讀者
這是有意為之的，我們想調用異步函數並忽略 Promise。
一些 lint 規則和 IDE 也會在未處理返回的 Promise 時發出警告。

### 獲取資料

要獲取資料，請使用`modules/fetch.js`中的包裝函數`GET`、`POST`等。他們
接受內容的`data`選項，將自動設定 CSRF 令牌並返回
[Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)。

### HTML 屬性和 dataset

禁止使用`dataset`，它的駝峰命名行為使得搜索屬性變得困難。
然而，仍然存在一些特殊情況，因此當前的準則是：

- 對於舊程式碼：

  - 應將`$.data()`重構為`$.attr()`。
  - 在極少數情況下，可以使用`$.data()`將一些非字符串資料綁定到元素上，但強烈不推薦使用。

- 對於新程式碼：
  - 不應使用`node.dataset`，而應使用`node.getAttribute`。
  - 不要將任何使用者資料綁定到 DOM 節點上，使用合適的設計模式描述節點和資料之間的關係。

### 顯示/隱藏元素

- 推薦在 Vue 元件中使用`v-if`和`v-show`來顯示/隱藏元素。
- Go 模板程式碼應使用 `.tw-hidden` 和 `showElem()/hideElem()/toggleElem()` 來顯示/隱藏元素，請參閱`.tw-hidden`的註釋以獲取更多詳細資訊。

### Go HTML 模板中的樣式和屬性

建議使用以下方式：

```html
<div
  class="gt-name1 gt-name2 {{if .IsFoo}}gt-foo{{end}}"
  {{if
  .IsFoo}}data-foo{{end}}
></div>
```

而不是：

```html
<div
  class="gt-name1 gt-name2{{if .IsFoo}} gt-foo{{end}}"
  {{if
  .IsFoo}}
  data-foo{{end}}
></div>
```

以使程式碼更易讀。

### 舊程式碼

許多舊程式碼已經存在於本文撰寫之前。建議重構舊程式碼以遵循指南。

### Vue3 和 JSX

Gitea 現在正在使用 Vue3。我們決定不引入 JSX，以保持 HTML 程式碼和 JavaScript 程式碼分離。

### UI 範例

Gitea 使用一些自制的 UI 元素並自訂其他元素，以將它們更好地整合到通用 UI 方法中。當在開發模式（`RUN_MODE=dev`）下運行 Gitea 時，在 `http(s)://your-gitea-url:port/devtest` 下會提供一個包含一些標準化 UI 範例的頁面。
