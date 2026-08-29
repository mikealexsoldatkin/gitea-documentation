---
date: "2023-05-23T09:00:00+08:00"
slug: "repo-mirror"
sidebar_position: 45
aliases:
  - /zh-tw/repo-mirror
---

# 存放庫鏡像

存放庫鏡像允許將存放庫與外部源之間進行鏡像。您可以使用它在存放庫之間鏡像分支、標籤和提交。

## 使用場景

以下是一些存放庫鏡像的可能使用場景：

- 您遷移到了 Gitea，但仍需要在其他源中保留您的專案。在這種情況下，您可以簡單地設定它以進行鏡像到 Gitea（拉取），這樣您的 Gitea 實例中就可以獲取到所有必要的提交歷史、標籤和分支。
- 您在其他源中有一些舊專案，您不再主動使用，但出於歸檔目的不想刪除。在這種情況下，您可以建立一個推送鏡像，以便您的活躍的 Gitea 存放庫可以將其更改推送到舊位置。

## 從遠程存放庫拉取

對於現有的遠程存放庫，您可以按照以下步驟設定拉取鏡像：

1. 在右上角的“建立...”菜單中選擇“遷移外部存放庫”。
2. 選擇遠程存放庫服務。
3. 輸入存放庫的 URL。
4. 如果存放庫需要身份驗證，請填寫您的身份驗證資訊。
5. 選中“該存放庫將是一個鏡像”復選框。
6. 選擇“遷移存放庫”以保存設定。

現在，該存放庫會定期從遠程存放庫進行鏡像。您可以透過在存放庫設定中選擇“立即同步”來強制進行同步。

:::warning
:exclamation::exclamation: **注意：**您只能為尚不存在於您的實例上的存放庫設定拉取鏡像。一旦存放庫建立成功，您就無法再將其轉換為拉取鏡像。:exclamation::exclamation:
:::

## 推送到遠程存放庫

對於現有的存放庫，您可以按照以下步驟設定推送鏡像：

1. 在存放庫中，轉到**設定** > **存放庫**，然後進入**鏡像設定**部分。
2. 輸入一個存放庫的 URL。
3. 如果存放庫需要身份驗證，請展開**授權**部分並填寫您的身份驗證資訊。請注意，所請求的**密碼**也可以是您的存取權杖。
4. 選擇**添加推送鏡像**以保存設定。

該存放庫現在會定期鏡像到遠程存放庫。您可以透過選擇**立即同步**來強制同步。如果出現錯誤，會顯示一條消息幫助您解決問題。

:::warning
:exclamation::exclamation: **注意：** 這將強制推送到遠程存放庫。這將覆蓋遠程存放庫中的任何更改！ :exclamation::exclamation:
:::

### 從 Gitea 向 GitHub 設定推送鏡像

要從 Gitea 設定鏡像到 GitHub，您需要按照以下步驟進行操作：

1. 建立一個具有選中 _public_repo_ 選項的 [GitHub 個人存取權杖](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token)。
2. 在 GitHub 上建立一個同名的存放庫。與 Gitea 不同，GitHub 不支援通過推送到遠程來建立存放庫。如果您的現有遠程存放庫與您的 Gitea 存放庫具有相同的提交歷史，您也可以使用現有的遠程存放庫。
3. 在您的 Gitea 存放庫設定中，填寫**Git 遠程存放庫 URL**：`https://github.com/<your_github_group>/<your_github_project>.git`。
4. 使用您的 GitHub 使用者名稱填寫**授權**欄位，並將個人存取權杖作為**密碼**。
5. （可選，適用於 Gitea 1.18+）選擇`當推送新提交時同步`，這樣一旦有更改，鏡像將會及時更新。如果您願意，您還可以禁用定期同步。
6. 選擇**添加推送鏡像**以保存設定。

存放庫會很快進行推送。要強制推送，請選擇**立即同步**按鈕。

### 從 Gitea 向 GitLab 設定推送鏡像

要從 Gitea 設定鏡像到 GitLab，您需要按照以下步驟進行操作：

1. 建立具有 _write_repository_ 作用域的 [GitLab 個人存取權杖](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html)。
2. 填寫**Git 遠程存放庫 URL**：`https://<destination host>/<your_gitlab_group_or_name>/<your_gitlab_project>.git`。
3. 在**授權**欄位中填寫 `oauth2` 作為**使用者名稱**，並將您的 GitLab 個人存取權杖作為**密碼**。
4. 選擇**添加推送鏡像**以保存設定。

存放庫會很快進行推送。要強制推送，請選擇**立即同步**按鈕。

### 從 Gitea 向 Bitbucket 設定推送鏡像

要從 Gitea 設定鏡像到 Bitbucket，您需要按照以下步驟進行操作：

1. 建立一個具有選中 _Repository Write_ 選項的 [Bitbucket 應用密碼](https://support.atlassian.com/bitbucket-cloud/docs/app-passwords/)。
2. 填寫**Git 遠程存放庫 URL**：`https://bitbucket.org/<your_bitbucket_group_or_name>/<your_bitbucket_project>.git`。
3. 使用您的 Bitbucket 使用者名稱填寫**授權**欄位，並將應用密碼作為**密碼**。
4. 選擇**添加推送鏡像**以保存設定。

存放庫會很快進行推送。要強制推送，請選擇**立即同步**按鈕。

### 鏡像現有的 ssh 存放庫

當前，Gitea 不支援從 ssh 存放庫進行鏡像。如果您想要鏡像一個 ssh 存放庫，您需要將其轉換為 http 存放庫。您可以使用以下命令將現有的 ssh 存放庫轉換為 http 存放庫：

1. 確保運行 gitea 的使用者有權限訪問您試圖從 shell 鏡像到的 git 存放庫。
2. 在 Web 介面的版本庫設定 > git 鉤子中為鏡像添加一個接收後鉤子。

```
#!/usr/bin/env bash
git push --mirror --quiet git@github.com:username/repository.git &>/dev/null &
echo "GitHub mirror initiated .."
```
