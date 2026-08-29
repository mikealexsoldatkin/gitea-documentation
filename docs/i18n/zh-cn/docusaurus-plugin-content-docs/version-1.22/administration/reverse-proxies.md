---
date: "2018-05-22T11:00:00+00:00"

slug: "reverse-proxies"
sidebar_position: 16

aliases:
  - /zh-cn/reverse-proxies
---

# 反向代理

## 通用配置

1. 在您的 `app.ini` 文件中添加配置 `[server] ROOT_URL = https://git.example.com/`
2. 将 `https://git.example.com/foo` 反向代理到 `http://gitea:3000/foo`
3. 确保反向代理不会解码 URI。`https://git.example.com/a%2Fb`的请求应该被传递给 `http://gitea:3000/a%2Fb`。
4. 确保 `Host` 和 `X-Forwarded-Proto` 头被正确的传递给 Gitea，使 Gitea 可以看到正在访问的真实 URL。

## 使用子路径

通常，**不推荐**将 Gitea 放到子路径。人们很少使用此配置，并且在极少数情况下可能会出现一些问题。

为了让 Gitea 在子路径工作（例如：`https://common.example.com/gitea/`），需要在上面的通用配置之外进行一些额外的配置：

1. 在 `app.ini` 文件中使用配置 `[server] ROOT_URL = https://common.example.com/gitea/`。
2. 将 `https://common.example.com/gitea/foo` 反向代理到 `http://gitea:3000/foo`。
3. 容器映像注册表需要在根目录级别有一个固定的子路径 `v2`，您必须做下列配置：
   - 将 `https://common.example.com/v2` 反向代理到 `http://gitea:3000/v2`。
   - 确保 URI 和标头也被正确的传递（见上面的通用配置）

## 使用 Nginx 作为反向代理服务

如果您想使用 Nginx 作为 Gitea 的反向代理服务，您可以参照以下 `nginx.conf` 配置中 `server` 的 `http` 部分。

确保 `client_max_body_size` 足够大，否则在上传大文件时会出现 "client_max_body_size" 错误。

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

## 使用 Nginx 作为反向代理服务并将 Gitea 路由至一个子路径

如果您已经有一个域名并且想与 Gitea 共享该域名，您可以增加以下 `nginx.conf` 配置中 `server` 的 `http` 部分，为 Gitea 添加路由规则：

```nginx
server {
    ...
    location ~ ^/(gitea|v2)($|/) {
        client_max_body_size 512M;

        # 确保 nginx 使用未转义 URI， 按原样保持 "%2F"。 确保 nginx 去除 "/gitea" 子路径前缀， 按原样传递 "/v2"。
        rewrite ^ $request_uri;
        rewrite ^(/gitea)?(/.*) $2 break;
        proxy_pass http://127.0.0.1:3000$uri;

        # 其他的常规 HTTP 表头，见上面“使用 Nginx 作为反向代理服务”小节的配置
        proxy_set_header Connection $http_connection;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

然后您**必须**在 Gitea 的配置文件中正确的添加类似 `[server] ROOT_URL = http://git.example.com/git/` 的配置项。

## 使用 Nginx 直接提供静态资源

我们可以通过将资源分为静态和动态两种类型来调节性能。

CSS 文件、JavaScript 文件、图片和字体是静态内容。首页、仓库视图和工单列表是动态内容。

