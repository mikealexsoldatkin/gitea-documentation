---
date: "2023-01-10T00:00:00+00:00"
slug: "swift"
sidebar_position: 115
---

# Swift 套件註冊表

為您的使用者或組織發佈 [Swift](https://www.swift.org/) 套件。

## 要求

要使用 Swift 套件註冊表，您需要使用 [swift](https://www.swift.org/getting-started/) 消費套件，並使用 HTTP 客戶端（如 `curl`）發佈套件。

## 設定套件註冊表

要註冊套件註冊表並提供憑據，請執行以下命令：

```shell
swift package-registry set https://gitea.example.com/api/packages/{owner}/swift -login {username} -password {password}
```

| 佔位符     | 描述                                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `owner`    | 套件的所有者。                                                                                                                               |
| `username` | 您的 Gitea 使用者名稱。                                                                                                                            |
| `password` | 您的 Gitea 密碼。如果您使用兩步驗證或 OAuth，請使用[個人存取權杖](development/api-usage.md#透過-api-認證)代替密碼。 |

登入是可選的，只有在套件註冊表是私有的情況下才需要。

## 發佈套件

首先，您需要打包套件的內容：

```shell
swift package archive-source
```

要發佈套件，請執行一個帶有套件內容的 HTTP `PUT` 請求，將內容放在請求正文中。

```shell --user your_username:your_password_or_token \
curl -X PUT --user {username}:{password} \
	 -H "Accept: application/vnd.swift.registry.v1+json" \
	 -F source-archive=@/path/to/package.zip \
	 -F metadata={metadata} \
	 https://gitea.example.com/api/packages/{owner}/swift/{scope}/{name}/{version}
```

| 佔位符     | 描述                                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `username` | 您的 Gitea 使用者名稱。                                                                                                                            |
| `password` | 您的 Gitea 密碼。如果您使用兩步驗證或 OAuth，請使用[個人存取權杖](development/api-usage.md#透過-api-認證)代替密碼。 |
| `owner`    | 套件的所有者。                                                                                                                               |
| `scope`    | 套件的作用域。                                                                                                                               |
| `name`     | 套件的名稱。                                                                                                                                 |
| `version`  | 套件的版本。                                                                                                                                 |
| `metadata` | （可選）套件的元資料。以 JSON 編碼的子集，格式參考 https://schema.org/SoftwareSourceCode                                                     |

如果已經存在相同名稱和版本的套件，則無法發佈套件。您必須首先刪除現有的套件。

## 安裝套件

要從套件註冊表安裝 Swift 套件，請將其添加到 `Package.swift` 文件的依賴項列表中：

```
dependencies: [
	.package(id: "{scope}.{name}", from:"{version}")
]
```

| 參數      | 描述           |
| --------- | -------------- |
| `scope`   | 套件的作用域 |
| `name`    | 套件的名稱   |
| `version` | 套件的版本   |

之後，執行以下命令來安裝它：

```shell
swift package resolve
```
