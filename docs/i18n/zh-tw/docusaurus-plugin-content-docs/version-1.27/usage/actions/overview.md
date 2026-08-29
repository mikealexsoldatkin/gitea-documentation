---
date: "2023-05-24T15:00:00+08:00"
slug: "overview"
sidebar_position: 1
---

# Overview

從Gitea **1.19**版本開始，Gitea Actions成為了內置的CI/CD解決方案。

## 名稱

Gitea Actions與[GitHub Actions](https://github.com/features/actions)相似且相容，它的名稱也受到了它的啟發。
為了避免混淆，在這裡我們明確了拼寫方式：

- "Gitea Actions"（兩個單詞都大寫且帶有"s"）是Gitea功能的名稱。
- "GitHub Actions"是GitHub功能的名稱。
- "Actions"根據上下文的不同可以指代以上任意一個。在本文件中指代的是"Gitea Actions"。
- "action"或"actions"指代一些要使用的腳本/外掛，比如"actions/checkout@v4"或"actions/cache@v3"。

## Runner

和其他CI/CD解決方案一樣，Gitea不會自己運行Job，而是將Job委託給Runner。
Gitea Actions的Runner被稱為[Gitea Runner](https://gitea.com/gitea/runner)，它是一個獨立的程式，也是用Go語言編寫的。
它的重要部分來自[nektos/act](http://github.com/nektos/act)的一個硬分支。

由於Runner是獨立部署的，可能存在潛在的安全問題。
為了避免這些問題，請遵循兩個簡單的規則：

- 不要為你的儲存庫、組織或實例使用你不信任的Runner。
- 不要為你不信任的儲存庫、組織或實例提供Runner。

對於內部使用的Gitea實例，比如企業或個人使用的實例，這兩個規則不是問題，它們自然而然就是如此。
然而，對於公共的Gitea實例，比如[gitea.com](https://gitea.com)，在添加或使用Runner時應當牢記這兩個規則。

## 狀態

Gitea Actions仍然在開發中，因此可能存在一些錯誤和缺失的功能。
並且在穩定版本（v1.20或更高版本）之前可能會進行一些重大的更改。

如果情況發生變化，我們將在此處進行更新。
因此，請在其他地方找到過時文章時參考此處的內容。
