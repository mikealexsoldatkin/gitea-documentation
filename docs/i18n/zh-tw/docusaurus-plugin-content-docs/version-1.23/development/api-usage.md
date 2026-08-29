---
date: "2018-06-24:00:00+02:00"
slug: "api-usage"
sidebar_position: 40
aliases:
  - /zh-tw/api-usage
---

# API 使用

## 啟用/設定 API 存取

預設情況下，`ENABLE_SWAGGER` 是啟用的，`MAX_RESPONSE_ITEMS` 設定為 50。更多資訊請參閱 [設定速查表](../administration/config-cheat-sheet.md)。

<a id="authentication"></a>
<a id="通過-api-認證"></a>
## 認證

Gitea 支援以下 API 認證方法：

- HTTP 基本認證
- URL 查詢字串中的 `token=...` 參數
- URL 查詢字串中的 `access_token=...` 參數
- HTTP 標頭中的 `Authorization: token ...` 標頭

所有這些方法都接受相同的 API 金鑰令牌類型。你可以透過查看程式碼更好地理解這一點——截至撰寫本文時，Gitea 會解析查詢和標頭以找到令牌，詳見 [modules/auth/auth.go](https://github.com/go-gitea/gitea/blob/6efdcaed86565c91a3dc77631372a9cc45a58e89/modules/auth/auth.go#L47)。

## 生成和列出 API 令牌

可以透過向 `/users/:name/tokens` 發送 `POST` 請求來生成新令牌。

請注意，`/users/:name/tokens` 是一個特殊端點，需要使用 `BasicAuth` 和密碼進行認證，如下所示：

```sh
$ curl -H "Content-Type: application/json" -d '{"name":"test"}' -u username:password https://gitea.your.host/api/v1/users/<username>/tokens
{"id":1,"name":"test","sha1":"9fcb1158165773dd010fca5f0cf7174316c3e37d","token_last_eight":"16c3e37d"}
```

`sha1`（令牌）只會返回一次，並且不會以明文形式儲存。當使用 `GET` 請求列出令牌時，它不會顯示；例如：

```sh
$ curl --url https://yourusername:password@gitea.your.host/api/v1/users/<username>/tokens
[{"name":"test","sha1":"","token_last_eight:"........":},{"name":"dev","sha1":"","token_last_eight":"........"}]
```

要在啟用雙因素認證的情況下使用基本認證 API，你需要發送一個包含一次性密碼（6 位數旋轉令牌）的額外標頭。標頭範例如 `X-Gitea-OTP: 123456`，其中 `123456` 是你從身份驗證器中獲取的程式碼。以下是 curl 請求的範例：

```sh
$ curl -H "X-Gitea-OTP: 123456" --url https://yourusername:yourpassword@gitea.your.host/api/v1/users/yourusername/tokens
```

你也可以透過 Gitea 安裝的網頁介面建立 API 金鑰令牌：`Settings | Applications | Generate New Token`。

<a id="oauth2-provider"></a>
## OAuth2 提供者

從 Gitea 的 [OAuth2 提供者](development/oauth2-provider.md) 獲取的存取權杖可以透過以下方法接受：

- HTTP 標頭中的 `Authorization bearer ...` 標頭
- URL 查詢字串中的 `token=...` 參數
- URL 查詢字串中的 `access_token=...` 參數

### 關於 `Authorization:` 標頭的更多資訊

由於歷史原因，Gitea 需要在授權標頭中的 API 金鑰令牌前包含單詞 `token`，如下所示：

```sh
Authorization: token 65eaa9c8ef52460d22a93307fe0aee76289dc675
```

例如，在 `curl` 命令中，這將如下所示：

```sh
curl "http://localhost:4000/api/v1/repos/test1/test1/issues" \
    -H "accept: application/json" \
    -H "Authorization: token 65eaa9c8ef52460d22a93307fe0aee76289dc675" \
    -H "Content-Type: application/json" -d "{ \"body\": \"testing\", \"title\": \"test 20\"}" -i
```

如上所述，使用的令牌與在 GET 請求中的 `token=` 字串中使用的令牌相同。

## 分頁

API 支援分頁。`page` 和 `limit` 參數用於指定頁碼和每頁的專案數量。如果有多頁，則返回 `Link` 標頭，其中包含下一頁、上一頁和最後一頁的鏈接。還返回 `x-total-count` 以指示專案總數。

```sh
curl -v "http://localhost/api/v1/repos/search?limit=1"
...
< link: <http://localhost/api/v1/repos/search?limit=1&page=2>; rel="next",<http://localhost/api/v1/repos/search?limit=1&page=5252>; rel="last"
...
< x-total-count: 5252
```

## API 指南

API 參考指南由 swagger 自動生成，可在以下位置獲取：
`https://gitea.your.host/api/swagger`
或在
[Gitea 實例](https://gitea.com/api/swagger)

OpenAPI 文件位於：
`https://gitea.your.host/swagger.v1.json`

## Sudo

API 允許管理員使用者以其他使用者的身份 sudo API 請求。只需添加 `sudo=` 參數或 `Sudo:` 請求標頭，並附上要 sudo 的使用者名稱。

## SDKs

- [官方 go-sdk](https://gitea.com/gitea/go-sdk)
- [更多](https://gitea.com/gitea/awesome-gitea#user-content-sdk)
