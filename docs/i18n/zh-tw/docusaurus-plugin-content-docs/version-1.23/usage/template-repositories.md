---
date: "2019-11-28:00:00+02:00"
slug: "template-repositories"
sidebar_position: 14
aliases:
  - /zh-tw/template-repositories
---

# 模板儲存庫

自 Gitea `1.11` 起，您可以建立模板儲存庫。
建立基於模板的儲存庫時，您可以複製其大部分內容，甚至自動注入變量。

預設情況下，不會在任何文件中展開變量。
只有包含在 `.gitea/template` 文件中的模式內的文件才會被檢查是否包含變量。
建立模板時，除 `.gitea/template` 文件外，所有文件都包含在內。

Gitea 使用 [gobwas/glob](https://github.com/gobwas/glob) 進行其 glob 語法。
它與傳統的 `.gitignore` 非常相似，但可能存在細微差異。

## 範例 `.gitea/template` 文件

所有路徑均相對於儲存庫的基礎

```gitignore
# 展開倉庫中任何位置的所有 .go 文件
**.go

# 文本目錄中的所有文本文件
text/*.txt

# 特定文件
a/b/c/d.json

# 大小寫均可匹配的批處理文件
**.[bB][aA][tT]
```

## 變量展開

在上述 glob 匹配的任何文件中，以下變量將被展開。

匹配的文件名和路徑也可以展開，並且經過保守的清理以支援跨平台文件系統。

您可以透過在變量前加上 `$` 或將其括在 `${}` 中來使用變量，因此 `$VAR` 和 `${VAR}` 都會在此位置插入 `VAR` 的值。
要轉義展開，請使用 `$$`，例如 `$$VAR` 或 `$${VAR}`。

這些是 Gitea 目前識別的變量：

| 變量                 | 展開為                           | 可轉換 |
| -------------------- | -------------------------------- | ------ |
| YEAR                 | 生成儲存庫的年份（即 `2024`）      | ✘      |
| MONTH                | 生成儲存庫的月份（即 `03`）        | ✘      |
| MONTH_ENGLISH        | 月份，但用英文表示（即 `March`） | ✓      |
| DAY                  | 生成儲存庫的日期（即 `02`）        | ✘      |
| REPO_NAME            | 生成儲存庫的名稱                   | ✓      |
| TEMPLATE_NAME        | 模板儲存庫的名稱                   | ✓      |
| REPO_DESCRIPTION     | 生成儲存庫的描述                   | ✘      |
| TEMPLATE_DESCRIPTION | 模板儲存庫的描述                   | ✘      |
| REPO_OWNER           | 生成儲存庫的所有者                 | ✓      |
| TEMPLATE_OWNER       | 模板儲存庫的所有者                 | ✓      |
| REPO_LINK            | 生成儲存庫的 URL                   | ✘      |
| TEMPLATE_LINK        | 模板儲存庫的 URL                   | ✘      |
| REPO_HTTPS_URL       | 生成儲存庫的 HTTP(S) 克隆鏈接      | ✘      |
| TEMPLATE_HTTPS_URL   | 模板儲存庫的 HTTP(S) 克隆鏈接      | ✘      |
| REPO_SSH_URL         | 生成儲存庫的 SSH 克隆鏈接          | ✘      |
| TEMPLATE_SSH_URL     | 模板儲存庫的 SSH 克隆鏈接          | ✘      |

## 轉換器 :robot:

自 Gitea `1.12.0` 起，表中標記為可轉換的變量還具有應用了給定轉換器的替代版本。

可以透過將轉換器名稱附加到變量名稱來調用轉換後的變量。
例如，要獲取 `PASCAL` 大小寫的 `REPO_NAME`，您應該使用變量 `${REPO_NAME_PASCAL}`。

以下是可用的轉換器（假設輸入為 `go-sdk`）：

| 轉換器 | 效果   |
| ------ | ------ |
| SNAKE  | go_sdk |
| KEBAB  | go-sdk |
| CAMEL  | goSdk  |
| PASCAL | GoSdk  |
| LOWER  | go-sdk |
| UPPER  | GO-SDK |
| TITLE  | Go-Sdk |
