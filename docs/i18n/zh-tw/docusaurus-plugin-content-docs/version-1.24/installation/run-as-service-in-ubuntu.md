---
date: "2017-07-21T12:00:00+02:00"
slug: "linux-service"
sidebar_position: 40
aliases:
  - /zh-tw/linux-service
---

# 在 Linux 中以 service 方式運行

## 在 Ubuntu 16.04 LTS 中以 service 方式運行

### systemd 方式

在 terminal 中執行以下命令：

```
sudo vim /etc/systemd/system/gitea.service
```

接著拷貝範例程式碼 [gitea.service](https://github.com/go-gitea/gitea/blob/main/contrib/systemd/gitea.service) 並取消對任何需要運行在主機上的服務部分的註釋，譬如 MySQL。

修改 user，home 目錄以及其他必須的初始化參數，如果使用自訂端口，則需修改 PORT 參數，反之如果使用預設端口則需刪除 -p 標記。

激活 gitea 並將它作為系統自啟動服務：

```
sudo systemctl enable gitea
sudo systemctl start gitea
```

### 使用 supervisor

在 terminal 中執行以下命令安裝 supervisor：

```
sudo apt install supervisor
```

為 supervisor 設定日誌路徑：

```
# assuming gitea is installed in /home/git/gitea/
mkdir /home/git/gitea/log/supervisor
```

在文件編輯器中打開 supervisor 的設定文件：

```
sudo vim /etc/supervisor/supervisord.conf
```

增加如下範例設定
[supervisord config](https://github.com/go-gitea/gitea/blob/main/contrib/supervisor/gitea)。

將 user(git) 和 home(/home/git) 設定為與上文部署中匹配的值。如果使用自訂端口，則需修改 PORT 參數，反之如果使用預設端口則需刪除 -p 標記。

最後激活 supervisor 並將它作為系統自啟動服務：

```
sudo systemctl enable supervisor
sudo systemctl start supervisor
```
