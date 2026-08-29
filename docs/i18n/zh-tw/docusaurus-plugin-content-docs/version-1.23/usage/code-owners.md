---
date: "2023-05-24T16:00:00+00:00"
slug: "code-owners"
sidebar_position: 30
aliases:
  - /zh-tw/code-owners
---

# 程式碼所有者

Gitea 維護程式碼所有者文件。它會按以下順序在以下位置查找：

- `./CODEOWNERS`
- `./docs/CODEOWNERS`
- `./.gitea/CODEOWNERS`

並在找到的第一個文件處停止。

文件格式：`<regexp rule> <@user or @org/team> [@user or @org/team]...`

正則表達式以 golang Regex 格式指定。
正則表達式可以以 `!` 開頭表示否定規則 - 匹配除指定文件外的所有文件。

範例文件：

```bash
.*\\.go @user1 @user2 # 這是評論

# 這也是評論
# 您可以為用戶或團隊分配代碼所有權
frontend/src/.*\\.js @org1/team1 @org1/team2 @user3

# 您可以使用否定模式
!frontend/src/.* @org1/team3 @user5

# 您可以使用 go 正則表達式的強大功能
docs/(aws|google|azure)/[^/]*\\.(md|txt) @user8 @org1/team4
!/assets/.*\\.(bin|exe|msi) @user9
```

### 轉義

您可以使用 `\` 轉義字符 `#`、` `（空格）和 `\`，例如：

```
dir/with\#hashtag @user1
path\ with\ space @user2
path/with\\backslash @user3
```

某些字符（`.+*?()|[]{}^$\`）應在正則表達式內使用 `\\` 轉義，例如：

```
path/\\.with\\.dots
path/with\\+plus
```
