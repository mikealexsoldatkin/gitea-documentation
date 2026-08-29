---
date: "2018-05-11T11:00:00+02:00"
slug: "fail2ban-setup"
sidebar_position: 16
aliases:
  - /zh-tw/fail2ban-setup
---

# Fail2ban 設定

**記住，fail2ban 很強大，如果你設定錯誤，可能會造成很多問題，所以在依賴它之前，務必先測試，避免把自己鎖在外面。**

Gitea 在網頁日誌中對於錯誤登入會返回 HTTP 200，但如果你在 `app.ini` 中開啟了日誌選項，那麼你應該可以從 `log/gitea.log` 中看到類似這樣的錯誤認證記錄，無論是從網頁還是使用 SSH 或 HTTP 的 CLI：

```log
2018/04/26 18:15:54 [I] 使用者從 xxx.xxx.xxx.xxx 嘗試認證失敗
```

```log
2020/10/15 16:05:09 modules/ssh/ssh.go:143:publicKeyHandler() [W] 使用者從 xxx.xxx.xxx.xxx 嘗試認證失敗
```

（已棄用：這可能是誤報，因為使用者可能會繼續正確認證。）

```log
2020/10/15 16:05:09 modules/ssh/ssh.go:155:publicKeyHandler() [W] 使用者從 xxx.xxx.xxx.xxx 嘗試認證失敗
```

（已棄用：這可能是誤報，因為使用者可能會繼續正確認證。）

```log
2020/10/15 16:05:09 modules/ssh/ssh.go:198:publicKeyHandler() [W] 使用者從 xxx.xxx.xxx.xxx 嘗試認證失敗
```

（已棄用：這可能是誤報，因為使用者可能會繼續正確認證。）

```log
2020/10/15 16:05:09 modules/ssh/ssh.go:213:publicKeyHandler() [W] 使用者從 xxx.xxx.xxx.xxx 嘗試認證失敗
```

（已棄用：這可能是誤報，因為使用者可能會繼續正確認證。）

```log
2020/10/15 16:05:09 modules/ssh/ssh.go:227:publicKeyHandler() [W] 使用者從 xxx.xxx.xxx.xxx 嘗試認證失敗
```

（已棄用：這可能是誤報，因為使用者可能會繼續正確認證。）

```log
2020/10/15 16:05:09 modules/ssh/ssh.go:249:sshConnectionFailed() [W] 使用者從 xxx.xxx.xxx.xxx 嘗試認證失敗
```

（從 1.15 版本開始，這個新訊息將可用，且不會有上述 publicKeyHandler 訊息中的誤報。只有當使用者完全認證失敗時，才會記錄這個訊息。）

```log
2020/10/15 16:08:44 ...s/context/context.go:204:HandleText() [E] 無效的憑證來自 xxx.xxx.xxx.xxx
```

在 `/etc/fail2ban/filter.d/gitea.local` 中新增我們的過濾器：

```ini
# gitea.local
[Definition]
failregex =  .*(Failed authentication attempt|invalid credentials|Attempted access of unknown user).* from <HOST>
ignoreregex =
```

在 `/etc/fail2ban/jail.d/gitea.local` 中新增我們的 jail：

```ini
[gitea]
enabled = true
filter = gitea
logpath = /var/lib/gitea/log/gitea.log
maxretry = 10
findtime = 3600
bantime = 900
action = iptables-allports
```

如果你使用 Docker，你還需要新增一個 jail 來處理 **iptables** 中的 **FORWARD** 鏈。將其設定在 `/etc/fail2ban/jail.d/gitea-docker.local`：

```ini
[gitea-docker]
enabled = true
filter = gitea
logpath = /var/lib/gitea/log/gitea.log
maxretry = 10
findtime = 3600
bantime = 900
action = iptables-allports[chain="FORWARD"]
```

然後只需運行 `service fail2ban restart` 來應用你的更改。你可以使用 `service fail2ban status` 檢查 fail2ban 是否接受了你的設定。

務必閱讀 fail2ban 並根據你的需求進行設定，這會在一小時內認證失敗 10 次時，將某人從所有端口禁止 **15 分鐘**。

如果你在 Nginx 反向代理後運行 Gitea（例如使用 Docker），你需要在 Nginx 設定中添加這一行，這樣 IP 不會顯示為 127.0.0.1：

```
proxy_set_header X-Real-IP $remote_addr;
```

`app.ini` 中的安全選項需要調整，以允許解釋標頭以及描述受信任代理伺服器的 IP 地址和網路列表（更多資訊請參見 [設定速查表](../administration/config-cheat-sheet.md)）。

```
REVERSE_PROXY_LIMIT = 1
REVERSE_PROXY_TRUSTED_PROXIES = 127.0.0.1/8 ; 172.17.0.0/16 for the docker default network
```
