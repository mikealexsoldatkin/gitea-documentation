---
date: "2021-07-20T00:00:00+00:00"
slug: "generic"
sidebar_position: 500
---

# 通用套件註冊表

發佈通用文件，如發佈二進制文件或其他輸出，供您的使用者或組織使用。

## 身份驗證套件註冊表

要身份驗證套件註冊表，您需要提供[自訂 HTTP 頭或使用 HTTP 基本身份驗證](development/api-usage.md#透過-api-認證)。

## 發佈套件

要發佈通用套件，請執行 HTTP `PUT` 操作，並將套件內容放入請求主體中。
您無法向套件中多次發佈具有相同名稱的文件。您必須首先刪除現有的套件版本。

```
PUT https://gitea.example.com/api/packages/{owner}/generic/{package_name}/{package_version}/{file_name}
```

| 參數              | 描述                                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `owner`           | 套件的所有者。                                                                                                            |
| `package_name`    | 套件名稱。它只能包含小寫字母 (`a-z`)、大寫字母 (`A-Z`)、數字 (`0-9`)、點號 (`.`)、連字符 (`-`)、加號 (`+`) 或下劃線 (`_`) |
| `package_version` | 套件版本，一個非空字符串，不包含前導或尾隨空格                                                                            |
| `file_name`       | 文件名。它只能包含小寫字母 (`a-z`)、大寫字母 (`A-Z`)、數字 (`0-9`)、點號 (`.`)、連字符 (`-`)、加號 (`+`) 或下劃線 (`_`)     |

使用 HTTP 基本身份驗證的範例請求：

```shell
curl --user your_username:your_password_or_token \
     --upload-file path/to/file.bin \
     https://gitea.example.com/api/packages/testuser/generic/test_package/1.0.0/file.bin
```

如果您使用 2FA 或 OAuth，請使用[個人存取權杖](development/api-usage.md#透過-api-認證)替代密碼。

伺服器將使用以下 HTTP 狀態程式碼進行響應。

| HTTP 狀態碼       | 意義                               |
| ----------------- | ---------------------------------- |
| `201 Created`     | 套件已發佈                       |
| `400 Bad Request` | 套件名稱和/或版本和/或文件名無效 |
| `409 Conflict`    | 具有相同名稱的文件已存在於套件中 |

## 下載套件

要下載通用套件，請執行 HTTP `GET` 操作。

```
GET https://gitea.example.com/api/packages/{owner}/generic/{package_name}/{package_version}/{file_name}
```

| 參數              | 描述           |
| ----------------- | -------------- |
| `owner`           | 套件的所有者 |
| `package_name`    | 套件名稱     |
| `package_version` | 套件版本     |
| `file_name`       | 文件名         |

文件內容將在響應主體中返回。響應的內容類型為 `application/octet-stream`。

伺服器將使用以下 HTTP 狀態程式碼進行響應。

```shell
curl --user your_username:your_token_or_password \
     https://gitea.example.com/api/packages/testuser/generic/test_package/1.0.0/file.bin
```

伺服器會以以下 HTTP 狀態碼進行響應：

| HTTP 狀態碼     | 含義                 |
| --------------- | -------------------- |
| `200 OK`        | 成功                 |
| `404 Not Found` | 找不到套件或者文件 |

## 刪除套件

要刪除通用套件，請執行 HTTP DELETE 操作。這將同時刪除該版本的所有文件。

```
DELETE https://gitea.example.com/api/packages/{owner}/generic/{package_name}/{package_version}
```

| 參數              | 描述           |
| ----------------- | -------------- |
| `owner`           | 套件的所有者 |
| `package_name`    | 套件名稱     |
| `package_version` | 套件版本     |

伺服器將使用以下 HTTP 狀態程式碼進行響應。

```shell
curl --user your_username:your_token_or_password -X DELETE \
     https://gitea.example.com/api/packages/testuser/generic/test_package/1.0.0
```

The server responds with the following HTTP Status codes.

| HTTP 狀態碼      | 意義         |
| ---------------- | ------------ |
| `204 No Content` | 成功         |
| `404 Not Found`  | 找不到套件 |

## 刪除套件文件

要刪除通用套件的文件，請執行 HTTP `DELETE` 操作。如果沒有文件留下，這將同時刪除套件版本。

```
DELETE https://gitea.example.com/api/packages/{owner}/generic/{package_name}/{package_version}/{filename}
```

| 參數              | 描述           |
| ----------------- | -------------- |
| `owner`           | 套件的所有者 |
| `package_name`    | 套件名稱     |
| `package_version` | 套件版本     |
| `filename`        | 文件名         |

使用 HTTP 基本身份驗證的範例請求：

```shell
curl --user your_username:your_token_or_password -X DELETE \
     https://gitea.example.com/api/packages/testuser/generic/test_package/1.0.0/file.bin
```

伺服器將使用以下 HTTP 狀態程式碼進行響應：

| HTTP 狀態碼      | 含義               |
| ---------------- | ------------------ |
| `204 No Content` | 成功               |
| `404 Not Found`  | 找不到套件或文件 |
