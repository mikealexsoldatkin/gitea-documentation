---
date: "2023-05-24T15:00:00+08:00"
slug: "design"
sidebar_position: 40
---

# Gitea Actions設計

Gitea Actions由多個元件組成。本文件將對它們進行逐個描述。

## Act

[nektos/act](https://github.com/nektos/act) 專案是一個優秀的工具，允許你在本地運行GitHub Actions。
我們受到了它的啟發，並思考它是否可能為Gitea運行Actions。

然而，儘管[nektos/act](https://github.com/nektos/act)被設計為一個命令行工具，但我們實際上需要的是一個專為Gitea修改的Go庫。
因此，我們在[gitea/act](https://gitea.com/gitea/act)基礎上進行了分叉。

這是一個軟分叉，將定期跟進上游。
雖然添加了一些自訂提交，但我們會盡力避免對原始程式碼進行太多更改。

分叉的 act 只是Gitea特定用途的橋接或適配器。
還添加了一些額外的提交，例如：

- 將執行日誌輸出到日誌記錄器鉤子，以便報告給Gitea
- 禁用 GraphQL URL，因為Gitea不支援它
- 每個Job啟動一個新的容器，而不是重複使用，以確保隔離性。

這些修改沒有理由合併到上游。
如果使用者只想在本地運行可信的Actions，它們是沒有意義的。

然而，將來可能會出現重疊，例如兩個專案都需要的必要錯誤修復或新功能。
在這些情況下，我們將向上遊存放庫貢獻變更。

## act runner

Gitea的Runner被稱為act runner，因為它基於act。

與其他CIRunner一樣，我們將其設計為Gitea的外部部分，這意味著它應該在與Gitea不同的伺服器上運行。

為了確保Runner連接到正確的Gitea實例，我們需要使用令牌註冊它。
此外，Runner通過聲明自己的標籤向Gitea報告它可以運行的Job類型。

之前，我們提到工作流文件中的 `runs-on: ubuntu-latest` 表示該Job將在具有`ubuntu-latest`標籤的Runner上運行。
但是，Runner如何知道要運行 `ubuntu-latest`？答案在於將標籤映射到環境。
這就是為什麼在註冊過程中添加自訂標籤時，需要輸入一些複雜內容，比如`my_custom_label:docker://centos:7`。
這意味著Runner可以接受需要在`my_custom_label`上運行的Job，並通過使用`centos:7`鏡像的Docker容器來運行它。

然而，Docker不是唯一的選擇。
act 也支援直接在主機上運行Job。
這是通過像`linux_arm:host`這樣的標籤實現的。
這個標籤表示Runner可以接受需要在`linux_arm`上運行的Job，並直接在主機上運行它們。

標籤的設計遵循格式`label[:schema[:args]]`。
如果省略了schema，則預設為`host`。

因此，

- `my_custom_label:docker://node:18`：使用`node:18 Docker`鏡像運行帶有`my_custom_label`標籤的Job。
- `my_custom_label:host`：在主機上直接運行帶有`my_custom_label`標籤的Job。
- `my_custom_label`：等同於`my_custom_label:host`。
- `my_custom_label:vm:ubuntu-latest`：（僅為範例，未實現）使用帶有`ubuntu-latest` ISO的虛擬機運行帶有`my_custom_label`標籤的Job。

## 通信協議

由於act runner是Gitea的獨立部分，我們需要一種協議讓Runner與Gitea實例進行通信。
然而，我們不認為讓Gitea監聽一個新端口是個好主意。
相反，我們希望重用HTTP端口，這意味著我們需要一個與HTTP相容的協議。
因此，我們選擇使用基於HTTP的gRPC。

我們使用[actions-proto-def](https://gitea.com/gitea/actions-proto-def) 和 [actions-proto-go](https://gitea.com/gitea/actions-proto-go) 進行連接。
有關 gRPC 的更多資訊，請前往[其官方網站](https://grpc.io/)。

## 網路架構

讓我們來看一下整體的網路架構。
這將幫助您解決一些問題，並解釋為什麼使用迴環地址註冊Runner是個不好的主意。

![network](/images/usage/actions/network.png)

圖片中標記了四個網路連接，並且箭頭的方向表示建立連接的方向。

### 連接 1，act runner到Gitea實例

act runner 必須能夠連接到Gitea以接收任務並發送執行結果回來。

### 連接 2，Job容器到Gitea實例

即使Job容器位於同一臺機器上，它們的網路命名空間與Runner不同。
舉個例子，如果工作流中包含 `actions/checkout@v4`，Job容器需要連接到Gitea來獲取程式碼。
獲取程式碼並不總是運行某些Job所必需的，但在大多數情況下是必需的。

如果您使用迴環地址註冊Runner，當Runner與Gitea在同一臺機器上時，Runner可以連接到Gitea。
然而，如果Job容器嘗試從本地主機獲取程式碼，它將失敗，因為Gitea不在同一個容器中。

### 連接 3，act runner到互聯網

當您使用諸如 `actions/checkout@v4` 的一些Actions時，act runner下載的是腳本，而不是Job容器。
預設情況下，它從[github.com](http://github.com/)下載，因此需要訪問互聯網。如果您設定的是 self，
那麼預設將從您的當前Gitea實例下載，那麼此步驟不需要連接到互聯網。
它還預設從Docker Hub下載一些Docker鏡像，這也需要互聯網訪問。

然而，互聯網訪問並不是絕對必需的。
您可以設定您的Gitea實例從您的內部網路設施中獲取 Actions 或鏡像。

實際上，您的Gitea實例可以同時充當 Actions 市場和鏡像註冊表。
您可以將GitHub上的Actions存放庫鏡像到您的Gitea實例，並將其用作普通Actions。
而 [Gitea 容器註冊表](usage/packages/container.md) 可用作Docker鏡像註冊表。

### 連接 4，Job容器到互聯網

當使用諸如`actions/setup-go@v5`的Actions時，可能需要從互聯網下載資源，以設定Job容器中的Go語言環境。
因此，成功完成這些Actions需要訪問互聯網。

然而，這也是可選的。
您可以使用自訂的Actions來避免依賴互聯網訪問，或者可以使用已安裝所有依賴項的打包的Docker鏡像來運行Job。

## 總結

使用Gitea Actions只需要確保Runner能夠連接到Gitea實例。
互聯網訪問是可選的，但如果沒有互聯網訪問，將需要額外的工作。
換句話說：當Runner能夠自行查詢互聯網時，它的工作效果最好，但您不需要將其暴露給互聯網（無論是單向還是雙向）。

如果您在使用Gitea Actions時遇到任何網路問題，希望上面的圖片能夠幫助您進行故障排除。
