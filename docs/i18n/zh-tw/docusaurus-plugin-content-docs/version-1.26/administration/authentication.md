---
date: "2016-12-01T16:00:00+02:00"
slug: "authentication"
sidebar_position: 10
aliases:
  - /zh-tw/authentication
---

# 認證

## 輕量級目錄訪問協議（Lightweight Directory Access Protocol，LDAP）

透過 BindDN 的 LDAP 和簡單認證方式 LDAP 共享以下欄位:

- 認證名稱 **(必選)**

  - 分配給新授權方法的名稱。

- 主機名 **(必選)**

  - LDAP 服務的主機地址.
  - 例如:`mydomain.com`

- 端口號 **(必選)**

  - LDAP 服務的端口號.
  - 例如: LDAP `389`/ LDAPs `636`

- 安全協議 (可選)

  - 連接 LDAP 伺服器時是否使用 TLS 協議。

- 管理員過濾規則 (可選)

  - 一個 LDAP 過濾器，用於指定哪些使用者應該被賦予管理員特權。如果使用者帳戶符合過濾器條件，則該使用者將被授予管理員權限。
  - 範例:`(objectClass=adminAccount)`
  - 適用於 Microsoft Active Directory（AD）的範例:`memberOf=CN=admin-group,OU=example,DC=example,DC=org`

- 使用者名稱屬性（可選）

  - 使用者 LDAP 記錄中包含使用者名稱稱的屬性。在第一次成功登入後，將使用指定的屬性值作為新的 Gitea 帳號名稱。若留空，則使用登入表單上提供的使用者名稱。
  - 當提供的登入名與多個屬性匹配時，這一選項非常有用，但是隻有一個特定屬性應該用於 Gitea 帳號名稱，請參閱"使用者過濾器"。
  - 範例:uid
  - 適用於 Microsoft Active Directory（AD）的範例:`sAMAccountName`

- 名字屬性（可選）

  - 使用者 LDAP 記錄中包含使用者名稱字的屬性。將用於填充他們的帳號資訊。
  - 範例:givenName

- 姓氏屬性（可選）

  - 使用者 LDAP 記錄中包含使用者姓氏的屬性。將用於填充他們的帳號資訊。
  - 範例:`sn`

- 電子郵件屬性 **(必選)**
  - 使用者 LDAP 記錄中包含使用者電子電子郵件地址的屬性。將用於填充他們的帳號資訊。
  - 範例:`mail`

### LDAP(via BindDN)

需要額外設定以下欄位:

- 綁定 DN (可選)

  - 搜索使用者時綁定到 LDAP 伺服器的 DN。這可以留空以執行匿名搜索。
  - 範例: `cn=Search,dc=mydomain,dc=com`

- 綁定密碼 (可選)

  - 上述指定的 Bind DN（綁定區別名）的密碼，如果有的話。注意：該密碼在伺服器上使用 SECRET_KEY 進行加密儲存。仍然建議確保 Bind DN 具有儘可能少的權限。

- 使用者搜索基準 **(必選)**

  - 這是用於搜索使用者帳戶的 LDAP 基礎路徑.
  - 範例: `ou=Users,dc=mydomain,dc=com`

- 使用者過濾規則 **(必選)**
  - LDAP 過濾器聲明如何查找試圖進行身份驗證的使用者記錄
    `%[1]s`匹配參數將替換為登入表單中給出的登入名
  - 範例: `(&(objectClass=posixAccount)(|(uid=%[1]s)(mail=%[1]s)))`
  - 範例 for Microsoft Active Directory (AD): `(&(objectCategory=Person)(memberOf=CN=user-group,OU=example,DC=example,DC=org)(sAMAccountName=%s)(!(UserAccountControl:1.2.840.113556.1.4.803:=2)))`
  - 如需多次替換，應使用 `%[1]s`，例如在將提供的登入名與多個屬性（如使用者標識符、電子郵件甚至電話號碼）進行匹配時。
  - 範例: `(&(objectClass=Person)(|(uid=%[1]s)(mail=%[1]s)(mobile=%[1]s)))`
