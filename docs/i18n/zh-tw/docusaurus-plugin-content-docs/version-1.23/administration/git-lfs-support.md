---
date: "2019-10-06T08:00:00+05:00"
slug: "git-lfs-setup"
sidebar_position: 12
aliases:
  - /zh-tw/git-lfs-setup
---

# Git LFS 設定

要使用 Gitea 的內置 LFS 支援，您必須更新 `app.ini` 文件：

```ini
[server]
; 啟用 git-lfs 支持。true 或 false，默認為 false。
LFS_START_SERVER = true

[lfs]
; 您的 lfs 文件所在的位置，默認為 data/lfs。
PATH = /home/gitea/data/lfs
```

:::note
LFS 伺服器支援需要在伺服器上安裝至少 Git v2.1.2
:::

# Git LFS 純 SSH 協議

LFS 純 SSH 協議支援純粹通過 SSH 進行 LFS 連接
（無需為 Gitea 伺服器公開 HTTP 端點）。
可以透過設定選項 `server.LFS_ALLOW_PURE_SSH` 啟用對它的支援：

```ini
[server]
LFS_ALLOW_PURE_SSH = true
```

:::note
由於 `git-lfs` 客戶端中存在一個未解決的錯誤，該選專案前預設設定為 false，該錯誤會導致 SSH 傳輸掛起：https://github.com/git-lfs/git-lfs/pull/5816
可以透過在所有客戶端機器上設定 git 設定來解決此問題：
`git config --global lfs.ssh.automultiplex false`
:::
