---
date: "2023-05-23T09:00:00+08:00"
slug: "agit"
sidebar_position: 12
aliases:
  - /zh-tw/agit-setup
---

# AGit

在 Gitea `1.13` 版本中，添加了對 [AGit](https://git-repo.info/zh/2020/03/agit-flow-and-git-repo/) 的支援。AGit 允許使用者在沒有儲存庫寫入權限的情況下直接建立拉取請求，也不需要分叉儲存庫。這有助於減少重複儲存庫的數量，降低不必要的磁盤使用量。

:::note
伺服器端需要 Git 版本 2.29 或更高版本才能正常運行。
:::

## 使用 AGit 建立 PR

AGit 允許在推送程式碼到遠程儲存庫時建立 PR（合併請求）。
通過在推送時使用特定的 refspec（git 中已知的位置標識符），可以實現這一功能。
下面的範例說明了這一點：

```shell
git push origin HEAD:refs/for/main
```

該命令的結構如下：

- `HEAD`：目標分支
- `refs/<for|draft|for-review>/<branch>`：目標 PR 類型
  - `for`：建立一個以 `<branch>` 為目標分支的普通 PR
  - `draft`/`for-review`：目前被靜默忽略
- `<branch>/<session>`：要打開 PR 的目標分支
- `-o <topic|title|description>`：PR 的選項
  - `title`：PR 的標題
  - `topic`：PR 應該打開的分支名稱
  - `description`：PR 的描述
  - `force-push=true`: 是否強制更新目標分支
    - 注意: 如果不傳值，只用 `-o force-push` 也同樣可以正常工作。

下面是另一個高級範例，用於建立一個以 `topic`、`title` 和 `description` 為參數的新 PR，目標分支是 `main`：

```shell
git push origin HEAD:refs/for/main -o topic="Topic of my PR" -o title="Title of the PR" -o description="# The PR Description\nThis can be **any** markdown content.\n- [x] Ok"
```
