---
date: "2024-07-10T09:23:00+02:00"
slug: "secrets"
sidebar_position: 50
---

# Secrets

Secrets 允許你在使用者、組織或儲存庫中儲存敏感資訊。
Secrets 在 Gitea 1.19+ 可用，並且在 1.20+ 啟用 ACTIONS 時可見。

## 命名你的 secrets

以下規則適用於 secret 名稱：

- Secret 名稱只能包含字母數字字符 (`[a-z]`, `[A-Z]`, `[0-9]`) 或下劃線 (`_`)。不允許使用空格。
- Secret 名稱不得以 `GITHUB_` 和 `GITEA_` 前綴開頭。
- Secret 名稱不得以數字開頭。
- Secret 名稱不區分大小寫。
- Secret 名稱在建立它們的級別上必須是唯一的。

例如，在儲存庫級別建立的 secret 必須在該儲存庫中具有唯一名稱，而在組織級別建立的 secret 必須在該級別上具有唯一名稱。

### 使用 secrets

建立設定變數後，它們將自動填充到 `secrets` 上下文中。
可以透過表達式 `${{ secrets.SECRET_NAME }}` 在工作流程中訪問它們。

### 優先級

如果在多個級別存在同名 secret，則最低級別的 secret 優先。例如，如果組織級別的 secret 與儲存庫級別的 secret 同名，則儲存庫級別的 secret 優先。
