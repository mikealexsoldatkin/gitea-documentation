---
date: "2023-05-23T09:00:00+08:00"
slug: "agit"
sidebar_position: 12
aliases:
  - /zh-cn/agit-setup
---

# AGit

在 Gitea `1.13` 版本中，添加了对 [AGit](https://git-repo.info/zh/2020/03/agit-flow-and-git-repo/) 的支持。AGit 允许用户在没有仓库写入权限的情况下直接创建拉取请求，也不需要分叉仓库。这有助于减少重复仓库的数量，降低不必要的磁盘使用量。

:::note
服务器端需要 Git 版本 2.29 或更高版本才能正常运行。
:::

## 使用 AGit 创建 PR

AGit 允许在推送代码到远程仓库时创建 PR（合并请求）。
通过在推送时使用特定的 refspec（git 中已知的位置标识符），可以实现这一功能。
下面的示例说明了这一点：

```shell
git push origin HEAD:refs/for/main
```

该命令的结构如下：

- `HEAD`：目标分支
- `refs/<for|draft|for-review>/<branch>`：目标 PR 类型
  - `for`：创建一个以 `<branch>` 为目标分支的普通 PR
  - `draft`/`for-review`：目前被静默忽略
- `<branch>/<session>`：要打开 PR 的目标分支
- `-o <topic|title|description>`：PR 的选项
  - `title`：PR 的标题
  - `topic`：PR 应该打开的分支名称
  - `description`：PR 的描述
  - `force-push=true`: 是否强制更新目标分支
    - 注意: 如果不传值，只用 `-o force-push` 也同样可以正常工作。

下面是另一个高级示例，用于创建一个以 `topic`、`title` 和 `description` 为参数的新 PR，目标分支是 `main`：

```shell
git push origin HEAD:refs/for/main -o topic="Topic of my PR" -o title="Title of the PR" -o description="# The PR Description\nThis can be **any** markdown content.\n- [x] Ok"
```
