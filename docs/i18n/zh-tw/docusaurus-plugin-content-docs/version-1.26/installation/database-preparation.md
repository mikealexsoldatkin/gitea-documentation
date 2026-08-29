---
date: "2020-01-16"
slug: "database-prep"
sidebar_position: 10
aliases:
  - /zh-tw/database-prep
---

# 資料庫準備

在使用 Gitea 前，您需要準備一個資料庫。Gitea 支援 PostgreSQL（>= 12）、MySQL（>= 8.0）、MariaDB（>= 10.4）、SQLite（內置） 和 MSSQL（>= 2012 SP4）這幾種資料庫。本頁將指導您準備資料庫。由於 PostgreSQL 和 MySQL 在生產環境中被廣泛使用，因此本文件將僅涵蓋這兩種資料庫。如果您計劃使用 SQLite，則可以忽略本章內容。

如果您使用不受支援的資料庫版本，請通過 [聯繫我們](/help/support) 以獲取有關我們的擴展支援的資訊。我們可以為舊資料庫提供測試和支援，並將這些修復整合到 Gitea 程式碼庫中。

資料庫實例可以與 Gitea 實例在相同機器上（本地資料庫），也可以與 Gitea 實例在不同機器上（遠程資料庫）。

注意：以下所有步驟要求您的選擇的資料庫引擎已安裝在您的系統上。對於遠程資料庫設定，請在資料庫實例上安裝伺服器應用程式，在 Gitea 伺服器上安裝客戶端程式。客戶端程式用於測試 Gitea 伺服器與資料庫之間的連接，而 Gitea 本身使用 Go 提供的資料庫驅動程式完成相同的任務。此外，請確保伺服器和客戶端使用相同的引擎版本，以使某些引擎功能正常工作。出於安全原因，請使用安全密碼保護 `root`（MySQL）或 `postgres`（PostgreSQL）資料庫超級使用者。以下步驟假設您在資料庫和 Gitea 伺服器上都使用 Linux。

## MySQL/MariaDB

1. 對於遠程資料庫設定，您需要讓 MySQL 監聽您的 IP 地址。編輯資料庫實例上的 `/etc/mysql/my.cnf` 文件中的 `bind-address` 選項為：

   ```ini
   bind-address = 203.0.113.3
   ```

2. 在資料庫實例上，使用 `root` 使用者登入到資料庫控制檯：

   ```
   mysql -u root -p
   ```

   按提示輸入密碼。

3. 建立一個將被 Gitea 使用的資料庫使用者，並使用密碼進行身份驗證。以下範例中使用了 `'gitea'` 作為密碼。請為您的實例使用一個安全密碼。

   對於本地資料庫：

   ```sql
   SET old_passwords=0;
   CREATE USER 'gitea' IDENTIFIED BY 'gitea';
   ```

   對於遠程資料庫：

   ```sql
   SET old_passwords=0;
   CREATE USER 'gitea'@'192.0.2.10' IDENTIFIED BY 'gitea';
   ```

   其中 `192.0.2.10` 是您的 Gitea 實例的 IP 地址。

   根據需要替換上述使用者名稱和密碼。

4. 使用 UTF-8 字符集和大小寫敏感的排序規則建立資料庫。

   `utf8mb4_bin` 是 MySQL/MariaDB 的通用排序規則。
   Gitea 啟動後會嘗試把資料庫修改為更合適的字符集 (`utf8mb4_0900_as_cs` 或者 `uca1400_as_cs`) 並在可能的情況下更改資料庫。
   如果你想指定自己的字符集規則，可以在 `app.ini` 中設定 `[database].CHARSET_COLLATION`。

   ```sql
   CREATE DATABASE giteadb CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_bin';
   ```

   根據需要替換資料庫名稱。

5. 將資料庫上的所有權限授予上述建立的資料庫使用者。

   對於本地資料庫：

   ```sql
   GRANT ALL PRIVILEGES ON giteadb.* TO 'gitea';
   FLUSH PRIVILEGES;
   ```

   對於遠程資料庫：

   ```sql
   GRANT ALL PRIVILEGES ON giteadb.* TO 'gitea'@'192.0.2.10';
   FLUSH PRIVILEGES;
   ```

6. 通過 `exit` 退出資料庫控制檯。

7. 在您的 Gitea 伺服器上，測試與資料庫的連接：

   ```
   mysql -u gitea -h 203.0.113.3 -p giteadb
   ```

   其中 `gitea` 是資料庫使用者名稱，`giteadb` 是資料庫名稱，`203.0.113.3` 是資料庫實例的 IP 地址。對於本地資料庫，省略 `-h` 選項。

   到此您應該能夠連接到資料庫了。

## PostgreSQL

1. 對於遠程資料庫設定，通過編輯資料庫實例上的 postgresql.conf 文件中的 `listen_addresses` 將 `PostgreSQL` 設定為監聽您的 IP 地址：

   ```ini
   listen_addresses = 'localhost, 203.0.113.3'
   ```

