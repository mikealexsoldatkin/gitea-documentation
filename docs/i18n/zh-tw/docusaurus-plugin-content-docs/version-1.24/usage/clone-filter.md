---
date: "2023-05-23T09:00:00+08:00"

slug: "clone-filters"
sidebar_position: 25
aliases:
  - /zh-tw/clone-filters
---

# 克隆過濾器 (部分克隆)

Git 引入了 `--filter` 選項用於 `git clone` 命令，該選項可以過濾掉大文件和對象（如 blob），從而建立一個存放庫的部分克隆。克隆過濾器對於大型存放庫和/或按流量計費的連接特別有用，因為完全克隆（不使用 `--filter`）可能會很昂貴（需要下載所有歷史資料）。

這需要 Git 2.22 或更高版本，無論是在 Gitea 伺服器上還是在客戶端上都需要如此。為了使克隆過濾器正常工作，請確保客戶端上的 Git 版本至少與伺服器上的版本相同（或更高）。以管理員身份登入到 Gitea，然後轉到管理後臺 -> 應用設定，查看伺服器的 Git 版本。

預設情況下，克隆過濾器是啟用的，除非在 `[git]` 下將 `DISABLE_PARTIAL_CLONE` 設定為 `true`。

請參閱 [GitHub 部落格文章：瞭解部分克隆](https://github.blog/2020-12-21-get-up-to-speed-with-partial-clone-and-shallow-clone/) 以獲取克隆過濾器的常見用法（無 Blob 和無樹的克隆），以及 [GitLab 部分克隆文件](https://docs.gitlab.com/ee/topics/git/partial_clone.html) 以獲取更高級的用法（例如按文件大小過濾和取消過濾以將部分克隆轉換為完全克隆）。
