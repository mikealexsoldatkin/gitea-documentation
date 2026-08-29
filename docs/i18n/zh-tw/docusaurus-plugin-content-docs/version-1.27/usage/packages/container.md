---
date: "2021-07-20T00:00:00+00:00"
slug: "container"
sidebar_position: 30
---

# 容器註冊表

為您的使用者或組織發佈符合  [Open Container Initiative(OCI)](https://opencontainers.org/) 規範的鏡像。
該容器註冊表遵循 OCI 規範，並支援所有相容的鏡像類型，如 [Docker](https://www.docker.com/) 和 [Helm Charts](https://helm.sh/)。

## 目錄

要使用容器註冊表，您可以使用適用於特定鏡像類型的工具。
以下範例使用 `docker` 客戶端。

## 登入容器註冊表

要推送鏡像或者如果鏡像位於私有註冊表中，您需要進行身份驗證：

```shell
docker login gitea.example.com
```

如果您使用的是 2FA 或 OAuth，請使用[個人存取權杖](development/api-usage.md#透過-api-認證)替代密碼進行身份驗證。

## 鏡像命名約定

鏡像必須遵循以下命名約定：

`{registry}/{owner}/{image}`

例如，以下是所有者為 `testuser` 的有效鏡像名稱範例：

`gitea.example.com/testuser/myimage`

`gitea.example.com/testuser/my-image`

`gitea.example.com/testuser/my/image`

**注意:** 該註冊表僅支援大小寫不敏感的標籤名稱。因此，`image:tag` 和 `image:Tag` 將被視為相同的鏡像和標籤。

## 推送鏡像

透過執行以下命令來推送鏡像：

```shell
docker push gitea.example.com/{owner}/{image}:{tag}
```

| 參數    | 描述         |
| ------- | ------------ |
| `owner` | 鏡像的所有者 |
| `image` | 鏡像的名稱   |
| `tag`   | 鏡像的標籤   |

例如：

```shell
docker push gitea.example.com/testuser/myimage:latest
```

## 拉取鏡像

透過執行以下命令來拉取鏡像：

```shell
docker pull gitea.example.com/{owner}/{image}:{tag}
```

| Parameter | Description  |
| --------- | ------------ |
| `owner`   | 鏡像的所有者 |
| `image`   | 鏡像的名稱   |
| `tag`     | 鏡像的標籤   |

例如：

```shell
docker pull gitea.example.com/testuser/myimage:latest
```