2. PostgreSQL 預設使用 `md5` 質詢-響應加密方案進行密碼身份驗證。現在這個方案不再被認為是安全的。改用 SCRAM-SHA-256 方案，通過編輯資料庫伺服器上的` postgresql.conf` 設定文件：

   ```ini
   password_encryption = scram-sha-256
   ```

   重啟 PostgreSQL 以應用該設定。

3. 在資料庫伺服器上，以超級使用者身份登入到資料庫控制檯：

   ```
   su -c "psql" - postgres
   ```

4. 建立具有登入權限和密碼的資料庫使用者（在 PostgreSQL 術語中稱為角色）。請使用安全的、強密碼，而不是下面的 `'gitea'`：

   ```sql
   CREATE ROLE gitea WITH LOGIN PASSWORD 'gitea';
   ```

   根據需要替換使用者名稱和密碼。

5. 使用 UTF-8 字符集建立資料庫，並由之前建立的資料庫使用者擁有。可以根據預期內容使用任何 `libc` 排序規則，使用 `LC_COLLATE` 和 `LC_CTYPE` 參數指定：

   ```sql
   CREATE DATABASE giteadb WITH OWNER gitea TEMPLATE template0 ENCODING UTF8 LC_COLLATE 'en_US.UTF-8' LC_CTYPE 'en_US.UTF-8';
   ```

   根據需要替換資料庫名稱。

6. 通過將以下身份驗證規則添加到 `pg_hba.conf`，允許資料庫使用者訪問上面建立的資料庫。

   對於本地資料庫：

   ```ini
   local    giteadb    gitea    scram-sha-256
   ```

   對於遠程資料庫：

   ```ini
   host    giteadb    gitea    192.0.2.10/32    scram-sha-256
   ```

   根據您自己的資料庫名稱、使用者和 Gitea 實例的 IP 地址進行替換。

   注意：`pg_hba.conf` 上的規則按順序評估，也就是第一個匹配的規則將用於身份驗證。您的 PostgreSQL 安裝可能附帶了適用於所有使用者和資料庫的通用身份驗證規則。如果是這種情況，您可能需要將此處提供的規則放置在此類通用規則之上。

   重啟 PostgreSQL 以應用新的身份驗證規則。

7. 在您的 Gitea 伺服器上，測試與資料庫的連接。

   對於本地資料庫：

   ```
   psql -U gitea -d giteadb
   ```

   對於遠程資料庫：

   ```
   psql "postgres://gitea@203.0.113.3/giteadb"
   ```

   其中 `gitea` 是資料庫使用者，`giteadb` 是資料庫名稱，`203.0.113.3` 是您的資料庫實例的 IP 地址。

   您應該會被提示輸入資料庫使用者的密碼，並連接到資料庫。

## 使用 TLS 進行資料庫連接

如果 Gitea 和您的資料庫實例之間的通信是通過私有網路進行的，或者如果 Gitea 和資料庫運行在同一臺伺服器上，那麼可以省略本節，因為 Gitea 和資料庫實例之間的安全性不會受到嚴重威脅。但是，如果資料庫實例位於公共網路上，請使用 TLS 對資料庫連接進行加密，以防止第三方攔截流量資料。

### 先決條件

- 您需要兩個有效的 TLS 證書，一個用於資料庫實例（資料庫伺服器），一個用於 Gitea 實例（資料庫客戶端）。兩個證書都必須由受信任的 CA 簽名。
- 資料庫證書必須在 `X509v3 Extended Key Usage` 擴展屬性中包含 `TLS Web Server Authentication`，而客戶端證書則需要在相應的屬性中包含 `TLS Web Client Authentication`。
- 在資料庫伺服器證書中，`Subject Alternative Name` 或 `Common Name` 條目之一必須是資料庫實例的完全限定域名（FQDN）（例如 `db.example.com`）。在資料庫客戶端證書中，上述提到的條目之一必須包含 Gitea 將用於連接的資料庫使用者名稱。
- 您需要將 Gitea 和資料庫伺服器的域名映射到它們各自的 IP 地址。可以為它們設定 DNS 記錄，也可以在每個系統上的 `/etc/hosts`（Windows 中的 `%WINDIR%\System32\drivers\etc\hosts`）中添加本地映射。這樣可以透過域名而不是 IP 地址進行資料庫連接。有關詳細資訊，請參閱您系統的文件。

### PostgreSQL TLS

Gitea 使用的 PostgreSQL 驅動程式支援雙向 TLS。在雙向 TLS 中，資料庫客戶端和伺服器通過將各自的證書發送給對方進行驗證來相互認證。換句話說，伺服器驗證客戶端證書，客戶端驗證伺服器證書。

1. 在資料庫實例所在的伺服器上，放置以下憑據：

   - `/path/to/postgresql.crt`: 資料庫實例證書
   - `/path/to/postgresql.key`: 資料庫實例私鑰
   - `/path/to/root.crt`: 用於驗證客戶端證書的 CA 證書鏈

