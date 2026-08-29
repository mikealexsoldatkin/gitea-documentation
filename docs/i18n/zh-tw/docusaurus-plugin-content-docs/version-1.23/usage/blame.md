---
date: "2023-08-14T00:00:00+00:00"
slug: "blame"
sidebar_position: 13
aliases:
  - /zh-tw/blame
---

# Blame 文件視圖

Gitea 支援查看文件的逐行修訂歷史，也稱為 blame 視圖。
您還可以在命令行中使用 [`git blame`](https://git-scm.com/docs/git-blame) 查看文件內行的修訂歷史。

1. 導航到並打開您要查看行歷史的文件。
1. 點擊文件標題欄中的 `Blame` 按鈕。
1. 新視圖顯示文件的逐行修訂歷史，左側顯示作者和提交資訊。
1. 要導航到較舊的提交，點擊 ![versions](/octicon-versions.svg) 圖標。

## 在 blame 視圖中忽略提交

所有在 `.git-blame-ignore-revs` 文件中指定的修訂都會在 blame 視圖中隱藏。
這對於隱藏重新格式化的更改並保留 `git blame` 的好處特別有用。
被忽略的提交更改或添加的行將歸咎於更改該行或附近行的上一個提交。
`.git-blame-ignore-revs` 文件必須位於儲存庫的根目錄中。
有關文件格式的更多資訊，請參見 [git blame --ignore-revs-file 文件](https://git-scm.com/docs/git-blame#Documentation/git-blame.txt---ignore-revs-file)。

### 在 blame 視圖中繞過 `.git-blame-ignore-revs`

如果文件的 blame 視圖顯示有關忽略修訂的消息，您可以透過附加 url 參數 `?bypass-blame-ignore=true` 查看正常的 blame 視圖。
