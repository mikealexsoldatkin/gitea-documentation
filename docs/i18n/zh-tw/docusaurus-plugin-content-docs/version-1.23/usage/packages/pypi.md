---
date: "2021-07-20T00:00:00+00:00"
slug: "pypi"
sidebar_position: 100
---

# PyPI 套件註冊表

為您的使用者或組織發布 [PyPI](https://pypi.org/) 套件。

## 需求

要使用 PyPI 套件註冊表，您需要使用工具 [pip](https://pypi.org/project/pip/) 來消費和 [twine](https://pypi.org/project/twine/) 來發布套件。

## 設定套件註冊表

要註冊套件註冊表，您需要編輯本地 `~/.pypirc` 文件。添加

```ini
[distutils]
index-servers = gitea

[gitea]
repository = https://gitea.example.com/api/packages/{owner}/pypi
username = {username}
password = {password}
```

| 佔位符     | 描述                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| `owner`    | 套件的擁有者。                                                                                                      |
| `username` | 您的 Gitea 使用者名稱。                                                                                                 |
| `password` | 您的 Gitea 密碼。如果您使用 2FA 或 OAuth，請使用 [個人存取權杖](development/api-usage.md#認證) 代替密碼。 |

## 發布套件

運行以下命令來發布套件：

```shell
python3 -m twine upload --repository gitea /path/to/files/*
```

套件文件的擴展名為 `.tar.gz` 和 `.whl`。

如果已經存在同名同版本的套件，您不能發布該套件。您必須先刪除現有的套件。

## 安裝套件

要從套件註冊表中安裝 PyPI 套件，請執行以下命令：

```shell
pip install --index-url https://{username}:{password}@gitea.example.com/api/packages/{owner}/pypi/simple --no-deps {package_name}
```

| 參數           | 描述                            |
| -------------- | ------------------------------- |
| `username`     | 您的 Gitea 使用者名稱。             |
| `password`     | 您的 Gitea 密碼或個人存取權杖。 |
| `owner`        | 套件的擁有者。                  |
| `package_name` | 套件名稱。                      |

例如：

```shell
pip install --index-url https://testuser:password123@gitea.example.com/api/packages/testuser/pypi/simple --no-deps test_package
```

您可以使用 `--extra-index-url` 代替 `--index-url`，但這會使您容易受到依賴混淆攻擊，因為 `pip` 在檢查指定的自訂儲存庫之前會先檢查官方 PyPi 儲存庫。請閱讀 `pip` 文件以獲取更多資訊。

## 支援的命令

```
pip install
twine upload
```
