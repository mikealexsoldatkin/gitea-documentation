---
date: "2022-12-01T00:00:00+00:00"
slug: "incoming-email"
sidebar_position: 13
aliases:
  - /zh-tw/incoming-email
---

# 收件郵件

Gitea 支援通過收件郵件執行多種操作。本頁描述瞭如何設定此功能。

## 要求

處理收件郵件消息需要一個啟用 IMAP 的電子郵件帳戶。
推薦的策略是使用 [電子郵件子地址](https://en.wikipedia.org/wiki/Email_address#Sub-addressing) 但捕獲所有郵箱也可以工作。
接收電子電子郵件地址包含一個使用者/操作特定的令牌，該令牌告訴 Gitea 應執行哪個操作。
該令牌預期在 `To` 和 `Delivered-To` 標頭欄位中。

Gitea 嘗試檢測自動回覆以跳過，電子郵件伺服器也應設定以減少收件噪音（垃圾郵件、新聞簡報）。

## 設定

要啟用處理收件郵件消息，您必須在設定文件中設定 `email.incoming` 部分。

`REPLY_TO_ADDRESS` 包含電子郵件客戶端將回覆的地址。
此地址需要包含 `%{token}` 佔位符，該佔位符將被描述使用者/操作的令牌替換。
此佔位符必須僅出現在地址的使用者部分（在 `@` 之前）。

使用電子郵件子地址的範例可能如下所示：`incoming+%{token}@example.com`

如果使用捕獲所有郵箱，佔位符可以出現在地址的使用者部分的任何位置：`incoming+%{token}@example.com`、`incoming_%{token}@example.com`、`%{token}@example.com`

## 安全性

選擇用於接收收件郵件的域時要小心。
建議在子域上接收收件郵件，例如 `incoming.example.com` 以防止與 `example.com` 上運行的其他服務的潛在安全問題。
