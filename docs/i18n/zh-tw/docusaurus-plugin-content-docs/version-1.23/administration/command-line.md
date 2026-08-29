---
date: "2017-01-01T16:00:00+02:00"
slug: "command-line"
sidebar_position: 1
aliases:
  - /zh-tw/command-line
---

# Gitea 命令行

## 用法

`gitea [全域選項] 命令 [命令或全域選項] [參數...]`

## 全域選項

所有全域選項都可以放在命令級別。

- `--help`, `-h`: 顯示幫助文本並退出。可選。
- `--version`, `-v`: 顯示版本並退出。可選。（範例：`Gitea version 1.1.0+218-g7b907ed built with: bindata, sqlite`）。
- `--work-path path`, `-w path`: Gitea 的工作路徑。可選。（預設：二進制文件的路徑或 `$GITEA_WORK_DIR`）
- `--custom-path path`, `-C path`: Gitea 的自訂文件夾路徑。可選。（預設：`WorkPath`/custom 或 `$GITEA_CUSTOM`）。
- `--config path`, `-c path`: Gitea 設定文件路徑。可選。（預設：`CustomPath`/conf/app.ini）。

注意：預設的 custom-path、config 和 work-path 也可以在構建時更改（如果需要）。

## 命令

### web

啟動伺服器：

- 選項：
  - `--port number`, `-p number`: 端口號。可選。（預設：3000）。覆蓋設定文件。
  - `--install-port number`: 運行安裝頁面的端口號。可選。（預設：3000）。覆蓋設定文件。
  - `--pid path`, `-P path`: Pidfile 路徑。可選。
  - `--quiet`, `-q`: 只在控制檯上發出致命日誌，適用於日誌設定之前的日誌。
  - `--verbose`: 在控制檯上發出跟蹤日誌，適用於日誌設定之前的日誌。
- 範例：
  - `gitea web`
  - `gitea web --port 80`
  - `gitea web --config /etc/gitea.ini --pid /some/custom/gitea.pid`
- 注意：
  - Gitea 不應以 root 身份運行。要綁定到 1024 以下的端口，可以在 Linux 上使用 setcap：`sudo setcap 'cap_net_bind_service=+ep' /path/to/gitea`。每次更新 Gitea 時都需要重新執行此操作。

### admin

管理操作：

