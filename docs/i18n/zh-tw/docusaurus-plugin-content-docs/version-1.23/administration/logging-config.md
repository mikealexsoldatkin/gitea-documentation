---
date: "2019-04-02T17:06:00+01:00"
slug: "logging-config"
sidebar_position: 40
aliases:
  - /zh-tw/logging-configuration
---

# 日誌設定

Gitea 的日誌設定主要包括 3 種元件：

- `[log]` 部分用於一般設定
- `[log.<mode-name>]` 部分用於設定不同的日誌寫入器以輸出日誌，即：“寫入模式”，模式名稱也用作“寫入器名稱”。
- `[log]` 部分還可以包含子日誌記錄器設定，遵循鍵模式 `logger.<logger-name>.<CONFIG-KEY>`

預設情況下有一個功能齊全的日誌輸出，因此不需要定義一個。

## 收集日誌以獲取幫助

要收集日誌以獲取幫助和問題報告，請參閱 [支援選項](help/support.md)。

## `[log]` 部分

Gitea 中的日誌設施設定發生在 `[log]` 部分及其子部分中。

在頂級 `[log]` 部分中可以放置以下設定：

- `ROOT_PATH`：（預設：**%(GITEA_WORK_DIR)/log**）：日誌文件的基本路徑
- `MODE`：（預設：**console**）用於預設日誌記錄器的日誌輸出列表。
- `LEVEL`：（預設：**Info**）最不嚴重的日誌事件以持久化，大小寫不敏感。可能的值是：`Trace`、`Debug`、`Info`、`Warn`、`Error`、`Fatal`。
- `STACKTRACE_LEVEL`：（預設：**None**）對於此級別及更嚴重的事件，將在記錄時打印堆棧跟蹤。

它可以包含以下子日誌記錄器：

- `logger.router.MODE`：（預設：**,**）：用於路由器日誌記錄器的日誌輸出列表。
- `logger.access.MODE`：（預設：**_empty_**）用於訪問日誌記錄器的日誌輸出列表。預設情況下，訪問日誌記錄器被禁用。
- `logger.xorm.MODE`：（預設：**,**）用於 XORM 日誌記錄器的日誌輸出列表。

將逗號（`,`）設定為子日誌記錄器的模式意味著使其使用預設的全域 `MODE`。

## 快速範例

### 預設（空）設定

空設定等同於預設：

```ini
[log]
ROOT_PATH = %(GITEA_WORK_DIR)/log
MODE = console
LEVEL = Info
STACKTRACE_LEVEL = None
logger.router.MODE = ,
logger.xorm.MODE = ,
logger.access.MODE =

; 這是“console”模式的配置選項（上面由 MODE=console 使用）
[log.console]
MODE = console
FLAGS = stdflags
PREFIX =
COLORIZE = true
```

這等同於將所有日誌發送到控制檯，預設的 Golang 日誌也發送到控制檯日誌。

這只是範例，這是預設值，不需要將其寫入設定文件中。

### 禁用路由器日誌並將一些訪問日誌記錄到文件中

禁用路由器日誌記錄器，訪問日誌（>=Warn）進入 `access.log`：

```ini
[log]
logger.router.MODE =
logger.access.MODE = access-file

[log.access-file]
MODE = file
LEVEL = Warn
FILE_NAME = access.log
```

### 為不同模式設定不同的日誌級別

預設日誌（>=Warn）進入 `gitea.log`，而錯誤日誌進入 `file-error.log`：

```ini
[log]
LEVEL = Warn
MODE = file, file-error

; 默認情況下，“file”模式將記錄日誌到 %(log.ROOT_PATH)/gitea.log，因此我們不需要設置它
; [log.file]
; 默認情況下，MODE（實際上是此日誌記錄器的輸出寫入器）取自部分名稱，因此我們也不需要設置它
; MODE = file

[log.file-error]
MODE = file
LEVEL = Error
FILE_NAME = file-error.log
```

## 日誌輸出（模式和寫入器）

Gitea 提供以下日誌輸出寫入器：

- `console` - 日誌記錄到 `stdout`（或如果在設定中設定，則記錄到 `stderr`）
- `file` - 日誌記錄到文件
- `conn` - 日誌記錄到套接字（網路或 unix）

### 通用設定

某些設定對所有日誌輸出模式都是通用的：

- `MODE` 是日誌輸出寫入器的模式。它將預設為 ini 部分中的模式名稱。因此 `[log.console]` 將預設為 `MODE = console`。
- `LEVEL` 是此輸出的最低級別。
- `STACKTRACE_LEVEL` 是此輸出將打印堆棧跟蹤的最低級別。
- `COLORIZE` 將預設為 `true`，如描述的那樣，否則將預設為 `false`。

#### `EXPRESSION`

