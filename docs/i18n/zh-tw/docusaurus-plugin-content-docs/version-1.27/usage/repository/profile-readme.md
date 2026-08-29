---
date: "2023-05-23T09:00:00+08:00"
slug: "profile-readme"
sidebar_position: 12
---

# 個人資料 README

要在您的 Gitea 個人資料頁面顯示一個 Markdown 文件，只需建立一個名為 `.profile` 的儲存庫，並編輯其中的 `README.md` 文件。Gitea 將自動獲取該文件並在您的儲存庫上方顯示。

注意：您可以將此儲存庫設為私有。這樣可以隱藏您的源文件，使其對公眾不可見，並允許您將某些文件設為私有。但是，README.md 文件將是您個人資料上唯一存在的文件。如果您希望完全私有化 .profile 儲存庫，則需刪除或重命名 README.md 文件。

使用者範例 `.profile/README.md`:

![個人資料自述文件截圖](/images/usage/profile-readme.png)
