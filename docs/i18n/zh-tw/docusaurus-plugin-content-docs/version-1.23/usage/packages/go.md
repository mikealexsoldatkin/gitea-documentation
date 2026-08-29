---
date: "2023-05-10T00:00:00+00:00"
slug: "go"
sidebar_position: 45
---

# Go 套件註冊表

為您的使用者或組織發布 Go 套件。

## 發布套件

要發布 Go 套件，請執行 HTTP `PUT` 操作，請求體中包含套件內容。
如果已經存在同名同版本的套件，您不能發布該套件。您必須先刪除現有的套件。
套件必須遵循[文件結構](https://go.dev/ref/mod#zip-files)。

```
PUT https://gitea.example.com/api/packages/{owner}/go/upload
```

| 參數    | 描述           |
| ------- | -------------- |
| `owner` | 套件的擁有者。 |

要認證到套件註冊表，您需要提供[自訂 HTTP 標頭或使用 HTTP 基本認證](development/api-usage.md#認證)：

```shell
curl --user your_username:your_password_or_token \
     --upload-file path/to/file.zip \
     https://gitea.example.com/api/packages/testuser/go/upload
```

如果您使用 2FA 或 OAuth，請使用 [個人存取權杖](development/api-usage.md#認證) 代替密碼。

如果已經存在同名同版本的套件，您不能發布該套件。您必須先刪除現有的套件。

伺服器響應以下 HTTP 狀態碼。

| HTTP 狀態碼       | 含義                       |
| ----------------- | -------------------------- |
| `201 Created`     | 套件已發布。               |
| `400 Bad Request` | 套件無效。                 |
| `409 Conflict`    | 已存在具有相同名稱的套件。 |

## 安裝套件

要安裝 Go 套件，請指示 Go 使用套件註冊表作為代理：

```shell
# 使用最新版本
GOPROXY=https://gitea.example.com/api/packages/{owner}/go go install {package_name}
# 或者
GOPROXY=https://gitea.example.com/api/packages/{owner}/go go install {package_name}@latest
# 使用特定版本
GOPROXY=https://gitea.example.com/api/packages/{owner}/go go install {package_name}@{package_version}
```

| 參數              | 描述           |
| ----------------- | -------------- |
| `owner`           | 套件的擁有者。 |
| `package_name`    | 套件名稱。     |
| `package_version` | 套件版本。     |

如果套件的擁有者是私有的，您需要[提供憑證](https://go.dev/ref/mod#private-module-proxy-auth)。

有關 `GOPROXY` 環境變量以及如何防止資料洩漏的更多資訊，請參閱[文件](https://go.dev/ref/mod#private-modules)。
