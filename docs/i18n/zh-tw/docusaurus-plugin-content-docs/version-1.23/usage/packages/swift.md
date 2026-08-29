---
date: "2023-01-10T00:00:00+00:00"
slug: "swift"
sidebar_position: 115
---

# Swift 套件註冊表

為您的使用者或組織發布 [Swift](https://www.swift.org/) 套件。

## 需求

要使用 Swift 套件註冊表，您需要使用 [swift](https://www.swift.org/getting-started/) 來消費和使用 HTTP 客戶端（如 `curl`）來發布套件。

## 設定套件註冊表

要註冊套件註冊表並提供憑證，請執行：

```shell
swift package-registry set https://gitea.example.com/api/packages/{owner}/swift
swift package-registry login https://gitea.example.com/api/packages/{owner}/swift --username {username} --password {password}
```

| 佔位符     | 描述                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| `owner`    | 套件的擁有者。                                                                                                      |
| `username` | 您的 Gitea 使用者名稱。                                                                                                 |
| `password` | 您的 Gitea 密碼。如果您使用 2FA 或 OAuth，請使用 [個人存取權杖](development/api-usage.md#認證) 代替密碼。 |

登入是可選的，僅在套件註冊表是私有時需要。

## 發布套件

首先，您需要打包套件的內容：

```shell
swift package archive-source
```

要發布套件，請執行 HTTP PUT 請求，請求體中包含套件內容。

```shell --user your_username:your_password_or_token \
curl -X PUT --user {username}:{password} \
	 -H "Accept: application/vnd.swift.registry.v1+json" \
	 -F source-archive=@/path/to/package.zip \
	 -F metadata={metadata} \
	 https://gitea.example.com/api/packages/{owner}/swift/{scope}/{name}/{version}
```

| 佔位符     | 描述                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| `username` | 您的 Gitea 使用者名稱。                                                                                                 |
| `password` | 您的 Gitea 密碼。如果您使用 2FA 或 OAuth，請使用 [個人存取權杖](development/api-usage.md#認證) 代替密碼。 |
| `owner`    | 套件的擁有者。                                                                                                      |
| `scope`    | 套件範圍。                                                                                                          |
| `name`     | 套件名稱。                                                                                                          |
| `version`  | 套件版本。                                                                                                          |
| `metadata` | （可選）套件的元資料。JSON 編碼的 https://schema.org/SoftwareSourceCode 子集                                        |

如果已經存在同名同版本的套件，您不能發布該套件。您必須先刪除現有的套件。

伺服器響應以下 HTTP 狀態碼。

| HTTP 狀態碼       | 含義                                 |
| ----------------- | ------------------------------------ |
| `201 Created`     | 套件已發布。                         |
| `400 Bad Request` | 套件無效。                           |
| `409 Conflict`    | 套件中已存在具有相同參數組合的文件。 |

## 安裝套件

要從套件註冊表中安裝 Swift 套件，請在 `Package.swift` 文件的依賴項列表中添加：

```
dependencies: [
	.package(id: "{scope}.{name}", from:"{version}")
]
```

| 參數      | 描述       |
| --------- | ---------- |
| `scope`   | 套件範圍。 |
| `name`    | 套件名稱。 |
| `version` | 套件版本。 |

之後執行以下命令來安裝它：

```shell
swift package resolve
```
