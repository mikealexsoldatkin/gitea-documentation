---
date: "2023-04-09T11:00:00+02:00"
slug: "https-setup"
sidebar_position: 12

---

# HTTPS設定

## 使用內置伺服器

在啟用HTTPS之前，確保您擁有有效的SSL/TLS證書。
建議在測試和評估情況下使用自簽名證書，請運行 `gitea cert --host [HOST]` 以生成自簽名證書

如果您在伺服器上使用阿帕奇（Apache）或Nginx，建議參考 [反向代理指南](reverse-proxies.md)。

要使用Gitea內置HTTPS支援，您必須編輯`app.ini`文件。

```ini
[server]
PROTOCOL  = https
ROOT_URL  = https://git.example.com:3000/
HTTP_PORT = 3000
CERT_FILE = cert.pem
KEY_FILE  = key.pem
```

請注意，如果您的證書由第三方證書頒發機構簽名（即不是自簽名的），則 cert.pem 應包含證書鏈。伺服器證書必須是 cert.pem 中的第一個條目，後跟中介（如果有）。不必包含根證書，因為連接客戶端必須已經擁有根證書才能建立信任關係。要了解有關設定值的更多資訊，請查看 [設定備忘單](../administration/config-cheat-sheet.md)。

對於“CERT_FILE”或“KEY_FILE”欄位，當文件路徑是相對路徑時，文件路徑相對於“GITEA_CUSTOM”環境變量。它也可以是絕對路徑。

### 設定HTTP重定向

Gitea伺服器僅支援監聽一個端口；要重定向HTTP請求致HTTPS端口，您需要啟用HTTP重定向服務：

```ini
[server]
REDIRECT_OTHER_PORT = true
; Port the redirection service should listen on
PORT_TO_REDIRECT = 3080
```

如果您使用Docker，確保端口已設定在 `docker-compose.yml` 文件

## 使用 ACME (預設: Let's Encrypt)

[ACME](https://tools.ietf.org/html/rfc8555) 是一種證書頒發機構標準協議，允許您自動請求和續訂 SSL/TLS 證書。[Let`s Encrypt](https://letsencrypt.org/) 是使用此標準的免費公開信任的證書頒發機構伺服器。僅實施“HTTP-01”和“TLS-ALPN-01”挑戰。為了使 ACME 質詢通過並驗證您的域所有權，“80”端口（“HTTP-01”）或“443”端口（“TLS-ALPN-01”）上 gitea 域的外部流量必須由 gitea 實例提供服務。可能需要設定 [HTTP 重定向](#設定http重定向) 和端口轉發才能正確路由外部流量。否則，到端口“80”的正常流量將自動重定向到 HTTPS。**您必須同意**ACME提供商的服務條款（預設為Let's Encrypt的 [服務條款](https://letsencrypt.org/documents/LE-SA-v1.2-2017年11月15日.pdf)。

使用預設 Let's Encrypt 的最小設定如下：

```ini
[server]
PROTOCOL=https
DOMAIN=git.example.com
ENABLE_ACME=true
ACME_ACCEPTTOS=true
ACME_DIRECTORY=https
;; Email can be omitted here and provided manually at first run, after which it is cached
ACME_EMAIL=email@example.com
```

小型設定請使用 [smallstep CA](https://github.com/smallstep/certificates), 點擊 [教學](https://smallstep.com/docs/tutorials/acme-challenge) 瞭解更多資訊。

```ini
[server]
PROTOCOL=https
DOMAIN=git.example.com
ENABLE_ACME=true
ACME_ACCEPTTOS=true
ACME_URL=https://ca.example.com/acme/acme/directory
;; Can be omitted if using the system's trust is preferred
;ACME_CA_ROOT=/path/to/root_ca.crt
ACME_DIRECTORY=https
ACME_EMAIL=email@example.com
```

要了解關於設定, 請前往 [設定備忘單](../administration/config-cheat-sheet.md)獲取更多資訊

## 使用反向代理伺服器

按照 [reverse proxy guide](reverse-proxies.md) 的規則設定你的反向代理伺服器

然後，按照下面的嚮導啟用 HTTPS：

- [nginx](https://nginx.org/en/docs/http/configuring_https_servers.html)
- [apache2/httpd](https://httpd.apache.org/docs/2.4/ssl/ssl_howto.html)
- [caddy](https://caddyserver.com/docs/tls)

注意：僅在代理層啟用 HTTPS 被稱為 [TLS 終止代理](https://en.wikipedia.org/wiki/TLS_termination_proxy)。代理伺服器接受傳入的 TLS 連接，解密內容，然後將現在未加密的內容傳遞給 Gitea。只要代理和 Gitea 實例在同一臺計算機上或在私有網路中的不同計算機上（代理暴露給外部網路），這通常是可以接受的。如果您的 Gitea 實例與代理隔離在公共網路上，或者如果您想要全端到端的加密，您還可以直接在 Gitea 中 [啟用內置伺服器的 HTTPS 支援](#使用內置伺服器)，並將連接轉發到 HTTPS 上。
