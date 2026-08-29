---
date: "2018-06-06T09:33:00+08:00"
slug: "backup-and-restore"
sidebar_position: 11

aliases:
  - /zh-tw/backup-and-restore
---

# 備份與恢復

Gitea 已經實現了 `dump` 命令可以用來備份所有需要的文件到一個 zip 壓縮文件。該壓縮文件可以被用來進行資料恢復。

## 備份一致性

為了確保 Gitea 實例的一致性，在備份期間必須關閉它。

Gitea 包括資料庫、文件和 Git 儲存庫，當它被使用時所有這些都會發生變化。例如，當遷移正在進行時，在資料庫中建立一個事務，而 Git 儲存庫正在被複制。如果備份發生在遷移的中間，Git 儲存庫可能是不完整的，儘管資料庫聲稱它是完整的，因為它是在之後被轉儲的。避免這種競爭條件的唯一方法是在備份期間停止 Gitea 實例。

## 備份命令 (`dump`)

先轉到 git 使用者的權限: `su git`. 再 Gitea 目錄運行 `./gitea dump`。一般會顯示類似如下的輸出：

```
2016/12/27 22:32:09 Creating tmp work dir: /tmp/gitea-dump-417443001
2016/12/27 22:32:09 Dumping local repositories.../home/git/repositories
2016/12/27 22:32:22 Dumping database...
2016/12/27 22:32:22 Packing dump files...
2016/12/27 22:32:34 Removing tmp work dir: /tmp/gitea-dump-417443001
2016/12/27 22:32:34 Finish dumping in file gitea-dump-1482906742.zip
```

最後生成的 `gitea-dump-1482906742.zip` 文件將會包含如下內容：

- `app.ini` - 如果原先儲存在預設的 custom/ 目錄之外，則是設定文件的可選副本
- `custom/` - 所有保存在 `custom/` 目錄下的設定和自訂的文件。
- `data/` - 資料目錄（APP_DATA_PATH），如果使用文件會話，則不包括會話。該目錄包括 `attachments`、`avatars`、`lfs`、`indexers`、如果使用 SQLite 則包括 SQLite 文件。
- `repos/` - 儲存庫目錄的完整副本。
- `gitea-db.sql` - 資料庫 dump 出來的 SQL。
- `log/` - Logs 文件，如果用作遷移不是必須的。

中間備份文件將會在臨時目錄進行建立，如果您要重新指定臨時目錄，可以用 `--tempdir` 參數，或者用 `TMPDIR` 環境變量。

## 備份資料庫

`gitea dump` 建立的 SQL 轉儲使用 XORM，Gitea 管理員可能更喜歡使用本地的 MySQL 和 PostgreSQL 轉儲工具。使用 XORM 轉儲資料庫時仍然存在一些問題，可能會導致在嘗試恢復時出現問題。

```sh
# mysql
mysqldump -u$USER -p$PASS --database $DATABASE > gitea-db.sql
# postgres
pg_dump -U $USER $DATABASE > gitea-db.sql
```

### 使用 Docker （`dump`）

在使用 Docker 時，使用 `dump` 命令有一些注意事項。

必須以 `gitea/conf/app.ini` 中指定的 `RUN_USER = <OS_USERNAME>` 執行該命令；並且，為了讓備份文件夾的壓縮過程能夠順利執行，`docker exec` 命令必須在 `--tempdir` 內部執行。

範例：

```none
docker exec -u <OS_USERNAME> -it -w <--tempdir> $(docker ps -qf 'name=^<NAME_OF_DOCKER_CONTAINER>$') bash -c '/usr/local/bin/gitea dump -c </path/to/app.ini>'
```

\*注意：`--tempdir` 指的是 Gitea 使用的 Docker 環境的臨時目錄；如果您沒有指定自訂的 `--tempdir`，那麼 Gitea 將使用 `/tmp` 或 Docker 容器的 `TMPDIR` 環境變量。對於 `--tempdir`，請相應調整您的 `docker exec` 命令選項。

結果應該是一個文件，儲存在指定的 `--tempdir` 中，類似於：`gitea-dump-1482906742.zip`

## 恢復命令 (`restore`)

當前還沒有恢復命令，恢復需要人工進行。主要是把文件和資料庫進行恢復。

例如：

```sh
unzip gitea-dump-1610949662.zip
cd gitea-dump-1610949662
mv app.ini /etc/gitea/conf/app.ini
mv data/* /var/lib/gitea/data/
mv log/* /var/lib/gitea/log/
mv repos/* /var/lib/gitea/repositories/
chown -R gitea:gitea /etc/gitea/conf/app.ini /var/lib/gitea

# mysql
mysql --default-character-set=utf8mb4 -u$USER -p$PASS $DATABASE <gitea-db.sql
# sqlite3
sqlite3 $DATABASE_PATH <gitea-db.sql
# postgres
psql -U $USER -d $DATABASE < gitea-db.sql

service gitea restart
```

如果安裝方式發生了變化（例如 二進制 -> Docker），或者 Gitea 安裝到了與之前安裝不同的目錄，則需要重新生成儲存庫 Git 鉤子。

在 Gitea 運行時，並從 Gitea 二進制文件所在的目錄執行：`./gitea admin regenerate hooks`

這樣可以確保儲存庫 Git 鉤子中的應用程式和設定文件路徑與當前安裝一致。如果這些路徑沒有更新，儲存庫的 `push` 操作將失敗。

### 使用 Docker (`restore`)

在基於 Docker 的 Gitea 實例中，也沒有恢復命令的支援。恢復過程與前面描述的步驟相同，但路徑不同。

範例：

```sh
# 在容器中打開 bash 會話
docker exec --user git -it 2a83b293548e bash
# 在容器內解壓您的備份文件
unzip gitea-dump-1610949662.zip
cd gitea-dump-1610949662
# 恢復 Gitea 數據
mv data/* /data/gitea
# 恢復倉庫本身
mv repos/* /data/git/repositories/
# 調整文件權限
chown -R git:git /data
# 重新生成 Git 鉤子
/usr/local/bin/gitea -c '/data/gitea/conf/app.ini' admin regenerate hooks
```

Gitea 容器中的預設使用者是 `git`（1000:1000）。請用您的 Gitea 容器 ID 或名稱替換 `2a83b293548e`。

### 使用 Docker-rootless (`restore`)

在 Docker-rootless 容器中的恢復工作流程只是要使用的目錄不同：

```sh
# 在容器中打開 bash 會話
docker exec --user git -it 2a83b293548e bash
# 在容器內解壓您的備份文件
unzip gitea-dump-1610949662.zip
cd gitea-dump-1610949662
# 恢復 app.ini
mv data/conf/app.ini /etc/gitea/app.ini
# 恢復 Gitea 數據
mv data/* /var/lib/gitea
# 恢復倉庫本身
mv repos/* /var/lib/gitea/git/repositories
# 調整文件權限
chown -R git:git /etc/gitea/app.ini /var/lib/gitea
# 重新生成 Git 鉤子
/usr/local/bin/gitea -c '/etc/gitea/app.ini' admin regenerate hooks
```
