---
date: "2020-02-09T20:00:00+02:00"
slug: "install-with-docker-rootless"
sidebar_position: 60
aliases:
  - /zh-tw/install-with-docker-rootless
---

# 使用 Docker（無根）安裝

Gitea 在其 Docker Hub 組織中提供自動更新的 Docker 映像。可以
始終使用最新的穩定標籤或使用另一個處理更新的服務
Docker 映像。

無根映像使用 Gitea 內部 SSH 提供 Git 協議，不支援 OpenSSH。

此參考設定指導使用者通過基於 `docker-compose` 的設定，但 `docker-compose` 的安裝
不在本文件的範圍內。要安裝 `docker-compose` 本身，請遵循
官方[安裝說明](https://docs.docker.com/compose/install/)。

## 基礎

最簡單的設定只是建立一個卷和一個網路，並啟動 `docker.gitea.com/gitea:latest-rootless`
作為服務的映像。由於沒有可用的資料庫，可以使用 SQLite3 進行初始化。

為 `data` 和 `config` 建立一個目錄：

```sh
mkdir -p gitea/{data,config}
cd gitea
touch docker-compose.yml
```

然後將以下內容粘貼到名為 `docker-compose.yml` 的文件中：

```yaml
version: "2"

services:
  server:
    image: docker.gitea.com/gitea:@dockerVersion@-rootless
    restart: always
    volumes:
      - ./data:/var/lib/gitea
      - ./config:/etc/gitea
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "3000:3000"
      - "2222:2222"
```

請注意，卷應由設定文件中指定的 UID/GID 的使用者/組擁有。預設情況下，docker 中的 Gitea 將使用 uid:1000 gid:1000。如果需要，您可以使用以下命令設定這些文件夾的所有權：

```sh
sudo chown 1000:1000 config/ data/
```

> 如果您未授予卷正確的權限，則容器可能無法啟動。

對於穩定版本，您可以使用 `:latest-rootless`、`:1-rootless` 或指定某個版本，例如 `:@dockerVersion@-rootless`，但如果您想使用最新的開發版本，則 `:nightly-rootless` 將是一個合適的標籤。如果您想運行來自發布分支的最新提交，您可以使用 `:1.x-nightly-rootless` 標籤，其中 x 是 Gitea 的次要版本。（例如 `:1.16-nightly-rootless`）

## 自訂端口

要在不同的端口上綁定整合的 ssh 和 web 伺服器，請調整
端口部分。通常只需更改主機端口並保持容器內的端口不變。

```diff
version: "2"

services:
  server:
    image: docker.gitea.com/gitea:@dockerVersion@-rootless
    restart: always
    volumes:
      - ./data:/var/lib/gitea
      - ./config:/etc/gitea
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
-      - "3000:3000"
-      - "2222:2222"
+      - "80:3000"
+      - "22:2222"
```

## MySQL 資料庫

要將 Gitea 與 MySQL 資料庫結合使用，請將這些更改應用到
上面建立的 `docker-compose.yml` 文件。

```diff
version: "2"

services:
  server:
    image: docker.gitea.com/gitea:@dockerVersion@-rootless
+    environment:
+      - GITEA__database__DB_TYPE=mysql
+      - GITEA__database__HOST=db:3306
+      - GITEA__database__NAME=gitea
+      - GITEA__database__USER=gitea
+      - GITEA__database__PASSWD=gitea
    restart: always
    volumes:
      - ./data:/var/lib/gitea
      - ./config:/etc/gitea
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "3000:3000"
      - "2222:2222"
+    depends_on:
+      - db
+
+  db:
+    image: docker.io/library/mysql:8
+    restart: always
+    environment:
+      - MYSQL_ROOT_PASSWORD=gitea
+      - MYSQL_USER=gitea
+      - MYSQL_PASSWORD=gitea
+      - MYSQL_DATABASE=gitea
+    volumes:
+      - ./mysql:/var/lib/mysql
```

## PostgreSQL 資料庫

要將 Gitea 與 PostgreSQL 資料庫結合使用，請將這些更改應用到
上面建立的 `docker-compose.yml` 文件。

```diff
version: "2"

services:
  server:
    image: docker.gitea.com/gitea:@dockerVersion@-rootless
    environment:
+      - GITEA__database__DB_TYPE=postgres
+      - GITEA__database__HOST=db:5432
+      - GITEA__database__NAME=gitea
+      - GITEA__database__USER=gitea
+      - GITEA__database__PASSWD=gitea
    restart: always
    volumes:
      - ./data:/var/lib/gitea
      - ./config:/etc/gitea
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "3000:3000"
      - "2222:2222"
+    depends_on:
+      - db
+
+  db:
+    image: docker.io/library/postgres:14
+    restart: always
+    environment:
+      - POSTGRES_USER=gitea
+      - POSTGRES_PASSWORD=gitea
+      - POSTGRES_DB=gitea
+    volumes:
+      - ./postgres:/var/lib/postgresql/data
```

## 命名卷

要使用命名卷而不是主機卷，請在 `docker-compose.yml` 設定中定義並使用命名卷。此更改將自動
建立所需的卷。您不需要擔心命名卷的權限；Docker 會自動處理。

```diff
version: "2"

+volumes:
+  gitea-data:
+    driver: local
+  gitea-config:
+    driver: local
+
services:
  server:
    image: docker.gitea.com/gitea:@dockerVersion@-rootless
    restart: always
    volumes:
-      - ./data:/var/lib/gitea
+      - gitea-data:/var/lib/gitea
-      - ./config:/etc/gitea
+      - gitea-config:/etc/gitea
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "3000:3000"
      - "2222:2222"
```

MySQL 或 PostgreSQL 容器需要單獨建立。

## 自訂使用者

您可以選擇使用自訂使用者（遵循 --user 標誌定義 https://docs.docker.com/engine/reference/run/#user）。
例如，要克隆主機使用者 `git` 定義，請使用命令 `id -u git` 並將其添加到 `docker-compose.yml` 文件中：
請確保掛載的文件夾可由使用者寫入。

```diff
version: "2"

services:
  server:
    image: docker.gitea.com/gitea:@dockerVersion@-rootless
    restart: always
+    user: 1001
    volumes:
      - ./data:/var/lib/gitea
      - ./config:/etc/gitea
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "3000:3000"
      - "2222:2222"
```

## 啟動

:::note
從 2023 年 7 月起，Compose V1 停止接收更新。它也不再可用於 Docker Desktop 的新版本中。

Compose V2 包含在所有當前支援的 Docker Desktop 版本中。請使用 V2 進行以下操作。
:::

要基於 `docker-compose` 啟動此設定，請執行 `docker-compose up -d`，
在後臺啟動 Gitea。使用 `docker-compose ps` 將顯示 Gitea 是否
正確啟動。可以使用 `docker-compose logs` 查看日誌。

要關閉設定，請執行 `docker-compose down`。這將停止
並殺死容器。卷將仍然存在。

:::note
如果在 http 上使用非 3000 端口，請更改 app.ini 以匹配
`LOCAL_ROOT_URL = http://localhost:3000/`。
:::

## 安裝

通過 `docker-compose` 啟動 Docker 設定後，應該可以使用
喜愛的瀏覽器完成安裝。訪問 http://server-ip:3000 並按照
安裝向導進行操作。如果資料庫是使用 `docker-compose` 設定啟動的，
如上所述，請注意 `db` 必須用作資料庫主機名。

## 自訂

[此處](../administration/customizing-gitea.md) 描述的自訂文件應
放置在 `/var/lib/gitea/custom` 目錄中。如果使用主機卷，則可以很容易地訪問這些
文件；對於命名卷，這是通過另一個容器或直接訪問
`/var/lib/docker/volumes/gitea_gitea/_/var_lib_gitea` 來完成的。設定文件將保存在
安裝後的 `/etc/gitea/app.ini` 中。

## 升級

:::warning
:exclamation::exclamation: **確保您已將資料卷掛載到 Docker 容器外的某個位置** :exclamation::exclamation:
:::

要將您的安裝升級到最新版本：

```bash
# 編輯 `docker-compose.yml` 以更新版本（如果已指定）
# 拉取新映像
docker-compose pull
# 啟動新容器，自動刪除舊容器
docker-compose up -d
```

## 從標準映像升級

- 備份您的設定
- 將卷掛載點從 /data 更改為 /var/lib/gitea
- 如果您使用了自訂 app.ini，請將其移動到掛載到 /etc/gitea 的新卷中
- 將文件夾（在卷內）重命名為 gitea 為 custom
- 如有需要，編輯 app.ini
  - 設定 START_SSH_SERVER = true
- 使用映像 docker.gitea.com/gitea:@dockerVersion@-rootless

## 使用環境變量管理部署

除了上述環境變量外，`app.ini` 中的任何設定都可以設定
或使用形式為 `GITEA__SECTION_NAME__KEY_NAME` 的環境變量覆蓋。
這些設定在每次 docker 容器啟動時應用，不會傳遞到 Gitea 的子進程中。
完整資訊[此處](https://github.com/go-gitea/gitea/tree/main/contrib/environment-to-ini)。

這些環境變量可以在 `docker-compose.yml` 中傳遞給 docker 容器。
以下範例將啟用 smtp 郵件伺服器，如果所需的環境變量
`GITEA__mailer__FROM`、`GITEA__mailer__HOST`、`GITEA__mailer__PASSWD` 在主機上設定
或在與 `docker-compose.yml` 相同的目錄中的 `.env` 文件中設定。

這些設定也可以透過定義形式為的環境變量來設定或覆蓋：
`GITEA__section_name__KEY_NAME__FILE` 指向文件。

```bash
...
services:
  server:
    environment:
      - GITEA__mailer__ENABLED=true
      - GITEA__mailer__FROM=${GITEA__mailer__FROM:?GITEA__mailer__FROM not set}
      - GITEA__mailer__PROTOCOL=smtp
      - GITEA__mailer__HOST=${GITEA__mailer__HOST:?GITEA__mailer__HOST not set}
      - GITEA__mailer__IS_TLS_ENABLED=true
      - GITEA__mailer__USER=${GITEA__mailer__USER:-apikey}
      - GITEA__mailer__PASSWD="""${GITEA__mailer__PASSWD:?GITEA__mailer__PASSWD not set}"""
```

要設定所需的 TOKEN 和 SECRET 值，請考慮使用 Gitea 的內置[生成實用程式函數](../administration/command-line.md#generate)。

# SSH 容器透傳

由於 SSH 在容器內運行，因此如果需要 SSH 支援，則需要將 SSH 從主機透傳到容器。一種選擇是將容器 SSH 運行在非標準端口上（或將主機端口移動到非標準端口）。另一種可能更直接的方法是將 SSH 命令從主機轉發到容器。以下說明瞭這種設定。

本指南假設您已在主機上建立了一個名為 `git` 的使用者，該使用者有權運行 `docker exec`，並且 Gitea 容器名為 `gitea`。您需要修改該使用者的 shell 以使用 `docker exec` 將命令轉發到容器內的 `sh` 可執行文件。

首先，在主機上建立文件 `/usr/local/bin/gitea-shell`，內容如下：

```bash
#!/bin/sh
/usr/bin/docker exec -i --env SSH_ORIGINAL_COMMAND="$SSH_ORIGINAL_COMMAND" gitea sh "$@"
```

請注意，docker 命令中的 `gitea` 是容器的名稱。如果您命名不同，請不要忘記更改它。

您還應確保已正確設定 shell 包裝器的權限：

```bash
sudo chmod +x /usr/local/bin/gitea-shell
```

包裝器就位後，您可以將其設定為 `git` 使用者的 shell：

```bash
sudo usermod -s /usr/local/bin/gitea-shell git
```

現在所有的 SSH 命令都轉發到容器，您需要在主機上設定 SSH 認證。這是通過利用 [SSH AuthorizedKeysCommand](../administration/command-line.md#keys) 將密鑰與 Gitea 接受的密鑰匹配來完成的。在主機上的 `/etc/ssh/sshd_config` 中添加以下塊：

```bash
Match User git
  AuthorizedKeysCommandUser git
  AuthorizedKeysCommand /usr/bin/docker exec -i gitea /usr/local/bin/gitea keys -c /etc/gitea/app.ini -e git -u %u -t %t -k %k
```

（從 1.16.0 開始，您不需要設定 `-c /etc/gitea/app.ini` 選項。）

剩下的就是重啟 SSH 伺服器：

```bash
sudo systemctl restart sshd
```

**注意**

這實際上並未使用 docker SSH - 它只是使用周圍的命令。
理論上，您可以不運行內部 SSH 伺服器。
