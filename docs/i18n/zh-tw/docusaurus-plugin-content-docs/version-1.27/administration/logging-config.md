---
date: "2023-05-23T09:00:00+08:00"
slug: "logging-config"
sidebar_position: 40
aliases:
  - /zh-tw/logging-configuration
---

# 日誌設定

Gitea 的日誌設定主要由以下三種類型的元件組成：

- `[log]` 部分用於一般設定
- `[log.<mode-name>]` 部分用於設定不同的日誌輸出方式，也稱為 "writer mode"，模式名稱同時也作為 "writer name"
- `[log]` 部分還可以包含遵循 `logger.<logger-name>.<CONFIG-KEY>` 模式的子日誌記錄器的設定

預設情況下，已經有一個完全功能的日誌輸出，因此不需要重新定義。

## 收集日誌以獲取幫助

要收集日誌以獲取幫助和報告問題，請參閱 [需要幫助](help/support.md)。

## `[log]` 部分

在 Gitea 中，日誌設施的設定在 `[log]` 部分及其子部分。

在頂層的 `[log]` 部分，可以放置以下設定項：

- `ROOT_PATH`：（預設值：**%(GITEA_WORK_DIR)/log**）：日誌文件的基本路徑。
- `MODE`：（預設值：**console**）：要用於預設日誌記錄器的日誌輸出列表。
- `LEVEL`：（預設值：**Info**）：要持久化的最嚴重的日誌事件，不區分大小寫。可能的值為：`Trace`、`Debug`、`Info`、`Warn`、`Error`、`Fatal`。
- `STACKTRACE_LEVEL`：（預設值：**None**）：對於此類及更嚴重的事件，將在記錄時打印堆棧跟蹤。

它還可以包含以下子日誌記錄器：

- `logger.router.MODE`：（預設值：**,**）：用於路由器日誌記錄器的日誌輸出列表。
- `logger.access.MODE`：（預設值：**_empty_**）：用於訪問日誌記錄器的日誌輸出列表。預設情況下，訪問日誌記錄器被禁用。
- `logger.xorm.MODE`：（預設值：**,**）：用於 XORM 日誌記錄器的日誌輸出列表。

將子日誌記錄器的模式設定為逗號（`,`）表示使用預設的全域 `MODE`。

## 快速範例

### 預設（空）設定

空設定等同於預設設定：

```ini
[log]
ROOT_PATH = %(GITEA_WORK_DIR)/log
MODE = console
LEVEL = Info
STACKTRACE_LEVEL = None
logger.router.MODE = ,
logger.xorm.MODE = ,
logger.access.MODE =

; 這是“控制檯”模式的配置選項（由上面的 MODE=console 使用）
[log.console]
MODE = console
FLAGS = stdflags
PREFIX =
COLORIZE = true
```

這等同於將所有日誌發送到控制檯，並將預設的 Golang 日誌也發送到控制檯日誌中。

這只是一個範例，預設情況下不需要將其寫入設定文件中。

### 禁用路由日誌並將一些訪問日誌記錄到文件中

禁用路由日誌，將訪問日誌（>=Warn）記錄到 `access.log` 中：

```ini
[log]
logger.router.MODE =
logger.access.MODE = access-file

[log.access-file]
MODE = file
LEVEL = Warn
FILE_NAME = access.log
```

### 為不同的模式設定不同的日誌級別

將預設日誌（>=Warn）記錄到 `gitea.log` 中，將錯誤日誌記錄到 `file-error.log` 中：

```ini
[log]
LEVEL = Warn
MODE = file, file-error

; 默認情況下，"file" 模式會將日誌記錄到 %(log.ROOT_PATH)/gitea.log，因此我們不需要設置它
; [log.file]

[log.file-error]
LEVEL = Error
FILE_NAME = file-error.log
```

## 日誌輸出（模式和寫入器）

Gitea 提供以下日誌寫入器：

- `console` - 輸出日誌到 `stdout`（或 `stderr`，如果已在設定中設定）
- `file` - 輸出日誌到文件
- `conn` - 輸出日誌到套接字（網路或 Unix 套接字）

### 公共設定

某些設定適用於所有日誌輸出模式：

- `MODE` 是日誌輸出寫入器的模式。它將預設為 ini 部分的模式名稱。因此，`[log.console]` 將預設為 `MODE = console`。
- `LEVEL` 是此輸出將記錄的最低日誌級別。
- `STACKTRACE_LEVEL` 是此輸出將打印堆棧跟蹤的最低日誌級別。
- `COLORIZE` 對於 `console`，預設為 `true`，否則預設為 `false`。

#### `EXPRESSION`