`EXPRESSION` 代表日誌事件必須匹配的正則表達式，以便由輸出寫入器記錄。
日誌消息（去除顏色）必須匹配，或者 `longfilename:linenumber:functionname` 必須匹配。
注意：整個消息或字符串不需要完全匹配。

請注意，此表達式將在寫入器的 goroutine 中運行，但不在日誌事件 goroutine 中運行。

#### `FLAGS`

`FLAGS` 代表在每條消息之前打印的前置日誌上下文資訊。它是一個逗號分隔的字符串集。值的順序無關緊要。

預設為 `stdflags`（= `date,time,medfile,shortfuncname,levelinitial`）

可能的值是：

- `none` 或 `,` - 無標誌。
- `date` - 當地時區的日期：`2009/01/23`。
- `time` - 當地時區的時間：`01:23:23`。
- `microseconds` - 微秒分辨率：`01:23:23.123123`。假設時間。
- `longfile` - 完整文件名和行號：`/a/b/c/d.go:23`。
- `shortfile` - 最後的文件名元素和行號：`d.go:23`。
- `funcname` - 調用者的函數名稱：`runtime.Caller()`。
- `shortfuncname` - 函數名稱的最後部分。覆蓋 `funcname`。
- `utc` - 如果設定了日期或時間，則使用 UTC 而不是當地時區。
- `levelinitial` - 括號中的提供級別的首字母，例如 `[I]` 表示資訊。
- `level` - 括號中的級別 `[INFO]`。
- `gopid` - 上下文的 Goroutine-PID。
- `medfile` - 文件名的最後 20 個字符 - 相當於 `shortfile,longfile`。
- `stdflags` - 相當於 `date,time,medfile,shortfuncname,levelinitial`。

### 控制檯模式

在此模式下，日誌記錄器將轉發日誌消息到附加到 Gitea 進程的 stdout 和 stderr 流。

對於控制檯模式的日誌記錄器，如果不是在 Windows 上，或者 Windows 終端可以設定為 ANSI 模式或是 cygwin 或 Msys 管道，則 `COLORIZE` 將預設為 `true`。

設定：

- `STDERR`：**false**：日誌記錄器是否應打印到 `stderr` 而不是 `stdout`。

### 文件模式

在此模式下，日誌記錄器將日誌消息保存到文件中。

設定：

- `FILE_NAME`：寫入日誌事件的文件，相對於 `ROOT_PATH`，預設為 `%(ROOT_PATH)/gitea.log`。例外：訪問日誌將預設為 `%(ROOT_PATH)/access.log`。
- `MAX_SIZE_SHIFT`：**28**：單個文件的最大大小移位。28 代表 256Mb。詳細資訊請參見下文。
- `LOG_ROTATE` **true**：是否旋轉日誌文件。TODO：如果為 false，是否會在每日旋轉時刪除，還是什麼都不做？。
- `DAILY_ROTATE`：**true**：是否每天旋轉日誌。
- `MAX_DAYS`：**7**：在此天數後刪除旋轉的日誌文件。
- `COMPRESS`：**true**：是否預設使用 gzip 壓縮舊日誌文件。
- `COMPRESSION_LEVEL`：**-1**：壓縮級別。詳細資訊請參見下文。

