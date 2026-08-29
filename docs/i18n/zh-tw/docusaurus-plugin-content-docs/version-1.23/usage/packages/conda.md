---
date: "2022-12-28T00:00:00+00:00"
slug: "conda"
sidebar_position: 25
---

# Conda 套件註冊表

為您的使用者或組織發布 [Conda](https://docs.conda.io/en/latest/) 套件。

## 需求

要使用 Conda 套件註冊表，您需要使用 [conda](https://docs.conda.io/projects/conda/en/stable/user-guide/install/index.html)。

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
| `owner` | 套件的擁有者。 |

請參閱 [官方文件](https://conda.io/projects/conda/en/latest/user-guide/configuration/use-condarc.html) 以瞭解各個設定的說明。

如果您需要提供憑證，您可以將它們嵌入到頻道 URL 中（`https://user:password@gitea.example.com/...`）。

## 發布套件

要發布套件，請執行 HTTP PUT 操作，請求體中包含套件內容。

```
PUT https://gitea.example.com/api/packages/{owner}/conda/{channel}/{filename}
```

| 佔位符     | 描述                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| `owner`    | 套件的擁有者。                                                                                       |
| `channel`  | 套件的 [頻道](https://conda.io/projects/conda/en/latest/user-guide/concepts/channels.html)。（可選） |
| `filename` | 文件名。                                                                                             |

使用 HTTP 基本身份驗證的範例請求：

```shell
curl --user your_username:your_password_or_token \
     --upload-file path/to/package-1.0.conda \
     https://gitea.example.com/api/packages/testuser/conda/package-1.0.conda
```

如果您使用 2FA 或 OAuth，請使用 [個人存取權杖](development/api-usage.md#認證) 代替密碼。

如果已經存在同名同版本的套件，您不能發布該套件。您必須先刪除現有的套件。

伺服器響應以下 HTTP 狀態碼。

| HTTP 狀態碼       | 含義                               |
| ----------------- | ---------------------------------- |
| `201 Created`     | 套件已發布。                       |
| `400 Bad Request` | 套件無效。                         |
| `409 Conflict`    | 已存在具有相同參數組合的套件文件。 |

## 安裝套件

要從套件註冊表中安裝套件，請執行以下命令之一：

```shell
conda install {package_name}
conda install {package_name}={package_version}
conda install -c {channel} {package_name}
```

| 參數              | 描述                 |
| ----------------- | -------------------- |
| `package_name`    | 套件名稱。           |
| `package_version` | 套件版本。           |
| `channel`         | 套件的頻道。（可選） |
