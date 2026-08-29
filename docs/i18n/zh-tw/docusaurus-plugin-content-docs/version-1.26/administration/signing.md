---
date: "2023-05-23T09:00:00+08:00"
slug: "signing"
sidebar_position: 50
aliases:
  - /zh-tw/signing
---

# GPG 提交簽名

Gitea 將通過檢查提交是否由 Gitea 資料庫中的密鑰簽名，或者提交是否與 Git 的預設密鑰匹配，來驗證提供的樹中的 GPG 提交簽名。

密鑰不會被檢查以確定它們是否已過期或撤銷。密鑰也不會與密鑰伺服器進行檢查。

如果找不到用於驗證提交的密鑰，提交將被標記為灰色的未鎖定圖標。如果提交被標記為紅色的未鎖定圖標，則表示它使用帶有 ID 的密鑰簽名。

請注意：提交的簽署者不必是提交的作者或提交者。

此功能要求 Git >= 1.7.9，但要實現全部功能，需要 Git >= 2.0.0。

## 自動簽名

有許多地方 Gitea 會生成提交：

- 儲存庫初始化
- Wiki 更改
- 使用編輯器或 API 進行的 CRUD 操作
- 從合併請求進行合併

根據設定和伺服器信任，您可能希望 Gitea 對這些提交進行簽名。

## 安裝和生成 Gitea 的 GPG 密鑰

如何安裝簽名密鑰由伺服器管理員決定。Gitea 目前使用伺服器的 `git` 命令生成所有提交，因此將使用伺服器的 `gpg` 進行簽名（如果設定了）。管理員應該審查 GPG 的最佳實踐 - 特別是可能建議僅安裝簽名的子密鑰，而不是主簽名和認證的密鑰。

## 通用設定

Gitea 的簽名設定可以在 `app.ini` 的 `[repository.signing]` 部分找到：

```ini
...
[repository.signing]
SIGNING_KEY = default
SIGNING_NAME =
SIGNING_EMAIL =
INITIAL_COMMIT = always
CRUD_ACTIONS = pubkey, twofa, parentsigned
WIKI = never
MERGES = pubkey, twofa, basesigned, commitssigned

...
```

### `SIGNING_KEY`

首先討論的選項是 `SIGNING_KEY`。有三個主要選項：

- `none` - 這將阻止 Gitea 對任何提交進行簽名
- `default` - Gitea 將使用 `git config` 中設定的預設密鑰
- `KEYID` - Gitea 將使用具有 ID `KEYID` 的 GPG 密鑰對提交進行簽名。在這種情況下，您應該提供 `SIGNING_NAME` 和 `SIGNING_EMAIL`，以便顯示此密鑰的資訊。

`default` 選項將讀取 `git config` 中的 `commit.gpgsign` 選項 - 如果設定了該選項，它將使用 `user.signingkey`、`user.name` 和 `user.email` 的結果。

通過在 Gitea 的儲存庫中調整 Git 的 `config` 文件，可以使用 `SIGNING_KEY=default` 為每個儲存庫提供不同的簽名密鑰。然而，這顯然不是一個理想的使用者介面，因此可能會發生更改。

:::warning
**自 1.17 起**，Gitea 在自己的主目錄 `[git].HOME_PATH`（預設為 `%(APP_DATA_PATH)/home`）中運行 git，並使用自己的設定文件 `{[git].HOME_PATH}/.gitconfig`。

如果您有自己定製的 Gitea git 設定，您應該將這些設定設定在系統 git 設定文件中（例如 `/etc/gitconfig`）或者 Gitea 的內部 git 設定文件 `{[git].HOME_PATH}/.gitconfig` 中。

與 git 命令相關的主目錄文件（如 `.gnupg`）也應該放在 Gitea 的 git 主目錄 `[git].HOME_PATH` 中。
如果您希望將 `.gnupg` 目錄放在 `{[git].HOME_PATH}/` 之外的位置，請考慮設定 `$GNUPGHOME` 環境變量為您首選的位置，否則 Gitea 將會從 `{[git].HOME_PATH}/.gnupg` 查找私鑰。
:::

### `INITIAL_COMMIT`

此選項確定在建立儲存庫時，Gitea 是否應該對初始提交進行簽名。可能的取值有：

- `never`：從不簽名
- `pubkey`：僅在使用者擁有公鑰時進行簽名
- `twofa`：僅在使用者使用 2FA 登入時進行簽名
- `always`：始終簽名

除了 `never` 和 `always` 之外的選項可以組合為逗號分隔的列表。如果所有選擇的選項都為 true，則提交將被簽名。

### `WIKI`

此選項確定 Gitea 是否應該對 Wiki 的提交進行簽名。可能的取值有：

- `never`：從不簽名
- `pubkey`：僅在使用者擁有公鑰時進行簽名
- `twofa`：僅在使用者使用 2FA 登入時進行簽名
- `parentsigned`：僅在父提交已簽名時進行簽名。
- `always`：始終簽名

除了 `never` 和 `always` 之外的選項可以組合為逗號分隔的列表。如果所有選擇的選項都為 true，則提交將被簽名。

### `CRUD_ACTIONS`

此選項確定 Gitea 是否應該對 Web 編輯器或 API CRUD 操作的提交進行簽名。可能的取值有：

- `never`：從不簽名
- `pubkey`：僅在使用者擁有公鑰時進行簽名
- `twofa`：僅在使用者使用 2FA 登入時進行簽名
- `parentsigned`：僅在父提交已簽名時進行簽名。
- `always`：始終簽名

除了 `never` 和 `always` 之外的選項可以組合為逗號分隔的列表。如果所有選擇的選項都為 true，則更改將被簽名。

### `MERGES`

此選項確定 Gitea 是否應該對 PR 的合併提交進行簽名。可能的選項有：

- `never`：從不簽名
- `pubkey`：僅在使用者擁有公鑰時進行簽名
- `twofa`：僅在使用者使用 2FA 登入時進行簽名
- `basesigned`：僅在基礎儲存庫中的父提交已簽名時進行簽名。
- `headsigned`：僅在頭分支中的頭提交已簽名時進行簽名。
- `commitssigned`：僅在頭分支中的所有提交到合併點的提交都已簽名時進行簽名。
- `approved`：僅對已批准的合併到受保護分支的提交進行簽名。
- `always`：始終簽名

除了 `never` 和 `always` 之外的選項可以組合為逗號分隔的列表。如果所有選擇的選項都為 true，則合併將被簽名。

## 獲取簽名密鑰的公鑰

用於簽署 Gitea 提交的公鑰可以透過 API 獲取：

```sh
/api/v1/signing-key.gpg
```

在存在特定於儲存庫的密鑰的情況下，可以透過以下方式獲取：

```sh
/api/v1/repos/:username/:reponame/signing-key.gpg
```
