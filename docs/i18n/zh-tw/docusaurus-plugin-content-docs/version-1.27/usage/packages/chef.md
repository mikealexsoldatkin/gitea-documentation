---
date: "2023-01-20T00:00:00+00:00"
slug: "chef"
sidebar_position: 5
---

# Chef 套件註冊表

為您的使用者或組織發佈 [Chef](https://chef.io/) cookbooks。

## 要求

要使用 Chef 套件註冊表，您需要使用 [`knife`](https://docs.chef.io/workstation/knife/).

## 認證

Chef 套件註冊表不使用使用者名稱和密碼進行身份驗證，而是使用私鑰和公鑰對請求進行簽名。
請前往套件所有者設定頁面以建立必要的密鑰對。
只有公鑰儲存在Gitea中。如果您丟失了私鑰的存取權限，您必須重新生成密鑰對。
[設定 `knife`](https://docs.chef.io/workstation/knife_setup/)，使用下載的私鑰，並將 Gitea 使用者名稱設定為 `client_name`。

## 設定套件註冊表

要將 [`knife` 設定](https://docs.chef.io/workstation/knife_setup/)為使用 Gitea 套件註冊表，請將 URL 添加到 `~/.chef/config.rb` 文件中。

```
knife[:supermarket_site] = 'https://gitea.example.com/api/packages/{owner}/chef'
```

| 參數    | 描述           |
| ------- | -------------- |
| `owner` | 套件的所有者 |

## 發佈套件

若要發佈 Chef 套件，請執行以下命令：

```shell
knife supermarket share {package_name}
```

| 參數           | 描述       |
| -------------- | ---------- |
| `package_name` | 套件名稱 |

如果已經存在同名和版本的套件，則無法發佈新的套件。您必須先刪除現有的套件。

## 安裝套件

要從套件註冊表中安裝套件，請執行以下命令：

```shell
knife supermarket install {package_name}
```

您可以指定套件的版本，這是可選的：

```shell
knife supermarket install {package_name} {package_version}
```

| 參數              | 描述       |
| ----------------- | ---------- |
| `package_name`    | 套件名稱 |
| `package_version` | 套件版本 |

## 刪除套件

如果您想要從註冊表中刪除套件，請執行以下命令：

```shell
knife supermarket unshare {package_name}
```

可選地，您可以指定套件的版本：

```shell
knife supermarket unshare {package_name}/versions/{package_version}
```

| 參數              | 描述       |
| ----------------- | ---------- |
| `package_name`    | 套件名稱 |
| `package_version` | 套件版本 |
