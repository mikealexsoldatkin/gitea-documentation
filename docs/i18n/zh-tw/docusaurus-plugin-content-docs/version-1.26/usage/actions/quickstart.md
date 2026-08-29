---
date: "2023-05-24T15:00:00+08:00"
slug: "quickstart"
sidebar_position: 10
---

# 快速入門

本頁面將指導您使用Gitea Actions的過程。

## 設定Gitea

首先，您需要一個Gitea實例。
您可以按照[文件](installation/from-package.md) 來設定一個新實例或升級現有實例。
無論您如何安裝或運行Gitea，只要版本號是1.19.0或更高即可。

從1.21.0開始，預設情況下，Actions是啟用的。如果您正在使用1.21.0之前的版本，您需要將以下內容添加到設定文件中以啟用它：

```ini
[actions]
ENABLED=true
```

如果您想了解更多資訊或在設定過程中遇到任何問題，請參考[設定速查表](../../administration/config-cheat-sheet.md#actions-actions)。

### 設定Runner

Gitea Actions需要[act runner](https://gitea.com/gitea/act_runner) 來運行Job。
為了避免消耗過多資源並影響Gitea實例，建議您在與Gitea實例分開的機器上啟動Runner。

您可以使用[預構建的二進制文件](http://dl.gitea.com/act_runner)或[容器鏡像](https://hub.docker.com/r/gitea/act_runner/tags)來設定Runner。

在進一步操作之前，建議您先使用預構建的二進制文件以命令行方式運行它，以確保它與您的環境相容，尤其是如果您在本地主機上運行Runner。
如果出現問題，這樣調試起來會更容易。

該Runner可以在隔離的Docker容器中運行Job，因此您需要確保已安裝Docker並且Docker守護進程正在運行。
雖然這不是嚴格必需的，因為Runner也可以直接在主機上運行Job，這取決於您的設定方式。
然而，建議使用Docker運行Job，因為它更安全且更易於管理。

在運行Runner之前，您需要使用以下命令將其註冊到Gitea實例中：

```bash
./act_runner register --no-interactive --instance <instance> --token <token>
```

需要兩個必需的參數：`instance` 和 `token`。

`instance`是您的Gitea實例的地址，如`http://192.168.8.8:3000`或`https://gitea.com`。
Runner和Job容器（由Runner啟動以執行Job）將連接到此地址。
這意味著它可能與用於Web訪問的`ROOT_URL`不同。
使用迴環地址（例如 `127.0.0.1` 或 `localhost`）是一個不好的選擇。
如果不確定使用哪個地址，通常選擇局域網地址即可。

`token` 用於身份驗證和標識，例如 `P2U1U0oB4XaRCi8azcngmPCLbRpUGapalhmddh23`。
它只能使用一次，並且不能用於註冊多個Runner。
您可以從以下位置獲取不同級別的`token`,從而建立出相應級別的`runner`

- 實例級別：管理員設定頁面，例如 `<your_gitea.com>/admin/actions/runners`。
- 組織級別：組織設定頁面，例如 `<your_gitea.com>/<org>/settings/actions/runners`。
- 儲存庫級別：儲存庫設定頁面，例如 `<your_gitea.com>/<owner>/<repo>/settings/actions/runners`。

![register runner](/images/usage/actions/register-runner.png)

註冊後，當前目錄中將出現一個名為 `.runner` 的新文件，該文件儲存了註冊資訊。
請不要手動編輯該文件。
如果該文件丟失或損壞，只需刪除它然後重新註冊即可。

最後，是時候啟動Runner了：

```bash
./act_runner daemon
```

您可以在管理頁面上看到新的Runner：

![view runner](/images/usage/actions/view-runner.png)

您可以透過訪問[act runner](act-runner) 獲取更多資訊。

### 使用Actions

即使對於啟用了Gitea實例的Actions，儲存庫仍預設禁用Actions。

要啟用它，請轉到儲存庫的設定頁面，例如`your_gitea.com/<owner>/repo/settings`，然後啟用`Enable Repository Actions`。

![enable actions](/images/usage/actions/enable-actions.png)

接下來的步驟可能相當複雜。
您需要學習Actions的[工作流語法](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)，並編寫您想要的工作流文件。

不過，我們可以從一個簡單的演示開始：

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

您可以將上述範例上傳為一個以`.yaml`擴展名的文件，放在儲存庫的`.gitea/workflows/`目錄中，例如`.gitea/workflows/demo.yaml`。
您可能會注意到，這與[GitHub Actions的快速入門](https://docs.github.com/en/actions/quickstart)非常相似。
這是因為Gitea Actions在儘可能相容GitHub Actions的基礎上進行設計。

請注意，演示文件中包含一些表情符號。
請確保您的資料庫支援它們，特別是在使用MySQL時。
如果字符集不是`utf8mb4`，將出現錯誤，例如`Error 1366 (HY000): Incorrect string value: '\\xF0\\x9F\\x8E\\x89 T...' for column 'name' at row 1`。
有關更多資訊，請參閱[資料庫準備工作](../../installation/database-preparation.md#mysqlmariadb)。

或者，您可以從演示文件中刪除所有表情符號，然後再嘗試一次。

`on: [push]` 這一行表示當您向該儲存庫推送提交時，工作流將被觸發。
然而，當您上傳 YAML 文件時，它也會推送一個提交，所以您應該在"Actions"標籤中看到一個新的任務。

![view job](/images/usage/actions/view-job.png)

做得好！您已成功開始使用Actions。
