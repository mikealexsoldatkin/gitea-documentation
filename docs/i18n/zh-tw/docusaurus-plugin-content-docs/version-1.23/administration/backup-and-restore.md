---
date: "2017-01-01T16:00:00+02:00"
slug: "backup-and-restore"
sidebar_position: 11
aliases:
  - /zh-tw/backup-and-restore
---

# 備份和恢復

Gitea 目前有一個 `dump` 命令，可以將安裝保存到 ZIP 文件中。此文件可以解壓縮並用於恢復實例。

## 備份一致性

為了確保 Gitea 實例的一致性，必須在備份期間關閉它。

Gitea 由資料庫、文件和 git 儲存庫組成，這些都會在使用時發生變化。例如，當遷移正在進行時，資料庫中會建立一個事務，同時 git 儲存庫正在被複製。如果備份發生在遷移過程中，git 儲存庫可能不完整，儘管資料庫聲稱它是完整的，因為它是在之後轉儲的。避免此類競爭條件的唯一方法是在備份期間停止 Gitea 實例。

## 備份命令 (`dump`)

切換到運行 Gitea 的使用者：`su git`。在 Gitea 安裝目錄中運行 `./gitea dump -c /path/to/app.ini`。應該會有類似以下的輸出：

```log
2016/12/27 22:32:09 Creating tmp work dir: /tmp/gitea-dump-417443001
2016/12/27 22:32:09 Dumping local repositories.../home/git/gitea-repositories
2016/12/27 22:32:22 Dumping database...
2016/12/27 22:32:22 Packing dump files...
2016/12/27 22:32:34 Removing tmp work dir: /tmp/gitea-dump-417443001
2016/12/27 22:32:34 Finish dumping in file gitea-dump-1482906742.zip
```

在 `gitea-dump-1482906742.zip` 文件中，將包含以下內容：

- `app.ini` - 如果最初儲存在預設的 `custom/` 目錄之外，則為設定文件的可選副本
- `custom/` - `custom/` 中的所有設定或自訂文件。
- `data/` - 資料目錄（APP_DATA_PATH），如果您使用文件會話，則不包括會話。此目錄包括 `attachments`、`avatars`、`lfs`、`indexers`，如果您使用 SQLite，則包括 SQLite 文件。
- `repos/` - 儲存庫目錄的完整副本。
- `gitea-db.sql` - 資料庫的 SQL 轉儲
- `log/` - 各種日誌。它們在恢復或遷移時不需要。

中間備份文件建立在臨時目錄中，可以透過 `--tempdir` 命令行參數或 `TMPDIR` 環境變量指定。

## 備份資料庫

由 `gitea dump` 建立的 SQL 轉儲使用 XORM，Gitea 管理員可能更喜歡使用原生的 MySQL 和 PostgreSQL 轉儲工具。使用 XORM 轉儲資料庫時仍然存在一些未解決的問題，這些問題可能會在嘗試恢復時引起問題。

```sh
# mysql
mysqldump -u$USER -p$PASS --database $DATABASE > gitea-db.sql
# postgres
pg_dump -U $USER $DATABASE > gitea-db.sql
```

### 使用 Docker (`dump`)

使用 Docker 執行 `dump` 命令有一些注意事項。

該命令必須以 `gitea/conf/app.ini` 中指定的 `RUN_USER = <OS_USERNAME>` 執行；並且，為了在沒有權限錯誤的情況下壓縮備份文件夾，必須在 `--tempdir` 內執行 `docker exec` 命令。

範例：

```bash
docker exec -u <OS_USERNAME> -it -w <--tempdir> $(docker ps -qf 'name=^<NAME_OF_DOCKER_CONTAINER>$') bash -c '/usr/local/bin/gitea dump -c </path/to/app.ini>'
```

\*注意：`--tempdir` 是指 Gitea 使用的 docker 環境的臨時目錄；如果您未指定自訂 `--tempdir`，則 Gitea 使用 `/tmp` 或 docker 容器的 `TMPDIR` 環境變量。對於 `--tempdir`，請相應地調整您的 `docker exec` 命令選項。

結果應該是一個文件，儲存在指定的 `--tempdir` 中，類似於：`gitea-dump-1482906742.zip`

## 恢復命令 (`restore`)

目前不支援恢復命令。這是一個手動過程，主要涉及將文件移動到正確的位置並恢復資料庫轉儲。

範例：

