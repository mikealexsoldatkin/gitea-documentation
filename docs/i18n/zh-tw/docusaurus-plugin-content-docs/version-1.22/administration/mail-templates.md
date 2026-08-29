---
date: "2023-05-23T09:00:00+08:00"

slug: "mail-templates"
sidebar_position: 45

aliases:
  - /zh-tw/mail-templates
---

# 郵件模板

為了定製特定操作的電子郵件主題和內容，可以使用模板來自訂 Gitea。這些功能的模板位於 [`custom` 目錄](../administration/customizing-gitea.md) 下。
如果沒有自訂的替代方案，Gitea 將使用內部模板作為預設模板。

自訂模板在 Gitea 啟動時加載。對它們的更改在 Gitea 重新啟動之前不會被識別。

## 支援模板的郵件通知

目前，以下通知事件使用模板：

| 操作名稱   | 用途                                                                   |
| ---------- | ---------------------------------------------------------------------- |
| `new`      | 建立了新的工單或合併請求。                                             |
| `comment`  | 在現有工單或合併請求中建立了新的評論。                                 |
| `close`    | 關閉了工單或合併請求。                                                 |
| `reopen`   | 重新打開了工單或合併請求。                                             |
| `review`   | 在合併請求中進行審查的首要評論。                                       |
| `approve`  | 對合併請求進行批准的首要評論。                                         |
| `reject`   | 對合併請求提出更改請求的審查的首要評論。                               |
| `code`     | 關於合併請求的程式碼的單個評論。                                         |
| `assigned` | 使用者被分配到工單或合併請求。                                           |
| `default`  | 未包括在上述類別中的任何操作，或者當對應類別的模板不存在時使用的模板。 |

特定消息類型的模板路徑為：

```sh
custom/templates/mail/{操作類型}/{操作名稱}.tmpl
```

其中 `{操作類型}` 是 `issue` 或 `pull`（針對合併請求），`{操作名稱}` 是上述列出的操作名稱之一。

例如，有關合併請求中的評論的電子郵件的特定模板是：

```sh
custom/templates/mail/pull/comment.tmpl
```

然而，並不需要為每個操作類型/名稱組合建立模板。
使用回退系統來選擇適當的模板。在此列表中，將使用 _第一個存在的_ 模板：

- 所需**操作類型**和**操作名稱**的特定模板。
- 操作類型為 `issue` 和所需**操作名稱**的模板。
- 所需**操作類型**和操作名稱為 `default` 的模板。
- 操作類型為` issue` 和操作名稱為 `default` 的模板。

唯一必需的模板是操作類型為 `issue` 操作名稱為 `default` 的模板，除非使用者在 `custom` 目錄中覆蓋了它。

## 模板語法

郵件模板是 UTF-8 編碼的文本文件，需要遵循以下格式之一：

```
用於主題行的文本和宏
------------
用於郵件正文的文本和宏
```

或者

```
用於郵件正文的文本和宏
```

指定 _主題_ 部分是可選的（因此也是虛線分隔符）。在使用時，_主題_ 和 _郵件正文_ 模板之間的分隔符需要至少三個虛線；分隔符行中不允許使用其他字符。

