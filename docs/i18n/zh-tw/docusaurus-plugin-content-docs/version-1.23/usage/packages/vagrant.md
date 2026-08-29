---
date: "2022-08-23T00:00:00+00:00"
slug: "vagrant"
sidebar_position: 120
---

# Vagrant 套件註冊表

為您的使用者或組織發布 [Vagrant](https://www.vagrantup.com/) 套件。

## 需求

要使用 Vagrant 套件註冊表，您需要 [Vagrant](https://www.vagrantup.com/downloads) 和一個用於發送 HTTP 請求的工具，如 `curl`。

## 發布套件

透過執行 HTTP PUT 請求來發布 Vagrant box：

```
PUT https://gitea.example.com/api/packages/{owner}/vagrant/{package_name}/{package_version}/{provider}.box
```

| 參數              | 描述                                                               |
| ----------------- | ------------------------------------------------------------------ |
| `owner`           | 套件的擁有者。                                                     |
| `package_name`    | 套件名稱。                                                         |
| `package_version` | 套件版本，符合 semver。                                            |
| `provider`        | [支援的提供者名稱](https://www.vagrantup.com/docs/providers)之一。 |

上傳 Hyper-V box 的範例：

```shell
curl --user your_username:your_password_or_token \
     --upload-file path/to/your/vagrant.box \
     https://gitea.example.com/api/packages/testuser/vagrant/test_system/1.0.0/hyperv.box
```

如果您使用 2FA 或 OAuth，請使用 [個人存取權杖](development/api-usage.md#認證) 代替密碼。

如果已經存在同名、同版本和同提供者的 box，您不能發布該 box。您必須先刪除現有的套件。

伺服器響應以下 HTTP 狀態碼。

| HTTP 狀態碼       | 含義                                 |
| ----------------- | ------------------------------------ |
| `201 Created`     | 套件已發布。                         |
| `400 Bad Request` | 套件無效。                           |
| `409 Conflict`    | 套件中已存在具有相同參數組合的文件。 |

## 安裝套件

要從套件註冊表中安裝 box，請執行以下命令：

```shell
vagrant box add "https://gitea.example.com/api/packages/{owner}/vagrant/{package_name}"
```

| 參數           | 描述           |
| -------------- | -------------- |
| `owner`        | 套件的擁有者。 |
| `package_name` | 套件名稱。     |

例如：

```shell
vagrant box add "https://gitea.example.com/api/packages/testuser/vagrant/test_system"
```

這將安裝套件的最新版本。要添加特定版本，請使用 `--box-version` 參數。
如果註冊表是私有的，您可以在 `VAGRANT_CLOUD_TOKEN` 環境變量中傳遞您的 [個人存取權杖](development/api-usage.md#認證)。

## 支援的命令

```
vagrant box add
```