- 命令：
  - `user`:
    - `list`:
      - 選項：
        - `--admin`: 僅列出管理員使用者。可選。
      - 描述：列出所有存在的使用者
      - 範例：
        - `gitea admin user list`
    - `delete`:
      - 選項：
        - `--email`: 要刪除的使用者的電子郵件。
        - `--username`: 要刪除的使用者名稱。
        - `--id`: 要刪除的使用者 ID。
        - 需要提供 `--id`、`--username` 或 `--email` 之一。如果提供了多個，則所有都必須匹配。
      - 範例：
        - `gitea admin user delete --id 1`
    - `create`:
      - 選項：
        - `--name value`: 使用者名稱。必需。從 Gitea 1.9.0 開始，使用 `--username` 標誌代替。
        - `--username value`: 使用者名稱。必需。Gitea 1.9.0 中的新功能。
        - `--password value`: 密碼。必需。
        - `--email value`: 電子郵件。必需。
        - `--admin`: 如果提供，這將使使用者成為管理員。可選。
        - `--access-token`: 如果提供，將為使用者建立存取權杖。可選。（預設：false）。
        - `--must-change-password`: 建立的使用者在首次登入後需要設定新密碼，預設：true。可以透過 `--must-change-password=false` 禁用。
        - `--random-password`: 如果提供，將使用隨機生成的密碼作為建立使用者的密碼。`--password` 的值將被丟棄。可選。
        - `--random-password-length`: 如果提供，將用於設定隨機生成的密碼的長度。可選。（預設：12）
      - 範例：
        - `gitea admin user create --username myname --password asecurepassword --email me@example.com`
    - `change-password`:
      - 選項：
        - `--username value`, `-u value`: 使用者名稱。必需。
        - `--password value`, `-p value`: 新密碼。必需。
        - `--must-change-password`: 使用者在登入後需要設定新密碼，預設：true。可以透過 `--must-change-password=false` 禁用。
      - 範例：
        - `gitea admin user change-password --username myname --password asecurepassword`
    - `must-change-password`:
      - 參數：
        - `[username...]`: 必須更改密碼的使用者
      - 選項：
        - `--all`, `-A`: 強制所有使用者更改密碼
        - `--exclude username`, `-e username`: 排除給定的使用者。可以多次設定。
        - `--unset`: 撤銷給定使用者的強制密碼更改
    - `generate-access-token`:
      - 選項：
        - `--username value`, `-u value`: 使用者名稱。必需。
        - `--token-name value`, `-t value`: 令牌名稱。必需。
        - `--scopes value`: 逗號分隔的範圍列表。範圍遵循格式 `[read|write]:<block>` 或 `all`，其中 `<block>` 是可見組之一，您可以在打開顯示可用路由的 API 頁面時看到（例如 `repo`）。
      - 範例：
        - `gitea admin user generate-access-token --username myname --token-name mytoken`
        - `gitea admin user generate-access-token --help`
  - `regenerate`
    - 選項：
      - `hooks`: 為所有儲存庫重新生成 Git 鉤子
      - `keys`: 重新生成 authorized_keys 文件
    - 範例：
      - `gitea admin regenerate hooks`
      - `gitea admin regenerate keys`
  - `auth`:
    - `list`:
      - 描述：列出所有存在的外部身份驗證源
      - 範例：
        - `gitea admin auth list`
    - `delete`:
      - 選項：
        - `--id`: 要刪除的源的 ID。必需。
      - 範例：
        - `gitea admin auth delete --id 1`
    - `add-oauth`:
      - 選項：
        - `--name`: 應用程式名稱。
        - `--provider`: OAuth2 提供者。
        - `--key`: 客戶端 ID（密鑰）。
        - `--secret`: 客戶端密鑰。
        - `--auto-discover-url`: OpenID Connect 自動發現 URL（僅在使用 OpenID Connect 作為提供者時需要）。
        - `--use-custom-urls`: 使用自訂 URL 用於 GitLab/GitHub OAuth 端點。
        - `--custom-tenant-id`: 使用自訂租戶 ID 用於 OAuth 端點。
        - `--custom-auth-url`: 使用自訂授權 URL（GitLab/GitHub 的選項）。
        - `--custom-token-url`: 使用自訂令牌 URL（GitLab/GitHub 的選項）。
        - `--custom-profile-url`: 使用自訂設定文件 URL（GitLab/GitHub 的選項）。
        - `--custom-email-url`: 使用自訂電子郵件 URL（GitHub 的選項）。
        - `--icon-url`: 自訂圖標 URL 用於 OAuth2 登入源。
        - `--skip-local-2fa`: 允許源覆蓋本地 2FA。（可選）
        - `--scopes`: 為此 OAuth2 源請求的其他範圍。（可選）
        - `--required-claim-name`: 必須設定的聲明名稱，以允許使用者使用此源登入。（可選）
        - `--required-claim-value`: 必須設定的聲明值，以允許使用者使用此源登入。（可選）
        - `--group-claim-name`: 為此源提供組名稱的聲明名稱。（可選）
        - `--admin-group`: 管理員使用者的組聲明值。（可選）
        - `--restricted-group`: 受限使用者的組聲明值。（可選）
        - `--group-team-map`: 組與組織團隊之間的 JSON 映射。（可選）
        - `--group-team-map-removal`: 根據組啟用自動團隊成員刪除。（可選）
      - 範例：
        - `gitea admin auth add-oauth --name external-github --provider github --key OBTAIN_FROM_SOURCE --secret OBTAIN_FROM_SOURCE`
    - `update-oauth`:
      - 選項：
        - `--id`: 要更新的源的 ID。必需。
        - `--name`: 應用程式名稱。
        - `--provider`: OAuth2 提供者。
        - `--key`: 客戶端 ID（密鑰）。
        - `--secret`: 客戶端密鑰。
        - `--auto-discover-url`: OpenID Connect 自動發現 URL（僅在使用 OpenID Connect 作為提供者時需要）。
        - `--use-custom-urls`: 使用自訂 URL 用於 GitLab/GitHub OAuth 端點。
        - `--custom-tenant-id`: 使用自訂租戶 ID 用於 OAuth 端點。
        - `--custom-auth-url`: 使用自訂授權 URL（GitLab/GitHub 的選項）。
        - `--custom-token-url`: 使用自訂令牌 URL（GitLab/GitHub 的選項）。
        - `--custom-profile-url`: 使用自訂設定文件 URL（GitLab/GitHub 的選項）。
        - `--custom-email-url`: 使用自訂電子郵件 URL（GitHub 的選項）。
        - `--icon-url`: 自訂圖標 URL 用於 OAuth2 登入源。
        - `--skip-local-2fa`: 允許源覆蓋本地 2FA。（可選）
        - `--scopes`: 為此 OAuth2 源請求的其他範圍。
        - `--required-claim-name`: 必須設定的聲明名稱，以允許使用者使用此源登入。（可選）
        - `--required-claim-value`: 必須設定的聲明值，以允許使用者使用此源登入。（可選）
        - `--group-claim-name`: 為此源提供組名稱的聲明名稱。（可選）
        - `--admin-group`: 管理員使用者的組聲明值。（可選）
        - `--restricted-group`: 受限使用者的組聲明值。（可選）
      - 範例：
        - `gitea admin auth update-oauth --id 1 --name external-github-updated`
    - `add-smtp`:
      - 選項：
        - `--name`: 應用程式名稱。必需。
        - `--auth-type`: SMTP 身份驗證類型（PLAIN/LOGIN/CRAM-MD5）。預設為 PLAIN。
        - `--host`: SMTP 主機。必需。
        - `--port`: SMTP 端口。必需。
        - `--force-smtps`: SMTPS 始終用於端口 465。設定此選項以在其他端口上強制使用 SMTPS。
        - `--skip-verify`: 跳過 TLS 驗證。
        - `--helo-hostname`: 與 HELO 一起發送的主機名。留空以發送當前主機名。
        - `--disable-helo`: 禁用 SMTP helo。
        - `--allowed-domains`: 留空以允許所有域。用逗號（','）分隔多個域。
        - `--skip-local-2fa`: 跳過 2FA 登入。
        - `--active`: 此身份驗證源已激活。
          備註：
          `--force-smtps`、`--skip-verify`、`--disable-helo`、`--skip-loca-2fs` 和 `--active` 選項可以使用以下形式：
        - `--option`、`--option=true` 以啟用
        - `--option=false` 以禁用
          如果未指定這些選項，則在 `update-smtp` 中不會更改值，或在 `add-smtp` 中使用預設 `false` 值
      - 範例：
        - `gitea admin auth add-smtp --name ldap --host smtp.mydomain.org --port 587 --skip-verify --active`
    - `update-smtp`:
      - 選項：
        - `--id`: 要更新的源的 ID。必需。
        - 其他選項與 `add-smtp` 共享
      - 範例：
        - `gitea admin auth update-smtp --id 1 --host smtp.mydomain.org --port 587 --skip-verify=false`
        - `gitea admin auth update-smtp --id 1 --active=false`
    - `add-ldap`: 添加新的 LDAP（通過 Bind DN）身份驗證源
      - 選項：
        - `--name value`: 身份驗證名稱。必需。
        - `--not-active`: 停用身份驗證源。
        - `--security-protocol value`: 安全協議名稱。必需。
        - `--skip-tls-verify`: 禁用 TLS 驗證。
        - `--host value`: LDAP 伺服器的地址。必需。
        - `--port value`: 連接到 LDAP 伺服器時使用的端口。必需。
        - `--user-search-base value`: 將搜索使用者帳戶的 LDAP 基礎。必需。
        - `--user-filter value`: 聲明如何查找嘗試身份驗證的使用者記錄的 LDAP 過濾器。必需。
        - `--admin-filter value`: 指定使用者是否應被授予管理員權限的 LDAP 過濾器。
        - `--restricted-filter value`: 指定使用者是否應被授予受限狀態的 LDAP 過濾器。
        - `--username-attribute value`: 包含使用者名稱的使用者 LDAP 記錄的屬性。
        - `--firstname-attribute value`: 包含使用者名稱的使用者 LDAP 記錄的屬性。
        - `--surname-attribute value`: 包含使用者姓氏的使用者 LDAP 記錄的屬性。
        - `--email-attribute value`: 包含使用者電子電子郵件地址的使用者 LDAP 記錄的屬性。必需。
        - `--public-ssh-key-attribute value`: 包含使用者公鑰的使用者 LDAP 記錄的屬性。
        - `--avatar-attribute value`: 包含使用者頭像的使用者 LDAP 記錄的屬性。
        - `--bind-dn value`: 在搜索使用者時綁定到 LDAP 伺服器的 DN。
        - `--bind-password value`: 綁定 DN 的密碼（如果有）。注意：密碼使用伺服器上的 SECRET_KEY 加密儲存。仍然建議確保 Bind DN 具有盡可能少的權限。
        - `--attributes-in-bind`: 在綁定 DN 上下文中獲取屬性。
        - `--synchronize-users`: 啟用使用者同步。
        - `--page-size value`: 搜索頁面大小。
      - 範例：
        - `gitea admin auth add-ldap --name ldap --security-protocol unencrypted --host mydomain.org --port 389 --user-search-base "ou=Users,dc=mydomain,dc=org" --user-filter "(&(objectClass=posixAccount)(|(uid=%[1]s)(mail=%[1]s)))" --email-attribute mail`
    - `update-ldap`: 更新現有的 LDAP（通過 Bind DN）身份驗證源
      - 選項：
        - `--id value`: 身份驗證源的 ID。必需。
        - `--name value`: 身份驗證名稱。
        - `--not-active`: 停用身份驗證源。
        - `--security-protocol value`: 安全協議名稱。
        - `--skip-tls-verify`: 禁用 TLS 驗證。
        - `--host value`: LDAP 伺服器的地址。
        - `--port value`: 連接到 LDAP 伺服器時使用的端口。
        - `--user-search-base value`: 將搜索使用者帳戶的 LDAP 基礎。
        - `--user-filter value`: 聲明如何查找嘗試身份驗證的使用者記錄的 LDAP 過濾器。
        - `--admin-filter value`: 指定使用者是否應被授予管理員權限的 LDAP