`EXPRESSION` 表示日誌事件必須匹配才能被輸出寫入器記錄的正則表達式。
日誌消息（去除顏色）或 `longfilename:linenumber:functionname` 必須匹配其中之一。
注意：整個消息或字符串不需要完全匹配。

請注意，此表達式將在寫入器的 goroutine 中運行，而不是在日誌事件的 goroutine 中運行。

#### `FLAGS`

`FLAGS` 表示在每條消息之前打印的前置日誌上下文資訊。
它是一個逗號分隔的字符串集。值的順序無關緊要。

預設值為 `stdflags`（= `date,time,medfile,shortfuncname,levelinitial`）。

可能的值為：

- `none` 或 `,` - 無標誌。
- `date` - 當地時區的日期：`2009/01/23`。
- `time` - 當地時區的時間：`01:23:23`。
- `microseconds` - 微秒精度：`01:23:23.123123`。假定有時間。
- `longfile` - 完整的文件名和行號：`/a/b/c/d.go:23`。
- `shortfile` - 文件名的最後一個部分和行號：`d.go:23`。
- `funcname` - 調用者的函數名：`runtime.Caller()`。
- `shortfuncname` - 函數名的最後一部分。覆蓋 `funcname`。
- `utc` - 如果設定了日期或時間，則使用 UTC 而不是本地時區。
- `levelinitial` - 提供的級別的初始字符，放在方括號內，例如 `[I]` 表示 info。
- `level` - 在方括號內的級別，例如 `[INFO]`。
- `gopid` - 上下文的 Goroutine-PID。
- `medfile` - 文件名的最後 20 個字符 - 相當於 `shortfile,longfile`。
- `stdflags` - 相當於 `date,time,medfile,shortfuncname,levelinitial`。

### Console 模式

在此模式下，日誌記錄器將將日誌消息轉發到 Gitea 進程附加的 stdout 和 stderr 流。

對於 console 模式的日誌記錄器，如果不在 Windows 上，或者 Windows 終端可以設定為 ANSI 模式，或者是 cygwin 或 Msys 管道，則 `COLORIZE` 預設為 `true`。

設定：

- `STDERR`：**false**：日誌記錄器是否應將日誌打印到 `stderr` 而不是 `stdout`。

### File 模式

在此模式下，日誌記錄器將將日誌消息保存到文件中。

設定：

- `FILE_NAME`：要將日誌事件寫入的文件，相對於 `ROOT_PATH`，預設為 `%(ROOT_PATH)/gitea.log`。異常情況：訪問日誌預設為 `%(ROOT_PATH)/access.log`。
- `MAX_SIZE_SHIFT`：**28**：單個文件的最大大小位移。28 表示 256Mb。詳細資訊見下文。
- `LOG_ROTATE` **true**：是否輪轉日誌文件。
- `DAILY_ROTATE`：**true**：是否每天旋轉日誌。
- `MAX_DAYS`：**7**：在此天數之後刪除旋轉的日誌文件。
- `COMPRESS`：**true**：預設情況下是否使用 gzip 壓縮舊的日誌文件。
- `COMPRESSION_LEVEL`：**-1**：壓縮級別。詳細資訊見下文。

