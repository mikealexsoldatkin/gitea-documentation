---
date: "2019-08-17T10:20:00+01:00"
slug: "signing"
sidebar_position: 50
aliases:
  - /zh-tw/signing
---

# GPG 提交簽名

Gitea 會通過檢查提交是否由 Gitea 資料庫中的密鑰簽名，或提交是否符合 Git 的預設密鑰來驗證 GPG 提交簽名。

密鑰不會被檢查是否已過期或被撤銷，也不會與密鑰伺服器進行檢查。

如果找不到密鑰來驗證提交，提交將被標記為灰色未鎖定圖標。如果提交被標記為紅色未鎖定圖標，則表示該提交是由具有 ID 的密鑰簽名的。

:::note
提交的簽名者不必是提交的作者或提交者。
:::

## 自動簽名

Gitea 會在以下幾個地方自動生成提交：

- 儲存庫初始化
- Wiki 更改
- 使用編輯器或 API 進行的 CRUD 操作
- 從拉取請求合併

根據設定和伺服器信任，您可能希望 Gitea 簽署這些提交。

## 為 Gitea 安裝和生成 GPG 密鑰

伺服器管理員需要決定如何最好地安裝簽名密鑰。目前，Gitea 使用伺服器的 `git` 命令生成所有提交，因此將使用伺服器的 `gpg` 進行簽名（如果已設定）。管理員應該審查 GPG 的最佳實踐，特別是建議僅安裝簽名的祕密子密鑰，而不安裝主簽名和認證的祕密密鑰。

## 一般設定

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

首先要討論的是 `SIGNING_KEY`。有三個主要選項：

- `none` - 這會阻止 Gitea 簽署任何提交
- `default` - Gitea 將預設使用 `git config` 中設定的密鑰
- `KEYID` - Gitea 將使用 ID 為 `KEYID` 的 gpg 密鑰簽署提交。在這種情況下，您應該提供 `SIGNING_NAME` 和 `SIGNING_EMAIL` 以顯示此密鑰。

`default` 選項將查詢 `git config` 的 `commit.gpgsign` 選項 - 如果設定了此選項，則將根據需要使用 `user.signingkey`、`user.name` 和 `user.email` 的結果。

通過調整 Gitea 儲存庫中的 Git `config` 文件，可以使用 `SIGNING_KEY=default` 為每個儲存庫提供不同的簽名密鑰。然而，這顯然不是理想的 UI，因此可能會有所變化。

:::warning
**自 1.17 起**，Gitea 在其自己的主目錄 `[git].HOME_PATH`（預設為 `%(APP_DATA_PATH)/home`）中運行 git，並使用其自己的設定 `{[git].HOME_PATH}/.gitconfig`。

如果您為 Gitea 設定了自訂的 git 設定，應該在系統 git 設定（即 `/etc/gitconfig`）或 Gitea 內部 git 設定 `{[git].HOME_PATH}/.gitconfig` 中設定這些設定。

git 命令相關的主目錄文件（如 `.gnupg`）也應放在 Gitea 的 git 主目錄 `[git].HOME_PATH` 中。

如果您希望將 `.gnupg` 目錄保留在 `{[git].HOME_PATH}/` 之外，請考慮將 `$GNUPGHOME` 環境變量設定為您首選的位置，否則 Gitea 只會使用 `{[git].HOME_PATH}/.gnupg` 下的 gpg 密鑰。
:::

### `INITIAL_COMMIT`

此選項決定 Gitea 在建立儲存庫時是否應該簽署初始提交。可能的值是：

- `never`: 從不簽署
- `pubkey`: 僅在使用者擁有公鑰時簽署
- `twofa`: 僅在使用者使用雙因素身份驗證登入時簽署
- `always`: 始終簽署

除了 `never` 和 `always` 之外的選項可以作為逗號分隔的列表進行組合。提交將在所有選定選項都為真時簽署。

### `WIKI`

此選項決定 Gitea 是否應該簽署 Wiki 的提交。可能的值是：

- `never`: 從不簽署
- `pubkey`: 僅在使用者擁有公鑰時簽署
- `twofa`: 僅在使用者使用雙因素身份驗證登入時簽署
- `parentsigned`: 僅在父提交已簽署時簽署。
- `always`: 始終簽署

除了 `never` 和 `always` 之外的選項可以作為逗號分隔的列表進行組合。提交將在所有選定選項都為真時簽署。

### `CRUD_ACTIONS`

此選項決定 Gitea 是否應該簽署來自網頁編輯器或 API CRUD 操作的提交。可能的值是：

- `never`: 從不簽署
- `pubkey`: 僅在使用者擁有公鑰時簽署
- `twofa`: 僅在使用者使用雙因素身份驗證登入時簽署
- `parentsigned`: 僅在父提交已簽署時簽署。
- `always`: 始終簽署

除了 `never` 和 `always` 之外的選項可以作為逗號分隔的列表進行組合。更改將在所有選定選項都為真時簽署。

### `MERGES`

此選項決定 Gitea 是否應該簽署來自 PR 的合併提交。可能的選項是：

- `never`: 從不簽署
- `pubkey`: 僅在使用者擁有公鑰時簽署
- `twofa`: 僅在使用者使用雙因素身份驗證登入時簽署
- `basesigned`: 僅在基礎儲存庫中的父提交已簽署時簽署。
- `headsigned`: 僅在頭分支中的頭提交已簽署時簽署。
- `commitssigned`: 僅在頭分支中到合併點的所有提交都已簽署時簽署。
- `approved`: 僅簽署已批准的合併到受保護分支。
- `always`: 始終簽署

除了 `never` 和 `always` 之外的選項可以作為逗號分隔的列表進行組合。合併將在所有選定選項都為真時簽署。

## 獲取簽名密鑰的公鑰

用於簽署 Gitea 提交的公鑰可以從 API 獲取：

```sh
/api/v1/signing-key.gpg
```

在有儲存庫特定密鑰的情況下，可以從以下位置獲取：

```sh
/api/v1/repos/:username/:reponame/signing-key.gpg
```