_主題_ 和 _郵件正文_ 由 [Golang 的模板引擎](https://go.dev/pkg/text/template/) 解析，並提供了為每個通知組裝的 _元資料上下文_。上下文包含以下元素：

| 名稱               | 類型             | 可用性         | 用途                                                                                                                                                                    |
| ------------------ | ---------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.FallbackSubject` | string           | 始終可用       | 預設主題行。參見下文。                                                                                                                                                  |
| `.Subject`         | string           | 僅在正文中可用 | 解析後的 _主題_。                                                                                                                                                       |
| `.Body`            | string           | 始終可用       | 工單、合併請求或評論的消息，從 Markdown 解析為 HTML 並進行了清理。請勿與 _郵件正文_ 混淆。                                                                              |
| `.Link`            | string           | 始終可用       | 源工單、合併請求或評論的地址。                                                                                                                                          |
| `.Issue`           | models.Issue     | 始終可用       | 產生通知的工單（或合併請求）。要獲取特定於合併請求的資料（例如 `HasMerged`），可以使用 `.Issue.PullRequest`，但需要注意，如果工單 _不是_ 合併請求，則該欄位將為 `nil`。 |
| `.Comment`         | models.Comment   | 如果適用       | 如果通知是針對添加到工單或合併請求的評論，則其中包含有關評論的資訊。                                                                                                    |
| `.IsPull`          | bool             | 始終可用       | 如果郵件通知與合併請求關聯（即 `.Issue.PullRequest` 不為 `nil` ），則為 `true`。                                                                                        |
| `.Repo`            | string           | 始終可用       | 儲存庫的名稱，包括所有者名稱（例如 `mike/stuff`）                                                                                                                         |
| `.User`            | models.User      | 始終可用       | 事件來源儲存庫的所有者。要獲取使用者名稱（例如 `mike`），可以使用 `.User.Name`。                                                                                              |
| `.Doer`            | models.User      | 始終可用       | 執行觸發通知事件的操作的使用者。要獲取使用者名稱（例如 `rhonda`），可以使用 `.Doer.Name`。                                                                                    |
| `.IsMention`       | bool             | 始終可用       | 如果此通知僅是因為在評論中提到了使用者而生成的，並且收件人未訂閱源，則為 `true`。如果收件人已訂閱工單或儲存庫，則為 `false`。                                               |
| `.SubjectPrefix`   | string           | 始終可用       | 如果通知是關於除工單或合併請求建立之外的其他內容，則為 `Re：`；否則為空字符串。                                                                                         |
| `.ActionType`      | string           | 始終可用       | `"issue"` 或 `"pull"`。它將與實際的 _操作類型_ 對應，與選擇的模板無關。                                                                                                 |
| `.ActionName`      | string           | 始終可用       | 它將是上述操作類型之一（`new` ，`comment` 等），並與選擇的模板對應。                                                                                                    |
| `.ReviewComments`  | []models.Comment | 始終可用       | 審查中的程式碼評論列表。評論文本將在 `.RenderedContent` 中，引用的程式碼將在 `.Patch` 中。                                                                                  |

所有名稱區分大小寫。

### 模板中的主題部分

用於郵件主題的模板引擎是 Golang 的 [`text/template`](https://go.dev/pkg/text/template/)。
有關語法的詳細資訊，請參閱鏈接的文件。

主題構建的步驟如下：

- 根據通知類型和可用的模板選擇一個模板。
- 解析並解析模板（例如，將 `{{.Issue.Index}}` 轉換為工單或合併請求的編號）。
- 將所有空格字符（例如 `TAB`，`LF` 等）轉換為普通空格。
- 刪除所有前導、尾隨和多餘的空格。
- 將字符串截斷為前 256 個字母（字符）。

如果最終結果為空字符串，**或者**沒有可用的主題模板（即所選模板不包含主題部分），將使用 Gitea 的**內部預設值**。

內部預設（回退）主題相當於：

```
{{.SubjectPrefix}}[{{.Repo}}] {{.Issue.Title}} (#{{.Issue.Index}})
```

例如：`Re: [mike/stuff] New color palette (#38)`

即使存在有效的主題模板，Gitea 的預設主題也可以在模板的元資料中作為 `.FallbackSubject` 找到。

### 模板中的郵件正文部分

用於郵件正文的模板引擎是 Golang 的 [`html/template`](https://go.dev/pkg/html/template/)。
有關語法的詳細資訊，請參閱鏈接的文件。

郵件正文在郵件主題之後進行解析，因此還有一個額外的 _元資料_ 欄位，即在考慮所有情況之後實際呈現的主題。

期望的結果是 HTML（包括結構元素，如`<html>`，`<body>`等）。可以透過 `<style>` 塊、`class` 和 `style` 屬性進行樣式設定。但是，`html/template` 會進行一些 [自動轉義](https://go.dev/pkg/html/template/#hdr-Contexts)，需要考慮這一點。

不支援附件（例如圖像或外部樣式表）。但是，也可以引用其他模板，例如以集中方式提供 `<style>` 元素的內容。外部模板必須放置在 `custom/mail` 下，並相對於該目錄引用。例如，可以使用 `{{template styles/base}}` 包含 `custom/mail/styles/base.tmpl`。

郵件以 `Content-Type: multipart/alternative` 發送，因此正文以 HTML 和文本格式發送。通過剝離 HTML 標記來獲取文本版本。

## 故障排除

郵件的呈現方式直接取決於郵件應用程式的功能。許多郵件客戶端甚至不支援 HTML，因此顯示生成郵件中包含的文本版本。

如果模板無法呈現，則只有在發送郵件時纔會注意到。
如果主題模板失敗，將使用預設主題，如果從 _郵件正文_ 中成功呈現了任何內容，則將使用該內容，忽略其他內容。

如果遇到問題，請檢查 [Gitea 的日誌](../administration/logging-config.md) 以獲取錯誤消息。

## 範例

`custom/templates/mail/issue/default.tmpl`:

```html
[{{.Repo}}] @{{.Doer.Name}}
{{if eq .ActionName "new"}}
    創建了
{{else if eq .ActionName "comment"}}
    評論了
{{else if eq .ActionName "close"}}
    關閉了
{{else if eq .ActionName "reopen"}}
    重新打開了
{{else}}
    更新了
{{end}}
{{if eq .ActionType "issue"}}
    工單
{{else}}
    合併請求
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
        您收到此郵件是因為 @{{.Doer.Name}} 提到了您。
    </p>
    {{end}}
    <p>
        <p>
        <a href="{{AppUrl}}/{{.Doer.LowerName}}">@{{.Doer.Name}}</a>
        {{if not (eq .Doer.FullName "")}}
            ({{.Doer.FullName}})
        {{end}}
        {{if eq .ActionName "new"}}
            創建了
        {{else if eq .ActionName "close"}}
            關閉了
        {{else if eq .ActionName "reopen"}}
            重新打開了
        {{else}}
            更新了
        {{end}}
        <a href="{{.Link}}">{{.Repo}}#{{.Issue.Index}}</a>。
        </p>
        {{if not (eq .Body "")}}
            <h3>消息內容：</h3>
            <hr>
            {{.Body}}
        {{end}}
    </p>
    <hr>
    <p>
        <a href="{{.Link}}">在 Gitea 上查看</a>。
    </p>
</body>
</html>
```

該模板將生成以下內容：

### 主題

> [mike/stuff] @rhonda 在合併請求 #38 上進行了評論：New color palette

### 郵件正文

> [@rhonda](#)（Rhonda Myers）更新了 [mike/stuff#38](#)。
>
> #### 消息內容
>
> \_**************\*\*\*\***************\_**************\*\*\*\***************
>
> Mike, I think we should tone down the blues a little.
>
> \_**************\*\*\*\***************\_**************\*\*\*\***************
>
> [在 Gitea 上查看](#)。

## 高級用法

模板系統包含一些函數，可用於進一步處理和格式化消息。以下是其中一些函數的列表：

| 函數名           | 參數        | 可用於     | 用法                                             |
| ---------------- | ----------- | ---------- | ------------------------------------------------ |
| `AppUrl`         | -           | 任何地方   | Gitea 的 URL                                     |
| `AppName`        | -           | 任何地方   | 從 `app.ini` 中設定，通常為 "Gitea"              |
| `AppDomain`      | -           | 任何地方   | Gitea 的主機名                                   |
| `EllipsisString` | string, int | 任何地方   | 將字符串截斷為指定長度；根據需要添加省略號       |
| `SanitizeHTML`   | string      | 僅正文部分 | 通過刪除其中的危險 HTML 標籤對文本進行清理       |
| `SafeHTML`       | string      | 僅正文部分 | 將輸入作為 HTML 處理；可用於輸出原始的 HTML 內容 |

這些都是 _函數_，而不是元資料，因此必須按以下方式使用：

```html
像這樣使用： {{SanitizeHTML "Escape<my
  >text"}} 或者這樣使用： {{"Escape<my
    >text" | SanitizeHTML}} 或者這樣使用： {{AppUrl}} 但不要像這樣使用：
    {{.AppUrl}}</my
  ></my
>
```
