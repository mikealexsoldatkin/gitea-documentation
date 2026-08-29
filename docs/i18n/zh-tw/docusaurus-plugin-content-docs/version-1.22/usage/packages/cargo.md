---
date: "2022-11-20T00:00:00+00:00"

slug: "cargo"
sidebar_position: 5

---

# Cargo 套件註冊表

為您的使用者或組織發佈 [Cargo](https://doc.rust-lang.org/stable/cargo/) 套件。

## 要求

若要使用 Cargo 套件註冊表, 您需要安裝 [Rust 和 Cargo](https://www.rust-lang.org/tools/install).

Cargo 將可用套件的資訊儲存在一個儲存在 git 儲存庫中的套件索引中。
這個儲存庫是與註冊表交互所必需的。
下面的部分將介紹如何建立它。

## 索引儲存庫

Cargo 將可用套件的資訊儲存在一個儲存在 git 儲存庫中的套件索引中。
在 Gitea 中，這個儲存庫有一個特殊的名稱叫做 `_cargo-index`。
在上傳套件之後，它的元資料會自動寫入索引中。
不應手動修改這個註冊表的內容。

使用者或組織套件設定頁面允許建立這個索引儲存庫以及設定文件。
如果需要，此操作將重寫設定文件。
例如，如果 Gitea 實例的域名已更改，這將非常有用。

如果儲存在 Gitea 中的套件與索引註冊表中的資訊不同步，設定頁面允許重建這個索引註冊表。
這個操作將遍歷註冊表中的所有套件，並將它們的資訊寫入索引中。
如果有很多套件，這個過程可能需要一些時間。

## 設定套件註冊表

要註冊這個套件註冊表，必須更新 Cargo 的設定。
將以下文本添加到位於當前使用者主目錄中的設定文件中（例如 `~/.cargo/config.toml`）：

```
[registry]
default = "gitea"

[registries.gitea]
index = "sparse+https://gitea.example.com/api/packages/{owner}/cargo/" # Sparse index
# index = "https://gitea.example.com/{owner}/_cargo-index.git" # Git

[net]
git-fetch-with-cli = true
```

| 參數    | 描述             |
| ------- | ---------------- |
| `owner` | 套件的所有者。 |

如果這個註冊表是私有的或者您想要發佈新的套件，您必須設定您的憑據。
將憑據部分添加到位於當前使用者主目錄中的憑據文件中（例如 `~/.cargo/credentials.toml`）：

```
[registries.gitea]
token = "Bearer {token}"
```

| 參數    | 描述                                                                                  |
| ------- | ------------------------------------------------------------------------------------- |
| `token` | 您的[個人存取權杖](development/api-usage.md#透過-api-認證) |

## 發佈套件

在專案中運行以下命令來發布套件：

```shell
cargo publish
```

如果已經存在同名和版本的套件，您將無法發佈新的套件。您必須先刪除現有的套件。

## 安裝套件

要從套件註冊表安裝套件，請執行以下命令：

```shell
cargo add {package_name}
```

| 參數           | 描述         |
| -------------- | ------------ |
| `package_name` | 套件名稱。 |

## 支援的命令

```
cargo publish
cargo add
cargo install
cargo yank
cargo unyank
cargo search
```
