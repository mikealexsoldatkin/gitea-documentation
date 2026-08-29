---
date: "2019-04-15T17:29:00+08:00"
slug: "integrations"
sidebar_position: 65
aliases:
  - /zh-tw/integrations
---

# 整合

Gitea 有一個很棒的第三方整合社群，以及在各種其他專案中的一流支援。

我們在 [awesome-gitea](https://gitea.com/gitea/awesome-gitea) 上整理了一個列表來追蹤這些整合！

如果你在尋找 [CI/CD](https://gitea.com/gitea/awesome-gitea#user-content-devops)、[SDK](https://gitea.com/gitea/awesome-gitea#user-content-sdk) 或一些額外的 [主題](https://gitea.com/gitea/awesome-gitea#user-content-themes)，你可以在 [awesome-gitea](https://gitea.com/gitea/awesome-gitea) 儲存庫中找到它們！

## 預填新文件名稱和內容

如果你想打開一個具有給定名稱和內容的新文件，你可以使用查詢參數：

```txt
GET /{{org}}/{{repo}}/_new/{{filepath}}
    ?filename={{filename}}
    &value={{content}}
```

例如：

```txt
GET https://git.example.com/johndoe/bliss/_new/articles/
    ?filename=hello-world.md
    &value=Hello%2C%20World!
```
