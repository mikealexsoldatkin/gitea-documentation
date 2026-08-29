---
date: "2023-04-27T15:00:00+08:00"
slug: "overview"
sidebar_position: 1
---

# 概述

從 Gitea **1.19** 開始，Gitea Actions 作為內建的 CI/CD 解決方案可用。

## 名稱

它類似並相容於 [GitHub Actions](https://github.com/features/actions)，其名稱也受其啟發。
為了避免混淆，我們在這裡澄清拼寫：

- "Gitea Actions"（帶有 "s"，兩個詞首字母大寫）是 Gitea 功能的名稱。
- "GitHub Actions" 是 GitHub 功能的名稱。
- "Actions" 可能指上述任何一個，取決於上下文。在本文件中，它指的是 "Gitea Actions"。
- "action" 或 "actions" 指的是一些腳本/外掛，如 "actions/checkout@v4" 或 "actions/cache@v3"。

## Runners

就像其他 CI/CD 解決方案一樣，Gitea 不會自己運行作業，而是將作業委派給 runners。
Gitea Actions 的 runner 稱為 [act runner](https://gitea.com/gitea/act_runner)，它是一個獨立的程式，也是用 Go 編寫的。
它基於 [nektos/act](http://github.com/nektos/act) 的 [fork](https://gitea.com/gitea/act)。

由於 runner 是獨立部署的，可能會有潛在的安全問題。
為了避免這些問題，請遵循兩個簡單的規則：

- 不要為你不信任的儲存庫、組織或實例使用你不信任的 runner。
- 不要為你不信任的儲存庫、組織或實例提供 runner。

對於內部使用的 Gitea 實例，如企業或個人使用的實例，這兩個規則都不是問題，它們自然如此。
然而，對於公共 Gitea 實例，如 [gitea.com](https://gitea.com)，在添加或使用 runners 時應記住這兩個規則。

## 狀態

Gitea Actions 仍在開發中，因此可能會有一些錯誤和缺失的功能。
在穩定之前（v1.20 或更高版本），可能會進行重大更改。

如果情況發生變化，我們會在這裡更新。
因此，當你在其他地方找到過時的文章時，請參考這裡的內容。
