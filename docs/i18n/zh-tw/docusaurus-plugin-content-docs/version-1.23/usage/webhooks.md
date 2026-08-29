---
date: "2016-12-01T16:00:00+02:00"
slug: "webhooks"
sidebar_position: 30
aliases:
  - /zh-tw/webhooks
---

# Webhooks

Gitea 支援儲存庫事件的 webhooks。這可以由儲存庫管理員在設定頁面 `/:username/:reponame/settings/hooks` 中設定。webhooks 也可以在每個組織和整個系統範圍內設定。
所有事件推送都是 POST 請求。目前支援的方法有：

- Gitea（也可以是 GET 請求）
- Gogs
- Slack
- Discord
- Dingtalk
- Telegram
- Microsoft Teams
- Feishu
- Wechatwork
- Packagist

### 事件資訊

:::warning
自 Gitea 1.13.0 起，payload 中的 `secret` 欄位已棄用，並將在 1.14.0 中刪除：https://github.com/go-gitea/gitea/issues/11755
:::

以下是 Gitea 將發送到 Payload URL 的事件資訊範例：

```http
X-GitHub-Delivery: f6266f16-1bf3-46a5-9ea4-602e06ead473
X-GitHub-Event: push
X-Gogs-Delivery: f6266f16-1bf3-46a5-9ea4-602e06ead473
X-Gogs-Event: push
X-Gitea-Delivery: f6266f16-1bf3-46a5-9ea4-602e06ead473
X-Gitea-Event: push
```

```json
{
  "secret": "3gEsCfjlV2ugRwgpU#w1*WaW*wa4NXgGmpCfkbG3",
  "ref": "refs/heads/develop",
  "before": "28e1879d029cb852e4844d9c718537df08844e03",
  "after": "bffeb74224043ba2feb48d137756c8a9331c449a",
  "compare_url": "http://localhost:3000/gitea/webhooks/compare/28e1879d029cb852e4844d9c718537df08844e03...bffeb74224043ba2feb48d137756c8a9331c449a",
  "commits": [
    {
      "id": "bffeb74224043ba2feb48d137756c8a9331c449a",
      "message": "Webhooks Yay!",
      "url": "http://localhost:3000/gitea/webhooks/commit/bffeb74224043ba2feb48d137756c8a9331c449a",
      "author": {
        "name": "Gitea",
        "email": "someone@gitea.io",
        "username": "gitea"
      },
      "committer": {
        "name": "Gitea",
        "email": "someone@gitea.io",
        "username": "gitea"
      },
      "timestamp": "2017-03-13T13:52:11-04:00"
    }
  ],
  "repository": {
    "id": 140,
    "owner": {
      "id": 1,
      "login": "gitea",
      "full_name": "Gitea",
      "email": "someone@gitea.io",
      "avatar_url": "https://localhost:3000/avatars/1",
      "username": "gitea"
    },
    "name": "webhooks",
    "full_name": "gitea/webhooks",
    "description": "",
    "private": false,
    "fork": false,
    "html_url": "http://localhost:3000/gitea/webhooks",
    "ssh_url": "ssh://gitea@localhost:2222/gitea/webhooks.git",
    "clone_url": "http://localhost:3000/gitea/webhooks.git",
    "website": "",
    "stars_count": 0,
    "forks_count": 1,
    "watchers_count": 1,
    "open_issues_count": 7,
    "default_branch": "master",
    "created_at": "2017-02-26T04:29:06-05:00",
    "updated_at": "2017-03-13T13:51:58-04:00"
  },
  "pusher": {
    "id": 1,
    "login": "gitea",
    "full_name": "Gitea",
    "email": "someone@gitea.io",
    "avatar_url": "https://localhost:3000/avatars/1",
    "username": "gitea"
  },
  "sender": {
    "id": 1,
    "login": "gitea",
    "full_name": "Gitea",
    "email": "someone@gitea.io",
    "avatar_url": "https://localhost:3000/avatars/1",
    "username": "gitea"
  }
}
```

### 範例

這是一個如何使用 webhooks 在推送請求到儲存庫時運行 php 腳本的範例。
在您的儲存庫設定中，webhooks 下，設定一個 Gitea webhook，如下所示：

- 目標 URL: http://mydomain.com/webhook.php
- HTTP 方法: POST
- POST 內容類型: application/json
- Secret: 123
- 觸發事件: 推送事件
- 活躍: 已勾選

現在在您的伺服器上建立 php 文件 webhook.php

```php
<?php

$secret_key = '123';

// 檢查是否為 POST 請求
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    error_log('FAILED - not POST - '. $_SERVER['REQUEST_METHOD']);
    exit();
}

// 獲取內容類型
$content_type = isset($_SERVER['CONTENT_TYPE']) ? strtolower(trim($_SERVER['CONTENT_TYPE'])) : '';

if ($content_type != 'application/json') {
    error_log('FAILED - not application/json - '. $content_type);
    exit();
}

// 獲取 payload
$payload = trim(file_get_contents("php://input"));

if (empty($payload)) {
    error_log('FAILED - no payload');
    exit();
}

// 獲取標頭簽名
$header_signature = isset($_SERVER['HTTP_X_GITEA_SIGNATURE']) ? $_SERVER['HTTP_X_GITEA_SIGNATURE'] : '';

if (empty($header_signature)) {
    error_log('FAILED - header signature missing');
    exit();
}

// 計算 payload 簽名
$payload_signature = hash_hmac('sha256', $payload, $secret_key, false);

// 檢查 payload 簽名與標頭簽名是否匹配
if ($header_signature !== $payload_signature) {
    error_log('FAILED - payload signature');
    exit();
}

// 將 json 轉換為數組
$decoded = json_decode($payload, true);

// 檢查 json 解碼錯誤
if (json_last_error() !== JSON_ERROR_NONE) {
    error_log('FAILED - json decode - '. json_last_error());
    exit();
}

// 成功，執行操作
```

webhook 設定中有一個測試傳遞按鈕，允許測試設定以及最近傳遞的列表。

### 授權標頭

**從 1.19 開始**，Gitea hooks 可以設定為向 webhook 目標發送 [授權標頭](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization)。
