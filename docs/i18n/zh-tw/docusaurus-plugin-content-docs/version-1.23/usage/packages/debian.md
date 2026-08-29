---
date: "2023-01-07T00:00:00+00:00"
slug: "debian"
sidebar_position: 40
---

# Debian 套件註冊表

為您的使用者或組織發布 [Debian](https://www.debian.org/distrib/packages) 套件。

## 需求

要使用 Debian 註冊表，您需要使用像 `curl` 這樣的 HTTP 客戶端來上傳，並使用像 `apt` 這樣的套件管理器來消費套件。

以下範例使用 `apt`。

## 設定套件註冊表

要註冊 Debian 註冊表，請將 URL 添加到已知的 apt 來源列表中：

```shell
echo "deb [signed-by=/etc/apt/keyrings/gitea-{owner}.asc] https://gitea.example.com/api/packages/{owner}/debian {distribution} {component}" | sudo tee -a /etc/apt/sources.list.d/gitea.list
```

| 佔位符         | 描述             |
| -------------- | ---------------- |
| `owner`        | 套件的擁有者。   |
| `distribution` | 要使用的發行版。 |
| `component`    | 要使用的元件。   |

如果註冊表是私有的，請在 URL 中提供憑證。您可以使用密碼或 [個人存取權杖](development/api-usage.md#認證)：

```shell
echo "deb [signed-by=/etc/apt/keyrings/gitea-{owner}.asc] https://{username}:{your_password_or_token}@gitea.example.com/api/packages/{owner}/debian {distribution} {component}" | sudo tee -a /etc/apt/sources.list.d/gitea.list
```

Debian 註冊表文件使用 PGP 密鑰簽名，該密鑰必須為 apt 所知：

```shell
sudo curl https://gitea.example.com/api/packages/{owner}/debian/repository.key -o /etc/apt/keyrings/gitea-{owner}.asc
```

之後更新本地套件索引：

```shell
apt update
```

## 發布套件

要發布 Debian 套件（`*.deb`），請執行 HTTP `PUT` 操作，請求體中包含套件內容。

```
PUT https://gitea.example.com/api/packages/{owner}/debian/pool/{distribution}/{component}/upload
```

| 參數           | 描述                                                 |
| -------------- | ---------------------------------------------------- |
| `owner`        | 套件的擁有者。                                       |
| `distribution` | 發行版可能與操作系統的發行名稱匹配，例如：`bionic`。 |
| `component`    | 元件可以用來分組套件或只是 `main` 或類似的。         |

使用 HTTP 基本身份驗證的範例請求：

```shell
curl --user your_username:your_password_or_token \
     --upload-file path/to/file.deb \
     https://gitea.example.com/api/packages/testuser/debian/pool/bionic/main/upload
```

如果您使用 2FA 或 OAuth，請使用 [個人存取權杖](development/api-usage.md#認證) 代替密碼。

如果已經存在同名、同版本、同發行版、同元件和同架構的套件，您不能發布該套件。您必須先刪除現有的套件。

伺服器響應以下 HTTP 狀態碼。

| HTTP 狀態碼       | 含義                               |
| ----------------- | ---------------------------------- |
| `201 Created`     | 套件已發布。                       |
| `400 Bad Request` | 套件無效。                         |
| `409 Conflict`    | 已存在具有相同參數組合的套件文件。 |

## 刪除套件

要刪除 Debian 套件，請執行 HTTP `DELETE` 操作。如果沒有文件剩餘，這也會刪除套件版本。

```
DELETE https://gitea.example.com/api/packages/{owner}/debian/pool/{distribution}/{component}/{package_name}/{package_version}/{architecture}
```

| 參數              | 描述           |
| ----------------- | -------------- |
| `owner`           | 套件的擁有者。 |
| `package_name`    | 套件名稱。     |
| `package_version` | 套件版本。     |
| `distribution`    | 套件發行版。   |
| `component`       | 套件元件。     |
| `architecture`    | 套件架構。     |

使用 HTTP 基本身份驗證的範例請求：

```shell
curl --user your_username:your_token_or_password -X DELETE \
     https://gitea.example.com/api/packages/testuser/debian/pool/bionic/main/test-package/1.0.0/amd64
```

伺服器響應以下 HTTP 狀態碼。

| HTTP 狀態碼      | 含義               |
| ---------------- | ------------------ |
| `204 No Content` | 成功               |
| `404 Not Found`  | 未找到套件或文件。 |

## 安裝套件

要從 Debian 註冊表安裝套件，請執行以下命令：

```shell
# 使用最新版本
apt install {package_name}
# 使用特定版本
apt install {package_name}={package_version}
```
