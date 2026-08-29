---
date: "2023-01-01T00:00:00+00:00"
slug: "cran"
sidebar_position: 35
---

# CRAN 套件註冊表

將 [R](https://www.r-project.org/) 套件發佈到您的使用者或組織的類似 [CRAN](https://cran.r-project.org/) 的註冊表。

## 要求

要使用CRAN套件註冊表，您需要安裝 [R](https://cran.r-project.org/)。

## 設定套件註冊表

要註冊套件註冊表，您需要將其添加到 `Rprofile.site` 文件中，可以是系統級別、使用者級別 `~/.Rprofile` 或專案級別：

```
options("repos" = c(getOption("repos"), c(gitea="https://gitea.example.com/api/packages/{owner}/cran")))
```

| 參數    | 描述           |
| ------- | -------------- |
| `owner` | 套件的所有者 |

如果需要提供憑據，可以將它們嵌入到URL(`https://user:password@gitea.example.com/...`)中。

## 發佈套件

要發佈 R 套件，請執行帶有套件內容的 HTTP `PUT` 操作。

源程式碼套件：

```
PUT https://gitea.example.com/api/packages/{owner}/cran/src
```

| 參數    | 描述           |
| ------- | -------------- |
| `owner` | 套件的所有者 |

二進制套件：

```
PUT https://gitea.example.com/api/packages/{owner}/cran/bin?platform={platform}&rversion={rversion}
```

| 參數       | 描述           |
| ---------- | -------------- |
| `owner`    | 套件的所有者 |
| `platform` | 平台的名稱     |
| `rversion` | 二進制的R版本  |

例如：

```shell
curl --user your_username:your_password_or_token \
     --upload-file path/to/package.zip \
     https://gitea.example.com/api/packages/testuser/cran/bin?platform=windows&rversion=4.2
```

如果同名和版本的套件已存在，則無法發佈套件。您必須首先刪除現有的套件。

## 安裝套件

要從套件註冊表中安裝R套件，請執行以下命令：

```shell
install.packages("{package_name}")
```

| 參數           | 描述              |
| -------------- | ----------------- |
| `package_name` | The package name. |

例如：

```shell
install.packages("testpackage")
```
