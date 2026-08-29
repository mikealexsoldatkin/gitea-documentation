---
date: "2023-03-25T00:00:00+00:00"
slug: "alpine"
sidebar_position: 4
---

# Alpine 套件註冊表

在您的使用者或組織中發佈 [Alpine](https://pkgs.alpinelinux.org/) 套件。

## 要求

要使用 Alpine 註冊表，您需要使用像 curl 這樣的 HTTP 客戶端來上傳包，並使用像 apk 這樣的套件管理器來消費包。

以下範例使用 `apk`。

## 設定套件註冊表

要註冊 Alpine 註冊表，請將 URL 添加到已知的 apk 源列表中 (`/etc/apk/repositories`):

```
https://gitea.example.com/api/packages/{owner}/alpine/<branch>/<repository>
```

| 佔位符       | 描述           |
| ------------ | -------------- |
| `owner`      | 套件所有者   |
| `branch`     | 要使用的分支名 |
| `repository` | 要使用的儲存庫名 |

如果註冊表是私有的，請在 URL 中提供憑據。您可以使用密碼或[個人存取權杖](development/api-usage.md#透過-api-認證):

```
https://{username}:{your_password_or_token}@gitea.example.com/api/packages/{owner}/alpine/<branch>/<repository>
```

Alpine 註冊表文件使用 RSA 密鑰進行簽名，apk 必須知道該密鑰。下載公鑰並將其儲存在 `/etc/apk/keys/` 目錄中：

```shell
curl -JO https://gitea.example.com/api/packages/{owner}/alpine/key
```

之後，更新本地套件索引：

```shell
apk update
```

## 發佈套件

要發佈一個 Alpine 包（`*.apk`），請執行帶有包內容的 HTTP `PUT` 操作，將其放在請求體中。

```
PUT https://gitea.example.com/api/packages/{owner}/alpine/{branch}/{repository}
```

| 參數         | 描述                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------- |
| `owner`      | 包的所有者。                                                                                        |
| `branch`     | 分支可以與操作系統的發行版本匹配，例如：v3.17。                                                     |
| `repository` | 儲存庫可以用於[分組包](https://wiki.alpinelinux.org/wiki/Repositories) 或者只是 `main` 或類似的名稱。 |

使用 HTTP 基本身份驗證的範例請求：

```shell
curl --user your_username:your_password_or_token \
     --upload-file path/to/file.apk \
     https://gitea.example.com/api/packages/testuser/alpine/v3.17/main
```

如果您使用的是雙重身份驗證或 OAuth，請使用[個人存取權杖](development/api-usage.md#透過-api-認證)代替密碼。
您不能將具有相同名稱的文件兩次發佈到一個包中。您必須首先刪除現有的包文件。

伺服器將以以下的 HTTP 狀態碼響應：

| HTTP 狀態碼       | 含義                                       |
| ----------------- | ------------------------------------------ |
| `201 Created`     | 套件已發佈。                             |
| `400 Bad Request` | 套件的名稱、版本、分支、儲存庫或架構無效。 |
| `409 Conflict`    | 具有相同參數組合的包文件已存在於套件中。 |

## 刪除套件

要刪除 Alpine 包，執行 HTTP 的 DELETE 操作。如果沒有文件，這將同時刪除包版本。

```
DELETE https://gitea.example.com/api/packages/{owner}/alpine/{branch}/{repository}/{architecture}/{filename}
```

| 參數           | 描述           |
| -------------- | -------------- |
| `owner`        | 套件的所有者 |
| `branch`       | 要使用的分支名 |
| `repository`   | 要使用的儲存庫名 |
| `architecture` | 套件的架構   |
| `filename`     | 要刪除的文件名 |

使用 HTTP 基本身份驗證的範例請求：

```shell
curl --user your_username:your_token_or_password -X DELETE \
     https://gitea.example.com/api/packages/testuser/alpine/v3.17/main/test-package-1.0.0.apk
```

伺服器將以以下的 HTTP 狀態碼響應：

| HTTP 狀態碼      | 含義               |
| ---------------- | ------------------ |
| `204 No Content` | 成功               |
| `404 Not Found`  | 未找到套件或文件 |

## 安裝套件

要從 Alpine 註冊表安裝套件，請執行以下命令：

```shell
# use latest version
apk add {package_name}
# use specific version
apk add {package_name}={package_version}
```
