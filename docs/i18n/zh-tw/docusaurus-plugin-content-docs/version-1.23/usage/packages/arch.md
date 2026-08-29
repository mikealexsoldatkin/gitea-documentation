---
date: "2023-05-15T00:00:00+00:00"
slug: "arch"
sidebar_position: 5
---

# Arch 套件註冊表

為您的使用者或組織發布 [Arch](https://archlinux.org/packages/) 套件。該註冊表可以作為一個完全運行的 [Arch linux 鏡像](https://wiki.archlinux.org/title/mirrors)，直接連接到 `/etc/pacman.conf`。

## 需求

要使用 Arch 註冊表，您需要使用像 `curl` 這樣的 HTTP 客戶端來上傳，並使用像 `pacman` 這樣的套件管理器來消費套件。

以下範例使用 `pacman`。

## 設定套件註冊表

在您可以使用套件註冊表之前，您需要下載套件驗證密鑰並將註冊表添加到 pacman 設定中。

下載套件驗證密鑰。

```sh
wget https://gitea.example.com/api/packages/{owner}/arch/repository.key
```

顯示密鑰的 ID（帶有十六進制字符的長行）。

```sh
gpg --show-keys repository.key
```

將密鑰添加到 pacman 並簽署它（使用上一步中的密鑰 ID）。

```sh
pacman-key --add repository.key
pacman-key --lsign-key {key id}
```

現在將註冊表設定添加到 `/etc/pacman.conf`。

```conf
[{owner}.gitea.example.com]
SigLevel = Required
Server = https://gitea.example.com/api/packages/{owner}/arch/{repository}/{architecture}
```

| 佔位符         | 描述           |
| -------------- | -------------- |
| `owner`        | 套件的擁有者。 |
| `repository`   | 要使用的儲存庫。 |
| `architecture` | 要使用的架構。 |

請參閱擁有者的套件概述以查看可用的 `repository` 和 `architecture`。

如果註冊表是私有的，請在 URL 中提供憑證。您可以使用密碼或 [個人存取權杖](development/api-usage.md#認證)：

```
Server = https://{username}:{your_password_or_token}@gitea.example.com/api/packages/{owner}/arch/{repository}/{architecture}
```

## 發布套件

要發布 Arch 套件，請執行 HTTP `PUT` 操作，請求體中包含套件內容。

```
PUT https://gitea.example.com/api/packages/{owner}/arch/{repository}
```

| 參數         | 描述                                         |
| ------------ | -------------------------------------------- |
| `owner`      | 套件的擁有者。                               |
| `repository` | 儲存庫可以用來分組套件或只是 `core` 或類似的。 |

使用 HTTP 基本身份驗證的範例請求：

```shell
curl --user your_username:your_password_or_token \
     --upload-file path/to/file.pkg.tar.zst \
     https://gitea.example.com/api/packages/testuser/arch/core
```

如果您使用 2FA 或 OAuth，請使用 [個人存取權杖](development/api-usage.md#認證) 代替密碼。

您不能將同名文件兩次發布到套件中。您必須先刪除現有的套件文件。

伺服器響應以下 HTTP 狀態碼。

| HTTP 狀態碼       | 含義                                       |
| ----------------- | ------------------------------------------ |
| `201 Created`     | 套件已發布。                               |
| `400 Bad Request` | 套件的某些部分無效。錯誤消息包含更多資訊。 |
| `409 Conflict`    | 套件中已存在具有相同參數組合的套件文件。   |

## 安裝套件

要安裝套件，請運行 pacman 同步命令：

```sh
pacman -Sy {package_name}
```

| 參數           | 描述       |
| -------------- | ---------- |
| `package_name` | 套件名稱。 |

## 刪除套件

要刪除 Arch 套件，請執行 HTTP `DELETE` 操作。如果沒有文件剩餘，這也會刪除套件版本。

```
DELETE https://gitea.example.com/api/packages/{owner}/arch/{repository}/{package_name}/{package_version}/{architecture}
```

| 參數              | 描述           |
| ----------------- | -------------- |
| `owner`           | 套件的擁有者。 |
| `repository`      | 要使用的儲存庫。 |
| `architecture`    | 套件架構。     |
| `package_name`    | 套件名稱。     |
| `package_version` | 套件版本。     |

使用 HTTP 基本身份驗證的範例請求：

```shell
curl --user your_username:your_token_or_password -X DELETE \
     https://gitea.example.com/api/packages/testuser/arch/core/test-package/1.0.0/x86-64
```

伺服器響應以下 HTTP 狀態碼。

| HTTP 狀態碼      | 含義               |
| ---------------- | ------------------ |
| `204 No Content` | 成功               |
| `404 Not Found`  | 未找到套件或文件。 |
