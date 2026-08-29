---
date: "2021-07-20T00:00:00+00:00"

slug: "npm"
sidebar_position: 70

---

# NPM Package Registry

為您的使用者或組織發佈 [npm](https://www.npmjs.com/) 包。

## 要求

要使用 npm 包註冊表，您需要安裝 [Node.js](https://nodejs.org/en/download/)  以及與之配套的套件管理器，例如 [Yarn](https://classic.yarnpkg.com/en/docs/install) 或 [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/) 本身。

該註冊表支援[作用域](https://docs.npmjs.com/misc/scope/)和非作用域套件。

以下範例使用具有作用域 `@test` 的 `npm` 工具。

## 設定套件註冊表

要註冊套件註冊表，您需要設定一個新的套件源。

```shell
npm config set {scope}:registry=https://gitea.example.com/api/packages/{owner}/npm/
npm config set -- '//gitea.example.com/api/packages/{owner}/npm/:_authToken' "{token}"
```

| 參數    | 描述                                                                                    |
| ------- | --------------------------------------------------------------------------------------- |
| `scope` | 套件的作用域                                                                          |
| `owner` | 套件的所有者                                                                          |
| `token` | 您的[個人存取權杖](development/api-usage.md#透過-api-認證)。 |

例如：

```shell
npm config set @test:registry=https://gitea.example.com/api/packages/testuser/npm/
npm config set -- '//gitea.example.com/api/packages/testuser/npm/:_authToken' "personal_access_token"
```

或者，不使用作用域：

```shell
npm config set registry https://gitea.example.com/api/packages/testuser/npm/
npm config set -- '//gitea.example.com/api/packages/testuser/npm/:_authToken' "personal_access_token"
```

## 發佈套件

在專案中運行以下命令發佈套件：

```shell
npm publish
```

如果已經存在相同名稱和版本的套件，您無法發佈該套件。您必須先刪除現有的套件。

## 刪除套件

通過運行以下命令刪除套件：

```shell
npm unpublish {package_name}[@{package_version}]
```

| 參數              | 描述       |
| ----------------- | ---------- |
| `package_name`    | 套件名稱 |
| `package_version` | 套件版本 |

例如

```shell
npm unpublish @test/test_package
npm unpublish @test/test_package@1.0.0
```

## 安裝套件

要從套件註冊表中安裝套件，請執行以下命令：

```shell
npm install {package_name}
```

| 參數           | 描述       |
| -------------- | ---------- |
| `package_name` | 套件名稱 |

例如：

```shell
npm install @test/test_package
```

## 給套件打標籤

該註冊表支援[版本標籤](https://docs.npmjs.com/adding-dist-tags-to-packages/)，可以透過 `npm dist-tag` 管理：

```shell
npm dist-tag add {package_name}@{version} {tag}
```

| 參數           | 描述       |
| -------------- | ---------- |
| `package_name` | 套件名稱 |
| `version`      | 套件版本 |
| `tag`          | 套件標籤 |

例如：

```shell
npm dist-tag add test_package@1.0.2 release
```

標籤名稱不能是有效的版本。所有可解析為版本的標籤名稱都將被拒絕。

## 搜索套件

該註冊表支援[搜索](https://docs.npmjs.com/cli/v7/commands/npm-search/)，但不支援像 `author:gitea` 這樣的特殊搜索限定符。

## 支援的命令

```
npm install
npm ci
npm publish
npm unpublish
npm dist-tag
npm view
npm search
```
