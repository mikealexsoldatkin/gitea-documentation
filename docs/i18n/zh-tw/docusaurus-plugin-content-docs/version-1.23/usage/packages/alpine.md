---
date: "2023-03-25T00:00:00+00:00"
slug: "alpine"
sidebar_position: 4
---

# Alpine 套件註冊表

為您的使用者或組織發布 [Alpine](https://pkgs.alpinelinux.org/) 套件。

## 需求

要使用 Alpine 註冊表，您需要使用像 `curl` 這樣的 HTTP 客戶端來上傳，並使用像 `apk` 這樣的套件管理器來消費套件。

以下範例使用 `apk`。

## 設定套件註冊表

要註冊 Alpine 註冊表，請將 URL 添加到已知的 apk 來源列表中（`/etc/apk/repositories`）：

```
https://gitea.example.com/api/packages/{owner}/alpine/<branch>/<repository>
```

| 佔位符       | 描述           |
| ------------ | -------------- |
| `owner`      | 套件的擁有者。 |
| `branch`     | 要使用的分支。 |
| `repository` | 要使用的儲存庫。 |

如果註冊表是私有的，請在 URL 中提供憑證。您可以使用密碼或 [個人存取權杖](development/api-usage.md#認證)：

```
https://{username}:{your_password_or_token}@gitea.example.com/api/packages/{owner}/alpine/<branch>/<repository>
```

Alpine 註冊表文件使用 RSA 密鑰簽名，該密鑰必須為 apk 所知。下載公鑰並將其儲存在 `/etc/apk/keys/` 中：

```shell
curl -JO https://gitea.example.com/api/packages/{owner}/alpine/key
```

之後更新本地套件索引：

```shell
apk update
```

## 發布套件

要發布 Alpine 套件（`*.apk`），請執行 HTTP `PUT` 操作，請求體中包含套件內容。

```
PUT https://gitea.example.com/api/packages/{owner}/alpine/{branch}/{repository}
```

| 參數         | 描述                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------- |
| `owner`      | 套件的擁有者。                                                                                    |
| `branch`     | 分支可能與操作系統的發行版本匹配，例如：`v3.17`。                                                 |
| `repository` | 儲存庫可以用來[分組套件](https://wiki.alpinelinux.org/wiki/Repositories) 或者只是 `main` 或類似的。 |

使用 HTTP 基本身份驗證的範例請求：

```shell
curl --user your_username:your_password_or_token \
     --upload-file path/to/file.apk \
     https://gitea.example.com/api/packages/testuser/alpine/v3.17/main
```

如果您使用 2FA 或 OAuth，請使用 [個人存取權杖](development/api-usage.md#認證) 代替密碼。

您不能將同名文件兩次發布到套件中。您必須先刪除現有的套件文件。

伺服器響應以下 HTTP 狀態碼。

| HTTP 狀態碼       | 含義                                     |
| ----------------- | ---------------------------------------- |
| `201 Created`     | 套件已發布。                             |
| `400 Bad Request` | 套件名稱、版本、分支、儲存庫或架構無效。   |
| `409 Conflict`    | 套件中已存在具有相同參數組合的套件文件。 |

## 刪除套件

要刪除 Alpine 套件，請執行 HTTP `DELETE` 操作。如果沒有文件剩餘，這也會刪除套件版本。

```
DELETE https://gitea.example.com/api/packages/{owner}/alpine/{branch}/{repository}/{architecture}/{filename}
```

| 參數           | 描述           |
| -------------- | -------------- |
| `owner`        | 套件的擁有者。 |
| `branch`       | 要使用的分支。 |
| `repository`   | 要使用的儲存庫。 |
| `architecture` | 套件架構。     |
| `filename`     | 要刪除的文件。 |

使用 HTTP 基本身份驗證的範例請求：

```shell
curl --user your_username:your_token_or_password -X DELETE \
     https://gitea.example.com/api/packages/testuser/alpine/v3.17/main/test-package-1.0.0.apk
```

伺服器響應以下 HTTP 狀態碼。

| HTTP 狀態碼      | 含義               |
| ---------------- | ------------------ |
| `204 No Content` | 成功               |
| `404 Not Found`  | 未找到套件或文件。 |

## 安裝套件

要從 Alpine 註冊表安裝套件，請執行以下命令：

```shell
# 使用最新版本
apk add {package_name}
# 使用特定版本
apk add {package_name}={package_version}
```
