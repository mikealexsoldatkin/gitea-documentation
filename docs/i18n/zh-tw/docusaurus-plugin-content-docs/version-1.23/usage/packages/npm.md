---
date: "2021-07-20T00:00:00+00:00"
slug: "npm"
sidebar_position: 70
---

# NPM 套件註冊表

為您的使用者或組織發布 [npm](https://www.npmjs.com/) 套件。

## 需求

要使用 npm 套件註冊表，您需要 [Node.js](https://nodejs.org/en/download/) 以及一個套件管理器，如 [Yarn](https://classic.yarnpkg.com/en/docs/install) 或 [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/) 本身。

註冊表支援[範圍](https://docs.npmjs.com/misc/scope/)和非範圍套件。

以下範例使用 `npm` 工具和範圍 `@test`。

## 設定套件註冊表

要註冊套件註冊表，您需要設定一個新的包源。

```shell
npm config set {scope}:registry=https://gitea.example.com/api/packages/{owner}/npm/
npm config set -- '//gitea.example.com/api/packages/{owner}/npm/:_authToken' "{token}"
```

| 參數    | 描述                                                           |
| ------- | -------------------------------------------------------------- |
| `scope` | 套件的範圍。                                                   |
| `owner` | 套件的擁有者。                                                 |
| `token` | 您的 [個人存取權杖](development/api-usage.md#認證)。 |

例如：

```shell
npm config set @test:registry=https://gitea.example.com/api/packages/testuser/npm/
npm config set -- '//gitea.example.com/api/packages/testuser/npm/:_authToken' "personal_access_token"
```

或不使用範圍：

```shell
npm config set registry https://gitea.example.com/api/packages/testuser/npm/
npm config set -- '//gitea.example.com/api/packages/testuser/npm/:_authToken' "personal_access_token"
```

## 發布套件

在您的專案中運行以下命令來發布套件：

```shell
npm publish
```

如果已經存在同名同版本的套件，您不能發布該套件。您必須先刪除現有的套件。

## 取消發布套件

運行以下命令來刪除套件：

```shell
npm unpublish {package_name}[@{package_version}]
```

| 參數              | 描述       |
| ----------------- | ---------- |
| `package_name`    | 套件名稱。 |
| `package_version` | 套件版本。 |

例如：

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
| `package_name` | 套件名稱。 |

例如：

```shell
npm install @test/test_package
```

## 標記套件

註冊表支援[版本標籤](https://docs.npmjs.com/adding-dist-tags-to-packages/)，可以透過 `npm dist-tag` 進行管理：

```shell
npm dist-tag add {package_name}@{version} {tag}
```

| 參數           | 描述       |
| -------------- | ---------- |
| `package_name` | 套件名稱。 |
| `version`      | 套件版本。 |
| `tag`          | 標籤名稱。 |

例如：

```shell
npm dist-tag add test_package@1.0.2 release
```

標籤名稱不能是有效版本。所有可解析為版本的標籤名稱都會被拒絕。

## 搜索套件

註冊表支援[搜索](https://docs.npmjs.com/cli/v7/commands/npm-search/)，但不支援特殊搜索限定符，如 `author:gitea`。

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
