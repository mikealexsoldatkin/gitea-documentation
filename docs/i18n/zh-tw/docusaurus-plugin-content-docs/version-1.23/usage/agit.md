---
date: "2022-09-01T20:50:42+0000"
slug: "agit"
sidebar_position: 12
aliases:
  - /zh-tw/agit-setup
  - /agit-setup
---

# AGit

在 Gitea `1.13` 版本中，添加了對 [AGit](https://git-repo.info/en/2020/03/agit-flow-and-git-repo/) 的支援。AGit 允許使用者在沒有儲存庫寫入權限的情況下直接建立拉取請求，也不需要分叉儲存庫。這有助於減少重複儲存庫的數量，降低不必要的磁盤使用量。

:::note
伺服器端需要 Git 版本 2.29 或更高版本才能正常運行。
:::

## 使用 AGit 建立 PR

AGit 允許在推送程式碼到遠程儲存庫時建立 PR（合併請求）。
通過在推送時使用特定的 refspec（git 中已知的位置標識符），可以實現這一功能。
下面的範例說明瞭這一點：

```shell
git push origin HEAD:refs/for/main
```

該命令的結構如下：

- `HEAD`：目標分支
- `origin`：目標儲存庫（不是分叉！）
- `HEAD`：包含您提議更改的本地分支
- `refs/<for|draft|for-review>/<branch>`：目標 PR 類型和設定
  - `for`：建立一個以 `<branch>` 為目標分支的普通 PR
  - `draft`/`for-review`：目前被靜默忽略
  - `<branch>/`：您希望將更改合併到的分支
- `-o <topic|title|description>`：PR 的選項
  - `topic`：此更改的主題。它將成為等待審查的更改分支的名稱。這是觸發拉取請求所必需的。
  - `title`：PR 的標題（可選但建議），僅用於尚未關聯 PR 的主題。
  - `description`：PR 的描述（可選但建議），僅用於尚未關聯 PR 的主題。
  - `force-push=true`: 是否強制更新目標分支。
    - 注意: 省略值並僅使用 `-o force-push` 也可以正常工作。

下面是另一個高級範例，用於建立一個以 `topic`、`title` 和 `description` 為參數的新 PR，目標分支是 `main`：

```shell
git push origin HEAD:refs/for/main -o topic="topic_of_my_PR" -o title="Title of the PR" -o description="# The PR Description\nThis can be **any** markdown content.\n- [x] Ok"
```
