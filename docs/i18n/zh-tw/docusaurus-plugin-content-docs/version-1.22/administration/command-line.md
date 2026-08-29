---
date: "2023-05-23T09:00:00+08:00"
slug: "command-line"
sidebar_position: 1
aliases:
  - /zh-tw/command-line
---

# 命令行

## 用法

`gitea [全域選項] 命令 [命令或全域選項] [參數...]`

## 全域選項

所有全域選項均可被放置在命令級別。

- `--help`，`-h`：顯示幫助文本並退出。可選。
- `--version`，`-v`：顯示版本資訊並退出。可選。 (範例：`Gitea version 1.1.0+218-g7b907ed built with: bindata, sqlite`)。
- `--custom-path path`，`-C path`：Gitea 自訂文件夾的路徑。可選。 (預設值：`AppWorkPath`/custom 或 `$GITEA_CUSTOM`)。
- `--config path`，`-c path`：Gitea 設定文件的路徑。可選。 (預設值：`custom`/conf/app.ini)。
- `--work-path path`，`-w path`：Gitea 的 `AppWorkPath`。可選。 (預設值：LOCATION_OF_GITEA_BINARY 或 `$GITEA_WORK_DIR`)

注意：預設的 custom-path、config 和 work-path 也可以在構建時更改（如果需要）。

## 命令

### web

啟動伺服器：

- 選項：
  - `--port number`，`-p number`：端口號。可選。 (預設值：3000)。覆蓋設定文件中的設定。
  - `--install-port number`：運行安裝頁面的端口號。可選。 (預設值：3000)。覆蓋設定文件中的設定。
  - `--pid path`，`-P path`：Pid 文件的路徑。可選。
  - `--quiet`，`-q`：只在控制檯上輸出 Fatal 日誌，用於在設定日誌之前發出的日誌。
  - `--verbose`：在控制檯上輸出跟蹤日誌，用於在設定日誌之前發出的日誌。
- 範例：
  - `gitea web`
  - `gitea web --port 80`
  - `gitea web --config /etc/gitea.ini --pid /some/custom/gitea.pid`
- 注意：
  - Gitea 不應以 root 使用者身份運行。要綁定到低於 1024 的端口，您可以在 Linux 上使用 setcap 命令：`sudo setcap 'cap_net_bind_service=+ep' /path/to/gitea`。每次更新 Gitea 都需要重新執行此操作。

### admin

管理員操作：

