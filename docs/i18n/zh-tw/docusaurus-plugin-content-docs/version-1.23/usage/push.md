---
date: "2020-07-06T16:00:00+02:00"
slug: "push"
sidebar_position: 15
aliases:
  - /zh-tw/push-to-create
  - /zh-tw/push-options
---

# 推送

將提交推送到 Gitea 伺服器時，有一些附加功能。

## 通過推送打開 PR

當您第一次將提交推送到非預設分支時，
您將收到一個鏈接，您可以點擊該鏈接訪問您的分支與主分支的比較頁面。
從那裡，即使您想針對另一個分支，也可以輕鬆建立拉取請求。

![Gitea 推送提示](/gitea-push-hint.png)

## 推送選項

在 Gitea `1.13` 中，添加了對一些 [推送選項](https://git-scm.com/docs/git-push#Documentation/git-push.txt--oltoptiongt) 的支援。

### 支援的選項

- `repo.private` (true|false) - 更改儲存庫的可見性。

  這在與推送建立結合使用時特別有用。

- `repo.template` (true|false) - 更改儲存庫是否為模板。

將儲存庫的可見性更改為公共的範例：

```shell
git push -o repo.private=false -u origin main
```

## 推送建立

推送建立是一個允許您推送到 Gitea 中尚不存在的儲存庫的功能。這對於自動化和允許使用者建立儲存庫而無需通過 Web 介面非常有用。此功能預設禁用。

### 啟用推送建立

在 `app.ini` 文件中，將 `ENABLE_PUSH_CREATE_USER` 設定為 `true`，如果您希望允許使用者在其自己的使用者帳戶中建立儲存庫，並在他們是成員的組織中建立儲存庫，則將 `ENABLE_PUSH_CREATE_ORG` 設定為 `true`。重新啟動 Gitea 以使更改生效。您可以在 [設定備忘單](../administration/config-cheat-sheet.md#儲存庫repository) 中閱讀有關這兩個選項的更多資訊。

### 使用推送建立

假設您在當前目錄中有一個 git 儲存庫，您可以透過運行以下命令推送到 Gitea 中尚不存在的儲存庫：

```shell
# 添加您要推送的遠程
git remote add origin git@{domain}:{username}/{repo name that does not exist yet}.git

# 推送到遠程
git push -u origin main
```

這假設您使用的是 SSH 遠程，但您也可以使用 HTTPS 遠程。

推送建立將預設為 `app.ini` 中定義的 `DEFAULT_PUSH_CREATE_PRIVATE` 的可見性。
