---
date: "2023-05-24T15:00:00+08:00"
slug: "comparison"
sidebar_position: 15
---

# 與GitHub Actions的對比

儘管Gitea Actions旨在與GitHub Actions相容，但它們之間存在一些差異。

## 額外功能

### Action URL絕對路徑

Gitea Actions支援通過URL絕對路徑定義actions，這意味著您可以使用來自任何Git儲存庫的Actions。
例如，`uses: https://github.com/actions/checkout@v4`或`uses: http://your_gitea.com/owner/repo@branch`。

### 使用Go編寫Actions

Gitea Actions支援使用Go編寫Actions。
請參閱[建立Go Actions](https://blog.gitea.com/creating-go-actions/)。

### 支援非標準的調度語法 @yearly, @monthly, @weekly, @daily, @hourly

Github Actions 不支援這些語法，詳見： https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule

## 不支援的工作流語法

### `concurrency`

這是用於一次運行一個Job。
請參閱[使用並發](https://docs.github.com/zh/actions/using-jobs/using-concurrency)。

Gitea Actions目前不支援此功能。

### `run-name`

這是工作流生成的工作流運行的名稱。
請參閱[GitHub Actions 的工作流語法](https://docs.github.com/zh/actions/using-workflows/workflow-syntax-for-github-actions#run-name)。

Gitea Actions目前不支援此功能。

### `permissions`和`jobs.<job_id>.permissions`

請參閱[GitHub Actions的工作流語法](https://docs.github.com/zh/actions/using-workflows/workflow-syntax-for-github-actions#permissions)。

Gitea Actions目前不支援此功能。

### `jobs.<job_id>.timeout-minutes`

請參閱[GitHub Actions的工作流語法](https://docs.github.com/zh/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idtimeout-minutes)。

Gitea Actions目前不支援此功能。

### `jobs.<job_id>.continue-on-error`

請參閱[GitHub Actions的工作流語法](https://docs.github.com/zh/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idcontinue-on-error)。

Gitea Actions目前不支援此功能。

### `jobs.<job_id>.environment`

請參閱[GitHub Actions的工作流語法](https://docs.github.com/zh/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idenvironment)。

Gitea Actions 目前不支援此功能。

### 複雜的`runs-on`

請參閱[GitHub Actions的工作流語法](https://docs.github.com/zh/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idruns-on)。

Gitea Actions目前只支援`runs-on: xyz`或`runs-on: [xyz]`。

### `hashFiles`表達式

請參閱[表達式](https://docs.github.com/en/actions/learn-github-actions/expressions#hashfiles)。

Gitea Actions目前不支援此功能，如果使用它，結果將始終為空字符串。

作為解決方法，您可以使用[go-hashfiles](https://gitea.com/actions/go-hashfiles)。

## 缺失的功能

### 問題匹配器

問題匹配器是一種掃描Actions輸出以查找指定正則表達式模式並在使用者介面中突出顯示該資訊的方法。
請參閱[問題匹配器](https://github.com/actions/toolkit/blob/main/docs/problem-matchers.md)。

Gitea Actions目前不支援此功能。

### 為錯誤建立註釋

請參閱[為錯誤建立註釋](https://docs.github.com/zh/actions/using-workflows/workflow-commands-for-github-actions#example-creating-an-annotation-for-an-error)。

Gitea Actions目前不支援此功能。

### 表達式

對於 [表達式](https://docs.github.com/en/actions/learn-github-actions/expressions), 當前僅 [`always()`](https://docs.github.com/en/actions/learn-github-actions/expressions#always) 被支援。

## 缺失的UI功能

### 預處理和後處理步驟

預處理和後處理步驟在Job日誌使用者介面中沒有自己的使用者介面。

### 服務步驟

服務步驟在Job日誌使用者介面中沒有自己的使用者介面。

## 不一樣的行為

### 下載Actions

當 `[actions].DEFAULT_ACTIONS_URL` 保持預設值為 `github` 時，Gitea將會從 https://github.com 下載相對路徑的actions。比如：
如果你使用 `uses: actions/checkout@v4`，Gitea將會從 https://github.com/actions/checkout.git 下載這個 actions 專案。
如果你想要從另外一個 Git服務下載actions，你只需要使用絕對URL `uses: https://gitea.com/actions/checkout@v4` 來下載。

如果你的 Gitea 實例是部署在一個互聯網限制的網路中，也可以使用絕對地址來下載 actions。你也可以將設定項修改為 `[actions].DEFAULT_ACTIONS_URL = self`。這樣所有的相對路徑的actions引用，將不再會從 github.com 去下載，而會從這個 Gitea 實例自己的存放庫中去下載。例如： `uses: actions/checkout@v4` 將會從 `[server].ROOT_URL`/actions/checkout.git 這個地址去下載 actions。

設定`[actions].DEFAULT_ACTIONS_URL`進行設定。請參閱[設定備忘單](../../administration/config-cheat-sheet.md#actions-actions)。

### 上下文可用性

不檢查上下文可用性，因此您可以在更多地方使用env上下文。
請參閱[上下文可用性](https://docs.github.com/en/actions/learn-github-actions/contexts#context-availability)。