- 命令：
  - `user`：
    - `list`：
      - 選項：
        - `--admin`：僅列出管理員使用者。可選。
      - 描述：列出所有現有使用者。
      - 範例：
        - `gitea admin user list`
    - `delete`：
      - 選項：
        - `--email`：要刪除的使用者的電子郵件。
        - `--username`：要刪除的使用者的使用者名稱。
        - `--id`：要刪除的使用者的 ID。
        - 必須提供 `--id`、`--username` 或 `--email` 中的一個。如果提供多個，則所有條件必須匹配。
      - 範例：
        - `gitea admin user delete --id 1`
    - `create`：
      - 選項：
        - `--name value`：使用者名稱。必填。自 Gitea 1.9.0 版本起，請改用 `--username` 標誌。
        - `--username value`：使用者名稱。必填。Gitea 1.9.0 新增。
        - `--password value`：密碼。必填。
        - `--email value`：郵箱。必填。
        - `--admin`：如果提供此選項，將建立一個管理員使用者。可選。
        - `--access-token`：如果提供，將為使用者建立存取權杖。可選。（預設值：false）。
        - `--must-change-password`：如果提供，建立的使用者將在初始登入後需要選擇一個新密碼。可選。（預設值：true）。
        - `--random-password`：如果提供，將使用隨機生成的密碼作為建立使用者的密碼。`--password` 的值將被忽略。可選。
        - `--random-password-length`：如果提供，將用於設定隨機生成密碼的長度。可選。（預設值：12）
      - 範例：
        - `gitea admin user create --username myname --password asecurepassword --email me@example.com`
    - `change-password`：
      - 選項：
        - `--username value`，`-u value`：使用者名稱。必填。
        - `--password value`，`-p value`：新密碼。必填。
      - 範例：
        - `gitea admin user change-password --username myname --password asecurepassword`
    - `must-change-password`：
      - 參數：
        - `[username...]`：需要更改密碼的使用者
      - 選項：
        - `--all`，`-A`：強制所有使用者更改密碼
        - `--exclude username`，`-e username`：排除給定的使用者。可以多次設定。
        - `--unset`：撤銷對給定使用者的強制密碼更改
  - `regenerate`：
    - 選項：
      - `hooks`：重新生成所有儲存庫的 Git Hooks。
      - `keys`：重新生成 authorized_keys 文件。
    - 範例：
      - `gitea admin regenerate hooks`
      - `gitea admin regenerate keys`
  - `auth`：
    - `list`：
      - 描述：列出所有存在的外部認證源。
      - 範例：
        - `gitea admin auth list`
    - `delete`：
      - 選項：
        - `--id`：要刪除的源的 ID。必填。
      - 範例：
        - `gitea admin auth delete --id 1`
    - `add-oauth`：
      - 選項：
        - `--name`：應用程式名稱。
        - `--provider`：OAuth2 提供者。
        - `--key`：客戶端 ID（Key）。
        - `--secret`：客戶端密鑰。
        - `--auto-discover-url`：OpenID Connect 自動發現 URL（僅在使用 OpenID Connect 作為提供程式時需要）。
        - `--use-custom-urls`：在 GitLab/GitHub OAuth 端點上使用自訂 URL。
        - `--custom-tenant-id`：在 OAuth 端點上使用自訂租戶 ID。
        - `--custom-auth-url`：使用自訂授權 URL（GitLab/GitHub 的選項）。
        - `--custom-token-url`：使用自訂令牌 URL（GitLab/GitHub 的選項）。
        - `--custom-profile-url`：使用自訂設定文件 URL（GitLab/GitHub 的選項）。
        - `--custom-email-url`：使用自訂電子郵件 URL（GitHub 的選項）。
        - `--icon-url`：OAuth2 登入源的自訂圖標 URL。
        - `--skip-local-2fa`：允許源覆蓋本地 2FA。（可選）
        - `--scopes`：請求此 OAuth2 源的附加範圍。（可選）
        - `--required-claim-name`：必須設定的聲明名稱，以允許使用者使用此源登入。（可選）
        - `--required-claim-value`：必須設定的聲明值，以允許使用者使用此源登入。（可選）
        - `--group-claim-name`：提供此源的組名的聲明名稱。（可選）
        - `--admin-group`：管理員使用者的組聲明值。（可選）
        - `--restricted-group`：受限使用者的組聲明值。（可選）
        - `--group-team-map`：組與組織團隊之間的 JSON 映射。（可選）
        - `--group-team-map-removal`：根據組自動激活團隊成員資格的刪除。（可選）
      - 範例：
        - `gitea admin auth add-oauth --name external-github --provider github --key OBTAIN_FROM_SOURCE --secret OBTAIN_FROM_SOURCE`
    - `update-oauth`：
      - 選項：
        - `--id`：要更新的源的 ID。必填。
        - `--name`：應用程式名稱。
        - `--provider`：OAuth2 提供者。
        - `--key`：客戶端 ID（Key）。
        - `--secret`：客戶端密鑰。
        - `--auto-discover-url`：OpenID Connect 自動發現 URL（僅在使用 OpenID Connect 作為提供程式時需要）。
        - `--use-custom-urls`：在 GitLab/GitHub OAuth 端點上使用自訂 URL。
        - `--custom-tenant-id`：在 OAuth 端點上使用自訂租戶 ID。
        - `--custom-auth-url`：使用自訂授權 URL（GitLab/GitHub 的選項）。
        - `--custom-token-url`：使用自訂令牌 URL（GitLab/GitHub 的選項）。
        - `--custom-profile-url`：使用自訂設定文件 URL（GitLab/GitHub 的選項）。
        - `--custom-email-url`：使用自訂電子郵件 URL（GitHub 的選項）。
        - `--icon-url`：OAuth2 登入源的自訂圖標 URL。
        - `--skip-local-2fa`：允許源覆蓋本地 2FA。（可選）
        - `--scopes`：請求此 OAuth2 源的附加範圍。
        - `--required-claim-name`：必須設定的聲明名稱，以允許使用者使用此源登入。（可選）
        - `--required-claim-value`：必須設定的聲明值，以允許使用者使用此源登入。（可選）
        - `--group-claim-name`：提供此源的組名的聲明名稱。（可選）
        - `--admin-group`：管理員使用者的組聲明值。（可選）
        - `--restricted-group`：受限使用者的組聲明值。（可選）
      - 範例：
        - `gitea admin auth update-oauth --id 1 --name external-github-updated`
    - `add-smtp`：
      - 選項：
        - `--name`：應用程式名稱。必填。
        - `--auth-type`：SMTP 認證類型（PLAIN/LOGIN/CRAM-MD5）。預設為 PLAIN。
        - `--host`：SMTP 主機。必填。
        - `--port`：SMTP 端口。必填。
        - `--force-smtps`：SMTPS 始終在端口 465 上使用。設定此選項以強制在其他端口上使用 SMTPS。
        - `--skip-verify`：跳過 TLS 驗證。
        - `--helo-hostname`：發送 HELO 時使用的主機名。留空以發送當前主機名。
        - `--disable-helo`：禁用 SMTP helo。
        - `--allowed-domains`：留空以允許所有域。使用逗號（','）分隔多個域。
        - `--skip-local-2fa`：跳過 2FA 登入。
        - `--active`：啟用此認證源。
          備註：
          `--force-smtps`、`--skip-verify`、`--disable-helo`、`--skip-local-2fs` 和 `--active` 選項可以採用以下形式使用：
        - `--option`、`--option=true` 以啟用選項
        - `--option=false` 以禁用選項
          如果未指定這些選項，則在 `update-smtp` 中不會更改值，或者在 `add-smtp` 中將使用預設的 `false` 值。
      - 範例：
        - `gitea admin auth add-smtp --name ldap --host smtp.mydomain.org --port 587 --skip-verify --active`
    - `update-smtp`：
      - 選項：
        - `--id`：要更新的源的 ID。必填。
        - 其他選項與 `add-smtp` 共享
      - 範例：
        - `gitea admin auth update-smtp --id 1 --host smtp.mydomain.org --port 587 --skip-verify=false`
        - `gitea admin auth update-smtp --id 1 --active=false`
    - `add-ldap`：添加新的 LDAP（通過 Bind DN）認證源
      - 選項：
        - `--name value`：認證名稱。必填。
        - `--not-active`：停用認證源。
        - `--security-protocol value`：安全協議名稱。必填。
        - `--skip-tls-verify`：禁用 TLS 驗證。
        - `--host value`：LDAP 伺服器的地址。必填。
        - `--port value`：連接到 LDAP 伺服器時使用的端口。必填。
        - `--user-search-base value`：使用者帳戶將在其中搜索的 LDAP 基礎路徑。必填。
        - `--user-filter value`：聲明如何查找試圖進行身份驗證的使用者記錄的 LDAP 過濾器。必填。
        - `--admin-filter value`：指定是否應授予使用者管理員特權的 LDAP 過濾器。
        - `--restricted-filter value`：指定是否應將使用者設定為受限狀態的 LDAP 過濾器。
        - `--username-attribute value`：使用者 LDAP 記錄中包含使用者名稱的屬性。
        - `--firstname-attribute value`：使用者 LDAP 記錄中包含使用者名稱字的屬性。
        - `--surname-attribute value`：使用者 LDAP 記錄中包含使用者姓氏的屬性。
        - `--email-attribute value`：使用者 LDAP 記錄中包含使用者電子電子郵件地址的屬性。必填。
        - `--public-ssh-key-attribute value`：使用者 LDAP 記錄中包含使用者公共 SSH 密鑰的屬性。
        - `--avatar-attribute value`：使用者 LDAP 記錄中包含使用者頭像的屬性。
        - `--bind-dn value`：在搜索使用者時綁定到 LDAP 伺服器的 DN。
        - `--bind-password value`：綁定 DN 的密碼（如果有）。
        - `--attributes-in-bind`：在綁定 DN 上下文中獲取屬性。
        - `--synchronize-users`：啟用使用者同步。
        - `--page-size value`：搜索頁面大小。
      - 範例：
        - `gitea admin auth add-ldap --name ldap --security-protocol unencrypted --host mydomain.org --port 389 --user-search-base "ou=Users,dc=mydomain,dc=org" --user-filter "(&(objectClass=posixAccount)(|(uid=%[1]s)(mail=%[1]s)))" --email-attribute mail`
    - `update-ldap`：更新現有的 LDAP（通過 Bind DN）認證源
      - 選項：
        - `--id value`：認證源的 ID。必填。
        - `--name value`：認證名稱。
        - `--not-active`：停用認證源。
        - `--security-protocol value`：安全協議名稱。
        - `--skip-tls-verify`：禁用 TLS 驗證。
        - `--host value`：LDAP 伺服器的地址。
        - `--port value`：連接到 LDAP 伺服器時使用的端口。
        - `--user-search-base value`：使用者帳戶將在其中搜索的 LDAP 基礎路徑。
        - `--user-filter value`：聲明如何查找試圖進行身份驗證的使用者記錄的 LDAP 過濾器。
        - `--admin-filter value`：指定是否應授予使用者管理員特權的 LDAP 過濾器。
        - `--restricted-filter value`：指定是否應將使用者設定為受限狀態的 LDAP 過濾器。
        - `--username-attribute value`：使用者 LDAP 記錄中包含使用者名稱的屬性。
        - `--firstname-attribute value`：使用者 LDAP 記錄中包含使用者名稱字的屬性。
        - `--surname-attribute value`：使用者 LDAP 記錄中包含使用者姓氏的屬性。
        - `--email-attribute value`：使用者 LDAP 記錄中包含使用者電子電子郵件地址的屬性。
        - `--public-ssh-key-attribute value`：使用者 LDAP 記錄中包含使用者公共 SSH 密鑰的屬性。
        - `--avatar-attribute value`：使用者 LDAP 記錄中包含使用者頭像的屬性。
        - `--bind-dn value`：在搜索使用者時綁定到 LDAP 伺服器的 DN。
        - `--bind-password value`：綁定 DN 的密碼（如果有）。
        - `--attributes-in-bind`：在綁定 DN 上下文中獲取屬性。
        - `--synchronize-users`：啟用使用者同步。
        - `--page-size value`：搜索頁面大小。
      - 範例：
        - `gitea admin auth update-ldap --id 1 --name "my ldap auth source"`
        - `gitea admin auth update-ldap --id 1 --username-attribute uid --firstname-attribute givenName --surname-attribute sn`
    - `add-ldap-simple`：添加新的 LDAP（簡單身份驗證）認證源
      - 選項：
        - `--name value`：認證名稱。必填。
        - `--not-active`：停用認證源。
        - `--security-protocol value`：安全協議名稱。必填。
        - `--skip-tls-verify`：禁用 TLS 驗證。
        - `--host value`：LDAP 伺服器的地址。必填。
        - `--port value`：連接到 LDAP 伺服器時使用的端口。必填。
        - `--user-search-base value`：使用者帳戶將在其中搜索的 LDAP 基礎路徑。
        - `--user-filter value`：聲明如何查找試圖進行身份驗證的使用者記錄的 LDAP 過濾器。必填。
        - `--admin-filter value`：指定是否應授予使用者管理員特權的 LDAP 過濾器。
        - `--restricted-filter value`：指定是否應將使用者設定為受限狀態的 LDAP 過濾器。
        - `--username-attribute value`：使用者 LDAP 記錄中包含使用者名稱的屬性。
        - `--firstname-attribute value`：使用者 LDAP 記錄中包含使用者名稱字的屬性。
        - `--surname-attribute value`：使用者 LDAP 記錄中包含使用者姓氏的屬性。
        - `--email-attribute value`：使用者 LDAP 記錄中包含使用者電子電子郵件地址的屬性。必填。
        - `--public-ssh-key-attribute value`：使用者 LDAP 記錄中包含使用者公共 SSH 密鑰的屬性。
        - `--avatar-attribute value`：使用者 LDAP 記錄中包含使用者頭像的屬性。
        - `--user-dn value`：使用者的 DN。必填。
      - 範例：
        - `gitea admin auth add-ldap-simple --name ldap --security-protocol unencrypted --host mydomain.org --port 389 --user-dn "cn=%s,ou=Users,dc=mydomain,dc=org" --user-filter "(&(objectClass=posixAccount)(cn=%s))" --email-attribute mail`
    - `update-ldap-simple`：更新現有的 LDAP（簡單身份驗證）認證源
      - 選項：
        - `--id value`：認證源的 ID。必填。
        - `--name value`：認證名稱。
        - `--not-active`：停用認證源。
        - `--security-protocol value`：安全協議名稱。
        - `--skip-tls-verify`：禁用 TLS 驗證。
        - `--host value`：LDAP 伺服器的地址。
        - `--port value`：連接到 LDAP 伺服器時使用的端口。
        - `--user-search-base value`：使用者帳戶將在其中搜索的 LDAP 基礎路徑。
        - `--user-filter value`：聲明如何查找試圖進行身份驗證的使用者記錄的 LDAP 過濾器。
        - `--admin-filter value`：指定是否應授予使用者管理員特權的 LDAP 過濾器。
        - `--restricted-filter value`：指定是否應將使用者設定為受限狀態的 LDAP 過濾器。
        - `--username-attribute value`：使用者 LDAP 記錄中包含使用者名稱的屬性。
        - `--firstname-attribute value`：使用者 LDAP 記錄中包含使用者名稱字的屬性。
        - `--surname-attribute value`：使用者 LDAP 記錄中包含使用者姓氏的屬性。
        - `--email-attribute value`：使用者 LDAP 記錄中包含使用者電子電子郵件地址的屬性。
        - `--public-ssh-key-attribute value`：使用者 LDAP 記錄中包含使用者公共 SSH 密鑰的屬性。
        - `--avatar-attribute value`：使用者 LDAP 記錄中包含使用者頭像的屬性。
        - `--user-dn value`：使用者的 DN。
      - 範例：
        - `gitea admin auth update-ldap-simple --id 1 --name "my ldap auth source"`
        - `gitea admin auth update-ldap-simple --id 1 --username-attribute uid --firstname-attribute givenName --surname-attribute sn`

