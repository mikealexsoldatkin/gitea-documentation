---
date: "2018-05-22T11:00:00+00:00"

slug: "reverse-proxies"
sidebar_position: 16

aliases:
  - /zh-tw/reverse-proxies
---

# 反向代理

## 通用設定

1. 在您的 `app.ini` 文件中添加設定 `[server] ROOT_URL = https://git.example.com/`
2. 將 `https://git.example.com/foo` 反向代理到 `http://gitea:3000/foo`
3. 確保反向代理不會解碼 URI。`https://git.example.com/a%2Fb`的請求應該被傳遞給 `http://gitea:3000/a%2Fb`。
4. 確保 `Host` 和 `X-Forwarded-Proto` 頭被正確的傳遞給 Gitea，使 Gitea 可以看到正在訪問的真實 URL。

## 使用子路徑

通常，**不推薦**將 Gitea 放到子路徑。人們很少使用此設定，並且在極少數情況下可能會出現一些問題。

為了讓 Gitea 在子路徑工作（例如：`https://common.example.com/gitea/`），需要在上面的通用設定之外進行一些額外的設定：

1. 在 `app.ini` 文件中使用設定 `[server] ROOT_URL = https://common.example.com/gitea/`。
2. 將 `https://common.example.com/gitea/foo` 反向代理到 `http://gitea:3000/foo`。
3. 容器映像註冊表需要在根目錄級別有一個固定的子路徑 `v2`，您必須做下列設定：
   - 將 `https://common.example.com/v2` 反向代理到 `http://gitea:3000/v2`。
   - 確保 URI 和標頭也被正確的傳遞（見上面的通用設定）

## 使用 Nginx 作為反向代理服務

如果您想使用 Nginx 作為 Gitea 的反向代理服務，您可以參照以下 `nginx.conf` 設定中 `server` 的 `http` 部分。

確保 `client_max_body_size` 足夠大，否則在上傳大文件時會出現 "client_max_body_size" 錯誤。

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

## 使用 Nginx 作為反向代理服務並將 Gitea 路由至一個子路徑

如果您已經有一個域名並且想與 Gitea 共享該域名，您可以增加以下 `nginx.conf` 設定中 `server` 的 `http` 部分，為 Gitea 添加路由規則：

```nginx
server {
    ...
    location ~ ^/(gitea|v2)($|/) {
        client_max_body_size 512M;

        # 確保 nginx 使用未轉義 URI， 按原樣保持 "%2F"。 確保 nginx 去除 "/gitea" 子路徑前綴， 按原樣傳遞 "/v2"。
        rewrite ^ $request_uri;
        rewrite ^(/gitea)?(/.*) $2 break;
        proxy_pass http://127.0.0.1:3000$uri;

        # 其他的常規 HTTP 表頭，見上面“使用 Nginx 作為反向代理服務”小節的配置
        proxy_set_header Connection $http_connection;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

然後您**必須**在 Gitea 的設定文件中正確的添加類似 `[server] ROOT_URL = http://git.example.com/git/` 的設定項。

## 使用 Nginx 直接提供靜態資源

我們可以透過將資源分為靜態和動態兩種類型來調節性能。

CSS 文件、JavaScript 文件、圖片和字體是靜態內容。首頁、儲存庫視圖和工單列表是動態內容。

