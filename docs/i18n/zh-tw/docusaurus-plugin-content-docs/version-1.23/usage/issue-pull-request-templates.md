---
date: "2018-05-10T16:00:00+02:00"
slug: "issue-pull-request-templates"
sidebar_position: 15
aliases:
  - /zh-tw/issue-pull-request-templates
---

# 問題和拉取請求模板

一些專案有一個標準的問題列表，當使用者建立問題或拉取請求時需要回答。Gitea 支援將模板添加到儲存庫的**預設分支**，以便在使用者建立問題和拉取請求時自動填充表單。這將減少獲取一些澄清細節的初始來回。
目前無法在全域範圍內提供通用的問題/拉取請求模板。

此外，新問題頁面的 URL 可以後綴 `?title=Issue+Title&body=Issue+Text`，表單將使用這些字符串填充。如果存在模板，這些字符串將被使用而不是模板。

## 文件名

問題模板的可能文件名：

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

問題設定的可能文件名：

- `.gitea/ISSUE_TEMPLATE/config.yaml`
- `.gitea/ISSUE_TEMPLATE/config.yml`
- `.gitea/issue_template/config.yaml`
- `.gitea/issue_template/config.yml`
- `.github/ISSUE_TEMPLATE/config.yaml`
- `.github/ISSUE_TEMPLATE/config.yml`
- `.github/issue_template/config.yaml`
- `.github/issue_template/config.yml`

拉取請求模板的可能文件名：

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

## 目錄名

或者，使用者可以在特殊目錄中建立多個問題模板，並允許使用者選擇一個更具針對性地解決他們的問題。

問題模板的可能目錄名：

- `ISSUE_TEMPLATE`
- `issue_template`
- `.gitea/ISSUE_TEMPLATE`
- `.gitea/issue_template`
- `.github/ISSUE_TEMPLATE`
- `.github/issue_template`
- `.gitlab/ISSUE_TEMPLATE`
- `.gitlab/issue_template`

目錄內可以有多個 markdown（`.md`）或 yaml（`.yaml`/`.yml`）問題模板。

## markdown 模板語法

```md
---
name: "模板名稱"
about: "此模板用於測試！"
title: "[TEST] "
ref: "main"
assignees: ["user1"]
labels:
  - bug
  - "需要幫助"
---

這是模板！
```

在上述範例中，當使用者看到他們可以提交的問題列表時，這將顯示為 `模板名稱`，描述為 `此模板用於測試！`。提交問題時，問題標題將預填充為 `[TEST]`，而問題正文將預填充為 `這是模板！`。
問題將分配給 `user1`。
問題還將分配兩個標籤，
`bug` 和 `需要幫助`，問題將引用 `main`。

## yaml 模板語法

此範例 YAML 設定文件使用多個輸入定義了一個問題表單來報告錯誤。

```yaml
name: 錯誤報告
about: 提交錯誤報告
title: "[Bug]: "
body:
  - type: markdown
    attributes:
      value: |
        感謝您花時間填寫此錯誤報告！
  # 一些僅在創建問題後可見的 markdown
  - type: markdown
    attributes:
      value: |
        此問題是由問題**模板**創建的 :)
    visible: [content]
  - type: input
    id: contact
    attributes:
      label: 聯繫方式
      description: 如果我們需要更多信息，如何與您聯繫？
      placeholder: 例如 email@example.com
    validations:
      required: false
  - type: textarea
    id: what-happened
    attributes:
      label: 發生了什麼？
      description: 也告訴我們，您期望發生什麼？
      placeholder: 告訴我們您看到的！
      value: "發生了錯誤！"
    validations:
      required: true
  - type: dropdown
    id: version
    attributes:
      label: 您運行的軟件版本是什麼？
      description: 您運行的軟件版本是什麼？
      options:
        - 1.0.2（默認）
        - 1.0.3（邊緣）
    validations:
      required: true
  - type: dropdown
    id: browsers
    attributes:
      label: 您在哪些瀏覽器上看到問題？
      multiple: true
      options:
        - Firefox
        - Chrome
        - Safari
        - Microsoft Edge
  - type: textarea
    id: logs
    attributes:
      label: 相關日誌輸出
      description: 請複製並粘貼任何相關的日誌輸出。這將自動格式化為代碼，因此不需要反引號。
      render: shell
  - type: checkboxes
    id: terms
    attributes:
      label: 行為準則
      hide_label: true
      description: 提交此問題即表示您同意遵守我們的[行為準則](https://example.com)
      options:
        - label: 我同意遵守此項目的行為準則
          required: true
        - label: 我也已閱讀 CONTRIBUTION.MD
          required: true
          visible: [form]
        - label: 這是一個僅在創建問題後可見的待辦事項
          visible: [content]
```

