---
date: "2023-01-01T00:00:00+00:00"
slug: "cran"
sidebar_position: 35
---

# CRAN 套件註冊表

為您的使用者或組織發布 [R](https://www.r-project.org/) 套件到類似 [CRAN](https://cran.r-project.org/) 的註冊表。

## 需求

要使用 CRAN 套件註冊表，您需要安裝 [R](https://cran.r-project.org/)。

## 設定套件註冊表

要註冊套件註冊表，您需要將其添加到 `Rprofile.site`，可以是系統級別、使用者級別（`~/.Rprofile`）或專案級別：

```
options("repos" = c(getOption("repos"), c(gitea="https://gitea.example.com/api/packages/{owner}/cran")))
```

| 參數    | 描述           |
| ------- | -------------- |
| `owner` | 套件的擁有者。 |

如果您需要提供憑證，您可以將它們嵌入到 URL 中（`https://user:password@gitea.example.com/...`）。

## 發布套件

要發布 R 套件，請執行 HTTP `PUT` 操作，請求體中包含套件內容。

源套件：

```
PUT https://gitea.example.com/api/packages/{owner}/cran/src
```

| 參數    | 描述           |
| ------- | -------------- |
| `owner` | 套件的擁有者。 |

二進制套件：

```
PUT https://gitea.example.com/api/packages/{owner}/cran/bin?platform={platform}&rversion={rversion}
```

| 參數       | 描述              |
| ---------- | ----------------- |
| `owner`    | 套件的擁有者。    |
| `platform` | 平台名稱。        |
| `rversion` | 二進制的 R 版本。 |

例如：

```shell
curl --user your_username:your_password_or_token \
     --upload-file path/to/package.zip \
     https://gitea.example.com/api/packages/testuser/cran/bin?platform=windows&rversion=4.2
```

如果您使用 2FA 或 OAuth，請使用 [個人存取權杖](development/api-usage.md#認證) 代替密碼。

如果已經存在同名同版本的套件，您不能發布該套件。您必須先刪除現有的套件。

伺服器響應以下 HTTP 狀態碼。

| HTTP 狀態碼       | 含義                               |
| ----------------- | ---------------------------------- |
| `201 Created`     | 套件已發布。                       |
| `400 Bad Request` | 套件無效。                         |
| `409 Conflict`    | 已存在具有相同參數組合的套件文件。 |

## 安裝套件

要從套件註冊表中安裝 R 套件，請執行以下命令：

```shell
install.packages("{package_name}")
```

| 參數           | 描述       |
| -------------- | ---------- |
| `package_name` | 套件名稱。 |

例如：

```shell
install.packages("testpackage")
```
