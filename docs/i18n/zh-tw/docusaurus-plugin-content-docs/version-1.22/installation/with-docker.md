---
date: "2016-12-01T16:00:00+02:00"

slug: "install-with-docker"
sidebar_position: 70

aliases:
  - /zh-tw/install-with-docker
---

# 使用 Docker 安裝

Gitea 在其 Docker Hub 組織內提供自動更新的 Docker 鏡像。可以始終使用最新的穩定標籤或使用其他服務來更新 Docker 鏡像。

該參考設定指導使用者完成基於 `docker-compose` 的設定，但是 `docker-compose` 的安裝不在本文件的範圍之內。要安裝 `docker-compose` 本身，請遵循官方[安裝說明](https://docs.docker.com/compose/install/)。

## 基本

最簡單的設定只是建立一個卷和一個網路，然後將 `docker.gitea.com/gitea:latest` 鏡像作為服務啟動。由於沒有可用的資料庫，因此可以使用 SQLite3 初始化資料庫。建立一個類似 `gitea` 的目錄，並將以下內容粘貼到名為 `docker-compose.yml` 的文件中。請注意，該卷應由設定文件中指定的 UID/GID 的使用者/組擁有。如果您不授予卷正確的權限，則容器可能無法啟動。另請注意，標籤 `:latest` 將安裝當前的開發版本。對於穩定的發行版，您可以使用 `:1` 或指定某個發行版，例如 `@dockerVersion@`。

```yaml
version: "3"

networks:
  gitea:
    external: false

services:
  server:
    image: docker.gitea.com/gitea:@dockerVersion@
    container_name: gitea
    environment:
      - USER_UID=1000
      - USER_GID=1000
    restart: always
    networks:
      - gitea
    volumes:
      - ./gitea:/data
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "3000:3000"
      - "222:22"
```

## 端口

要將整合的 openSSH 守護進程和 Web 伺服器綁定到其他端口，請調整端口部分。通常，只需更改主機端口，容器內的端口保持原樣即可。

```diff
version: "3"

networks:
  gitea:
    external: false

services:
  server:
    image: docker.gitea.com/gitea:@dockerVersion@
    container_name: gitea
    environment:
      - USER_UID=1000
      - USER_GID=1000
    restart: always
    networks:
      - gitea
    volumes:
      - ./gitea:/data
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
-     - "3000:3000"
-     - "222:22"
+     - "8080:3000"
+     - "2221:22"
```

## 資料庫

### MySQL 資料庫

要將 Gitea 與 MySQL 資料庫結合使用，請將這些更改應用於上面建立的 `docker-compose.yml` 文件。

```diff
version: "3"

networks:
  gitea:
    external: false

services:
  server:
    image: docker.gitea.com/gitea:@dockerVersion@
    container_name: gitea
    environment:
      - USER_UID=1000
      - USER_GID=1000
+      - GITEA__database__DB_TYPE=mysql
+      - GITEA__database__HOST=db:3306
+      - GITEA__database__NAME=gitea
+      - GITEA__database__USER=gitea
+      - GITEA__database__PASSWD=gitea
    restart: always
    networks:
      - gitea
    volumes:
      - ./gitea:/data
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
+    networks:
+      - gitea
+    volumes:
+      - ./mysql:/var/lib/mysql
```

### PostgreSQL 資料庫

要將 Gitea 與 PostgreSQL 資料庫結合使用，請將這些更改應用於上面建立的 `docker-compose.yml` 文件。

```diff
version: "3"

networks:
  gitea:
    external: false

services:
  server:
    image: docker.gitea.com/gitea:@dockerVersion@
    container_name: gitea
    environment:
      - USER_UID=1000
      - USER_GID=1000
+      - GITEA__database__DB_TYPE=postgres
+      - GITEA__database__HOST=db:5432
+      - GITEA__database__NAME=gitea
+      - GITEA__database__USER=gitea
+      - GITEA__database__PASSWD=gitea
    restart: always
    networks:
      - gitea
    volumes:
      - ./gitea:/data
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "3000:3000"
      - "222:22"
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
+    networks:
+      - gitea
+    volumes:
+      - ./postgres:/var/lib/postgresql/data
```

## 命名卷

要使用命名卷而不是主機卷，請在 `docker-compose.yml` 設定中定義並使用命名卷。此更改將自動建立所需的卷。您無需擔心命名卷的權限；Docker 將自動處理該問題。

```diff
version: "3"

networks:
  gitea:
    external: false

+volumes:
+  gitea:
+    driver: local
+
services:
  server:
    image: docker.gitea.com/gitea:@dockerVersion@
    container_name: gitea
    restart: always
    networks:
      - gitea
    volumes:
-      - ./gitea:/data
+      - gitea:/data
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "3000:3000"
      - "222:22"
```

MySQL 或 PostgreSQL 容器將需要分別建立。

## 啟動

要基於 `docker-compose` 啟動此設定，請執行 `docker-compose up -d`，以在後臺啟動 Gitea。使用 `docker-compose ps` 將顯示 Gitea 是否正確啟動。可以使用 `docker-compose logs` 查看日誌。

要關閉設定，請執行 `docker-compose down`。這將停止並殺死容器。這些卷將仍然存在。

注意：如果在 http 上使用非 3000 端口，請更改 app.ini 以匹配 `LOCAL_ROOT_URL = http://localhost:3000/`。

## 安裝

通過 `docker-compose` 啟動 Docker 安裝後，應該可以使用喜歡的瀏覽器訪問 Gitea，以完成安裝。訪問 http://server-ip:3000 並遵循安裝嚮導。如果資料庫是通過上述 `docker-compose` 設定啟動的，請注意，必須將 `db` 用作資料庫主機名。

## 環境變量

您可以透過環境變量設定 Gitea 的一些設定：

（預設值以**粗體**顯示）

- `APP_NAME`：**“Gitea: Git with a cup of tea”**：應用程式名稱，在頁面標題中使用。
- `RUN_MODE`：**prod**：應用程式運行模式，會影響性能和調試。"dev"，"prod"或"test"。
- `DOMAIN`：**localhost**：此伺服器的域名，用於 Gitea UI 中顯示的 http 克隆 URL。
- `SSH_DOMAIN`：**localhost**：該伺服器的域名，用於 Gitea UI 中顯示的 ssh 克隆 URL。如果啟用了安裝頁面，則 SSH 域伺服器將採用以下形式的 DOMAIN 值（保存時將覆蓋此設定）。
- `SSH_PORT`：**22**：克隆 URL 中顯示的 SSH 端口。
- `SSH_LISTEN_PORT`：**%(SSH_PORT)s**：內置 SSH 伺服器的端口。
- `DISABLE_SSH`：**false**：如果不可用，請禁用 SSH 功能。如果要禁用 SSH 功能，則在安裝 Gitea 時應將 SSH 端口設定為 `0`。
- `HTTP_PORT`：**3000**：HTTP 監聽端口。
- `ROOT_URL`：**""**：覆蓋自動生成的公共 URL。如果內部 URL 和外部 URL 不匹配（例如在 Docker 中），這很有用。
- `LFS_START_SERVER`：**false**：啟用 git-lfs 支援。
- `DB_TYPE`：**sqlite3**：正在使用的資料庫類型[mysql，postgres，mssql，sqlite3]。
- `DB_HOST`：**localhost:3306**：資料庫主機地址和端口。
- `DB_NAME`：**gitea**：資料庫名稱。
- `DB_USER`：**root**：資料庫使用者名稱。
- `DB_PASSWD`：**"_empty_"** ：資料庫使用者密碼。如果您在密碼中使用特殊字符，請使用“您的密碼”進行引用。
- `INSTALL_LOCK`：**false**：禁止訪問安裝頁面。
- `SECRET_KEY`：**""** ：全域密鑰。這應該更改。如果它具有一個值並且 `INSTALL_LOCK` 為空，則 `INSTALL_LOCK` 將自動設定為 `true`。
- `DISABLE_REGISTRATION`：**false**：禁用註冊，之後只有管理員才能為使用者建立帳戶。
- `REQUIRE_SIGNIN_VIEW`：**false**：啟用此選項可強制使用者登入以查看任何頁面。
- `USER_UID`：**1000**：在容器內運行 Gitea 的使用者的 UID（Unix 使用者 ID）。如果使用主機卷，則將其與 `/data` 卷的所有者的 UID 匹配（對於命名卷，則不需要這樣做）。
- `USER_GID`：**1000**：在容器內運行 Gitea 的使用者的 GID（Unix 組 ID）。如果使用主機卷，則將其與 `/data` 卷的所有者的 GID 匹配（對於命名卷，則不需要這樣做）。

## 自訂

[此處](../administration/customizing-gitea.md)描述的定製文件應放在 `/data/gitea` 目錄中。如果使用主機卷，則訪問這些文件非常容易；對於命名卷，可以透過另一個容器或通過直接訪問 `/var/lib/docker/volumes/gitea_gitea/_data` 來完成。安裝後，設定文件將保存在 `/data/gitea/conf/app.ini` 中。

## 升級

:::warning
:exclamation::exclamation: **確保已將資料捲到 Docker 容器外部的某個位置** :exclamation::exclamation:
:::

要將安裝升級到最新版本：

```bash
# Edit `docker-compose.yml` to update the version, if you have one specified
# Pull new images
docker-compose pull
# Start a new container, automatically removes old one
docker-compose up -d
```

## 使用環境變量管理部署

除了上面的環境變量之外，`app.ini` 中的任何設定都可以使用以下形式的環境變量進行設定或覆蓋：`GITEA__SECTION_NAME__KEY_NAME`。 每次 docker 容器啟動時都會應用這些設定。 完整資訊在[這裡](https://github.com/go-gitea/gitea/tree/master/contrib/environment-to-ini)。

```bash
...
services:
  server:
    environment:
      - GITEA__mailer__ENABLED=true
      - GITEA__mailer__FROM=${GITEA__mailer__FROM:?GITEA__mailer__FROM not set}
      - GITEA__mailer__PROTOCOL=smtps
      - GITEA__mailer__HOST=${GITEA__mailer__HOST:?GITEA__mailer__HOST not set}
      - GITEA__mailer__USER=${GITEA__mailer__USER:-apikey}
      - GITEA__mailer__PASSWD="""${GITEA__mailer__PASSWD:?GITEA__mailer__PASSWD not set}"""
```

Gitea 將為每次新安裝自動生成新的 `SECRET_KEY` 並將它們寫入 `app.ini`。 如果您想手動設定 `SECRET_KEY`，您可以使用以下 docker 命令來使用 Gitea 內置的[方法](../administration/command-line.md#generate)生成 `SECRET_KEY`。 安裝後請妥善保管您的 `SECRET_KEY`，如若丟失則無法解密已加密的資料。

以下命令將向 `stdout` 輸出一個新的 `SECRET_KEY` 和 `INTERNAL_TOKEN`，然後您可以將其放入環境變量中。

```bash
docker run -it --rm docker.gitea.com/gitea:1 gitea generate secret SECRET_KEY
docker run -it --rm docker.gitea.com/gitea:1 gitea generate secret INTERNAL_TOKEN
```

```yaml

---
services:
  server:
    environment:
      - GITEA__security__SECRET_KEY=[value returned by generate secret SECRET_KEY]
      - GITEA__security__INTERNAL_TOKEN=[value returned by generate secret INTERNAL_TOKEN]
```

## SSH 容器直通

由於 SSH 在容器內運行，因此，如果需要 SSH 支援，則需要將 SSH 從主機傳遞到容器。一種選擇是在非標準端口上運行容器 SSH（或將主機端口移至非標準端口）。另一個可能更直接的選擇是將 SSH 連接從主機轉發到容器。下面將說明此設定。

本指南假定您已經在名為 `git` 的主機上建立了一個使用者，該使用者與容器值 `USER_UID`/`USER_GID` 共享相同的 `UID`/`GID`。這些值可以在 `docker-compose.yml` 中設定為環境變量：

```bash
environment:
  - USER_UID=1000
  - USER_GID=1000
```

接下來將主機的 `/home/git/.ssh` 裝入容器。否則，SSH 身份驗證將無法在容器內運行。

```bash
volumes:
  - /home/git/.ssh/:/data/git/.ssh
```

現在，需要在主機上建立 SSH 密鑰對。該密鑰對將用於向主機驗證主機上的 `git` 使用者。

```bash
sudo -u git ssh-keygen -t rsa -b 4096 -C "Gitea Host Key"
```

在下一步中，需要在主機上建立一個名為 `/usr/local/bin/gitea` 的文件（具有可執行權限）。該文件將發出從主機到容器的 SSH 轉發。將以下內容添加到 `/usr/local/bin/gitea`：

```bash
ssh -p 2222 -o StrictHostKeyChecking=no git@127.0.0.1 "SSH_ORIGINAL_COMMAND=\"$SSH_ORIGINAL_COMMAND\" $0 $@"
```

為了使轉發正常工作，需要將容器（22）的 SSH 端口映射到 `docker-compose.yml` 中的主機端口 2222。由於此端口不需要暴露給外界，因此可以將其映射到主機的 `localhost`：

```bash
ports:
  # [...]
  - "127.0.0.1:2222:22"
```

另外，主機上的 `/home/git/.ssh/authorized_keys` 需要修改。它需要以與 Gitea 容器內的 `authorized_keys` 相同的方式進行操作。因此，將您在上面建立的密鑰（“Gitea 主機密鑰”）的公共密鑰添加到 `/home/git/.ssh/authorized_keys`。這可以透過 `echo "$(cat /home/git/.ssh/id_rsa.pub)" >> /home/git/.ssh/authorized_keys` 完成。重要提示：來自 `git` 使用者的公鑰需要“按原樣”添加，而通過 Gitea 網路介面添加的所有其他公鑰將以 `command="/app [...]` 作為前綴。

該文件應該看起來像：

```bash
# SSH pubkey from git user
ssh-rsa <Gitea Host Key>

# other keys from users
command="/usr/local/bin/gitea --config=/data/gitea/conf/app.ini serv key-1",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty <user pubkey>
```

這是詳細的說明，當發出 SSH 請求時會發生什麼：

1. 使用 `git` 使用者向主機發出 SSH 請求，例如 `git clone git@domain:user/repo.git`。
2. 在 `/home/git/.ssh/authorized_keys` 中，該命令執行 `/usr/local/bin/gitea` 腳本。
3. `/usr/local/bin/gitea` 將 SSH 請求轉發到端口 2222，該端口已映射到容器的 SSH 端口（22）。
4. 由於 `/home/git/.ssh/authorized_keys` 中存在 `git` 使用者的公鑰，因此身份驗證主機 → 容器成功，並且 SSH 請求轉發到在 docker 容器中運行的 Gitea。

如果在 Gitea Web 介面中添加了新的 SSH 密鑰，它將以與現有密鑰相同的方式附加到 `.ssh/authorized_keys` 中。

**注意**

SSH 容器直通僅在以下情況下有效

- 在容器中使用 `opensshd`
- 如果未將 `AuthorizedKeysCommand` 與 `SSH_CREATE_AUTHORIZED_KEYS_FILE = false` 結合使用以禁用授權文件密鑰生成
- `LOCAL_ROOT_URL` 不變
