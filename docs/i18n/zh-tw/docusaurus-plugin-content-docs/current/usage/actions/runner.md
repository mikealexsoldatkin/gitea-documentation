---
date: "2023-05-24T15:00:00+08:00"
slug: "runner"
sidebar_position: 20
aliases:
  - /zh-tw/act-runner
---

# Gitea Runner

本頁面將介紹[Gitea Runner](https://gitea.com/gitea/runner)，這是Gitea Actions的Runner。

:::tip
詳細的安裝、設定和使用說明，請參閱 [Gitea Runner 文件](/runner/)。
:::

## 獲取註冊令牌

### Runner級別

您可以在不同級別上註冊Runner，它可以是：

- 實例級別：Runner將為實例中的所有儲存庫運行Job。
- 組織級別：Runner將為組織中的所有儲存庫運行Job。
- 儲存庫級別：Runner將為其所屬的儲存庫運行Job。

請注意，即使儲存庫具有自己的儲存庫級別Runner，它仍然可以使用實例級別或組織級別Runner。未來的版本可能提供更多對此進行更好控制的選項。

Runner級別決定了從哪裡獲取註冊令牌。

- 實例級別：管理員設定頁面，例如 `<your_gitea.com>/admin/actions/runners`。
- 組織級別：組織設定頁面，例如 `<your_gitea.com>/<org>/settings/actions/runners`。
- 儲存庫級別：儲存庫設定頁面，例如 `<your_gitea.com>/<owner>/<repo>/settings/actions/runners`。

如果您無法看到設定頁面，請確保您具有正確的權限並且已啟用 Actions。

註冊令牌的格式是一個隨機字符串 `D0gvfu2iHfUjNqCYVljVyRV14fISpJxxxxxxxxxx`。

註冊令牌也可以透過 Gitea 的 [命令列](../../administration/command-line.md#actions-generate-runner-token) 獲得:

```
gitea --config /etc/gitea/app.ini actions generate-runner-token
```

使用者也可以使用 `GITEA_RUNNER_REGISTRATION_TOKEN` 或 `GITEA_RUNNER_REGISTRATION_TOKEN_FILE` 環境變量以在 Gitea 啟動時設定全域的註冊令牌，例如：

```
openssl rand -hex 24 > /some-dir/runner-token
export GITEA_RUNNER_REGISTRATION_TOKEN_FILE=/some-dir/runner-token
./gitea --config ...
```

來自環境變量的令牌在通過 Web 介面或 API 重置(重新建立新令牌)前將一直有效。

令牌可用於註冊多個 Runner，直到使用 Web 介面中的令牌重置鏈接將其撤銷並替換為新令牌。

獲取註冊令牌後，請參閱 [Gitea Runner 文件](/runner/) 了解如何安裝、設定和運行您的 Runner。
