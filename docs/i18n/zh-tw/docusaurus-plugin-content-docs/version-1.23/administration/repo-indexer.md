---
date: "2019-09-06T01:35:00-03:00"
slug: "repo-indexer"
sidebar_position: 45
aliases:
  - /zh-tw/repo-indexer
---

# 儲存庫索引器

## 無需索引器的內置儲存庫程式碼搜索

使用者可以在不設定儲存庫索引器的情況下進行儲存庫級別的程式碼搜索。
內置程式碼搜索基於 `git grep` 命令，對於小型儲存庫來說快速且高效。
通過設定儲存庫索引器可以實現更好的程式碼搜索支援。

## 設定儲存庫索引器

Gitea 可以透過在您的 [`app.ini`](../administration/config-cheat-sheet.md) 中啟用此功能來搜索儲存庫文件：

```ini
[indexer]
; ...
REPO_INDEXER_ENABLED = true
REPO_INDEXER_PATH = indexers/repos.bleve
MAX_FILE_SIZE = 1048576
REPO_INDEXER_INCLUDE =
REPO_INDEXER_EXCLUDE = resources/bin/**
```

請記住，索引內容可能會消耗大量系統資源，特別是在首次建立索引或全域更新索引時（例如在升級 Gitea 之後）。

### 通過大小選擇要索引的文件

`MAX_FILE_SIZE` 選項將使索引器跳過所有大於指定值的文件。

### 通過路徑選擇要索引的文件

Gitea 應用來自 [`gobwas/glob` 庫](https://github.com/gobwas/glob) 的 glob 模式匹配來選擇將包含在索引中的文件。

限制文件列表可以防止索引被派生或不相關的文件（例如 lss、sym、map 等）污染，因此搜索結果更相關。它還可以幫助減少索引大小。

`REPO_INDEXER_EXCLUDE_VENDORED`（預設：true）從索引中排除供應商文件。

`REPO_INDEXER_INCLUDE`（預設：空）是一個逗號分隔的 glob 模式列表，用於**包含**在索引中的文件。空列表表示“_包含所有文件_”。
`REPO_INDEXER_EXCLUDE`（預設：空）是一個逗號分隔的 glob 模式列表，用於**排除**索引中的文件。匹配此列表的文件將不會被索引。`REPO_INDEXER_EXCLUDE` 優先於 `REPO_INDEXER_INCLUDE`。

模式匹配如下：

- 要匹配所有具有 `.txt` 擴展名的文件，無論在哪個目錄，請使用 `**.txt`。
- 要僅匹配儲存庫根級別的所有 `.txt` 擴展名文件，請使用 `*.txt`。
- 要匹配 `resources/bin` 及以下的所有文件，請使用 `resources/bin/**`。
- 要匹配 `resources/bin` 中**立即**的所有文件，請使用 `resources/bin/*`。
- 要匹配所有名為 `Makefile` 的文件，請使用 `**Makefile`。
- 匹配目錄無效；模式 `resources/bin` 不會包含/排除該目錄中的文件；`resources/bin/**` 會。
- 所有文件和模式都會標準化為小寫，因此 `**Makefile`、`**makefile` 和 `**MAKEFILE` 是等效的。
