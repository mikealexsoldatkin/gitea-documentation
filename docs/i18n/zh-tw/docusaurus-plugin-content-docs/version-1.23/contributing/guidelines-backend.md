---
date: "2021-11-01T23:41:00+08:00"
slug: "guidelines-backend"
sidebar_position: 20
aliases:
  - /zh-tw/guidelines-backend
---

# 後端開發指南

## 背景

Gitea 使用 Golang 作為後端程式語言。它使用了許多第三方套件，也自己寫了一些。
例如，Gitea 使用 [Chi](https://github.com/go-chi/chi) 作為基本的網頁框架。[Xorm](https://xorm.io) 是一個 ORM 框架，用來與資料庫互動。
因此，管理這些套件非常重要。在開始寫後端程式碼之前，請遵循以下指南。

## 套件設計指南

### 套件列表

為了保持程式碼的可理解性並避免循環依賴，擁有良好的程式碼結構非常重要。Gitea 的後端分為以下幾個部分：

- `build`: 幫助構建 Gitea 的腳本。
- `cmd`: 所有 Gitea 的實際子命令，包括 web、doctor、serv、hooks、admin 等等。`web` 會啟動網頁服務。`serv` 和 `hooks` 會被 Git 或 OpenSSH 調用。其他子命令可以幫助維護 Gitea。
- `tests`: 常見的測試工具函數
  - `tests/integration`: 整合測試，用來測試後端的回歸
  - `tests/e2e`: 端到端測試，用來測試前端和後端的相容性和視覺回歸。
- `models`: 包含由 xorm 用來構建資料庫表格的資料結構。它也包含查詢和更新資料庫的函數。應避免依賴其他 Gitea 程式碼。可以在某些情況下例外，例如記錄。
  - `models/db`: 基本的資料庫操作。所有其他 `models/xxx` 套件應依賴此套件。`GetEngine` 函數應僅從 `models/` 調用。
  - `models/fixtures`: 單元測試和整合測試中使用的樣本資料。一個 `yml` 文件代表一個表格，測試開始時會將其載入資料庫。
  - `models/migrations`: 儲存版本之間的資料庫遷移。更改資料庫結構的 PR **必須** 也有遷移步驟。
- `modules`: 處理 Gitea 中特定功能的不同模組。進行中：其中一些應移動到 `services`，特別是那些依賴於 models 的，因為它們依賴於資料庫。
  - `modules/setting`: 儲存從 ini 文件讀取的所有系統設定，並已被各處引用。但應盡可能作為函數參數使用。
  - `modules/git`: 與 `Git` 命令行或 Gogit 套件互動的套件。
- `public`: 編譯後的前端文件（javascript、圖片、css 等）。
- `routers`: 處理伺服器請求。由於它使用其他 Gitea 套件來處理請求，其他套件（models、modules 或 services）不得依賴 routers。
  - `routers/api` 包含處理 RESTful API 請求的 `/api/v1` 路由。
  - `routers/install` 僅在系統處於安裝模式（INSTALL_LOCK=false）時響應。
  - `routers/private` 只會被內部子命令調用，特別是 `serv` 和 `hooks`。
  - `routers/web` 會處理來自網頁瀏覽器或 Git SMART HTTP 協議的 HTTP 請求。
- `services`: 支援常見路由操作或命令執行的函數。使用 `models` 和 `modules` 來處理請求。
- `templates`: 用於生成 html 輸出的 Golang 模板。

### 套件依賴

由於 Golang 不支援導入循環，我們必須仔細決定套件依賴關係。這些套件之間有一些層次。以下是理想的套件依賴方向。

`cmd` -> `routers` -> `services` -> `models` -> `modules`

從左到右，左邊的套件可以依賴右邊的套件，但右邊的套件不得依賴左邊的套件。同一層次的子套件可以根據該層次的規則依賴。

:::warning
為什麼我們需要在 `models` 之外的資料庫交易？以及如何實現？
某些操作應允許在資料庫記錄插入/更新/刪除失敗時回滾。
因此，services 必須允許建立資料庫交易。這裡有一些例子，

```go
// services/repository/repository.go
func CreateXXXX() error {
    return db.WithTx(func(ctx context.Context) error {
        // 做一些事情，如果返回錯誤，它會自動回滾
        if err := issues.UpdateIssue(ctx, repoID); err != nil {
            // ...
            return err
        }
        // ...
        return nil
    })
}
```

你不應該在 `services` 中直接使用 `db.GetEngine(ctx)`，而是應該在 `models/` 下寫一個函數。
如果該函數將在交易中使用，只需將 `context.Context` 作為該函數的第一個參數。

```go
// models/issues/issue.go
func UpdateIssue(ctx context.Context, repoID int64) error {
    e := db.GetEngine(ctx)

    // ...
}
```

:::

### 套件名稱

對於頂層套件，使用複數作為套件名稱，即 `services`、`models`，對於子套件，使用單數，
即 `services/user`、`models/repository`。

### 導入別名

由於有些套件使用相同的套件名稱，可能會發現像 `modules/user`、`models/user` 和 `services/user` 這樣的套件。
當這些套件在一個 Go 文件中導入時，很難知道我們使用的是哪個套件，以及它是變量名還是導入名。因此，我們總是建議使用導入別名。為了區分常見的駝峰式變量名，只需使用 **snake_case** 作為導入別名。
即 `import user_service "code.gitea.io/gitea/services/user"`

### 實現 `io.Closer`

如果一種類型實現了 `io.Closer`，多次調用 `Close` 不應失敗或 `panic`，而是返回錯誤或 `nil`。

### 重要注意事項

- 永遠不要在沒有明確 `WHERE` 子句的情況下寫 `x.Update(exemplar)`：
  - 這會導致表中的所有行都被更新為 exemplar 的非零值 - 包括 ID。
  - 你通常應該寫 `x.ID(id).Update(exemplar)`。
- 如果在遷移期間你正在插入一個預設 ID 的表格，使用 `x.Insert(exemplar)`：
  - 對於 MSSQL 變體，你需要 `` SET IDENTITY_INSERT `table` ON ``（否則遷移會失敗）
  - 但是，你還需要更新 postgres 的 id 序列 - 遷移會在這裡默默通過，但後來的插入會失敗：
    `` SELECT setval('table_name_id_seq', COALESCE((SELECT MAX(id)+1 FROM `table_name`), 1), false) ``

### 未來任務

目前，我們正在進行一些重構，以完成以下事情：

- 修正不符合規則的程式碼。
- `models` 中的文件太多了，所以我們正在將其中一些移動到子套件 `models/xxx`。
- 一些 `modules` 子套件應移動到 `services`，因為它們依賴於 `models`。
