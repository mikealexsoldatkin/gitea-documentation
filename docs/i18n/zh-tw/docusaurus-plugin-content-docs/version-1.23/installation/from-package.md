---
date: "2016-12-01T16:00:00+02:00"
slug: "install-from-package"
sidebar_position: 20
aliases:
  - /zh-tw/install-from-package
---

# 從包安裝

## 官方包

### macOS

目前，在 MacOS 上安裝的唯一支援方法是 [Homebrew](http://brew.sh/)。
按照[從二進制部署](installation/from-binary.md)指南可能有效，
但不受支援。要通過 `brew` 安裝 Gitea：

```
brew install gitea
```

## 非官方包

### Alpine Linux

Alpine Linux 在其社區儲存庫中有 [Gitea](https://pkgs.alpinelinux.org/packages?name=gitea&branch=edge)，該儲存庫遵循最新的穩定版本。

```sh
apk add gitea
```

### Arch Linux

滾動發行版在其官方額外儲存庫中有 [Gitea](https://www.archlinux.org/packages/extra/x86_64/gitea/)，並且隨著新的 Gitea 發行版提供包更新。

```sh
pacman -S gitea
```

### Arch Linux ARM

Arch Linux ARM 提供 [aarch64](https://archlinuxarm.org/packages/aarch64/gitea)、[armv7h](https://archlinuxarm.org/packages/armv7h/gitea) 和 [armv6h](https://archlinuxarm.org/packages/armv6h/gitea) 的包。

```sh
pacman -S gitea
```

### Gentoo Linux

滾動發行版在其官方社區儲存庫中有 [Gitea](https://packages.gentoo.org/packages/www-apps/gitea)，並且隨著新的 Gitea 發行版提供包更新。

```sh
emerge gitea -va
```

### Canonical Snap

有一個 [Gitea Snap](https://snapcraft.io/gitea) 包，它遵循最新的穩定版本。
_注意：Gitea snap 包是[嚴格隔離的](https://snapcraft.io/docs/snap-confinement)。嚴格隔離的快照完全隔離運行，因此某些 Gitea 功能可能無法與隔離一起使用_

```sh
snap install gitea
```

### SUSE 和 openSUSE

OpenSUSE 構建服務提供 [openSUSE 和 SLE](https://software.opensuse.org/download/package?package=gitea&project=devel%3Atools%3Ascm) 的包
在開發軟件設定管理儲存庫中

### Windows

[Chocolatey](https://chocolatey.org/) 提供了一個適用於 Windows 的 [Gitea](https://chocolatey.org/packages/gitea) 包。

```sh
choco install gitea
```

或者按照[從二進制部署](installation/from-binary.md)指南進行操作。

### FreeBSD

有一個 FreeBSD 端口 `www/gitea` 可用。要安裝預構建的二進制包：

```
pkg install gitea
```

要獲取最新版本，或使用自訂選項構建端口，
[從端口安裝](https://www.freebsd.org/doc/handbook/ports-using.html)：

```
su -
cd /usr/ports/www/gitea
make install clean
```

該端口使用標準的 FreeBSD 文件系統佈局：設定文件位於 `/usr/local/etc/gitea`，
捆綁的模板、選項、外掛和主題位於 `/usr/local/share/gitea`，啟動腳本
位於 `/usr/local/etc/rc.d/gitea`。

要使 Gitea 作為服務運行，請運行 `sysrc gitea_enable=YES` 並使用 `service gitea start` 啟動它。

### 其他

存在各種其他第三方 Gitea 包。
要查看策劃列表，請前往 [awesome-gitea](https://gitea.com/gitea/awesome-gitea/src/branch/master/README.md#user-content-packages)。

您知道有現有的包不在列表中嗎？發送 PR 以將其添加！
