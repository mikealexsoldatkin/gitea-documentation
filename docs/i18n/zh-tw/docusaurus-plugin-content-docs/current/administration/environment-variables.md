---
date: "2017-04-08T11:34:00+02:00"
slug: "environment-variables"
sidebar_position: 10

aliases:
  - /zh-tw/environment-variables
---

# 環境變量清單

這裡是用來控制 Gitea 行為表現的的環境變量清單，您需要在執行如下 Gitea 啟動命令前設定它們來確保設定生效：

```
GITEA_CUSTOM=/home/gitea/custom ./gitea web
```

## Go 的設定

因為 Gitea 使用 Go 語言編寫，因此它使用了一些相關的 Go 的設定參數：

- `GOOS`
- `GOARCH`
- [`GOPATH`](https://go.dev/cmd/go/#hdr-GOPATH_environment_variable)

您可以在[官方文件](https://go.dev/cmd/go/#hdr-Environment_variables)中查閱這些設定參數的詳細資訊。

## Gitea 的文件目錄

- `GITEA_WORK_DIR`：工作目錄的絕對路徑
- `GITEA_CUSTOM`：預設情況下 Gitea 使用預設目錄 `GITEA_WORK_DIR`/custom，您可以使用這個參數來設定 _custom_ 目錄
- `GOGS_WORK_DIR`： 已廢棄，請使用 `GITEA_WORK_DIR` 替代
- `GOGS_CUSTOM`： 已廢棄，請使用 `GITEA_CUSTOM` 替代

## 操作系統設定

- `USER`：Gitea 運行時使用的系統使用者，它將作為一些 repository 的訪問地址的一部分
- `USERNAME`： 如果沒有設定 `USER`， Gitea 將使用 `USERNAME`
- `HOME`： 使用者的 home 目錄，在 Windows 中會使用 `USERPROFILE` 環境變量

### 僅限於 Windows 的設定

- `USERPROFILE`： 使用者的主目錄，如果未設定則會使用 `HOMEDRIVE` + `HOMEPATH`
- `HOMEDRIVE`: 用於訪問 home 目錄的主驅動器路徑（C 盤）
- `HOMEPATH`：在指定主驅動器下的 home 目錄相對路徑

## Miscellaneous

- `SKIP_MINWINSVC`：如果設定為 1，在 Windows 上不會以 service 的形式運行。