Nginx 可以直接提供靜態資源，並且只代理動態資源請求給 Gitea。
Nginx 為提供靜態內容進行了優化，而代理大響應可能與這一優化行為相反。
（見[https://serverfault.com/q/587386](https://serverfault.com/q/587386)）

將 Gitea 源程式碼儲存庫的一個快照下載到 `/path/to/gitea`。
在此之後，在本地儲存庫目錄運行 `make frontend` 來生成靜態資源。在這個情況下，我們只對 `public/` 目錄感興趣，您可以刪除剩下的其他目錄。
（為了生成靜態資源，您需要安裝一個[帶 npm 的 Node ](https://nodejs.org/en/download/)和 `make`）

取決於您的使用者量的大小，您可以將流量分離到兩個不同的伺服器，或者為靜態資源設定一個 cdn。

### 單伺服器節點，單域名

將 `[server] STATIC_URL_PREFIX = /_/static` 寫入您的 Gitea 設定文件，並設定 nginx：

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

### 雙伺服器節點，雙域名

將 `[server] STATIC_URL_PREFIX = http://cdn.example.com/gitea` 寫入您的 Gitea 設定文件，並設定 nginx：

```nginx
# 運行 Gitea 的服務器
server {
    listen 80;
    server_name git.example.com;

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

```nginx
# 提供靜態資源的服務器
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

## 使用 Apache HTTPD 作為反向代理服務

如果您想使用 Apache HTTPD 作為 Gitea 的反向代理服務，您可以為您的 Apache HTTPD 作如下設定（在 Ubuntu 中，設定文件通常在 `/etc/apache2/httpd.conf` 目錄下）：

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

注：必須啟用以下 Apache HTTPD 元件：`proxy`， `proxy_http`

## 使用 Apache HTTPD 作為反向代理服務並將 Gitea 路由至一個子路徑

如果您已經有一個域名並且想與 Gitea 共享該域名，您可以增加以下設定為 Gitea 添加路由規則（在 Ubuntu 中，設定文件通常在 `/etc/apache2/httpd.conf` 目錄下）：

```
<VirtualHost *:80>
    ...
    <Proxy *>
         Order allow,deny
         Allow from all
    </Proxy>
    AllowEncodedSlashes NoDecode
    # 注意: 路徑和 URL 後面都不要寫路徑符號 '/'
    ProxyPass /git http://localhost:3000 nocanon
</VirtualHost>
```

```apacheconf
<VirtualHost *:80>
    ...
    <Proxy *>
         Order allow,deny
         Allow from all
    </Proxy>
    AllowEncodedSlashes NoDecode
    # 注意: 路徑和 URL 後面都不要寫路徑符號 '/'
    ProxyPass /git http://localhost:3000 nocanon
    ProxyPreserveHost On
    RequestHeader set "X-Forwarded-Proto" expr=%{REQUEST_SCHEME}
</VirtualHost>
```

然後您**必須**在 Gitea 的設定文件中正確的添加類似 `[server] ROOT_URL = http://git.example.com/git/` 的設定項。

注：必須啟用以下 Apache HTTPD 元件：`proxy`， `proxy_http`

## 使用 Caddy 作為反向代理服務

如果您想使用 Caddy 作為 Gitea 的反向代理服務，您可以在 `Caddyfile` 中添加如下設定：

```
git.example.com {
    reverse_proxy localhost:3000
}
```

## 使用 Caddy 作為反向代理服務並將 Gitea 路由至一個子路徑

如果您已經有一個域名並且想與 Gitea 共享該域名，您可以在您的 `Caddyfile` 文件中增加以下設定，為 Gitea 添加路由規則：

```
git.example.com {
    route /git/* {
        uri strip_prefix /git
        reverse_proxy localhost:3000
    }
}
```

然後您**必須**在 Gitea 的設定文件中正確的添加類似 `[server] ROOT_URL = http://git.example.com/git/` 的設定項。

## 使用 IIS 作為反向代理服務

如果您想使用 IIS 作為 Gitea 的反向代理服務，你需要為 IIS 設定 URL 重寫來作為反向代理。

1. 在 IIS 中設定一個空網頁，比如命名為 `Gitea Proxy`。
2. 根據[微軟社區中為 IIS 設定 URL 重寫的指南](https://techcommunity.microsoft.com/t5/iis-support-blog/setup-iis-with-url-rewrite-as-a-reverse-proxy-for-real-world/ba-p/846222#M343)的前兩步進行設定，也就是：

- 使用 Microsoft Web Platform Installer 5.1 (WebPI) 安裝 Application Request Routing（簡稱 ARR），或者在 [IIS.net](https://www.iis.net/downloads/microsoft/application-request-routing) 下載這個外掛。
- 一但這個模組被安裝到 IIS 上，你將會在 IIS 管理控制檯看到一個叫做 URL Rewrite 的新圖標。
- 打開 IIS 管理控制檯，在左邊的列表中點擊 `Gitea Proxy` 網頁。在中間選中並且雙擊 URL Rewrite 的圖標來加載 URL 重寫的面板。
- 在管理控制檯的右邊選擇 `Add Rule` 操作，並且在 `Inbound and Outbound Rules` 分類中選擇 `Reverse Proxy Rule`。
- 在 Inbound Rules 中， 將 server name 設定為 Gitea 正在運行的主機以及對應端口。例如，如果你在 localhost 的 3000 端口上運行 Gitea，則設定為 `127.0.0.1:3000`。
- 啟用 SSL Offloading
- 在 Outbound Rules 中，確保設定了 `Rewrite the domain names of the links in HTTP response`，並且將 `From:` 設定為上面的 server name，將 `To:` 設定為你的外部訪問名稱，例如：`git.example.com`
- 現在，根據下面的內容為您的網頁編輯 `web.config`（將 `127.0.0.1:3000` 和 `git.example.com` 改為適當的值）

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
                    <!-- set the pattern correctly here - if you only want to accept http or https -->
                    <!-- change the pattern and the action value as appropriate -->
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
        <!-- Map all extensions to the same MIME type, so all files can be
               downloaded. -->
        <staticContent>
          <clear />
          <mimeMap fileExtension="*" mimeType="application/octet-stream" />
        </staticContent>
    </system.webServer>
</configuration>
```

## 使用 HAProxy 作為反向代理服務

如果您想使用 HAProxy 作為 Gitea 的反向代理服務，您可以將下面的內容加入您的 HAProxy 設定。

在 frontend 部分加入一個 acl 來將對 gitea.example.com 的請求重定向到正確的後端。

```
frontend http-in
    ...
    acl acl_gitea hdr(host) -i gitea.example.com
    use_backend gitea if acl_gitea
    ...
```

添加之前定義好的 backend 部分

```
backend gitea
    server localhost:3000 check
```

如果您將 http 內容重定向到 https，上面的設定文件也能夠使用。只需要記住，在 HAProxy 和 Gitea 之間的連接將由 http 完成，所以你不需要在 Gitea 的設定文件中啟用 https。

## 使用 HAProxy 作為反向代理服務並將 Gitea 路由至一個子路徑

如果您已經有一個域名並且想與 Gitea 共享該域名，您可以在您的 HAProxy 中加入如下設定，為 Gitea 添加路由規則：

```
frontend http-in
    ...
    acl acl_gitea path_beg /gitea
    use_backend gitea if acl_gitea
    ...
```

在這個設定下，http://example.com/gitea/ 將被重定向到您的 Gitea 實例。

接下來，對於 backend 部分：

```
backend gitea
    http-request replace-path /gitea\/?(.*) \/\1
    server localhost:3000 check
```

添加的 http-request 在需要的時候會自動加入反斜槓/，並且通過將 http://example.com/gitea 正確設定為根來在內部路徑中刪除 /gitea，使其能夠正常工作。

然後您**必須**在 Gitea 的設定文件中正確的添加類似 `[server] ROOT_URL = http://example.com/gitea/` 的設定項。

## 使用 Traefik 作為反向代理服務

如果您想使用 traefik 作為 Gitea 的反向代理服務，您可以在 `docker-compose.yaml` 中添加 label 部分（假設使用 docker 作為 traefik 的 provider）：

```yaml
gitea:
  image: docker.io/gitea/gitea
  ...
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.gitea.rule=Host(`example.com`)"
    - "traefik.http.services.gitea-websecure.loadbalancer.server.port=3000"
```

這份設定假設您使用 traefik 來處理 HTTPS 服務，並在其和 Gitea 之間使用 HTTP 進行通信。

## 使用 Traefik 作為反向代理服務並將 Gitea 路由至一個子路徑

如果您已經有一個域名並且想與 Gitea 共享該域名，您可以在您的 `docker-compose.yaml` 文件中增加以下設定，為 Gitea 添加路由規則（假設使用 docker 作為 traefik 的 provider）：

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

這份設定假設您使用 traefik 來處理 HTTPS 服務，並在其和 Gitea 之間使用 HTTP 進行通信。

然後您**必須**在 Gitea 的設定文件中正確的添加類似 `[server] ROOT_URL = http://example.com/gitea/` 的設定項。
