---
date: "2023-05-15T00:00:00+00:00"
slug: "arch"
sidebar_position: 5
---

# Arch 儲存庫

在您的使用者或組織中發佈 [Arch](https://archlinux.org/packages/) 套件。 Arch 儲存庫的功能像是一個完整的[鏡像Arch 儲存庫](https://wiki.archlinux.org/title/mirrors\)，需要調整系統的`/etc/pacman.conf`文件。

## 需求

系統需要安裝有HTTP客戶端像是`curl`來下載文件，且必須安裝有`pacman`套件管理工具。

## 設定 Arch 儲存庫

Arch 儲存庫的軟體都有`gpg`簽名驗證，所以需要匯入驗證需要的公鑰，下面是下載公鑰的範例。
```sh
wget https://gitea.example.com/api/packages/{owner}/arch/repository.key
```

匯入公鑰之前，請先確認是否為該 Arch 儲存庫的公鑰，下面是檢視公鑰的範例。確認完成請記第二行的16為的`key id`
```sh
gpg --show-keys repository.key
```

接下來要匯入到pacman的鑰匙圈中，下面是匯入的範例。
```sh
pacman-key --add repository.key
pacman-key --lsign-key {key id}
```

匯入驗證的公鑰，接下來要修改pacman的設定檔，位置是`/etc/pacman.conf`，內容如下。
```conf
[{owner}.gitea.example.com]
SigLevel = Required
Server = https://gitea.example.com/api/packages/{owner}/arch/{repository}/{architecture}
```

| 佔位符       | 描述           |
| ------------ | -------------- |
| `owner`      | 套件所有者   |
| `repository` | 要使用的存放庫名 |
| `architecture` | 套件的架構 |

如果註冊表是私有的，請在 URL 中提供憑據。您可以使用密碼或[個人存取權杖](development/api-usage.md#透過-api-認證):
```
Server = https://{username}:{your_password_or_token}@gitea.example.com/api/packages/{owner}/arch/{repository}/{architecture}
```

## 發佈套件

要發佈一個 Arch 套件，請執行帶有包內容的 HTTP `PUT` 操作，將其放在請求體中。
```
PUT https://gitea.example.com/api/packages/{owner}/arch/{repository}
```

| 佔位符       | 描述           |
| ------------ | -------------- |
| `owner`      | 套件所有者   |
| `repository` | 要使用的存放庫名 |

使用 HTTP 基本身份驗證的範例請求：

```shell
curl --user your_username:your_password_or_token \
     --upload-file path/to/file.pkg.tar.zst \
     https://gitea.example.com/api/packages/testuser/arch/core
```

如果您使用的是雙重身份驗證或 OAuth，請使用[個人存取權杖](development/api-usage.md#透過-api-認證)代替密碼。
您不能將具有相同名稱的文件兩次發佈到一個包中。您必須首先刪除現有的包文件。

伺服器將以以下的 HTTP 狀態碼回應：
| HTTP 狀態碼       | 含義                                       |
| ----------------- | ------------------------------------------ |
| `201 Created`     | 套件已發佈。                             |
| `400 Bad Request` | 套件的名稱、版本、分支、存放庫或架構無效。 |
| `409 Conflict`    | 具有相同參數組合的包文件已存在於套件中。 |

## 安裝套件

要從 AArch 儲存庫安裝套件，請執行以下命令：

```sh
pacman -Sy {package_name}
```

| Parameter      | 含義 |
| -------------- | ----------- |
| `package_name` | 套件 |

## 刪除套件

要刪除 Arch 套件，執行 HTTP 的 DELETE 操作。如果沒有文件，這將同時刪除包版本。

```
DELETE https://gitea.example.com/api/packages/{owner}/arch/{repository}/{package_name}/{package_version}/{architecture}
```


| 參數           | 描述           |
| -------------- | -------------- |
| `owner`        | 套件的所有者 |
| `repository`   | 要使用的存放庫名 |
| `architecture` | 套件的架構   |
| `package_name`    | 要刪除的軟體名 |
| `package_version` | 軟體版本 |

使用 HTTP 基本身份驗證的範例請求：

```shell
curl --user your_username:your_token_or_password -X DELETE \
     https://gitea.example.com/api/packages/testuser/arch/core/test-package/1.0.0/x86-64
```

伺服器將以以下的 HTTP 狀態碼回應：

| HTTP 狀態碼      | 含義               |
| ---------------- | ------------------ |
| `204 No Content` | 成功               |
| `404 Not Found`  | 未找到套件或文件 |
