---
date: "2016-12-01T16:00:00+02:00"
slug: "install-from-package"
sidebar_position: 20
aliases:
  - /zh-tw/install-from-package
---

# 套件管理器安裝

## 官方套件管理器

### macOS

macOS 平台下當前我們僅支援通過 `brew` 來安裝。如果你沒有安裝 [Homebrew](http://brew.sh/)，你也可以查看 [從二進制安裝](installation/from-binary.md)。在你安裝了 `brew` 之後， 你可以執行以下命令：

```
brew install gitea
```

## 非官方套件管理器

### Alpine Linux

Gitea 已經包含在 Alpine Linux 的[社區儲存庫](https://pkgs.alpinelinux.org/packages?name=gitea&branch=edge)中，版本與 Gitea 官方保持同步。

```sh
apk add gitea
```

### Arch Linux

Gitea 已經在滾動發佈發行版的官方[社區儲存庫](https://www.archlinux.org/packages/community/x86_64/gitea/)中，版本與 Gitea 官方保持同步。

```sh
pacman -S gitea
```

### Arch Linux ARM

官方支援 [aarch64](https://archlinuxarm.org/packages/aarch64/gitea)， [armv7h](https://archlinuxarm.org/packages/armv7h/gitea) 和 [armv6h](https://archlinuxarm.org/packages/armv6h/gitea) 架構。

```sh
pacman -S gitea
```

### Gentoo Linux

滾動發佈的發行版在其官方社區軟件儲存庫中提供了 [Gitea](https://packages.gentoo.org/packages/www-apps/gitea)，並且會隨著新的 Gitea 發佈提供套件更新。

```sh
emerge gitea -va
```

### Canonical Snap

目前 Gitea 已在 Snap Store 中發佈，名稱為 [gitea](https://snapcraft.io/gitea)。

```sh
snap install gitea
```

### SUSE/openSUSE

OpenSUSE 構建服務為 [openSUSE 和 SLE](https://software.opensuse.org/download/package?package=gitea&project=devel%3Atools%3Ascm)
提供包，你可以在開發軟件設定管理儲存庫中找到它們。

### Windows

目前你可以透過 [Chocolatey](https://chocolatey.org/) 來安裝 [Gitea](https://chocolatey.org/packages/gitea)。

```sh
choco install gitea
```

你也可以 [從二進制安裝](installation/from-binary.md) 。

### FreeBSD

可以使用 Gitea 的 FreeBSD port `www/gitea`。 請安裝預構建的二進制包：

```
pkg install gitea
```

對於最新版本，或使用自訂選項構建 port，請
[從 port 安裝](https://www.freebsd.org/doc/handbook/ports-using.html)：

```
su -
cd /usr/ports/www/gitea
make install clean
```

該 port 使用標準的 FreeBSD 文件系統佈局：設定文件在 `/usr/local/etc/gitea` 目錄中，
模板、選項、外掛和主題在 `/usr/local/share/gitea` 目錄中，啟動腳本在 `/usr/local/etc/rc.d/gitea` 目錄中。

要使 Gitea 作為服務運行，請運行 `sysrc gitea_enable=YES` 並使用 `service gitea start` 命令啟動它。

### 其它

如果這裡沒有找到你喜歡的套件管理器，可以使用 Gitea 第三方套件。這裡有一個完整的列表： [awesome-gitea](https://gitea.com/gitea/awesome-gitea/src/branch/master/README.md#user-content-packages)。

如果你知道其他 Gitea 第三方套件，請發送 PR 來添加它。
