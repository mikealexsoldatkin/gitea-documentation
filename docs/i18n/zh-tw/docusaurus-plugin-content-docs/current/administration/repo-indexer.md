---
date: "2023-05-23T09:00:00+08:00"
slug: "repo-indexer"
sidebar_position: 45
aliases:
  - /zh-tw/repo-indexer
---

# 儲存庫索引器

## 設定儲存庫索引器

通過在您的 [`app.ini`](../administration/config-cheat-sheet.md) 中啟用此功能，Gitea 可以透過儲存庫的文件進行搜索：

```ini
[indexer]
; ...
REPO_INDEXER_ENABLED = true
REPO_INDEXER_PATH = indexers/repos.bleve
MAX_FILE_SIZE = 1048576
REPO_INDEXER_INCLUDE =
REPO_INDEXER_EXCLUDE = resources/bin/**
```

請記住，索引內容可能會消耗大量系統資源，特別是在首次建立索引或全域更新索引時（例如升級 Gitea 之後）。

### 按大小選擇要索引的文件

`MAX_FILE_SIZE` 選項將使索引器跳過所有大於指定值的文件。

### 按路徑選擇要索引的文件

Gitea 使用 [`gobwas/glob` 庫](https://github.com/gobwas/glob) 中的 glob 模式匹配來選擇要包含在索引中的文件。

限制文件列表可以防止索引被派生或無關的文件（例如 lss、sym、map 等）污染，從而使搜索結果更相關。這還有助於減小索引的大小。

`REPO_INDEXER_EXCLUDE_VENDORED`（預設值為 true）將排除供應商文件不包含在索引中。

`REPO_INDEXER_INCLUDE`（預設值為空）是一個逗號分隔的 glob 模式列表，用於在索引中**包含**的文件。空列表表示“_包含所有文件_”。
`REPO_INDEXER_EXCLUDE`（預設值為空）是一個逗號分隔的 glob 模式列表，用於從索引中**排除**的文件。與該列表匹配的文件將不會被索引。`REPO_INDEXER_EXCLUDE` 優先於 `REPO_INDEXER_INCLUDE`。

模式匹配工作方式如下：

- 要匹配所有帶有 `.txt` 擴展名的文件，無論在哪個目錄中，請使用 `**.txt`。
- 要匹配僅在儲存庫的根級別中具有 `.txt` 擴展名的所有文件，請使用 `*.txt`。
- 要匹配 `resources/bin` 目錄及其子目錄中的所有文件，請使用 `resources/bin/**`。
- 要匹配位於 `resources/bin` 目錄下的所有文件，請使用 `resources/bin/*`。
- 要匹配所有名為 `Makefile` 的文件，請使用 `**Makefile`。
- 匹配目錄沒有效果；模式 `resources/bin` 不會包含/排除該目錄中的文件；`resources/bin/**` 會。
- 所有文件和模式都規範化為小寫，因此 `**Makefile`、`**makefile` 和 `**MAKEFILE` 是等效的。
