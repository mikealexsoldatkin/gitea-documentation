---
date: "2019-12-31T13:55:00+05:00"
slug: "search-engines-indexation"
sidebar_position: 60
aliases:
  - /zh-tw/search-engines-indexation
---

# 搜尋引擎索引

預設情況下，你的 Gitea 安裝會被搜尋引擎索引。
如果你不希望你的儲存庫被搜尋引擎看到，請繼續閱讀。

## 使用 robots.txt 阻止搜尋引擎索引

要讓 Gitea 為頂層安裝提供自訂的 `robots.txt`（預設：空的 404），請在 [`custom` 資料夾或 `CustomPath`](../administration/customizing-gitea.md) 中建立一個路徑為 `public/robots.txt` 的檔案。

如何設定 `robots.txt` 的範例可以在 [https://moz.com/learn/seo/robotstxt](https://moz.com/learn/seo/robotstxt) 找到。

```txt
User-agent: *
Disallow: /
```

如果你在子目錄中安裝了 Gitea，你需要在頂層目錄中建立或編輯 `robots.txt`。

```txt
User-agent: *
Disallow: /gitea/
```
