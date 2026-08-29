---
date: "2019-10-23T17:00:00-03:00"
slug: "mail-templates"
sidebar_position: 45
aliases:
  - /zh-tw/mail-templates
---

# 郵件模板

為了製作某些操作的電子郵件主題和內容，Gitea 可以使用模板進行自訂。這些功能的模板位於 [`custom` 目錄](../administration/customizing-gitea.md)下。
Gitea 有一個內部模板，作為預設值，如果沒有自訂替代品。

自訂模板在 Gitea 啟動時加載。對它們的更改在 Gitea 再次重啟之前不會被識別。

## 支援模板的郵件通知

目前，以下通知事件使用模板：

| 操作名稱   | 用途                                                       |
| ---------- | ---------------------------------------------------------- |
| `new`      | 建立了一個新問題或拉取請求。                               |
| `comment`  | 在現有問題或拉取請求中建立了一個新評論。                   |
| `close`    | 關閉了一個問題或拉取請求。                                 |
| `reopen`   | 重新打開了一個問題或拉取請求。                             |
| `review`   | 拉取請求中的審查的主要評論。                               |
| `approve`  | 拉取請求的批准審查的主要評論。                             |
| `reject`   | 拉取請求的變更請求審查的主要評論。                         |
| `code`     | 拉取請求中的程式碼單一評論。                                 |
| `assigned` | 使用者被分配到一個問題或拉取請求。                           |
| `default`  | 任何不包括在上述類別中的操作，或當對應的類別模板不存在時。 |

特定消息類型的模板路徑為：

```sh
custom/templates/mail/{action type}/{action name}.tmpl
```

其中 `{action type}` 是 `issue` 或 `pull`（對於拉取請求）之一，`{action name}` 是上面列出的名稱之一。

例如，有關拉取請求評論的郵件的特定模板為：

```sh
custom/templates/mail/pull/comment.tmpl
```

但是，不需要為每個操作類型/名稱組合建立模板。
使用回退系統來選擇事件的適當模板。使用此列表中的 _第一個存在的_ 模板：

- 所需 **操作類型** 和 **操作名稱** 的特定模板。
- 操作類型 `issue` 和所需 **操作名稱** 的模板。
- 操作類型 `issue` 和操作名稱 `default` 的模板。

唯一必需的模板是操作類型 `issue` 和操作名稱 `default`，它已嵌入 Gitea 中，除非使用者在 `custom` 目錄中覆蓋它。

## 模板語法

郵件模板是 UTF-8 編碼的文本文件，需要遵循以下格式之一：

```
主題行的文本和宏
------------
郵件正文的文本和宏
```

或

```
郵件正文的文本和宏
```

指定 _主題_ 部分是可選的（因此也是破折號分隔符）。使用時，_主題_ 和 _郵件正文_ 模板之間的分隔符需要至少三個破折號；分隔符行中不允許其他字符。

