---
date: "2021-07-20T00:00:00+00:00"
slug: "container"
sidebar_position: 30
---

# 容器註冊表

為您的使用者或組織發布符合 [Open Container Initiative](https://opencontainers.org/) 規範的映像。
容器註冊表遵循 OCI 規範，支援所有相容的映像，如 [Docker](https://www.docker.com/) 和 [Helm Charts](https://helm.sh/)。

## 需求

要使用容器註冊表，您可以使用特定映像類型的工具。
以下範例使用 `docker` 客戶端。

## 登入到容器註冊表

要推送映像或如果映像在私有註冊表中，您必須進行身份驗證：

```shell
docker login gitea.example.com
```

如果您使用 2FA 或 OAuth，請使用 [個人存取權杖](development/api-usage.md#認證) 代替密碼。

## 映像命名規則

映像必須遵循以下命名規則：

`{registry}/{owner}/{image}`

在構建您的 docker 映像時，使用上述命名規則，這看起來像這樣：

```shell
# 使用標籤構建映像
docker build -t {registry}/{owner}/{image}:{tag} .
# 使用標籤命名現有映像
docker tag {some-existing-image}:{tag} {registry}/{owner}/{image}:{tag}
```

其中您的註冊表是您的 gitea 實例的域名（例如 gitea.example.com）。
例如，以下是所有者 `testuser` 的所有有效映像名稱：

`gitea.example.com/testuser/myimage`

`gitea.example.com/testuser/my-image`

`gitea.example.com/testuser/my/image`

:::note
註冊表僅支援不區分大小寫的標籤名稱。因此 `image:tag` 和 `image:Tag` 被視為相同的映像和標籤。
:::

## 推送映像

透過執行以下命令推送映像：

```shell
docker push gitea.example.com/{owner}/{image}:{tag}
```

| 參數    | 描述           |
| ------- | -------------- |
| `owner` | 映像的擁有者。 |
| `image` | 映像的名稱。   |
| `tag`   | 映像的標籤。   |

例如：

```shell
docker push gitea.example.com/testuser/myimage:latest
```

## 拉取映像

透過執行以下命令拉取映像：

```shell
docker pull gitea.example.com/{owner}/{image}:{tag}
```

| 參數    | 描述           |
| ------- | -------------- |
| `owner` | 映像的擁有者。 |
| `image` | 映像的名稱。   |
| `tag`   | 映像的標籤。   |

例如：

```shell
docker pull gitea.example.com/testuser/myimage:latest
```
