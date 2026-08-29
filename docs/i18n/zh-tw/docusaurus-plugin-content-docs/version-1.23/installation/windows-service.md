---
date: "2016-12-21T15:00:00-02:00"
slug: "windows-service"
sidebar_position: 50
aliases:
  - /zh-tw/windows-service
---

# 註冊為 Windows 服務

## 先決條件

在 C:\gitea\custom\conf\app.ini 中進行以下更改：

```ini title="app.ini"
RUN_USER = COMPUTERNAME$
```

將 Gitea 設定為以本地系統使用者身份運行。

COMPUTERNAME 是命令行中 `echo %COMPUTERNAME%` 的響應。如果響應是 `USER-PC`，則 `RUN_USER = USER-PC$`

### 使用絕對路徑

如果您使用 SQLite3，請更改 `PATH` 以包含完整路徑：

```ini title="app.ini"
[database]
PATH     = c:/gitea/data/gitea.db
```

## 註冊 Gitea

要將 Gitea 註冊為 Windows 服務，請以管理員身份打開命令提示符 (cmd)，
然後運行以下命令：

```sh
sc.exe create gitea start= auto binPath= "\"C:\gitea\gitea.exe\" web --config \"C:\gitea\custom\conf\app.ini\""
```

不要忘記將 `C:\gitea` 替換為正確的 Gitea 目錄。

打開“Windows 服務”，搜索名為“gitea”的服務，右鍵單擊它並單擊
“運行”。如果一切正常，Gitea 將在 `http://localhost:3000`（或設定的端口）上可訪問。

### 服務啟動類型

觀察到在加載系統期間啟動時，Gitea 服務可能會在 Windows 事件日誌中記錄超時並且無法啟動。
在這種情況下，將啟動類型更改為“自動延遲”。這可以在服務建立期間完成，也可以透過運行設定命令完成

```sh
sc.exe config gitea start= delayed-auto
```

### 添加啟動依賴項

要向 Gitea Windows 服務添加啟動依賴項（例如 Mysql、Mariadb），請以管理員身份運行以下命令：

```sh
sc.exe config gitea depend= mariadb
```

這將確保當 Windows 機器重新啟動時，Gitea 的自動啟動將推遲到資料庫準備就緒，從而減少啟動失敗。

## 註銷 Gitea

要將 Gitea 註銷為 Windows 服務，請以管理員身份打開命令提示符 (cmd) 並運行：

```sh
sc.exe delete gitea
```
