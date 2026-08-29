---
date: "2023-05-24T15:00:00+08:00"
slug: "faq"
sidebar_position: 100
---

# Gitea Actions常見問題解答

本頁面包含一些關於Gitea Actions的常見問題和答案。

## 是否可以在我的實例中預設禁用新儲存庫的Actions？

是的，當您為實例啟用Actions時，您可以選擇預設啟用actions單元以適用於所有新儲存庫。

```ini
[repository]
; 去掉 repo.actions 將不會為新倉庫自動啟用actions
DEFAULT_REPO_UNITS = ...,repo.actions
```

## 在工作流文件中應該使用`${{ github.xyz }}`還是`${{ gitea.xyz }}`？

您可以使用`github.xyz`，Gitea將正常工作。
如前所述，Gitea Actions的設計是與GitHub Actions相容的。
然而，我們建議在工作流文件中使用`gitea.xyz`，以防止在工作流文件中出現不同類型的密鑰（因為您在Gitea上使用此工作流，而不是GitHub）。
不過，這完全是可選的，因為目前這兩個選項的效果是相同的。

## 使用`actions/checkout@v4`等Actions時，Job容器會從何處下載腳本？

GitHub 上有成千上萬個 [Actions 腳本](https://github.com/marketplace?type=actions)。
當您編寫 `uses: actions/checkout@v4` 時，它預設會從 [github.com/actions/checkout](https://github.com/actions/checkout) 下載腳本。
那如果您想使用一些託管在其它平台上的腳本呢，比如在 gitea.com 上的？

好消息是，您可以指定要從任何位置使用Actions的URL前綴。
這是Gitea Actions中的額外語法。
例如：

- `uses: https://gitea.com/xxx/xxx@xxx`
- `uses: https://github.com/xxx/xxx@xxx`
- `uses: http://your_gitea_instance.com/xxx@xxx`

注意，`https://`或`http://`前綴是必需的！

這是與 GitHub Actions 的一個區別，GitHub Actions 只允許使用託管在 GitHub 上的 actions 腳本。
但使用者理應擁有權利去靈活決定如何運行 Actions。

另外，如果您希望您的 Runner 預設從您自己的 Gitea 實例下載 Actions，可以透過設定 `[actions].DEFAULT_ACTIONS_URL`進行設定。
參見[設定速查表](../../administration/config-cheat-sheet.md#actions-actions)。

## 如何限制Runner的權限？

Runner僅具有連接到您的Gitea實例的權限。
當任何Runner接收到要運行的Job時，它將臨時獲得與Job關聯的儲存庫的有限權限。
如果您想為Runner提供更多權限，允許它訪問更多私有儲存庫或外部系統，您可以向其傳遞[密鑰](usage/actions/secrets.md)。

對於 Actions 的細粒度權限控制是一項複雜的工作。
在未來，我們將添加更多選項以使Gitea更可設定，例如允許對儲存庫進行更多寫訪問或對同一組織中的所有儲存庫進行讀訪問。

## 如何避免被黑客攻擊？

有兩種可能的攻擊類型：未知的Runner竊取您的儲存庫中的程式碼或密鑰，或惡意腳本控制您的Runner。

避免前者意味著不允許您不認識的人為您的儲存庫、組織或實例註冊Runner。

後者要複雜一些。
如果您為公司使用私有的Gitea實例，您可能不需要擔心安全問題，因為您信任您的同事，並且可以追究他們的責任。

對於公共實例，情況略有不同。
以下是我們在 [gitea.com](http://gitea.com/)上的做法：

- 我們僅為 "gitea" 組織註冊Runner，因此我們的Runner不會執行來自其他儲存庫的Job。
- 我們的Runner始終在隔離容器中運行Job。雖然可以直接在主機上進行這樣的操作，但出於安全考慮，我們選擇不這樣做。
- 對於 fork 的拉取請求，需要獲得批准才能運行Actions。參見[#22803](https://github.com/go-gitea/gitea/pull/22803)。
- 如果有人在[gitea.com](http://gitea.com/)為其儲存庫或組織註冊自己的Runner，我們不會反對，只是不會在我們的組織中使用它。然而，他們應該注意確保該Runner不被他們不認識的其他使用者使用。

## act runner支援哪些操作系統？

它在Linux、macOS和Windows上運行良好。
雖然理論上支援其他操作系統，但需要進一步測試。

需要注意的一點是，如果選擇直接在主機上運行Job而不是在Job容器中運行，操作系統之間的環境差異可能會導致意外的失敗。

例如，在大多數情況下，Windows上沒有可用的bash，而act嘗試預設使用bash運行腳本。
因此，您需要在工作流文件中將預設shell指定為`powershell`，參考[defaults.run](https://docs.github.com/zh/actions/using-workflows/workflow-syntax-for-github-actions#defaultsrun)。

```yaml
defaults:
  run:
    shell: powershell
```

## 為什麼選擇GitHub Actions？為什麼不選擇與GitLab CI/CD相容的工具？

[@lunny](https://gitea.com/lunny)在實現Actions的[問題](https://github.com/go-gitea/gitea/issues/13539)中已經解釋過這個問題。
此外，Actions不僅是一個CI/CD 系統，還是一個自動化工具。

在開源世界中，已經有許多[市場上的Actions](https://github.com/marketplace?type=actions)實現了。
能夠重用它們是令人興奮的。

## 如果它在多個標籤上運行，例如 `runs-on: [label_a, label_b]`，會發生什麼？

這是有效的語法。
它意味著它應該在具有`label_a` **和** `label_b`標籤的Runner上運行，參考[GitHub Actions的工作流語法](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idruns-on)。
不幸的是，act runner 並不支援這種方式。
如上所述，我們將標籤映射到環境：

- `ubuntu` → `ubuntu:22.04`
- `centos` → `centos:8`

但我們需要將標籤組映射到環境，例如：

- `[ubuntu]` → `ubuntu:22.04`
- `[with-gpu]` → `linux:with-gpu`
- `[ubuntu, with-gpu]` → `ubuntu:22.04_with-gpu`

我們還需要重新設計任務分配給Runner的方式。
具有`ubuntu`、`centos`或`with-gpu`的Runner並不一定表示它可以接受`[centos, with-gpu]`的Job。
因此，Runner應該通知Gitea實例它只能接受具有 `[ubuntu]`、`[centos]`、`[with-gpu]` 和 `[ubuntu, with-gpu]`的Job。
這不是一個技術問題，只是在早期設計中被忽視了。
參見[runtime.go#L65](https://gitea.com/gitea/act_runner/src/commit/90b8cc6a7a48f45cc28b5ef9660ebf4061fcb336/runtime/runtime.go#L65)。

目前，act runner嘗試匹配標籤中的每一個，並使用找到的第一個匹配項。

## 代理標籤和自訂標籤對於Runner有什麼區別？

![labels](/images/usage/actions/labels.png)

代理標籤是由Runner在註冊過程中向Gitea實例報告的。
而自訂標籤則是由Gitea的管理員或組織或儲存庫的所有者手動添加的（取決於Runner所屬的級別）。

然而，目前這方面的設計還有待改進，因為它目前存在一些不完善之處。
您可以向已註冊的Runner添加自訂標籤，比如 `centos`，這意味著該Runner將接收具有`runs-on: centos`的Job。
然而，Runner可能不知道要使用哪個環境來執行該標籤，導致它使用預設鏡像或導致邏輯死衚衕。
這個預設值可能與使用者的期望不符。
參見[runtime.go#L71](https://gitea.com/gitea/act_runner/src/commit/90b8cc6a7a48f45cc28b5ef9660ebf4061fcb336/runtime/runtime.go#L71)。

與此同時，如果您想更改Runner的標籤，我們建議您重新註冊Runner。

## Gitea Actions runner會有更多的實現嗎？

雖然我們希望提供更多的選擇，但由於我們有限的人力資源，act runner將是唯一受支援的官方Runner。
然而，無論您如何決定，Gitea 和act runner都是完全開源的，所以任何人都可以建立一個新的/更好的實現。
我們支援您的選擇，無論您如何決定。
如果您選擇分支act runner來建立自己的版本，請在您認為您的更改對其他人也有幫助的情況下貢獻這些更改。

## Gitea 支援哪些工作流觸發事件？

表格中列出的所有事件都是支援的，並且與 GitHub 相容。
對於僅 GitHub 支援的事件，請參閱 GitHub 的[文件](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)。

| 觸發事件                    | 活動類型                                                                                                                 |
|-----------------------------|--------------------------------------------------------------------------------------------------------------------------|
| create                      | 不適用                                                                                                                   |
| delete                      | 不適用                                                                                                                   |
| fork                        | 不適用                                                                                                                   |
| gollum                      | 不適用                                                                                                                   |
| push                        | 不適用                                                                                                                   |
| issues                      | `opened`, `edited`, `closed`, `reopened`, `assigned`, `unassigned`, `milestoned`, `demilestoned`, `labeled`, `unlabeled` |
| issue_comment               | `created`, `edited`, `deleted`                                                                                           |
| pull_request                | `opened`, `edited`, `closed`, `reopened`, `assigned`, `unassigned`, `synchronize`, `labeled`, `unlabeled`                |
| pull_request_review         | `submitted`, `edited`                                                                                                    |
| pull_request_review_comment | `created`, `edited`                                                                                                      |
| release                     | `published`, `edited`                                                                                                    |
| registry_package            | `published`                                                                                                              |

> 對於 `pull_request` 事件，在 [GitHub Actions](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#pull_request) 中 `ref` 是 `refs/pull/:prNumber/merge`，它指向這個拉取請求合併提交的一個預覽。但是 Gitea 沒有這種 reference。
> 因此，Gitea Actions 中 `ref` 是 `refs/pull/:prNumber/head`，它指向這個拉取請求的頭分支而不是合併提交的預覽。
