---
date: "2023-05-23T09:00:00+08:00"
slug: adding-legal-pages
sidebar_position: 110

aliases:
  - /zh-tw/adding-legal-pages
---

# 添加法律頁面

一些法域（例如歐盟）要求在網站上添加特定的法律頁面（例如隱私政策）。按照以下步驟將它們添加到你的 Gitea 實例中。

## 獲取頁面

Gitea 源程式碼附帶了範例頁面，位於 `contrib/legal` 目錄中。將它們複製到 `custom/public/assets/` 目錄下。例如，如果要添加隱私政策：

```
wget -O /path/to/custom/public/assets/privacy.html https://raw.githubusercontent.com/go-gitea/gitea/main/contrib/legal/privacy.html.sample
```

現在，你需要編輯該頁面以滿足你的需求。特別是，你必須更改電子電子郵件地址、網址以及與 "Your Gitea Instance" 相關的引用，以匹配你的情況。

請務必不要放置會暗示 Gitea 專案對你的伺服器負責的一般服務條款或隱私聲明。

## 使其可見

建立或追加到 `/path/to/custom/templates/custom/extra_links_footer.tmpl` 文件中：

```go
<a class="item" href="{{AppSubUrl}}/assets/privacy.html">隱私政策</a>
```

重啟 Gitea 以查看更改。
