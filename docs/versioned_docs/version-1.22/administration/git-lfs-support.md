---
date: "2019-10-06T08:00:00+05:00"

slug: "git-lfs-setup"
sidebar_position: 12

aliases:
  - /en-us/git-lfs-setup
---

# Git LFS setup

To use Gitea's built-in LFS support, you must update the `app.ini` file:

```ini
[server]
; Enables git-lfs support. true or false, default is false.
LFS_START_SERVER = true

[lfs]
; Where your lfs files reside, default is data/lfs.
PATH = /home/gitea/data/lfs
```

:::note
LFS server support needs at least Git v2.1.2 installed on the server
:::