- 啟用使用者同步
  - 這個選項啟用了一個週期性任務，用於將 Gitea 使用者與 LDAP 伺服器進行同步。預設的同步週期是每 24 小時，
    但您可以在 app.ini 文件中進行更改。
    有關此部分的詳細說明，請參閱[sample
    app.ini](https://github.com/go-gitea/gitea/blob/main/custom/conf/app.example.ini)
    的*cron.sync_external_users* 部分的註釋。前面提到的*User Search Base*和*User Filter*
    設定將限制哪些使用者可以使用 Gitea 以及哪些使用者將被同步。
    在初始運行任務時，將根據給定的設定建立所有與 LDAP 匹配的使用者，因此在使用大型企業 LDAP 目錄時需要小心。

### LDAP(simple auth)

需要額外設定以下欄位:

- 使用者 DN **(必選)**

  - 用作使用者 DN 的模板。匹配參數 `%s` 將替換為登入表單中的登入名。
  - 範例: `cn=%s,ou=Users,dc=mydomain,dc=com`
  - 範例: `uid=%s,ou=Users,dc=mydomain,dc=com`

- 使用者搜索基準 (可選)

  - 使用者搜索基準聲明哪些使用者帳戶將被搜索.
  - 範例: `ou=Users,dc=mydomain,dc=com`

- 使用者過濾規則 **(必選)**
  - LDAP 過濾器聲明何時允許使用者登入
    `%[1]s`匹配參數將替換為登入表單中給出的登入名。
  - 範例: `(&(objectClass=posixAccount)(|(cn=%[1]s)(mail=%[1]s)))`
  - 範例: `(&(objectClass=posixAccount)(|(uid=%[1]s)(mail=%[1]s)))`

### 使用 LDAP 驗證分組成員

使用以下欄位:

- 群組搜索基礎 DN(可選)

  - 組使用的 LDAP DN。
  - 範例: `ou=group,dc=mydomain,dc=com`

- 組名過濾器 (可選)

  - LDAP 過濾器，聲明如何在上述 DN 中查找有效組。
  - 範例: `(|(cn=gitea_users)(cn=admins))`

- 組中的使用者屬性 (可選)

  - 組中列出了哪個使用者的 LDAP 屬性。
  - 範例: `uid`

- 使用者組屬性 (可選)
  - 哪個組的 LDAP 屬性包含一個高於使用者屬性名稱的數組。
  - 範例: `memberUid`

## 可插拔式認證模組(Pluggable Authentication Module,PAM)

這個過程啟用了 PAM（Pluggable Authentication Modules）認證。使用者仍然可以透過使用者管理手動添加到系統中。
PAM 提供了一種機制，通過對使用者進行 PAM 認證來自動將其添加到當前資料庫中。為了與普通的 Linux 密碼一起使用，
運行 Gitea 的使用者還必須具有對`/etc/shadow`的讀取權限，以便在使用公鑰登入時檢查帳號的有效性。

**注意**:如果使用者已將 SSH 公鑰添加到 Gitea 中，使用這些密鑰可能會繞過登入檢查系統。因此，
如果您希望禁用使用 PAM 進行身份驗證的使用者，應該在 Gitea 中手動禁用該帳號，使用內置的使用者管理功能。

1. 設定和安裝準備.
   - 建議您建立一個管理使用者.
   - 建議取消自動註冊.
1. 一旦資料庫已初始化完成，使用新建立的管理員帳號登入.
1. 導航至使用者設定（右上角的圖標），然後選擇
   `Site Administration` -> `Authentication Sources`, 並選擇
   `Add Authentication Source`.
1. 填寫欄位如下:
   - 認證類型:`PAM`。
   - 名稱:任何有效的值都可以，如果您願意，可以使用"System Authentication"。
   - PAM 服務名稱:從/etc/pam.d/目錄下選擇適用於所需認證的正確文件[^1]。
   - PAM 電子郵件域:使用者認證時要附加的電子郵件後綴。例如，如果登入系統期望一個名為 gituse 的使用者，
     並且將此欄位設定為 mail.com，那麼 Gitea 在驗證一個 GIT 實例的使用者時將期望 user emai 欄位為gituser@mail.com[^2]。

**Note**: PAM 支援通過[build-time flags](installation/from-source.md#build)添加,
而官方提供的二進制文件通常不會預設啟用此功能。PAM 需要確保系統上有必要的 libpam 動態庫，並且編譯器可以訪問必要的 PAM 開發頭文件。

[^1]:
    例如，在 Debian "Bullseye"上使用標準 Linux 登入，可以使用`common-session-noninteractive`。這個值對於其他版本的 Debian，
    包括 Ubuntu 和 Mint，可能也是有效的，請查閱您所使用發行版的文件以確認。

[^2]: **PAM 的必選項** 請注意:在上面的範例中，使用者將作為`gituser`而不是`gituser@mail.com`登入到 Gitea 的 Web 介面。

## 簡單郵件傳輸協議(Simple Mail Transfer Protocol,SMTP)

此選項允許 Gitea 以 Gitea 使用者身份登入 SMTP 主機。請設定以下欄位:

- 身份驗證名稱 **(必選)**

  - 分配給新授權方法的名稱

- SMTP 驗證類型 **(必選)**

  - 用於連接 SMTP 主機的驗證類型，plain 或 login

- 主機名 **(必選)**

  - SMTP 服務的主機地址
  - 例如:`smtp.mydomain.com`

- 端口號 **(必選)**

  - SMTP 服務的端口號
  - 例如: `587`

- 允許的域名

  - 如果使用公共 SMTP 主機或有多個域的 SMTP 主機，限制哪些域可以登入
    限制哪些域可以登入。
  - 範例: `gitea.com,mydomain.com,mydomain2.com`

- 強制使用 SMTPS
  - 預設情況下將使用 SMTPS 連接到端口 465.如果您希望將 smtp 用於其他端口，自行設定
  - 否則，如果伺服器提供' STARTTLS '擴展名，則將使用此擴展名
- 跳過 TLS 驗證
  - 禁用 TLS 驗證身份.
- 該認證源處於激活狀態
  - 啟用或禁用此身份驗證源

## FreeIPA

- 要使用 FreeIPA 憑據登入 Gitea，需要為 Gitea 建立一個綁定帳戶。
  建立一個綁定帳戶:
- 在 FreeIPA 伺服器上建立一個 gitea.ldif 文件，並將`dc=example,dc=com`替換為您的`dn`，然後提供一個適當安全的密碼。

  ```sh
  dn: uid=gitea,cn=sysaccounts,cn=etc,dc=example,dc=com
  changetype: add
  objectclass: account
  objectclass: simplesecurityobject
  uid: gitea
  userPassword: secure password
  passwordExpirationTime: 20380119031407Z
  nsIdleTimeout: 0
  ```

- 導入 LDIF 文件（如果需要，請將 localhost 更改為 IPA 伺服器）。系統會提示您輸入 Directory Manager 的密碼。:

  ```sh
  ldapmodify -h localhost -p 389 -x -D \
  "cn=Directory Manager" -W -f gitea.ldif
  ```

- 為`gitea_users`添加 IPA 組:

  ```sh
  ipa group-add --desc="Gitea Users" gitea_users
  ```

- **提示**:對於 IPA 憑證錯誤，運行' kinit admin '並提供域管理帳戶密碼.
- 以管理員身份登入 Gitea，點擊 Admin Panel 下的`Authentication`。然後單擊`Add New Source`並填寫詳細資訊，更改所有適當的地方。

## SPNEGO with SSPI (Kerberos/NTLM, for Windows only)

Gitea 支援通過 Windows 內置的安全支援提供程式介面（Security Support Provider Interface，SSPI）實現 SPNEGO 單點登入認證（由 RFC4559 定義的方案），用於伺服器的 Web 部分。SSPI 僅在 Windows 環境中工作，即當伺服器和客戶端都在 Windows 操作系統上運行時。

在激活 SSPI 單點登入認證（SSO）之前，您需要準備您的環境:

- 在 Active Directory 中建立一個單獨的使用者帳號，gitea.exe 進程將在該帳號下運行（例如，在 domain.local 域下建立一個名為 user 的帳號:
- 為運行 gitea.exe 的主機建立一個服務主體名稱（Service Principal Name，SPN），其類別為 HTTP:

  - 以特權域使用者（例如域管理員）的身份啟動“命令提示符”或“PowerShell”。
  - 運行下面的命令，將 host.domain.local 替換為 Web 應用程式將運行的伺服器的完全限定域名（FQDN），將 domain\user 替換為在前一步中建立的帳號名稱:

  ```sh
  setspn -A HTTP/host.domain.local domain\user
  ```

在遵循上述步驟之前，請確保您按照以下流程進行操作:

1. 用之前建立的使用者登入（如果已經登入，請先註銷）。
2. 確保在`custom/conf/app.ini`文件的`[server]`部分中，`ROOT_URL`設定為 Web 應用程式將運行的伺服器的完全限定域名（FQDN），與之前建立服務主體名稱時使用的一致（例如，`host.domain.local`）。
3. 啟動 Web 伺服器（運行 `gitea.exe web`）。
4. 在 `Site Administration -> Authentication Sources` 中添加一個 `SPNEGO with SSPI` 認證源，以啟用 SSPI 認證。
5. 在域中的客戶端計算機上，使用任何域使用者登入（與運行`gitea.exe`的伺服器不同）。
6. 如果您使用 Chrome 或 Edge 瀏覽器，請將 Web 應用程式的 URL 添加到“本地站點”（`Internet選項 -> 安全 -> 本地站點 -> 站點`）。
7. 啟動 Chrome 或 Edge 瀏覽器，導航到 Gitea 的 FQDN URL（例如，`http://host.domain.local:3000`）。
8. 在控制面板中點擊“Sign In”按鈕，然後選擇 SSPI，將會自動使用當前登入到計算機的使用者進行登入。
9. 如果無法正常工作，請確保:
   - 您不是在運行`gitea.exe`的同一臺伺服器上運行 Web 瀏覽器。應該在與伺服器不同的域加入計算機（客戶端）上運行 Web 瀏覽器。如果客戶端和伺服器都在同一臺計算機上運行，則 NTLM 將優先於 Kerberos。
   - 主機上只有一個`HTTP/...`的 SPN。
   - SPN 中只包含主機名，不包含端口號。
   - 將 Web 應用程式的 URL 添加到"本地站點"。
   - 伺服器和客戶端的時鐘差異不超過 5 分鐘（取決於組策略）。
   - 在 Internet Explorer 中啟用了"整合 Windows 身份驗證"（在"高級設定"下）。

遵循這些步驟，您應該能夠成功啟用和使用 SSPI 單點登入認證（SSO）。

## 反向代理認證

Gitea 支援通過讀取反向代理傳遞的 HTTP 頭中的登入名或者 email 地址來支援反向代理來認證。預設是不啟用的，你可以用以下設定啟用。

```ini
[service]
ENABLE_REVERSE_PROXY_AUTHENTICATION = true
```

預設的登入使用者名稱的 HTTP 頭是 `X-WEBAUTH-USER`，你可以透過修改 `REVERSE_PROXY_AUTHENTICATION_USER` 來變更它。如果使用者不存在，可以自動建立使用者，當然你需要修改 `ENABLE_REVERSE_PROXY_AUTO_REGISTRATION=true` 來啟用它。

預設的登入使用者 Email 的 HTTP 頭是 `X-WEBAUTH-EMAIL`，你可以透過修改 `REVERSE_PROXY_AUTHENTICATION_EMAIL` 來變更它。如果使用者不存在，可以自動建立使用者，當然你需要修改 `ENABLE_REVERSE_PROXY_AUTO_REGISTRATION=true` 來啟用它。你也可以透過修改 `ENABLE_REVERSE_PROXY_EMAIL` 來啟用或停用這個 HTTP 頭。

如果設定了 `ENABLE_REVERSE_PROXY_FULL_NAME=true`，則使用者的全名會從 `X-WEBAUTH-FULLNAME` 讀取，這樣在自動建立使用者時將使用這個欄位作為使用者全名，你也可以透過修改 `REVERSE_PROXY_AUTHENTICATION_FULL_NAME` 來變更 HTTP 頭。

你也可以透過修改 `REVERSE_PROXY_TRUSTED_PROXIES` 來設定反向代理的 IP 地址範圍，加強安全性，預設值是 `127.0.0.0/8,::1/128`。 通過 `REVERSE_PROXY_LIMIT`， 可以設定最多信任幾級反向代理。

你可以透過以下設定為 API 啟用此認證方法：

```ini
[service]
ENABLE_REVERSE_PROXY_AUTHENTICATION_API = true
```

:::note
當此方法用於 API 時，反向代理負責處理 CSRF 保護。
:::
