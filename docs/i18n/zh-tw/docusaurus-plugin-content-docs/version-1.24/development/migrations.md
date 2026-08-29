---
date: "2023-05-25T17:29:00+08:00"
slug: "migrations-interfaces"
sidebar_position: 55
aliases:
  - /zh-tw/migrations-interfaces
---

# 遷移介面

完整遷移功能在 Gitea 1.9.0 版本中引入。它定義了兩個介面，用於支援從其他 Git 託管平台遷移儲存庫資料到 Gitea，或者在將來將 Gitea 資料遷移到其他 Git 託管平台。

目前已實現了從 GitHub、GitLab 和其他 Gitea 實例的遷移。

首先，Gitea 在包[modules/migration](https://github.com/go-gitea/gitea/tree/main/modules/migration)中定義了一些標準對象。它們是`Repository`、`Milestone`、`Release`、`ReleaseAsset`、`Label`、`Issue`、`Comment`、`PullRequest`、`Reaction`、`Review`、`ReviewComment`。

## 下載器介面

要從新的 Git 託管平台遷移，需要進行兩個步驟的更新。

- 您應該實現一個`Downloader`，用於獲取儲存庫資訊。
- 您應該實現一個`DownloaderFactory`，用於檢測 URL 是否匹配，並建立上述的`Downloader`。
  - 您需要在`init()`中通過`RegisterDownloaderFactory`註冊`DownloaderFactory`。

您可以在[downloader.go](https://github.com/go-gitea/gitea/blob/main/modules/migration/downloader.go)中找到這些介面。

## 上傳器介面

目前，只實現了`GiteaLocalUploader`，因此我們只能透過此 Uploader 將下載的資料保存到本地的 Gitea 實例。目前不支援其他上傳器。

您可以在[uploader.go](https://github.com/go-gitea/gitea/blob/main/modules/migration/uploader.go)中找到這些介面。
