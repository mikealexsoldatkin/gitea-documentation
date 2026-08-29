---
date: "2024-09-11T09:30:00+08:00"
slug: "migration"
sidebar_position: 45
---

# 遷移

您可以將儲存庫從其他 Git 服務遷移到您的 Gitea 實例。

## 如何從 Gogs/GitHub/GitLab 遷移到 Gitea

要從 Gogs 遷移到 Gitea：

- [Gogs 版本 0.11.46.0418](https://github.com/go-gitea/gitea/issues/4286)

要從 GitHub 遷移到 Gitea，您可以使用 Gitea 的內置遷移表單。

為了遷移問題、拉取請求等專案，您需要至少輸入您的使用者名稱。

[範例（需要登入）](https://demo.gitea.com/repo/migrate)

要從 GitLab 遷移到 Gitea，您可以使用這個非官方工具：

https://github.com/loganinak/MigrateGitlabToGogs

## 如何從 AWS CodeCommit 遷移到 Gitea

- 要使用 AWS CodeCommit API，Gitea 需要訪問密鑰 ID 和祕密訪問密鑰。出於安全原因，我們建議建立一個具有最低必要權限的新使用者，並為遷移生成訪問密鑰 ID 和祕密訪問密鑰。此使用者所需的最低權限如下：

  ```
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "codecommit:GetRepository",
          "codecommit:GitPull",
          "codecommit:ListPullRequests",
          "codecommit:GetPullRequest",
          "codecommit:GetCommentsForPullRequest"
        ],
        "Resource": [
          "arn:aws:codecommit:<region>:<account>:<Repo-to-Migrate>
      }
    ]
  }
  ```

  - 如果您不需要遷移拉取請求，可以刪除 `ListPullRequests`、`GetPullRequest` 和 `GetCommentsForPullRequest` 操作。

  - 有關如何建立 IAM 使用者並分配權限的說明，您可以參考此 [AWS 文件](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html)。

- 要克隆此儲存庫，Gitea 需要 HTTPS Git 憑據。您可以根據此 [AWS 文件](https://docs.aws.amazon.com/codecommit/latest/userguide/setting-up-gc.html) 建立 HTTPS Git 憑據。
