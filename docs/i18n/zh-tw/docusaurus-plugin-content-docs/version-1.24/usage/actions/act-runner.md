---
date: "2023-05-24T15:00:00+08:00"
slug: "act-runner"
sidebar_position: 20
---

# Act Runner

本頁面將詳細介紹[Act Runner](https://gitea.com/gitea/act_runner)，這是Gitea Actions的Runner。

## 要求

建議在Docker容器中運行Job，因此您需要首先安裝Docker。
並確保Docker守護進程正在運行。

其他與Docker API相容的OCI容器引擎也應該可以正常工作，但尚未經過測試。

但是，如果您確定要直接在主機上運行Job，則不需要Docker。

## 安裝

有多種安裝Act Runner的方法。

### 下載二進制文件

您可以從[發佈頁面](https://gitea.com/gitea/act_runner/releases)下載二進制文件。
然而，如果您想使用最新的夜間構建版本，可以從[下載頁面](https://dl.gitea.com/act_runner/)下載。

下載二進制文件時，請確保您已經下載了適用於您的平台的正確版本。
您可以透過運行以下命令進行檢查：

```bash
chmod +x act_runner
./act_runner --version
```

如果看到版本資訊，則表示您已經下載了正確的二進制文件。

### 使用 Docker 鏡像

您可以使用[docker hub](https://hub.docker.com/r/gitea/act_runner/tags)上的Docker鏡像。
與二進制文件類似，您可以使用`nightly`標籤使用最新的夜間構建版本，而`latest`標籤是最新的穩定版本。

```bash
docker pull docker.io/gitea/act_runner:latest # for the latest stable release
docker pull docker.io/gitea/act_runner:nightly # for the latest nightly build
```

## 設定

設定通過設定文件進行。它是可選的，當沒有指定設定文件時，將使用預設設定。

您可以透過運行以下命令生成設定文件：

```bash
./act_runner generate-config
```

預設設定是安全的，可以直接使用。

```bash
./act_runner generate-config > config.yaml
./act_runner --config config.yaml [command]
```

您亦可以如下使用 docker 建立設定文件：

```bash
docker run --entrypoint="" --rm -it docker.io/gitea/act_runner:latest act_runner generate-config > config.yaml
```

當使用Docker鏡像時，可以使用`CONFIG_FILE`環境變量指定設定文件。確保將文件作為卷掛載到容器中：

```bash
docker run -v $(pwd)/config.yaml:/config.yaml -e CONFIG_FILE=/config.yaml ...
```

您可能注意到上面的命令都是不完整的，因為現在還不是運行Act Runner的時候。
在運行Act Runner之前，我們需要首先將其註冊到您的Gitea實例中。

## 註冊

在運行Act Runner之前，需要進行註冊，因為Runner需要知道從哪裡獲取Job，並且對於Gitea實例來說，識別Runner也很重要。

### Runner級別

您可以在不同級別上註冊Runner，它可以是：

- 實例級別：Runner將為實例中的所有儲存庫運行Job。
- 組織級別：Runner將為組織中的所有儲存庫運行Job。
- 儲存庫級別：Runner將為其所屬的儲存庫運行Job。

請注意，即使儲存庫具有自己的儲存庫級別Runner，它仍然可以使用實例級別或組織級別Runner。未來的版本可能提供更多對此進行更好控制的選項。

### 獲取註冊令牌

Runner級別決定了從哪裡獲取註冊令牌。

- 實例級別：管理員設定頁面，例如 `<your_gitea.com>/admin/actions/runners`。
- 組織級別：組織設定頁面，例如 `<your_gitea.com>/<org>/settings/actions/runners`。
- 儲存庫級別：儲存庫設定頁面，例如 `<your_gitea.com>/<owner>/<repo>/settings/actions/runners`。

如果您無法看到設定頁面，請確保您具有正確的權限並且已啟用 Actions。

註冊令牌的格式是一個隨機字符串 `D0gvfu2iHfUjNqCYVljVyRV14fISpJxxxxxxxxxx`。

註冊令牌也可以透過 Gitea 的 [命令行](/administration/command-line#actions-generate-runner-token) 獲得:

```
gitea --config /etc/gitea/app.ini actions generate-runner-token
```

使用者也可以使用 `GITEA_RUNNER_REGISTRATION_TOKEN` 或 `GITEA_RUNNER_REGISTRATION_TOKEN_FILE` 環境變量以在 Gitea 啟動時設定全域的註冊令牌，例如：

```
openssl rand -hex 24 > /some-dir/runner-token
export GITEA_RUNNER_REGISTRATION_TOKEN_FILE=/some-dir/runner-token
./gitea --config ...
```

來自環境變量的令牌在通過 Web 介面或 API 重置(重新建立新令牌)前將一直有效。

令牌可用於註冊多個 Runner，直到使用 Web 介面中的令牌重置鏈接將其撤銷並替換為新令牌。

### 註冊Runner

可以透過運行以下命令來註冊Act Runner：

```bash
./act_runner register
```

或者，您可以使用 `--config` 選項來指定前面部分提到的設定文件。

```bash
./act_runner --config config.yaml register
```

您將逐步輸入註冊資訊，包括：

- Gitea 實例的 URL，例如 `https://gitea.com/` 或 `http://192.168.8.8:3000/`。
- 註冊令牌。
- Runner名稱（可選）。如果留空，將使用主機名。
- Runner標籤（可選）。如果留空，將使用預設標籤。

您可能對Runner標籤感到困惑，稍後將對其進行解釋。

如果您想以非交互方式註冊Runner，可以使用參數執行以下操作。

```bash
./act_runner register --no-interactive --instance <instance_url> --token <registration_token> --name <runner_name> --labels <runner_labels>
```

註冊Runner後，您可以在當前目錄中找到一個名為 `.runner` 的新文件。該文件儲存註冊資訊。
請不要手動編輯該文件。
如果此文件丟失或損壞，可以直接刪除它並重新註冊。

如果您想將註冊資訊儲存在其他位置，請在設定文件中指定，並不要忘記指定 `--config` 選項。

### 使用Docker註冊Runner

如果您使用的是Docker鏡像，註冊行為會略有不同。在這種情況下，註冊和運行合併為一步，因此您需要在運行Act Runner時指定註冊資訊。

```bash
docker run \
    -v $(pwd)/config.yaml:/config.yaml \
    -v $(pwd)/data:/data \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -e CONFIG_FILE=/config.yaml \
    -e GITEA_INSTANCE_URL=<instance_url> \
    -e GITEA_RUNNER_REGISTRATION_TOKEN=<registration_token> \
    -e GITEA_RUNNER_NAME=<runner_name> \
    -e GITEA_RUNNER_LABELS=<runner_labels> \
    --name my_runner \
    -d gitea/act_runner:nightly
```

您可能注意到我們已將`/var/run/docker.sock`掛載到容器中。
這是因為Act Runner將在Docker容器中運行Job，因此它需要與Docker守護進程進行通信。
如前所述，如果要在主機上直接運行Job，可以將其移除。
需要明確的是，這裡的 "主機" 實際上指的是當前運行 Act Runner的容器，而不是主機機器本身。

### 使用 Docker compose 運行 Runner

您亦可使用如下的 `docker-compose.yml`:

```yml
version: "3.8"
services:
  runner:
    image: gitea/act_runner:nightly
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

### 當您使用 Docker 鏡像啟動 Runner，如何設定 Cache

如果你不打算在工作流中使用 `actions/cache`，你可以忽略本段。

如果您在使用 `actions/cache` 時沒有進行額外的設定，將會返回以下錯誤資訊：
> Failed to restore: getCacheEntry failed: connect ETIMEDOUT IP:PORT

這個錯誤的原因是 runner 容器和作業容器位於不同的網路中，因此作業容器無法訪問 runner 容器。
因此，設定 cache 動作以確保其正常運行是非常重要的。請按照以下步驟操作：

- 1.獲取 Runner 容器所在主機的 LAN（本地局域網） IP 地址。
- 2.獲取一個 Runner 容器所在主機的空閒端口號。
- 3.在設定文件中如下設定：

```yaml
cache:
  enabled: true
  dir: ""
  # 使用步驟 1. 獲取的 LAN IP
  host: "192.168.8.17"
  # 使用步驟 2. 獲取的端口號
  port: 8088
```

- 4.啟動容器時, 將 Cache 端口映射至主機。

```bash
docker run \
  --name gitea-docker-runner \
  -p 8088:8088 \
  -d gitea/act_runner:nightly
```

### 標籤

Runner的標籤用於確定Runner可以運行哪些Job以及如何運行它們。

預設標籤為`ubuntu-latest:docker://node:16-bullseye,ubuntu-22.04:docker://node:16-bullseye,ubuntu-20.04:docker://node:16-bullseye,ubuntu-18.04:docker://node:16-buster`。
它們是逗號分隔的列表，每個專案都是一個標籤。

讓我們以 `ubuntu-22.04:docker://node:16-bullseye` 為例。
它意味著Runner可以運行帶有`runs-on: ubuntu-22.04`的Job，並且該Job將在使用`node:16-bullseye`鏡像的Docker容器中運行。

如果預設鏡像無法滿足您的需求，並且您有足夠的硬碟空間可以使用更好、更大的鏡像，您可以將其更改為`ubuntu-22.04:docker://<您喜歡的鏡像>`。
您可以在[act 鏡像](https://github.com/nektos/act/blob/master/IMAGES.md)上找到更多有用的鏡像。

如果您想直接在主機上運行Job，您可以將其更改為`ubuntu-22.04:host`或僅`ubuntu-22.04`，`:host`是可選的。
然而，我們建議您使用類似`linux_amd64:host`或`windows:host`的特殊名稱，以避免誤用。

從 Gitea 1.21 開始，您可以透過修改 runner 的設定文件中的 `container.labels` 來更改標籤（如果沒有設定文件，請參考 [設定教學](#設定)），透過執行 `./act_runner daemon --config config.yaml` 命令重啟 runner 之後，這些新定義的標籤就會生效。

## 運行

註冊完Runner後，您可以透過運行以下命令來運行它：

```bash
./act_runner daemon
# or
./act_runner daemon --config config.yaml
```

Runner將從Gitea實例獲取Job並自動運行它們。

由於Act Runner仍處於開發中，建議定期檢查最新版本並進行升級。
