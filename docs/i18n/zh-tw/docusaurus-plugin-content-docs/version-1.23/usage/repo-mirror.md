---
date: "2021-05-13T00:00:00-00:00"
slug: "repo-mirror"
sidebar_position: 45
aliases:
  - /zh-tw/repo-mirror
---

# 儲存庫鏡像

儲存庫鏡像允許將儲存庫與外部來源進行鏡像。您可以使用它在儲存庫之間鏡像分支、標籤和提交。

## 用例

以下是儲存庫鏡像的一些可能用例：

- 您已遷移到 Gitea，但仍需要將專案保留在另一個來源中。在這種情況下，您可以簡單地設定為鏡像到 Gitea（拉取），所有提交、標籤和分支的歷史記錄都將在您的 Gitea 實例中可用。
- 您在另一個來源中有舊專案，您不再積極使用它們，但不想刪除以進行存檔。在這種情況下，您可以建立一個推送鏡像，以便您的活動 Gitea 儲存庫可以將其更改推送到舊位置。

## 從遠程儲存庫拉取

對於現有的遠程儲存庫，您可以按以下步驟設定拉取鏡像：

1. 在右上角的 **建立...** 菜單中選擇 **新建遷移**。
2. 選擇遠程儲存庫服務。
3. 輸入儲存庫 URL。
4. 如果儲存庫需要身份驗證，請填寫您的身份驗證資訊。
5. 勾選 **此儲存庫將成為鏡像**。
6. 選擇 **遷移儲存庫** 以保存設定。

現在，儲存庫將定期從遠程儲存庫鏡像。您可以在儲存庫設定中選擇 **立即同步** 來強制同步。

:::warning
:exclamation::exclamation: 您只能為尚不存在於您的實例中的儲存庫設定拉取鏡像。一旦儲存庫建立，您將無法將其轉換為拉取鏡像。 :exclamation::exclamation:
:::

## 推送到遠程儲存庫

對於現有儲存庫，您可以按以下步驟設定推送鏡像：

1. 在您的儲存庫中，轉到 **設定** > **儲存庫**，然後轉到 **鏡像設定** 部分。
2. 輸入儲存庫 URL。
3. 如果儲存庫需要身份驗證，請展開 **授權** 部分並填寫您的身份驗證資訊。請注意，請求的 **密碼** 也可以是您的存取權杖。
4. 選擇 **添加推送鏡像** 以保存設定。

現在，儲存庫將定期鏡像到遠程儲存庫。您可以選擇 **立即同步** 來強制同步。如果出現錯誤，將顯示一條消息以幫助您解決問題。

:::warning
:exclamation::exclamation: 這將強制推送到遠程儲存庫。這將覆蓋遠程儲存庫中的任何更改！ :exclamation::exclamation:
:::

### 從 Gitea 到 GitHub 設定推送鏡像

要從 Gitea 設定到 GitHub 的鏡像，您需要按照以下步驟操作：

1. 建立一個 [GitHub 個人存取權杖](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token)，並勾選 _public_repo_ 框。如果您的儲存庫使用 GitHub Actions 進行持續整合，還請勾選 **workflow** 框。
2. 在 GitHub 上建立一個具有該名稱的儲存庫。與 Gitea 不同，GitHub 不支援通過推送建立儲存庫。如果它具有與您的 Gitea 儲存庫相同的提交歷史記錄，您也可以使用現有的遠程儲存庫。
3. 在您的 Gitea 儲存庫設定中，填寫 **Git 遠程儲存庫 URL**：`https://github.com/<your_github_group>/<your_github_project>.git`。
4. 使用您的 GitHub 使用者名稱和個人存取權杖作為 **密碼** 填寫 **授權** 欄位。
5. （可選，適用於 Gitea 1.18+）選擇 `推送新提交時同步`，以便鏡像在有更改時也會更新。您也可以禁用定期同步。
6. 選擇 **添加推送鏡像** 以保存設定。

儲存庫隨後會很快推送。要強制推送，選擇 **立即同步** 按鈕。

### 從 Gitea 到 GitLab 設定推送鏡像

要從 Gitea 設定到 GitLab 的鏡像，您需要按照以下步驟操作：

1. 建立一個 [GitLab 個人存取權杖](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html)，並勾選 _write_repository_ 範圍。
2. 填寫 **Git 遠程儲存庫 URL**：`https://<destination host>/<your_gitlab_group_or_name>/<your_gitlab_project>.git`。
3. 使用 `oauth2` 作為 **使用者名稱** 和您的 GitLab 個人存取權杖作為 **密碼** 填寫 **授權** 欄位。
4. 選擇 **添加推送鏡像** 以保存設定。

儲存庫隨後會很快推送。要強制推送，選擇 **立即同步** 按鈕。

### 從 Gitea 到 Bitbucket 設定推送鏡像

要從 Gitea 設定到 Bitbucket 的鏡像，您需要按照以下步驟操作：

1. 建立一個 [Bitbucket 應用密碼](https://support.atlassian.com/bitbucket-cloud/docs/app-passwords/)，並勾選 _Repository Write_ 框。
2. 填寫 **Git 遠程儲存庫 URL**：`https://bitbucket.org/<your_bitbucket_group_or_name>/<your_bitbucket_project>.git`。
3. 使用您的 Bitbucket 使用者名稱和應用密碼作為 **密碼** 填寫 **授權** 欄位。
4. 選擇 **添加推送鏡像** 以保存設定。

儲存庫隨後會很快推送。要強制推送，選擇 **立即同步** 按鈕。

### 鏡像現有的 ssh 儲存庫

目前 Gitea 不支援 ssh 推送鏡像。您可以透過向您的 Gitea 儲存庫添加一個 `post-receive` 鉤子來手動推送來解決此問題。

1. 確保運行 Gitea 的使用者可以從 shell 訪問您嘗試鏡像到的 git 儲存庫。
2. 在 Web 介面的儲存庫設定 > git 鉤子中，為鏡像添加一個 post-receive 鉤子。例如：

```
#!/usr/bin/env bash
git push --mirror --quiet git@github.com:username/repository.git &>/dev/null &
echo "GitHub 鏡像已啟動 .."
```
