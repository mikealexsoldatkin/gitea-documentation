---
date: "2023-04-27T15:00:00+08:00"
slug: "quickstart"
sidebar_position: 10
---

# 快速開始

本頁將引導你使用 Gitea Actions 的過程。

## 設定 Gitea

首先，你需要一個 Gitea 實例。
你可以按照 [文件](installation/from-package.md) 設定一個新實例或升級現有實例。
無論你如何安裝或運行 Gitea，只要其版本是 1.19.0 或更高版本即可。

從 1.21.0 開始，Actions 預設啟用。如果你使用的是 1.21.0 之前的版本，你需要在設定文件中添加以下內容以啟用它：

```ini
[actions]
ENABLED=true
```

如果你想了解更多或在設定過程中遇到任何問題，請參考 [設定備忘單](../../administration/config-cheat-sheet.md)。

### 設定 runner

Gitea Actions 需要 [act runner](https://gitea.com/gitea/act_runner) 來運行作業。
為了避免消耗過多資源並影響 Gitea 實例，建議在與 Gitea 實例不同的機器上啟動 runners。

你可以使用 [預構建的二進位文件](http://dl.gitea.com/act_runner) 或 [docker 映像](https://hub.docker.com/r/gitea/act_runner/tags) 設定 runner。

在進一步操作之前，我們建議使用預構建的二進位文件作為命令行運行它，以確保它適用於你的環境，特別是如果你在本地主機上運行 runner。
如果出現問題，這樣也更容易調試。

runner 可以在隔離的 Docker 容器中運行作業，因此你需要確保已安裝 Docker 並且 Docker 守護進程正在運行。
雖然這不是絕對必要的，因為 runner 也可以直接在主機上運行作業，這取決於你如何設定它。
然而，建議使用 Docker 來運行作業，因為這樣更安全且更易於管理。

在運行 runner 之前，你應該首先使用以下命令將其註冊到你的 Gitea 實例：

```bash
./act_runner register --no-interactive --instance <instance> --token <token>
```

需要兩個參數，`instance` 和 `token`。

`instance` 指的是你的 Gitea 實例的地址，如 `http://192.168.8.8:3000` 或 `https://gitea.com`。
runner 和作業容器（由 runner 啟動以執行作業）將連接到此地址。
這意味著它可能與你的 Gitea 實例的 `ROOT_URL` 不同，後者是為網頁訪問設定的。
使用回環地址如 `127.0.0.1` 或 `localhost` 總是個壞主意。
如果你不確定使用哪個地址，通常 LAN 地址是正確的選擇。

`token` 用於身份驗證和識別，如 `P2U1U0oB4XaRCi8azcngmPCLbRpUGapalhmddh23`。
每個令牌可以用來建立多個 runners，直到使用重置鏈接替換為新令牌。
你可以從以下位置獲取不同級別的令牌來建立相應級別的 runners：

- 實例級別：管理員設定頁面，如 `<your_gitea.com>/admin/actions/runners`。
- 組織級別：組織設定頁面，如 `<your_gitea.com>/<org>/settings/actions/runners`。
- 儲存庫級別：儲存庫設定頁面，如 `<your_gitea.com>/<owner>/<repo>/settings/actions/runners`。

![register runner](/images/usage/actions/register-runner.png)

註冊後，一個名為 `.runner` 的新文件將出現在當前目錄中。
該文件儲存註冊資訊。
請不要手動編輯它。
如果該文件丟失或損壞，你可以簡單地刪除它並重新註冊。

最後，是時候啟動 runner 了：

```bash
./act_runner daemon
```

你可以在管理頁面中看到新的 runner：

![view runner](/images/usage/actions/view-runner.png)

你可以訪問 [Act runner](usage/actions/act-runner.md) 獲取更多資訊。

### 使用 Actions

即使 Gitea 實例啟用了 Actions，儲存庫仍然預設禁用 Actions。

要啟用它，請轉到儲存庫的設定頁面，如 `your_gitea.com/<owner>/repo/settings` 並啟用 `Enable Repository Actions`。

![enable actions](/images/usage/actions/enable-actions.png)

接下來的步驟可能相當複雜。
你需要學習 [工作流程語法](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions) 並編寫你想要的工作流程文件。

然而，我們可以從一個簡單的範例開始：

```yaml
name: Gitea Actions Demo
run-name: ${{ gitea.actor }} is testing out Gitea Actions 🚀
on: [push]

jobs:
  Explore-Gitea-Actions:
    runs-on: ubuntu-latest
    steps:
      - run: echo "🎉 The job was automatically triggered by a ${{ gitea.event_name }} event."
      - run: echo "🐧 This job is now running on a ${{ runner.os }} server hosted by Gitea!"
      - run: echo "🔎 The name of your branch is ${{ gitea.ref }} and your repository is ${{ gitea.repository }}."
      - name: Check out repository code
        uses: actions/checkout@v4
      - run: echo "💡 The ${{ gitea.repository }} repository has been cloned to the runner."
      - run: echo "🖥️ The workflow is now ready to test your code on the runner."
      - name: List files in the repository
        run: |
          ls ${{ gitea.workspace }}
      - run: echo "🍏 This job's status is ${{ job.status }}."
```

:::warning

某些 actions 可能無法在 SHA256 儲存庫中正常運行，或者當 Gitea 在子路徑上運行時。這包括 [actions/checkout](https://github.com/actions/checkout/issues/1843)。

:::

你可以將其作為擴展名為 `.yaml` 的文件上傳到儲存庫的 `.gitea/workflows/` 目錄中，例如 `.gitea/workflows/demo.yaml`。
你可能會注意到這與 [GitHub Actions 快速入門](https://docs.github.com/en/actions/quickstart) 非常相似。
那是因為 Gitea Actions 設計上盡可能與 GitHub Actions 相容。

請注意，範例文件中包含一些表情符號。
請確保你的資料庫支援它們，特別是當使用 MySQL 時。
如果字符集不是 `utf8mb4`，將會出現錯誤，如 `Error 1366 (HY000): Incorrect string value: '\\xF0\\x9F\\x8E\\x89 T...' for column 'name' at row 1`。
有關更多資訊，請參見 [資料庫準備](../../installation/database-preparation.md#mysqlmariadb)。

或者，你可以刪除範例文件中的所有表情符號並重試。

行 `on: [push]` 表示當你向此儲存庫推送提交時，工作流程將被觸發。
然而，當你上傳 YAML 文件時，它也會推送一個提交，因此你應該在 Actions 標籤中看到一個新任務。

![view job](/images/usage/actions/view-job.png)

幹得好！你已經成功開始使用 Actions。
