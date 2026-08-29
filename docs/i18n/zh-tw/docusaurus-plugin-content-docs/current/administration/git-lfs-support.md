---
date: "2023-05-23T09:00:00+08:00"
slug: "git-lfs-setup"
sidebar_position: 12

aliases:
  - /zh-tw/git-lfs-setup
---

# Git LFS 設定

要使用 Gitea 內置的 LFS 支援，您需要更新 `app.ini` 文件：

```ini
[server]
; 啟用 git-lfs 支持。true 或 false，默認為 false。
LFS_START_SERVER = true

[lfs]
; 存放 LFS 文件的路徑，默認為 data/lfs。
PATH = /home/gitea/data/lfs
```

**注意**：LFS 伺服器支援需要伺服器上安裝 Git v2.1.2 以上版本。