### cert

生成自簽名的 SSL 證書。將輸出到當前目錄下的`cert.pem`和`key.pem`文件中，並且會覆蓋任何現有文件。

- 選項：
  - `--host value`：逗號分隔的主機名和 IP 地址列表，此證書適用於這些主機。支援使用通配符。必填。
  - `--ecdsa-curve value`：用於生成密鑰的 ECDSA 曲線。可選。有效選項為 P224、P256、P384、P521。
  - `--rsa-bits value`：要生成的 RSA 密鑰的大小。可選。如果設定了--ecdsa-curve，則忽略此選項。（預設值：3072）。
  - `--start-date value`：證書的建立日期。可選。（格式：`Jan 1 15:04:05 2011`）。
  - `--duration value`：證書有效期。可選。（預設值：8760h0m0s）
  - `--ca`：如果提供此選項，則證書將生成自己的證書頒發機構。可選。
- 範例：
  - `gitea cert --host git.example.com,example.com,www.example.com --ca`

### dump

將所有文件和資料庫導出到一個 zip 文件中。輸出文件將保存在當前目錄下，類似於`gitea-dump-1482906742.zip`。

- 選項：
  - `--file name`，`-f name`：指定要建立的導出文件的名稱。可選。（預設值：gitea-dump-[timestamp].zip）。
  - `--tempdir path`，`-t path`：指定臨時目錄的路徑。可選。（預設值：/tmp）。
  - `--skip-repository`，`-R`：跳過儲存庫的導出。可選。
  - `--skip-custom-dir`：跳過自訂目錄的導出。可選。
  - `--skip-lfs-data`：跳過 LFS 資料的導出。可選。
  - `--skip-attachment-data`：跳過附件資料的導出。可選。
  - `--skip-package-data`：跳過包資料的導出。可選。
  - `--skip-log`：跳過日誌資料的導出。可選。
  - `--database`，`-d`：指定資料庫的 SQL 語法。可選。
  - `--verbose`，`-V`：如果提供此選項，顯示附加詳細資訊。可選。
  - `--type`：設定導出的格式。可選。（預設值：zip）
