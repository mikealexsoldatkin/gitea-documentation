---
date: "2022-09-07T16:00:00+08:00"
slug: "issue-pull-request-templates"
sidebar_position: 15
toc: true
aliases:
  - /zh-tw/issue-pull-request-templates
---

# 從模板建立工單與合併請求

開發者可以利用問題模板建立工單與合併請求，其目的在於規範參與者的語言表達。

## 模板介紹

Gitea 支援兩種格式的模板：Markdown 和 YAML。

### Markdown 模板

在 Gitea 中存在兩種用途的 Markdown 模板：

- `ISSUE_TEMPLATE/bug-report.md` 用於規範工單的 Markdown 文本描述
- `PULL_REQUEST_TEMPLATE.md` 用於規範合併請求的 Markdown 文本描述

對於以上 Markdown 模板，我們推薦您將它們放置到專案目錄 `.gitea` 進行收納。

### YAML 模板

用 YAML 語法編寫的模板相比 Markdown 可以實現更豐富的功能，利用表單實現諸如：問卷調查、字符校驗。在 Gitea 中的 YAML 同樣支援兩種用途：

- `ISSUE_TEMPLATE/bug-report.yaml` 用於建立問卷調查形式的工單
- `PULL_REQUEST_TEMPLATE.yaml` 用於建立表單形式的合併請求

對於以上 YAML 模板，我們同樣推薦您將它們放置到專案目錄 `.gitea` 進行收納。

##### 表單支援通過 URL 查詢參數傳值

當新建工單頁面 URL 以 `?title=Issue+Title&body=Issue+Text` 為查詢參數，表單將使用其中的參數（key-value）填充表單內容。

### Gitea 支援的模板文件路徑

工單模板文件名:

- `ISSUE_TEMPLATE.md`
- `ISSUE_TEMPLATE.yaml`
- `ISSUE_TEMPLATE.yml`
- `issue_template.md`
- `issue_template.yaml`
- `issue_template.yml`
- `.gitea/ISSUE_TEMPLATE.md`
- `.gitea/ISSUE_TEMPLATE.yaml`
- `.gitea/ISSUE_TEMPLATE.yml`
- `.gitea/issue_template.md`
- `.gitea/issue_template.yaml`
- `.gitea/issue_template.yml`
- `.github/ISSUE_TEMPLATE.md`
- `.github/ISSUE_TEMPLATE.yaml`
- `.github/ISSUE_TEMPLATE.yml`
- `.github/issue_template.md`
- `.github/issue_template.yaml`
- `.github/issue_template.yml`

合併請求模板:

- `PULL_REQUEST_TEMPLATE.md`
- `PULL_REQUEST_TEMPLATE.yaml`
- `PULL_REQUEST_TEMPLATE.yml`
- `pull_request_template.md`
- `pull_request_template.yaml`
- `pull_request_template.yml`
- `.gitea/PULL_REQUEST_TEMPLATE.md`
- `.gitea/PULL_REQUEST_TEMPLATE.yaml`
- `.gitea/PULL_REQUEST_TEMPLATE.yml`
- `.gitea/pull_request_template.md`
- `.gitea/pull_request_template.yaml`
- `.gitea/pull_request_template.yml`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/PULL_REQUEST_TEMPLATE.yaml`
- `.github/PULL_REQUEST_TEMPLATE.yml`
- `.github/pull_request_template.md`
- `.github/pull_request_template.yaml`
- `.github/pull_request_template.yml`

#### 工單模板目錄

由於工單存在多種類型，Gitea 支援將工單模板統一收納到 `ISSUE_TEMPLATE` 目錄。以下是 Gitea 支援的工單模板目錄:

- `ISSUE_TEMPLATE`
- `issue_template`
- `.gitea/ISSUE_TEMPLATE`
- `.gitea/issue_template`
- `.github/ISSUE_TEMPLATE`
- `.github/issue_template`
- `.gitlab/ISSUE_TEMPLATE`
- `.gitlab/issue_template`

目錄支援混合存放 Markdown (`.md`) 或 YAML (`.yaml`/`.yml`) 格式的工單模板。另外，合併請求模板不支援目錄存放。

## Markdown 模板語法

```md
---
name: "Template Name"
about: "This template is for testing!"
title: "[TEST] "
ref: "main"
labels:
  - bug
  - "help needed"
