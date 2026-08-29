---
date: "2023-04-27T15:00:00+08:00"
slug: "act-runner"
sidebar_position: 20
---

# Act Runner

本頁將詳細介紹 [act runner](https://gitea.com/gitea/act_runner)，這是 Gitea Actions 的 runner。

## 要求

目前 runner 支援兩種運行模式。一種是在 docker 容器中運行，另一種是在主機上運行。如果選擇在 [docker](https://docker.com) 容器中運行作業，建議先 [安裝 docker](https://docs.docker.com/engine/install/) 並確保 docker 守護進程正在運行。

其他與 Docker API 相容的 OCI 容器引擎也應該可以工作，但未經測試。

但是，如果您確定只想在主機上直接運行作業，則不需要 docker。

有多種方法可以安裝 act runner。

## 使用二進制文件安裝

### 下載二進制文件

您可以從 [發布頁面](https://gitea.com/gitea/act_runner/releases) 下載二進制文件。
但是，如果您想使用最新的夜間構建，可以從 [下載頁面](https://dl.gitea.com/act_runner/) 下載。

下載二進制文件時，請確保下載了適合您平台的正確文件。
如果您使用的是類 Unix 操作系統，可以透過運行以下命令進行檢查。

```bash
chmod +x act_runner
./act_runner --version
```

如果看到版本資訊，則表示您已下載了正確的二進制文件。

### 獲取註冊令牌

您可以在不同級別註冊 runner，它可以是：

- 實例級別：runner 將為實例中的所有儲存庫運行作業。
- 組織級別：runner 將為組織中的所有儲存庫運行作業。
- 儲存庫級別：runner 將為其所屬的儲存庫運行作業。

請注意，即使儲存庫有自己的儲存庫級別 runner，它仍然可以使用實例級別或組織級別的 runner。未來的版本可能會提供更多控制選項。

在註冊 runner 並運行它之前，您需要一個註冊令牌。runner 的級別決定了從哪裡獲取註冊令牌。

- 實例級別：管理員設定頁面，例如 `<your_gitea.com>/admin/actions/runners`。
- 組織級別：組織設定頁面，例如 `<your_gitea.com>/<org>/settings/actions/runners`。
- 儲存庫級別：儲存庫設定頁面，例如 `<your_gitea.com>/<owner>/<repo>/settings/actions/runners`。

如果看不到設定頁面，請確保您具有正確的權限並且已啟用 Actions。

註冊令牌的格式是一個隨機字符串 `D0gvfu2iHfUjNqCYVljVyRV14fISpJxxxxxxxxxx`。

註冊令牌也可以從 gitea [命令行介面](/administration/command-line#actions-generate-runner-token) 獲取：

```
gitea --config /etc/gitea/app.ini actions generate-runner-token
```

令牌在註銷並使用 Web 介面中的令牌重置鏈接替換為新令牌之前，對註冊多個 runner 有效。

### 設定

設定是通過設定文件完成的。它是可選的，當未指定設定文件時，將使用預設設定。您可以透過運行以下命令生成設定文件：

```bash
./act_runner generate-config
```

預設設定是安全的，可以直接使用。

```bash
./act_runner generate-config > config.yaml
./act_runner --config config.yaml [command]
```

### 註冊 runner

在運行 act runner 之前需要註冊，因為 runner 需要知道從哪裡獲取作業。這對於 Gitea 實例識別 runner 也很重要。

如果使用二進制包安裝，可以透過運行以下命令註冊 act runner。

```bash
./act_runner register
```

或者，您可以使用 `--config` 選項指定前面提到的設定文件。

```bash
./act_runner --config config.yaml register
```

您將被要求逐步輸入註冊資訊，包括：

- Gitea 實例 URL，例如 `https://gitea.com/` 或 `http://192.168.8.8:3000/`。
- 註冊令牌。
- runner 名稱，可選。如果留空，將使用主機名。
- runner 標籤，可選。如果留空，將使用預設標籤。

您可能會對 runner 標籤感到困惑，稍後將解釋。

如果您想以非交互方式註冊 runner，可以使用參數進行註冊。

```bash
./act_runner register --no-interactive --instance <instance_url> --token <registration_token> --name <runner_name> --labels <runner_labels>
```

註冊 runner 後，您可以在當前目錄中找到一個名為 `.runner` 的新文件。
該文件儲存註冊資訊。
請不要手動編輯它。
如果該文件丟失或損壞，您可以簡單地刪除它並重新註冊。

如果您想將註冊資訊儲存在其他位置，可以在設定文件中指定，
並且不要忘記指定 `--config` 選項。

### 在命令行中啟動 runner

註冊 runner 後，可以透過運行以下命令運行它：

```shell
./act_runner daemon
```

或

```bash
./act_runner daemon --config config.yaml
```

runner 將從 Gitea 實例中獲取作業並自動運行它們。

### 使用 Systemd 啟動 runner

也可以將 act-runner 作為 [systemd](https://en.wikipedia.org/wiki/Systemd) 服務運行。在系統上建立一個非特權的 `act_runner` 使用者，並在 `/etc/systemd/system/act_runner.service` 中建立以下文件。`ExecStart` 和 `WorkingDirectory` 中的路徑可能需要根據您安裝 `act_runner` 二進制文件、其設定文件和 `act_runner` 使用者的主目錄進行調整。

```ini
[Unit]
Description=Gitea Actions runner
Documentation=https://gitea.com/gitea/act_runner
After=docker.service

[Service]
ExecStart=/usr/local/bin/act_runner daemon --config /etc/act_runner/config.yaml
ExecReload=/bin/kill -s HUP $MAINPID
WorkingDirectory=/var/lib/act_runner
TimeoutSec=0
RestartSec=10
Restart=always
User=act_runner

[Install]
WantedBy=multi-user.target
```

然後：

```bash
# 加載新的 systemd 單元文件
sudo systemctl daemon-reload
# 啟動服務並在啟動時啟用它
sudo systemctl enable act_runner --now
```

如果使用 Docker，應在啟動服務之前將 `act_runner` 使用者添加到 `docker` 組。請記住，這實際上給了 `act_runner` 對系統的 root 存取權限 [[1]](https://docs.docker.com/engine/security/#docker-daemon-attack-surface)。

### 使用 LaunchDaemon(macOS) 啟動 runner

Mac 使用 `launchd` 代替 systemd 註冊守護進程。預設情況下，守護進程以 root 使用者身份運行，因此如果需要，可以透過 `dscl` 工具建立一個非特權的 `_act_runner` 使用者。然後應在 `/Library/LaunchDaemon/com.gitea.act_runner.plist` 目錄中建立以下文件。`WorkingDirectory`、`ProgramArguments`、`StandardOutPath`、`StandardErrPath` 和 `HOME` 環境變量的路徑可能需要更新以反映您的安裝。此外，任何不在範例 `PATH` 中的可執行文件都需要顯式包含，並且不會從現有設定中繼承。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.gitea.act_runner</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/act_runner</string>
        <string>daemon</string>
        <string>--config</string>
        <string>/etc/act_runner/config.yaml</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>WorkingDirectory</key>
    <string>/var/lib/act_runner</string>
    <key>StandardOutPath</key>
    <string>/var/lib/act_runner/act_runner.log</string>
    <key>StandardErrorPath</key>
    <string>/var/lib/act_runner/act_runner.err</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
        <key>HOME</key>
        <string>/var/lib/act_runner</string>
    </dict>
    <key>UserName</key>
    <string>_act_runner</string>
</dict>
</plist>
```

然後：

```bash
sudo launchctl load /Library/LaunchDaemon/com.gitea.act_runner.plist
```

您還可以設定 Linux 服務或 Windows 服務，以便 runner 自動運行。

## 使用 docker 映像安裝

### 拉取映像

您可以從 [docker hub](https://hub.docker.com/r/gitea/act_runner/tags) 使用 docker 映像。
就像二進制文件一樣，您可以使用 `nightly` 標籤使用最新的夜間構建，而 `latest` 標籤是最新的穩定版本。

```bash
docker pull docker.io/gitea/act_runner:latest # 用於最新的穩定版本
```

如果您想測試新功能，也可以使用 nightly 映像

```bash
docker pull docker.io/gitea/act_runner:nightly # 用於最新的夜間構建
```

### 設定

設定是可選的，但您也可以使用 docker 生成設定文件：

```bash
docker run --entrypoint="" --rm -it docker.io/gitea/act_runner:latest act_runner generate-config > config.yaml
```

使用 docker 映像時，可以使用 `CONFIG_FILE` 環境變量指定設定文件。確保該文件已作為卷掛載到容器中：

```bash
docker run -v $PWD/config.yaml:/config.yaml -e CONFIG_FILE=/config.yaml ...
```

您可能會注意到上面的命令都是不完整的，因為現在還不是運行 act runner 的時候。
在運行 act runner 之前，我們需要先將其註冊到您的 Gitea 實例。

### 使用 docker 啟動 runner

如果您使用的是 docker 映像，行為會略有不同。在這種情況下，註冊和運行結合為一步，因此您需要在運行 act runner 時指定註冊資訊。

使用 docker run 快速啟動如下。您需要從上述步驟中獲取 `<registration_token>`，並為 `<runner_name>` 提供一個特殊的唯一名稱

```bash
docker run \
    -e GITEA_INSTANCE_URL=<instance_url> \
    -e GITEA_RUNNER_REGISTRATION_TOKEN=<registration_token> \
    -e GITEA_RUNNER_NAME=<runner_name> \
    --name my_runner \
    -d docker.io/gitea/act_runner:nightly
```

有更多參數可以設定它。

```bash
docker run \
    -v $PWD/config.yaml:/config.yaml \
    -v $PWD/data:/data \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -e CONFIG_FILE=/config.yaml \
    -e GITEA_INSTANCE_URL=<instance_url> \
    -e GITEA_RUNNER_REGISTRATION_TOKEN=<registration_token> \
    -e GITEA_RUNNER_NAME=<runner_name> \
    -e GITEA_RUNNER_LABELS=<runner_labels> \
    --name my_runner \
    -d docker.io/gitea/act_runner:nightly
```

您可能會注意到我們已將 `/var/run/docker.sock` 掛載到容器中。
這是因為 act runner 將在 docker 容器中運行作業，因此需要與 docker 守護進程通信。
如前所述，如果您想在主機上直接運行作業，可以刪除它。
需要明確的是，“主機”實際上是指現在運行 act runner 的容器，而不是主機機器。

### 使用 docker compose 啟動 runner

您還可以使用以下 `docker-compose.yml` 設定 runner：

```yml
version: "3.8"
services:
  runner:
    image: docker.io/gitea/act_runner:nightly
    environment:
      CONFIG_FILE: /config.yaml
      GITEA_INSTANCE_URL: "${INSTANCE_URL}"
      GITEA_RUNNER_REGISTRATION_TOKEN: "${REGISTRATION_TOKEN}"
      GITEA_RUNNER_NAME: "${RUNNER_NAME}"
      GITEA_RUNNER_LABELS: "${RUNNER_LABELS}"
    volumes:
      - ./config.yaml:/config.yaml
      - ./data:/data
      - /var/run/docker.sock:/var/run/docker.sock
```

使用 docker 時，不需要進入容器並手動運行 `./act_runner daemon` 命令。容器成功啟動後，它將顯示為您的 Gitea 實例中的活動 runner。

## 高級設定

### 使用 docker 映像啟動 runner 時設定緩存

如果您不打算在工作流中使用 `actions/cache`，可以忽略此部分。

如果在沒有任何額外設定的情況下使用 `actions/cache`，它將返回以下錯誤：

> Failed to restore: getCacheEntry failed: connect ETIMEDOUT IP:PORT

發生此錯誤是因為 runner 容器和作業容器位於不同的網路上，因此作業容器無法訪問 runner 容器。

因此，必須設定緩存操作以確保其正常運行。請按照以下步驟操作：

- 1.獲取運行 runner 容器的主機的 LAN IP 地址。
- 2.查找運行 runner 容器的主機上的可用端口號。
- 3.在設定文件中設定以下設定：

```yaml
cache:
  enabled: true
  dir: ""
  # 使用第 1 步中獲取的 LAN IP
  host: "192.168.8.17"
  # 使用第 2 步中獲取的端口號
  port: 8088
```

- 4.啟動容器時，將緩存端口映射到主機：

```bash
docker run \
  --name gitea-docker-runner \
  -p 8088:8088 \
  -d docker.io/gitea/act_runner:nightly
```

### 標籤

runner 的標籤用於確定 runner 可以運行哪些作業以及如何運行它們。

預設標籤是 `ubuntu-latest:docker://node:16-bullseye,ubuntu-22.04:docker://node:16-bullseye,ubuntu-20.04:docker://node:16-bullseye,ubuntu-18.04:docker://node:16-buster`。
它是一個逗號分隔的列表，每個專案都是一個標籤。

以 `ubuntu-22.04:docker://node:16-bullseye` 為例。
這意味著 runner 可以運行 `runs-on: ubuntu-22.04` 的作業，並且作業將在 docker 容器中運行，映像為 `node:16-bullseye`。

如果預設映像不足以滿足您的需求，並且您有足夠的磁盤空間使用更好更大的映像，可以將其更改為 `ubuntu-22.04:docker://<the image you like>`。
您可以在 [act images](https://github.com/nektos/act/blob/master/IMAGES.md) 上找到更多有用的映像。

如果您想在主機上直接運行作業，可以將其更改為 `ubuntu-22.04:host` 或僅 `ubuntu-22.04`，`:host` 是可選的。
但是，我們建議您使用一個特殊的名稱，如 `linux_amd64:host` 或 `windows:host` 以避免誤用。

從 Gitea 1.21 開始，您可以透過修改 runner 設定文件中的 `runners.labels` 來更改標籤（如果您沒有設定文件，請參考 設定教學）。
重新啟動 runner 後，它將使用這些新標籤，即通過調用 `./act_runner daemon --config config.yaml`。
