---
date: "2023-03-08T00:00:00+00:00"
slug: "packages/rpm"
sidebar_position: 105
---

# RPM 套件註冊表

為您的使用者或組織發佈 [RPM](https://rpm.org/) 套件。

## 要求

要使用RPM註冊表，您需要使用像 `yum`, `dnf` 或 `zypper` 這樣的套件管理器來消費套件。

以下範例使用 `dnf`。

## 設定套件註冊表

要註冊RPM註冊表，請將 URL 添加到已知 `apt` 源列表中：

```shell
dnf config-manager --add-repo https://gitea.example.com/api/packages/{owner}/rpm/{group}.repo
```

| 佔位符  | 描述                                   |
| ------- |--------------------------------------|
| `owner` | 套件的所有者                           |
| `group` | 任何名稱,例如 `centos/7`、`el-7`、`fc38` |

如果註冊表是私有的，請在URL中提供憑據。您可以使用密碼或[個人存取權杖](development/api-usage.md#透過-api-認證)：

```shell
dnf config-manager --add-repo https://{username}:{your_password_or_token}@gitea.example.com/api/packages/{owner}/rpm/{group}.repo
```

您還必須將憑據添加到 `/etc/yum.repos.d` 中的 `rpm.repo` 文件中的URL中。

## 發佈套件

要發佈RPM套件（`*.rpm`），請執行帶有套件內容的 HTTP `PUT` 操作。

```
PUT https://gitea.example.com/api/packages/{owner}/rpm/{group}/upload
```

| 參數    | 描述           |
| ------- |--------------|
| `owner` | 套件的所有者      |
| `group` | 套件自訂分組名稱 |

使用HTTP基本身份驗證的範例請求：

```shell
curl --user your_username:your_password_or_token \
     --upload-file path/to/file.rpm \
     https://gitea.example.com/api/packages/testuser/rpm/centos/el7/version/upload
```

如果您使用 2FA 或 OAuth，請使用[個人存取權杖](development/api-usage.md#透過-api-認證)替代密碼。您無法將具有相同名稱的文件兩次發佈到套件中。您必須先刪除現有的套件版本。

伺服器將以以下HTTP狀態碼響應。

| HTTP 狀態碼       | 含義                                             |
| ----------------- | ------------------------------------------------ |
| `201 Created`     | 套件已發佈                                     |
| `400 Bad Request` | 套件無效                                       |
| `409 Conflict`    | 具有相同參數組合的套件文件已經存在於該套件中 |

## 刪除套件

要刪除 RPM 套件，請執行 HTTP `DELETE` 操作。如果沒有文件剩餘，這也將刪除套件版本。

```
DELETE https://gitea.example.com/api/packages/{owner}/rpm/{group}/package/{package_name}/{package_version}/{architecture}
```

| 參數              | 描述           |
| ----------------- | -------------- |
| `owner`           | 套件的所有者 |
| `group`         | 套件自訂分組 |
| `package_name`    | 套件名稱     |
| `package_version` | 套件版本     |
| `architecture`    | 套件架構     |

使用HTTP基本身份驗證的範例請求：

```shell
curl --user your_username:your_token_or_password -X DELETE \
     https://gitea.example.com/api/packages/testuser/rpm/centos/el7/package/test-package/1.0.0/x86_64
```

伺服器將以以下HTTP狀態碼響應：

| HTTP 狀態碼      | 含義               |
| ---------------- | ------------------ |
| `204 No Content` | 成功               |
| `404 Not Found`  | 未找到套件或文件 |

## 安裝套件

要從RPM註冊表安裝套件，請執行以下命令：

```shell
# use latest version
dnf install {package_name}
# use specific version
dnf install {package_name}-{package_version}.{architecture}
```
