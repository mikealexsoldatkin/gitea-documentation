---
date: "2023-05-23T09:00:00+08:00"
slug: "git-lfs-setup"
sidebar_position: 12
aliases:
  - /zh-cn/git-lfs-setup
---

# Git LFS 设置

要使用 Gitea 内置的 LFS 支持，您需要更新 `app.ini` 文件：

```ini
[server]
; 启用 git-lfs 支持。true 或 false，默认为 false。
LFS_START_SERVER = true

[lfs]
; 存放 LFS 文件的路径，默认为 data/lfs。
PATH = /home/gitea/data/lfs
```

**注意**：LFS 服务器支持需要服务器上安装 Git v2.1.2 以上版本。
