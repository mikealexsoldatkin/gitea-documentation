---
date: "2023-05-25T17:29:00+08:00"
slug: "integrations"
sidebar_position: 65
aliases:
  - /zh-tw/integrations
---

# 整合

Gitea 擁有一個出色的第三方整合社區，以及在其他各種專案中的一流支援。

我們正在[awesome-gitea](https://gitea.com/gitea/awesome-gitea)上整理一個列表來跟蹤這些整合！

如果你正在尋找[CI/CD](https://gitea.com/gitea/awesome-gitea#user-content-devops)，
一個[SDK](https://gitea.com/gitea/awesome-gitea#user-content-sdk)，
甚至一些額外的[主題](https://gitea.com/gitea/awesome-gitea#user-content-themes)，
你可以在[awesome-gitea](https://gitea.com/gitea/awesome-gitea)中找到它們的列表！

## 預填新文件名和內容

如果你想打開一個具有給定名稱和內容的新文件，
你可以使用查詢參數來實現：

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
