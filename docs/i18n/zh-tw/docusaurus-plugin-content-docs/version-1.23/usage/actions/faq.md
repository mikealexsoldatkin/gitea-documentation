---
date: "2023-04-27T15:00:00+08:00"
slug: "faq"
sidebar_position: 200
---

# 常見問題

這頁包含了一些關於 Gitea Actions 的常見問題和解答。

## 是否可以預設禁用新儲存庫的 Actions？

可以，當你為實例啟用 Actions 時，你可以選擇預設為所有新儲存庫啟用 `actions` 單元。

```ini
[repository]
; 移除 repo.actions 將不會為新創建的倉庫啟用 actions。
DEFAULT_REPO_UNITS = ...,repo.actions
```

## 我們應該在工作流程文件中使用 `${{ github.xyz }}` 還是 `${{ gitea.xyz }}`？

你可以使用 `github.xyz`，Gitea 也能正常運作。
如前所述，Gitea Actions 設計上與 GitHub Actions 相容。
然而，我們建議使用 `gitea.xyz`，以防 Gitea 添加了 GitHub 沒有的功能，避免在工作流程文件中出現不同種類的 secrets（而且你是在 Gitea 上使用這個工作流程，而不是 GitHub）。
不過，這完全是可選的，因為目前兩者的效果相同。

## 使用 `actions/checkout@v4` 等 actions 時，runner 會下載腳本到哪裡？