### Markdown

您可以使用 `markdown` 元素在表單中顯示 Markdown，為使用者提供額外的上下文，但預設情況下不會提交。

屬性：

| 鍵    | 描述                             | 必需 | 類型   | 預設值 | 有效值 |
| ----- | -------------------------------- | ---- | ------ | ------ | ------ |
| value | 渲染的文本。支援 Markdown 格式。 | 必需 | 字符串 | -      | -      |

visible: 預設為 **[form]**

### Textarea

您可以使用 `textarea` 元素在表單中添加多行文本欄位。貢獻者還可以在 `textarea` 欄位中附加文件。

屬性：

| 鍵          | 描述                                                                                               | 必需 | 類型   | 預設值   | 有效值             |
| ----------- | -------------------------------------------------------------------------------------------------- | ---- | ------ | -------- | ------------------ |
| label       | 預期使用者輸入的簡要描述，也顯示在表單中。                                                           | 必需 | 字符串 | -        | -                  |
| hide_label  | 如果為 true，則標籤通常用作標題不可見。                                                            | 可選 | 布爾值 | false    | -                  |
| description | 文本區的描述，以提供上下文或指導，顯示在表單中。                                                   | 可選 | 字符串 | 空字符串 | -                  |
| placeholder | 當空時在文本區中呈現的半透明佔位符。                                                               | 可選 | 字符串 | 空字符串 | -                  |
| value       | 預填充在文本區中的文本。                                                                           | 可選 | 字符串 | -        | -                  |
| render      | 如果提供了值，提交的文本將格式化為程式碼塊。提供此鍵時，文本區將不會擴展以附加文件或 Markdown 編輯。 | 可選 | 字符串 | -        | Gitea 已知的語言。 |

驗證：

| 鍵       | 描述                         | 必需 | 類型   | 預設值 | 有效值 |
| -------- | ---------------------------- | ---- | ------ | ------ | ------ |
| required | 在元素完成之前阻止表單提交。 | 可選 | 布爾值 | false  | -      |

visible: 預設為 **[form, content]**

### Input

您可以使用 `input` 元素在表單中添加單行文本欄位。

屬性：

| 鍵          | 描述                                             | 必需 | 類型   | 預設值   | 有效值 |
| ----------- | ------------------------------------------------ | ---- | ------ | -------- | ------ |
| label       | 預期使用者輸入的簡要描述，也顯示在表單中。         | 必需 | 字符串 | -        | -      |
| hide_label  | 如果為 true，則標籤通常用作標題不可見。          | 可選 | 布爾值 | false    | -      |
| description | 該欄位的描述，以提供上下文或指導，顯示在表單中。 | 可選 | 字符串 | 空字符串 | -      |
| placeholder | 當空時在欄位中呈現的半透明佔位符。               | 可選 | 字符串 | 空字符串 | -      |
| value       | 預填充在欄位中的文本。                           | 可選 | 字符串 | -        | -      |

驗證：

