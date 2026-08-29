---
date: "2022-07-31T00:00:00+00:00"
slug: "pub"
sidebar_position: 90
---

# Pub 套件註冊表

為您的使用者或組織發佈 [Pub](https://dart.dev/guides/packages) 套件。

## 要求

要使用Pub套件註冊表，您需要使用 [dart](https://dart.dev/tools/dart-tool) 和/或 [flutter](https://docs.flutter.dev/reference/flutter-cli). 工具。

以下範例使用 `dart`。

## 設定套件註冊表

要註冊套件註冊表並提供憑據，請執行以下操作：

```shell
dart pub token add https://gitea.example.com/api/packages/{owner}/pub
```

| 佔位符  | 描述           |
| ------- | -------------- |
| `owner` | 套件的所有者 |

您需要提供您的[個人存取權杖](development/api-usage.md#透過-api-認證)。

## 發佈套件

要發佈套件，請編輯 `pubspec.yaml` 文件，並添加以下行：

```yaml
publish_to: https://gitea.example.com/api/packages/{owner}/pub
```

| 佔位符  | 描述           |
| ------- | -------------- |
| `owner` | 套件的所有者 |

現在，您可以透過運行以下命令來發布套件：

```shell
dart pub publish
```

如果已存在具有相同名稱和版本的套件，則無法發佈套件。您必須先刪除現有的套件。

## 安裝套件

要從套件註冊表安裝Pub套件，請執行以下命令：

```shell
dart pub add {package_name} --hosted-url=https://gitea.example.com/api/packages/{owner}/pub/
```

| 參數           | 描述           |
| -------------- | -------------- |
| `owner`        | 套件的所有者 |
| `package_name` | 套件名稱     |

例如：

```shell
# use latest version
dart pub add mypackage --hosted-url=https://gitea.example.com/api/packages/testuser/pub/
# specify version
dart pub add mypackage:1.0.8 --hosted-url=https://gitea.example.com/api/packages/testuser/pub/
```