- 範例：
  - `gitea dump`
  - `gitea dump --verbose`

### generate

用於在設定文件中生成隨機值和令牌。對於自動部署時生成值非常有用。

- 命令:
  - `secret`:
    - 選項:
      - `INTERNAL_TOKEN`: 用於內部 API 調用身份驗證的令牌。
      - `JWT_SECRET`: 用於 LFS 和 OAUTH2 JWT 身份驗證的密鑰（LFS_JWT_SECRET 是此選項的別名，用於向後相容）。
      - `SECRET_KEY`: 全域密鑰。
    - 範例:
      - `gitea generate secret INTERNAL_TOKEN`
      - `gitea generate secret JWT_SECRET`
      - `gitea generate secret SECRET_KEY`

### keys

提供一個 SSHD AuthorizedKeysCommand。需要在 sshd 設定文件中進行設定:

```ini
...
# -e 的值和 AuthorizedKeysCommandUser 應與運行 Gitea 的用戶名匹配
AuthorizedKeysCommandUser git
AuthorizedKeysCommand /path/to/gitea keys -e git -u %u -t %t -k %k
```

該命令將返回適用於提供的密鑰的合適 authorized_keys 行。您還應在 `app.ini` 的 `[server]` 部分設定值 `SSH_CREATE_AUTHORIZED_KEYS_FILE=false`。

