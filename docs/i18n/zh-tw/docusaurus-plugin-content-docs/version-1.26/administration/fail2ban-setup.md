---
date: "2022-08-01T00:00:00+00:00"
slug: "fail2ban-setup"
sidebar_position: 16

aliases:
  - /zh-tw/fail2ban-setup
---

# 設定 Fail2ban

**Fail2ban 檢查客戶端登入日誌，將多次登入失敗的客戶端識別為攻擊者並在一段時間內阻止其訪問服務。如果你的實例是公開的，這一點尤其重要。請管理員仔細設定 fail2ban，錯誤的設定將導致防火牆阻止你訪問自己的伺服器。**

Gitea 會在日誌文件 `log/gitea.log` 中記錄登入失敗的 CLI、SSH 或 HTTP 客戶端 IP 地址，而你需要將 Gitea 的日誌輸出模式從預設的 `console` 更改為 `file`。這表示將日誌輸出到文件，使得 fail2ban 可以定期掃描日誌內容。

當使用者的身份驗證失敗時，日誌中會記錄此類資訊：

```log
2018/04/26 18:15:54 [I] Failed authentication attempt for user from xxx.xxx.xxx.xxx
```

```log
2020/10/15 16:08:44 [E] invalid credentials from xxx.xxx.xxx.xxx
```

## 設定規則

添加日誌過濾器規則到設定文件 `/etc/fail2ban/filter.d/gitea.conf`:

```ini
[Definition]
failregex =  .*(Failed authentication attempt|invalid credentials|Attempted access of unknown user).* from <HOST>
ignoreregex =
```

添加監獄規則到設定文件 `/etc/fail2ban/jail.d/gitea.conf`:

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

如果你的 Gitea 實例運行在 Docker 容器中，並且直接將容器端口暴露到外部網路，
你還需要添加 `chain="FORWARD"` 到監獄規則設定文件 `/etc/fail2ban/jail.d/gitea-docker.conf`
以適應 Docker 的網路轉發規則。但如果你在容器的宿主機上使用 Nginx 反向代理連接到 Gitea 則無需這樣設定。

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

最後，運行 `systemctl restart fail2ban` 即可應用更改。現在，你可以使用 `systemctl status fail2ban` 檢查 fail2ban 運行狀態。

上述規則規定客戶端在 1 小時內，如果登入失敗的次數達到 10 次，則通過 iptables 鎖定該客戶端 IP 地址 15 分鐘。

## 設定反向代理

如果你使用 Nginx 反向代理到 Gitea 實例，你還需要設定 Nginx 的 HTTP 頭部值 `X-Real-IP` 將真實的客戶端 IP 地址傳遞給 Gitea。否則 Gitea 程式會將客戶端地址錯誤解析為反向代理伺服器的地址，例如迴環地址 `127.0.0.1`。

```
proxy_set_header X-Real-IP $remote_addr;
```

額外注意，在 Gitea 的設定文件 `app.ini` 中存在下列預設值：

```
REVERSE_PROXY_LIMIT = 1
REVERSE_PROXY_TRUSTED_PROXIES = 127.0.0.0/8,::1/128
```

`REVERSE_PROXY_LIMIT` 限制反向代理伺服器的層數，設定為 `0` 表示不使用這些標頭。
`REVERSE_PROXY_TRUSTED_PROXIES` 表示受信任的反向代理伺服器網路地址，
經過該網路地址轉發來的流量會經過解析 `X-Real-IP` 頭部得到真實客戶端地址。
（參考 [configuration cheat sheet](../administration/config-cheat-sheet.md)）
