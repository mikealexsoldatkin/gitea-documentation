---
date: "2021-07-20T00:00:00+00:00"

slug: "rubygems"
sidebar_position: 110

---

# RubyGems 套件註冊表

為您的使用者或組織發佈 [RubyGems](https://guides.rubygems.org/) 套件。

## 要求

要使用RubyGems套件註冊表，您需要使用 [gem](https://guides.rubygems.org/command-reference/) 命令行工具來消費和發佈套件。

## 設定套件註冊表

要註冊套件註冊表，請編輯 `~/.gem/credentials` 文件並添加：

```ini
---
https://gitea.example.com/api/packages/{owner}/rubygems: Bearer {token}
```

| 參數    | 描述                                                                                  |
| ------- | ------------------------------------------------------------------------------------- |
| `owner` | 套件的所有者                                                                        |
| `token` | 您的[個人存取權杖](development/api-usage.md#透過-api-認證) |

例如：

```
---
https://gitea.example.com/api/packages/testuser/rubygems: Bearer 3bd626f84b01cd26b873931eace1e430a5773cc4
```

## 發佈套件

通過運行以下命令來發布套件：

```shell
gem push --host {host} {package_file}
```

| 參數           | 描述                     |
| -------------- | ------------------------ |
| `host`         | 套件註冊表的URL        |
| `package_file` | 套件 `.gem` 文件的路徑 |

例如：

```shell
gem push --host https://gitea.example.com/api/packages/testuser/rubygems test_package-1.0.0.gem
```

如果已經存在相同名稱和版本的套件，您將無法發佈套件。您必須先刪除現有的套件。

## 安裝套件

要從套件註冊表安裝套件，您可以使用 [Bundler](https://bundler.io) 或 `gem`。

### Bundler

在您的 `Gemfile` 中添加一個新的 `source` 塊：

```
source "https://gitea.example.com/api/packages/{owner}/rubygems" do
  gem "{package_name}"
end
```

| 參數           | 描述           |
| -------------- | -------------- |
| `owner`        | 套件的所有者 |
| `package_name` | 套件名稱     |

例如：

```
source "https://gitea.example.com/api/packages/testuser/rubygems" do
  gem "test_package"
end
```

之後運行以下命令：

```shell
bundle install
```

### gem

執行以下命令：

```shell
gem install --host https://gitea.example.com/api/packages/{owner}/rubygems {package_name}
```

| 參數           | 描述           |
| -------------- | -------------- |
| `owner`        | 套件的所有者 |
| `package_name` | 套件名稱     |

例如：

```shell
gem install --host https://gitea.example.com/api/packages/testuser/rubygems test_package
```

## 支援的命令

```
gem install
bundle install
gem push
```
