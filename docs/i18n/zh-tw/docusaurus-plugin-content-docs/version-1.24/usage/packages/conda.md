---
date: "2022-12-28T00:00:00+00:00"
slug: "conda"
sidebar_position: 25
---

# Conda 套件註冊表

為您的使用者或組織發佈 [Conda](https://docs.conda.io/en/latest/) 套件。

## 要求

要使用 Conda 套件註冊表，您需要使用 [conda](https://docs.conda.io/projects/conda/en/stable/user-guide/install/index.html) 命令行工具。

## 設定套件註冊表

要註冊套件註冊表並提供憑證，請編輯您的 `.condarc` 文件：

```yaml
channel_alias: https://gitea.example.com/api/packages/{owner}/conda
channels:
  - https://gitea.example.com/api/packages/{owner}/conda
default_channels:
  - https://gitea.example.com/api/packages/{owner}/conda
```

| 佔位符  | 描述           |
| ------- | -------------- |
| `owner` | 套件的所有者 |

有關各個設定的解釋，請參閱[官方文件](https://conda.io/projects/conda/en/latest/user-guide/configuration/use-condarc.html)。

如果需要提供憑證，可以將它們作為通道 URL 的一部分嵌入（`https://user:password@gitea.example.com/...`）。

## 發佈套件

要發佈一個套件，請執行一個HTTP `PUT`操作，請求正文中包含套件內容。

```
PUT https://gitea.example.com/api/packages/{owner}/conda/{channel}/{filename}
```

| 佔位符     | 描述                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------- |
| `owner`    | 套件的所有者                                                                                      |
| `channel`  | 套件的[通道](https://conda.io/projects/conda/en/latest/user-guide/concepts/channels.html)（可選） |
| `filename` | 文件名                                                                                              |

使用HTTP基本身份驗證的範例請求：

```shell
curl --user your_username:your_password_or_token \
     --upload-file path/to/package-1.0.conda \
     https://gitea.example.com/api/packages/testuser/conda/package-1.0.conda
```

如果已經存在同名和版本的套件，則無法發佈套件。您必須先刪除現有的套件。

## 安裝套件

要從套件註冊表中安裝套件，請執行以下命令之一：

```shell
conda install {package_name}
conda install {package_name}={package_version}
conda install -c {channel} {package_name}
```

| 參數              | 描述                 |
| ----------------- | -------------------- |
| `package_name`    | 套件的名稱         |
| `package_version` | 套件的版本         |
| `channel`         | 套件的通道（可選） |
