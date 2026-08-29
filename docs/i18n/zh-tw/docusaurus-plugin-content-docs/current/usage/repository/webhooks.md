---
date: "2016-12-01T16:00:00+02:00"
slug: "webhooks"
sidebar_position: 30
aliases:
  - /zh-tw/webhooks
---

# Webhooks

Gitea 可以為儲存庫活動送出對外 Webhook。儲存庫層級的 Webhook 由儲存庫管理員
在 `/:username/:reponame/settings/hooks` 中設定。組織、使用者與系統管理層級
也有對應的 Webhook 設定頁面。

Webhook 設定支援四種範圍：

- `儲存庫 Webhook`：只會對單一儲存庫中的活動觸發。
- `組織 Webhook`：對該組織擁有的儲存庫中的活動觸發。
- `使用者 Webhook`：對該使用者擁有的儲存庫中的活動觸發。
- `系統 Webhook`：對實例中所有符合條件的活動觸發。

Gitea 也支援由管理員定義的 `預設 Webhook`。它並不是額外的投遞範圍，而是會在
建立新儲存庫時被複製到該儲存庫中，之後就會像一般儲存庫 Webhook 一樣運作。

Gitea 支援以下對外 Webhook 整合：

- Gitea
- Gogs
- Slack
- Discord
- Dingtalk
- Telegram
- Microsoft Teams
- Feishu
- Matrix
- Wechatwork
- Packagist

`Gitea` 與 `Gogs` 類型會送出通用 Webhook payload。上面列出的聊天與服務整合
則會把同一個內部事件轉換成各自服務所需的請求主體格式。

本頁分成三個部分：

- `設定`：如何設定 Webhook 選項，例如 URL、密鑰、分支過濾器與授權標頭。
- `投遞`：Gitea 如何送出 Webhook 請求、會附帶哪些標頭，以及如何驗證投遞。
- `事件`：Gitea 會投遞哪些事件，以及每個事件包含哪些頂層 payload 參數。

## 設定

本節介紹在建立或編輯 Webhook 時可以設定的選項。

### 設定 Webhook

建立 Webhook 時，主要設定專案包括：

- `Target URL`：接收投遞的目標位址。
- `HTTP Method`：通用 Webhook 通常使用 `POST`。
- `POST Content Type`：通用 Webhook 可使用 `application/json` 或
  `application/x-www-form-urlencoded`。
- `Secret`：用來對原始請求主體進行 HMAC 簽章。
- `Authorization Header`：可選的自訂 `Authorization` 標頭，會隨每次請求送出。
- `Branch Filter`：可選的分支或標籤過濾規則。
- `Trigger On`：`Push Events`、`All Events` 或自訂事件選擇。
- `Active`：是否啟用該 Webhook。

:::note
舊版範例中可能仍會在 JSON payload 裡看到 `secret` 欄位。當前版本的 Gitea
不會再把 Webhook 密鑰放進 payload 內容中。請務必透過簽章標頭驗證請求。
:::

### 分支過濾器

