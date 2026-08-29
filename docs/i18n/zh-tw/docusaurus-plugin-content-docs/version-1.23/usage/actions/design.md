---
date: "2023-04-27T15:00:00+08:00"
slug: "design"
sidebar_position: 140
---

# Gitea Actions 的設計

Gitea Actions 有多個元件。本文件將分別描述它們。

## Act

[nektos/act](https://github.com/nektos/act) 專案是一個出色的工具，允許您在本地運行 GitHub Actions。
我們受此啟發，想知道是否可以為 Gitea 運行操作。

然而，雖然 [nektos/act](https://github.com/nektos/act) 被設計為命令行工具，但我們實際上需要的是一個專門為 Gitea 進行修改的 Go 庫。
所以我們將其分叉為 [gitea/act](https://gitea.com/gitea/act)。

這是一個軟分叉，將定期跟隨上游。
儘管添加了一些自訂提交，但我們將盡量避免更改太多原始程式碼。

分叉的 act 只是 Gitea 特定用法的 shim 或適配器。
已經進行了一些額外的提交，例如：

- 將執行日誌輸出到 logger 鉤子，以便可以報告給 Gitea
- 禁用 GraphQL URL，因為 Gitea 不支援它
- 為每個作業啟動一個新容器，而不是重用，以確保隔離。

這些修改沒有理由合併到上游。
如果使用者只想在本地運行受信任的操作，這些修改沒有意義。

然而，未來可能會有重疊，例如兩個專案都需要的錯誤修復或新功能。
在這些情況下，我們將把更改貢獻回上游儲存庫。

## Act runner

Gitea 的 runner 被稱為 act runner，因為它基於 act。

像其他 CI runner 一樣，我們將其設計為 Gitea 的外部部分，這意味著它應該在與 Gitea 不同的伺服器上運行。

為了確保 runner 連接到正確的 Gitea 實例，我們需要使用令牌註冊它。
此外，runner 將向 Gitea 介紹自己並通過報告其標籤來聲明它可以運行的作業類型。

前面提到過，工作流程文件中的 `runs-on: ubuntu-latest` 意味著作業將在具有 `ubuntu-latest` 標籤的 runner 上運行。
但是 runner 如何知道運行 `ubuntu-latest`？答案在於將標籤映射到環境。
這就是為什麼在註冊期間添加自訂標籤時，您需要輸入一些複雜的內容，如 `my_custom_label:docker://centos:7`。
這意味著 runner 可以接受需要在 `my_custom_label` 上運行的作業，並將其通過 docker 容器運行，映像為 `centos:7`。

然而，docker 並不是唯一的選擇。
act 還支援直接在主機上運行作業。
這是通過標籤如 `linux_arm:host` 實現的。
這個標籤表示 runner 可以接受需要在 `linux_arm` 上運行的作業，並直接在主機上運行它。

標籤的設計遵循格式 `label[:schema[:args]]`。
如果省略 schema，則預設為 `host`。
所以，

- `my_custom_label:docker://node:18`: 使用 `node:18` Docker 映像運行標籤為 `my_custom_label` 的作業。
- `my_custom_label:host`: 直接在主機上運行標籤為 `my_custom_label` 的作業。
- `my_custom_label`: 與 `my_custom_label:host` 相同。
- `my_custom_label:vm:ubuntu-latest`: （僅範例，未實現）使用 `ubuntu-latest` ISO 的虛擬機運行標籤為 `my_custom_label` 的作業。

## 通信協議

由於 act runner 是 Gitea 的獨立部分，我們需要一個協議來讓 runner 與 Gitea 實例通信。
然而，我們認為讓 Gitea 監聽一個新端口不是一個好主意。
相反，我們希望重用 HTTP 端口，這意味著我們需要一個與 HTTP 相容的協議。
我們選擇使用 gRPC over HTTP。

我們使用 [actions-proto-def](https://gitea.com/gitea/actions-proto-def) 和 [actions-proto-go](https://gitea.com/gitea/actions-proto-go) 來將它們連接起來。
有關 gRPC 的更多資訊可以在 [其網站](https://grpc.io/) 上找到。

## 網路架構

讓我們來看看整體網路架構。
這將幫助您排除一些問題，並解釋為什麼用 Gitea 實例的回環地址註冊 runner 是個壞主意。

![network](/images/usage/actions/network.png)

圖片中標記了四個網路連接，箭頭的方向表示建立連接的方向。

### 連接 1，act runner 到 Gitea 實例

act runner 必須能夠連接到 Gitea 以接收任務並發送回執行結果。

### 連接 2，作業容器到 Gitea 實例

作業容器與 runner 有不同的網路命名空間，即使它們在同一臺機器上。
如果工作流程中有 `actions/checkout@v4`，它們需要連接到 Gitea 以獲取程式碼。
運行某些作業並不總是需要獲取程式碼，但在大多數情況下是必需的。

如果您使用回環地址註冊 runner，當它在同一臺機器上時，runner 可以連接到 Gitea。
但是，如果作業容器嘗試從 localhost 獲取程式碼，則會失敗，因為 Gitea 不在同一容器中。

### 連接 3，act runner 到互聯網

當您使用一些操作如 `actions/checkout@v4` 時，act runner 會下載腳本，而不是作業容器。
預設情況下，它從 [github.com](http://github.com/) 下載，因此需要訪問互聯網。如果您將 `DEFAULT_ACTIONS_URL` 設定為 `self`，則它將預設從您的 Gitea 實例下載。然後在下載操作本身時不會連接到互聯網。
它還預設從 Docker Hub 下載一些 docker 映像，這也需要訪問互聯網。

然而，訪問互聯網並不是絕對必要的。
您可以設定您的 Gitea 實例從您的內聯設施中獲取操作或映像。

事實上，您的 Gitea 實例可以同時作為操作市場和映像註冊表。
您可以將操作儲存庫從 GitHub 鏡像到您的 Gitea 實例，並正常使用它們。
而 [Gitea 容器註冊表](usage/packages/container.md) 可以用作 Docker 映像註冊表。

### 連接 4，作業容器到互聯網

當使用如 `actions/setup-go@v5` 的操作時，可能需要從互聯網下載資源以在作業容器中設定 Go 語言環境。
因此，訪問互聯網是這些操作成功完成所必需的。

然而，這也是可選的。
您可以使用自己的自訂操作來避免依賴互聯網訪問，或者您可以使用打包的 Docker 映像來運行已安裝所有依賴項的作業。

## 總結

使用 Gitea Actions 只需要確保 runner 可以連接到 Gitea 實例。
訪問互聯網是可選的，但沒有它將需要一些額外的工作。
換句話說：runner 最好能夠自己查詢互聯網，但您不需要將其暴露在互聯網上（無論是入站還是出站）。

如果您在使用 Gitea Actions 時遇到任何網路問題，希望上圖可以幫助您排除它們。
