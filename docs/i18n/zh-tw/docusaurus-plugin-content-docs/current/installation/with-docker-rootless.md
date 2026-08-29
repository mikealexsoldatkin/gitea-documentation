---
date: "2020-02-09T20:00:00+02:00"
slug: "install-with-docker-rootless"
sidebar_position: 60
aliases:
  - /zh-tw/install-with-docker-rootless
---

# 使用 Docker 安裝 (rootless)

Gitea 在其 Docker Hub 組織中提供自動更新的 Docker 鏡像。您可以始終使用最新的穩定標籤，或使用其他處理 Docker 鏡像更新的服務。

rootless 鏡像使用 Gitea 內部 SSH 功能來提供 Git 協議，但不支援 OpenSSH。

本參考設定指南將使用者引導通過基於 `docker-compose` 的設定。但是，`docker-compose` 的安裝超出了本文件的範圍。要安裝`docker-compose` 本身， 請按照官方的 [安裝說明](https://docs.docker.com/compose/install/)進行操作。

## 基礎設定

最簡單的設定只需建立一個卷和一個網路，並將 `docker.gitea.com/gitea:latest-rootless` 鏡像作為服務啟動。由於沒有可用的資料庫，可以使用 SQLite3 來初始化一個。

建立一個名為 `data` 和 `config`:

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

請注意，卷應由在設定文件中指定的 UID/GID 的使用者/組所有。預設情況下，Docker 中的 Gitea 將使用 uid:1000 gid:1000。如果需要，您可以使用以下命令設定這些文件夾的所有權：

```sh
sudo chown 1000:1000 config/ data/
```

> 如果未為卷設定正確的權限，容器可能無法啟動。

對於穩定版本，您可以使用 `:latest-rootless`、`:1-rootless`，或指定特定的版本，如: `@dockerVersion@-rootless`。如果您想使用最新的開發版本，則可以使用 `:dev-rootless` 標籤。如果您想運行發佈分支的最新提交，可以使用 `:1.x-dev-rootless` 標籤，其中 x 是 Gitea 的次要版本號（例如:`1.16-dev-rootless`）。

## 自訂端口

要將整合的 SSH 和 Web 伺服器綁定到不同的端口，請調整端口部分。通常只需更改主機端口並保持容器內的端口不變。

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

要將 Gitea 與 MySQL 資料庫結合使用，請對上面建立的 `docker-compose.yml` 文件進行以下更改。

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
      - "222:22"
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

要將 Gitea 與 PostgreSQL 資料庫結合使用，請對上面建立的 `docker-compose.yml` 文件進行以下更改。

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

## 命名卷 (Named Volumes)

要使用命名卷 (Named Volumes) 而不是主機卷 (Host Volumes)，請在 `docker-compose.yml` 設定中定義和使用命名卷。這樣的更改將自動建立所需的卷。您不需要擔心權限問題，Docker 會自動處理。

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

你可以選擇使用自訂使用者 (遵循 --user 標誌定義 https://docs.docker.com/engine/reference/run/#user)。
例如，要克隆主機使用者 `git` 的定義，請使用命令 `id -u git` 並將其添加到 `docker-compose.yml` 文件中：
請確使用者對保掛載的文件夾具有寫權限。

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

要啟動基於 `docker-compose` 的這個設定，請執行 `docker-compose up -d`，以在後臺啟動 Gitea。使用 `docker-compose ps` 命令可以查看 Gitea 是否正確啟動。可以使用 `docker-compose logs` 命令查看日誌。

要關閉設定，請執行 `docker-compose down` 命令。這將停止和終止容器，但卷仍將存在。

注意：如果在 HTTP 上使用的是非 3000 端口，請將 app.ini 更改為匹配 `LOCAL_ROOT_URL = http://localhost:3000/`。

## 安裝

在通過 `docker-compose` 啟動 Docker 設定後，可以使用喜愛的瀏覽器訪問 Gitea，完成安裝過程。訪問 `http://<服務器-IP>:3000` 並按照安裝嚮導進行操作。如果資料庫是使用上述文件中的 `docker-compose` 設定啟動的，請注意必須使用 `db` 作為資料庫主機名。

## 自訂

自訂文件的位置位於 `/var/lib/gitea/custom` 目錄中，可以在這裡找到有關自訂的文件說明。如果使用主機卷（host volumes），很容易訪問這些文件；如果使用命名卷（named volumes），則可以透過另一個容器或直接訪問 `/var/lib/docker/volumes/gitea_gitea/_/var_lib_gitea` 來進行訪問。在安裝後，設定文件將保存在 `/etc/gitea/app.ini` 中。

## 升級

:::warning
:exclamation::exclamation: **確保您已將資料卷遷移到 Docker 容器之外的其他位置** :exclamation::exclamation:
:::

要將安裝升級到最新版本，請按照以下步驟操作：

```bash
# 如果在 docker-compose.yml 中指定了版本，請編輯該文件以更新版本
# 拉取新的鏡像
docker-compose pull
# 啟動一個新的容器，自動移除舊的容器
docker-compose up -d
```

## 從標準鏡像升級

- 備份您的設定
- 將卷掛載點從 `/data` 更改為 `/var/lib/gitea`
- 如果使用了自訂的 `app.ini`，請將其移動到新的掛載到 `/etc/gitea` 的卷中
- 將卷中的文件夾（gitea）重命名為 custom
- 如果需要，編輯 `app.ini`
  - 設定 `START_SSH_SERVER = true`
- 使用鏡像 ` docker.gitea.com/gitea:@dockerVersion@-rootless`

## 使用環境變量管理部署

除了上述的環境變量外，`app.ini` 中的任何設定都可以透過形式為 `GITEA__SECTION_NAME__KEY_NAME` 的環境變量進行設定或覆蓋。這些設定在每次 Docker 容器啟動時都會生效。完整資訊請參考[這裡](https://github.com/go-gitea/gitea/tree/main/contrib/environment-to-ini).

這些環境變量可以在 `docker-compose.yml` 中傳遞給 Docker 容器。以下範例將啟用 SMTP 郵件伺服器，如果主機上設定了所需的環境變量 GITEA**mailer**FROM、GITEA**mailer**HOST、GITEA**mailer**PASSWD，或者在與 `docker-compose.yml` 相同目錄中的 `.env` 文件中設定了這些環境變量：

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

要設定所需的 TOKEN 和 SECRET 值，可以使用 Gitea 的內置[生成使用函數](../administration/command-line.md#generate).

# SSH 容器透傳

由於 SSH 在容器內運行，如果需要 SSH 支援，需要將 SSH 從主機透傳到容器。一種選擇是在容器內運行 SSH，並使用非標準端口（或將主機端口移動到非標準端口）。另一種可能更直接的選擇是將主機上的 SSH 命令轉發到容器。下面解釋了這種設定。

本指南假設您已在主機上建立了一個名為 `git` 的使用者，並具有運行 `docker exec` 的權限，並且 Gitea 容器的名稱為 `gitea`。您需要修改該使用者的 shell，以將命令轉發到容器內的 `sh` 可執行文件，使用 `docker exec`。

首先，在主機上建立文件 `/usr/local/bin/gitea-shell`，並填入以下內容：

```bash
#!/bin/sh
/usr/bin/docker exec -i --env SSH_ORIGINAL_COMMAND="$SSH_ORIGINAL_COMMAND" gitea sh "$@"
```

注意上述 docker 命令中的 `gitea` 是容器的名稱。如果您的容器名稱不同，請記得更改。

還應確保正確設定了 shell 包裝器的權限：

```bash
sudo chmod +x /usr/local/bin/gitea-shell
```

一旦包裝器就位，您可以將其設定為 `git` 使用者的 shell：

```bash
sudo usermod -s /usr/local/bin/gitea-shell git
```

現在，所有的 SSH 命令都會被轉發到容器，您需要在主機上設定 SSH 認證。這可以透過利用 [SSH AuthorizedKeysCommand](../administration/command-line.md#keys) 來匹配 Gitea 接受的密鑰。在主機的 `/etc/ssh/sshd_config` 文件中添加以下程式碼塊：

```bash
Match User git
  AuthorizedKeysCommandUser git
  AuthorizedKeysCommand /usr/bin/docker exec -i gitea /usr/local/bin/gitea keys -c /etc/gitea/app.ini -e git -u %u -t %t -k %k
```

（從 1.16.0 開始，您將不需要設定 `-c /etc/gitea/app.ini` 選項。）

剩下的就是重新啟動 SSH 伺服器：

```bash
sudo systemctl restart sshd
```

**注意**

這實際上並沒有使用 Docker 的 SSH，而是僅僅使用了圍繞它的命令。
從理論上講，您可以不運行內部的 SSH 伺服器。
