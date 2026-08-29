---
date: "2023-05-25T17:29:00+08:00"
slug: "migrations-interfaces"
sidebar_position: 55
aliases:
  - /zh-cn/migrations-interfaces
---

# 迁移接口

完整迁移功能在 Gitea 1.9.0 版本中引入。它定义了两个接口，用于支持从其他 Git 托管平台迁移存储库数据到 Gitea，或者在将来将 Gitea 数据迁移到其他 Git 托管平台。

目前已实现了从 GitHub、GitLab 和其他 Gitea 实例的迁移。

首先，Gitea 在包[modules/migration](https://github.com/go-gitea/gitea/tree/main/modules/migration)中定义了一些标准对象。它们是`Repository`、`Milestone`、`Release`、`ReleaseAsset`、`Label`、`Issue`、`Comment`、`PullRequest`、`Reaction`、`Review`、`ReviewComment`。

## 下载器接口

要从新的 Git 托管平台迁移，需要进行两个步骤的更新。

- 您应该实现一个`Downloader`，用于获取存储库信息。
- 您应该实现一个`DownloaderFactory`，用于检测 URL 是否匹配，并创建上述的`Downloader`。
  - 您需要在`init()`中通过`RegisterDownloaderFactory`注册`DownloaderFactory`。

您可以在[downloader.go](https://github.com/go-gitea/gitea/blob/main/modules/migration/downloader.go)中找到这些接口。

## 上传器接口

目前，只实现了`GiteaLocalUploader`，因此我们只能通过此 Uploader 将下载的数据保存到本地的 Gitea 实例。目前不支持其他上传器。

您可以在[uploader.go](https://github.com/go-gitea/gitea/blob/main/modules/migration/uploader.go)中找到这些接口。
