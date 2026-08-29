---
date: "2023-05-23T09:00:00+08:00"

slug: "incoming-email"
sidebar_position: 13
aliases:
  - /zh-tw/incoming-email
---

# 郵件接收

Gitea 支援通過接收郵件執行多種操作。本頁面描述瞭如何進行設定。

## 要求

處理接收的電子郵件需要啟用 IMAP 功能的電子郵件帳戶。
推薦的策略是使用 [電子郵件子地址](https://en.wikipedia.org/wiki/Email_address#Sub-addressing)，但也可以使用 catch-all 郵箱。
接收電子電子郵件地址中包含一個使用者/操作特定的令牌，告訴 Gitea 應執行哪個操作。
此令牌應該出現在 `To` 和 `Delivered-To` 頭欄位中。

Gitea 會嘗試檢測自動回覆並跳過它們，電子郵件伺服器也應該設定以減少接收到的干擾（垃圾郵件、通訊訂閱等）。

## 設定

要激活處理接收的電子郵件消息功能，您需要在設定文件中設定 `email.incoming` 部分。

`REPLY_TO_ADDRESS` 包含電子郵件客戶端將要回復的地址。
該地址需要包含 `%{token}` 佔位符，該佔位符將被替換為描述使用者/操作的令牌。
此佔位符在地址中只能出現一次，並且必須位於地址的使用者部分（`@` 之前）。

使用電子郵件子地址的範例可能如下：`incoming+%{token}@example.com`

如果使用 catch-all 郵箱，則佔位符可以出現在地址的使用者部分的任何位置：`incoming+%{token}@example.com`、`incoming_%{token}@example.com`、`%{token}@example.com`

## 安全性

在選擇用於接收傳入電子郵件的域時要小心。
建議在子域名上接收傳入電子郵件，例如 `incoming.example.com`，以防止與運行在 `example.com` 上的其他服務可能存在的安全問題。
