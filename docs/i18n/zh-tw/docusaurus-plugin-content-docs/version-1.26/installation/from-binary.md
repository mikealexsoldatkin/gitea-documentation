---
date: "2016-12-01T16:00:00+02:00"
slug: "install-from-binary"
sidebar_position: 15
aliases:
  - /zh-tw/install-from-binary
---

# 使用二進制文件安裝

所有打包的二進制程式均包含 SQLite，MySQL 和 PostgreSQL 的資料庫連接支援，同時網站的靜態資源均已嵌入到可執行程式中，這一點和曾經的 Gogs 有所不同。

## 下載

你可以從 [下載頁面](https://dl.gitea.com/gitea/) 選擇對應平台的二進制文件。

### 選擇架構

- **對於 Linux**，`linux-amd64` 適用於 64-bit 的 Intel/AMD 平台。更多架構包含 `arm64` (Raspberry PI 4)，`386` (32-bit)，`arm-5` 以及 `arm-6`。

- **對於 Windows**，`windows-4.0-amd64` 適用於 64-bit 的 Intel/AMD 平台，`386` 適用於 32-bit 的 Intel/AMD 平台。（提示：`gogit-windows` 版本內建了 gogit 可能緩解在舊的 Windows 平台上 Go 程式調用 git 子程式時面臨的 [性能問題](https://github.com/go-gitea/gitea/pull/15482)）

- **對於 macOS**，`darwin-arm64` 適用於 Apple Silicon 架構，`darwin-amd64` 適用於 Intel 架構.

- **對於 FreeBSD**，`freebsd12-amd64` 適用於 64-bit 的 Intel/AMD 平台。

### 使用 wget 下載

使用以下命令下載適用於 64-bit Linux 平台的二進制文件。

```sh
wget -O gitea https://dl.gitea.com/gitea/@version@/gitea-@version@-linux-amd64
chmod +x gitea
```

## 驗證 GPG 簽名

Gitea 對打包的二進制文件使用 [GPG 密鑰](https://keys.openpgp.org/search?q=teabot%40gitea.io) 簽名以防止篡改。
請根據對應文件名 `.asc` 中包含的校驗碼檢驗文件的一致性。

```sh
gpg --keyserver hkps://keys.openpgp.org --recv 7C9E68152594688862D62AF62D9AE806EC1592E2
gpg --verify gitea-@version@-linux-amd64.asc gitea-@version@-linux-amd64
```

校驗正確時的資訊為 `Good signature from "Teabot <teabot@gitea.io>"`。
校驗錯誤時的資訊為 `This key is not certified with a trusted signature!`。

## 伺服器設定

**提示：** `GITEA_WORK_DIR` 表示 Gitea 工作的路徑。以下路徑可以透過 [環境變量](../administration/environment-variables.md) 初始化。

### 準備環境

檢查是否安裝 Git。要求 Git 版本 >= 2.0。

```sh
git --version
```

建立使用者（推薦使用名稱 `git`）

```sh
# On Ubuntu/Debian:
adduser \
   --system \
   --shell /bin/bash \
   --gecos 'Git Version Control' \
   --group \
   --disabled-password \
   --home /home/git \
   git

# On Fedora/RHEL/CentOS:
groupadd --system git
adduser \
   --system \
   --shell /bin/bash \
   --comment 'Git Version Control' \
   --gid git \
   --home-dir /home/git \
   --create-home \
   git
```

### 建立工作路徑

```sh
mkdir -p /var/lib/gitea/{custom,data,log}
chown -R git:git /var/lib/gitea/
chmod -R 750 /var/lib/gitea/
mkdir /etc/gitea
chown root:git /etc/gitea
chmod 770 /etc/gitea
```

> **注意：** 為了讓 Web 安裝程式可以寫入設定文件，我們臨時為 `/etc/gitea` 路徑授予了組外使用者 `git` 寫入權限。建議在安裝結束後將設定文件的權限設定為只讀。
>
> ```sh
> chmod 750 /etc/gitea
> chmod 640 /etc/gitea/app.ini
> ```

如果您不希望通過 Web 安裝程式建立設定文件，可以將設定文件設定為僅供 Gitea 使用者只讀（owner/group `root:git`, mode `0640`）並手工建立設定文件：

- 設定 `INSTALL_LOCK=true` 關閉安裝介面
- 手動設定資料庫連接參數
- 使用 `gitea generate secret` 建立 `SECRET_KEY` 和 `INTERNAL_TOKEN`
- 提供所有必要的密鑰

詳情參考 [命令行文件](../administration/command-line.md) 中有關 `gitea generate secret` 的內容。

### 設定 Gitea 工作路徑

**提示：** 如果使用 Systemd 管理 Gitea 的 Linux 服務，你可以採用 `WorkingDirectory` 參數來設定工作路徑。 否則，使用環境變量 `GITEA_WORK_DIR` 來明確指出程式工作和資料存放路徑。

```sh
export GITEA_WORK_DIR=/var/lib/gitea/
```

### 複製二進制文件到全域位置

```sh
cp gitea /usr/local/bin/gitea
```

### 添加 bash/zsh 自動補全（從 1.19 版本開始）

可以在 [`contrib/autocompletion/bash_autocomplete`](https://raw.githubusercontent.com/go-gitea/gitea/main/contrib/autocompletion/bash_autocomplete) 找到啟用 bash 自動補全的腳本。可以將其複製到 `/usr/share/bash-completion/completions/gitea`，或在 `.bashrc` 中引用。

同樣地，zsh 自動補全的腳本可以在 [`contrib/autocompletion/zsh_autocomplete`](https://raw.githubusercontent.com/go-gitea/gitea/main/contrib/autocompletion/zsh_autocomplete) 找到。您可以將其複製到 `/usr/share/zsh/_gitea`，或在您的 `.zshrc` 中引用。

具體情況可能會有所不同，這些腳本可能需要進一步的改進。

## 運行 Gitea

完成以上步驟後，可以透過兩種方式運行 Gitea：

### 1. 建立服務自動啟動 Gitea（推薦）

學習建立 [Linux 服務](installation/run-as-service-in-ubuntu.md)

### 2. 通過命令行終端運行

```sh
GITEA_WORK_DIR=/var/lib/gitea/ /usr/local/bin/gitea web -c /etc/gitea/app.ini
```

## 升級到最新版本

您可以透過停止程式，替換 `/usr/local/bin/gitea` 並重啟來更新到新版本。直接替換可執行程式時不要更改或使用新的文件名稱，以避免資料出錯。

建議您在更新之前進行[備份](../administration/backup-and-restore.md)。

如果您按照上述描述執行了安裝步驟，二進制文件的通用名稱應為 gitea。請勿更改此名稱，即不要包含版本號。

### 1. 使用 systemd 重新啟動 Gitea（推薦）

我們建議使用 systemd 作為服務管理器，使用 `systemctl restart gitea` 安全地重啟程式。

### 2. 非 systemd 重啟方法

使用 SIGHUP 信號關閉程式：查詢到 Gitea 程式的 PID，使用 `kill -1 $GITEA_PID`，或者 `killall -1 gitea`。

更優雅的停止指令可能包括 `kill $GITEA_PID` 或者 `killall gitea`。

**提示：** 我們不建議使用 SIGKILL 信號（`-9`），這會強制停止 Gitea 程式，但不會正確關閉隊列、索引器等任務。

請參閱下面的疑難解答說明，以在 Gitea 版本更新後修復損壞的儲存庫。

## 排查故障

### 舊版 glibc

舊版 Linux 發行版（例如 Debian 7 和 CentOS 6）可能無法加載 Gitea 二進制文件，通常會產生類似於 `./gitea: /lib/x86_64-linux-gnu/libc.so.6:
version 'GLIBC\_2.14' not found (required by ./gitea)` 的錯誤。這是由於 dl.gitea.com 提供的二進制文件中整合了 SQLite 支援。在這種情況下，通常可以選擇[從源程式碼安裝](installation/from-source.md)，而不包括 SQLite 支援。

### 在另一個端口上運行 Gitea

對於出現類似於 `702 runWeb()] [E] Failed to start server: listen tcp 0.0.0.0:3000:
bind: address already in use` 的錯誤，需要將 Gitea 啟動在另一個空閒端口上。您可以使用 `./gitea web -p $PORT` 來實現。可能已經有另一個 Gitea 實例在運行。

### 在 Raspbian 上運行 Gitea

從 v1.8 版本開始，arm7 版本的 Gitea 存在問題，無法在樹莓派和類似設備上運行。

建議切換到 arm6 版本，該版本經過測試並已被證明可以在樹莓派和類似設備上運行。

### 更新到新版本的 Gitea 後出現的 Git 錯誤

如果在更新過程中，二進制文件的名稱已更改為新版本的 Gitea，則現有儲存庫中的 Git 鉤子將不再起作用。在這種情況下，當推送到儲存庫時，會顯示 Git 錯誤。

```
remote: ./hooks/pre-receive.d/gitea: line 2: [...]: No such file or directory
```

錯誤資訊中的 `[...]` 部分將包含您先前 Gitea 二進制文件的路徑。

要解決此問題，請轉到管理選項，並運行任務 `Resynchronize pre-receive, update and post-receive hooks of all repositories`，以將所有鉤子更新為包含新的二進制文件路徑。請注意，這將覆蓋所有 Git 鉤子，包括自訂的鉤子。

如果您沒有使用 Gitea 內置的 SSH 伺服器，您還需要通過在管理選項中運行任務 `Update the '.ssh/authorized_keys' file with Gitea SSH keys.` 來重新編寫授權密鑰文件。

> 更多經驗總結，請參考英文版 [Troubleshooting](https://docs.gitea.com/installation/install-from-binary#troubleshooting)

如果從本頁中沒有找到你需要的內容，請前往 [幫助頁面](help/support.md)
