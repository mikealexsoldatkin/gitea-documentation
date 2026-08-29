---
date: "2016-12-01T16:00:00+02:00"

slug: "localization"
sidebar_position: 70

aliases:
  - /zh-tw/localization
---

# 本地化

Gitea 的本地化是通過我們的[Crowdin 專案](https://crowdin.com/project/gitea)進行的。

對於對**英語翻譯**的更改，可以發出 pull-request，來更改[英語語言環境](https://github.com/go-gitea/gitea/blob/main/options/locale/locale_en-US.ini)中合適的關鍵字。

有關對**非英語**翻譯的更改，請參閱上面的 Crowdin 專案。

## 支援的語言

上述 Crowdin 專案中列出的任何語言一旦翻譯了 25% 或更多都將得到支援。

翻譯被接受後，它將在下一次 Crowdin 同步後反映在主儲存庫中，這通常是在任何 PR 合併之後。

在撰寫本文時，這意味著更改後的翻譯可能要到 Gitea 的下一個版本纔會出現。

如果使用開發版本，則在同步更改內容後，它應該會在更新後立即顯示。
