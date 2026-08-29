---
date: "2021-07-20T00:00:00+00:00"
slug: "composer"
sidebar_position: 15
---

# Composer 套件註冊表

為您的使用者或組織發布 [Composer](https://getcomposer.org/) 套件。

## 需求

要使用 Composer 套件註冊表，您可以使用 [Composer](https://getcomposer.org/download/) 來消費套件，並使用像 `curl` 這樣的 HTTP 上傳客戶端來發布套件。

## 發布套件

要發布 Composer 套件，請執行 HTTP PUT 操作，請求體中包含套件內容。
套件內容必須是包含 `composer.json` 文件的壓縮 PHP 專案。

如果已經存在同名同版本的套件，您不能發布該套件。您必須先刪除現有的套件。

```
PUT https://gitea.example.com/api/packages/{owner}/composer
```

| 參數    | 描述           |
| ------- | -------------- |
| `owner` | 套件的擁有者。 |

如果 `composer.json` 文件不包含 `version` 屬性，您必須將其作為查詢參數提供：

```
PUT https://gitea.example.com/api/packages/{owner}/composer?version={x.y.z}
```

使用 HTTP 基本身份驗證的範例請求：

```shell
curl --user your_username:your_password_or_token \
     --upload-file path/to/project.zip \
     https://gitea.example.com/api/packages/testuser/composer
```

或者將套件版本作為查詢參數指定：

```shell
curl --user your_username:your_password_or_token \
     --upload-file path/to/project.zip \
     https://gitea.example.com/api/packages/testuser/composer?version=1.0.3
```

如果您使用 2FA 或 OAuth，請使用 [個人存取權杖](development/api-usage.md#認證) 代替密碼。

伺服器響應以下 HTTP 狀態碼。

| HTTP 狀態碼       | 含義                               |
| ----------------- | ---------------------------------- |
| `201 Created`     | 套件已發布。                       |
| `400 Bad Request` | 套件無效。                         |
| `409 Conflict`    | 已存在具有相同參數組合的套件文件。 |

## 設定套件註冊表

要註冊套件註冊表，您需要將其添加到 Composer 的 `config.json` 文件中（通常可以在 `<user-home-dir>/.composer/config.json` 下找到）：

```json
{
  "repositories": [
    {
      "type": "composer",
      "url": "https://gitea.example.com/api/packages/{owner}/composer"
    }
  ]
}
```

要使用憑證訪問套件註冊表，您必須在 `auth.json` 文件中指定它們，如下所示：

```json
{
  "http-basic": {
    "gitea.example.com": {
      "username": "{username}",
      "password": "{password}"
    }
  }
}
```

| 參數       | 描述                            |
| ---------- | ------------------------------- |
| `owner`    | 套件的擁有者。                  |
| `username` | 您的 Gitea 使用者名稱。             |
| `password` | 您的 Gitea 密碼或個人存取權杖。 |

## 安裝套件

要從套件註冊表中安裝套件，請執行以下命令：

```shell
composer require {package_name}
```

您可以選擇指定套件版本：

```shell
composer require {package_name}:{package_version}
```

| 參數              | 描述       |
| ----------------- | ---------- |
| `package_name`    | 套件名稱。 |
| `package_version` | 套件版本。 |
