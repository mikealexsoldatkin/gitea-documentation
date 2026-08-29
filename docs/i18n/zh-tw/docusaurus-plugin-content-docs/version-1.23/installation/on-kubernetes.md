---
date: "2020-03-19T19:27:00+02:00"
slug: "install-on-kubernetes"
sidebar_position: 80
aliases:
  - /zh-tw/install-on-kubernetes
---

# 在 Kubernetes 上安裝

Gitea 提供了一個 Helm Chart 以允許在 kubernetes 上安裝。

可以使用以下命令進行非自訂安裝：

```
helm repo add gitea-charts https://dl.gitea.com/charts/
helm install gitea gitea-charts/gitea
```

如果您想自訂安裝，包括 kubernetes ingress，請參閱完整的 [Gitea helm chart 設定詳細資訊](https://gitea.com/gitea/helm-chart/)

## 健康檢查端點

Gitea 帶有一個健康檢查端點 `/api/healthz`，您可以在 kubernetes 中這樣設定它：

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

成功的健康檢查響應將返回 http 程式碼 `200`，範例如下：

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

有關更多資訊，請參考 kubernetes 文件 [定義 liveness HTTP 請求](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-a-liveness-http-request)