注意: opensshd 要求 Gitea 程式由 root 擁有，並且不可由組或其他人寫入。程式必須使用絕對路徑指定。
注意: Gitea 必須在運行此命令時處於運行狀態才能成功。

### migrate

遷移資料庫。該命令可用於在首次啟動伺服器之前運行其他命令。此命令是冪等的。

### doctor check

對 Gitea 實例進行診斷，可以修復一些可修復的問題。
預設只運行部分檢查，額外的檢查可以參考：

- `gitea doctor check --list` - 列出所有可用的檢查
- `gitea doctor check --all` - 運行所有可用的檢查
- `gitea doctor check --default` - 運行預設的檢查
- `gitea doctor check --run [check(s),]...` - 運行指定的名字的檢查

有些問題可以透過設定 `--fix` 選項進行自動修復。
額外的日誌可以透過 `--log-file=...` 進行設定。

#### doctor recreate-table

有時，在遷移時，舊的列和預設值可能會在資料庫模式中保持不變。這可能會導致警告，如下所示:

```
2020/08/02 11:32:29 ...rm/session_schema.go:360:Sync() [W] Table user Column keep_activity_private db default is , struct default is 0
```

您可以透過以下方式讓 Gitea 重新建立這些表，並將舊資料複製到新表中，並適當設定預設值：