```sh
unzip gitea-dump-1610949662.zip
cd gitea-dump-1610949662
mv app.ini /etc/gitea/conf/app.ini
mv data/* /var/lib/gitea/data/
mv log/* /var/lib/gitea/log/
mv repos/* /var/lib/gitea/data/gitea-repositories/
chown -R gitea:gitea /etc/gitea/conf/app.ini /var/lib/gitea

# mysql
mysql --default-character-set=utf8mb4 -u$USER -p$PASS $DATABASE <gitea-db.sql
# sqlite3
sqlite3 $DATABASE_PATH <gitea-db.sql
# postgres
psql -U $USER -d $DATABASE < gitea-db.sql

service gitea restart
```

如果安裝方法更改（例如，二進制 -> Docker），或者 Gitea 安裝到與以前不同的目錄，則應重新生成儲存庫 Git Hooks。

在 Gitea 運行並從 Gitea 二進制文件所在的目錄中，執行：`./gitea admin regenerate hooks`

這確保儲存庫 Git Hooks 中的應用程式和設定文件路徑與當前安裝一致且適用。如果這些路徑未更新，儲存庫 `push` 操作將失敗。

如果您仍然有問題，請考慮運行 `./gitea doctor check` 以檢查可能的錯誤（或使用 `--fix` 選項運行）。

### 使用 Docker (`restore`)

在基於 Docker 的 gitea 實例中也不支援恢復命令。恢復過程包含與前一部分中描述的相同步驟，但使用不同的路徑。

範例：

```sh
# 在容器中打開 bash 會話
docker exec --user git -it 2a83b293548e bash
# 在容器內解壓備份文件
unzip gitea-dump-1610949662.zip
cd gitea-dump-1610949662
# 恢復 gitea 數據
mv data/* /data/gitea
# 恢復儲存庫本身
mv repos/* /data/git/gitea-repositories/
# 調整文件權限
chown -R git:git /data
# 重新生成 Git Hooks
/usr/local/bin/gitea -c '/data/gitea/conf/app.ini' admin regenerate hooks
```

gitea 容器中的預設使用者是 `git`（1000:1000）。請將 `2a83b293548e` 替換為您的 gitea 容器 ID 或名稱。

### 使用 Docker-rootless (`restore`)

Docker-rootless 容器中的恢復工作流程僅在使用的目錄上有所不同：

```sh
# 在容器中打開 bash 會話
docker exec --user git -it 2a83b293548e bash
# 在容器內解壓備份文件
unzip gitea-dump-1610949662.zip
cd gitea-dump-1610949662
# 恢復 app.ini
mv data/conf/app.ini /etc/gitea/app.ini
# 恢復 gitea 數據
mv data/* /var/lib/gitea
# 恢復儲存庫本身
mv repos/* /var/lib/gitea/git/gitea-repositories
# 調整文件權限
chown -R git:git /etc/gitea/app.ini /var/lib/gitea
# 重新生成 Git Hooks
/usr/local/bin/gitea -c '/etc/gitea/app.ini' admin regenerate hooks
```

### 使用 `gitea dump` 轉換資料庫類型

`gitea dump` 命令可以生成一個 SQL 文件，可以由另一種資料庫類型讀取，這在您在第一次安裝期間未選擇正確的資料庫時很有用。

請注意，此轉換過程尚未經過充分測試，因此建議在第一次安裝期間選擇最終的資料庫類型，而不要嘗試之後更改。

停止 Gitea 伺服器，然後確保您擁有原始資料庫的完整備份。

在嘗試轉換之前，確保原始資料庫是乾淨的。運行 `gitea doctor check --all --fix` 和 `gitea doctor recreate-table` 以解決常見問題。

使用 `--database` 標誌獲取目標格式的 Gitea 轉儲，在此範例中為 PostgreSQL：`gitea dump --database postgres`，然後從生成的 ZIP 文件中提取 `gitea-db.sql` 文件。

建立 PostgreSQL Gitea 使用者和 Gitea 資料庫。然後，使用以下命令將 SQL 文件作為 Gitea 使用者導入到 Gitea 資料庫中：

```sh
sudo -u postgres psql -d gitea
gitea=# SET synchronous_commit TO off
gitea=# SET on_error_stop TO on
gitea=# \i gitea-db.sql
```

禁用 `synchronous_commit` 使 PostgreSQL 對崩潰的抵抗力降低，但使導入速度更快。由於我們已經有原始資料庫的備份，並且我們可以檢查導入是否成功完成，因此這應該是一個不錯的權衡。

導入完成後，設定 Gitea 以使用 PostgreSQL 並重新啟動 Gitea 伺服器。祝你好運！
