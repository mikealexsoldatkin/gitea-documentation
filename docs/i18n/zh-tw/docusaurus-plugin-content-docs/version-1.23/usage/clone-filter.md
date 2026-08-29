---
date: "2021-02-02"
slug: "clone-filters"
sidebar_position: 25
aliases:
  - /zh-tw/clone-filters
---

# 克隆過濾器（部分克隆）

Git 引入了 `--filter` 選項到 `git clone` 命令，該選項過濾掉大文件和對象（如 blobs），以建立儲存庫的部分克隆。
克隆過濾器對於大型儲存庫和/或計量連接特別有用，在這種情況下，完整克隆（沒有 `--filter`）可能會很昂貴（因為必須下載所有歷史資料）。

這需要 Gitea 伺服器和客戶端上的 Git 版本 2.22 或更高版本。為了使克隆過濾器正常工作，請確保客戶端上的 Git 版本至少與伺服器上的版本相同（或更高）。以管理員身份登入到 Gitea 伺服器，前往站點管理 -> 設定以查看伺服器的 Git 版本。

預設情況下，克隆過濾器是啟用的，除非 `[git]` 下的 `DISABLE_PARTIAL_CLONE` 設定為 `true`。

請參閱 [GitHub 部落格文章：瞭解部分克隆](https://github.blog/2020-12-21-get-up-to-speed-with-partial-clone-and-shallow-clone/)
以瞭解克隆過濾器的常見用例（無 blob 和無樹克隆），以及
[GitLab 文件：部分克隆](https://docs.gitlab.com/ee/topics/git/partial_clone.html)
以瞭解更高級的用例（如按文件大小過濾和移除過濾器以將部分克隆轉換為完整克隆）。
