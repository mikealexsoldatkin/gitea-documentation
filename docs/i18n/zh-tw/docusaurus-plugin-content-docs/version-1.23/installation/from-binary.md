---
date: "2017-06-19T12:00:00+02:00"
slug: "install-from-binary"
sidebar_position: 15
aliases:
  - /zh-tw/install-from-binary
---

# 從二進制安裝

所有下載都支援 SQLite、MySQL 和 PostgreSQL，並內置資產。這可能與 Gogs 不同。

## 下載

您可以從[下載頁面](https://dl.gitea.com/gitea/)找到與您的平台匹配的文件，然後導航到您要下載的版本。

### 選擇正確的文件

**對於 Linux**，您可能需要 `linux-amd64`。它適用於 64 位 Intel/AMD 平台，但還有其他可用平台，包括 `arm64`（例如 Raspberry PI 4）、`386`（即 32 位）、`arm-5` 和 `arm-6`。

**對於 Windows**，您可能需要 `windows-4.0-amd64`。它適用於所有現代版本的 Windows，但還有一個 `386` 平台可用，專為舊的 32 位版本的 Windows 設計。

:::info
還有一個 `gogit-windows` 文件可用，它是為瞭解決一些[性能問題](https://github.com/go-gitea/gitea/pull/15482)而建立的，這些問題是一些 Windows 使用者在舊系統/版本上報告的。如果您遇到性能問題，應該考慮使用此文件，並讓我們知道它是否改善了性能。
:::

**對於 macOS**，如果您的硬件使用 Apple Silicon，您應該選擇 `darwin-arm64`，或者對於 Intel 選擇 `darwin-amd64`。

**對於 FreeBSD**，您應該選擇 `freebsd12-amd64`，適用於 64 位 Intel/AMD 平台。

### 使用 wget 下載

複製以下命令並將 URL 替換為您希望下載的 URL。

```shell
wget -O gitea https://dl.gitea.com/gitea/@version@/gitea-@version@-linux-amd64
chmod +x gitea
```

請注意，上述命令將下載 64 位 Linux 的 Gitea @version@。

## 驗證 GPG 簽名

Gitea 使用 [GPG 密鑰](https://keys.openpgp.org/search?q=teabot%40gitea.io) 簽署所有二進制文件，以防止二進制文件被未經授權的修改。
要驗證二進制文件，請下載您下載的二進制文件的簽名文件，該文件以 `.asc` 結尾，並使用 GPG 命令行工具。

```sh
gpg --keyserver hkps://keys.openpgp.org --recv 7C9E68152594688862D62AF62D9AE806EC1592E2
gpg --verify gitea-@version@-linux-amd64.asc gitea-@version@-linux-amd64
```

查找文本 `Good signature from "Teabot <teabot@gitea.io>"` 以確認二進制文件良好，
儘管有 `This key is not certified with a trusted signature!` 之類的警告。

## 推薦的伺服器設定

:::note
以下許多目錄也可以使用[環境變量](../administration/environment-variables.md)進行設定！
值得注意的是，設定 `GITEA_WORK_DIR` 將告訴 Gitea 將其工作目錄設定在哪裡，並簡化安裝過程。
:::

### 準備環境

檢查伺服器上是否安裝了 Git。如果沒有，請先安裝它。Gitea 需要 Git 版本 >= 2.0。

```sh
git --version
```

建立一個使用者來運行 Gitea（例如 `git`）

```sh
# 在 Ubuntu/Debian 上：
adduser \
   --system \
   --shell /bin/bash \
   --gecos 'Git 版本控制' \
   --group \
   --disabled-password \
   --home /home/git \
   git

# 在 Fedora/RHEL/CentOS 上：
groupadd --system git
adduser \
   --system \
   --shell /bin/bash \
   --comment 'Git 版本控制' \
   --gid git \
   --home-dir /home/git \
   --create-home \
   git
```

### 建立所需的目錄結構

```sh
mkdir -p /var/lib/gitea/{custom,data,log}
chown -R git:git /var/lib/gitea/
chmod -R 750 /var/lib/gitea/
mkdir /etc/gitea
chown root:git /etc/gitea
chmod 770 /etc/gitea
```

:::note

> `/etc/gitea` 暫時設定為使用者 `git` 的寫入權限，以便 Web 安裝程式可以寫入設定文件。安裝完成後，建議將權限設定為只讀：
> :::

> ```sh
> chmod 750 /etc/gitea
> chmod 640 /etc/gitea/app.ini
> ```

如果您不希望 Web 安裝程式能夠寫入設定文件，可以使設定文件對 Gitea 使用者（所有者/組 `root:git`，模式 `0640`）只讀，但您需要手動編輯設定文件以：

- 設定 `INSTALL_LOCK= true`，
- 確保所有資料庫設定詳細資訊正確設定
- 確保設定了 `SECRET_KEY` 和 `INTERNAL_TOKEN` 值。（您可能需要使用 `gitea generate secret` 來生成這些密鑰。）
- 確保設定了您需要的任何其他密鑰。

有關使用 `gitea generate secret` 的資訊，請參閱[命令行文件](../administration/command-line.md)。

### 設定 Gitea 的工作目錄

:::note
如果您計劃將 Gitea 作為 Linux 服務運行，則可以跳過此步驟，因為服務文件允許您設定 `WorkingDirectory`。否則，請考慮（半）永久性地設定此環境變量，以便 Gitea 始終使用正確的工作目錄。
:::

```sh
export GITEA_WORK_DIR=/var/lib/gitea/
```

### 將 Gitea 二進制文件複製到全域位置

```sh
cp gitea /usr/local/bin/gitea
```

### 添加 bash/zsh 自動補全（從 1.19 開始）

可以在 [`contrib/autocompletion/bash_autocomplete`](https://raw.githubusercontent.com/go-gitea/gitea/main/contrib/autocompletion/bash_autocomplete) 找到啟用 bash 補全的腳本。這可以複製到 `/usr/share/bash-completion/completions/gitea`
或在您的 `.bashrc` 中引用。

## 同樣，zsh 補全的腳本可以在 [`contrib/autocompletion/zsh_autocomplete`](https://raw.githubusercontent.com/go-gitea/gitea/main/contrib/autocompletion/zsh_autocomplete) 中找到。這可以複製到 `/usr/share/zsh/_gitea` 或在您的

date: "2017-06-19T12:00:00+02:00"
slug: "install-from-binary"
sidebar_position: 15
aliases:

- /zh-tw/install-from-binary

---

# Installation from binary

All downloads come with SQLite, MySQL and PostgreSQL support, and are built with
embedded assets. This can be different from Gogs.

## Download

You can find the file matching your platform from the [downloads page](https://dl.gitea.com/gitea/) after navigating to the version you want to download.

### Choosing the right file

**For Linux**, you will likely want `linux-amd64`. It's for 64-bit Intel/AMD platforms, but there are other platforms available, including `arm64` (e.g. Raspberry PI 4), `386` (i.e. 32-bit), `arm-5`, and `arm-6`.

**For Windows**, you will likely want `windows-4.0-amd64`. It's for all modern versions of Windows, but there is also a `386` platform available designed for older, 32-bit versions of Windows.

:::info
There is also a `gogit-windows` file available that was created to help with some [performance problems](https://github.com/go-gitea/gitea/pull/15482) reported by some Windows users on older systems/versions. You should consider using this file if you're experiencing performance issues, and let us know if it improves performance.
:::

**For macOS**, you should choose `darwin-arm64` if your hardware uses Apple Silicon, or `darwin-amd64` for Intel.

**For FreeBSD**, you should choose `freebsd12-amd64` for 64-bit Intel/AMD platforms.

### Downloading with wget

Copy the commands below and replace the URL within the one you wish to download.

```shell
wget -O gitea https://dl.gitea.com/gitea/@version@/gitea-@version@-linux-amd64
chmod +x gitea
```

Note that the above command will download Gitea @version@ for 64-bit Linux.

## Verify GPG signature

Gitea signs all binaries with a [GPG key](https://keys.openpgp.org/search?q=teabot%40gitea.io) to prevent against unwanted modification of binaries.
To validate the binary, download the signature file which ends in `.asc` for the binary you downloaded and use the GPG command line tool.

```sh
gpg --keyserver hkps://keys.openpgp.org --recv 7C9E68152594688862D62AF62D9AE806EC1592E2
gpg --verify gitea-@version@-linux-amd64.asc gitea-@version@-linux-amd64
```

Look for the text `Good signature from "Teabot <teabot@gitea.io>"` to assert a good binary,
despite warnings like `This key is not certified with a trusted signature!`.

## Recommended server configuration

:::note
Many of the following directories can be configured using [Environment Variables](../administration/environment-variables.md) as well!
Of note, configuring `GITEA_WORK_DIR` will tell Gitea where to base its working directory, as well as ease installation.
:::

### Prepare environment

Check that Git is installed on the server. If it is not, install it first. Gitea requires Git version >= 2.0.

```sh
git --version
```

Create a user to run Gitea (e.g. `git`)

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

### Create required directory structure

```sh
mkdir -p /var/lib/gitea/{custom,data,log}
chown -R git:git /var/lib/gitea/
chmod -R 750 /var/lib/gitea/
mkdir /etc/gitea
chown root:git /etc/gitea
chmod 770 /etc/gitea
```

:::note

> `/etc/gitea` is temporarily set with write permissions for user `git` so that the web installer can write the configuration file. After the installation is finished, it is recommended to set permissions to read-only using:
> :::

> ```sh
> chmod 750 /etc/gitea
> chmod 640 /etc/gitea/app.ini
> ```

If you don't want the web installer to be able to write to the config file, it is possible to make the config file read-only for the Gitea user (owner/group `root:git`, mode `0640`) however you will need to edit your config file manually to:

- Set `INSTALL_LOCK= true`,
- Ensure all database configuration details are set correctly
- Ensure that the `SECRET_KEY` and `INTERNAL_TOKEN` values are set. (You may want to use the `gitea generate secret` to generate these secret keys.)
- Ensure that any other secret keys you need are set.

See the [command line documentation](../administration/command-line.md) for information on using `gitea generate secret`.

### Configure Gitea's working directory

:::note
If you plan on running Gitea as a Linux service, you can skip this step, as the service file allows you to set `WorkingDirectory`. Otherwise, consider setting this environment variable (semi-)permanently so that Gitea consistently uses the correct working directory.
:::

```sh
export GITEA_WORK_DIR=/var/lib/gitea/
```

### Copy the Gitea binary to a global location

```sh
cp gitea /usr/local/bin/gitea
```

### Adding bash/zsh autocompletion (from 1.19)

A script to enable bash-completion can be found at [`contrib/autocompletion/bash_autocomplete`](https://raw.githubusercontent.com/go-gitea/gitea/main/contrib/autocompletion/bash_autocomplete). This can be copied to `/usr/share/bash-completion/completions/gitea`
or sourced within your `.bashrc`.

Similarly a script for zsh-completion can be found at [`contrib/autocompletion/zsh_autocomplete`](https://raw.githubusercontent.com/go-gitea/gitea/main/contrib/autocompletion/zsh_autocomplete). This can be copied to `/usr/share/zsh/_gitea` or sourced within your
`.zshrc`.

YMMV and these scripts may need further improvement.

## Running Gitea

After you complete the above steps, you can run Gitea two ways:

### 1. Creating a service file to start Gitea automatically (recommended)

See how to create [Linux service](installation/run-as-service-in-ubuntu.md)

### 2. Running from command-line/terminal

```sh
GITEA_WORK_DIR=/var/lib/gitea/ /usr/local/bin/gitea web -c /etc/gitea/app.ini
```

## Updating to a new version

You can update to a new version of Gitea by stopping Gitea, replacing the binary at `/usr/local/bin/gitea` and restarting the instance.
The binary file name should not be changed during the update to avoid problems in existing repositories.

It is recommended that you make a [backup](../administration/backup-and-restore.md) before updating your installation.

If you have carried out the installation steps as described above, the binary should
have the generic name `gitea`. Do not change this, i.e. to include the version number.

### 1. Restarting Gitea with systemd (recommended)

As we explained before, we recommend to use systemd as the service manager. In this case, `systemctl restart gitea` should be fine.

### 2. Restarting Gitea without systemd

To restart your Gitea instance, we recommend to use SIGHUP signal. If you know your Gitea PID, use `kill -1 $GITEA_PID`, otherwise you can use `killall -1 gitea`.

To gracefully stop the Gitea instance, a simple `kill $GITEA_PID` or `killall gitea` is enough.

:::note
We don't recommend to use the SIGKILL signal (`-9`); you may be forcefully stopping some of Gitea's internal tasks, and it will not gracefully stop (tasks in queues, indexers, etc.)
:::

See below for troubleshooting instructions to repair broken repositories after
an update of your Gitea version.

## Troubleshooting

### Old glibc versions

Older Linux distributions (such as Debian 7 and CentOS 6) may not be able to load the
Gitea binary, usually producing an error such as `./gitea: /lib/x86_64-linux-gnu/libc.so.6:
version 'GLIBC\_2.14' not found (required by ./gitea)`. This is due to the integrated
SQLite support in the binaries provided by dl.gitea.com. In this situation, it is usually
possible to [install from source](installation/from-source.md), without including
SQLite support.

### Running Gitea on another port

For errors like `702 runWeb()] [E] Failed to start server: listen tcp 0.0.0.0:3000:
bind: address already in use`, Gitea needs to be started on another free port. This
is possible using `./gitea web -p $PORT`. It's possible another instance of Gitea
is already running.

### Running Gitea on Raspbian

As of v1.8, there is a problem with the arm7 version of Gitea, and it doesn't run on Raspberry Pis and similar devices.

It is recommended to switch to the arm6 version, which has been tested and shown to work on Raspberry Pis and similar devices.

{/* please remove after fixing the arm7 bug */}

### Git error after updating to a new version of Gitea

If during the update, the binary file name has been changed to a new version of Gitea,
Git Hooks in existing repositories will not work any more. In that case, a Git
error will be displayed when pushing to the repository.

```
remote: ./hooks/pre-receive.d/gitea: line 2: [...]: No such file or directory
```

The `[...]` part of the error message will contain the path to your previous Gitea
binary.

To solve this, go to the admin options and run the task `Resynchronize pre-receive,
update and post-receive hooks of all repositories` to update all hooks to contain
the new binary path. Please note that this overwrites all Git Hooks, including ones
with customizations made.

If you aren't using the Gitea built-in SSH server, you will also need to re-write
the authorized key file by running the `Update the '.ssh/authorized_keys' file with
Gitea SSH keys.` task in the admin options.