Nginx 可以直接提供静态资源，并且只代理动态资源请求给 Gitea。
Nginx 为提供静态内容进行了优化，而代理大响应可能与这一优化行为相反。
（见[https://serverfault.com/q/587386](https://serverfault.com/q/587386)）

将 Gitea 源代码仓库的一个快照下载到 `/path/to/gitea`。
在此之后，在本地仓库目录运行 `make frontend` 来生成静态资源。在这个情况下，我们只对 `public/` 目录感兴趣，您可以删除剩下的其他目录。
（为了生成静态资源，您需要安装一个[带 npm 的 Node ](https://nodejs.org/en/download/)和 `make`）

取决于您的用户量的大小，您可以将流量分离到两个不同的服务器，或者为静态资源配置一个 cdn。

### 单服务器节点，单域名

将 `[server] STATIC_URL_PREFIX = /_/static` 写入您的 Gitea 配置文件，并配置 nginx：

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

### 双服务器节点，双域名

将 `[server] STATIC_URL_PREFIX = http://cdn.example.com/gitea` 写入您的 Gitea 配置文件，并配置 nginx：

```nginx
# 运行 Gitea 的服务器
server {
    listen 80;
    server_name git.example.com;

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

```nginx
# 提供静态资源的服务器
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

## 使用 Apache HTTPD 作为反向代理服务

如果您想使用 Apache HTTPD 作为 Gitea 的反向代理服务，您可以为您的 Apache HTTPD 作如下配置（在 Ubuntu 中，配置文件通常在 `/etc/apache2/httpd.conf` 目录下）：

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

注：必须启用以下 Apache HTTPD 组件：`proxy`， `proxy_http`

## 使用 Apache HTTPD 作为反向代理服务并将 Gitea 路由至一个子路径

如果您已经有一个域名并且想与 Gitea 共享该域名，您可以增加以下配置为 Gitea 添加路由规则（在 Ubuntu 中，配置文件通常在 `/etc/apache2/httpd.conf` 目录下）：

```
<VirtualHost *:80>
    ...
    <Proxy *>
         Order allow,deny
         Allow from all
    </Proxy>
    AllowEncodedSlashes NoDecode
    # 注意: 路径和 URL 后面都不要写路径符号 '/'
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
    # 注意: 路径和 URL 后面都不要写路径符号 '/'
    ProxyPass /git http://localhost:3000 nocanon
    ProxyPreserveHost On
    RequestHeader set "X-Forwarded-Proto" expr=%{REQUEST_SCHEME}
</VirtualHost>
```

然后您**必须**在 Gitea 的配置文件中正确的添加类似 `[server] ROOT_URL = http://git.example.com/git/` 的配置项。

注：必须启用以下 Apache HTTPD 组件：`proxy`， `proxy_http`

## 使用 Caddy 作为反向代理服务

如果您想使用 Caddy 作为 Gitea 的反向代理服务，您可以在 `Caddyfile` 中添加如下配置：

```
git.example.com {
    reverse_proxy localhost:3000
}
```

## 使用 Caddy 作为反向代理服务并将 Gitea 路由至一个子路径

如果您已经有一个域名并且想与 Gitea 共享该域名，您可以在您的 `Caddyfile` 文件中增加以下配置，为 Gitea 添加路由规则：

```
git.example.com {
    route /git/* {
        uri strip_prefix /git
        reverse_proxy localhost:3000
    }
}
```

然后您**必须**在 Gitea 的配置文件中正确的添加类似 `[server] ROOT_URL = http://git.example.com/git/` 的配置项。

## 使用 IIS 作为反向代理服务

如果您想使用 IIS 作为 Gitea 的反向代理服务，你需要为 IIS 设置 URL 重写来作为反向代理。

1. 在 IIS 中设置一个空网页，比如命名为 `Gitea Proxy`。
2. 根据[微软社区中为 IIS 设置 URL 重写的指南](https://techcommunity.microsoft.com/t5/iis-support-blog/setup-iis-with-url-rewrite-as-a-reverse-proxy-for-real-world/ba-p/846222#M343)的前两步进行配置，也就是：

- 使用 Microsoft Web Platform Installer 5.1 (WebPI) 安装 Application Request Routing（简称 ARR），或者在 [IIS.net](https://www.iis.net/downloads/microsoft/application-request-routing) 下载这个插件。
- 一但这个模块被安装到 IIS 上，你将会在 IIS 管理控制台看到一个叫做 URL Rewrite 的新图标。
- 打开 IIS 管理控制台，在左边的列表中点击 `Gitea Proxy` 网页。在中间选中并且双击 URL Rewrite 的图标来加载 URL 重写的面板。
- 在管理控制台的右边选择 `Add Rule` 操作，并且在 `Inbound and Outbound Rules` 分类中选择 `Reverse Proxy Rule`。
- 在 Inbound Rules 中， 将 server name 设置为 Gitea 正在运行的主机以及对应端口。例如，如果你在 localhost 的 3000 端口上运行 Gitea，则设置为 `127.0.0.1:3000`。
- 启用 SSL Offloading
- 在 Outbound Rules 中，确保设置了 `Rewrite the domain names of the links in HTTP response`，并且将 `From:` 设置为上面的 server name，将 `To:` 设置为你的外部访问名称，例如：`git.example.com`
- 现在，根据下面的内容为您的网页编辑 `web.config`（将 `127.0.0.1:3000` 和 `git.example.com` 改为适当的值）

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

## 使用 HAProxy 作为反向代理服务

如果您想使用 HAProxy 作为 Gitea 的反向代理服务，您可以将下面的内容加入您的 HAProxy 配置。

在 frontend 部分加入一个 acl 来将对 gitea.example.com 的请求重定向到正确的后端。

```
frontend http-in
    ...
    acl acl_gitea hdr(host) -i gitea.example.com
    use_backend gitea if acl_gitea
    ...
```

添加之前定义好的 backend 部分

```
backend gitea
    server localhost:3000 check
```

如果您将 http 内容重定向到 https，上面的配置文件也能够使用。只需要记住，在 HAProxy 和 Gitea 之间的连接将由 http 完成，所以你不需要在 Gitea 的配置文件中启用 https。

## 使用 HAProxy 作为反向代理服务并将 Gitea 路由至一个子路径

如果您已经有一个域名并且想与 Gitea 共享该域名，您可以在您的 HAProxy 中加入如下配置，为 Gitea 添加路由规则：

```
frontend http-in
    ...
    acl acl_gitea path_beg /gitea
    use_backend gitea if acl_gitea
    ...
```

在这个配置下，http://example.com/gitea/ 将被重定向到您的 Gitea 实例。

接下来，对于 backend 部分：

```
backend gitea
    http-request replace-path /gitea\/?(.*) \/\1
    server localhost:3000 check
```

添加的 http-request 在需要的时候会自动加入反斜杠/，并且通过将 http://example.com/gitea 正确设置为根来在内部路径中删除 /gitea，使其能够正常工作。

然后您**必须**在 Gitea 的配置文件中正确的添加类似 `[server] ROOT_URL = http://example.com/gitea/` 的配置项。

## 使用 Traefik 作为反向代理服务

如果您想使用 traefik 作为 Gitea 的反向代理服务，您可以在 `docker-compose.yaml` 中添加 label 部分（假设使用 docker 作为 traefik 的 provider）：

```yaml
gitea:
  image: docker.io/gitea/gitea
  ...
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.gitea.rule=Host(`example.com`)"
    - "traefik.http.services.gitea-websecure.loadbalancer.server.port=3000"
```

这份配置假设您使用 traefik 来处理 HTTPS 服务，并在其和 Gitea 之间使用 HTTP 进行通信。

## 使用 Traefik 作为反向代理服务并将 Gitea 路由至一个子路径

如果您已经有一个域名并且想与 Gitea 共享该域名，您可以在您的 `docker-compose.yaml` 文件中增加以下配置，为 Gitea 添加路由规则（假设使用 docker 作为 traefik 的 provider）：

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

这份配置假设您使用 traefik 来处理 HTTPS 服务，并在其和 Gitea 之间使用 HTTP 进行通信。

然后您**必须**在 Gitea 的配置文件中正确的添加类似 `[server] ROOT_URL = http://example.com/gitea/` 的配置项。
