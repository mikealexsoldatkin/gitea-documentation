---
date: "2018-06-02T11:00:00+02:00"
slug: "https-setup"
sidebar_position: 12
aliases:
  - /zh-tw/https-setup
---

# HTTPS 設定

## 使用內置伺服器

在啟用 HTTPS 之前，請確保您擁有有效的 SSL/TLS 證書。
您可以使用自生成的證書進行評估和測試。請運行 `gitea cert --host [HOST]` 生成自簽名證書。

如果您在伺服器上使用 Apache 或 nginx，建議查看 [反向代理指南](./reverse-proxies.md)。

要使用 Gitea 的內置 HTTPS 支援，您必須更改 `app.ini` 文件：

```ini
[server]
PROTOCOL  = https
ROOT_URL  = https://git.example.com:3000/
HTTP_PORT = 3000
CERT_FILE = cert.pem
KEY_FILE  = key.pem
```

請注意，如果您的證書是由第三方證書機構簽署的（即不是自簽名的），則 cert.pem 應包含證書鏈。伺服器證書必須是 cert.pem 中的第一個條目，後面依次是中間證書（如果有）。根證書不必包含在內，因為連接的客戶端必須已經擁有它以建立信任關係。
要了解更多有關設定值的資訊，請查看 [設定備忘單](./config-cheat-sheet.md)。

對於 `CERT_FILE` 或 `KEY_FILE` 欄位，文件路徑在相對路徑時相對於 `GITEA_CUSTOM` 環境變量。它也可以是絕對路徑。

### 設定 HTTP 重定向

Gitea 伺服器只能監聽一個端口；要將 HTTP 請求重定向到 HTTPS 端口，您需要啟用 HTTP 重定向服務：

```ini
[server]
REDIRECT_OTHER_PORT = true
; 重定向服務應監聽的端口
PORT_TO_REDIRECT = 3080
```

如果您使用 Docker，請確保在 `docker-compose.yml` 文件中設定了此端口。

## 使用 ACME（預設：Let's Encrypt）

[ACME](https://tools.ietf.org/html/rfc8555) 是一個證書機構標準協議，允許您自動請求和更新 SSL/TLS 證書。[Let's Encrypt](https://letsencrypt.org/) 是一個使用此標準的免費公開信任的證書機構伺服器。僅實現了 `HTTP-01` 和 `TLS-ALPN-01` 挑戰。為了使 ACME 挑戰通過並驗證您的域所有權，必須由 gitea 實例服務外部流量到端口 `80`（`HTTP-01`）或端口 `443`（`TLS-ALPN-01`）。設定 [HTTP 重定向](#設定-http-重定向) 和端口轉發可能需要正確路由外部流量。否則，正常流量到端口 `80` 將自動重定向到 HTTPS。**您必須同意** ACME 提供商的服務條款（預設為 Let's Encrypt 的 [服務條款](https://letsencrypt.org/documents/LE-SA-v1.2-November-15-2017.pdf)）。

使用預設 Let's Encrypt 的最小設定：

```ini
[server]
PROTOCOL=https
DOMAIN=git.example.com
ENABLE_ACME=true
ACME_ACCEPTTOS=true
ACME_DIRECTORY=https
;; 電子郵件可以在此處省略，並在首次運行時手動提供，之後將被緩存
ACME_EMAIL=email@example.com
```

使用 [smallstep CA](https://github.com/smallstep/certificates) 的最小設定，請參閱 [他們的教學](https://smallstep.com/docs/tutorials/acme-challenge) 以獲取更多資訊。

```ini
[server]
PROTOCOL=https
DOMAIN=git.example.com
ENABLE_ACME=true
ACME_ACCEPTTOS=true
ACME_URL=https://ca.example.com/acme/acme/directory
;; 如果使用系統的信任，則可以省略
;ACME_CA_ROOT=/path/to/root_ca.crt
ACME_DIRECTORY=https
ACME_EMAIL=email@example.com
```

要了解更多有關設定值的資訊，請查看 [設定備忘單](./config-cheat-sheet.md)。

## 使用反向代理

按照 [反向代理指南](../administration/reverse-proxies.md) 設定您的反向代理。

之後，按照以下指南之一啟用 HTTPS：

- [nginx](https://nginx.org/en/docs/http/configuring_https_servers.html)
- [apache2/httpd](https://httpd.apache.org/docs/2.4/ssl/ssl_howto.html)
- [caddy](https://caddyserver.com/docs/tls)

:::note
僅在代理級別啟用 HTTPS 被稱為 [TLS 終止代理](https://en.wikipedia.org/wiki/TLS_termination_proxy)。代理伺服器接受傳入的 TLS 連接，解密內容，並將現在未加密的內容傳遞給 Gitea。只要代理和 Gitea 實例位於同一臺機器上，或者位於私有網路內的不同機器上（代理暴露於外部網路），這通常是可以的。如果您的 Gitea 實例與代理之間隔著公共網路，或者您希望完全端到端加密，您也可以 [使用內置伺服器直接在 Gitea 中啟用 HTTPS 支援](#使用內置伺服器) 並通過 HTTPS 轉發連接。
:::
