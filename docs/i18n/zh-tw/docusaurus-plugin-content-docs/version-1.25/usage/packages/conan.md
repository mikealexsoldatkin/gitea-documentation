---
date: "2021-07-20T00:00:00+00:00"
slug: "conan"
sidebar_position: 20
---

# Conan 套件註冊表

為您的使用者或組織發佈 [Conan](https://conan.io/) 套件。

## 要求

要使用 [conan](https://conan.io/downloads.html) 套件註冊表，您需要使用 conan 命令行工具來消費和發佈套件。

## 設定套件註冊表

要註冊套件註冊表，您需要設定一個新的 Conan remote：

```shell
conan remote add {remote} https://gitea.example.com/api/packages/{owner}/conan
conan user --remote {remote} --password {password} {username}
```

| 參數       | 描述                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `remote`   | 遠程名稱。                                                                                                                                  |
| `username` | 您的 Gitea 使用者名稱。                                                                                                                         |
| `password` | 您的 Gitea 密碼。如果您使用 2FA 或 OAuth，請使用[個人存取權杖](development/api-usage.md#透過-api-認證)替代密碼。 |
| `owner`    | 套件的所有者。                                                                                                                            |

例如:

```shell
conan remote add gitea https://gitea.example.com/api/packages/testuser/conan
conan user --remote gitea --password password123 testuser
```

## 發佈套件

通過運行以下命令發佈 Conan 套件：

```shell
conan upload --remote={remote} {recipe}
```

| 參數     | 描述            |
| -------- | --------------- |
| `remote` | 遠程名稱        |
| `recipe` | 要上傳的 recipe |

For example:

```shell
conan upload --remote=gitea ConanPackage/1.2@gitea/final
```

Gitea Conan 套件註冊表支援完整的[版本修訂](https://docs.conan.io/en/latest/versioning/revisions.html)。

## 安裝套件

要從套件註冊表中安裝Conan套件，請執行以下命令：

```shell
conan install --remote={remote} {recipe}
```

| 參數     | 描述            |
| -------- | --------------- |
| `remote` | 遠程名稱        |
| `recipe` | 要下載的 recipe |

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