`MAX_SIZE_SHIFT` 通過將給定次數左移 1 (`1 << x`) 來定義文件的最大大小。
在 v1.17.3 版本時的確切行為可以在[這裡](https://github.com/go-gitea/gitea/blob/v1.17.3/modules/setting/log.go#L185)中查看。

`COMPRESSION_LEVEL` 的有用值範圍從 1 到（包括）9，其中較高的數字表示更好的壓縮。
請注意，更好的壓縮可能會帶來更高的資源使用。
必須在前面加上 `-` 符號。

### Conn 模式

在此模式下，日誌記錄器將通過網路套接字發送日誌消息。

設定：

- `ADDR`：**:7020**：設定要連接的地址。
- `PROTOCOL`：**tcp**：設定協議，可以是 "tcp"、"unix" 或 "udp"。
- `RECONNECT`：**false**：在連接丟失時嘗試重新連接。
- `RECONNECT_ON_MSG`：**false**：為每條消息重新連接主機。

### "Router" 日誌記錄器

當 Gitea 的路由處理程式工作時，Router 日誌記錄器記錄以下消息類型：

- `started` 消息將以 TRACE 級別記錄
- `polling`/`completed` 路由將以 INFO 級別記錄。異常情況："/assets" 靜態資源請求也會以 TRACE 級別記錄。
- `slow` 路由將以 WARN 級別記錄
- `failed` 路由將以 WARN 級別記錄

### "XORM" 日誌記錄器

為了使 XORM 輸出 SQL 日誌，還應將 `[database]` 部分中的 `LOG_SQL` 設定為 `true`。

### "Access" 日誌記錄器

"Access" 日誌記錄器是自 Gitea 1.9 版本以來的新日誌記錄器。它提供了符合 NCSA Common Log 標準的日誌格式。雖然它具有高度可設定性，但在更改其模板時應謹慎。此日誌記錄器的主要好處是，Gitea 現在可以使用標準日誌格式記錄訪問日誌，因此可以使用標準工具進行分析。

您可以透過使用 `logger.access.MODE = ...` 來啟用此日誌記錄器。

如果需要，可以透過更改 `ACCESS_LOG_TEMPLATE` 的值來更改 "Access" 日誌記錄器的格式。

請注意，訪問日誌記錄器將以 `INFO` 級別記錄，將此日誌記錄器的 `LEVEL` 設定為 `WARN` 或更高級別將導致不記錄訪問日誌。

#### ACCESS_LOG_TEMPLATE

此值表示一個 Go 模板。其預設值為

```tmpl
{{.Ctx.RemoteHost}} - {{.Identity}} {{.Start.Format "[02/Jan/2006:15:04:05 -0700]" }} "{{.Ctx.Req.Method}} {{.Ctx.Req.URL.RequestURI}} {{.Ctx.Req.Proto}}" {{.ResponseWriter.Status}} {{.ResponseWriter.Size}} "{{.Ctx.Req.Referer}}" "{{.Ctx.Req.UserAgent}}"`
```

模板接收以下選項：

- `Ctx` 是 `context.Context`
- `Identity` 是 `SignedUserName`，如果使用者未登入，則為 "-"
- `Start` 是請求的開始時間
- `ResponseWriter` 是 `http.ResponseWriter`

更改此模板時必須小心，因為它在標準的 panic 恢復陷阱之外運行。此模板應該儘可能簡單，因為它會為每個請求運行一次。

## 釋放和重新打開、暫停和恢復日誌記錄

如果您在 Unix 上運行，您可能希望釋放和重新打開日誌以使用 `logrotate` 或其他工具。
可以透過向運行中的進程發送 `SIGUSR1` 信號或運行 `gitea manager logging release-and-reopen` 命令來強制 Gitea 釋放並重新打開其日誌文件和連接。

或者，您可能希望暫停和恢復日誌記錄 - 可以透過使用 `gitea manager logging pause` 和 `gitea manager logging resume` 命令來實現。請注意，當日志記錄暫停時，低於 INFO 級別的日誌事件將不會儲存，並且只會儲存有限數量的事件。在暫停時，日誌記錄可能會阻塞，儘管是暫時性的，但會大大減慢 Gitea 的運行速度，因此建議僅暫停很短的時間。

### 在 Gitea 運行時添加和刪除日誌記錄

可以使用 `gitea manager logging add` 和 `remove` 子命令在 Gitea 運行時添加和刪除日誌記錄。
此功能只能調整正在運行的日誌系統，不能用於啟動未初始化的訪問或路由日誌記錄器。如果您希望啟動這些系統，建議調整 app.ini 並（優雅地）重新啟動 Gitea 服務。

這些命令的主要目的是在運行中的系統上輕鬆添加臨時日誌記錄器，以便調查問題，因為重新啟動可能會導致問題消失。

## 使用 `logrotate` 而不是內置的日誌輪轉

Gitea 包含內置的日誌輪轉功能，對於大多數部署來說應該已經足夠了。但是，如果您想使用 `logrotate` 工具：

- 在 `app.ini` 中將 `LOG_ROTATE` 設定為 `false`，禁用內置的日誌輪轉。
- 安裝 `logrotate`。
- 根據部署要求設定 `logrotate`，有關設定語法細節，請參閱 `man 8 logrotate`。
  在 `postrotate/endscript` 塊中通過 `kill -USR1` 或 `kill -10` 向 `gitea` 進程本身發送 `USR1` 信號，
  或者運行 `gitea manager logging release-and-reopen`（使用適當的環境設定）。
  確保設定適用於由 Gitea 日誌記錄器生成的所有文件，如上述部分所述。
- 始終使用 `logrotate /etc/logrotate.conf --debug` 來測試您的設定。
- 如果您正在使用 Docker 並從容器外部運行，您可以使用
  `docker exec -u $OS_USER $CONTAINER_NAME sh -c 'gitea manager logging release-and-reopen'`
  或 `docker exec $CONTAINER_NAME sh -c '/bin/s6-svc -1 /etc/s6/gitea/'`，或直接向 Gitea 進程本身發送 `USR1` 信號。

下一個 `logrotate` 作業將包括您的設定，因此不需要重新啟動。
您還可以立即使用 `logrotate /etc/logrotate.conf --force` 重新加載 `logrotate`。
