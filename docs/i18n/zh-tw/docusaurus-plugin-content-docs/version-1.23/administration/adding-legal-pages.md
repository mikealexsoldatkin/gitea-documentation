---
date: "2019-12-28"
slug: adding-legal-pages
sidebar_position: 110
aliases:
  - /zh-tw/adding-legal-pages
---

# 添加法律頁面

某些司法管轄區（例如歐盟）要求在網站上添加某些法律頁面（例如隱私政策）。請按照以下步驟將它們添加到您的 Gitea 實例中。

## 獲取頁面

Gitea 源程式碼附帶範例頁面，位於 `contrib/legal` 目錄中。將它們複製到 `custom/public/assets/`。例如，要添加隱私政策：

```bash
wget -O /path/to/custom/public/assets/privacy.html https://raw.githubusercontent.com/go-gitea/gitea/main/contrib/legal/privacy.html.sample
```

現在您需要編輯頁面以符合您的要求。特別是您必須更改電子電子郵件地址、網站地址和“您的 Gitea 實例”的引用以匹配您的情況。

您絕對不能放置一般的服務條款或隱私聲明，暗示 Gitea 專案對您的伺服器負責。

## 使其可見

建立或附加到 `/path/to/custom/templates/custom/extra_links_footer.tmpl`：

```go
<a class="item" href="{{AppSubUrl}}/assets/privacy.html">隱私政策</a>
```

重新啟動 Gitea 以查看更改。
