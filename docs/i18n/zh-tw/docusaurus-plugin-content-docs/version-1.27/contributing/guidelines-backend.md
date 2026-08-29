---
date: "2023-05-25T23:41:00+08:00"
slug: "guidelines-backend"
sidebar_position: 20
aliases:
  - /zh-tw/guidelines-backend
---

# 後端開發指南

## 背景

Gitea 使用 Golang 作為後端編程語言。它使用了許多第三方包，並且自己也編寫了一些包。
例如，Gitea 使用[Chi](https://github.com/go-chi/chi)作為基本的 Web 框架。[Xorm](https://xorm.io)是一個用於與資料庫交互的 ORM 框架。
因此，管理這些包非常重要。在開始編寫後端程式碼之前，請參考以下準則。

## 包設計準則

### 包列表

為了保持易於理解的程式碼並避免循環依賴，擁有良好的程式碼結構是很重要的。Gitea 後端分為以下幾個部分：

- `build`：幫助構建 Gitea 的腳本。
- `cmd`：包含所有 Gitea 的實際子命令，包括 web、doctor、serv、hooks、admin 等。`web`將啟動 Web 服務。`serv`和`hooks`將被 Git 或 OpenSSH 調用。其他子命令可以幫助維護 Gitea。
- `tests`：常用的測試函數
- `tests/integration`：整合測試，用於測試後端迴歸。
- `tests/e2e`：端到端測試，用於測試前端和後端的相容性和視覺迴歸。
- `models`：包含由 xorm 用於構建資料庫表的資料結構。它還包含查詢和更新資料庫的函數。應避免與其他 Gitea 程式碼的依賴關係。在某些情況下，比如日誌記錄時可以例外。
  - `models/db`：基本的資料庫操作。所有其他`models/xxx`包都應依賴於此包。`GetEngine`函數只能從 models/中調用。
  - `models/fixtures`：單元測試和整合測試中使用的範例資料。一個`yml`文件表示一個將在測試開始時加載到資料庫中的表。
  - `models/migrations`：儲存不同版本之間的資料庫遷移。修改資料庫結構的 PR**必須**包含一個遷移步驟。
- `modules`：在 Gitea 中處理特定功能的不同模組。工作正在進行中：其中一些模組應該移到`services`中，特別是那些依賴於 models 的模組，因為它們依賴於資料庫。
  - `modules/setting`：儲存從 ini 文件中讀取的所有系統設定，並在各處引用。但是在可能的情況下，應將其作為函數參數使用。
  - `modules/git`：用於與`Git`命令行或 Gogit 包交互的包。
- `public`：編譯後的前端文件（JavaScript、圖像、CSS 等）
- `routers`：處理伺服器請求。由於它使用其他 Gitea 包來處理請求，因此其他包（models、modules 或 services）不能依賴於 routers。
  - `routers/api`：包含`/api/v1`相關路由，用於處理 RESTful API 請求。
  - `routers/install`：只能在系統處於安裝模式（INSTALL_LOCK=false）時響應。
  - `routers/private`：僅由內部子命令調用，特別是`serv`和`hooks`。
  - `routers/web`：處理來自 Web 瀏覽器或 Git SMART HTTP 協議的 HTTP 請求。
- `services`：用於常見路由操作或命令執行的支援函數。使用`models`和`modules`來處理請求。
- `templates`：用於生成 HTML 輸出的 Golang 模板。

### 包依賴關係

由於 Golang 不支援導入循環，我們必須仔細決定包之間的依賴關係。這些包之間有一些級別。以下是理想的包依賴關係方向。

`cmd` -> `routers` -> `services` -> `models` -> `modules`

從左到右，左側的包可以依賴於右側的包，但右側的包不能依賴於左側的包。在同一級別的子包中，可以根據該級別的規則進行依賴。

**注意事項**

為什麼我們需要在`models`之外使用資料庫事務？以及如何使用？
某些操作在資料庫記錄插入/更新/刪除失敗時應該允許回滾。
因此，服務必須能夠建立資料庫事務。以下是一些範例：

```go
// services/repository/repository.go
func CreateXXXX() error {
    return db.WithTx(func(ctx context.Context) error {
        // do something, if err is returned, it will rollback automatically
        if err := issues.UpdateIssue(ctx, repoID); err != nil {
            // ...
            return err
        }
        // ...
        return nil
    })
}
```

在`services`中**不應該**直接使用`db.GetEngine(ctx)`，而是應該在`models/`下編寫一個函數。
如果該函數將在事務中使用，請將`context.Context`作為函數的第一個參數。

```go
// models/issues/issue.go
func UpdateIssue(ctx context.Context, repoID int64) error {
    e := db.GetEngine(ctx)

    // ...
}
```

### 包名稱

對於頂層包，請使用複數作為包名，例如`services`、`models`，對於子包，請使用單數，例如`services/user`、`models/repository`。

### 導入別名

由於有一些使用相同包名的包，例如`modules/user`、`models/user`和`services/user`，當這些包在一個 Go 文件中被導入時，很難知道我們使用的是哪個包以及它是變量名還是導入名。因此，我們始終建議使用導入別名。為了與常見的駝峰命名法的包變量區分開，建議使用**snake_case**作為導入別名的命名規則。
例如：`import user_service "code.gitea.io/gitea/services/user"`

### 重要注意事項

- 永遠不要寫成`x.Update(exemplar)`，而沒有明確的`WHERE`子句：
  - 這將導致表中的所有行都被使用 exemplar 的非零值進行更新，包括 ID。
  - 通常應該寫成`x.ID(id).Update(exemplar)`。
- 如果在遷移過程中使用`x.Insert(exemplar)`向表中插入記錄，而 ID 是預設的：
  - 對於 MSSQL 變體，你將需要執行`` SET IDENTITY_INSERT `table` ON ``（否則遷移將失敗）
  - 對於 PostgreSQL，你還需要更新 ID 序列，否則遷移將悄無聲息地通過，但後續的插入將失敗：
    `` SELECT setval('table_name_id_seq', COALESCE((SELECT MAX(id)+1 FROM `table_name`), 1), false) ``

### 未來的任務

目前，我們正在進行一些重構，以完成以下任務：

- 糾正不符合規則的程式碼。
- `models`中的文件太多了，所以我們正在將其中的一些移動到子包`models/xxx`中。
- 由於它們依賴於`models`，因此應將某些`modules`子包移動到`services`中。
