---
date: "2016-12-01T16:00:00+02:00"
slug: "hacking-on-gitea"
sidebar_position: 10
aliases:
  - /zh-tw/hacking-on-gitea
---

# Gitea 開發

## 快速開始

要快速建立一個可用的開發環境，你可以使用 Gitpod。

[![Open in Gitpod](/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/go-gitea/gitea)

## 安裝 Go

你應該[安裝 Go](https://go.dev/doc/install) 並正確設定你的 Go 環境。

接下來，[安裝 Node.js 和 npm](https://nodejs.org/en/download/)，這是構建 JavaScript 和 CSS 文件所需的。最低支援的 Node.js 版本是 @minNodeVersion@，建議使用最新的 LTS 版本。

:::note
當執行需要外部工具的 make 任務時，如 `make watch-backend`，Gitea 會自動下載並構建這些工具。要使用這些工具，你必須將 `"$GOPATH"/bin` 目錄添加到可執行路徑中。如果你不將 Go bin 目錄添加到可執行路徑中，你將需要自行管理這一點。
:::

:::note
需要 Go 版本 @minGoVersion@ 或更高版本。Gitea 使用 `gofmt` 來格式化源程式碼。然而，`gofmt` 的結果可能因 Go 的版本而異。因此，建議安裝我們持續整合運行的 Go 版本。截至最後更新，Go 版本應為 @goVersion@。
:::

要 lint 模板文件，請確保安裝 [Python](https://www.python.org/) 和 [Poetry](https://python-poetry.org/)。

## 安裝 Make

Gitea 大量使用 Make 來自動化任務並改進開發。這個指南涵蓋瞭如何安裝 Make。

### 在 Linux 上

使用套件管理器安裝。

在 Ubuntu/Debian 上：

```bash
sudo apt-get install make
```

在 Fedora/RHEL/CentOS 上：

```bash
sudo yum install make
```

### 在 Windows 上

以下三種 Make 發行版之一可以在 Windows 上運行：

- [單一二進制構建](http://www.equation.com/servlet/equation.cmd?fa=make)。複製到某處並添加到 `PATH`。
  - [32 位版本](http://www.equation.com/ftpdir/make/32/make.exe)
  - [64 位版本](http://www.equation.com/ftpdir/make/64/make.exe)
- [MinGW-w64](https://www.mingw-w64.org) / [MSYS2](https://www.msys2.org/)。
  - MSYS2 是一組工具和庫，為你提供了一個易於使用的環境，用於構建、安裝和運行本地 Windows 軟件，它包括 MinGW-w64。
  - 在 MingGW-w64 中，二進制文件稱為 `mingw32-make.exe` 而不是 `make.exe`。將 `bin` 文件夾添加到 `PATH`。
  - 在 MSYS2 中，你可以直接使用 `make`。請參閱 [MSYS2 Porting](https://www.msys2.org/wiki/Porting/)。
  - 要使用 CGO_ENABLED（例如：SQLite3）編譯 Gitea，你可能需要使用 [tdm-gcc](https://jmeubank.github.io/tdm-gcc/) 而不是 MSYS2 gcc，因為 MSYS2 gcc 標頭缺少一些僅限 Windows 的 CRT 函數，如 `_beginthread`。
- [Chocolatey 包](https://chocolatey.org/packages/make)。運行 `choco install make`

:::note
如果你嘗試使用 Windows 命令提示符構建，你可能會遇到問題。建議使用上述提示（Git bash 或 MinGW），但如果你只有命令提示符（或可能是 PowerShell），你可以使用 [set](https://docs.microsoft.com/zh-tw/windows-server/administration/windows-commands/set_1) 命令設定環境變量，例如 `set TAGS=bindata`。
:::

## 下載和克隆 Gitea 源程式碼

推薦的方法是使用 `git clone` 獲取源程式碼。

```bash
git clone https://github.com/go-gitea/gitea
```

（由於 go 模組的出現，不再需要從 `$GOPATH` 內構建 go 專案，因此不再推薦使用 `go get` 方法。）

## Fork Gitea

如上所述下載主要的 Gitea 源程式碼。然後，在 GitHub 上 fork [Gitea repository](https://github.com/go-gitea/gitea)，並將 git 遠程 origin 切換到你的 fork 或添加你的 fork 作為另一個遠程：

```bash
# 將原始 Gitea origin 重命名為 upstream
git remote rename origin upstream
git remote add origin "git@github.com:$GITHUB_USERNAME/gitea.git"
git fetch --all --prune
```

或：

```bash
# 為我們的 fork 添加新遠程
git remote add "$FORK_NAME" "git@github.com:$GITHUB_USERNAME/gitea.git"
git fetch --all --prune
```

為了能夠建立 pull request，fork 的儲存庫應該被添加為 Gitea 源程式碼的遠程。否則，無法推送更改。

## 構建 Gitea（基礎）

查看我們的[從源程式碼構建](installation/from-source.md)的[說明](installation/from-source.md)。

從源程式碼構建的最簡單推薦方法是：

```bash
TAGS="bindata sqlite sqlite_unlock_notify" make build
```

`build` 目標將執行 `frontend` 和 `backend` 子目標。如果存在 `bindata` 標籤，前端文件將被編譯到二進制文件中。建議在進行前端開發時省略該標籤，以便更改能夠反映出來。

查看 `make help` 以獲取所有可用的 `make` 目標。還可以查看 [`.drone.yml`](https://github.com/go-gitea/gitea/blob/main/.drone.yml) 瞭解我們的持續整合如何工作。

## 持續構建

要運行並在源文件更改時持續重建：

```bash
# 前端和後端
make watch

# 或：僅監視前端文件（html/js/css）
make watch-frontend

# 或：僅監視後端文件（go）
make watch-backend
```

在 macOS 上，監視所有後端源文件可能會達到預設的打開文件限制，可以透過 `ulimit -n 12288` 為當前 shell 或在你的 shell 啟動文件中為所有未來的 shell 增加此限制。

### 格式化、程式碼分析和拼寫檢查

我們的持續整合將拒絕未通過程式碼 linter（包括格式檢查、程式碼分析和拼寫檢查）的 PR。

你應該格式化你的程式碼：

```bash
make fmt
```

並 lint 源程式碼：

```bash
# lint 前端和後端代碼
make lint
# 僅 lint 後端代碼
make lint-backend
```

**注意**：`gofmt` 的結果取決於當前的 Go 版本。你應該運行與持續整合伺服器上相同版本的 Go，如上所述。

### 處理 JS 和 CSS

前端開發應遵循[前端開發指南](contributing/guidelines-frontend.md)

要使用前端資源構建，可以使用上述的 `watch-frontend` 目標或僅構建一次：

```bash
make build && ./gitea
```

在提交之前，確保 linter 通過：

```bash
make lint-frontend
```

### 設定本地 ElasticSearch 實例

使用 docker 啟動本地 ElasticSearch 實例：

```sh
mkdir -p $(pwd)/data/elasticsearch
sudo chown -R 1000:1000 $(pwd)/data/elasticsearch
docker run --rm --memory="4g" -p 127.0.0.1:9200:9200 -p 127.0.0.1:9300:9300 -e "discovery.type=single-node" -v "$(pwd)/data/elasticsearch:/usr/share/elasticsearch/data" docker.elastic.co/elasticsearch/elasticsearch:7.16.3
```

設定 `app.ini`：

```ini
[indexer]
ISSUE_INDEXER_TYPE = elasticsearch
ISSUE_INDEXER_CONN_STR = http://elastic:changeme@localhost:9200
REPO_INDEXER_ENABLED = true
REPO_INDEXER_TYPE = elasticsearch
REPO_INDEXER_CONN_STR = http://elastic:changeme@localhost:9200
```

### 構建和添加 SVG

SVG 圖標使用 `make svg` 目標構建，將圖標源編譯到輸出目錄 `public/assets/img/svg` 中。自訂圖標可以添加到 `web_src/svg` 目錄中。

### 構建 Logo

Gitea 標誌的 PNG 和 SVG 版本是從單個 SVG 源文件 `assets/logo.svg` 使用 `TAGS="gitea" make generate-images` 目標構建的。要運行它，必須有 Node.js 和 npm。

同樣的過程也可以用來從 SVG 源文件生成自訂標誌 PNG，只需更新 `assets/logo.svg` 並運行 `make generate-images`。省略 `gitea` 標籤將僅更新使用者指定的標誌文件。

### 更新 API

在建立新 API 路由或修改現有 API 路由時，你**必須**使用 [go-swagger](https://goswagger.io/) 註釋更新和/或建立 [Swagger](https://swagger.io/docs/specification/2-0/what-is-swagger/) 文件。這些註釋的結構在[規範](https://goswagger.io/use/spec.html#annotation-syntax)中描述。如果你想了解更多關於 Swagger 結構的資訊，可以查看 [Swagger 2.0 文件](https://swagger.io/docs/specification/2-0/basic-structure/) 或與添加新 API 端點的先前 PR 進行比較，例如 [PR #5483](https://github.com/go-gitea/gitea/pull/5843/files#diff-2e0a7b644cf31e1c8ef7d76b444fe3aaR20)

你應該小心不要破壞依賴於穩定 API 的下游使用者。一般來說，添加是可以接受的，但刪除或對 API 的根本性更改將被拒絕。

一旦你建立或更改了一個 API 端點，請使用以下命令重新生成 Swagger 文件：

```bash
make generate-swagger
```

你應該驗證生成的 Swagger 文件：

```bash
make swagger-validate
```

你應該提交更改的 swagger JSON 文件。持續整合伺服器將使用以下命令檢查是否已完成此操作：

```bash
make swagger-check
```

:::note
請注意，你應該使用 Swagger 2.0 文件，而不是 OpenAPI 3 文件。
:::

### 建立新設定選項

在建立新設定選項時，僅將它們添加到 `modules/setting` 文件中是不夠的。你應該將資訊添加到 `custom/conf/app.ini` 和 `docs/content/doc/administer/config-cheat-sheet.zh-tw.md` 中的[設定速查表](../administration/config-cheat-sheet.md)。

### 更改標誌

在更改 Gitea 標誌 SVG 時，你需要運行並提交以下命令的結果：

```bash
make generate-images
```

這將建立必要的 Gitea favicon 和其他圖標。

### 資料庫遷移

如果你對 `models/` 目錄中的任何資料庫持久化結構進行了重大更改，你將需要進行新的遷移。這些可以在 `models/migrations/` 中找到。你可以使用以下命令確保你的遷移適用於主要資料庫類型：

```bash
make test-sqlite-migration # 使用 SQLite 進行測試，並根據需要切換到適當的數據庫
```

## 測試

Gitea 運行兩種類型的測試：單元測試和整合測試。

### 單元測試

單元測試由 `*_test.go` 覆蓋在 `go test` 系統中。你可以設定環境變量 `GITEA_UNIT_TESTS_LOG_SQL=1` 以在詳細模式下運行測試時顯示所有 SQL 語句（即設定 `GOTESTFLAGS=-v`）。

```bash
TAGS="bindata sqlite sqlite_unlock_notify" make test # 運行單元測試
```

### 整合測試

單元測試無法完全測試 Gitea。因此，我們編寫了整合測試；然而，這些測試依賴於資料庫。

```bash
TAGS="bindata sqlite sqlite_unlock_notify" make build test-sqlite
```

將在 SQLite 環境中運行整合測試。整合測試需要安裝 `git lfs`。其他資料庫測試可用，但可能需要調整本地環境。

查看 [`tests/integration/README.md`](https://github.com/go-gitea/gitea/blob/main/tests/integration/README.md) 以獲取更多資訊以及如何運行單個測試。

### PR 測試

我們的持續整合將測試程式碼是否通過其單元測試，並且所有支援的資料庫將在 Docker 環境中通過整合測試。還將測試從 Gitea 的幾個最近版本的遷移。

請提交你的 PR，並根據需要添加額外的測試和整合測試。

## 網站文件

網站文件位於 `docs/` 中。如果你更改了這些文件，可以使用以下命令測試你的更改以確保它們通過持續整合：

```bash
make lint-md
```

## Visual Studio Code

在 `contrib/ide/vscode` 中提供了 `launch.json` 和 `tasks.json` 用於 Visual Studio Code。查看 [`contrib/ide/README.md`](https://github.com/go-gitea/gitea/blob/main/contrib/ide/README.md) 以獲取更多資訊。

## GoLand

點擊 `/main.go` 中 `func main()` 函數上的 `Run Application` 箭頭可以快速啟動可調試的 Gitea 實例。

`Run/Debug Configuration` 中的 `Output Directory` 必須設定為 gitea 專案目錄（包含 `main.go` 和 `go.mod`），否則啟動的實例的工作目錄將是 GoLand 的臨時目錄，並阻止 Gitea 在開發環境中加載動態資源（例如：模板）。

要在 GoLand 中使用 SQLite 運行單元測試，請在 `Run/Debug Configuration` 的 `Go tool arguments` 中設定 `-tags sqlite,sqlite_unlock_notify`。

## 提交 PR

一旦你對更改感到滿意，請將它們推送並打開一個 pull request。建議允許 Gitea 管理員和所有者修改你的 PR 分支，因為我們需要在合併之前將其更新到 main，並且/或者可能能夠直接幫助修復問題。

任何 PR 需要兩個 Gitea 維護者的批准，並且需要通過持續整合。查看我們的 [`CONTRIBUTING.md`](https://github.com/go-gitea/gitea/blob/main/CONTRIBUTING.md) 文件。

如果你需要更多幫助，請加入 [Discord](https://discord.gg/gitea) #Develop 聊天。

就是這樣！你已經準備好開發 Gitea 了。
