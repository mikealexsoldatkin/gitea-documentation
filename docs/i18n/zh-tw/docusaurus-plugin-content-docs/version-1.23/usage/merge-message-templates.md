---
date: "2022-08-31T17:35:40+08:00"
slug: "merge-message-templates"
sidebar_position: 15
aliases:
  - /zh-tw/merge-message-templates
---

# 合併消息模板

## 文件名

PR 預設合併消息模板的可能文件名：

- `.gitea/default_merge_message/MERGE_TEMPLATE.md`
- `.gitea/default_merge_message/REBASE_TEMPLATE.md`
- `.gitea/default_merge_message/REBASE-MERGE_TEMPLATE.md`
- `.gitea/default_merge_message/SQUASH_TEMPLATE.md`
- `.gitea/default_merge_message/MANUALLY-MERGED_TEMPLATE.md`
- `.gitea/default_merge_message/REBASE-UPDATE-ONLY_TEMPLATE.md`

## 變量

您可以在這些模板中使用以下變量，這些變量包含在 `${}` 中，遵循 [os.Expand](https://pkg.go.dev/os#Expand) 語法：

- BaseRepoOwnerName: 此拉取請求的基礎儲存庫所有者名稱
- BaseRepoName: 此拉取請求的基礎儲存庫名稱
- BaseBranch: 此拉取請求的基礎儲存庫目標分支名稱
- HeadRepoOwnerName: 此拉取請求的頭部儲存庫所有者名稱
- HeadRepoName: 此拉取請求的頭部儲存庫名稱
- HeadBranch: 此拉取請求的頭部儲存庫分支名稱
- PullRequestTitle: 拉取請求的標題
- PullRequestDescription: 拉取請求的描述
- PullRequestPosterName: 拉取請求的發起人名稱
- PullRequestIndex: 拉取請求的索引號
- PullRequestReference: 帶索引號的拉取請求引用字符。例如 #1, !2
- ClosingIssues: 返回包含所有將被此拉取請求關閉的問題的字符串。例如 `close #1, close #2`
- ReviewedOn: 此提交所屬的拉取請求。例如 `Reviewed-on: https://gitea.com/foo/bar/pulls/1`
- ReviewedBy: 在合併前批准拉取請求的人。例如 `Reviewed-by: Jane Doe <jane.doe@example.com>`

## 重新基準

在沒有合併提交的情況下重新基準，`REBASE_TEMPLATE.md` 修改最後一次提交的消息。此模板中還提供以下變量：

- CommitTitle: 提交的標題
- CommitBody: 提交的正文
