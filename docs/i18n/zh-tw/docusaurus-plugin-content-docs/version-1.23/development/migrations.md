---
date: "2019-04-15T17:29:00+08:00"
slug: "migrations-interfaces"
sidebar_position: 55
aliases:
  - /zh-tw/migrations-interfaces
---

# 遷移介面

完整的遷移在 Gitea 1.9.0 中引入。它定義了兩個介面來支援從其他 Git 主機平台遷移儲存庫資料到 Gitea，或者在未來，將 Gitea 資料遷移到其他 Git 主機平台。

目前，已實現從 GitHub、GitLab 和其他 Gitea 實例的遷移。

首先，Gitea 在 [modules/migration](https://github.com/go-gitea/gitea/tree/main/modules/migration) 包中定義了一些標準對象。它們是 `Repository`、`Milestone`、`Release`、`ReleaseAsset`、`Label`、`Issue`、`Comment`、`PullRequest`、`Reaction`、`Review`、`ReviewComment`。

## 下載器介面

要從新的 Git 主機平台遷移，有兩個步驟需要更新。

- 你應該實現一個 `Downloader`，它將用於獲取儲存庫資訊。
- 你應該實現一個 `DownloaderFactory`，它將用於檢測 URL 是否匹配並建立上述 `Downloader`。
  - 你需要在 `init()` 中通過 `RegisterDownloaderFactory` 註冊 `DownloaderFactory`。

你可以在 [downloader.go](https://github.com/go-gitea/gitea/blob/main/modules/migration/downloader.go) 中找到這些介面。

## 上傳器介面

目前，只實現了一個 `GiteaLocalUploader`，因此我們僅透過此 `Uploader` 將下載的資料保存到本地 Gitea 實例。其他上傳器目前不支援。

你可以在 [uploader.go](https://github.com/go-gitea/gitea/blob/main/modules/migration/uploader.go) 中找到這些介面。
