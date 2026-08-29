---
date: "2016-12-01T16:00:00+02:00"

slug: "install-from-source"
sidebar_position: 30

aliases:
  - /zh-tw/install-from-source
---

# 使用源程式碼安裝

你需要 [安裝 Go](https://golang.google.cn/doc/install) 並正確設定 Go 環境。特別的，建議設定`$GOPATH`環境變量，並將 Go 的二進制目錄或目錄`${GOPATH//://bin:}/bin`添加到`$PATH`中。請參閱 Go 百科上關於 [GOPATH](https://github.com/golang/go/wiki/GOPATH) 的詞條。

接下來，[安裝 Node.js 和 npm](https://nodejs.org/zh-tw/download/)， 這是構建 JavaScript 和 CSS 文件所需的。最低支援的 Node.js 版本是 @minNodeVersion@，建議使用最新的 LTS 版本。

**注意**：需要 Go 版本 @minGoVersion@ 或更高版本。不過，建議獲取與我們的持續整合（continuous integration, CI）相同的版本，請參閱在 [Hacking on Gitea](development/hacking-on-gitea.md) 中給出的建議。

## 下載

首先，我們需要獲取源碼。由於引入了 Go 模組，最簡單的方法是直接使用 Git，因為我們不再需要在 GOPATH 內構建 Gitea。

```bash
git clone https://github.com/go-gitea/gitea
```

（之前的版本中建議使用 `go get`，但現在不再需要。）

你可以選擇編譯和安裝的版本，當前有多個選擇。`main` 分支代表當前的開發版本。如果你想編譯 `main` 版本，你可以直接跳到 [構建](#構建) 部分。

如果你想編譯帶有標籤的發行版本，可以使用以下命令簽出：

```bash
git branch -a
git checkout @sourceBranch@
```

要驗證一個拉取請求（Pull Request, PR），要先啟用新的分支（其中 `xyz` 是 PR 的 ID；例如，對於 [#2663](https://github.com/go-gitea/gitea/pull/2663)，ID 是 `2663 `）：

```bash
git fetch origin pull/xyz/head:pr-xyz
```

要以指定發行版本（如 @sourceVersion@ ）的源程式碼來構建 Gitea，可執行以下命令列出可用的版本並選擇某個版本簽出。
使用以下命令列出可用的版本：

```bash
git tag -l
git checkout @sourceVersion@  # or git checkout pr-xyz
```

<a id="build"></a>
## 構建

要從源程式碼進行構建，系統必須預先安裝以下程式：

- `go` @minGoVersion@ 或更高版本，請參閱 [這裡](https://go.dev/dl/)
- `node` @minNodeVersion@ 或更高版本，並且安裝 `npm`, 請參閱 [這裡](https://nodejs.org/zh-tw/download/)
- `make`, 請參閱 [這裡](development/hacking-on-gitea.md)

為了儘可能簡化編譯過程，提供了各種 [make 任務](https://github.com/go-gitea/gitea/blob/main/Makefile)。

根據你的構建需求，以下 tags 可以使用：

- `bindata`: 構建一個單一的整體二進制文件，包含所有資源。適用於構建生產環境版本。
- `sqlite sqlite_unlock_notify`: 啟用對 [SQLite3](https://sqlite.org/) 資料庫的支援。僅建議在少數人使用時使用這個模式。
- `pam`: 啟用對 PAM（ Linux 可插拔認證模組）的支援。可用於對本地使用者進行身份驗證或擴展身份驗證到 PAM 可用的方法。
- `gogit`：（實驗性功能）使用 go-git 變體的 Git 命令。

將所有資源（JS/CSS/模板等）打包到二進制文件中。在生產環境部署時，使用`bindata`構建標籤是必需的。在開發/測試 Gitea 或能夠明確分離資源時，可以不用`bindata`。

要包含所有資源，請使用 `bindata` 標籤：

```bash
TAGS="bindata" make build
```

在我們的持續整合系統的預設發行版中，構建標籤為：`TAGS="bindata sqlite sqlite_unlock_notify"`。因此，從源碼構建的最簡單、推薦方式是：

```bash
TAGS="bindata sqlite sqlite_unlock_notify" make build
```

`build`目標分為兩個子目標：

- `make backend` 需要 [Go @minGoVersion@](https://golang.google.cn/doc/install) 或更高版本。
- `make frontend` 需要 [Node.js @minNodeVersion@](https://nodejs.org/zh-tw/download/) 或更高版本。

如果存在預構建的前端文件，可以僅構建後端：

```bash
TAGS="bindata" make backend
```

## 測試

按照上述步驟完成後，工作目錄中將會有一個`gitea`二進制文件。可以從該目錄進行測試，或將其移動到帶有測試資料的目錄中。當手動從命令行啟動 Gitea 時，可以透過按下`Ctrl + C`來停止程式。

```bash
./gitea web
```

## 更改預設路徑

Gitea 將從`CustomPath`中查找許多資訊。預設的，這會在運行 Gitea 時當前工作目錄下的`custom/`目錄中（譯者案：即`$PATH_TO_YOUR_GITEA$/custom/`）。它還將在`$(CustomPath)/conf/app.ini`中查找其設定文件`CustomConf`，並將當前工作目錄用作一些可設定值的相對基本路徑`AppWorkPath`。最後，靜態文件將從預設為 `AppWorkPath`的`StaticRootPath`提供。

儘管在開發時這些值很有用，但可能與下游使用者的偏好衝突。

一種選擇是使用腳本文件來隱藏`gitea`二進制文件，並在運行 Gitea 之前建立適當的環境。然而，在構建時，可以使用`make`的`LDFLAGS`環境變量來更改這些預設值。適當的設定如下：

- 要設定`CustomPath`，請使用`LDFLAGS="-X \"code.gitea.io/gitea/modules/setting.CustomPath=custom-path\""`
- 對於`CustomConf`，應該使用`-X \"code.gitea.io/gitea/modules/setting.CustomConf=conf.ini\"`
- 對於`AppWorkPath`，應該使用`-X \"code.gitea.io/gitea/modules/setting.AppWorkPath=working-path\"`
- 對於`StaticRootPath`，應該使用`-X \"code.gitea.io/gitea/modules/setting.StaticRootPath=static-root-path\"`
- 要更改預設的 PID 文件位置，請使用`-X \"code.gitea.io/gitea/cmd.PIDFile=/run/gitea.pid\"`

將這些字符串與其前導的`-X`添加到`LDFLAGS`變量中，並像上面那樣使用適當的`TAGS`運行`make build`。

運行`gitea help`將允許您查看設定的`gitea`設定。

## 交叉編譯

`go`編譯器工具鏈支援將程式碼交叉編譯到不同的目標架構上。請參考[`GOOS`和`GOARCH`環境變量](https://go.dev/doc/install/source#environment) 以獲取支援的目標列表。如果您想為性能較弱的系統（如樹莓派）構建 Gitea，交叉編譯非常有用。

要使用構建標籤（`TAGS`）進行交叉編譯 Gitea，您還需要一個 C 交叉編譯器，該編譯器的目標架構與`GOOS`和`GOARCH`變量選擇的架構相同。例如，要為 Linux ARM64（`GOOS=linux`和`GOARCH=arm64`）進行交叉編譯，您需要`aarch64-unknown-linux-gnu-gcc`交叉編譯器。這是因為 Gitea 構建標籤使用了`cgo`的外部函數介面（FFI）。

在沒有任何標籤的情況下，交叉編譯的 Gitea 為 Linux ARM64 版本：

```
GOOS=linux GOARCH=arm64 make build
```

要交叉編譯 Linux ARM64 下的 Gitea，這是推薦的構建標籤：

```
CC=aarch64-unknown-linux-gnu-gcc GOOS=linux GOARCH=arm64 TAGS="bindata sqlite sqlite_unlock_notify" make build
```

根據您的目標架構，適當替換`CC`、`GOOS`和`GOARCH`。

有時您需要構建一個靜態編譯的鏡像。為此，您需要添加以下內容：

```
LDFLAGS="-linkmode external -extldflags '-static' $LDFLAGS" TAGS="netgo osusergo $TAGS" make build
```

這可以與上述的`CC`、`GOOS`和`GOARCH`結合使用。

### 添加 bash/zsh 自動補全（從 1.19 版本起）

在[`contrib/autocompletion/bash_autocomplete`](https://raw.githubusercontent.com/go-gitea/gitea/main/contrib/autocompletion/bash_autocomplete)中可以找到一個啟用 bash 自動補全的腳本。您可以根據需要進行修改，並在您的 `.bashrc` 中使用 `source` 命令加載該腳本，或者將其複製到 `/usr/share/bash-completion/completions/gitea`。

類似地，可以在[`contrib/autocompletion/zsh_autocomplete`](https://raw.githubusercontent.com/go-gitea/gitea/main/contrib/autocompletion/zsh_autocomplete)中找到一個用於 zsh 自動補全的腳本。您可以將其複製到 `/usr/share/zsh/_gitea`，或者在您的 `.zshrc` 中使用 `source` 命令加載該腳本。

可能需要你根據具體情況進一步改進這些腳本。

## 在 Linux 上使用 Zig 進行編譯或交叉編譯

請按照 [Zig 的入門指南](https://ziglang.org/learn/getting-started/#installing-zig) 安裝 Zig。

- 編譯 (Linux ➝ Linux)

```sh
CC="zig cc -target x86_64-linux-gnu" \
CGO_ENABLED=1 \
CGO_CFLAGS="-O2 -g -pthread" \
CGO_LDFLAGS="-linkmode=external -v"
GOOS=linux \
GOARCH=amd64 \
TAGS="bindata sqlite sqlite_unlock_notify" \
make build
```

- 交叉編譯 (Linux ➝ Windows)

```sh
CC="zig cc -target x86_64-windows-gnu" \
CGO_ENABLED=1 \
CGO_CFLAGS="-O2 -g -pthread" \
GOOS=windows \
GOARCH=amd64 \
TAGS="bindata sqlite sqlite_unlock_notify" \
make build
```

## 在 Windows 上使用 Zig 進行編譯或交叉編譯

使用`GIT BASH`編譯。

- 編譯 (Windows ➝ Windows)

```sh
CC="zig cc -target x86_64-windows-gnu" \
CGO_ENABLED=1 \
CGO_CFLAGS="-O2 -g -pthread" \
GOOS=windows \
GOARCH=amd64 \
TAGS="bindata sqlite sqlite_unlock_notify" \
make build
```

- 交叉編譯 (Windows ➝ Linux)

```sh
CC="zig cc -target x86_64-linux-gnu" \
CGO_ENABLED=1 \
CGO_CFLAGS="-O2 -g -pthread" \
CGO_LDFLAGS="-linkmode=external -v"
GOOS=linux \
GOARCH=amd64 \
TAGS="bindata sqlite sqlite_unlock_notify" \
make build
```

## Source Map

預設情況下，gitea 會為前端文件生成精簡的 Source Map 以節省空間。 這可以透過“ENABLE_SOURCEMAP”環境變量進行控制：

- `ENABLE_SOURCEMAP=true` 生成所有 Source Map，這是開發版本的預設設定
- `ENABLE_SOURCEMAP=reduced` 生成有限的 Source Map，這是生產版本的預設設定
- `ENABLE_SOURCEMAP=false` 不生成 Source Map
