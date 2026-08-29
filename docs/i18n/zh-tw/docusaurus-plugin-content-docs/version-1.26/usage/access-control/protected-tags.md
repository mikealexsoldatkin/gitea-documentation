---
date: "2023-05-23T09:00:00+08:00"
slug: "protected-tags"
sidebar_position: 45
aliases:
  - /zh-tw/protected-tags
---

# 受保護的標籤

受保護的標籤允許控制誰有權限建立或更新 Git 標籤。每個規則可以匹配單個標籤名稱，或者使用適當的模式來同時控制多個標籤。

## 設定受保護的標籤

要保護一個標籤，你需要按照以下步驟進行操作：

1. 進入儲存庫的**設定** > **標籤**頁面。
2. 輸入一個用於匹配名稱的模式。你可以使用單個名稱、[glob 模式](https://pkg.go.dev/github.com/gobwas/glob#Compile) 或正則表達式。
3. 選擇允許的使用者和/或團隊。如果將這些欄位留空，則不允許任何人建立或修改此標籤。
4. 選擇**保存**以保存設定。

## 模式受保護的標籤

該模式使用 [glob](https://pkg.go.dev/github.com/gobwas/glob#Compile) 或正則表達式來匹配標籤名稱。對於正則表達式，你需要將模式括在斜槓中。

範例：

| 類型  | 模式受保護的標籤         | 可能匹配的標籤                          |
| ----- | ------------------------ | --------------------------------------- |
| Glob  | `v*`                     | `v`，`v-1`，`version2`                  |
| Glob  | `v[0-9]`                 | `v0`，`v1` 到 `v9`                      |
| Glob  | `*-release`              | `2.1-release`，`final-release`          |
| Glob  | `gitea`                  | 僅限 `gitea`                            |
| Glob  | `*gitea*`                | `gitea`，`2.1-gitea`，`1_gitea-release` |
| Glob  | `{v,rel}-*`              | `v-`，`v-1`，`v-final`，`rel-`，`rel-x` |
| Glob  | `*`                      | 匹配所有可能的標籤名稱                  |
| Regex | `/\Av/`                  | `v`，`v-1`，`version2`                  |
| Regex | `/\Av[0-9]\z/`           | `v0`，`v1` 到 `v9`                      |
| Regex | `/\Av\d+\.\d+\.\d+\z/`   | `v1.0.17`，`v2.1.0`                     |
| Regex | `/\Av\d+(\.\d+){0,2}\z/` | `v1`，`v2.1`，`v1.2.34`                 |
| Regex | `/-release\z/`           | `2.1-release`，`final-release`          |
| Regex | `/gitea/`                | `gitea`，`2.1-gitea`，`1_gitea-release` |
| Regex | `/\Agitea\z/`            | 僅限 `gitea`                            |
| Regex | `/^gitea$/`              | 僅限 `gitea`                            |
| Regex | `/\A(v\|rel)-/`          | `v-`，`v-1`，`v-final`，`rel-`，`rel-x` |
| Regex | `/.+/`                   | 匹配所有可能的標籤名稱                  |