分支過濾器使用與
[`github.com/gobwas/glob`](https://pkg.go.dev/github.com/gobwas/glob#Compile)
相容的 glob 語法。

- 空值、`*` 或 `**` 代表符合全部。
- 像 `main` 這樣的一般分支名稱會符合該分支。
- 也支援 `refs/tags/v*` 這類完整 ref。
- 支援 `{main,release/*}` 這類大括號表達式。
- 過濾器只會套用在帶有 git ref 的事件，例如 `create`、`delete` 與 `push`。
- 不帶 ref 的事件，例如 issue 或 release，會忽略分支過濾器。

範例：

- `main`
- `{main,feature/*}`
- `{refs/heads/feature/*,refs/tags/release/*}`

### 授權標頭

Gitea 可以設定為在每次 Webhook 投遞時送出自訂的
[Authorization header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization)。
它與 Webhook 密鑰彼此獨立：

- 使用密鑰透過 HMAC 驗證請求完整性。
- 當接收端需要應用層認證時，使用 `Authorization` 標頭。

## 投遞

本節說明 Gitea 如何送出 Webhook 投遞，以及接收端如何識別與驗證這些請求。

### 投遞行為

- Webhook 會透過 HTTP 非同步投遞。
- 通用 `Gitea` 與 `Gogs` Webhook 支援 `POST` 與 `GET`；通常應使用 `POST`。
- 對於 `POST` 請求，payload 可以直接以 JSON
  （`application/json`）送出，也可以放在名為 `payload` 的表單欄位中
  （`application/x-www-form-urlencoded`）。
- 某些特定服務整合可能會使用該服務要求的 HTTP 方法與請求主體格式。

### 投遞標頭

每次投遞都包含唯一的 delivery ID 與事件標頭。對於相容 GitHub 的整合，
Gitea 也會同時送出對應的 GitHub 與 Gogs 風格標頭。

| 標頭 | 說明 |
| --- | --- |
| `X-Gitea-Delivery` | 本次投遞嘗試的唯一 UUID。 |
| `X-Gitea-Event` | 規範化事件名稱，例如 `push`、`issues` 或 `pull_request`。 |
| `X-Gitea-Event-Type` | 更具體的事件類型，例如 `issue_assign` 或 `pull_request_review_comment`。 |
| `X-Gitea-Signature` | 原始請求主體的十六進位 HMAC-SHA256 值，不含前綴。 |
| `X-Gitea-Hook-Installation-Target-Type` | Webhook 定義所在範圍，通常是 `repository`、`organization`、`user` 或 `system`。預設 Webhook 會先複製到儲存庫後再投遞，因此通常會呈現為 `repository`。 |
| `X-Gogs-Delivery`、`X-Gogs-Event`、`X-Gogs-Event-Type`、`X-Gogs-Signature` | 與 Gitea 對應標頭值相同的相容性標頭。 |
| `X-GitHub-Delivery`、`X-GitHub-Event`、`X-GitHub-Event-Type` | GitHub 風格相容性標頭。 |
| `X-GitHub-Hook-Installation-Target-Type` | GitHub 風格的 Webhook 範圍標頭。 |
| `X-Hub-Signature` | GitHub 相容的 HMAC-SHA1 標頭，格式為 `sha1=<digest>`。 |
| `X-Hub-Signature-256` | GitHub 相容的 HMAC-SHA256 標頭，格式為 `sha256=<digest>`。 |

如果未設定密鑰，簽章標頭仍然會存在，但摘要值為空。

#### `Event` 與 `Event-Type`

某些 Gitea Webhook 訂閱會被歸類到同一個規範化事件名稱下。例如，issue 指派
投遞會歸類到 issue 事件群組：

```http
X-Gitea-Event: issues
X-Gitea-Event-Type: issue_assign
X-GitHub-Event: issues
X-GitHub-Event-Type: issue_assign
```

如果你需要知道實際觸發投遞的具體事件類型，請使用 `X-Gitea-Event-Type`。

#### 驗證投遞

Gitea 會使用你的 Webhook 密鑰對原始請求主體進行簽章。要驗證一次投遞：

1. 以接收到的原始內容讀取請求主體。
2. 使用 Webhook 密鑰計算 HMAC-SHA256 摘要。
3. 將結果與 `X-Gitea-Signature` 或 GitHub 相容的
   `X-Hub-Signature-256` 進行比較。
4. 盡量使用常數時間比較函式。

注意事項：

- `X-Gitea-Signature` 只包含小寫十六進位的 SHA-256 摘要。
- `X-Hub-Signature-256` 使用相同摘要，但帶有 `sha256=` 前綴。
- `X-Hub-Signature` 也會為了相容性而送出，其演算法為 SHA-1。
- 在完成簽章驗證之前，不應先解析 JSON 或修改請求主體。

##### PHP 範例

下面的範例示範如何驗證以 `application/json` 送出的通用 `Gitea` Webhook。

```php
<?php

$secret = '123';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Only POST is allowed');
}

$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_GITEA_SIGNATURE'] ?? '';

if ($payload === false || $signature === '') {
    http_response_code(400);
    exit('Missing payload or signature');
}

$expected = hash_hmac('sha256', $payload, $secret);

if (!hash_equals($expected, $signature)) {
    http_response_code(401);
    exit('Invalid signature');
}

$event = $_SERVER['HTTP_X_GITEA_EVENT'] ?? '';
$eventType = $_SERVER['HTTP_X_GITEA_EVENT_TYPE'] ?? '';
$data = json_decode($payload, true);

if (!is_array($data)) {
    http_response_code(400);
    exit('Invalid JSON payload');
}

http_response_code(204);
```

## 事件

本節採用與 GitHub Webhook 文件類似的逐事件描述方式：每個事件都會說明
觸發時機，以及 payload 中包含哪些頂層欄位。

事件分組與 Webhook 設定介面中的分組一致：`Repository Events`、
`Issue Events`、`Pull Request Events` 與 `Workflow Events`。

### 儲存庫事件

- `create`、`delete`、`fork`、`push`、`wiki`、`repository`、`release`、`package`、`status`

#### `create`

當分支或標籤被建立時，會觸發此事件。

##### Payload 參數

| 名稱 | 類型 | 說明 |
| --- | --- | --- |
| `sha` | `string` | **必填。** 新建引用對應的物件 ID。 |
| `ref` | `string` | **必填。** 被建立的分支名稱或標籤名稱。 |
| `ref_type` | `string` | **必填。** 引用類型，例如 `branch` 或 `tag`。 |
| `repository` | `object` | **必填。** 建立該引用的儲存庫。 |
| `sender` | `object` | **必填。** 建立該引用的使用者。 |

#### `delete`

當分支或標籤被刪除時，會觸發此事件。

##### Payload 參數

| 名稱 | 類型 | 說明 |
| --- | --- | --- |
| `ref` | `string` | **必填。** 被刪除的分支名稱或標籤名稱。 |
| `ref_type` | `string` | **必填。** 引用類型，例如 `branch` 或 `tag`。 |
| `pusher_type` | `string` | **必填。** 刪除該 ref 的行為主體類型。目前 Gitea payload 使用 `user`。 |
| `repository` | `object` | **必填。** 刪除該引用所在的儲存庫。 |
| `sender` | `object` | **必填。** 刪除該引用的使用者。 |

#### `fork`

當儲存庫被 fork 時，會觸發此事件。

##### Payload 參數

| 名稱 | 類型 | 說明 |
| --- | --- | --- |
| `forkee` | `object` | **必填。** 新建立的 fork 儲存庫。 |
| `repository` | `object` | **必填。** 被 fork 的原始儲存庫。 |
| `sender` | `object` | **必填。** 建立 fork 的使用者。 |

#### `push`

當提交被推送到某個分支或標籤時，會觸發此事件。

##### Payload 參數

| 名稱 | 類型 | 說明 |
| --- | --- | --- |
| `ref` | `string` | **必填。** 被推送的完整 ref，例如 `refs/heads/main`。 |
| `before` | `string` | **必填。** 推送前的提交 SHA。 |
| `after` | `string` | **必填。** 推送後的提交 SHA。 |
| `compare_url` | `string` | **必填。** 用於比較 `before` 與 `after` 的 URL。 |
| `commits` | `array` | **必填。** 本次推送包含的提交清單。 |
| `total_commits` | `integer` | **必填。** 本次推送中的提交數量。 |
| `head_commit` | `object` | 本次推送中的最新提交。 |
| `repository` | `object` | **必填。** 接收此次推送的儲存庫。 |
| `pusher` | `object` | **必填。** 執行推送的使用者。 |
| `sender` | `object` | **必填。** 觸發 Webhook 的使用者。 |

#### `wiki`

當 Wiki 頁面被建立、編輯或刪除時，會觸發此事件。

**動作類型：** `created`、`edited`、`deleted`

##### Payload 參數

| 名稱 | 類型 | 說明 |
| --- | --- | --- |
| `action` | `string` | **必填。** Wiki 頁面操作類型。 |
| `repository` | `object` | **必填。** 擁有該 Wiki 的儲存庫。 |
| `sender` | `object` | **必填。** 修改 Wiki 頁面的使用者。 |
| `page` | `string` | **必填。** Wiki 頁面名稱。 |
| `comment` | `string` | Wiki 提交訊息或註解。 |

#### `repository`

當儲存庫被建立或刪除時，會觸發此事件。

**動作類型：** `created`、`deleted`

##### Payload 參數

| 名稱 | 類型 | 說明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 儲存庫操作類型。 |
| `repository` | `object` | **必填。** 被建立或刪除的儲存庫。 |
| `organization` | `object` | 當儲存庫屬於某個組織時會出現。 |
| `sender` | `object` | **必填。** 執行該操作的使用者。 |

#### `release`

當發行版本被發佈、更新或刪除時，會觸發此事件。

**動作類型：** `published`、`updated`、`deleted`

##### Payload 參數

| 名稱 | 類型 | 說明 |
| --- | --- | --- |
| `action` | `string` | **必填。** Release 操作類型。 |
| `release` | `object` | **必填。** 被操作的發行版本。 |
| `repository` | `object` | **必填。** 包含該發行版本的儲存庫。 |
| `sender` | `object` | **必填。** 執行該操作的使用者。 |

#### `package`

當套件被建立或刪除時，會觸發此事件。

**動作類型：** `created`、`deleted`

##### Payload 參數

| 名稱 | 類型 | 說明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 套件操作類型。 |
| `repository` | `object` | 與該套件關聯的儲存庫；如果適用則會出現。 |
| `package` | `object` | **必填。** 被操作的套件。 |
| `organization` | `object` | 當套件擁有者是組織時會出現。 |
| `sender` | `object` | **必填。** 執行該操作的使用者。 |

#### `status`

當透過 API 建立或更新提交狀態時，會觸發此事件。

##### Payload 參數

| 名稱 | 類型 | 說明 |
| --- | --- | --- |
| `commit` | `object` | 與該狀態關聯的提交。 |
| `context` | `string` | **必填。** 狀態內容，例如 `ci/build`。 |
| `created_at` | `string` | **必填。** 狀態建立時間。 |
| `description` | `string` | 狀態描述文字。 |
| `id` | `integer` | **必填。** 狀態識別碼。 |
| `repository` | `object` | **必填。** 包含該提交的儲存庫。 |
| `sender` | `object` | **必填。** 建立該狀態的使用者。 |
| `sha` | `string` | **必填。** 提交 SHA。 |
| `state` | `string` | **必填。** 狀態值，例如 `pending`、`success`、`error` 或 `failure`。 |
| `target_url` | `string` | 與該狀態關聯的目標 URL。 |
| `updated_at` | `string` | 狀態最後更新時間。 |

與多數其他 payload 不同，此事件不使用 `action` 欄位，狀態變化透過 `state`
欄位表示。

### 議題事件

- `issues`、`issue_assign`、`issue_label`、`issue_milestone`、`issue_comment`

#### `issues`

當 issue 被開啟、關閉、重新開啟、編輯或刪除時，會觸發此事件。

**動作類型：** `opened`、`closed`、`reopened`、`edited`、`deleted`

##### Payload 參數

| 名稱 | 類型 | 說明 |
| --- | --- | --- |
| `action` | `string` | **必填。** Issue 操作類型。 |
| `number` | `integer` | **必填。** Issue 編號。 |
| `changes` | `object` | 可選。編輯欄位之前的值，或標籤變更明細。 |
| `issue` | `object` | **必填。** 被操作的 issue。 |
| `repository` | `object` | **必填。** 包含該 issue 的儲存庫。 |
| `sender` | `object` | **必填。** 執行該操作的使用者。 |
| `commit_id` | `string` | 與該 issue 操作關聯的提交 SHA；如果適用則會出現。 |

#### `issue_assign`

當 issue 被指派或取消指派時，會觸發此事件。

**動作類型：** `assigned`、`unassigned`

##### Payload 參數

| 名稱 | 類型 | 說明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 指派操作類型。 |
| `number` | `integer` | **必填。** Issue 編號。 |
| `changes` | `object` | 可選。編輯欄位之前的值，或標籤變更明細。 |
| `issue` | `object` | **必填。** 被操作的 issue。 |
| `repository` | `object` | **必填。** 包含該 issue 的儲存庫。 |
| `sender` | `object` | **必填。** 執行該操作的使用者。 |
| `commit_id` | `string` | 與該 issue 操作關聯的提交 SHA；如果適用則會出現。 |

#### `issue_label`

當 issue 標籤被更新或清空時，會觸發此事件。

**動作類型：** `label_updated`、`label_cleared`

##### Payload 參數

| 名稱 | 類型 | 說明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 標籤更新操作類型。 |
| `number` | `integer` | **必填。** Issue 編號。 |
| `changes` | `object` | 可選。編輯欄位之前的值，或標籤變更明細。 |
| `issue` | `object` | **必填。** 被操作的 issue。 |
| `repository` | `object` | **必填。** 包含該 issue 的儲存庫。 |
| `sender` | `object` | **必填。** 執行該操作的使用者。 |
| `commit_id` | `string` | 與該 issue 操作關聯的提交 SHA；如果適用則會出現。 |

#### `issue_milestone`

當 issue 被設定里程碑或移除里程碑時，會觸發此事件。

**動作類型：** `milestoned`、`demilestoned`

##### Payload 參數

| 名稱 | 類型 | 說明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 里程碑操作類型。 |
| `number` | `integer` | **必填。** Issue 編號。 |
| `changes` | `object` | 可選。編輯欄位之前的值，或標籤變更明細。 |
| `issue` | `object` | **必填。** 被操作的 issue。 |
| `repository` | `object` | **必填。** 包含該 issue 的儲存庫。 |
| `sender` | `object` | **必填。** 執行該操作的使用者。 |
| `commit_id` | `string` | 與該 issue 操作關聯的提交 SHA；如果適用則會出現。 |

#### `issue_comment`

當 issue 評論被建立、編輯或刪除時，會觸發此事件。

**動作類型：** `created`、`edited`、`deleted`

##### Payload 參數

| 名稱 | 類型 | 說明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 評論操作類型。 |
| `issue` | `object` | **必填。** 該評論所屬的 issue。 |
| `pull_request` | `object` | 當該評論位於 pull request 時間線上時會出現。 |
| `comment` | `object` | **必填。** 被建立、編輯或刪除的評論。 |
| `changes` | `object` | 可選。當操作類型為 `edited` 時，表示評論內容的舊值。 |
| `repository` | `object` | **必填。** 包含該 issue 的儲存庫。 |
| `sender` | `object` | **必填。** 執行該操作的使用者。 |
| `is_pull` | `boolean` | **必填。** 該評論是否位於 pull request 時間線上。 |

### Pull Request 事件

- `pull_request`、`pull_request_assign`、`pull_request_label`、`pull_request_milestone`、`pull_request_comment`、`pull_request_review`、`pull_request_review_approved`、`pull_request_review_rejected`、`pull_request_review_comment`、`pull_request_sync`、`pull_request_review_request`

#### `pull_request`

當 pull request 被開啟、關閉、重新開啟、編輯或刪除時，會觸發此事件。

**動作類型：** `opened`、`closed`、`reopened`、`edited`、`deleted`

##### Payload 參數

| 名稱 | 類型 | 說明 |
| --- | --- | --- |
| `action` | `string` | **必填。** Pull request 操作類型。 |
| `number` | `integer` | **必填。** Pull request 編號。 |
| `changes` | `object` | 可選。編輯欄位之前的值，或標籤變更明細。 |
| `pull_request` | `object` | **必填。** 被操作的 pull request。 |
| `requested_reviewer` | `object` | 在審查請求事件中會出現。 |
| `repository` | `object` | **必填。** 包含該 pull request 的儲存庫。 |
| `sender` | `object` | **必填。** 執行該操作的使用者。 |
| `commit_id` | `string` | 與該 pull request 操作關聯的提交 SHA；如果適用則會出現。 |
| `review` | `object` | 在 pull request review 事件中會出現。 |

#### `pull_request_assign`

當 pull request 被指派或取消指派時，會觸發此事件。

**動作類型：** `assigned`、`unassigned`

##### Payload 參數

| 名稱 | 類型 | 說明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 指派操作類型。 |
| `number` | `integer` | **必填。** Pull request 編號。 |
| `changes` | `object` | 可選。編輯欄位之前的值，或標籤變更明細。 |
| `pull_request` | `object` | **必填。** 被操作的 pull request。 |
| `requested_reviewer` | `object` | 在審查請求事件中會出現。 |
| `repository` | `object` | **必填。** 包含該 pull request 的儲存庫。 |
| `sender` | `object` | **必填。** 執行該操作的使用者。 |
| `commit_id` | `string` | 與該 pull request 操作關聯的提交 SHA；如果適用則會出現。 |
| `review` | `object` | 在 pull request review 事件中會出現。 |

#### `pull_request_label`

當 pull request 標籤被更新或清空時，會觸發此事件。

**動作類型：** `label_updated`、`label_cleared`

##### Payload 參數

| 名稱 | 類型 | 說明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 標籤更新操作類型。 |
| `number` | `integer` | **必填。** Pull request 編號。 |
| `changes` | `object` | 可選。編輯欄位之前的值，或標籤變更明細。 |
| `pull_request` | `object` | **必填。** 被操作的 pull request。 |
| `requested_reviewer` | `object` | 在審查請求事件中會出現。 |
| `repository` | `object` | **必填。** 包含該 pull request 的儲存庫。 |
| `sender` | `object` | **必填。** 執行該操作的使用者。 |
| `commit_id` | `string` | 與該 pull request 操作關聯的提交 SHA；如果適用則會出現。 |
| `review` | `object` | 在 pull request review 事件中會出現。 |

#### `pull_request_milestone`

當 pull request 被設定里程碑或移除里程碑時，會觸發此事件。

**動作類型：** `milestoned`、`demilestoned`

##### Payload 參數

| 名稱 | 類型 | 說明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 里程碑操作類型。 |
| `number` | `integer` | **必填。** Pull request 編號。 |
| `changes` | `object` | 可選。編輯欄位之前的值，或標籤變更明細。 |
| `pull_request` | `object` | **必填。** 被操作的 pull request。 |
| `requested_reviewer` | `object` | 在審查請求事件中會出現。 |
| `repository` | `object` | **必填。** 包含該 pull request 的儲存庫。 |
| `sender` | `object` | **必填。** 執行該操作的使用者。 |
| `commit_id` | `string` | 與該 pull request 操作關聯的提交 SHA；如果適用則會出現。 |
| `review` | `object` | 在 pull request review 事件中會出現。 |

#### `pull_request_comment`

當 pull request 時間線評論被建立、編輯或刪除時，會觸發此事件。

**動作類型：** `created`、`edited`、`deleted`

##### Payload 參數

| 名稱 | 類型 | 說明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 評論操作類型。 |
| `issue` | `object` | **必填。** 與該 pull request 關聯的 issue 記錄。 |
| `pull_request` | `object` | **必填。** 評論所屬的 pull request。 |
| `comment` | `object` | **必填。** 被建立、編輯或刪除的評論。 |
| `changes` | `object` | 可選。當操作類型為 `edited` 時，表示評論內容的舊值。 |
| `repository` | `object` | **必填。** 包含該 pull request 的儲存庫。 |
| `sender` | `object` | **必填。** 執行該操作的使用者。 |
| `is_pull` | `boolean` | **必填。** 對此事件而言固定為 `true`。 |

#### `pull_request_review`

這是 Webhook 設定介面中的一個僅用於訂閱的彙總事件。

它不會產生獨立的投遞 payload。勾選後，Gitea 實際投遞的是更具體的
`pull_request_review_approved`、`pull_request_review_rejected` 與
`pull_request_review_comment` 事件。

#### `pull_request_review_approved`

當 pull request review 以覈准形式提交時，會觸發此事件。

**動作類型：** `reviewed`

##### Payload 參數

| 名稱 | 類型 | 說明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 固定為 `reviewed`。 |
| `number` | `integer` | **必填。** Pull request 編號。 |
| `changes` | `object` | 可選。編輯欄位之前的值，或標籤變更明細。 |
| `pull_request` | `object` | **必填。** 被審查的 pull request。 |
| `requested_reviewer` | `object` | 在審查請求事件中會出現。 |
| `repository` | `object` | **必填。** 包含該 pull request 的儲存庫。 |
| `sender` | `object` | **必填。** 提交該審查的使用者。 |
| `commit_id` | `string` | 與該審查事件關聯的提交 SHA；如果適用則會出現。 |
| `review` | `object` | **必填。** 審查 payload。對此事件而言，`review.type` 為 `approved`。 |

#### `pull_request_review_rejected`

當 pull request review 以拒絕或請求修改的形式提交時，會觸發此事件。

**動作類型：** `reviewed`

##### Payload 參數

| 名稱 | 類型 | 說明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 固定為 `reviewed`。 |
| `number` | `integer` | **必填。** Pull request 編號。 |
| `changes` | `object` | 可選。編輯欄位之前的值，或標籤變更明細。 |
| `pull_request` | `object` | **必填。** 被審查的 pull request。 |
| `requested_reviewer` | `object` | 在審查請求事件中會出現。 |
| `repository` | `object` | **必填。** 包含該 pull request 的儲存庫。 |
| `sender` | `object` | **必填。** 提交該審查的使用者。 |
| `commit_id` | `string` | 與該審查事件關聯的提交 SHA；如果適用則會出現。 |
| `review` | `object` | **必填。** 審查 payload。對此事件而言，`review.type` 為 `rejected`。 |

#### `pull_request_review_comment`

當 pull request review 以評論形式提交時，會觸發此事件。

**動作類型：** `reviewed`

##### Payload 參數

| 名稱 | 類型 | 說明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 固定為 `reviewed`。 |
| `number` | `integer` | **必填。** Pull request 編號。 |
| `changes` | `object` | 可選。編輯欄位之前的值，或標籤變更明細。 |
| `pull_request` | `object` | **必填。** 被審查的 pull request。 |
| `requested_reviewer` | `object` | 在審查請求事件中會出現。 |
| `repository` | `object` | **必填。** 包含該 pull request 的儲存庫。 |
| `sender` | `object` | **必填。** 提交該審查的使用者。 |
| `commit_id` | `string` | 與該審查事件關聯的提交 SHA；如果適用則會出現。 |
| `review` | `object` | **必填。** 審查 payload。對此事件而言，`review.type` 為 `comment`。 |

#### `pull_request_sync`

當新的提交被推送後，pull request 被同步時，會觸發此事件。

**動作類型：** `synchronized`

##### Payload 參數

| 名稱 | 類型 | 說明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 固定為 `synchronized`。 |
| `number` | `integer` | **必填。** Pull request 編號。 |
| `changes` | `object` | 可選。編輯欄位之前的值，或標籤變更明細。 |
| `pull_request` | `object` | **必填。** 被同步的 pull request。 |
| `requested_reviewer` | `object` | 在審查請求事件中會出現。 |
| `repository` | `object` | **必填。** 包含該 pull request 的儲存庫。 |
| `sender` | `object` | **必填。** 執行同步操作的使用者。 |
| `commit_id` | `string` | 與該同步事件關聯的提交 SHA；如果適用則會出現。 |
| `review` | `object` | 在 pull request review 事件中會出現。 |

#### `pull_request_review_request`

當請求審查者或移除審查請求時，會觸發此事件。

**動作類型：** `review_requested`、`review_request_removed`

##### Payload 參數

| 名稱 | 類型 | 說明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 審查請求操作類型。 |
| `number` | `integer` | **必填。** Pull request 編號。 |
| `changes` | `object` | 可選。編輯欄位之前的值，或標籤變更明細。 |
| `pull_request` | `object` | **必填。** 被操作的 pull request。 |
| `requested_reviewer` | `object` | 被請求或被移除的審查者。 |
| `repository` | `object` | **必填。** 包含該 pull request 的儲存庫。 |
| `sender` | `object` | **必填。** 執行該操作的使用者。 |
| `commit_id` | `string` | 與該 pull request 操作關聯的提交 SHA；如果適用則會出現。 |
| `review` | `object` | 在 pull request review 事件中會出現。 |

### 工作流程事件

- `workflow_run`、`workflow_job`

#### `workflow_run`

當 Gitea Actions 工作流程執行狀態發生變化時，會觸發此事件。

**動作類型：** `queued`、`waiting`、`in_progress`、`completed`

##### Payload 參數

| 名稱 | 類型 | 說明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 工作流程執行狀態變化。 |
| `workflow` | `object` | **必填。** 工作流程定義。 |
| `workflow_run` | `object` | **必填。** 被操作的工作流程執行記錄。 |
| `pull_request` | `object` | 當該工作流程執行與某個 pull request 相關時會出現。 |
| `organization` | `object` | 當儲存庫擁有者是組織時會出現。 |
| `repository` | `object` | **必填。** 包含該工作流程的儲存庫。 |
| `sender` | `object` | **必填。** 觸發該工作流程執行更新的使用者。 |

#### `workflow_job`

當 Gitea Actions 工作流程作業狀態發生變化時，會觸發此事件。

**動作類型：** `queued`、`waiting`、`in_progress`、`completed`

##### Payload 參數

| 名稱 | 類型 | 說明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 工作流程作業狀態變化。 |
| `workflow_job` | `object` | **必填。** 被操作的工作流程作業。 |
| `pull_request` | `object` | 當該工作流程作業與某個 pull request 相關時會出現。 |
| `organization` | `object` | 當儲存庫擁有者是組織時會出現。 |
| `repository` | `object` | **必填。** 包含該工作流程作業的儲存庫。 |
| `sender` | `object` | **必填。** 觸發該工作流程作業更新的使用者。 |

## 測試、最近投遞與重新投遞

每個 Webhook 頁面都包含：

- `Test Delivery`：會向儲存庫送出一次模擬的 `push` 事件。
- `Recent Deliveries`：顯示請求與回應詳細資訊。
- `Redelivery`：重新投遞一筆歷史 Webhook 記錄。

如果儲存庫還沒有任何提交，測試投遞會使用一個產生的假提交，以便仍能測試
Webhook。

## 管理說明

管理員還可以透過實例層級設定控制 Webhook 投遞，例如主機允許清單、投遞逾時
與清理策略。詳見
[設定速查表中的 Webhook 小節](../../administration/config-cheat-sheet.md#webhook-webhook)。
