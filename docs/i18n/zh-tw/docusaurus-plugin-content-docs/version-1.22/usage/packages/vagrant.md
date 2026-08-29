---
date: "2022-08-23T00:00:00+00:00"

slug: "vagrant"
sidebar_position: 120

---

# Vagrant 套件註冊表

為您的使用者或組織發佈 [Vagrant](https://www.vagrantup.com/) 套件。

## 要求

要使用 Vagrant 套件註冊表，您需要安裝 [Vagrant](https://www.vagrantup.com/downloads) 並使用類似於 `curl` 的工具進行 HTTP 請求。

## 發佈套件

透過執行 HTTP PUT 請求將 Vagrant box 發佈到註冊表：

```
PUT https://gitea.example.com/api/packages/{owner}/vagrant/{package_name}/{package_version}/{provider}.box
```

| 參數              | 描述                                                               |
| ----------------- | ------------------------------------------------------------------ |
| `owner`           | 套件的所有者                                                     |
| `package_name`    | 套件的名稱                                                       |
| `package_version` | 套件的版本，相容 semver 格式                                     |
| `provider`        | [支援的提供程式名稱](https://www.vagrantup.com/docs/providers)之一 |

上傳 Hyper-V box 的範例：

```shell
curl --user your_username:your_password_or_token \
     --upload-file path/to/your/vagrant.box \
     https://gitea.example.com/api/packages/testuser/vagrant/test_system/1.0.0/hyperv.box
```

如果已經存在相同名稱、版本和提供程式的套件，則無法發佈套件。您必須首先刪除現有的套件。

## 安裝套件

要從套件註冊表安裝套件，請執行以下命令：

```shell
vagrant box add "https://gitea.example.com/api/packages/{owner}/vagrant/{package_name}"
```

| 參數           | 描述            |
| -------------- | --------------- |
| `owner`        | 套件的所有者. |
| `package_name` | 套件的名稱    |

例如：

```shell
vagrant box add "https://gitea.example.com/api/packages/testuser/vagrant/test_system"
```

這將安裝套件的最新版本。要添加特定版本，請使用` --box-version` 參數。
如果註冊表是私有的，您可以將您的[個人存取權杖](development/api-usage.md#透過-api-認證)傳遞給 `VAGRANT_CLOUD_TOKEN` 環境變量。

## 支援的命令

```
vagrant box add
```
