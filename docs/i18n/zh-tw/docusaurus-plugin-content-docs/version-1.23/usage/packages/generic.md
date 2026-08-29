---
date: "2021-07-20T00:00:00+00:00"
slug: "generic"
sidebar_position: 500
---

# 通用套件註冊表

為您的使用者或組織發布通用文件，如發布的二進制文件或其他輸出。

## 認證到套件註冊表

要認證到套件註冊表，您需要提供[自訂 HTTP 標頭或使用 HTTP 基本認證](development/api-usage.md#認證)。

## 發布套件

要發布通用套件，請執行 HTTP PUT 操作，請求體中包含套件內容。
您不能將同名文件兩次發布到套件中。您必須先刪除現有的套件版本。

```
PUT https://gitea.example.com/api/packages/{owner}/generic/{package_name}/{package_version}/{file_name}
```

| 參數              | 描述                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `owner`           | 套件的擁有者。                                                                                                                  |
| `package_name`    | 套件名稱。它只能包含小寫字母（`a-z`）、大寫字母（`A-Z`）、數字（`0-9`）、點（`.`）、連字符（`-`）、加號（`+`）或下劃線（`_`）。 |
| `package_version` | 套件版本，一個沒有尾隨或前導空格的非空字符串。                                                                                  |
| `file_name`       | 文件名。它只能包含小寫字母（`a-z`）、大寫字母（`A-Z`）、數字（`0-9`）、點（`.`）、連字符（`-`）、加號（`+`）或下劃線（`_`）。   |

使用 HTTP 基本身份驗證的範例請求：

```shell
curl --user your_username:your_password_or_token \
     --upload-file path/to/file.bin \
     https://gitea.example.com/api/packages/testuser/generic/test_package/1.0.0/file.bin
```

如果您使用 2FA 或 OAuth，請使用 [個人存取權杖](development/api-usage.md#認證) 代替密碼。

伺服器響應以下 HTTP 狀態碼。

| HTTP 狀態碼       | 含義                               |
| ----------------- | ---------------------------------- |
| `201 Created`     | 套件已發布。                       |
| `400 Bad Request` | 套件名稱和/或版本和/或文件名無效。 |
| `409 Conflict`    | 套件中已存在同名文件。             |

## 下載套件

要下載通用套件，請執行 HTTP GET 操作。

```
GET https://gitea.example.com/api/packages/{owner}/generic/{package_name}/{package_version}/{file_name}
```

| 參數              | 描述           |
| ----------------- | -------------- |
| `owner`           | 套件的擁有者。 |
| `package_name`    | 套件名稱。     |
| `package_version` | 套件版本。     |
| `file_name`       | 文件名。       |

文件內容在響應體中提供。響應內容類型為 `application/octet-stream`。

使用 HTTP 基本身份驗證的範例請求：

```shell
curl --user your_username:your_token_or_password \
     https://gitea.example.com/api/packages/testuser/generic/test_package/1.0.0/file.bin
```

伺服器響應以下 HTTP 狀態碼。

| HTTP 狀態碼     | 含義               |
| --------------- | ------------------ |
| `200 OK`        | 成功               |
| `404 Not Found` | 未找到套件或文件。 |

## 刪除套件

要刪除通用套件，請執行 HTTP DELETE 操作。這將刪除此版本的所有文件。

```
DELETE https://gitea.example.com/api/packages/{owner}/generic/{package_name}/{package_version}
```

| 參數              | 描述           |
| ----------------- | -------------- |
| `owner`           | 套件的擁有者。 |
| `package_name`    | 套件名稱。     |
| `package_version` | 套件版本。     |

使用 HTTP 基本身份驗證的範例請求：

```shell
curl --user your_username:your_token_or_password -X DELETE \
     https://gitea.example.com/api/packages/testuser/generic/test_package/1.0.0
```

伺服器響應以下 HTTP 狀態碼。

| HTTP 狀態碼      | 含義         |
| ---------------- | ------------ |
| `204 No Content` | 成功         |
| `404 Not Found`  | 未找到套件。 |

## 刪除套件文件

要刪除通用套件的文件，請執行 HTTP DELETE 操作。如果沒有文件剩餘，這也會刪除套件版本。

```
DELETE https://gitea.example.com/api/packages/{owner}/generic/{package_name}/{package_version}/{filename}
```

| 參數              | 描述           |
| ----------------- | -------------- |
| `owner`           | 套件的擁有者。 |
| `package_name`    | 套件名稱。     |
| `package_version` | 套件版本。     |
| `filename`        | 文件名。       |

使用 HTTP 基本身份驗證的範例請求：

```shell
curl --user your_username:your_token_or_password -X DELETE \
     https://gitea.example.com/api/packages/testuser/generic/test_package/1.0.0/file.bin
```

伺服器響應以下 HTTP 狀態碼。

| HTTP 狀態碼      | 含義               |
| ---------------- | ------------------ |
| `204 No Content` | 成功               |
| `404 Not Found`  | 未找到套件或文件。 |
