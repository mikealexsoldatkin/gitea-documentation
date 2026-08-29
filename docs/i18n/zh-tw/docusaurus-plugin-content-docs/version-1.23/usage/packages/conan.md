---
date: "2021-07-20T00:00:00+00:00"
slug: "conan"
sidebar_position: 20
---

# Conan 套件註冊表

為您的使用者或組織發布 [Conan](https://conan.io/) 套件。

## 需求

要使用 Conan 套件註冊表，您需要使用 [conan](https://conan.io/downloads.html) 命令行工具來消費和發布套件。

## 設定套件註冊表

要註冊套件註冊表，您需要設定一個新的 Conan 遠程：

```shell
conan remote add {remote} https://gitea.example.com/api/packages/{owner}/conan
conan user --remote {remote} --password {password} {username}
```

| 參數       | 描述                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| `remote`   | 遠程名稱。                                                                                                          |
| `username` | 您的 Gitea 使用者名稱。                                                                                                 |
| `password` | 您的 Gitea 密碼。如果您使用 2FA 或 OAuth，請使用 [個人存取權杖](development/api-usage.md#認證) 代替密碼。 |
| `owner`    | 套件的擁有者。                                                                                                      |

例如：

```shell
conan remote add gitea https://gitea.example.com/api/packages/testuser/conan
conan user --remote gitea --password password123 testuser
```

## 發布套件

運行以下命令來發布 Conan 套件：

```shell
conan upload --remote={remote} {recipe}
```

| 參數     | 描述           |
| -------- | -------------- |
| `remote` | 遠程名稱。     |
| `recipe` | 要上傳的配方。 |

例如：

```shell
conan upload --remote=gitea ConanPackage/1.2@gitea/final
```

您不能將同名文件兩次發布到套件中。您必須先刪除現有的套件或文件。

Gitea Conan 套件註冊表完全支援 [修訂](https://docs.conan.io/en/latest/versioning/revisions.html)。

## 安裝套件

要從套件註冊表中安裝 Conan 套件，請執行以下命令：

```shell
conan install --remote={remote} {recipe}
```

| 參數     | 描述           |
| -------- | -------------- |
| `remote` | 遠程名稱。     |
| `recipe` | 要下載的配方。 |

例如：

```shell
conan install --remote=gitea ConanPackage/1.2@gitea/final
```

## 支援的命令

```
conan install
conan get
conan info
conan search
conan upload
conan user
conan download
conan remove
```
