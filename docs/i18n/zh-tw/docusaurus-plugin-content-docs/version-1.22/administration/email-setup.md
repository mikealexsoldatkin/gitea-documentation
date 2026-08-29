---
date: "2023-05-23T09:00:00+08:00"

slug: "email-setup"
sidebar_position: 12

aliases:
  - /zh-tw/email-setup
---

# Email 設定

Gitea 具有郵件功能，用於發送事務性郵件（例如註冊確認郵件）。它可以設定為使用 Sendmail（或相容的 MTA，例如 Postfix 和 msmtp）或直接使用 SMTP 伺服器。

## 使用 Sendmail

使用 `sendmail` 命令作為郵件傳輸代理（mailer）。

注意：對於在官方 Gitea Docker 鏡像中使用，請使用 SMTP 版本進行設定（請參考下一節）。

注意：對於面向互聯網的網站，請查閱您的 MTA 文件以瞭解通過 TLS 發送郵件的說明。同時設定 SPF、DMARC 和 DKIM DNS 記錄，以使發送的郵件被各個電子郵件提供商接受為合法郵件。

```ini title="app.ini"
[mailer]
ENABLED       = true
FROM          = gitea@mydomain.com
PROTOCOL   = sendmail
SENDMAIL_PATH = /usr/sbin/sendmail
SENDMAIL_ARGS = "--" ; 大多數 "sendmail" 程序都接受選項，使用 "--" 將防止電子郵件地址被解釋為選項。
```

## 使用 SMTP

直接使用 SMTP 伺服器作為中繼。如果您不想在實例上設定 MTA，但在電子郵件提供商那裡有一個帳戶，這個選項非常有用。

```ini title="app.ini"
[mailer]
ENABLED        = true
FROM           = gitea@mydomain.com
PROTOCOL    = smtps
SMTP_ADDR      = mail.mydomain.com
SMTP_PORT      = 587
USER           = gitea@mydomain.com
PASSWD         = `password`
```

重啟 Gitea 以使設定更改生效。

要發送測試郵件以驗證設定，請轉到 Gitea > 站點管理 > 設定 > SMTP 郵件設定。

有關所有選項的完整列表，請查看[設定速查表](../administration/config-cheat-sheet.md)。

請注意：只有在使用 TLS 或 `HOST=localhost` 加密 SMTP 伺服器通信時才支援身份驗證。TLS 加密可以透過以下方式進行：

- 通過端口 587 的 STARTTLS（也稱為 Opportunistic TLS）。初始連接是明文的，但如果伺服器支援，則可以升級為 TLS。
- 通過預設端口 465 的 SMTPS 連接。連接到伺服器從一開始就使用 TLS。
- 使用 `PROTOCOL=smtps` 進行強制的 SMTPS 連接。（這兩種方式都被稱為 Implicit TLS）
  這是由於 Go 內部庫對 STRIPTLS 攻擊的保護機制。

請注意，自 2018 年起，[RFC8314](https://tools.ietf.org/html/rfc8314#section-3) 推薦使用 Implicit TLS。

### Gmail

以下設定應該適用於 Gmail 的 SMTP 伺服器：

```ini title="app.ini"
[mailer]
ENABLED        = true
HOST           = smtp.gmail.com:465 ; 對於 Gitea >= 1.18.0，刪除此行
SMTP_ADDR      = smtp.gmail.com
SMTP_PORT      = 465
FROM           = example.user@gmail.com
USER           = example.user
PASSWD         = `***`
PROTOCOL    = smtps
```

請注意，您需要建立並使用一個 [應用密碼](https://support.google.com/accounts/answer/185833?hl=en) 並在您的 Google 帳戶上啟用 2FA。您將無法直接使用您的 Google 帳戶密碼。