```
gitea doctor recreate-table user
```

您可以使用以下方式讓 Gitea 重新建立多個表：

```
gitea doctor recreate-table table1 table2 ...
```

如果您希望 Gitea 重新建立所有表，請直接調用：

```
gitea doctor recreate-table
```

強烈建議在運行這些命令之前備份您的資料庫。

### doctor convert

將現有的 MySQL 資料庫從 utf8 轉換為 utf8mb4，或者把 MSSQL 資料庫從 varchar 轉換為 nvarchar。

### manager

管理運行中的伺服器操作：

- 命令:
  - `shutdown`: 優雅地關閉運行中的進程
  - `restart`: 優雅地重新啟動運行中的進程（對於 Windows 伺服器尚未實現）
  - `flush-queues`: 刷新運行中的進程中的隊列
    - 選項:
      - `--timeout value`: 刷新過程的超時時間（預設值: 1m0s）
      - `--non-blocking`: 設定為 true，以在返回之前不等待刷新完成
  - `logging`: 調整日誌命令
    - 命令:
      - `pause`: 暫停日誌記錄
        - 注意:
          - 如果日誌級別低於此級別，日誌級別將被臨時提升為 INFO。
          - Gitea 將在一定程度上緩衝日誌，並在超過該點後丟棄日誌。
      - `resume`: 恢復日誌記錄
      - `release-and-reopen`: 使 Gitea 釋放和重新打開用於日誌記錄的文件和連接（相當於向 Gitea 發送 SIGUSR1 信號）。
      - `remove name`: 刪除指定的日誌記錄器
        - 選項:
          - `--group group`, `-g group`: 從中刪除子記錄器的組（預設為`default`）
      - `add`: 添加日誌記錄器
        - 命令:
          - `console`: 添加控制檯日誌記錄器
            - 選項:
              - `--group value`, `-g value`: 要添加日誌記錄器的組 - 預設為"default"
              - `--name value`, `-n value`: 新日誌記錄器的名稱 - 預設為模式
              - `--level value`, `-l value`: 新日誌記錄器的日誌級別
              - `--stacktrace-level value`, `-L value`: 堆棧跟蹤日誌級別
              - `--flags value`, `-F value`: 日誌記錄器的標誌
              - `--expression value`, `-e value`: 日誌記錄器的匹配表達式
              - `--prefix value`, `-p value`: 日誌記錄器的前綴
              - `--color`: 在日誌中使用顏色
              - `--stderr`: 將控制檯日誌輸出到 stderr - 僅適用於控制檯
          - `file`: 添加文件日誌記錄器
            - 選項:
              - `--group value`, `-g value`: 要添加日誌記錄器的組 - 預設為"default"
              - `--name value`, `-n value`: 新日誌記錄器的名稱 - 預設為模式
              - `--level value`, `-l value`: 新日誌記錄器的日誌級別
              - `--stacktrace-level value`, `-L value`: 堆棧跟蹤日誌級別
              - `--flags value`, `-F value`: 日誌記錄器的標誌
              - `--expression value`, `-e value`: 日誌記錄器的匹配表達式
              - `--prefix value`, `-p value`: 日誌記錄器的前綴
              - `--color`: 在日誌中使用顏色
              - `--filename value`, `-f value`: 日誌記錄器的文件名
              - `--rotate`, `-r`: 輪轉日誌
              - `--max-size value`, `-s value`: 在輪轉之前的最大大小（以位元組為單位）
              - `--daily`, `-d`: 每天輪轉日誌
              - `--max-days value`, `-D value`: 保留的每日日誌的最大數量
              - `--compress`, `-z`: 壓縮輪轉的日誌
              - `--compression-level value`, `-Z value`: 使用的壓縮級別
          - `conn`: 添加網路連接日誌記錄器
            - 選項:
              - `--group value`, `-g value`: 要添加日誌記錄器的組 - 預設為"default"
              - `--name value`, `-n value`: 新日誌記錄器的名稱 - 預設為模式
              - `--level value`, `-l value`: 新日誌記錄器的日誌級別
              - `--stacktrace-level value`, `-L value`: 堆棧跟蹤日誌級別
              - `--flags value`, `-F value`: 日誌記錄器的標誌
              - `--expression value`, `-e value`: 日誌記錄器的匹配表達式
              - `--prefix value`, `-p value`: 日誌記錄器的前綴
              - `--color`: 在日誌中使用顏色
              - `--reconnect-on-message`, `-R`: 對於每個消息重新連接主機
              - `--reconnect`, `-r`: 連接中斷時重新連接主機
              - `--protocol value`, `-P value`: 設定要使用的協議：tcp、unix 或 udp（預設為 tcp）
              - `--address value`, `-a value`: 要連接到的主機地址和端口（預設為:7020）
          - `smtp`: 添加 SMTP 日誌記錄器
            - 選項:
              - `--group value`, `-g value`: 要添加日誌記錄器的組 - 預設為"default"
              - `--name value`, `-n value`: 新日誌記錄器的名稱 - 預設為模式
              - `--level value`, `-l value`: 新日誌記錄器的日誌級別
              - `--stacktrace-level value`, `-L value`: 堆棧跟蹤日誌級別
              - `--flags value`, `-F value`: 日誌記錄器的標誌
              - `--expression value`, `-e value`: 日誌記錄器的匹配表達式
              - `--prefix value`, `-p value`: 日誌記錄器的前綴
              - `--color`: 在日誌中使用顏色
              - `--username value`, `-u value`: 郵件伺服器使用者名稱
              - `--password value`, `-P value`: 郵件伺服器密碼
              - `--host value`, `-H value`: 郵件伺服器主機（預設為: 127.0.0.1:25）
              - `--send-to value`, `-s value`: 要發送到的電子電子郵件地址
              - `--subject value`, `-S value`: 發送電子郵件的主題標題
  - `processes`: 顯示 Gitea 進程和 Goroutine 資訊
    - 選項:
      - `--flat`: 以平面表格形式顯示進程，而不是樹形結構
      - `--no-system`: 不顯示系統進程
      - `--stacktraces`: 顯示與進程關聯的 Goroutine 的堆棧跟蹤
      - `--json`: 輸出為 JSON 格式
      - `--cancel PID`: 向具有 PID 的進程發送取消命令（僅適用於非系統進程）

