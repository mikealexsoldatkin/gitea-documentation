---
date: "2023-05-23T09:00:00+08:00"
slug: "push"
sidebar_position: 15
aliases:
  - /zh-tw/push-to-create
  - /zh-tw/push-options
---

# 推送

在將提交推送到 Gitea 伺服器時，還有一些額外的功能。

## 通過推送打開 PR

當您第一次將提交推送到非預設分支時，您將收到一個鏈接，您可以單擊該鏈接訪問分支與主分支的比較頁面。
從那裡，您可以輕鬆建立一個拉取請求，即使您想要將其目標指向另一個分支。

![Gitea 推送提示](/gitea-push-hint.png)

## 推送選項

在 Gitea `1.13` 版本中，添加了對一些 [推送選項](https://git-scm.com/docs/git-push#Documentation/git-push.txt--oltoptiongt) 的支援。

### 支援的選項

- `repo.private` (true|false) - 更改存放庫的可見性。

  這在與 push-to-create 結合使用時特別有用。

- `repo.template` (true|false) - 更改存放庫是否為模板。

將存放庫的可見性更改為公開的範例：

```shell
git push -o repo.private=false -u origin main
```

## 推送建立

推送建立是一項功能，允許您將提交推送到在 Gitea 中尚不存在的存放庫。這對於自動化和允許使用者建立存放庫而無需通過 Web 介面非常有用。此功能預設處於禁用狀態。

### 啟用推送建立

在 `app.ini` 文件中，將 `ENABLE_PUSH_CREATE_USER` 設定為 `true`，如果您希望允許使用者在自己的使用者帳戶和所屬的組織中建立存放庫，將 `ENABLE_PUSH_CREATE_ORG` 設定為 `true`。重新啟動 Gitea 以使更改生效。您可以在 [設定速查表](../administration/config-cheat-sheet.md#存放庫-repository) 中瞭解有關這兩個選項的更多資訊。

### 使用推送建立

假設您在當前目錄中有一個 git 存放庫，您可以透過運行以下命令將提交推送到在 Gitea 中尚不存在的存放庫：

```shell
# 添加要推送到的遠程存放庫
git remote add origin git@{domain}:{username}/{尚不存在的存放庫名稱}.git

# 推送到遠程存放庫
git push -u origin main
```

這假設您使用的是 SSH 遠程，但您也可以使用 HTTPS 遠程。

推送建立將預設使用 `app.ini` 中定義的可見性 `DEFAULT_PUSH_CREATE_PRIVATE`。
