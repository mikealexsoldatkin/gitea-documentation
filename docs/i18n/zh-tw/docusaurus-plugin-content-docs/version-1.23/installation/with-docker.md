---
date: "2020-03-19T19:27:00+02:00"
slug: "install-with-docker"
sidebar_position: 70
aliases:
  - /zh-tw/install-with-docker
---

# 使用 Docker 安裝

Gitea 在其 Docker Hub 組織中提供自動更新的 Docker 映像。可以始終使用最新的穩定標籤或使用其他服務來處理 Docker 映像的更新。

此參考設定指導使用者基於 `docker-compose` 進行設定，但 `docker-compose` 的安裝不在本文件的範圍內。要安裝 `docker-compose` 本身，請按照官方的[安裝說明](https://docs.docker.com/compose/install/)進行操作。

## 基本

最簡單的設定只需建立一個卷和一個網路，並將 `docker.gitea.com/gitea:latest` 映像作為服務啟動。由於沒有可用的資料庫，可以使用 SQLite3 進行初始化。建立一個名為 `gitea` 的目錄，並將以下內容粘貼到名為 `docker-compose.yml` 的文件中。請注意，卷應由設定文件中指定的 UID/GID 的使用者/組擁有。如果您未給卷正確的權限，容器可能無法啟動。對於穩定版本，您可以使用 `:latest`、`:1` 或指定某個版本，如 `:@dockerVersion@`，但如果您想使用 Gitea 的最新開發版本，則可以使用 `:nightly` 標籤。如果您想運行來自發布分支的最新提交，可以使用 `:1.x-nightly` 標籤，其中 x 是 Gitea 的次要版本。（例如 `:1.16-nightly`）

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

要在不同的端口上綁定整合的 OpenSSH 守護進程和 Web 伺服器，請調整端口部分。通常只需更改主機端口並保持容器內的端口不變。

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

要將 Gitea 與 MySQL 資料庫結合使用，請對上面建立的 `docker-compose.yml` 文件進行以下更改。

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

要將 Gitea 與 PostgreSQL 資料庫結合使用，請對上面建立的 `docker-compose.yml` 文件進行以下更改。

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

要使用命名卷而不是主機卷，請在 `docker-compose.yml` 設定中定義並使用命名卷。此更改將自動建立所需的卷。使用命名卷時，您不需要擔心權限問題；Docker 會自動處理。

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

MySQL 或 PostgreSQL 容器需要單獨建立。

## 啟動

:::note
從 2023 年 7 月起，Compose V1 停止接收更新。它也不再包含在 Docker Desktop 的新版本中。

Compose V2 包含在所有當前支援的 Docker Desktop 版本中。請使用 V2 進行以下操作。
:::

要基於 `docker-compose` 啟動此設定，請執行 `docker-compose up -d`，以在後臺啟動 Gitea。使用 `docker-compose ps` 將顯示 Gitea 是否正確啟動。可以使用 `docker-compose logs` 查看日誌。

要關閉設定，請執行 `docker-compose down`。這將停止並殺死容器。卷仍然存在。

:::note
如果在 http 上使用非 3000 端口，請更改 app.ini 以匹配 `LOCAL_ROOT_URL = http://localhost:3000/`。
:::

## 安裝

通過 `docker-compose` 啟動 Docker 設定後，應該可以使用喜愛的瀏覽器來完成安裝。訪問 http://server-ip:3000 並按照安裝向導進行操作。如果資料庫是使用上述 `docker-compose` 設定啟動的，請注意，資料庫主機名必須使用 `db`。

## 使用環境變量設定 Gitea 內的使用者

- `USER`: **git**: 在容器內運行 Gitea 的使用者名稱。
- `USER_UID`: **1000**: 在容器內運行 Gitea 的使用者的 UID（Unix 使用者 ID）。如果使用主機卷，請將其與 `/data` 卷的所有者的 UID 匹配（使用命名卷時不需要）。
- `USER_GID`: **1000**: 在容器內運行 Gitea 的使用者的 GID（Unix 組 ID）。如果使用主機卷，請將其與 `/data` 卷的所有者的 GID 匹配（使用命名卷時不需要）。

## 自訂

[此處](../administration/customizing-gitea.md)描述的自訂文件應放置在 `/data/gitea` 目錄中。如果使用主機卷，訪問這些文件非常容易；對於命名卷，可以透過另一個容器或直接訪問 `/var/lib/docker/volumes/gitea_gitea/_data` 來完成。安裝後，設定文件將保存在 `/data/gitea/conf/app.ini`。

## 升級

:::warning
確保您已將卷資料保存到 Docker 容器外的某個位置
:::

要將您的安裝升級到最新版本：

```bash
# 編輯 `docker-compose.yml` 以更新版本（如果已指定）
# 拉取新映像
docker-compose pull
# 啟動新容器，自動刪除舊容器
docker-compose up -d
```

## 使用環境變量管理部署

除了上述的環境變量外，`app.ini` 中的任何設定都可以使用形式為 `GITEA__SECTION_NAME__KEY_NAME` 的環境變量進行設定或覆蓋。這些設定在每次 Docker 容器啟動時應用，不會傳遞到 Gitea 的子進程中。完整資訊[在此](https://github.com/go-gitea/gitea/tree/master/contrib/environment-to-ini)。

這些環境變量可以在 `docker-compose.yml` 中傳遞給 Docker 容器。以下範例將在設定所需的環境變量 `GITEA__mailer__FROM`、`GITEA__mailer__HOST`、`GITEA__mailer__PASSWD` 時啟用 SMTP 郵件伺服器。

這些設定也可以透過定義形式為 `GITEA__section_name__KEY_NAME__FILE` 的環境變量並指向文件的內容來設定或覆蓋。

```yaml
---
services:
  server:
    environment:
      - GITEA__mailer__ENABLED=true
      - GITEA__mailer__FROM=${GITEA__mailer__FROM:?GITEA__mailer__FROM not set}
      - GITEA__mailer__PROTOCOL=smtps
      - GITEA__mailer__SMTP_ADDR=${GITEA__mailer__SMTP_ADDR:?GITEA__mailer__SMTP_ADDR not set}
      - GITEA__mailer__SMTP_PORT=${GITEA__mailer__SMTP_PORT:?GITEA__mailer__SMTP_PORT not set}
      - GITEA__mailer__USER=${GITEA__mailer__USER:-apikey}
      - GITEA__mailer__PASSWD="""${GITEA__mailer__PASSWD:?GITEA__mailer__PASSWD not set}"""
```

Gitea 將自動為每個新安裝生成新的密鑰/令牌並將其寫入 app.ini。如果您想手動設定密鑰/令牌，可以使用以下 Docker 命令來使用 Gitea 的內置[生成實用程式函數](../administration/command-line.md#generate)。安裝後請勿丟失/更改您的 SECRET_KEY，否則加密資料將無法解密。

以下命令將輸出新的 `SECRET_KEY` 和 `INTERNAL_TOKEN` 到 `stdout`，然後您可以將其放置在您的環境變量中。

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

## SSH 容器透傳

由於 SSH 在容器內運行，如果需要 SSH 支援，則需要將 SSH 從主機透傳到容器。一個選項是將容器 SSH 運行在非標準端口（或將主機端口移動到非標準端口）。另一個可能更直接的選項是讓 Gitea 使用者 SSH 到主機上的 Gitea 使用者，然後將這些連接中繼到 Docker。或者，如果主機有多個 IP 地址，主機可以在一個上監聽，Gitea 在另一個上監聽。

### 理解對 Gitea 的 SSH 訪問（無需透傳）

要理解需要發生什麼，首先需要理解在沒有透傳的情況下會發生什麼。因此，我們將嘗試解釋這一點：

1. 客戶端使用網頁將其 SSH 公鑰添加到 Gitea。
2. Gitea 將為此密鑰在其運行使用者 `git` 的 `.ssh/authorized_keys` 文件中添加一個條目。
3. 此條目具有公鑰，但也具有 `command=` 選項。Gitea 使用此命令將此密鑰與客戶端使用者匹配並管理身份驗證。
4. 然後，客戶端使用 `git` 使用者向 SSH 伺服器發出 SSH 請求，例如 `git clone git@domain:user/repo.git`。
5. 客戶端將嘗試與伺服器進行身份驗證，一次向伺服器傳遞一個或多個公鑰。
6. 對於客戶端提供的每個密鑰，SSH 伺服器將首先檢查其設定中的 `AuthorizedKeysCommand` 以查看公鑰是否匹配，然後檢查 `git` 使用者的 `authorized_keys` 文件。
7. 將選擇第一個匹配的條目，假設這是 Gitea 條目，則現在將執行 `command=`。
8. SSH 伺服器為 `git` 使用者建立一個使用者會話，並使用 `git` 使用者的 shell 運行 `command=`
9. 這將運行 `gitea serv`，接管 SSH 會話的其餘部分並管理 gitea 的身份驗證和授權。

現在，要使 SSH 透傳工作，我們需要主機 SSH 匹配公鑰，然後在 Docker 上運行 `gitea serv`。有多種方法可以做到這一點。然而，所有這些都需要將有關 Docker 的一些資訊傳遞給主機。

### SSHing Shim（使用 authorized_keys）

在此選項中，主機只需使用 gitea 建立的 `authorized_keys`，但在第 9 步中，主機運行的 `gitea` 命令是一個 shim，實際上運行 ssh 進入 docker，然後運行真正的 docker `gitea` 本身。

- 要使轉發工作，容器的 SSH 端口（22）需要在 `docker-compose.yml` 中映射到主機端口 2222。由於此端口不需要暴露給外界，因此可以映射到主機的 `localhost`：

  ```yaml
  ports:
    # [...]
    - "127.0.0.1:2222:22"
  ```

- 接下來在主機上建立與容器值 `USER_UID`/`USER_GID` 共享相同 `UID`/`GID` 的 `git` 使用者。這些值可以在 `docker-compose.yml` 中設定為環境變量：

  ```yaml
  environment:
    - USER_UID=1000
    - USER_GID=1000
  ```

- 將主機的 `/home/git/.ssh` 安裝到容器中。這確保了 `authorized_keys` 文件在主機 `git` 使用者和容器 `git` 使用者之間共享，否則 SSH 身份驗證無法在容器內工作。

  ```yaml
  volumes:
    - /home/git/.ssh/:/data/git/.ssh
  ```

- 現在需要在主機
