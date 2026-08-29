---
date: "2023-05-23T09:00:00+08:00"
slug: "template-repositories"
sidebar_position: 14
aliases:
  - /zh-tw/template-repositories
---

# 模板儲存庫

Gitea `1.11.0` 及以上版本引入了模板儲存庫，並且其中一個實現的功能是自動展開模板文件中的特定變量。

要告訴 Gitea 哪些文件需要展開，您必須在模板儲存庫的 `.gitea` 目錄中包含一個 `template` 文件。

Gitea 使用 [gobwas/glob](https://github.com/gobwas/glob) 作為其 glob 語法。它與傳統的 `.gitignore` 語法非常相似，但可能存在細微的差異。

## `.gitea/template` 文件範例

所有路徑都是相對於儲存庫的根目錄

```gitignore
# 倉庫中的所有 .go 文件
**.go

# text 目錄中的所有文本文件
text/*.txt

# 特定文件
a/b/c/d.json

# 匹配批處理文件的大小寫變體
**.[bB][aA][tT]
```

**注意：** 當從模板生成儲存庫時，`.gitea` 目錄中的 `template` 文件將被刪除。

## 參數展開

在與上述通配符匹配的任何文件中，將會擴展某些變量。

文件名和路徑的匹配也可以被擴展，並且會經過謹慎的清理處理，以支援跨平台的文件系統。

所有變量都必須採用`$VAR`或`${VAR}`的形式。要轉義擴展，使用雙重`$$`，例如`$$VAR`或`$${VAR}`。

| 變量                 | 擴展為                        | 可轉換 |
| -------------------- | ----------------------------- | ------ |
| REPO_NAME            | 生成的儲存庫名稱                | ✓      |
| TEMPLATE_NAME        | 模板儲存庫名稱                  | ✓      |
| REPO_DESCRIPTION     | 生成的儲存庫描述                | ✘      |
| TEMPLATE_DESCRIPTION | 模板儲存庫描述                  | ✘      |
| REPO_OWNER           | 生成的儲存庫所有者              | ✓      |
| TEMPLATE_OWNER       | 模板儲存庫所有者                | ✓      |
| REPO_LINK            | 生成的儲存庫鏈接                | ✘      |
| TEMPLATE_LINK        | 模板儲存庫鏈接                  | ✘      |
| REPO_HTTPS_URL       | 生成的儲存庫的 HTTP(S) 克隆鏈接 | ✘      |
| TEMPLATE_HTTPS_URL   | 模板儲存庫的 HTTP(S) 克隆鏈接   | ✘      |
| REPO_SSH_URL         | 生成的儲存庫的 SSH 克隆鏈接     | ✘      |
| TEMPLATE_SSH_URL     | 模板儲存庫的 SSH 克隆鏈接       | ✘      |

## 轉換器 :robot:

Gitea `1.12.0` 添加了一些轉換器以應用於上述適用的變量。

例如，要以 `PASCAL`-case 獲取 `REPO_NAME`，你的模板應使用 `${REPO_NAME_PASCAL}`

將 `go-sdk` 傳遞給可用的轉換器的效果如下...

| 轉換器 | 效果   |
| ------ | ------ |
| SNAKE  | go_sdk |
| KEBAB  | go-sdk |
| CAMEL  | goSdk  |
| PASCAL | GoSdk  |
| LOWER  | go-sdk |
| UPPER  | GO-SDK |
| TITLE  | Go-Sdk |
