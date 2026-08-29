---
date: "2023-08-22T14:21:00+08:00"
slug: "multi-factor-authentication"
weight: 15
---

# 多因素身份驗證 (MFA)

多因素身份驗證（也稱為 MFA 或 2FA）通過要求除密碼外的時間敏感憑據來增強安全性。
如果密碼後來被洩露，則無法登入 Gitea，帳戶將保持安全。
Gitea 支援 TOTP（基於時間的一次性密碼）令牌和使用 Webauthn API 的基於 FIDO 的硬件密鑰。

可以在使用者設定頁面的“安全”選項卡中設定 MFA。

## MFA 考慮事項

在使用者上啟用 MFA 會影響 Git HTTP 協議如何與 Git CLI 一起使用。
此介面不支援 MFA，並且在啟用 MFA 時嘗試正常使用密碼將不再可能。
如果 SSH 不是 Git 操作的選項，可以在使用者設定頁面的“應用程式”選項卡中生成存取權杖。
此存取權杖可以像密碼一樣使用，以允許 Git CLI 通過 HTTP 工作。

:::warning
由於其本質，存取權杖繞過了 MFA 的安全性優勢。
它必須保持安全，並且應僅作為最後的手段使用。
:::

Gitea API 支援在 `X-Gitea-OTP` 標頭中提供相關的 TOTP 密碼，如 [API 使用](development/api-usage.md) 中所述。
應盡可能使用此方法代替存取權杖。
