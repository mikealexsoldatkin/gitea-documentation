---
date: "2022-04-14T00:00:00+00:00"
slug: "helm"
sidebar_position: 50
---

# Helm Chart 註冊表

為您的使用者或組織發佈 [Helm](https://helm.sh/) charts。

## 要求

要使用 Helm Chart 註冊表，可以使用諸如 `curl` 或 [`helm cm-push`](https://github.com/chartmuseum/helm-push/) 外掛之類的簡單HTTP客戶端。

## 發佈套件

通過運行以下命令來發布套件：

```shell
curl --user {username}:{password} -X POST --upload-file ./{chart_file}.tgz https://gitea.example.com/api/packages/{owner}/helm/api/charts
```

或者使用 `helm cm-push` 外掛：

```shell
helm repo add  --username {username} --password {password} {repo} https://gitea.example.com/api/packages/{owner}/helm
helm cm-push ./{chart_file}.tgz {repo}
```

| 參數         | 描述                                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `username`   | 您的Gitea使用者名稱                                                                                                                                        |
| `password`   | 您的Gitea密碼。如果您使用的是2FA或OAuth，請使用[個人存取權杖](development/api-usage.md#透過-api-認證)替代密碼進行身份驗證。 |
| `repo`       | 儲存庫名稱                                                                                                                                               |
| `chart_file` | Helm Chart 歸檔文件                                                                                                                                    |
| `owner`      | 套件的所有者                                                                                                                                         |

## 安裝套件

要從註冊表中安裝Helm Chart，請執行以下命令：

```shell
helm repo add  --username {username} --password {password} {repo} https://gitea.example.com/api/packages/{owner}/helm
helm repo update
helm install {name} {repo}/{chart}
```

| 參數       | 描述                        |
| ---------- | --------------------------- |
| `username` | 您的Gitea使用者名稱             |
| `password` | 您的Gitea密碼或個人存取權杖 |
| `repo`     | 儲存庫的名稱                |
| `owner`    | 套件的所有者              |
| `name`     | 本地名稱                    |
| `chart`    | Helm Chart的名稱            |