_主題_ 和 _郵件正文_ 由 [Golang 的模板引擎](https://go.dev/pkg/text/template/) 解析，
並為每個通知提供一個 _元資料上下文_。上下文包含以下元素：

| 名稱               | 類型             | 可用性     | 用途                                                                                                                                                              |
| ------------------ | ---------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.FallbackSubject` | string           | 總是       | 預設主題行。見下文。                                                                                                                                              |
| `.Subject`         | string           | 僅在正文中 | 解析後的 _主題_。                                                                                                                                                 |
| `.Body`            | string           | 總是       | 問題、拉取請求或評論的消息，從 Markdown 解析為 HTML 並進行了清理。不要與 _郵件正文_ 混淆。                                                                        |
| `.Link`            | string           | 總是       | 發起問題、拉取請求或評論的地址。                                                                                                                                  |
| `.Issue`           | models.Issue     | 總是       | 發起通知的問題（或拉取請求）。要獲取特定於拉取請求的資料（例如 `HasMerged`），可以使用 `.Issue.PullRequest`，但應注意，如果問題不是拉取請求，則此欄位將為 `nil`。 |
| `.Comment`         | models.Comment   | 如果適用   | 如果通知來自添加到問題或拉取請求的評論，這將包含有關評論的資訊。                                                                                                  |
| `.IsPull`          | bool             | 總是       | 如果郵件通知與拉取請求相關聯（即 `.Issue.PullRequest` 不是 `nil`），則為 `true`。                                                                                 |
| `.Repo`            | string           | 總是       | 包括所有者名稱的儲存庫名稱（例如 `mike/stuff`）                                                                                                                   |
| `.User`            | models.User      | 總是       | 發起事件的儲存庫所有者。要獲取使用者名稱（例如 `mike`），可以使用 `.User.Name`。                                                                                      |
| `.Doer`            | models.User      | 總是       | 觸發通知事件的操作使用者。要獲取使用者名稱（例如 `rhonda`），可以使用 `.Doer.Name`。                                                                                    |
| `.IsMention`       | bool             | 總是       | 如果此通知僅因為使用者在評論中被提及而生成，而不是訂閱了源，則為 `true`。如果收件人訂閱了問題或儲存庫，則為 `false`。                                               |
| `.SubjectPrefix`   | string           | 總是       | 如果通知不是關於建立問題或拉取請求，則為 `Re: `；否則為空字符串。                                                                                                 |
| `.ActionType`      | string           | 總是       | `"issue"` 或 `"pull"`。將對應於實際的 _操作類型_，無論選擇了哪個模板。                                                                                            |
| `.ActionName`      | string           | 總是       | 它將是上述操作類型之一（`new`、`comment` 等），並將對應於實際的 _操作名稱_，無論選擇了哪個模板。                                                                  |
| `.ReviewComments`  | []models.Comment | 總是       | 審查中的程式碼評論列表。評論文本將在 `.RenderedContent` 中，引用的程式碼將在 `.Patch` 中。                                                                            |

所有名稱都是區分大小寫的。

### 模板的 _主題_ 部分

郵件 _主題_ 使用的模板引擎是 golang 的 [`text/template`](https://go.dev/pkg/text/template/)。
請參閱鏈接的文件以瞭解其語法的詳細資訊。

主題的構建步驟如下：

- 根據通知類型和存在的模板選擇模板。
- 解析並解析模板（例如 `{{.Issue.Index}}` 轉換為問題或拉取請求的編號）。
- 所有空格字符（例如 `TAB`、`LF` 等）轉換為普通空格。
- 刪除所有前導、尾隨和冗餘空格。
- 字符串被截斷為其前 256 個符文（字符）。

如果最終結果是空字符串，**或** 沒有可用的主題模板（即選擇的模板不包括主題部分），將使用 Gitea 的 **內部預設值**。

內部預設（回退）主題相當於：

```sh
{{.SubjectPrefix}}[{{.Repo}}] {{.Issue.Title}} (#{{.Issue.Index}})
```

例如：`Re: [mike/stuff] New color palette (#38)`

Gitea 的預設主題也可以在模板 _元資料_ 中找到，作為 `.FallbackSubject`，即使存在有效的主題模板。

### 模板的 _郵件正文_ 部分

郵件 _正文_ 使用的模板引擎是 golang 的 [`html/template`](https://go.dev/pkg/html/template/)。
請參閱鏈接的文件以瞭解其語法的詳細資訊。

郵件 _正文_ 在郵件主題之後解析，因此有一個額外的 _元資料_ 欄位，即實際渲染的主題，考慮所有因素後。

預期結果是 HTML（包括結構元素如 `<html>`、`<body>` 等）。可以透過 `<style>` 塊、`class` 和 `style` 屬性進行樣式設定。然而，`html/template` 會進行一些 [自動轉義](https://go.dev/pkg/html/template/#hdr-Contexts)，應該考慮到。

不支援附件（如圖像或外部樣式表）。但是，也可以引用其他模板，例如提供 `<style>` 元素的內容。外部模板必須放置在 `custom/mail` 下，並相對於該目錄引用。例如，`custom/mail/styles/base.tmpl` 可以使用 `{{template styles/base}}` 包含。

郵件以 `Content-Type: multipart/alternative` 發送，因此正文以 HTML 和文本格式發送。後者通過剝離 HTML 標記獲得。

## 故障排除

郵件的渲染方式直接取決於郵件應用程式的功能。許多郵件客戶端甚至不支援 HTML，因此它們顯示生成的郵件中包含的文本版本。

如果模板渲染失敗，只有在郵件發送時才會注意到。
如果主題模板失敗，將使用預設主題，並且無論渲染成功的部分如何，都將使用 _郵件正文_。

如果有問題，請檢查 [Gitea 的日誌](../administration/logging-config.md) 以獲取錯誤消息。

## 範例

`custom/templates/mail/issue/default.tmpl`：

```html
[{{.Repo}}] @{{.Doer.Name}}
{{if eq .ActionName "new"}}
    created
{{else if eq .ActionName "comment"}}
    commented on
{{else if eq .ActionName "close"}}
    closed
{{else if eq .ActionName "reopen"}}
    reopened
{{else}}
    updated
{{end}}
{{if eq .ActionType "issue"}}
    issue
{{else}}
    pull request
{{end}}
#{{.Issue.Index}}: {{.Issue.Title}}
------------
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>{{.Subject}}</title>
</head>

<body>
    {{if .IsMention}}
    <p>
        You are receiving this because @{{.Doer.Name}} mentioned you.
    </p>
    {{end}}
    <p>
        <p>
        <a href="{{AppUrl}}/{{.Doer.LowerName}}">@{{.Doer.Name}}</a>
        {{if not (eq .Doer.FullName "")}}
            ({{.Doer.FullName}})
        {{end}}
        {{if eq .ActionName "new"}}
            created
        {{else if eq .ActionName "close"}}
            closed
        {{else if eq .ActionName "reopen"}}
            reopened
        {{else}}
            updated
        {{end}}
        <a href="{{.Link}}">{{.Repo}}#{{.Issue.Index}}</a>.
        </p>
        {{if not (eq .Body "")}}
            <h3>Message content</h3>
            <hr>
            {{.Body}}
        {{end}}
    </p>
    <hr>
    <p>
        <a href="{{.Link}}">View it on Gitea</a>.
    </p>
</body>
</html>
```

此模板生成如下內容：

### 主題

> [mike/stuff] @rhonda commented on pull request #38: New color palette

### 郵件正文

> [@rhonda](#) (Rhonda Myers) updated [mike/stuff#38](#).
>
> #### Message content
>
> \_******\*\*******\*\*\*\*******\*\*******\_******\*\*******\*\*\*\*******\*\*******
>
> Mike, I think we should tone down the blues a little.
> \_******\*\*******\*\*\*\*******\*\*******\_******\*\*******\*\*\*\*******\*\*******
>
> [View it on Gitea](#).

## 高級

模板系統包含幾個函數，可用於進一步處理和格式化消息。以下是其中一些的列表：

| 名稱             | 參數        | 可用性 | 用途                                        |
| ---------------- | ----------- | ------ | ------------------------------------------- |
| `AppUrl`         | -           | 任何   | Gitea 的 URL                                |
| `AppName`        | -           | 任何   | 從 `app.ini` 設定，通常為 "Gitea"           |
| `AppDomain`      | -           | 任何   | Gitea 的主機名                              |
| `EllipsisString` | string, int | 任何   | 將字符串截斷為指定長度；根據需要添加省略號  |
| `SanitizeHTML`   | string      | 僅正文 | 通過刪除任何危險的 HTML 標籤來清理文本      |
| `SafeHTML`       | string      | 僅正文 | 將輸入作為 HTML，可以用於輸出原始 HTML 內容 |

這些是 _函數_，而不是元資料，因此必須這樣使用：

```html
像這樣：{{SanitizeHTML "Escape<my
  >text"}} 或這樣：{{ "Escape<my
    >text" | SanitizeHTML}} 或這樣：{{AppUrl}} 但不能這樣： {{.AppUrl}}</my
  ></my
>
```
