---
date: "2022-04-14T00:00:00+00:00"
slug: "helm"
sidebar_position: 50
---

# Helm Chart 註冊表

為您的使用者或組織發布 [Helm](https://helm.sh/) 圖表。

## 需求

要使用 Helm Chart 註冊表，請使用簡單的 HTTP 客戶端，如 `curl` 或 [`helm cm-push`](https://github.com/chartmuseum/helm-push/) 外掛。

## 發布套件

通過運行以下命令發布套件：

```shell
curl --user {username}:{password} -X POST --upload-file ./{chart_file}.tgz https://gitea.example.com/api/packages/{owner}/helm/api/charts
```

或使用 `helm cm-push` 外掛：

```shell
helm repo add  --username {username} --password {password} {repo} https://gitea.example.com/api/packages/{owner}/helm
helm cm-push ./{chart_file}.tgz {repo}
```

| 參數         | 描述                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------- |
| `username`   | 您的 Gitea 使用者名稱。                                                                                                 |
| `password`   | 您的 Gitea 密碼。如果您使用 2FA 或 OAuth，請使用 [個人存取權杖](development/api-usage.md#認證) 代替密碼。 |
| `repo`       | 儲存庫的名稱。                                                                                                        |
| `chart_file` | Helm Chart 存檔。                                                                                                   |
| `owner`      | 套件的擁有者。                                                                                                      |

## 安裝套件

要從註冊表中安裝 Helm 圖表，請執行以下命令：

```shell
helm repo add  --username {username} --password {password} {repo} https://gitea.example.com/api/packages/{owner}/helm
helm repo update
helm install {name} {repo}/{chart}
```

| 參數       | 描述                            |
| ---------- | ------------------------------- |
| `username` | 您的 Gitea 使用者名稱。             |
| `password` | 您的 Gitea 密碼或個人存取權杖。 |
| `repo`     | 儲存庫的名稱。                    |
| `owner`    | 套件的擁有者。                  |
| `name`     | 本地名稱。                      |
| `chart`    | Helm Chart 的名稱。             |