2. 在 `postgresql.conf` 中添加以下選項：

   ```ini
   ssl = on
   ssl_ca_file = '/path/to/root.crt'
   ssl_cert_file = '/path/to/postgresql.crt'
   ssl_key_file = '/path/to/postgresql.key'
   ssl_min_protocol_version = 'TLSv1.2'
   ```

3. 根據 PostgreSQL 的要求，調整憑據的所有權和權限：

   ```
   chown postgres:postgres /path/to/root.crt /path/to/postgresql.crt /path/to/postgresql.key
   chmod 0600 /path/to/root.crt /path/to/postgresql.crt /path/to/postgresql.key
   ```

4. 編輯 `pg_hba.conf` 規則，僅允許 Gitea 資料庫使用者通過 SSL 連接，並要求客戶端證書驗證。

   對於 PostgreSQL 12：

   ```ini
   hostssl    giteadb    gitea    192.0.2.10/32    scram-sha-256    clientcert=verify-full
   ```

   對於 PostgreSQL 11 及更早版本：

   ```ini
   hostssl    giteadb    gitea    192.0.2.10/32    scram-sha-256    clientcert=1
   ```

   根據需要替換資料庫名稱、使用者和 Gitea 實例的 IP 地址。

5. 重新啟動 PostgreSQL 以應用上述設定。

6. 在運行 Gitea 實例的伺服器上，將以下憑據放置在運行 Gitea 的使用者的主目錄下（例如 `git`）：

   - `~/.postgresql/postgresql.crt`: 資料庫客戶端證書
   - `~/.postgresql/postgresql.key`: 資料庫客戶端私鑰
   - `~/.postgresql/root.crt`: 用於驗證伺服器證書的 CA 證書鏈

   注意：上述文件名在 PostgreSQL 中是硬編碼的，無法更改。

7. 根據需要調整憑據、所有權和權限：

   ```
   chown git:git ~/.postgresql/postgresql.crt ~/.postgresql/postgresql.key ~/.postgresql/root.crt
   chown 0600 ~/.postgresql/postgresql.crt ~/.postgresql/postgresql.key ~/.postgresql/root.crt
   ```

8. 測試與資料庫的連接：

   ```
   psql "postgres://gitea@example.db/giteadb?sslmode=verify-full"
   ```

   您將被提示輸入資料庫使用者的密碼，然後連接到資料庫。

### MySQL/MariaDB TLS

雖然 Gitea 使用的 MySQL 驅動程式也支援雙向 TLS，但目前 Gitea 僅支援單向 TLS。有關詳細資訊，請參見工單＃10828。

在單向 TLS 中，資料庫客戶端在連接握手期間驗證伺服器發送的證書，而伺服器則假定連接的客戶端是合法的，因為不進行客戶端證書驗證。

1. 在資料庫實例上放置以下憑據：

   - `/path/to/mysql.crt`: 資料庫實例證書
   - `/path/to/mysql.key`: 資料庫實例密鑰
   - `/path/to/ca.crt`: CA 證書鏈。在單向 TLS 中不使用此文件，但用於驗證雙向 TLS 中的客戶端證書。

2. 將以下選項添加到 `my.cnf`：

   ```ini
   [mysqld]
   ssl-ca = /path/to/ca.crt
   ssl-cert = /path/to/mysql.crt
   ssl-key = /path/to/mysql.key
   tls-version = TLSv1.2,TLSv1.3
   ```

3. 調整憑據的所有權和權限：

   ```
   chown mysql:mysql /path/to/ca.crt /path/to/mysql.crt /path/to/mysql.key
   chmod 0600 /path/to/ca.crt /path/to/mysql.crt /path/to/mysql.key
   ```

4. 重新啟動 MySQL 以應用設定。

5. Gitea 的資料庫使用者可能已經建立過，但只會對運行 Gitea 的伺服器的 IP 地址進行身份驗證。要對其域名進行身份驗證，請重新建立使用者，並設定其需要通過 TLS 連接到資料庫：

   ```sql
   DROP USER 'gitea'@'192.0.2.10';
   CREATE USER 'gitea'@'example.gitea' IDENTIFIED BY 'gitea' REQUIRE SSL;
   GRANT ALL PRIVILEGES ON giteadb.* TO 'gitea'@'example.gitea';
   FLUSH PRIVILEGES;
   ```

   根據需要替換資料庫使用者名稱、密碼和 Gitea 實例域名。

6. 確保用於驗證資料庫伺服器證書的 CA 證書鏈位於資料庫和 Gitea 伺服器的系統證書儲存中。請參考系統文件中有關將 CA 證書添加到證書儲存的說明。

7. 在運行 Gitea 的伺服器上，測試與資料庫的連接：

   ```
   mysql -u gitea -h example.db -p --ssl
   ```

   至此應該成功連接到資料庫了。
