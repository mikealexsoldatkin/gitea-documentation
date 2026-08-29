---
date: "2021-07-20T00:00:00+00:00"

slug: "nuget"
sidebar_position: 80
---

# NuGet 套件註冊表

發佈適用於您的使用者或組織的 [NuGet](https://www.nuget.org/) 套件。套件註冊表支援 V2 和 V3 API 協議，並且您還可以使用 [NuGet 符號套件](https://docs.microsoft.com/zh-tw/nuget/create-packages/symbol-packages-snupkg)。

## 要求

要使用 NuGet 套件註冊表，您可以使用命令行介面工具，以及各種整合開發環境（IDE）中的 NuGet 功能，如 Visual Studio。有關 NuGet 客戶端的更多資訊，請參[閱官方文件](https://docs.microsoft.com/zh-tw/nuget/install-nuget-client-tools)。
以下範例使用 `dotnet nuget` 工具。

## 設定套件註冊表

要註冊套件註冊表，您需要設定一個新的 NuGet 源：

```shell
dotnet nuget add source --name {source_name} --username {username} --password {password} https://gitea.example.com/api/packages/{owner}/nuget/index.json
```

| 參數          | 描述                                                                                                             |
| ------------- | ---------------------------------------------------------------------------------------------------------------- |
| `source_name` | 所需源名稱                                                                                                       |
| `username`    | 您的 Gitea 使用者名稱                                                                                                |
| `password`    | 您的 Gitea 密碼。如果您使用 2FA 或 OAuth，請使用[個人存取權杖](development/api-usage.md#透過-api-認證)代替密碼。 |
| `owner`       | 套件的所有者                                                                                                   |

例如：

```shell
dotnet nuget add source --name gitea --username testuser --password password123 https://gitea.example.com/api/packages/testuser/nuget/index.json
```

您可以在不提供憑據的情況下添加源，並在發佈套件時使用--api-key 參數。在這種情況下，您需要提供[個人存取權杖](development/api-usage.md#透過-api-認證)。

## 發佈套件

通過運行以下命令發佈套件：

```shell
dotnet nuget push --source {source_name} {package_file}
```

| 參數           | 描述                         |
| -------------- | ---------------------------- |
| `source_name`  | 所需源名稱                   |
| `package_file` | 套件 `.nupkg` 文件的路徑。 |

例如：

```shell
dotnet nuget push --source gitea test_package.1.0.0.nupkg
```

如果已經存在相同名稱和版本的套件，您無法發佈該套件。您必須先刪除現有的套件。

### 符號套件

NuGet 套件註冊表支援構建用於符號伺服器的符號套件。客戶端可以請求嵌入在符號套件（`.snupkg`）中的 PDB 文件。
為此，請將 NuGet 套件註冊表註冊為符號源：

```
https://gitea.example.com/api/packages/{owner}/nuget/symbols
```

| 參數    | 描述                 |
| ------- | -------------------- |
| `owner` | 套件註冊表的所有者 |

例如：

```
https://gitea.example.com/api/packages/testuser/nuget/symbols
```

## 安裝套件

要從套件註冊表安裝 NuGet 套件，請執行以下命令：

```shell
dotnet add package --source {source_name} --version {package_version} {package_name}
```

| 參數              | 描述         |
| ----------------- | ------------ |
| `source_name`     | 所需源名稱   |
| `package_name`    | 套件名稱   |
| `package_version` | 套件版本。 |

例如：

```shell
dotnet add package --source gitea --version 1.0.0 test_package
```

## 支援的命令

```
dotnet add
dotnet nuget push
dotnet nuget delete
```
