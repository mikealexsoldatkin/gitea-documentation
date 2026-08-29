---
date: "2016-12-21T15:00:00-02:00"
slug: "windows-service"
sidebar_position: 50
aliases:
  - /zh-tw/windows-service
---

# 註冊為 Windows 服務

## 準備工作

在 C:\gitea\custom\conf\app.ini 中進行了以下更改：

```ini title="app.ini"
RUN_USER = COMPUTERNAME$
```

將 Gitea 設定為以本地系統使用者運行。

COMPUTERNAME 是從命令行中運行 `echo %COMPUTERNAME%` 後得到的響應。如果響應是 `USER-PC`，那麼 `RUN_USER = USER-PC$`。

### 使用絕對路徑

如果您使用 SQLite3，請將 `PATH` 更改為包含完整路徑：

```ini title="app.ini"
[database]
PATH     = c:/gitea/data/gitea.db
```

## 註冊為 Windows 服務

要註冊為 Windows 服務，首先以 Administrator 身份運行 `cmd`，然後執行以下命令：

```
sc.exe create gitea start= auto binPath= "\"C:\gitea\gitea.exe\" web --config \"C:\gitea\custom\conf\app.ini\""
```

別忘了將 `C:\gitea` 替換成你的 Gitea 安裝目錄。

之後在控制面板打開 "Windows Services"，搜索 "gitea"，右鍵選擇 "Run"。在瀏覽器打開 `http://localhost:3000` 就可以訪問了。（如果你修改了端口，請前往對應的端口，3000 是預設端口）。

### 服務啟動類型

據觀察，在啟動期間加載的系統上，Gitea 服務可能無法啟動，並在 Windows 事件日誌中記錄超時。
在這種情況下，將啟動類型更改為`Automatic-Delayed`。這可以在服務建立期間完成，或者通過運行設定命令來完成。

```
sc.exe config gitea start= delayed-auto
```

### 添加啟動依賴項

要將啟動依賴項添加到 Gitea Windows 服務（例如 Mysql、Mariadb），作為管理員，然後運行以下命令：

```
sc.exe config gitea depend= mariadb
```

這將確保在 Windows 計算機重新啟動時，將延遲自動啟動 Gitea，直到資料庫準備就緒，從而減少啟動失敗的情況。

## 從 Windows 服務中刪除

以 Administrator 身份運行 `cmd`，然後執行以下命令：

```
sc.exe delete gitea
```
