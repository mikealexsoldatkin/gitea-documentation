---
date: "2018-05-21T15:00:00+00:00"
slug: "support"
sidebar_position: 20
aliases:
  - /zh-tw/seek-help
---

# 支援選項

- [付費商業支援](https://about.gitea.com/)
- [Discord](https://discord.gg/Gitea)
- [論壇](https://forum.gitea.com/)
- [Matrix](https://matrix.to/#/#gitea-space:matrix.org)
  - 注意：大多數 Matrix 頻道與其在 Discord 中的對應頻道橋接，可能會在橋接過程中出現一些不穩定的情況。
- 中文支援
  - [Discourse 中文分類](https://forum.gitea.com/c/5-category/5)
  - QQ 群 328432459

# 錯誤報告

如果您發現錯誤，請[在 GitHub 上建立問題](https://github.com/go-gitea/gitea/issues)。

:::note
尋求支援時，最好準備以下資訊，以便幫助您的人擁有所有需要的資訊：
:::

1. 您的 `app.ini`（必要時刪除任何敏感資料）。
2. 您看到的任何錯誤消息。
3. Gitea 日誌以及與情況相關的所有其他日誌。
   - 收集 `trace` / `debug` 級別的日誌更有用（請參閱下一節）。
   - 使用 systemd 時，使用 `journalctl --lines 1000 --unit gitea` 收集日誌。
   - 使用 docker 時，使用 `docker logs --tail 1000 <gitea-container>` 收集日誌。
4. 可重現的步驟，以便其他人可以更快、更輕鬆地重現和理解問題。
   - 可以使用 [demo.gitea.com](https://demo.gitea.com) 重現問題。
5. 如果您遇到緩慢/掛起/死鎖問題，請在問題發生時報告堆棧跟蹤。
   轉到“網站管理” -> “監控” -> “堆棧跟蹤” -> “下載診斷報告”。

# 高級錯誤報告提示

## 更多日誌設定選項

預設情況下，日誌輸出到控制檯，級別為 `info`。
如果您需要設定日誌級別和/或從文件中收集日誌，
您可以將以下設定複製到您的 `app.ini`（刪除所有其他 `[log]` 部分），
然後您將在 Gitea 的日誌目錄（預設：`%(GITEA_WORK_DIR)/log`）中找到 `*.log` 文件。

```ini
; 要顯示所有 SQL 日誌，您還可以在 [database] 部分中設置 LOG_SQL=true
[log]
LEVEL=debug
MODE=console,file
```

## 通過命令行收集堆棧跟蹤

Gitea 可以使用 Golang 的 pprof 處理程式和工具鏈來收集堆棧跟蹤和其他運行時資訊。

如果 Web UI 停止工作，您可以嘗試通過命令行收集堆棧跟蹤：

1. 設定 `app.ini`：

   ```
   [server]
   ENABLE_PPROF = true
   ```

2. 重啟 Gitea

3. 嘗試觸發錯誤，當請求卡住一段時間時，
   使用 `curl` 或瀏覽器訪問：`http://127.0.0.1:6060/debug/pprof/goroutine?debug=1` 獲取堆棧跟蹤。
