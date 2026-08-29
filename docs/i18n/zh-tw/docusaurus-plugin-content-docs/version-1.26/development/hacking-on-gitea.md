---
date: "2016-12-01T16:00:00+02:00"
slug: "hacking-on-gitea"
sidebar_position: 10
aliases:
  - /zh-tw/hacking-on-gitea
---

# 玩轉 Gitea

## 快速入門

要獲得快速工作的開發環境，您可以使用 Gitpod。

[![在 Gitpod 中打開](/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/go-gitea/gitea)

## 安裝 Golang

您需要 [安裝 go](https://go.dev/doc/install) 並設定您的 go 環境。

接下來，[使用 npm 安裝 Node.js](https://nodejs.org/en/download/) ，這是構建
JavaScript 和 CSS 文件的必要工具。最低支援的 Node.js 版本是 @minNodeVersion@
並且推薦使用最新的 LTS 版本。

**注意** ：當執行需要外部工具的 make 任務時，比如
`make watch-backend`，Gitea 會自動下載並構建這些必要的元件。為了能夠使用這些，你必須
將 `"$GOPATH"/bin` 目錄加入到可執行路徑上。如果你不把 go bin 目錄添加到可執行路徑你必須手動
指定可執行程式路徑。

**注意 2** ：Go 版本 @minGoVersion@ 或更高版本是必須的。Gitea 使用 `gofmt` 來
格式化源程式碼。然而，`gofmt` 的結果可能因 `go` 的版本而有差異。因此推薦安裝我們持續整合使用
的 Go 版本。截至上次更新，Go 版本應該是 @goVersion@。

## 安裝 Make

Gitea 大量使用 `Make` 來自動化任務和改進開發。本指南涵蓋了如何安裝 Make。

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

Make 的這三個發行版都可以在 Windows 上運行：

- [單個二進制構建](http://www.equation.com/servlet/equation.cmd?fa=make)。複製到某處並添加到 `PATH`。
  - [32 位版本](http://www.equation.com/ftpdir/make/32/make.exe)
  - [64 位版本](http://www.equation.com/ftpdir/make/64/make.exe)
- [MinGW-w64](https://www.mingw-w64.org) / [MSYS2](https://www.msys2.org/)。
  - MSYS2 是一個工具和庫的集合，為您提供一個易於使用的環境來構建、安裝和運行本機 Windows 軟件，它包括 MinGW-w64。
  - 在 MingGW-w64 中，二進制文件稱為 `mingw32-make.exe` 而不是 `make.exe`。將 `bin` 文件夾添加到 `PATH`。
  - 在 MSYS2 中，您可以直接使用 `make`。請參閱 [MSYS2 移植](https://www.msys2.org/wiki/Porting/)。
  - 要使用 CGO_ENABLED（例如：SQLite3）編譯 Gitea，您可能需要使用 [tdm-gcc](https://jmeubank.github.io/tdm-gcc/) 而不是 MSYS2 gcc，因為 MSYS2 gcc 標頭缺少一些 Windows -只有 CRT 函數像 \_beginthread 一樣。
- [Chocolatey 套件管理器](https://chocolatey.org/packages/make)。運行`choco install make`

**注意** ：如果您嘗試在 Windows 命令提示符下使用 make 進行構建，您可能會遇到問題。建議使用上述提示（Git bash 或 MinGW），但是如果您只有命令提示符（或可能是 PowerShell），則可以使用 [set](https://docs.microsoft.com/zh-tw/windows-server/administration/windows-commands/set_1) 命令，例如 `set TAGS=bindata`。

## 下載並克隆 Gitea 源程式碼

獲取源程式碼的推薦方法是使用 `git clone`。

```bash
git clone https://github.com/go-gitea/gitea
```

（自從 go modules 出現後，不再需要構建 go 專案從 `$GOPATH` 中獲取，因此不再推薦使用 `go get` 方法。）

## 派生 Gitea

如上所述下載主要的 Gitea 源程式碼。然後，派生 [Gitea 儲存庫](https://github.com/go-gitea/gitea)，
併為您的本地儲存庫切換 git 遠程源，或添加另一個遠程源：

```bash
# 將原來的 Gitea origin 重命名為 upstream
git remote rename origin upstream
git remote add origin "git@github.com:$GITHUB_USERNAME/gitea.git"
git fetch --all --prune
```

或者：

```bash
# 為我們的 fork 添加新的遠程
git remote add "$FORK_NAME" "git@github.com:$GITHUB_USERNAME/gitea.git"
git fetch --all --prune
```

為了能夠建立合併請求，應將分叉儲存庫添加為 Gitea 本地儲存庫的遠程，否則無法推送更改。

## 構建 Gitea（基本）

看看我們的
[說明](installation/from-source.md)
關於如何[從源程式碼構建](installation/from-source.md) 。

從源程式碼構建的最簡單推薦方法是：

```bash
TAGS="bindata sqlite sqlite_unlock_notify" make build
```

`build` 目標將同時執行 `frontend` 和 `backend` 子目標。如果存在 `bindata` 標籤，資源文件將被編譯成二進制文件。建議在進行前端開發時省略 `bindata` 標籤，以便實時反映更改。

有關所有可用的 `make` 目標，請參閱 `make help`。另請參閱 [`.drone.yml`](https://github.com/go-gitea/gitea/blob/main/.drone.yml) 以瞭解我們的持續整合是如何工作的。

## 持續構建

要在源文件更改時運行並持續構建：

```bash
# 對於前端和後端
make watch

# 或者：只看前端文件（html/js/css）
make watch-frontend

# 或者：只看後端文件 (go)
make watch-backend
```

在 macOS 上，監視所有後端源文件可能會達到預設的打開文件限制，這可以透過當前 shell 的 `ulimit -n 12288` 或所有未來 shell 的 shell 啟動文件來增加。

### 格式化、程式碼分析和拼寫檢查

我們的持續整合將拒絕未通過程式碼檢查（包括格式檢查、程式碼分析和拼寫檢查）的 PR。

你應該格式化你的程式碼：

```bash
make fmt
```

並檢查源程式碼：

```bash
# lint 前端和後端代碼
make lint
# 僅 lint 後端代碼
make lint-backend
```

**注意** ：`gofmt` 的結果取決於 `go` 的版本。您應該運行與持續整合相同的 go 版本。

### 處理 JS 和 CSS

前端開發應遵循 [Guidelines for Frontend Development](contributing/guidelines-frontend.md)。

要使用前端資源構建，請使用上面提到的“watch-frontend”目標或只構建一次：

```bash
make build && ./gitea
```

在提交之前，確保 linters 通過：

```bash
make lint-frontend
```

### 設定本地 ElasticSearch 實例

使用 docker 啟動本地 ElasticSearch 實例：

```sh
mkdir -p $(pwd) /data/elasticsearch
sudo chown -R 1000:1000 $(pwd) /data/elasticsearch
docker run --rm --memory= "4g" -p 127.0.0.1:9200:9200 -p 127.0.0.1:9300:9300 -e "discovery.type=single-node" -v "$(pwd)/data /elasticsearch:/usr/share/elasticsearch/data" docker.elastic.co/elasticsearch/elasticsearch:7.16.3
```

設定`app.ini`：

```ini
[indexer]
ISSUE_INDEXER_TYPE = elasticsearch
ISSUE_INDEXER_CONN_STR = http://elastic:changeme@localhost:9200
REPO_INDEXER_ENABLED = true
REPO_INDEXER_TYPE = elasticsearch
REPO_INDEXER_CONN_STR = http://elastic:changeme@localhost:9200
```

### 構建和添加 SVGs

SVG 圖標是使用 `make svg` 命令構建的，該命令將圖標資源編譯到輸出目錄 `public/assets/img/svg` 中。可以在 `web_src/svg` 目錄中添加自訂圖標。

### 構建 Logo

Gitea Logo 的 PNG 和 SVG 版本是使用 `TAGS="gitea" make generate-images` 目標從單個 SVG 源文件 assets/logo.svg 構建的。要運行它，Node.js 和 npm 必須可用。

通過更新 `assets/logo.svg` 並運行 `make generate-images`，同樣的過程也可用於從 SVG 源文件生成自訂 Logo PNG。忽略 gitea 編譯選項將僅更新使用者指定的 LOGO 文件。

### 更新 API

建立新的 API 路由或修改現有的 API 路由時，您**必須**
更新和/或建立 [Swagger](https://swagger.io/docs/specification/2-0/what-is-swagger/)
這些使用 [go-swagger](https://goswagger.io/) 評論的文件。
[規範](https://goswagger.io/use/spec.html#annotation-syntax)中描述了這些註釋的結構。
如果您想了解更多有關 Swagger 結構的資訊，可以查看
[Swagger 2.0 文件](https://swagger.io/docs/specification/2-0/basic-structure/)
或與添加新 API 端點的先前 PR 進行比較，例如 [PR #5483](https://github.com/go-gitea/gitea/pull/5843/files#diff-2e0a7b644cf31e1c8ef7d76b444fe3aaR20)

您應該注意不要破壞下游使用者依賴的 API。在穩定的 API 上，一般來說添加是可以接受的，但刪除
或對 API 進行根本性更改將會被拒絕。

建立或更改 API 端點後，請用以下命令重新生成 Swagger 文件：

```bash
make generate-swagger
```

您應該驗證生成的 Swagger 文件：

```bash
make swagger-validate
```

您應該提交更改後的 swagger JSON 文件。持續整合伺服器將使用以下方法檢查是否已完成：

```bash
make swagger-check
```

**注意** ：請注意，您應該使用 Swagger 2.0 文件，而不是 OpenAPI 3 文件。

### 建立新的設定選項

建立新的設定選項時，將它們添加到 `modules/setting` 的對應文件。您應該將資訊添加到 `custom/conf/app.ini`
併到[設定備忘單](../administration/config-cheat-sheet.md)
在 `docs/content/doc/advanced/config-cheat-sheet.zh-tw.md` 中找到

### 更改 Logo

更改 Gitea Logo SVG 時，您將需要運行並提交結果的：

```bash
make generate-images
```

這將建立必要的 Gitea 圖標和其他圖標。

### 資料庫遷移

如果您對資料庫中的任何資料庫持久結構進行重大更改
`models/` 目錄，您將需要進行新的遷移。可以找到這些
在 `models/migrations/` 中。您可以確保您的遷移適用於主要
資料庫類型使用：

```bash
make test-sqlite-migration # 將 SQLite 切換為適當的數據庫
```

## 測試

Gitea 運行兩種類型的測試：單元測試和整合測試。

### 單元測試

`go test` 系統中的`*_test.go` 涵蓋了單元測試。
您可以設定環境變量 `GITEA_UNIT_TESTS_LOG_SQL=1` 以在詳細模式下運行測試時顯示所有 SQL 語句（即設定`GOTESTFLAGS=-v` 時）。

```bash
TAGS="bindata sqlite sqlite_unlock_notify" make test # Runs the unit tests
```

### 整合測試

單元測試不會也不能完全單獨測試 Gitea。因此，我們編寫了整合測試；但是，這些依賴於資料庫。

```bash
TAGS="bindata sqlite sqlite_unlock_notify" make build test-sqlite
```

將在 SQLite 環境中運行整合測試。整合測試需要安裝 `git lfs`。其他資料庫測試可用，但
可能需要適應當地環境。

看看 [`tests/integration/README.md`](https://github.com/go-gitea/gitea/blob/main/tests/integration/README.md) 有關更多資訊以及如何運行單個測試。

### 測試 PR

我們的持續整合將測試程式碼是否通過了單元測試，並且所有支援的資料庫都將在 Docker 環境中通過整合測試。
還將測試從幾個最新版本的 Gitea 遷移。

請在 PR 中附帶提交適當的單元測試和整合測試。

## 網站文件

該網站的文件位於 `docs/` 中。如果你改變了文件內容，你可以使用以下測試方法進行持續整合：

```bash
make lint-md
```

## Visual Studio Code

`contrib/ide/vscode` 中為 Visual Studio Code 提供了 `launch.json` 和 `tasks.json`。查看
[`contrib/ide/README.md`](https://github.com/go-gitea/gitea/blob/main/contrib/ide/README.md) 瞭解更多資訊。

## Goland

單擊 `/main.go` 中函數 `func main()` 上的 `Run Application` 箭頭
可以快速啟動一個可調試的 Gitea 實例。

`Run/Debug Configuration` 中的 `Output Directory` 必須設定為
gitea 專案目錄（包含 `main.go` 和 `go.mod`），
否則，啟動實例的工作目錄是 GoLand 的臨時目錄
並防止 Gitea 在開發環境中加載動態資源（例如：模板）。

要在 GoLand 中使用 SQLite 運行單元測試，請設定 `-tags sqlite,sqlite_unlock_notify`
在 `運行/調試配置` 的 `Go 工具參數` 中。

## 提交 PR

對更改感到滿意後，將它們推送並打開拉取請求。它建議您允許 Gitea Managers 和 Owners 修改您的 PR
分支，因為我們需要在合併之前將其更新為 main 和/或可能是能夠直接幫助解決問題。

任何 PR 都需要 Gitea 維護者的兩次批准，並且需要通過持續整合。看看我們的
[CONTRIBUTING.md](https://github.com/go-gitea/gitea/blob/main/CONTRIBUTING.md)
文件。

如果您需要更多幫助，請前往 [Discord](https://discord.gg/gitea) #Develop 頻道
並在那裡聊天。

現在，您已準備好 Hacking Gitea。
