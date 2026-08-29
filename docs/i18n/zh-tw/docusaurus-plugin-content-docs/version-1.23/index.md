---
date: "2016-11-08T16:00:00+02:00"
slug: /
sidebar_position: 10
---

# 什麼是 Gitea？

Gitea 是一個無痛、自我託管的全方位軟體開發服務。它包括 Git 託管、程式碼審查、團隊協作、包註冊表和 CI/CD。它類似於 GitHub、Bitbucket 和 GitLab。

Gitea 最初是從 [Gogs](https://gogs.io) 分叉出來的，幾乎所有的程式碼都已經改變。請參閱 [Gitea 公告](https://blog.gitea.com/welcome-to-gitea/) 部落格文章以瞭解分叉的理由。

:::warning

Gitea 不會從上游發送或挑選提交，因此如果您從 Gogs 升級到 Gitea，無法保證它能正常工作。建議的方法是將儲存庫從 Gogs 遷移到 Gitea。

:::

## 目的

這個專案的目標是提供最簡單、最快速、最無痛的方式來設定自我託管的 Git 服務。

使用 Go，可以在 Go 支援的 **所有平台** 上跨平台獨立完成，包括 Linux、macOS 和 Windows，支援 x86、amd64、ARM 和 PowerPC 架構。
您可以使用 [在線演示](https://demo.gitea.com) 試用。

## 功能

- **程式碼託管**

  Gitea 支援建立和管理儲存庫、瀏覽提交歷史和程式碼檔案、審查和合併程式碼提交、管理協作者、處理分支等。它還支援許多常見的 Git 功能，如標籤、挑選、鉤子、整合協作工具等。

- **輕量且快速**

  Gitea 的設計目標之一是輕量且快速響應。與一些大型程式碼託管平台不同，它保持精簡，在速度方面表現良好，適合資源有限的伺服器環境。由於其輕量設計，Gitea 的資源消耗相對較低，在資源受限的環境中表現良好。

- **簡單部署和維護**

  它可以輕鬆部署在各種伺服器上，無需複雜的設定或依賴項。這使得個人開發者或小型團隊可以方便地設定和管理自己的 Git 服務。

- **安全性**

  Gitea 非常重視安全性，提供使用者權限管理、存取控制清單等功能，以確保程式碼和資料的安全。

- **程式碼審查**

  程式碼審查支援 Pull Request 工作流程和 AGit 工作流程。審查者可以在線瀏覽程式碼並提供審查意見或反饋。提交者可以接收審查意見並在線回應或修改程式碼。程式碼審查可以幫助個人和組織提高程式碼質量。

- **CI/CD**

  Gitea Actions 支援 CI/CD 功能，與 GitHub Actions 相容。使用者可以使用熟悉的 YAML 格式編寫工作流程，並重用各種現有的 Actions 外掛。Actions 外掛支援從任何 Git 網站下載。

- **專案管理**

  Gitea 通過列和問題跟蹤專案需求、功能和錯誤。問題支援分支、標籤、里程碑、分配、時間跟蹤、截止日期、依賴項等功能。

- **工件儲存庫**

  Gitea 支援超過 20 種不同類型的公共或私有套件管理，包括 Cargo、Chef、Composer、Conan、Conda、Container、Helm、Maven、npm、NuGet、Pub、PyPI、RubyGems、Vagrant 等。

- **開源社區支援**

  Gitea 是基於 MIT 許可證的開源專案。它擁有活躍的開源社區，不斷開發和改進平台。該專案還積極歡迎社區貢獻，確保更新和創新。

- **多語言支援**

  Gitea 提供多語言介面，滿足全球使用者需求，促進國際化和本地化。

有關更詳細的資訊，請參閱：https://docs.gitea.com/installation/comparison#general-features

## 系統要求

- Raspberry Pi 3 足夠運行 Gitea 以應對小型工作負載。
- 2 個 CPU 核心和 1GB RAM 通常足夠小型團隊/專案使用。
- Gitea 應該在 UNIX 類系統上的專用非 root 系統帳戶下運行。
  - 注意：Gitea 管理 `~/.ssh/authorized_keys` 文件。以普通使用者運行 Gitea 可能會破壞該使用者的登入能力。
- 需要 [Git](https://git-scm.com/) 2.0.0 或更高版本。
  - 如果啟用並且您的 Git 版本 >= 2.1.2，將提供 [Git Large File Storage](https://git-lfs.github.com/)。
  - 如果您的 Git 版本 >= 2.18，將自動啟用 Git 提交圖渲染。

## 瀏覽器支援

- 最新 2 個版本的 Chrome、Firefox、Safari 和 Edge
- Firefox ESR

## 元件

- Web 伺服器框架：[Chi](http://github.com/go-chi/chi)
- ORM：[XORM](https://xorm.io)
- UI 框架：
  - [jQuery](https://jquery.com)
  - [Fomantic UI](https://fomantic-ui.com)
  - [Vue3](https://vuejs.org)
  - 以及各種元件（請參閱 package.json）
- 編輯器：
  - [CodeMirror](https://codemirror.net)
  - [EasyMDE](https://github.com/Ionaru/easy-markdown-editor)
  - [Monaco Editor](https://microsoft.github.io/monaco-editor)
- 資料庫驅動：
  - [github.com/go-sql-driver/mysql](https://github.com/go-sql-driver/mysql)
  - [github.com/lib/pq](https://github.com/lib/pq)
  - [github.com/mattn/go-sqlite3](https://github.com/mattn/go-sqlite3)
  - [github.com/denisenkom/go-mssqldb](https://github.com/denisenkom/go-mssqldb)

## 整合支援

請前往 [Awesome Gitea](https://gitea.com/gitea/awesome-gitea/) 獲取更多第三方整合支援