---

This is the template!
```

上面的範例表示使用者從列表中選擇一個工單模板時，列表會展示模板名稱 `Template Name` 和模板描述 `This template is for testing!`。 同時，標題會預先填充為 `[TEST]`，而正文將預先填充 `This is the template!`。該 Issue 會被指派給 `user1`。 最後，Issue 還會被分配兩個標籤，`bug` 和 `help needed`，並且將問題指向 `main` 分支。

## YAML 模板語法

YAML 模板格式如下，相比 Markdown 模板提供了更多實用性的功能。

```yaml
name: 表單名稱
about: 表單描述
title: 默認標題
body: 主體內容
  type: 定義表單元素類型
    id: 定義表單標號
    attributes: 擴展的屬性
    validations: 內容校驗
```

下例 YAML 設定文件完整定義了一個用於提交 bug 的問卷調查。

```yaml
name: Bug Report
about: File a bug report
title: "[Bug]: "
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this bug report!
  - type: input
    id: contact
    attributes:
      label: Contact Details
      description: How can we get in touch with you if we need more info?
      placeholder: ex. email@example.com
    validations:
      required: false
  - type: textarea
    id: what-happened
    attributes:
      label: What happened?
      description: Also tell us, what did you expect to happen?
      placeholder: Tell us what you see!
      value: "A bug happened!"
    validations:
      required: true
  - type: dropdown
    id: version
    attributes:
      label: Version
      description: What version of our software are you running?
      options:
        - 1.0.2 (Default)
        - 1.0.3 (Edge)
    validations:
      required: true
  - type: dropdown
    id: browsers
    attributes:
      label: What browsers are you seeing the problem on?
      multiple: true
      options:
        - Firefox
        - Chrome
        - Safari
        - Microsoft Edge
  - type: textarea
    id: logs
    attributes:
      label: Relevant log output
      description: Please copy and paste any relevant log output. This will be automatically formatted into code, so no need for backticks.
      render: shell
  - type: checkboxes
    id: terms
    attributes:
      label: Code of Conduct
      description: By submitting this issue, you agree to follow our [Code of Conduct](https://example.com)
      options:
        - label: I agree to follow this project's Code of Conduct
          required: true
```

### Markdown 段落

您可以在 YAML 模板中使用 `markdown` 元素為開發者提供額外的上下文支撐，這部分內容會作為建立工單的提示但不會作為工單內容提交。

`attributes` 子項提供了以下擴展能力：

| 鍵      | 描述                           | 必選 | 類型   | 預設值 | 有效值 |
| ------- | ------------------------------ | ---- | ------ | ------ | ------ |
| `value` | 渲染的文本。支援 Markdown 格式 | 必選 | 字符串 | -      | -      |

### Textarea 多行文本輸入框

您可以使用 `textarea` 元素在表單中添加多行文本輸入框。 除了輸入文本，開發者還可以在 `textarea` 區域附加文件。

`attributes` 子項提供了以下擴展能力：

| 鍵            | 描述                                                                                                  | 必選 | 類型   | 預設值   | 有效值             |
| ------------- | ----------------------------------------------------------------------------------------------------- | ---- | ------ | -------- | ------------------ |
| `label`       | 預期使用者輸入的簡短描述，也以表單形式顯示。                                                            | 必選 | 字符串 | -        | -                  |
| `description` | 提供上下文或指導的文本區域的描述，以表單形式顯示。                                                    | 可選 | 字符串 | 空字符串 | -                  |
| `placeholder` | 半透明的佔位符，在文本區域空白時呈現                                                                  | 可選 | 字符串 | 空字符串 | -                  |
| `value`       | 在文本區域中預填充的文本。                                                                            | 可選 | 字符串 | -        | -                  |
| `render`      | 如果提供了值，提交的文本將格式化為程式碼塊。 提供此鍵時，文本區域將不會擴展到文件附件或 Markdown 編輯。 | 可選 | 字符串 | -        | Gitea 支援的語言。 |

`validations` 子項提供以下文本校驗參數：

| 鍵         | 描述                         | 必選 | 類型   | 預設值 | 有效值 |
| ---------- | ---------------------------- | ---- | ------ | ------ | ------ |
| `required` | 防止在元素完成之前提交表單。 | 可選 | 布爾型 | false  | -      |

### Input 單行輸入框

您可以使用 `input` 元素添加單行文本欄位到表單。

`attributes` 子項提供了以下擴展能力：

| 鍵            | 描述                                           | 必選 | 類型   | 預設值   | 有效值 |
| ------------- | ---------------------------------------------- | ---- | ------ | -------- | ------ |
| `label`       | 預期使用者輸入的簡短描述，也以表單形式顯示。     | 必選 | 字符串 | -        | -      |
| `description` | 提供上下文或指導的欄位的描述，以表單形式顯示。 | 可選 | 字符串 | 空字符串 | -      |
| `placeholder` | 半透明的佔位符，在欄位空白時呈現。             | 可選 | 字符串 | 空字符串 | -      |
| `value`       | 欄位中預填的文本。                             | 可選 | 字符串 | -        | -      |

`validations` 子項提供以下文本校驗參數：

| 鍵          | 描述                             | 必選 | 類型   | 預設值 | 有效值                                                         |
| ----------- | -------------------------------- | ---- | ------ | ------ | -------------------------------------------------------------- |
| `required`  | 防止在未填內容時提交表單。       | 可選 | 布爾型 | false  | -                                                              |
| `is_number` | 防止在未填數字時提交表單。       | 可選 | 布爾型 | false  | -                                                              |
| `regex`     | 直到滿足了與正則表達式匹配的值。 | 可選 | 字符串 | -      | [正則表達式](https://en.wikipedia.org/wiki/Regular_expression) |

### Dropdown 下拉菜單

您可以使用 `dropdown` 元素在表單中添加下拉菜單。

`attributes` 子項提供了以下擴展能力：

| 鍵            | 描述                                                      | 必選 | 類型       | 預設值   | 有效值 |
| ------------- | --------------------------------------------------------- | ---- | ---------- | -------- | ------ |
| `label`       | 預期使用者輸入的簡短描述，以表單形式顯示。                  | 必選 | 字符串     | -        | -      |
| `description` | 提供上下文或指導的下拉列表的描述，以表單形式顯示。        | 可選 | 字符串     | 空字符串 | -      |
| `multiple`    | 確定使用者是否可以選擇多個選項。                            | 可選 | 布爾型     | false    | -      |
| `options`     | 使用者可以選擇的選項列表。 不能為空，所有選擇必須是不同的。 | 必選 | 字符串數組 | -        | -      |

`validations` 子項提供以下文本校驗參數：

| 鍵         | 描述                         | 必選 | 類型   | 預設值 | 有效值 |
| ---------- | ---------------------------- | ---- | ------ | ------ | ------ |
| `required` | 防止在元素完成之前提交表單。 | 可選 | 布爾型 | false  | -      |

### Checkboxes 復選框

您可以使用 `checkboxes` 元素添加一組復選框到表單。

`attributes` 子項提供了以下擴展能力：

| 鍵            | 描述                                                  | 必選 | 類型   | 預設值   | 有效值 |
| ------------- | ----------------------------------------------------- | ---- | ------ | -------- | ------ |
| `label`       | 預期使用者輸入的簡短描述，以表單形式顯示。              | 必選 | 字符串 | -        | -      |
| `description` | 復選框集的描述，以表單形式顯示。 支援 Markdown 格式。 | 可選 | 字符串 | 空字符串 | -      |
| `options`     | 使用者可以選擇的復選框列表。 有關語法，請參閱下文。     | 必選 | 數組   | -        | -      |

對於 `options`，您可以設定以下參數：

| 鍵         | 描述                                                                              | 必選 | 類型   | 預設值 | 有效值 |
| ---------- | --------------------------------------------------------------------------------- | ---- | ------ | ------ | ------ |
| `label`    | 選項的標識符，顯示在表單中。 支援 Markdown 用於粗體或斜體文本格式化和超文本鏈接。 | 必選 | 字符串 | -      | -      |
| `required` | 防止在元素完成之前提交表單。                                                      | 可選 | 布爾型 | false  | -      |
