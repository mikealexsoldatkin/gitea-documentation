---
date: "2016-12-01T16:00:00+02:00"
slug: "install-from-source"
sidebar_position: 30
aliases:
  - /zh-tw/install-from-source
---

# 從源程式碼安裝

您應該[安裝 go](https://go.dev/doc/install) 並正確設定您的 go 環境。特別是，建議設定 `$GOPATH` 環境變量並添加 go bin 目錄或目錄 `${GOPATH//://bin:}/bin` 到 `$PATH`。請參閱 Go wiki 條目 [GOPATH](https://github.com/golang/go/wiki/GOPATH)。

接下來，[安裝帶有 npm 的 Node.js](https://nodejs.org/en/download/)，這是構建 JavaScript 和 CSS 文件所必需的。支援的最低 Node.js 版本是 @minNodeVersion@，建議使用最新的 LTS 版本。

:::note
需要 Go 版本 @minGoVersion@ 或更高版本。但是，建議獲取與我們的持續整合相同的版本，請參閱[在 Gitea 上進行黑客攻擊](development/hacking-on-gitea.md) 中的建議
:::

## 下載

首先，我們必須檢索源程式碼。由於 go 模組的出現，最簡單的方法是直接使用 Git，因為我們不再需要在 GOPATH 中構建 Gitea。

```bash
git clone https://github.com/go-gitea/gitea
```

（本文件的早期版本建議使用 `go get`。這不再是必需的。）

決定要構建和安裝的 Gitea 版本。目前，有多種選擇可供選擇。`main` 分支代表當前的開發版本。要使用 main 構建，請跳到[構建部分](#build)。

要使用標記的版本，可以使用以下命令：

```bash
git branch -a
git checkout @sourceBranch@
```

要驗證拉取請求，請首先啟用新分支（`xyz` 是 PR id；例如 [#2663](https://github.com/go-gitea/gitea/pull/2663) 的 `2663`）：

```bash
git fetch origin pull/xyz/head:pr-xyz
```

要從特定標記版本（如 @sourceVersion@）的源程式碼構建 Gitea，請列出可用標記並檢出特定標記。

使用以下命令列出可用標籤。

```bash
git tag -l
git checkout @sourceVersion@  # 或 git checkout pr-xyz
```

## 構建

要從源程式碼構建，系統上必須存在以下程式：

- `go` @minGoVersion@ 或更高版本，請參閱[此處](https://go.dev/dl/)
- `node` @minNodeVersion@ 或更高版本，帶有 `npm`，請參閱[此處](https://nodejs.org/en/download/)
- `make`，請參閱[此處](development/hacking-on-gitea.md#installing-make)

提供了各種[make 任務](https://github.com/go-gitea/gitea/blob/main/Makefile)，以使構建過程盡可能簡單。

根據要求，可以包括以下構建標籤。

- `bindata`：構建單個整體二進制文件，包含所有資產。生產構建所需。
- `sqlite sqlite_unlock_notify`：啟用對 [SQLite3](https://sqlite.org/) 資料庫的支援。僅建議用於小型安裝。
- `pam`：啟用對 PAM（Linux 可插拔身份驗證模組）的支援。可用於驗證本地使用者或擴展身份驗證到 PAM 可用的方法。
- `gogit`：（實驗性）使用 go-git 變體的 Git 命令。

將所有資產（JS/CSS/模板等）捆綁到二進制文件中。使用 `bindata` 構建標籤是生產部署所必需的。當您開發/測試 Gitea 或能夠正確分離資產時，可以排除 `bindata`。

要包括所有資產，請使用 `bindata` 標籤：

```bash
TAGS="bindata" make build
```

在我們的持續整合系統的預設發布構建中，構建標籤是：`TAGS="bindata sqlite sqlite_unlock_notify"`。因此，從源程式碼構建的最簡單推薦方法是：

```bash
TAGS="bindata sqlite sqlite_unlock_notify" make build
```

`build` 目標分為兩個子目標：

- `make backend` 需要 [Go @minGoVersion@](https://go.dev/dl/) 或更高版本。
- `make frontend` 需要 [Node.js @minNodeVersion@](https://nodejs.org/en/download/) 或更高版本。

如果存在預構建的前端文件，則可以僅構建後端：

```bash
TAGS="bindata" make backend
```

## 測試

按照上述步驟操作後，工作目錄中將有一個 `gitea` 二進制文件。
可以從此目錄進行測試或移動到具有測試資料的目錄。當 Gitea 從命令行手動啟動時，可以透過按 `Ctrl + C` 將其終止。

```bash
./gitea web
```

## 更改預設路徑

Gitea 將從 _`CustomPath`_ 中搜索許多內容。預設情況下，這是運行 Gitea 時當前工作目錄中的 `custom/` 目錄。它還將在 `$(CustomPath)/conf/app.ini` 中查找其設定文件，並將當前工作目錄用作許多可設定值的相對基本路徑 _`AppWorkPath`_。最後，靜態文件將從 _`StaticRootPath`_ 提供，預設為 _`AppWorkPath`_。

這些值雖然在開發時很有用，但可能會與下游使用者的偏好發生衝突。

一種選擇是使用腳本文件來影子 `gitea` 二進制文件並在運行 Gitea 之前建立適當的環境。但是，在構建時，您可以使用 `make` 的 `LDFLAGS` 環境變量更改這些預設值。適當的設定如下

- 要設定 _`CustomPath`_，請使用 `LDFLAGS="-X \"code.gitea.io/gitea/modules/setting.CustomPath=custom-path\""`
- 對

---

date: "2016-12-01T16:00:00+02:00"
slug: "install-from-source"
sidebar_position: 30
aliases:

- /zh-tw/install-from-source

---

# Installation from source

You should [install go](https://go.dev/doc/install) and set up your go
environment correctly. In particular, it is recommended to set the `$GOPATH`
environment variable and to add the go bin directory or directories
`${GOPATH//://bin:}/bin` to the `$PATH`. See the Go wiki entry for
[GOPATH](https://github.com/golang/go/wiki/GOPATH).

Next, [install Node.js with npm](https://nodejs.org/en/download/) which is
required to build the JavaScript and CSS files. The minimum supported Node.js
version is @minNodeVersion@ and the latest LTS version is recommended.

:::note
Go version @minGoVersion@ or higher is required. However, it is recommended to
obtain the same version as our continuous integration, see the advice given in
[Hacking on Gitea](development/hacking-on-gitea.md)
:::

## Download

First, we must retrieve the source code. Since, the advent of go modules, the
simplest way of doing this is to use Git directly as we no longer have to have
Gitea built from within the GOPATH.

```bash
git clone https://github.com/go-gitea/gitea
```

(Previous versions of this document recommended using `go get`. This is
no longer necessary.)

Decide which version of Gitea to build and install. Currently, there are
multiple options to choose from. The `main` branch represents the current
development version. To build with main, skip to the [build section](#build).

To work with tagged releases, the following commands can be used:

```bash
git branch -a
git checkout @sourceBranch@
```

To validate a Pull Request, first enable the new branch (`xyz` is the PR id;
for example `2663` for [#2663](https://github.com/go-gitea/gitea/pull/2663)):

```bash
git fetch origin pull/xyz/head:pr-xyz
```

To build Gitea from source at a specific tagged release (like @sourceVersion@), list the
available tags and check out the specific tag.

List available tags with the following.

```bash
git tag -l
git checkout @sourceVersion@  # or git checkout pr-xyz
```

## Build

To build from source, the following programs must be present on the system:

- `go` @minGoVersion@ or higher, see [here](https://go.dev/dl/)
- `node` @minNodeVersion@ or higher with `npm`, see [here](https://nodejs.org/en/download/)
- `make`, see [here](development/hacking-on-gitea.md#installing-make)

Various [make tasks](https://github.com/go-gitea/gitea/blob/main/Makefile)
are provided to keep the build process as simple as possible.

Depending on requirements, the following build tags can be included.

- `bindata`: Build a single monolithic binary, with all assets included. Required for production build.
- `sqlite sqlite_unlock_notify`: Enable support for a
  [SQLite3](https://sqlite.org/) database. Suggested only for tiny
  installations.
- `pam`: Enable support for PAM (Linux Pluggable Authentication Modules). Can
  be used to authenticate local users or extend authentication to methods
  available to PAM.
- `gogit`: (EXPERIMENTAL) Use go-git variants of Git commands.

Bundling all assets (JS/CSS/templates, etc) into the binary. Using the `bindata` build tag is required for
production deployments. You could exclude `bindata` when you are developing/testing Gitea or able to separate the assets correctly.

To include all assets, use the `bindata` tag:

```bash
TAGS="bindata" make build
```

In the default release build of our continuous integration system, the build
tags are: `TAGS="bindata sqlite sqlite_unlock_notify"`. The simplest
recommended way to build from source is therefore:

```bash
TAGS="bindata sqlite sqlite_unlock_notify" make build
```

The `build` target is split into two sub-targets:

- `make backend` which requires [Go @minGoVersion@](https://go.dev/dl/) or greater.
- `make frontend` which requires [Node.js @minNodeVersion@](https://nodejs.org/en/download/) or greater.

If pre-built frontend files are present it is possible to only build the backend:

```bash
TAGS="bindata" make backend
```

## Test

After following the steps above, a `gitea` binary will be available in the working directory.
It can be tested from this directory or moved to a directory with test data. When Gitea is
launched manually from command line, it can be killed by pressing `Ctrl + C`.

```bash
./gitea web
```

## Changing default paths

Gitea will search for a number of things from the _`CustomPath`_. By default this is
the `custom/` directory in the current working directory when running Gitea. It will also
look for its configuration file _`CustomConf`_ in `$(CustomPath)/conf/app.ini`, and will use the
current working directory as the relative base path _`AppWorkPath`_ for a number configurable
values. Finally the static files will be served from _`StaticRootPath`_ which defaults to the _`AppWorkPath`_.

These values, although useful when developing, may conflict with downstream users preferences.

One option is to use a script file to shadow the `gitea` binary and create an appropriate
environment before running Gitea. However, when building you can change these defaults
using the `LDFLAGS` environment variable for `make`. The appropriate settings are as follows

- To set the _`CustomPath`_ use `LDFLAGS="-X \"code.gitea.io/gitea/modules/setting.CustomPath=custom-path\""`
- For _`CustomConf`_ you should use `-X \"code.gitea.io/gitea/modules/setting.CustomConf=conf.ini\"`
- For _`AppWorkPath`_ you should use `-X \"code.gitea.io/gitea/modules/setting.AppWorkPath=working-path\"`
- For _`StaticRootPath`_ you should use `-X \"code.gitea.io/gitea/modules/setting.StaticRootPath=static-root-path\"`
- To change the default PID file location use `-X \"code.gitea.io/gitea/cmd.PIDFile=/run/gitea.pid\"`

Add as many of the strings with their preceding `-X` to the `LDFLAGS` variable and run `make build`
with the appropriate `TAGS` as above.

Running `gitea help` will allow you to review what the computed settings will be for your `gitea`.

## Cross Build

The `go` compiler toolchain supports cross-compiling to different architecture targets that are supported by the toolchain. See [`GOOS` and `GOARCH` environment variable](https://go.dev/doc/install/source#environment) for the list of supported targets. Cross compilation is helpful if you want to build Gitea for less-powerful systems (such as Raspberry Pi).

To cross build Gitea with build tags (`TAGS`), you also need a C cross compiler which targets the same architecture as selected by the `GOOS` and `GOARCH` variables. For example, to cross build for Linux ARM64 (`GOOS=linux` and `GOARCH=arm64`), you need the `aarch64-unknown-linux-gnu-gcc` cross compiler. This is required because Gitea build tags uses `cgo`'s foreign-function interface (FFI).

Cross-build Gitea for Linux ARM64, without any tags:

```
GOOS=linux GOARCH=arm64 make build
```

Cross-build Gitea for Linux ARM64, with recommended build tags:

```
CC=aarch64-unknown-linux-gnu-gcc GOOS=linux GOARCH=arm64 TAGS="bindata sqlite sqlite_unlock_notify" make build
```

Replace `CC`, `GOOS`, and `GOARCH` as appropriate for your architecture target.

You will sometimes need to build a static compiled image. To do this you will need to add:

```
LDFLAGS="-linkmode external -extldflags '-static' $LDFLAGS" TAGS="netgo osusergo $TAGS" make build
```

This can be combined with `CC`, `GOOS`, and `GOARCH` as above.

### Adding bash/zsh autocompletion (from 1.19)

A script to enable bash-completion can be found at [`contrib/autocompletion/bash_autocomplete`](https://raw.githubusercontent.com/go-gitea/gitea/main/contrib/autocompletion/bash_autocomplete). This should be altered as appropriate and can be `source` in your `.bashrc`
or copied as `/usr/share/bash-completion/completions/gitea`.

Similarly, a script for zsh-completion can be found at [`contrib/autocompletion/zsh_autocomplete`](https://raw.githubusercontent.com/go-gitea/gitea/main/contrib/autocompletion/zsh_autocomplete). This can be copied to `/usr/share/zsh/_gitea` or sourced within your
`.zshrc`.

YMMV and these scripts may need further improvement.

## Compile or cross-compile using Linux with Zig

Follow [Getting Started of Zig](https://ziglang.org/learn/getting-started/#installing-zig) to install zig.

- Compile (Linux ➝ Linux)

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

- Cross-compile (Linux ➝ Windows)

```sh
CC="zig cc -target x86_64-windows-gnu" \
CGO_ENABLED=1 \
CGO_CFLAGS="-O2 -g -pthread" \
GOOS=windows \
GOARCH=amd64 \
TAGS="bindata sqlite sqlite_unlock_notify" \
make build
```

## Compile or cross-compile with Zig using Windows

Compile with `GIT BASH`.

- Compile (Windows ➝ Windows)

```sh
CC="zig cc -target x86_64-windows-gnu" \
CGO_ENABLED=1 \
CGO_CFLAGS="-O2 -g -pthread" \
GOOS=windows \
GOARCH=amd64 \
TAGS="bindata sqlite sqlite_unlock_notify" \
make build
```

- Cross-compile (Windows ➝ Linux)

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

## Source Maps

By default, gitea generates reduced source maps for frontend files to conserve space. This can be controlled with the `ENABLE_SOURCEMAP` environment variable:

- `ENABLE_SOURCEMAP=true` generates all source maps, the default for development builds
- `ENABLE_SOURCEMAP=reduced` generates limited source maps, the default for production builds
- `ENABLE_SOURCEMAP=false` generates no source maps