在 GitHub 上有成千上萬的 [actions 腳本](https://github.com/marketplace?type=actions)，當你寫 `uses: actions/checkout@v4` 時，它會預設從 [github.com/actions/checkout](http://github.com/actions/checkout) 下載腳本。
但如果你想從其他地方（如 gitea.com）而不是 GitHub 使用 actions 怎麼辦？

好消息是你可以指定 URL 前綴來從任何地方使用 actions。
這是 Gitea Actions 的一個額外語法。
例如：

- `uses: https://gitea.com/xxx/xxx@xxx`
- `uses: https://github.com/xxx/xxx@xxx`
- `uses: http://your_gitea_instance.com/xxx@xxx`

注意，`https://` 或 `http://` 前綴是必要的！

這是與 GitHub Actions 的一個區別，後者僅支援來自 GitHub 的 actions 腳本。
但這應該允許使用者在運行 Actions 時有更多的靈活性。

另外，如果你希望你的 runners 預設從你自己的 Gitea 實例下載 actions，你可以透過設定 `[actions].DEFAULT_ACTIONS_URL` 來設定。
參見 [設定備忘單](../../administration/config-cheat-sheet.md)。

## 如何限制 runners 的權限？

Runners 只具有連接到你的 Gitea 實例的權限。
當任何 runner 接收到一個要運行的任務時，它將臨時獲得與該任務相關的儲存庫的有限權限。
如果你想給 runner 更多的權限，允許它訪問更多的私有儲存庫或外部系統，你可以傳遞 [secrets](usage/actions/secrets.md) 給它。

對 Actions 進行精細的權限控制是一項複雜的工作。
未來，我們將為 Gitea 添加更多選項，使其更具可設定性，例如允許更多的寫入訪問儲存庫或讀取同一組織中所有儲存庫的存取權限。

## 如何避免被黑客攻擊？

有兩種類型的可能攻擊：未知的 runner 竊取你的儲存庫中的程式碼或 secrets，或惡意腳本控制你的 runner。

避免前者意味著不允許你不認識的人為你的儲存庫、組織或實例註冊 runners。

後者則有點複雜。
如果你為你的公司使用私人 Gitea 實例，你可能不需要擔心安全問題，因為你信任你的同事並且可以追究他們的責任。

對於公共實例，情況有點不同。
以下是我們在 [gitea.com](http://gitea.com/) 上的做法：

- 我們只為 "gitea" 組織註冊 runners，因此我們的 runners 不會執行來自其他儲存庫的任務。
- 我們的 runners 總是使用隔離的容器運行任務。雖然可以直接在主機上這樣做，但我們選擇不這樣做以提高安全性。
- 要運行 fork pull requests 的 actions，需要批准。參見 [#22803](https://github.com/go-gitea/gitea/pull/22803)。
- 如果有人在 [gitea.com](http://gitea.com/) 上為他們的儲存庫或組織註冊了他們自己的 runner，我們不反對，只是不會在我們的組織中使用它。然而，他們應該注意確保該 runner 不被他們不認識的其他使用者使用。

## act runner 支援哪些操作系統？

它在 Linux、macOS 和 Windows 上運行良好。
雖然理論上支援其他操作系統，但它們需要進一步測試。

需要注意的一點是，如果你選擇直接在主機上運行任務而不是在任務容器中，操作系統之間的環境差異可能會導致意外的失敗。

例如，bash 在大多數情況下在 Windows 上不可用，而 act 嘗試預設使用 bash 運行腳本。
因此，你需要在工作流程文件中指定 `powershell` 為預設 shell，參見 [defaults.run](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#defaultsrun)。

```yaml
defaults:
  run:
    shell: powershell
```

## 為什麼選擇 GitHub Actions？為什麼不選擇與 GitLab CI/CD 相容的東西？

[@lunny](https://gitea.com/lunny) 在 [實現 actions 的問題](https://github.com/go-gitea/gitea/issues/13539) 中解釋了這一點。
此外，Actions 不僅僅是一個 CI/CD 系統，還是一個自動化工具。

開源世界中還實現了許多 [marketplace actions](https://github.com/marketplace?type=actions)。
能夠重用它們是令人興奮的。

## 如果它在多個標籤上運行，例如 `runs-on: [label_a, label_b]` 會怎樣？

這是有效的語法。
這意味著它應該在具有 `label_a` **和** `label_b` 標籤的 runners 上運行，參見 [GitHub Actions 的工作流程語法](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idruns-on)。
不幸的是，act runner 不這樣工作。
如前所述，我們將標籤映射到環境：

- `ubuntu` → `ubuntu:22.04`
- `centos` → `centos:8`

但我們需要將標籤組映射到環境，例如：

- `[ubuntu]` → `ubuntu:22.04`
- `[with-gpu]` → `linux:with-gpu`
- `[ubuntu, with-gpu]` → `ubuntu:22.04_with-gpu`

我們還需要重新設計任務如何分配給 runners。
具有 `ubuntu`、`centos` 或 `with-gpu` 的 runner 並不一定表示它可以接受具有 `[centos, with-gpu]` 的任務。
因此，runner 應該通知 Gitea 實例它只能接受具有 `[ubuntu]`、`[centos]`、`[with-gpu]` 和 `[ubuntu, with-gpu]` 的任務。
這不是技術問題，只是在早期設計中被忽略了。
參見 [runtime.go#L65](https://gitea.com/gitea/act_runner/src/commit/90b8cc6a7a48f45cc28b5ef9660ebf4061fcb336/runtime/runtime.go#L65)。

目前，act runner 嘗試匹配標籤中的每個人並使用它找到的第一個匹配。

## runner 的代理標籤和自訂標籤有什麼區別？

![labels](/images/usage/actions/labels.png)

代理標籤是在註冊期間由 runner 向 Gitea 實例報告的。
另一方面，自訂標籤是由 Gitea 管理員或組織或儲存庫的所有者手動添加的（取決於 runner 的級別）。

然而，這裡的設計需要改進，因為它目前有一些粗糙的邊緣。
你可以向已註冊的 runner 添加自訂標籤，例如 `centos`，這意味著 runner 將接收具有 `runs-on: centos` 的任務。
然而，runner 可能不知道為這個標籤使用哪個環境，導致它使用預設映像或導致邏輯死衚衕。
這個預設值可能不符合使用者的期望。
參見 [runtime.go#L71](https://gitea.com/gitea/act_runner/src/commit/90b8cc6a7a48f45cc28b5ef9660ebf4061fcb336/runtime/runtime.go#L71)。

同時，我們建議你重新註冊你的 runner，如果你想更改它的標籤。

## Gitea Actions runner 會有更多的實現嗎？

雖然我們希望提供更多選擇，但我們有限的人力意味著 act runner 將是唯一官方支援的 runner。
然而，Gitea 和 act runner 都是完全開源的，所以任何人都可以建立一個新的/更好的實現。
無論你如何決定，我們都支援你的選擇。
如果你 fork 了 act runner 來建立你自己的版本：如果你能並且認為你的更改也會幫助其他人，請將更改貢獻回來。

## Gitea 支援哪些工作流程觸發事件？

所有列在此表中的事件都是支援的事件，並且與 GitHub 相容。
對於僅由 GitHub 支援的事件，請參見 GitHub 的 [文件](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)。

| 觸發事件                    | 活動類型                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| create                      | 不適用                                                                                                                   |
| delete                      | 不適用                                                                                                                   |
| fork                        | 不適用                                                                                                                   |
| gollum                      | 不適用                                                                                                                   |
| push                        | 不適用                                                                                                                   |
| issues                      | `opened`、`edited`、`closed`、`reopened`、`assigned`、`unassigned`、`milestoned`、`demilestoned`、`labeled`、`unlabeled` |
| issue_comment               | `created`、`edited`、`deleted`                                                                                           |
| pull_request                | `opened`、`edited`、`closed`、`reopened`、`assigned`、`unassigned`、`synchronize`、`labeled`、`unlabeled`                |
| pull_request_review         | `submitted`、`edited`                                                                                                    |
| pull_request_review_comment | `created`、`edited`                                                                                                      |
| release                     | `published`、`edited`                                                                                                    |
| registry_package            | `published`                                                                                                              |

> 對於 `pull_request` 事件，在 [GitHub Actions](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#pull_request) 中，`ref` 是 `refs/pull/:prNumber/merge`，這是合併提交預覽的引用。然而，Gitea 沒有這樣的引用。
> 因此，Gitea Actions 中的 `ref` 是 `refs/pull/:prNumber/head`，它指向 pull request 的 head，而不是合併提交的預覽。
