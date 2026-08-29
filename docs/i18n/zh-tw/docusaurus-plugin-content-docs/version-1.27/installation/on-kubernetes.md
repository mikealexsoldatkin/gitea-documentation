---
date: "2020-03-19T19:27:00+02:00"
slug: "install-on-kubernetes"
sidebar_position: 80
aliases:
  - /zh-tw/install-on-kubernetes
---

# 在 Kubernetes 中安裝 Gitea

Gitea 已經提供了便於在 Kubernetes 雲原生環境中安裝所需的 Helm Chart

預設安裝指令為：

```bash
helm repo add gitea https://dl.gitea.com/charts
helm repo update
helm install gitea gitea/gitea
```

如果採用預設安裝指令，Helm 會部署單實例的 Gitea, PostgreSQL, Memcached。若您想實現自訂安裝（包括設定 Gitea 集群、NGINX Ingress、MySQL、MariaDB、持久儲存等），請前往閱讀：[Gitea Helm Chart](https://gitea.com/gitea/helm-chart/)

您也可以透過 `helm show` 命令導出 `README.md` 和設定文件 `values.yaml` 進行學習和編輯，例如：

```bash
helm show values gitea/gitea > values.yaml
helm show readme gitea/gitea > README.md

# 使用自定義的配置文件 values.yaml
helm install gitea -f values.yaml gitea/gitea
```

## 運行狀況檢查介面

Gitea 附帶了一個運行狀況檢查介面 `/api/healthz`，你可以像這樣在 Kubernetes 中設定它：

```yaml
livenessProbe:
  httpGet:
    path: /api/healthz
    port: http
  initialDelaySeconds: 200
  timeoutSeconds: 5
  periodSeconds: 10
  successThreshold: 1
  failureThreshold: 10
```

成功的運行狀況檢查響應程式碼為 HTTP `200`，下面是範例：

```json
HTTP/1.1 200 OK

{
  "status": "pass",
  "description": "Gitea: Git with a cup of tea",
  "checks": {
    "cache:ping": [
      {
        "status": "pass",
        "time": "2022-02-19T09:16:08Z"
      }
    ],
    "database:ping": [
      {
        "status": "pass",
        "time": "2022-02-19T09:16:08Z"
      }
    ]
  }
}
```

有關更多資訊，請參考 Kubernetes 文件 [設定存活、就緒和啟動探測器](https://kubernetes.io/zh-tw/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
