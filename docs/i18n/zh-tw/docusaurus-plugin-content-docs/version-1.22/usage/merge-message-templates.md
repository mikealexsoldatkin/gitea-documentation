---
date: "2023-05-23T09:00:00+08:00"

slug: "merge-message-templates"
sidebar_position: 15

aliases:
  - /zh-tw/merge-message-templates
---

# 合併消息模板

## 文件名

PR 預設合併消息模板可能的文件名：

- `.gitea/default_merge_message/MERGE_TEMPLATE.md`
- `.gitea/default_merge_message/REBASE_TEMPLATE.md`
- `.gitea/default_merge_message/REBASE-MERGE_TEMPLATE.md`
- `.gitea/default_merge_message/SQUASH_TEMPLATE.md`
- `.gitea/default_merge_message/MANUALLY-MERGED_TEMPLATE.md`
- `.gitea/default_merge_message/REBASE-UPDATE-ONLY_TEMPLATE.md`

## 變量

您可以在這些模板中使用以下以 `${}` 包圍的變量，這些變量遵循 [os.Expand](https://pkg.go.dev/os#Expand) 語法：

- BaseRepoOwnerName：此合併請求的基礎儲存庫所有者名稱
- BaseRepoName：此合併請求的基礎儲存庫名稱
- BaseBranch：此合併請求的基礎儲存庫目標分支名稱
- HeadRepoOwnerName：此合併請求的源儲存庫所有者名稱
- HeadRepoName：此合併請求的源儲存庫名稱
- HeadBranch：此合併請求的源儲存庫分支名稱
- PullRequestTitle：合併請求的標題
- PullRequestDescription：合併請求的描述
- PullRequestPosterName：合併請求的提交者名稱
- PullRequestIndex：合併請求的索引號
- PullRequestReference：合併請求的引用字符與索引號。例如，#1、!2
- ClosingIssues：返回一個包含將由此合併請求關閉的所有工單的字符串。例如 `close #1, close #2`

## 變基（Rebase）

在沒有合併提交的情況下進行變基時，`REBASE_TEMPLATE.md` 修改最後一次提交的消息。此模板還提供以下附加變量：

- CommitTitle：提交的標題
- CommitBody：提交的正文文本
