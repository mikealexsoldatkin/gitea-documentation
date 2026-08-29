---
date: "2018-06-24:00:00+02:00"
slug: "api-usage"
sidebar_position: 40
aliases:
  - /zh-tw/api-usage
---

# API 使用指南

## 開啟/設定 API 存取

通常情況下， `ENABLE_SWAGGER` 預設開啟並且參數 `MAX_RESPONSE_ITEMS` 預設為 50。您可以從 [Config Cheat Sheet](../administration/config-cheat-sheet.md) 中獲取更多設定相關資訊。

<a id="authentication"></a>
<a id="通過-api-認證"></a>
## 透過 API 認證

Gitea 支援以下幾種 API 認證方式：

- HTTP basic authentication 方式
- 透過指定 `token=...` URL 查詢參數方式
- 透過指定 `access_token=...` URL 查詢參數方式
- 透過指定 `Authorization: token ...` HTTP header 方式

以上提及的認證方法接受相同的 apiKey token 類型，您可以在編碼時透過查閱程式碼更好地理解這一點。
Gitea 調用解析查詢參數以及頭部資訊來獲取 token 的程式碼可以在 [modules/auth/auth.go](https://github.com/go-gitea/gitea/blob/6efdcaed86565c91a3dc77631372a9cc45a58e89/modules/auth/auth.go#L47) 中找到。

您可以透過您的 gitea Web 介面來建立 apiKey token：
`Settings | Applications | Generate New Token`.

### 關於 `Authorization:` header

由於一些歷史原因，Gitea 需要在 header 的 apiKey token 裡引入前綴 `token`，類似於如下形式：

```
Authorization: token 65eaa9c8ef52460d22a93307fe0aee76289dc675
```

以 `curl` 命令為例，它會以如下形式攜帶在請求中：

```
curl "http://localhost:4000/api/v1/repos/test1/test1/issues" \
    -H "accept: application/json" \
    -H "Authorization: token 65eaa9c8ef52460d22a93307fe0aee76289dc675" \
    -H "Content-Type: application/json" -d "{ \"body\": \"testing\", \"title\": \"test 20\"}" -i
```

正如上例所示，您也可以在 GET 請求中使用同一個 token 並以 `token=` 的查詢參數形式攜帶 token 來進行認證。

## 透過 API 列出您發佈的令牌

`/users/:name/tokens` 是一個特殊的介面，需要您使用 basic authentication 進行認證，具體原因在 issue 中
[#3842](https://github.com/go-gitea/gitea/issues/3842#issuecomment-397743346) 有所提及，使用方法如下所示：

### 使用 Basic authentication 認證

```
$ curl --url https://yourusername:yourpassword@gitea.your.host/api/v1/users/yourusername/tokens
[{"name":"test","sha1":"..."},{"name":"dev","sha1":"..."}]
```

## 使用 Sudo 方式請求 API

此 API 允許管理員借用其他使用者身份進行 API 請求。只需在請求中指定查詢參數 `sudo=` 或是指定 header 中的 `Sudo:` 為需要使用的使用者 username 即可。
