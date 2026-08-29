---
date: "2019-10-15T10:10:00+05:00"
slug: "email-setup"
sidebar_position: 12
aliases:
  - /zh-tw/email-setup
---

# 電子郵件設定

Gitea 具有發送交易電子郵件（如註冊確認）的郵件功能。它可以設定為使用 Sendmail（或相容的 MTA，如 Postfix 和 msmtp）或直接使用 SMTP 伺服器。

## 使用 Sendmail

使用 `sendmail` 命令作為郵件程式。

:::note
要在官方 Gitea Docker 映像中使用，請設定為 SMTP 版本（請參閱以下部分）。
:::

:::note
對於面向互聯網的網站，請參閱您的 MTA 文件以獲取有關通過 TLS 發送電子郵件的說明。還設定 SPF、DMARC 和 DKIM DNS 記錄，以使發送的電子郵件被各種電子郵件提供商接受為合法。
:::

```ini title="app.ini"
[mailer]
ENABLED       = true
FROM          = gitea@mydomain.com
PROTOCOL      = sendmail
SENDMAIL_PATH = /usr/sbin/sendmail
SENDMAIL_ARGS = "--" ; 大多數 "sendmail" 程序接受選項，"--" 將防止電子郵件地址被解釋為選項。
```

## 使用 SMTP

直接使用 SMTP 伺服器作為中繼。此選項適用於您不想在實例上設定 MTA，但您在電子郵件提供商處有帳戶的情況。

```ini title="app.ini"
[mailer]
ENABLED        = true
FROM           = gitea@mydomain.com
PROTOCOL       = smtps
SMTP_ADDR      = mail.mydomain.com
SMTP_PORT      = 587
USER           = gitea@mydomain.com
PASSWD         = `password`
```

重新啟動 Gitea 以使設定更改生效。

要發送測試電子郵件以驗證設定，請轉到 Gitea > 站點管理 > 設定 > 摘要 -> 郵件設定。

有關完整的選項列表，請參閱 [設定備忘單](../administration/config-cheat-sheet.md)

:::note
僅當 SMTP 伺服器通信使用 TLS 加密或 `HOST=localhost` 時，才支援身份驗證。TLS 加密可以透過：
:::

- STARTTLS（也稱為機會性 TLS）通過端口 587。初始連接在明文上完成，但如果伺服器支援，則升級為 TLS。
- SMTPS 連接（SMTP over TLS）通過預設端口 465。從一開始就使用 TLS 連接到伺服器。
- 使用 `PROTOCOL=smtps` 強制 SMTPS 連接。（這些都稱為隱式 TLS。）
  這是由於 Go 內部庫對 STRIPTLS 攻擊的保護。

請注意，自 2018 年以來，[RFC8314](https://tools.ietf.org/html/rfc8314#section-3) 建議使用隱式 TLS。

### Gmail

以下設定應適用於 GMail 的 SMTP 伺服器：

```ini title="app.ini"
[mailer]
ENABLED        = true
HOST           = smtp.gmail.com:465 ; 對於 Gitea >= 1.18.0，刪除此行
SMTP_ADDR      = smtp.gmail.com
SMTP_PORT      = 465
FROM           = example.user@gmail.com
USER           = example.user
PASSWD         = `***`
PROTOCOL       = smtps
```

請注意，您需要通過在 Google 帳戶上啟用 2FA 來建立和使用 [應用程式密碼](https://support.google.com/accounts/answer/185833?hl=en)。您將無法直接使用您的 Google 帳戶密碼。

### ProtonMail

此功能目前僅適用於選定的 Proton for Business 客戶以及擁有自訂域地址的 Visionary 和 Family 計劃使用者。請參閱 [ProtonMail 的 SMTP 文件](https://proton.me/support/smtp-submission) 以獲取更多資訊。此限制可以透過使用 ProtonMail Bridge 應用程式來繞過。

請注意，使用 SMTP 發送的電子郵件不是 [端到端加密](https://proton.me/support/proton-mail-encryption-explained) 的。然而，它們仍然像 Proton Mail 收件箱中的其他電子郵件一樣儲存為零訪問加密。

以下設定應適用於 ProtonMail 的 SMTP 伺服器：

1. 在您的瀏覽器（或桌面應用程式）中，登入到您的 Proton Mail 帳戶，然後選擇 **設定 → 所有設定 → Proton Mail → IMAP/SMTP → SMTP 令牌**。
2. 單擊 **生成令牌**。
3. 輸入以下詳細資訊以建立新的 SMTP 令牌：
   - **令牌名稱**：選擇一個令牌名稱。這僅供您參考，不會影響令牌的功能。
   - **電子電子郵件地址**：選擇一個活動的自訂域地址與您的令牌配對。複製此電子電子郵件地址並將其用於 `app.ini` 中的 `FROM` 和 `USER` 設定。
4. 單擊 **生成**。
5. 輸入您的 Proton Mail 帳戶密碼。

您的 SMTP 使用者名稱和 SMTP 令牌（密碼）將生成。您現在可以將它們作為 `USER` 和 `PASSWD` 輸入到您的 `app.ini` 設定中。

```ini title="app.ini"
[mailer]
ENABLED        = true
FROM           = example.user@customdomain.tld
PROTOCOL       = smtp+starttls
SMTP_ADDR      = smtp.protonmail.ch
SMTP_PORT      = 587
USER           = example.user@customdomain.tld
PASSWD         = `TOKEN`
```

關閉彈出窗口後，出於安全原因，您將無法再次看到此 SMTP 令牌（密碼）。如果需要旋轉密碼，您可以隨時生成更多令牌。

注意：您的 Proton Mail 登入或郵箱密碼將無法與 SMTP 一起使用。
