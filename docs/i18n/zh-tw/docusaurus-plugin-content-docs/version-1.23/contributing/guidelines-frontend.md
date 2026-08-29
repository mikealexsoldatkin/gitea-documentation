---
date: "2021-10-13T16:00:00+02:00"
slug: "guidelines-frontend"
sidebar_position: 30
aliases:
  - /zh-tw/guidelines-frontend
---

# 前端開發指南

## 背景

Gitea 使用 [Fomantic-UI](https://fomantic-ui.com/introduction/getting-started.html)（基於 [jQuery](https://api.jquery.com)）和 [Vue3](https://vuejs.org/) 作為前端框架。

HTML 頁面由 [Go HTML Template](https://pkg.go.dev/html/template) 渲染。

源文件可以在以下目錄中找到：

- **CSS 樣式：** `web_src/css/`
- **JavaScript 文件：** `web_src/js/`
- **Vue 元件：** `web_src/js/components/`
- **Go HTML 模板：** `templates/`

## 一般指南

我們推薦 [Google HTML/CSS Style Guide](https://google.github.io/styleguide/htmlcssguide.html) 和 [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)

### Gitea 特定指南

1. 每個功能（Fomantic-UI/jQuery 模組）應該放在單獨的文件/目錄中。
2. HTML id 和 class 應該使用 kebab-case，最好包含 2-3 個與功能相關的關鍵詞。
3. 在 JavaScript 中使用的 HTML id 和 class 應該在整個專案中是唯一的，並且應該包含 2-3 個與功能相關的關鍵詞。我們建議對僅在 JavaScript 中使用的 class 使用 `js-` 前綴。
4. 不應覆蓋框架提供的 class 的 CSS 樣式。始終使用包含 2-3 個與功能相關的關鍵詞的新 class 名稱來覆蓋框架樣式。Gitea 的 `helpers.less` 中的輔助 CSS class 可能會有所幫助。
5. 後端可以使用 `ctx.PageData["myModuleData"] = map[]{}` 將複雜資料傳遞給前端，但不要將整個模型暴露給前端，以避免洩露敏感資料。
6. 簡單頁面和與 SEO 相關的頁面使用 Go HTML Template 渲染生成靜態 Fomantic-UI HTML 輸出。複雜頁面可以使用 Vue3。
7. 明確變量類型，優先使用 `elem.disabled = true` 而不是 `elem.setAttribute('disabled', 'anything')`，優先使用 `$el.prop('checked', var === 'yes')` 而不是 `$el.prop('checked', var)`。
8. 使用語義化元素，優先使用 `<button class="ui button">` 而不是 `<div class="ui button">`。
9. 避免在 CSS 中不必要的 `!important`，如果無法避免，請添加註釋解釋為什麼是必要的。
10. 避免在一個事件監聽器中混合不同的事件，優先為每個事件使用單獨的事件監聽器。
11. 自訂事件名稱建議使用 `ce-` 前綴。
12. 優先使用 Tailwind CSS，通過 `tw-` 前綴可用，例如 `tw-relative`。Gitea 的輔助 CSS class 使用 `gt-` 前綴（`gt-ellipsis`），而 Gitea 自己的私有框架級 CSS class 使用 `g-` 前綴（`g-modal-confirm`）。
13. 盡可能避免內聯腳本和樣式，建議將 JS 程式碼放入 JS 文件並使用 CSS class。如果內聯腳本和樣式是不可避免的，請解釋為什麼無法避免。

### 無障礙 / ARIA

歷史上，Gitea 大量使用 Fomantic UI，這不是一個無障礙友好的框架。
Gitea 使用一些補丁使 Fomantic UI 更加無障礙（見 `aria.md` 和相關的 JS 文件），
但仍然存在許多問題，需要大量工作和時間來修復。

### 框架使用

不建議混合使用不同的框架，這會使程式碼難以維護。
JavaScript 模組應該遵循一個主要框架並遵循該框架的最佳實踐。

推薦的實現：

- Vue + 原生 JS
- Fomantic-UI (jQuery)
- htmx（部分頁面重新加載，適用於靜態元件）
- 原生 JS

不推薦的實現：

- Vue + Fomantic-UI (jQuery)
- jQuery + 原生 JS
- htmx + 任何需要大量 JS 程式碼的框架，或不必要的功能如 htmx 腳本（`hx-on`）

為了使 UI 一致，Vue 元件可以使用 Fomantic-UI CSS class。
我們使用 htmx 進行簡單的交互。你可以在這個 [PR](https://github.com/go-gitea/gitea/pull/28908) 中看到一個使用 htmx 進行簡單交互的範例。如果你需要更高級的反應性，請使用其他框架（Vue/原生 JS）。
雖然不建議混合使用不同的框架，
但如果混合是必要的並且程式碼設計良好且可維護，應該也是可行的。

### Typescript

Gitea 正在遷移到類型安全的 Typescript。以下是一些關於 Typescript 在程式碼庫中的具體指南：

#### 使用類型別名而不是介面

優先使用類型別名，因為它們可以表示任何類型，並且通常比介面更靈活。

#### 使用單獨的類型導入

我們使用 `verbatimModuleSyntax`，因此來自同一文件的類型和非類型導入必須分成兩個 `import type` 語句。這使得 typescript 編譯器在編譯過程中可以完全消除類型導入語句。

#### 使用 `@ts-expect-error` 而不是 `@ts-ignore`

應避免使用這兩個註釋，但如果必須使用，請使用 `@ts-expect-error`，因為在問題修復後它不會留下無效的語句。

### `async` 函數

只有在函數內部有 `await` 調用或返回 `Promise` 時，才將函數標記為 `async`。

不建議使用 `async` 事件監聽器，這可能會導致問題。
原因是 `await` 之後的程式碼在事件分派之外執行。
參考：https://github.com/github/eslint-plugin-github/blob/main/docs/rules/async-preventdefault.md

如果事件監聽器必須是 `async`，則 `e.preventDefault()` 應在任何 `await` 之前，
建議將其放在函數的開頭。

如果我們想在非 `async` 上下文中調用 `async` 函數，
建議使用 `const _promise = asyncFoo()` 來告訴讀者
這是故意這樣做的，我們想調用 `async` 函數並忽略 Promise。
一些 lint 規則和 IDE 也會在未處理返回的 Promise 時發出警告。

### 獲取資料

要獲取資料，請使用 `modules/fetch.js` 中的包裝函數 `GET`、`POST` 等。
它們接受一個 `data` 選項作為內容，會自動設定 CSRF 令牌並返回一個 [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) 的 Promise。

### HTML 屬性和 `dataset`

禁止使用 `dataset`，其駝峰命名行為使得很難 grep 屬性。
然而，仍然存在一些特殊情況，所以目前的指南是：

- 對於遺留程式碼：

  - `$.data()` 應重構為 `$.attr()`。
  - `$.data()` 可以在罕見情況下用於將一些非字符串資料綁定到元素，但這是高度不建議的。

- 對於新程式碼：
  - 不應使用 `node.dataset`，應使用 `node.getAttribute`。
  - 永遠不要將任何使用者資料綁定到 DOM 節點，應使用合適的設計模式來描述節點和資料之間的關係。

### 顯示/隱藏元素

- Vue 元件建議使用 `v-if` 和 `v-show` 來顯示/隱藏元素。
- Go 模板程式碼應使用 `.tw-hidden` 和 `showElem()/hideElem()/toggleElem()`，詳情見 `.tw-hidden` 的註釋。

### Go HTML 模板中的樣式和屬性

建議使用：

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

以使程式碼更具可讀性。

### 遺留程式碼

在撰寫本文件之前，已經存在許多遺留程式碼。建議重構遺留程式碼以遵循這些指南。

### Vue3 和 JSX

Gitea 現在使用 Vue3。我們決定不引入 JSX，以保持 HTML 和 JavaScript 程式碼分離。

### UI 範例

Gitea 使用一些自製的 UI 元素並自訂其他元素，以更好地將它們整合到整體 UI 方法中。當 Gitea 在開發模式下運行時（`RUN_MODE=dev`），可以在 `http(s)://your-gitea-url:port/devtest` 下訪問一些標準化的 UI 範例頁面。
