---
date: "2018-05-22T11:00:00+00:00"
slug: "reverse-proxies"
sidebar_position: 16
aliases:
  - /zh-tw/reverse-proxies
---

# 反向代理

## 一般設定

1. 在您的 `app.ini` 文件中設定 `[server] ROOT_URL = https://git.example.com/`。
2. 使反向代理將 `https://git.example.com/foo` 傳遞到 `http://gitea:3000/foo`。
3. 確保反向代理不解碼 URI。請求 `https://git.example.com/a%2Fb` 應傳遞為 `http://gitea:3000/a%2Fb`。
4. 確保 `Host` 和 `X-Forwarded-Proto` 標頭正確傳遞給 Gitea，以使 Gitea 看到實際訪問的 URL。

### 使用子路徑

通常**不建議**將 Gitea 放在子路徑中，這不常用，並且在某些罕見情況下可能會有一些問題。

要使 Gitea 與子路徑（例如：`https://common.example.com/gitea/`）一起工作，
除了上述的一般設定外，還有一些額外要求：

1. 在您的 `app.ini` 文件中使用 `[server] ROOT_URL = https://common.example.com/gitea/`。
2. 使反向代理將 `https://common.example.com/gitea/foo` 傳遞到 `http://gitea:3000/foo`。
3. 容器註冊表需要在根級別設定固定子路徑 `/v2`：
   - 使反向代理將 `https://common.example.com/v2` 傳遞到 `http://gitea:3000/v2`。
   - 確保 URI 和標頭也正確傳遞（請參閱上述的一般設定）。

## Nginx

如果您希望 Nginx 服務您的 Gitea 實例，請將以下 `server` 部分添加到 `nginx.conf` 的 `http` 部分中。

確保 `client_max_body_size` 足夠大，否則在上傳大文件時會出現“413 Request Entity Too Large”錯誤。

