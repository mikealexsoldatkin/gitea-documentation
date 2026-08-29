---
date: "2016-12-01T16:00:00+02:00"
slug: "webhooks"
sidebar_position: 30
aliases:
  - /zh-cn/webhooks
---

# Webhooks

Gitea 可以为仓库活动发送出站 Webhook。仓库级 Webhook 由仓库管理员在
`/:username/:reponame/settings/hooks` 中配置。组织、用户和系统管理级别
也有对应的 Webhook 配置页面。

Webhook 配置支持四种作用域：

- `仓库 Webhook`：仅对单个仓库中的活动触发。
- `组织 Webhook`：对该组织拥有的仓库中的活动触发。
- `用户 Webhook`：对该用户拥有的仓库中的活动触发。
- `系统 Webhook`：对实例中的所有符合条件的活动触发。

Gitea 还支持由管理员定义的 `默认 Webhook`。它并不是额外的投递作用域，
而是会在新仓库创建时被复制到仓库中，之后按普通仓库 Webhook 的方式工作。

Gitea 支持以下出站 Webhook 集成：

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

`Gitea` 和 `Gogs` 类型会发送通用 Webhook 负载。上面列出的聊天和服务集成
会将同一个内部事件转换为各自服务所需的请求体格式。

本页分为三个部分：

- `配置`：如何配置 Webhook 设置，例如 URL、密钥、分支过滤器和授权头。
- `投递`：Gitea 如何发送 Webhook 请求、会携带哪些请求头，以及如何校验投递。
- `事件`：Gitea 会投递哪些事件，以及每个事件包含哪些顶层 payload 参数。

## 配置

本节介绍在创建或编辑 Webhook 时可以设置的选项。

### 配置 Webhook

创建 Webhook 时，主要配置项包括：

- `Target URL`：接收投递的目标地址。
- `HTTP Method`：通用 Webhook 通常使用 `POST`。
- `POST Content Type`：通用 Webhook 可使用 `application/json` 或
  `application/x-www-form-urlencoded`。
- `Secret`：用于对原始请求体进行 HMAC 签名。
- `Authorization Header`：可选的自定义 `Authorization` 请求头，会随每次请求发送。
- `Branch Filter`：可选的分支或标签过滤规则。
- `Trigger On`：`Push Events`、`All Events` 或自定义事件选择。
- `Active`：是否启用该 Webhook。

:::note
旧示例里可能仍会在 JSON payload 中看到 `secret` 字段。当前版本的 Gitea
不会再把 Webhook 密钥放进 payload 正文中。请始终通过签名请求头来验证请求。
:::

### 分支过滤器

