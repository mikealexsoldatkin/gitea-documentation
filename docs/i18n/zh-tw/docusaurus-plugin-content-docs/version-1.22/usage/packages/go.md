---
date: "2023-05-10T00:00:00+00:00"

slug: "go"
sidebar_position: 45

---

# Go 套件註冊表

為您的使用者或組織發佈 Go 套件。

## 發佈套件

要發佈 Go 套件，請執行 HTTP `PUT` 操作，並將套件內容放入請求主體中。
如果已經存在相同名稱和版本的套件，您無法發佈套件。您必須首先刪除現有的套件。
該套件必須遵循[文件中的結構](https://go.dev/ref/mod#zip-files)。

```
PUT https://gitea.example.com/api/packages/{owner}/go/upload
```

| 參數    | 描述           |
| ------- | -------------- |
| `owner` | 套件的所有者 |

要身份驗證到套件註冊表，您需要提供[自訂 HTTP 頭或使用 HTTP 基本身份驗證](development/api-usage.md#透過-api-認證)：

```shell
curl --user your_username:your_password_or_token \
     --upload-file path/to/file.zip \
     https://gitea.example.com/api/packages/testuser/go/upload
```

如果您使用的是 2FA 或 OAuth，請使用[個人存取權杖](development/api-usage.md#透過-api-認證)替代密碼進行身份驗證。

伺服器將使用以下 HTTP 狀態程式碼進行響應。

| HTTP 狀態碼       | 含義                       |
| ----------------- | -------------------------- |
| `201 Created`     | 套件已發佈               |
| `400 Bad Request` | 套件無效                 |
| `409 Conflict`    | 具有相同名稱的套件已存在 |

## 安裝套件

要安裝Go套件，請指示Go使用套件註冊表作為代理：

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
| `owner`           | 套件的所有者 |
| `package_name`    | 套件名稱     |
| `package_version` | 套件版本     |

如果套件的所有者是私有的，則需要[提供憑據](https://go.dev/ref/mod#private-module-proxy-auth)。

有關 `GOPROXY` 環境變量的更多資訊以及如何防止資料泄漏的資訊，請[參閱文件](https://go.dev/ref/mod#private-modules)。
