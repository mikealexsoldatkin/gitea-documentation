---
date: "2023-05-23T09:00:00+08:00"

slug: "search-engines-indexation"
sidebar_position: 60

aliases:
  - /zh-tw/search-engines-indexation
---

# 搜索引擎索引

預設情況下，您的 Gitea 安裝將被搜索引擎索引。
如果您不希望您的儲存庫對搜索引擎可見，請進一步閱讀。

## 使用 robots.txt 阻止搜索引擎索引

為了使 Gitea 為頂級安裝提供自訂的`robots.txt`（預設為空的 404），請在 [`custom`文件夾或`CustomPath`]（administration/customizing-gitea.md）中建立一個名為 `public/robots.txt` 的文件。

有關如何設定 `robots.txt` 的範例，請參考 [https://moz.com/learn/seo/robotstxt](https://moz.com/learn/seo/robotstxt)。

```txt
User-agent: *
Disallow: /
```

如果您將 Gitea 安裝在子目錄中，則需要在頂級目錄中建立或編輯 `robots.txt`。

```txt
User-agent: *
Disallow: /gitea/
```
