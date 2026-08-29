---
date: "2017-01-20T15:00:00+08:00"
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
  - 注意：大多數 Matrix 頻道都與 Discord 中的對應頻道橋接，可能在橋接過程中會出現一定程度的不穩定性。
- 中文支援
  - [Discourse 中文分類](https://forum.gitea.com/c/5-category/5)
  - QQ 群 328432459

# Bug 報告

如果您發現了 Bug，請在 GitHub 上 [建立一個問題](https://github.com/go-gitea/gitea/issues)。

**注意：** 在請求支援時，可能需要準備以下資訊，以便幫助者獲得所需的所有資訊：

1. 您的 `app.ini`（將任何敏感資料進行必要的清除）。
2. 您看到的任何錯誤消息。
3. Gitea 日誌以及與情況相關的所有其他日誌。
   - 收集 `trace` / `debug` 級別的日誌更有用（參見下一節）。
   - 在使用 systemd 時，使用 `journalctl --lines 1000 --unit gitea` 收集日誌。
   - 在使用 Docker 時，使用 `docker logs --tail 1000 <gitea-container>` 收集日誌。
4. 可重現的步驟，以便他人能夠更快速、更容易地重現和理解問題。
   - [demo.gitea.com](https://demo.gitea.com) 可用於重現問題。
5. 如果遇到慢速/掛起/死鎖等問題，請在出現問題時報告堆棧跟蹤。
   轉到 "Site Admin" -> "Monitoring" -> "Stacktrace" -> "Download diagnosis report"。

# 高級 Bug 報告提示

## 更多日誌的設定選項

預設情況下，日誌以 `info` 級別輸出到控制檯。
如果您需要設定日誌級別和/或從文件中收集日誌，
您只需將以下設定複製到您的 `app.ini` 中（刪除所有其他 `[log]` 部分），
然後您將在 Gitea 的日誌目錄中找到 `*.log` 文件（預設為 `%(GITEA_WORK_DIR)/log`）。

```ini
; 要顯示所有 SQL 日誌，您還可以在 [database] 部分中設置 LOG_SQL=true
[log]
LEVEL=debug
MODE=console,file
```

## 使用命令行收集堆棧跟蹤

Gitea 可以使用 Golang 的 pprof 處理程式和工具鏈來收集堆棧跟蹤和其他運行時資訊。

如果 Web UI 停止工作，您可以嘗試通過命令行收集堆棧跟蹤：

1. 設定 app.ini：

   ```
   [server]
   ENABLE_PPROF = true
   ```

2. 重新啟動 Gitea

3. 嘗試觸發 bug，當請求卡住一段時間，使用或瀏覽器訪問：獲取堆棧跟蹤。
   `curl http://127.0.0.1:6060/debug/pprof/goroutine?debug=1`
