---
date: "2023-01-07T00:00:00+00:00"

slug: "debian"

---

# Debian 套件註冊表

為您的使用者或組織發佈 [Debian](https://www.debian.org/distrib/packages) 套件。

## 要求

要使用 Debian 註冊表，您需要使用類似於 `curl` 的 HTTP 客戶端進行上傳，並使用類似於 `apt` 的套件管理器消費套件。

以下範例使用 `apt`。

## 設定套件註冊表

要註冊 Debian 註冊表，請將 URL 添加到已知 `apt` 源列表中：

```shell
echo "deb [signed-by=/etc/apt/keyrings/gitea-{owner}.asc] https://gitea.example.com/api/packages/{owner}/debian {distribution} {component}" | sudo tee -a /etc/apt/sources.list.d/gitea.list
```

| 佔位符         | 描述           |
| -------------- | -------------- |
| `owner`        | 套件的所有者 |
| `distribution` | 要使用的發行版 |
| `component`    | 要使用的元件   |

如果註冊表是私有的，請在 URL 中提供憑據。您可以使用密碼或[個人存取權杖](development/api-usage.md#透過-api-認證)：

```shell
echo "deb [signed-by=/etc/apt/keyrings/gitea-{owner}.asc] https://{username}:{your_password_or_token}@gitea.example.com/api/packages/{owner}/debian {distribution} {component}" | sudo tee -a /etc/apt/sources.list.d/gitea.list
```

Debian 註冊表文件使用 PGP 密鑰進行簽名，`apt` 必須知道該密鑰：

```shell
sudo curl https://gitea.example.com/api/packages/{owner}/debian/repository.key -o /etc/apt/keyrings/gitea-{owner}.asc
```

然後更新本地套件索引：

```shell
apt update
```

## 發佈套件

要發佈一個 Debian 套件（`*.deb`），執行 HTTP `PUT` 操作，並將套件內容放入請求主體中。

```
PUT https://gitea.example.com/api/packages/{owner}/debian/pool/{distribution}/{component}/upload
```

| 參數           | 描述                                                  |
| -------------- | ----------------------------------------------------- |
| `owner`        | 套件的所有者                                        |
| `distribution` | 發行版，可能與操作系統的發行版名稱匹配，例如 `bionic` |
| `component`    | 元件，可用於分組套件，或僅為 `main` 或類似的元件。  |

使用 HTTP 基本身份驗證的範例請求：

```shell
curl --user your_username:your_password_or_token \
     --upload-file path/to/file.deb \
     https://gitea.example.com/api/packages/testuser/debian/pool/bionic/main/upload
```

如果您使用 2FA 或 OAuth，請使用[個人存取權杖](development/api-usage.md#透過-api-認證)替代密碼。
您無法向套件中多次發佈具有相同名稱的文件。您必須首先刪除現有的套件版本。

伺服器將使用以下 HTTP 狀態程式碼進行響應。

| HTTP 狀態碼       | 意義                                     |
| ----------------- | ---------------------------------------- |
| `201 Created`     | 套件已發佈                             |
| `400 Bad Request` | 套件名稱、版本、發行版、元件或架構無效 |
| `409 Conflict`    | 具有相同參數組合的套件文件已經存在     |

## 刪除套件

要刪除 Debian 套件，請執行 HTTP `DELETE` 操作。如果沒有文件留下，這將同時刪除套件版本。

```
DELETE https://gitea.example.com/api/packages/{owner}/debian/pool/{distribution}/{component}/{package_name}/{package_version}/{architecture}
```

| 參數              | 描述           |
| ----------------- | -------------- |
| `owner`           | 套件的所有者 |
| `package_name`    | 套件名稱     |
| `package_version` | 套件版本     |
| `distribution`    | 套件發行版   |
| `component`       | 套件元件     |
| `architecture`    | 套件架構     |

使用 HTTP 基本身份驗證的範例請求：

```shell
curl --user your_username:your_token_or_password -X DELETE \
     https://gitea.example.com/api/packages/testuser/debian/pools/bionic/main/test-package/1.0.0/amd64
```

伺服器將使用以下 HTTP 狀態程式碼進行響應。

| HTTP 狀態碼      | 含義               |
| ---------------- | ------------------ |
| `204 No Content` | 成功               |
| `404 Not Found`  | 找不到套件或文件 |

## 安裝套件

要從 Debian 註冊表安裝套件，請執行以下命令:

```shell
# use latest version
apt install {package_name}
# use specific version
apt install {package_name}={package_version}
```
