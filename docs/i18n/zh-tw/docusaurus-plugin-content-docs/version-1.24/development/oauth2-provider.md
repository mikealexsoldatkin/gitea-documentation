---
date: "2019-04-19:44:00+01:00"
slug: "oauth2-provider"
sidebar_position: 41
aliases:
  - /zh-tw/oauth2-provider
---

# OAuth2 提供者

Gitea 支援作為 OAuth2 提供者，允許第三方應用程式在使用者同意的情況下訪問其資源。此功能自 1.8.0 版起可用。

## 端點

| 端點                     | URL                                 |
| ------------------------ | ----------------------------------- |
| OpenID Connect Discovery | `/.well-known/openid-configuration` |
| Authorization Endpoint   | `/login/oauth/authorize`            |
| Access Token Endpoint    | `/login/oauth/access_token`         |
| OpenID Connect UserInfo  | `/login/oauth/userinfo`             |
| JSON Web Key Set         | `/login/oauth/keys`                 |

## 支援的 OAuth2 授權

目前 Gitea 僅支援 [**Authorization Code Grant**](https://tools.ietf.org/html/rfc6749#section-1.3.1) 標準，並額外支援以下擴展：

- [Proof Key for Code Exchange (PKCE)](https://tools.ietf.org/html/rfc7636)
- [OpenID Connect (OIDC)](https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth)

要將 Authorization Code Grant 作為第三方應用程式，您需要通過在設定中添加一個新的 "應用程式" (`/user/settings/applications`)。

## 範圍

Gitea 支援以下令牌範圍:

| 名稱                                     | 介紹                                                            |
| ---------------------------------------- | --------------------------------------------------------------- |
| **(no scope)**                           | 授予對公共使用者設定文件和公開儲存庫的只讀存取權限                |
| **repo**                                 | 完全控制所有儲存庫                                              |
| &nbsp;&nbsp;&nbsp; **repo:status**       | 授予對所有儲存庫中提交狀態的讀/寫存取權限                       |
| &nbsp;&nbsp;&nbsp; **public_repo**       | 僅授予對公開儲存庫的讀/寫存取權限                               |
| **admin:repo_hook**                      | 授予對所有儲存庫的 Hooks 存取權限，該權限已包含在 `repo` 範圍中 |
| &nbsp;&nbsp;&nbsp; **write:repo_hook**   | 授予對儲存庫 Hooks 的讀/寫存取權限                              |
| &nbsp;&nbsp;&nbsp; **read:repo_hook**    | 授予對儲存庫 Hooks 的只讀存取權限                               |
| **admin:org**                            | 授予對組織設定的完全存取權限                                    |
| &nbsp;&nbsp;&nbsp; **write:org**         | 授予對組織設定的讀/寫存取權限                                   |
| &nbsp;&nbsp;&nbsp; **read:org**          | 授予對組織設定的只讀存取權限                                    |
| **admin:public_key**                     | 授予公鑰管理的完全存取權限                                      |
| &nbsp;&nbsp;&nbsp; **write:public_key**  | 授予對公鑰的讀/寫存取權限                                       |
| &nbsp;&nbsp;&nbsp; **read:public_key**   | 授予對公鑰的只讀存取權限                                        |
| **admin:org_hook**                       | 授予對組織級別 Hooks 的完全存取權限                             |
| **admin:user_hook**                      | 授予對使用者級別 Hooks 的完全存取權限                             |
| **notification**                         | 授予對通知的完全存取權限                                        |
| **user**                                 | 授予對使用者個人資料資訊的完全存取權限                            |
| &nbsp;&nbsp;&nbsp; **read:user**         | 授予對使用者個人資料的讀取權限                                    |
| &nbsp;&nbsp;&nbsp; **user:email**        | 授予對使用者電子電子郵件地址的讀取權限                                |
| &nbsp;&nbsp;&nbsp; **user:follow**       | 授予存取權限以關注/取消關注使用者                                 |
| **delete_repo**                          | 授予刪除儲存庫的權限                                            |
| **package**                              | 授予對託管包的完全存取權限                                      |
| &nbsp;&nbsp;&nbsp; **write:package**     | 授予對包的讀/寫存取權限                                         |
| &nbsp;&nbsp;&nbsp; **read:package**      | 授予對包的讀取權限                                              |
| &nbsp;&nbsp;&nbsp; **delete:package**    | 授予對包的刪除權限                                              |
| **admin:gpg_key**                        | 授予 GPG 密鑰管理的完全存取權限                                 |
| &nbsp;&nbsp;&nbsp; **write:gpg_key**     | 授予對 GPG 密鑰的讀/寫存取權限                                  |
| &nbsp;&nbsp;&nbsp; **read:gpg_key**      | 授予對 GPG 密鑰的只讀存取權限                                   |
| **admin:application**                    | 授予應用程式管理的完全存取權限                                  |
| &nbsp;&nbsp;&nbsp; **write:application** | 授予應用程式管理的讀/寫存取權限                                 |
| &nbsp;&nbsp;&nbsp; **read:application**  | 授予應用程式管理的讀取權限                                      |
| **sudo**                                 | 允許以站點管理員身份執行操作                                    |

## 客戶端類型

Gitea 支援私密和公共客戶端類型，[參見 RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749#section-2.1).

對於公共客戶端, 允許在本地迴環地址的重定向 URI 中使用任意端口，例如 `http://127.0.0.1/`。根據 [RFC 8252 的建議](https://datatracker.ietf.org/doc/html/rfc8252#section-8.3)，請避免使用 `localhost`。

## 範例

**注意：** 該範例中尚未使用 PKCE。

1. 將使用者重定向到授權端點，以獲得他們的訪問資源授權:

   ```curl
   https://[YOUR-GITEA-URL]/login/oauth/authorize?client_id=CLIENT_ID&redirect_uri=REDIRECT_URI& response_type=code&state=STATE
   ```

   在設定中註冊應用程式以獲得 `CLIENT_ID`。`STATE` 是一個隨機字符串，它將在獲得使用者授權後發送回您的應用程式。`state` 參數是可選的，但您應該使用它來防止 CSRF 攻擊。

   ![Authorization Page](/authorize.png)

   使用者將會被詢問是否授權給您的應用程式。如果他們同意了授權，使用者將會被重定向到 `REDIRECT_URL`，例如：

   ```curl
   https://[REDIRECT_URI]?code=RETURNED_CODE&state=STATE
   ```

2. 使用重定向提供的 `code`，您可以請求一個新的應用程式和 Refresh Token。Access Token Endpoint 接受 `application/json` 或 `application/x-www-form-urlencoded` 類型的 POST 請求，例如：

   ```curl
   POST https://[YOUR-GITEA-URL]/login/oauth/access_token
   ```

   ```json
   {
     "client_id": "YOUR_CLIENT_ID",
     "client_secret": "YOUR_CLIENT_SECRET",
     "code": "RETURNED_CODE",
     "grant_type": "authorization_code",
     "redirect_uri": "REDIRECT_URI"
   }
   ```

   返回：

   ```json
   {
     "access_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJnbnQiOjIsInR0IjowLCJleHAiOjE1NTUxNzk5MTIsImlhdCI6MTU1NTE3NjMxMn0.0-iFsAwBtxuckA0sNZ6QpBQmywVPz129u75vOM7wPJecw5wqGyBkmstfJHAjEOqrAf_V5Z-1QYeCh_Cz4RiKug",
     "token_type": "bearer",
     "expires_in": 3600,
     "refresh_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJnbnQiOjIsInR0IjoxLCJjbnQiOjEsImV4cCI6MTU1NzgwNDMxMiwiaWF0IjoxNTU1MTc2MzEyfQ.S_HZQBy4q9r5SEzNGNIoFClT43HPNDbUdHH-GYNYYdkRfft6XptJBkUQscZsGxOW975Yk6RbgtGvq1nkEcklOw"
   }
   ```

   `CLIENT_SECRET` 是生成給應用程式的唯一密鑰。請注意，該密鑰只會在您使用 Gitea 建立/註冊應用程式後出現一次。如果您丟失了密鑰，您必須在應用程式設定中重新生成密鑰。

   `access_token` 請求中的 `REDIRECT_URI` 必須與 `authorize` 請求中的 `REDIRECT_URI` 相符。

3. 使用 `access_token` 來構造 [API 請求](api-usage) 以讀寫使用者的資源。