```nginx
server {
    ...
    location / {
        client_max_body_size 512M;
        proxy_pass http://localhost:3000;
        proxy_set_header Connection $http_connection;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Nginx 與子路徑

如果您已經有一個站點，並且希望 Gitea 共享域名，
您可以透過將以下 `server` 部分添加到 `nginx.conf` 的 `http` 部分中來設定 Nginx 以在子路徑下服務 Gitea：

```nginx
server {
    ...
    location ~ ^/(gitea|v2)($|/) {
        client_max_body_size 512M;

        # 使 nginx 使用未轉義的 URI，保持“%2F”不變，刪除“/gitea”子路徑前綴，保持“/v2”不變。
        rewrite ^ $request_uri;
        rewrite ^/(gitea($|/))?(.*) /$3 break;
        proxy_pass http://127.0.0.1:3000$uri;

        # 其他常見的 HTTP 標頭，請參閱上面的“Nginx”配置部分
        proxy_set_header Connection $http_connection;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

然後您**必須**在設定中正確設定 `[server] ROOT_URL = http://git.example.com/gitea/`。

## Nginx 和直接服務靜態資源

我們可以透過將請求分為靜態和動態來調整性能。

CSS 文件、JavaScript 文件、圖像和網頁字體是靜態內容。
首頁、儲存庫視圖或問題列表是動態內容。

Nginx 可以直接服務靜態資源，僅代理動態請求到 Gitea。
Nginx 對於服務靜態內容進行了優化，而代理大響應可能正好相反
（請參閱 [https://serverfault.com/q/587386](https://serverfault.com/q/587386)）。

將 Gitea 源儲存庫的快照下載到 `/path/to/gitea/`。
之後，在儲存庫目錄中運行 `make frontend` 以生成靜態資源。我們只對此任務的 `public/` 目錄感興趣，因此您可以刪除其餘部分。
（您需要安裝 [Node with npm](https://nodejs.org/en/download/) 和 `make` 來生成靜態資源）

根據您的使用者基數規模，您可能希望將流量分為兩個不同的伺服器，
或使用 cdn 來儲存靜態文件。

### 單節點和單域

在您的設定中設定 `[server] STATIC_URL_PREFIX = /_/static`。

```nginx
server {
    listen 80;
    server_name git.example.com;

    location /_/static/assets/ {
        alias /path/to/gitea/public/;
    }

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

### 兩個節點和兩個域

在您的設定中設定 `[server] STATIC_URL_PREFIX = http://cdn.example.com/gitea`。

```nginx
# 運行 Gitea 的應用服務器
server {
    listen 80;
    server_name git.example.com;

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

```nginx
# 靜態內容交付服務器
server {
    listen 80;
    server_name cdn.example.com;

    location /gitea/ {
        alias /path/to/gitea/public/;
    }

    location / {
        return 404;
    }
}
```

## Apache HTTPD

如果您希望 Apache HTTPD 服務您的 Gitea 實例，您可以將以下內容添加到您的 Apache HTTPD 設定中（通常位於 Ubuntu 的 `/etc/apache2/httpd.conf`）：

```apacheconf
<VirtualHost *:80>
    ...
    ProxyPreserveHost On
    ProxyRequests off
    AllowEncodedSlashes NoDecode
    ProxyPass / http://localhost:3000/ nocanon
    RequestHeader set "X-Forwarded-Proto" expr=%{REQUEST_SCHEME}
</VirtualHost>
```

:::note
必須啟用以下 Apache HTTPD 模組：`proxy`、`proxy_http`。
:::

如果您希望使用 Let's Encrypt 進行 webroot 驗證，請在 `ProxyPass` 之前添加 `ProxyPass /.well-known !` 行，以禁用將這些請求代理到 Gitea。

## Apache HTTPD 與子路徑

如果您已經有一個站點，並且希望 Gitea 共享域名，您可以透過將以下內容添加到您的 Apache HTTPD 設定中（通常位於 Ubuntu 的 `/etc/apache2/httpd.conf`）來設定 Apache HTTPD 以在子路徑下服務 Gitea：

```apacheconf
<VirtualHost *:80>
    ...
    <Proxy *>
         Order allow,deny
         Allow from all
    </Proxy>
    AllowEncodedSlashes NoDecode
    # 注意：在 /git 或端口之後沒有尾隨斜槓
    ProxyPass /git http://localhost:3000 nocanon
    ProxyPreserveHost On
    RequestHeader set "X-Forwarded-Proto" expr=%{REQUEST_SCHEME}
</VirtualHost>
```

然後您**必須**在設定中正確設定 `[server] ROOT_URL = http://git.example.com/git/`。

:::note
必須啟用以下 Apache HTTPD 模組：`proxy`、`proxy_http`。
:::

## Caddy

如果您希望 Caddy 服務您的 Gitea 實例，您可以將以下伺服器塊添加到您的 Caddyfile 中：

```
git.example.com {
    reverse_proxy localhost:3000
}
```

## Caddy 與子路徑

如果您已經有一個站點，並且希望 Gitea 共享域名，您可以透過將以下內容添加到您的 Caddyfile 中的伺服器塊來設定 Caddy 以在子路徑下服務 Gitea：

```
git.example.com {
    route /git/* {
        uri strip_prefix /git
        reverse_proxy localhost:3000
    }
}
```

然後在您的設定中設定 `[server] ROOT_URL = http://git.example.com/git/`。

## IIS

如果您希望使用 IIS 運行 Gitea。您需要設定 IIS 並使用 URL Rewrite 作為反向代理。

1. 在 IIS 中設定一個空網站，命名為 `Gitea Proxy`。
2. 按照 [Microsoft 的技術社區指南設定 IIS 並使用 URL Rewrite](https://techcommunity.microsoft.com/t5/iis-support-blog/setup-iis-with-url-rewrite-as-a-reverse-proxy-for-real-world/ba-p/846222#M343) 中的前兩步操作。即：

- 使用 Microsoft Web Platform Installer 5.1（WebPI）安裝應用程式請求路由（簡稱 ARR），或從 [IIS.net](https://www.iis.net/downloads/microsoft/application-request-routing) 下載擴展。
- 安裝模組後，您將在 IIS 管理控制檯中看到一個名為 URL Rewrite 的新圖標。
- 打開 IIS 管理控制檯，從左側樹視圖中單擊 `Gitea Proxy` 網站。從中間窗格中選擇並雙擊 URL Rewrite 圖標以加載 URL Rewrite 介面。
- 從管理控制檯的右側窗格中選擇 `Add Rule` 操作，並從 `Inbound and Outbound Rules` 類別中選擇 `Reverse Proxy Rule`。
- 在 Inbound Rules 部分中，將伺服器名稱設定為運行 Gitea 的主機及其端口。例如，如果您在本地主機上運行 Gitea，端口為 3000，則以下應該可以工作：`127.0.0.1:3000`
- 啟用 SSL 卸載
- 在 Outbound Rules 中，確保設定 `Rewrite the domain names of the links in HTTP response`，並將 `From:` 欄位設定為上述內容，將 `To:` 設定為您的外部主機名，例如：`git.example.com`
- 現在編輯您的網站的 `web.config` 以匹配以下內容：（根據需要更改 `127.0.0.1:3000` 和 `git.example.com`）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.web>
        <httpRuntime requestPathInvalidCharacters="" />
    </system.web>
    <system.webServer>
        <security>
          <requestFiltering>
            <hiddenSegments>
              <clear />
            </hiddenSegments>
            <denyUrlSequences>
              <clear />
            </denyUrlSequences>
            <fileExtensions allowUnlisted="true">
              <clear />
            </fileExtensions>
          </requestFiltering>
        </security>
        <rewrite>
            <rules useOriginalURLEncoding="false">
                <rule name="ReverseProxyInboundRule1" stopProcessing="true">
                    <match url="(.*)" />
                    <action type="Rewrite" url="http://127.0.0.1:3000{UNENCODED_URL}" />
                    <serverVariables>
                        <set name="HTTP_X_ORIGINAL_ACCEPT_ENCODING" value="HTTP_ACCEPT_ENCODING" />
                        <set name="HTTP_ACCEPT_ENCODING" value="" />
                    </serverVariables>
                </rule>
            </rules>
            <outboundRules>
                <rule name="ReverseProxyOutboundRule1" preCondition="ResponseIsHtml1">
                    <!-- 在此處正確設置模式 - 如果您只想接受 http 或 https -->
                    <!-- 根據需要更改模式和操作值 -->
                    <match filterByTags="A, Form, Img" pattern="^http(s)?://127.0.0.1:3000/(.*)" />
                    <action type="Rewrite" value="http{R:1}://git.example.com/{R:2}" />
                </rule>
                <rule name="RestoreAcceptEncoding" preCondition="NeedsRestoringAcceptEncoding">
                    <match serverVariable="HTTP_ACCEPT_ENCODING" pattern="^(.*)" />
                    <action type="Rewrite" value="{HTTP_X_ORIGINAL_ACCEPT_ENCODING}" />
                </rule>
                <preConditions>
                    <preCondition name="ResponseIsHtml1">
                        <add input="{RESPONSE_CONTENT_TYPE}" pattern="^text/html" />
                    </preCondition>
                    <preCondition name="NeedsRestoringAcceptEncoding">
                        <add input="{HTTP_X_ORIGINAL_ACCEPT_ENCODING}" pattern=".+" />
                    </preCondition>
                </preConditions>
            </outboundRules>
        </rewrite>
        <urlCompression doDynamicCompression="true" />
        <handlers>
          <clear />
          <add name="StaticFile" path="*" verb="*" modules="StaticFileModule,DefaultDocumentModule,DirectoryListingModule" resourceType="Either" requireAccess="Read" />
        </handlers>
        <!-- 將所有擴展名映射到相同的 MIME 類型，以便可以下載所有文件。 -->
        <staticContent>
          <clear />
          <mimeMap fileExtension="*" mimeType="application/octet-stream" />
        </staticContent>
    </system.webServer>
</configuration>
```

## HAProxy

如果您希望 HAProxy 服務您的 Gitea 實例，您可以將以下內容添加到您的 HAProxy 設定中

在前端部分添加一個 acl 以將調用重定向到 gitea.example.com 到正確的後端

```
frontend http-in
    ...
    acl acl_gitea hdr(host) -i gitea.example.com
    use_backend gitea if acl_gitea
    ...
```

添加先前定義的後端部分

```
backend gitea
    server localhost:3000 check
```

如果您將 http 內容重定向到 https，設定方式相同，只需記住 HAProxy 和 Gitea 之間的連接將通過 http 完成，因此您不必在 Gitea 的設定中啟用 https。

## HAProxy 與子路徑

如果您已經有一個站點，並且希望 Gitea 共享域名，您可以透過將以下內容添加到您的 HAProxy 設定中來設定 HAProxy 以在子路徑下服務 Gitea：

```
frontend http-in
    ...
    acl acl_gitea path_beg /gitea
    use_backend gitea if acl_gitea
    ...
```

使用該設定 http://example.com/gitea/ 將重定向到您的 Gitea 實例。

然後為後端部分

```
backend gitea
    http-request replace-path /gitea\/?(.*) \/\1
    server localhost:3000 check
```

添加的 http-request 將自動添加尾隨斜槓（如果需要），並在內部刪除 /gitea 從路徑中刪除，以便通過正確設定 http://example.com/gitea 作為根來使其與 Gitea 正確工作。

然後您**必須**在設定中正確設定 `[server] ROOT_URL = http://example.com/gitea/`。

## Traefik

如果您希望 traefik 服務您的 Gitea 實例，您可以將以下標籤部分添加到您的 `docker-compose.yaml`（假設提供者是 docker）。

```yaml
gitea:
  image: docker.io/gitea/gitea
  ...
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.gitea.rule=Host(`example.com`)"
    - "traefik.http.services.gitea-websecure.loadbalancer.server.port=3000"
```

此設定假設您在 traefik 端處理 HTTPS，並在 Gitea 和 traefik 之間使用 HTTP。

## Traefik 與子路徑

如果您已經有一個站點，並且希望 Gitea 共享域名，您可以透過將以下內容添加到您的 `docker-compose.yaml`（假設提供者是 docker）來設定 Traefik 以在子路徑下服務 Gitea：

```yaml
gitea:
  image: docker.io/gitea/gitea
  ...
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.gitea.rule=Host(`example.com`) && PathPrefix(`/gitea`)"
    - "traefik.http.services.gitea-websecure.loadbalancer.server.port=3000"
    - "traefik.http.middlewares.gitea-stripprefix.stripprefix.prefixes=/gitea"
    - "traefik.http.routers.gitea.middlewares=gitea-stripprefix"
```

此設定假設您在 traefik