分支过滤器使用与
[`github.com/gobwas/glob`](https://pkg.go.dev/github.com/gobwas/glob#Compile)
兼容的 glob 语法。

- 空值、`*` 或 `**` 表示匹配全部。
- 像 `main` 这样的普通分支名会匹配该分支。
- 也支持 `refs/tags/v*` 这样的完整 ref。
- 支持 `{main,release/*}` 这样的花括号表达式。
- 过滤器只对带 git ref 的事件生效，例如 `create`、`delete` 和 `push`。
- 不带 ref 的事件，例如 issue 或 release，会忽略分支过滤器。

示例：

- `main`
- `{main,feature/*}`
- `{refs/heads/feature/*,refs/tags/release/*}`

### 授权头

Gitea 可以配置为在每次 Webhook 投递时发送自定义
[Authorization header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization)。
它与 Webhook 密钥是相互独立的：

- 使用密钥通过 HMAC 校验请求完整性。
- 当接收端需要应用层认证时，使用 `Authorization` 请求头。

## 投递

本节说明 Gitea 如何发送 Webhook 投递，以及接收端如何识别和验证这些请求。

### 投递行为

- Webhook 会通过 HTTP 异步投递。
- 通用 `Gitea` 和 `Gogs` Webhook 支持 `POST` 与 `GET`；通常应使用 `POST`。
- 对于 `POST` 请求，payload 可以直接作为 JSON
  （`application/json`）发送，也可以放在名为 `payload` 的表单字段中
  （`application/x-www-form-urlencoded`）。
- 某些特定服务的集成可能会使用该服务要求的 HTTP 方法和请求体格式。

### 投递请求头

每次投递都包含唯一的 delivery ID 和事件请求头。对于兼容 GitHub 的集成，
Gitea 也会同时发送对应的 GitHub 和 Gogs 风格请求头。

| 请求头 | 说明 |
| --- | --- |
| `X-Gitea-Delivery` | 本次投递尝试的唯一 UUID。 |
| `X-Gitea-Event` | 规范化事件名，例如 `push`、`issues` 或 `pull_request`。 |
| `X-Gitea-Event-Type` | 更具体的事件类型，例如 `issue_assign` 或 `pull_request_review_comment`。 |
| `X-Gitea-Signature` | 原始请求体的十六进制 HMAC-SHA256 值，不带前缀。 |
| `X-Gitea-Hook-Installation-Target-Type` | Webhook 定义所在范围，通常是 `repository`、`organization`、`user` 或 `system`。默认 Webhook 会先复制到仓库后再投递，因此通常会表现为 `repository`。 |
| `X-Gogs-Delivery`、`X-Gogs-Event`、`X-Gogs-Event-Type`、`X-Gogs-Signature` | 与 Gitea 对应请求头值相同的兼容请求头。 |
| `X-GitHub-Delivery`、`X-GitHub-Event`、`X-GitHub-Event-Type` | GitHub 风格兼容请求头。 |
| `X-GitHub-Hook-Installation-Target-Type` | GitHub 风格的 Webhook 作用域请求头。 |
| `X-Hub-Signature` | GitHub 兼容的 HMAC-SHA1 请求头，格式为 `sha1=<digest>`。 |
| `X-Hub-Signature-256` | GitHub 兼容的 HMAC-SHA256 请求头，格式为 `sha256=<digest>`。 |

如果未配置密钥，签名请求头仍然会存在，但摘要值为空。

#### `Event` 与 `Event-Type`

某些 Gitea Webhook 订阅会被归类到同一个规范化事件名下。例如，issue 指派
投递会归类到 issue 事件组：

```http
X-Gitea-Event: issues
X-Gitea-Event-Type: issue_assign
X-GitHub-Event: issues
X-GitHub-Event-Type: issue_assign
```

如果你需要知道真正触发投递的具体事件类型，请使用 `X-Gitea-Event-Type`。

#### 校验投递

Gitea 会使用你的 Webhook 密钥对原始请求体进行签名。要校验一次投递：

1. 按接收到的原始内容读取请求体。
2. 使用 Webhook 密钥计算 HMAC-SHA256 摘要。
3. 将结果与 `X-Gitea-Signature` 或 GitHub 兼容的
   `X-Hub-Signature-256` 进行比较。
4. 尽量使用常量时间比较函数。

注意事项：

- `X-Gitea-Signature` 仅包含小写十六进制的 SHA-256 摘要。
- `X-Hub-Signature-256` 使用相同摘要，但带有 `sha256=` 前缀。
- `X-Hub-Signature` 也会出于兼容性目的发送，其算法是 SHA-1。
- 在完成签名校验之前，不应先解析 JSON 或修改请求体。

##### PHP 示例

下面的示例演示如何校验以 `application/json` 发送的通用 `Gitea` Webhook。

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

本节采用与 GitHub Webhook 文档类似的按事件逐项描述方式：每个事件都会说明
其触发时机，以及 payload 中包含哪些顶层字段。

事件分组与 Webhook 设置界面中的分组一致：`Repository Events`、
`Issue Events`、`Pull Request Events` 和 `Workflow Events`。

### 仓库事件

- `create`、`delete`、`fork`、`push`、`wiki`、`repository`、`release`、`package`、`status`

#### `create`

当分支或标签被创建时，会触发此事件。

##### Payload 参数

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `sha` | `string` | **必填。** 新建引用对应的对象 ID。 |
| `ref` | `string` | **必填。** 被创建的分支名或标签名。 |
| `ref_type` | `string` | **必填。** 引用类型，例如 `branch` 或 `tag`。 |
| `repository` | `object` | **必填。** 创建该引用的仓库。 |
| `sender` | `object` | **必填。** 创建该引用的用户。 |

#### `delete`

当分支或标签被删除时，会触发此事件。

##### Payload 参数

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `ref` | `string` | **必填。** 被删除的分支名或标签名。 |
| `ref_type` | `string` | **必填。** 引用类型，例如 `branch` 或 `tag`。 |
| `pusher_type` | `string` | **必填。** 删除该 ref 的行为主体类型。当前 Gitea payload 中使用 `user`。 |
| `repository` | `object` | **必填。** 删除该引用所在的仓库。 |
| `sender` | `object` | **必填。** 删除该引用的用户。 |

#### `fork`

当仓库被 fork 时，会触发此事件。

##### Payload 参数

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `forkee` | `object` | **必填。** 新创建的 fork 仓库。 |
| `repository` | `object` | **必填。** 被 fork 的原始仓库。 |
| `sender` | `object` | **必填。** 创建 fork 的用户。 |

#### `push`

当提交被推送到某个分支或标签时，会触发此事件。

##### Payload 参数

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `ref` | `string` | **必填。** 被推送的完整 ref，例如 `refs/heads/main`。 |
| `before` | `string` | **必填。** 推送前的提交 SHA。 |
| `after` | `string` | **必填。** 推送后的提交 SHA。 |
| `compare_url` | `string` | **必填。** 用于比较 `before` 和 `after` 的 URL。 |
| `commits` | `array` | **必填。** 本次推送包含的提交列表。 |
| `total_commits` | `integer` | **必填。** 本次推送中的提交数量。 |
| `head_commit` | `object` | 本次推送中的最新提交。 |
| `repository` | `object` | **必填。** 接收此次推送的仓库。 |
| `pusher` | `object` | **必填。** 执行推送的用户。 |
| `sender` | `object` | **必填。** 触发 Webhook 的用户。 |

#### `wiki`

当 Wiki 页面被创建、编辑或删除时，会触发此事件。

**动作类型：** `created`、`edited`、`deleted`

##### Payload 参数

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `action` | `string` | **必填。** Wiki 页面操作类型。 |
| `repository` | `object` | **必填。** 拥有该 Wiki 的仓库。 |
| `sender` | `object` | **必填。** 修改 Wiki 页面的用户。 |
| `page` | `string` | **必填。** Wiki 页面名称。 |
| `comment` | `string` | Wiki 提交信息或备注。 |

#### `repository`

当仓库被创建或删除时，会触发此事件。

**动作类型：** `created`、`deleted`

##### Payload 参数

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 仓库操作类型。 |
| `repository` | `object` | **必填。** 被创建或删除的仓库。 |
| `organization` | `object` | 当仓库属于某个组织时会出现。 |
| `sender` | `object` | **必填。** 执行该操作的用户。 |

#### `release`

当发布版本被发布、更新或删除时，会触发此事件。

**动作类型：** `published`、`updated`、`deleted`

##### Payload 参数

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `action` | `string` | **必填。** Release 操作类型。 |
| `release` | `object` | **必填。** 被操作的发布版本。 |
| `repository` | `object` | **必填。** 包含该发布版本的仓库。 |
| `sender` | `object` | **必填。** 执行该操作的用户。 |

#### `package`

当包被创建或删除时，会触发此事件。

**动作类型：** `created`、`deleted`

##### Payload 参数

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 包操作类型。 |
| `repository` | `object` | 与该包关联的仓库；如果适用则会出现。 |
| `package` | `object` | **必填。** 被操作的包。 |
| `organization` | `object` | 当包所有者是组织时会出现。 |
| `sender` | `object` | **必填。** 执行该操作的用户。 |

#### `status`

当通过 API 创建或更新提交状态时，会触发此事件。

##### Payload 参数

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `commit` | `object` | 与该状态关联的提交。 |
| `context` | `string` | **必填。** 状态上下文，例如 `ci/build`。 |
| `created_at` | `string` | **必填。** 状态创建时间。 |
| `description` | `string` | 状态描述文本。 |
| `id` | `integer` | **必填。** 状态标识符。 |
| `repository` | `object` | **必填。** 包含该提交的仓库。 |
| `sender` | `object` | **必填。** 创建该状态的用户。 |
| `sha` | `string` | **必填。** 提交 SHA。 |
| `state` | `string` | **必填。** 状态值，例如 `pending`、`success`、`error` 或 `failure`。 |
| `target_url` | `string` | 与该状态关联的目标 URL。 |
| `updated_at` | `string` | 状态最后更新时间。 |

与多数其他 payload 不同，此事件不使用 `action` 字段，状态变化通过 `state`
字段表示。

### 议题事件

- `issues`、`issue_assign`、`issue_label`、`issue_milestone`、`issue_comment`

#### `issues`

当 issue 被打开、关闭、重新打开、编辑或删除时，会触发此事件。

**动作类型：** `opened`、`closed`、`reopened`、`edited`、`deleted`

##### Payload 参数

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `action` | `string` | **必填。** Issue 操作类型。 |
| `number` | `integer` | **必填。** Issue 编号。 |
| `changes` | `object` | 可选。编辑字段之前的值，或标签变化明细。 |
| `issue` | `object` | **必填。** 被操作的 issue。 |
| `repository` | `object` | **必填。** 包含该 issue 的仓库。 |
| `sender` | `object` | **必填。** 执行该操作的用户。 |
| `commit_id` | `string` | 与该 issue 操作关联的提交 SHA；如果适用则会出现。 |

#### `issue_assign`

当 issue 被指派或取消指派时，会触发此事件。

**动作类型：** `assigned`、`unassigned`

##### Payload 参数

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 指派操作类型。 |
| `number` | `integer` | **必填。** Issue 编号。 |
| `changes` | `object` | 可选。编辑字段之前的值，或标签变化明细。 |
| `issue` | `object` | **必填。** 被操作的 issue。 |
| `repository` | `object` | **必填。** 包含该 issue 的仓库。 |
| `sender` | `object` | **必填。** 执行该操作的用户。 |
| `commit_id` | `string` | 与该 issue 操作关联的提交 SHA；如果适用则会出现。 |

#### `issue_label`

当 issue 标签被更新或清空时，会触发此事件。

**动作类型：** `label_updated`、`label_cleared`

##### Payload 参数

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 标签更新操作类型。 |
| `number` | `integer` | **必填。** Issue 编号。 |
| `changes` | `object` | 可选。编辑字段之前的值，或标签变化明细。 |
| `issue` | `object` | **必填。** 被操作的 issue。 |
| `repository` | `object` | **必填。** 包含该 issue 的仓库。 |
| `sender` | `object` | **必填。** 执行该操作的用户。 |
| `commit_id` | `string` | 与该 issue 操作关联的提交 SHA；如果适用则会出现。 |

#### `issue_milestone`

当 issue 被设置里程碑或移除里程碑时，会触发此事件。

**动作类型：** `milestoned`、`demilestoned`

##### Payload 参数

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 里程碑操作类型。 |
| `number` | `integer` | **必填。** Issue 编号。 |
| `changes` | `object` | 可选。编辑字段之前的值，或标签变化明细。 |
| `issue` | `object` | **必填。** 被操作的 issue。 |
| `repository` | `object` | **必填。** 包含该 issue 的仓库。 |
| `sender` | `object` | **必填。** 执行该操作的用户。 |
| `commit_id` | `string` | 与该 issue 操作关联的提交 SHA；如果适用则会出现。 |

#### `issue_comment`

当 issue 评论被创建、编辑或删除时，会触发此事件。

**动作类型：** `created`、`edited`、`deleted`

##### Payload 参数

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 评论操作类型。 |
| `issue` | `object` | **必填。** 该评论所属的 issue。 |
| `pull_request` | `object` | 当该评论位于 pull request 时间线上时会出现。 |
| `comment` | `object` | **必填。** 被创建、编辑或删除的评论。 |
| `changes` | `object` | 可选。当操作类型为 `edited` 时，表示评论正文的旧值。 |
| `repository` | `object` | **必填。** 包含该 issue 的仓库。 |
| `sender` | `object` | **必填。** 执行该操作的用户。 |
| `is_pull` | `boolean` | **必填。** 该评论是否位于 pull request 时间线上。 |

### Pull Request 事件

- `pull_request`、`pull_request_assign`、`pull_request_label`、`pull_request_milestone`、`pull_request_comment`、`pull_request_review`、`pull_request_review_approved`、`pull_request_review_rejected`、`pull_request_review_comment`、`pull_request_sync`、`pull_request_review_request`

#### `pull_request`

当 pull request 被打开、关闭、重新打开、编辑或删除时，会触发此事件。

**动作类型：** `opened`、`closed`、`reopened`、`edited`、`deleted`

##### Payload 参数

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `action` | `string` | **必填。** Pull request 操作类型。 |
| `number` | `integer` | **必填。** Pull request 编号。 |
| `changes` | `object` | 可选。编辑字段之前的值，或标签变化明细。 |
| `pull_request` | `object` | **必填。** 被操作的 pull request。 |
| `requested_reviewer` | `object` | 在评审请求事件中会出现。 |
| `repository` | `object` | **必填。** 包含该 pull request 的仓库。 |
| `sender` | `object` | **必填。** 执行该操作的用户。 |
| `commit_id` | `string` | 与该 pull request 操作关联的提交 SHA；如果适用则会出现。 |
| `review` | `object` | 在 pull request review 事件中会出现。 |

#### `pull_request_assign`

当 pull request 被指派或取消指派时，会触发此事件。

**动作类型：** `assigned`、`unassigned`

##### Payload 参数

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 指派操作类型。 |
| `number` | `integer` | **必填。** Pull request 编号。 |
| `changes` | `object` | 可选。编辑字段之前的值，或标签变化明细。 |
| `pull_request` | `object` | **必填。** 被操作的 pull request。 |
| `requested_reviewer` | `object` | 在评审请求事件中会出现。 |
| `repository` | `object` | **必填。** 包含该 pull request 的仓库。 |
| `sender` | `object` | **必填。** 执行该操作的用户。 |
| `commit_id` | `string` | 与该 pull request 操作关联的提交 SHA；如果适用则会出现。 |
| `review` | `object` | 在 pull request review 事件中会出现。 |

#### `pull_request_label`

当 pull request 标签被更新或清空时，会触发此事件。

**动作类型：** `label_updated`、`label_cleared`

##### Payload 参数

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 标签更新操作类型。 |
| `number` | `integer` | **必填。** Pull request 编号。 |
| `changes` | `object` | 可选。编辑字段之前的值，或标签变化明细。 |
| `pull_request` | `object` | **必填。** 被操作的 pull request。 |
| `requested_reviewer` | `object` | 在评审请求事件中会出现。 |
| `repository` | `object` | **必填。** 包含该 pull request 的仓库。 |
| `sender` | `object` | **必填。** 执行该操作的用户。 |
| `commit_id` | `string` | 与该 pull request 操作关联的提交 SHA；如果适用则会出现。 |
| `review` | `object` | 在 pull request review 事件中会出现。 |

#### `pull_request_milestone`

当 pull request 被设置里程碑或移除里程碑时，会触发此事件。

**动作类型：** `milestoned`、`demilestoned`

##### Payload 参数

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 里程碑操作类型。 |
| `number` | `integer` | **必填。** Pull request 编号。 |
| `changes` | `object` | 可选。编辑字段之前的值，或标签变化明细。 |
| `pull_request` | `object` | **必填。** 被操作的 pull request。 |
| `requested_reviewer` | `object` | 在评审请求事件中会出现。 |
| `repository` | `object` | **必填。** 包含该 pull request 的仓库。 |
| `sender` | `object` | **必填。** 执行该操作的用户。 |
| `commit_id` | `string` | 与该 pull request 操作关联的提交 SHA；如果适用则会出现。 |
| `review` | `object` | 在 pull request review 事件中会出现。 |

#### `pull_request_comment`

当 pull request 时间线评论被创建、编辑或删除时，会触发此事件。

**动作类型：** `created`、`edited`、`deleted`

##### Payload 参数

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 评论操作类型。 |
| `issue` | `object` | **必填。** 与该 pull request 关联的 issue 记录。 |
| `pull_request` | `object` | **必填。** 评论所属的 pull request。 |
| `comment` | `object` | **必填。** 被创建、编辑或删除的评论。 |
| `changes` | `object` | 可选。当操作类型为 `edited` 时，表示评论正文的旧值。 |
| `repository` | `object` | **必填。** 包含该 pull request 的仓库。 |
| `sender` | `object` | **必填。** 执行该操作的用户。 |
| `is_pull` | `boolean` | **必填。** 对此事件来说始终为 `true`。 |

#### `pull_request_review`

这是 Webhook 设置界面中的一个仅用于订阅的汇总事件。

它不会生成独立的投递 payload。勾选后，Gitea 实际投递的是更具体的
`pull_request_review_approved`、`pull_request_review_rejected` 和
`pull_request_review_comment` 事件。

#### `pull_request_review_approved`

当 pull request review 以批准形式提交时，会触发此事件。

**动作类型：** `reviewed`

##### Payload 参数

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 始终为 `reviewed`。 |
| `number` | `integer` | **必填。** Pull request 编号。 |
| `changes` | `object` | 可选。编辑字段之前的值，或标签变化明细。 |
| `pull_request` | `object` | **必填。** 被评审的 pull request。 |
| `requested_reviewer` | `object` | 在评审请求事件中会出现。 |
| `repository` | `object` | **必填。** 包含该 pull request 的仓库。 |
| `sender` | `object` | **必填。** 提交该评审的用户。 |
| `commit_id` | `string` | 与该评审事件关联的提交 SHA；如果适用则会出现。 |
| `review` | `object` | **必填。** 评审负载。对此事件，`review.type` 为 `approved`。 |

#### `pull_request_review_rejected`

当 pull request review 以拒绝或请求修改的形式提交时，会触发此事件。

**动作类型：** `reviewed`

##### Payload 参数

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 始终为 `reviewed`。 |
| `number` | `integer` | **必填。** Pull request 编号。 |
| `changes` | `object` | 可选。编辑字段之前的值，或标签变化明细。 |
| `pull_request` | `object` | **必填。** 被评审的 pull request。 |
| `requested_reviewer` | `object` | 在评审请求事件中会出现。 |
| `repository` | `object` | **必填。** 包含该 pull request 的仓库。 |
| `sender` | `object` | **必填。** 提交该评审的用户。 |
| `commit_id` | `string` | 与该评审事件关联的提交 SHA；如果适用则会出现。 |
| `review` | `object` | **必填。** 评审负载。对此事件，`review.type` 为 `rejected`。 |

#### `pull_request_review_comment`

当 pull request review 以评论形式提交时，会触发此事件。

**动作类型：** `reviewed`

##### Payload 参数

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 始终为 `reviewed`。 |
| `number` | `integer` | **必填。** Pull request 编号。 |
| `changes` | `object` | 可选。编辑字段之前的值，或标签变化明细。 |
| `pull_request` | `object` | **必填。** 被评审的 pull request。 |
| `requested_reviewer` | `object` | 在评审请求事件中会出现。 |
| `repository` | `object` | **必填。** 包含该 pull request 的仓库。 |
| `sender` | `object` | **必填。** 提交该评审的用户。 |
| `commit_id` | `string` | 与该评审事件关联的提交 SHA；如果适用则会出现。 |
| `review` | `object` | **必填。** 评审负载。对此事件，`review.type` 为 `comment`。 |

#### `pull_request_sync`

当新的提交被推送后，pull request 被同步时，会触发此事件。

**动作类型：** `synchronized`

##### Payload 参数

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 始终为 `synchronized`。 |
| `number` | `integer` | **必填。** Pull request 编号。 |
| `changes` | `object` | 可选。编辑字段之前的值，或标签变化明细。 |
| `pull_request` | `object` | **必填。** 被同步的 pull request。 |
| `requested_reviewer` | `object` | 在评审请求事件中会出现。 |
| `repository` | `object` | **必填。** 包含该 pull request 的仓库。 |
| `sender` | `object` | **必填。** 执行同步操作的用户。 |
| `commit_id` | `string` | 与该同步事件关联的提交 SHA；如果适用则会出现。 |
| `review` | `object` | 在 pull request review 事件中会出现。 |

#### `pull_request_review_request`

当请求审查者或移除审查请求时，会触发此事件。

**动作类型：** `review_requested`、`review_request_removed`

##### Payload 参数

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 评审请求操作类型。 |
| `number` | `integer` | **必填。** Pull request 编号。 |
| `changes` | `object` | 可选。编辑字段之前的值，或标签变化明细。 |
| `pull_request` | `object` | **必填。** 被操作的 pull request。 |
| `requested_reviewer` | `object` | 被请求或被移除的评审者。 |
| `repository` | `object` | **必填。** 包含该 pull request 的仓库。 |
| `sender` | `object` | **必填。** 执行该操作的用户。 |
| `commit_id` | `string` | 与该 pull request 操作关联的提交 SHA；如果适用则会出现。 |
| `review` | `object` | 在 pull request review 事件中会出现。 |

### 工作流事件

- `workflow_run`、`workflow_job`

#### `workflow_run`

当 Gitea Actions 工作流运行状态发生变化时，会触发此事件。

**动作类型：** `queued`、`waiting`、`in_progress`、`completed`

##### Payload 参数

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 工作流运行状态变化。 |
| `workflow` | `object` | **必填。** 工作流定义。 |
| `workflow_run` | `object` | **必填。** 被操作的工作流运行记录。 |
| `pull_request` | `object` | 当该工作流运行与某个 pull request 相关时会出现。 |
| `organization` | `object` | 当仓库所有者是组织时会出现。 |
| `repository` | `object` | **必填。** 包含该工作流的仓库。 |
| `sender` | `object` | **必填。** 触发该工作流运行更新的用户。 |

#### `workflow_job`

当 Gitea Actions 工作流任务状态发生变化时，会触发此事件。

**动作类型：** `queued`、`waiting`、`in_progress`、`completed`

##### Payload 参数

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `action` | `string` | **必填。** 工作流任务状态变化。 |
| `workflow_job` | `object` | **必填。** 被操作的工作流任务。 |
| `pull_request` | `object` | 当该工作流任务与某个 pull request 相关时会出现。 |
| `organization` | `object` | 当仓库所有者是组织时会出现。 |
| `repository` | `object` | **必填。** 包含该工作流任务的仓库。 |
| `sender` | `object` | **必填。** 触发该工作流任务更新的用户。 |

## 测试、最近投递与重放

每个 Webhook 页面都包含：

- `Test Delivery`：会向仓库发送一次模拟的 `push` 事件。
- `Recent Deliveries`：显示请求和响应详情。
- `Redelivery`：重新投递一次历史 Webhook 记录。

如果仓库还没有任何提交，测试投递会使用一个生成的假提交，以便仍然可以测试
Webhook。

## 管理说明

管理员还可以通过实例级设置控制 Webhook 投递，例如主机允许列表、投递超时和
清理策略。详见
[配置速查表中的 Webhook 小节](../../administration/config-cheat-sheet.md#webhook-webhook)。