### dump-repo

`dump-repo` 從 Git/GitHub/Gitea/GitLab 中轉儲儲存庫資料：

- 選項：
  - `--git_service service`：Git 服務，可以是 `git`、`github`、`gitea`、`gitlab`。如果 `clone_addr` 可以被識別，則可以忽略此選項。
  - `--repo_dir dir`，`-r dir`：儲存資料的儲存庫目錄路徑。
  - `--clone_addr addr`：將被克隆的 URL，目前可以是 git/github/gitea/gitlab 的 http/https URL。例如：https://github.com/lunny/tango.git
  - `--auth_username lunny`：訪問 `clone_addr` 的使用者名稱。
  - `--auth_password <password>`：訪問 `clone_addr` 的密碼。
  - `--auth_token <token>`：訪問 `clone_addr` 的個人令牌。
  - `--owner_name lunny`：如果非空，資料將儲存在具有所有者名稱的目錄中。
  - `--repo_name tango`：如果非空，資料將儲存在具有儲存庫名稱的目錄中。
  - `--units <units>`：要遷移的專案，一個或多個專案應以逗號分隔。允許的專案有 wiki, issues, labels, releases, release_assets, milestones, pull_requests, comments。如果為空，則表示所有專案。

### restore-repo

`restore-repo` 從磁盤目錄中還原儲存庫資料：

- 選項：
  - `--repo_dir dir`，`-r dir`：還原資料的儲存庫目錄路徑。
  - `--owner_name lunny`：還原目標所有者名稱。
  - `--repo_name tango`：還原目標儲存庫名稱。
  - `--units <units>`：要還原的專案，一個或多個專案應以逗號分隔。允許的專案有 wiki, issues, labels, releases, release_assets, milestones, pull_requests, comments。如果為空，則表示所有專案。

### actions generate-runner-token

生成一個供 Runner 使用的新令牌，用於向伺服器註冊。

- 選項：
  - `--scope {owner}[/{repo}]`，`-s {owner}[/{repo}]`：限制 Runner 的範圍，沒有範圍表示該 Runner 可用於所有儲存庫，但你也可以將其限制為特定的儲存庫或所有者。

要註冊全域 Runner：

```
gitea actions generate-runner-token
```

要註冊特定組織的 Runner，例如 `org`：

```
gitea actions generate-runner-token -s org
```

要註冊特定儲存庫的 Runner，例如 `username/test-repo`：

```
gitea actions generate-runner-token -s username/test-repo
```