`MAX_SIZE_SHIFT` 定義了文件的最大大小，通過左移 1 給定的次數（`1 << x`）。
v1.17.3 時的確切行為可以在 [這裡](https://github.com/go-gitea/gitea/blob/v1.17.3/modules/setting/log.go#L185) 看到。

`COMPRESSION_LEVEL` 的有用值從 1（最佳速度）到 9（最佳壓縮）。也可以選擇 [DefaultCompression](https://pkg.go.dev/compress/gzip#pkg-constants)（-1）和 [HuffmanOnly](https://pkg.go.dev/compress/flate#HuffmanOnly)（-2）。
請注意，更好的壓縮可能會帶來更高的資源使用。

### 連接模式

在此模式下，日誌記錄器將通過網路套接字發送日誌消息。

設定：

- `ADDR`：**:7020**：設定要連接的地址。
- `PROTOCOL`：**tcp**：設定協議，可以是“tcp”、“unix”或“udp”。
- `RECONNECT`：**false**：連接丟失時嘗試重新連接。
- `RECONNECT_ON_MSG`：**false**：為每條消息重新連接主機。

### “路由器”日誌記錄器

當 Gitea 的路由處理程式工作時，路由器日誌記錄器記錄以下消息類型：

- `started` 消息將在 TRACE 級別記錄
- `polling`/`completed` 路由將在 INFO 級別記錄。例外：“/assets” 靜態資源請求也在 TRACE 級別記錄。
- `slow` 路由將在 WARN 級別記錄
- `failed` 路由將在 WARN 級別記錄

### “XORM”日誌記錄器

要使 XORM 輸出 SQL 日誌，應在 `[database]` 部分中將 `LOG_SQL` 設定為 `true`。

### “訪問”日誌記錄器

訪問日誌記錄器是 Gitea 1.9 以來的新日誌記錄器。它提供了符合 NCSA 通用日誌格式的日誌格式。它高度可設定，但更改其模板時應謹慎。此日誌記錄器的主要好處是 Gitea 現在可以以標準日誌格式記錄訪問，因此可以使用標準工具。

您可以使用 `logger.access.MODE = ...` 啟用此日誌記錄器。

如果需要，可以透過更改 `ACCESS_LOG_TEMPLATE` 的值來更改訪問日誌記錄器的格式。

請注意，訪問日誌記錄器將在 `INFO` 級別記錄，將此日誌記錄器的 `LEVEL` 設定為 `WARN` 或更高將導致沒有訪問日誌。

#### ACCESS_LOG_TEMPLATE

此值代表一個 go 模板。其預設值為

```tmpl
{{.Ctx.RemoteHost}} - {{.Identity}} {{.Start.Format "[02/Jan/2006:15:04:05 -0700]" }} "{{.Ctx.Req.Method}} {{.Ctx.Req.URL.RequestURI}} {{.Ctx.Req.Proto}}" {{.ResponseWriter.Status}} {{.ResponseWriter.Size}} "{{.Ctx.Req.Referer}}" "{{.Ctx.Req.UserAgent}}"`
```

模板傳遞以下選項：

- `Ctx` 是 `context.Context`
- `Identity` 是 `SignedUserName` 或 `"-"` 如果使用者未登入
- `Start` 是請求的開始時間
- `ResponseWriter` 是 `http.ResponseWriter`

更改此模板時必須謹慎，因為它在標準的恐慌恢復陷阱之外運行。模板應該盡可能簡單，因為它在每個請求中運行。

## 釋放和重新打開、暫停和恢復日誌記錄

如果您在 Unix 上運行，您可能希望釋放和重新打開日誌以使用 `logrotate` 或其他工具。
可以透過向運行的進程發送 `SIGUSR1`，或運行 `gitea manager logging release-and-reopen` 強制 Gitea 釋放並重新打開其日誌文件和連接。

或者，您可能希望暫停和恢復日誌記錄 - 這可以透過使用 `gitea manager logging pause` 和 `gitea manager logging resume` 命令來完成。請注意，暫停日誌記錄時，INFO 級別以下的日誌事件將不會儲存，僅儲存有限數量的事件。日誌記錄可能會暫時阻塞，暫停時會顯著減慢 Gitea 的速度 - 因此建議僅在非常短的時間內暫停。

## 在 Gitea 運行時添加和刪除日誌記錄

可以使用 `gitea manager logging add` 和 `remove` 子命令在 Gitea 運行時添加和刪除日誌記錄。
此功能只能調整運行中的日誌系統，無法用於啟動訪問或路由器日誌記錄器，如果它們尚未初始化。如果您希望啟動這些系統，建議調整 app.ini 並（優雅地）重新啟動 Gitea 服務。

這些命令的主要目的是在運行系統上輕鬆添加臨時日誌記錄器，以調查問題，重新啟動可能會導致問題消失。

## 使用 `logrotate` 而不是內置日誌輪換

Gitea 包含內置日誌輪換，這應該足以滿足大多數部署需求。但是，如果您希望使用 `logrotate` 實用程式：

- 通過在 `app.ini` 中將 `LOG_ROTATE` 設定為 `false` 禁用內置日誌輪換。
- 安裝 `logrotate`。
- 設定 `logrotate` 以匹配您的部署要求，請參閱 `man 8 logrotate` 以瞭解設定語法詳細資訊。
  在 `postrotate/endscript` 塊中，通過 `kill -USR1` 或 `kill -10` 向 `gitea` 進程本身發送 `USR1` 信號，或運行 `gitea manager logging release-and-reopen`（使用適當的環境）。
  確保您的設定適用於 Gitea 日誌記錄器發出的所有文件，如上述部分所述。
- 始終使用 `logrotate /etc/logrotate.conf --debug` 測試您的設定。
- 如果您使用 docker 並從容器外部運行，您可以使用
  `docker exec -u $OS_USER $CONTAINER_NAME sh -c 'gitea manager logging release-and-reopen'`
  或 `docker exec $CONTAINER_NAME sh -c '/bin/s6-svc -1 /etc/s6/gitea/'` 或直接向 Gitea 進程本身發送 `USR1`。

下一個 `logrotate` 任務將包括您的設定，因此不需要重新啟動。
您也可以使用 `logrotate /etc/logrotate.conf --force` 立即重新加載 `logrotate`。