| 鍵        | 描述                                             | 必需 | 類型   | 預設值 | 有效值                                                              |
| --------- | ------------------------------------------------ | ---- | ------ | ------ | ------------------------------------------------------------------- |
| required  | 在元素完成之前阻止表單提交。                     | 可選 | 布爾值 | false  | -                                                                   |
| is_number | 在元素填寫數字之前阻止表單提交。                 | 可選 | 布爾值 | false  | -                                                                   |
| regex     | 在元素填寫與正則表達式匹配的值之前阻止表單提交。 | 可選 | 字符串 | -      | 一個 [正則表達式](https://en.wikipedia.org/wiki/Regular_expression) |

visible: 預設為 **[form, content]**

### Dropdown

您可以使用 `dropdown` 元素在表單中添加下拉菜單。

屬性：

| 鍵          | 描述                                                                        | 必需 | 類型       | 預設值   | 有效值 |
| ----------- | --------------------------------------------------------------------------- | ---- | ---------- | -------- | ------ |
| label       | 預期使用者輸入的簡要描述，顯示在表單中。                                      | 必需 | 字符串     | -        | -      |
| hide_label  | 如果為 true，則標籤通常用作標題不可見。                                     | 可選 | 布爾值     | false    | -      |
| description | 下拉菜單的描述，以提供額外的上下文或指導，顯示在表單中。                    | 可選 | 字符串     | 空字符串 | -      |
| multiple    | 確定使用者是否可以選擇多個選項。                                              | 可選 | 布爾值     | false    | -      |
| list        | 如果為 true，顯示為列表。如果為 false，則將專案打印在一行上，並用逗號分隔。 | 可選 | 布爾值     | false    | -      |
| options     | 使用者可以選擇的選項數組。不能為空，所有選擇必須是不同的。                    | 必需 | 字符串數組 | -        | -      |

驗證：

| 鍵       | 描述                         | 必需 | 類型   | 預設值 | 有效值 |
| -------- | ---------------------------- | ---- | ------ | ------ | ------ |
| required | 在元素完成之前阻止表單提交。 | 可選 | 布爾值 | false  | -      |

visible: 預設為 **[form, content]**

### Checkboxes

您可以使用 `checkboxes` 元素在表單中添加一組複選框。

屬性：

| 鍵          | 描述                                                 | 必需 | 類型   | 預設值   | 有效值 |
| ----------- | ---------------------------------------------------- | ---- | ------ | -------- | ------ |
| label       | 預期使用者輸入的簡要描述，顯示在表單中。               | 必需 | 字符串 | -        | -      |
| hide_label  | 如果為 true，則標籤通常用作標題不可見。              | 可選 | 布爾值 | false    | -      |
| description | 一組複選框的描述，顯示在表單中。支援 Markdown 格式。 | 必需 | 字符串 | 空字符串 | -      |
| options     | 使用者可以選擇的複選框數組。語法見下文。               | 必需 | 數組   | -        | -      |

對於選項數組中的每個值，您可以設定以下鍵。

| 鍵       | 描述                                                                                         | 必需 | 類型       | 預設值 | 選項 |
| -------- | -------------------------------------------------------------------------------------------- | ---- | ---------- | ------ | ---- |
| label    | 選項的標識符，顯示在表單中。支援 Markdown 格式，用於粗體或斜體文本格式和超鏈接。             | 必需 | 字符串     | -      | -    |
| required | 在元素完成之前阻止表單提交。                                                                 | 可選 | 布爾值     | false  | -    |
| visible  | 特定複選框僅在表單中顯示，在建立的問題中顯示，或兩者都顯示。有效選項是 "form" 和 "content"。 | 可選 | 字符串數組 | false  | -    |

visible: 預設為 **[form, content]**

## 問題設定語法

這是一個問題設定文件的範例

```yaml
blank_issues_enabled: true
contact_links:
  - name: Gitea
    url: https://gitea.com
    about: 訪問 Gitea 網站
```

### 可能的選項

| 鍵                   | 描述                               | 類型         | 預設值 |
| -------------------- | ---------------------------------- | ------------ | ------ |
| blank_issues_enabled | 如果設定為 false，使用者必須使用模板 | 布爾值       | true   |
| contact_links        | 自訂鏈接顯示在選擇框中           | 聯繫鏈接數組 | 空數組 |

### 聯繫鏈接

| 鍵    | 描述             | 類型   | 必需 |
| ----- | ---------------- | ------ | ---- |
| name  | 您的鏈接名稱     | 字符串 | true |
| url   | 您的鏈接 URL     | 字符串 | true |
| about | 您的鏈接簡短描述 | 字符串 | true |
