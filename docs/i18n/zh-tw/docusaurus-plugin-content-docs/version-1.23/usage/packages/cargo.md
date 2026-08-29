---
date: "2022-11-20T00:00:00+00:00"
slug: "cargo"
sidebar_position: 5
---

# Cargo 套件註冊表

為您的使用者或組織發布 [Cargo](https://doc.rust-lang.org/stable/cargo/) 套件。

## 需求

要使用 Cargo 套件註冊表，您需要 [Rust 和 Cargo](https://www.rust-lang.org/tools/install)。

Cargo 將可用套件的資訊儲存在一個 git 儲存庫中的套件索引中。
此儲存庫是使用註冊表所必需的。
以下部分描述瞭如何建立它。

## 索引儲存庫

Cargo 將可用套件的資訊儲存在一個 git 儲存庫中的套件索引中。
在 Gitea 中，此儲存庫具有特殊名稱 `_cargo-index`。
上傳套件後，其元資料會自動寫入索引。
此儲存庫的內容不應手動修改。

使用者或組織的套件設定頁面允許建立索引儲存庫以及設定文件。
如果需要，此操作將重寫設定文件。
這在例如 Gitea 實例域名更改時很有用。

如果出現 Gitea 中儲存的套件與索引儲存庫中的資訊不同步的情況，設定頁面允許重建索引儲存庫。
此操作會遍歷註冊表中的所有套件並將其資訊寫入索引。
如果有很多套件，這個過程可能需要一些時間。

## 設定套件註冊表

要註冊套件註冊表，必須更新 Cargo 設定。
將以下文本添加到當前使用者主目錄中的設定文件（例如 `~/.cargo/config.toml`）：

```
[registry]
default = "gitea"

[registries.gitea]
index = "sparse+https://gitea.example.com/api/packages/{owner}/cargo/" # Sparse index
# index = "https://gitea.example.com/{owner}/_cargo-index.git" # Git

# [net]
# git-fetch-with-cli = true
```

| 參數    | 描述           |
| ------- | -------------- |
| `owner` | 套件的擁有者。 |

如果註冊表是私有的或您想發布新套件，您必須設定您的憑證。
將憑證部分添加到當前使用者主目錄中的憑證文件（例如 `~/.cargo/credentials.toml`）：

```
[registries.gitea]
token = "Bearer {token}"
```

| 參數    | 描述                                                         |
| ------- | ------------------------------------------------------------ |
| `token` | 您的 [個人存取權杖](development/api-usage.md#認證) |

## Git vs Sparse

目前，cargo 支援兩種從註冊表中獲取 crate 的方式：Git 索引和 sparse 索引。
Sparse 索引是最新的方法，與 git 相比，在更新 crate 時提供了更好的性能。
自 Rust 1.68 起，sparse 是 crates.io 的預設方法。

## 發布套件

在您的專案中運行以下命令來發布套件：

```shell
cargo publish
```

如果已經存在同名同版本的套件，您不能發布該套件。您必須先刪除現有的套件。

## 安裝套件

要從套件註冊表中安裝套件，請執行以下命令：

```shell
cargo add {package_name}
```

| 參數           | 描述       |
| -------------- | ---------- |
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
