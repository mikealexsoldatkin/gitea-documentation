---
date: "2023-05-24T15:00:00+08:00"
slug: "quickstart"
sidebar_position: 10
---

# 快速入门

本页面将指导您使用Gitea Actions的过程。

## 设置Gitea

首先，您需要一个Gitea实例。
您可以按照[文档](installation/from-package.md) 来设置一个新实例或升级现有实例。
无论您如何安装或运行Gitea，只要版本号是1.19.0或更高即可。

从1.21.0开始，默认情况下，Actions是启用的。如果您正在使用1.21.0之前的版本，您需要将以下内容添加到配置文件中以启用它：

```ini
[actions]
ENABLED=true
```

如果您想了解更多信息或在配置过程中遇到任何问题，请参考[配置速查表](../../administration/config-cheat-sheet.md#actions-actions)。

### 设置Runner

Gitea Actions需要[act runner](https://gitea.com/gitea/act_runner) 来运行Job。
为了避免消耗过多资源并影响Gitea实例，建议您在与Gitea实例分开的机器上启动Runner。

您可以使用[预构建的二进制文件](http://dl.gitea.com/act_runner)或[容器镜像](https://hub.docker.com/r/gitea/act_runner/tags)来设置Runner。

在进一步操作之前，建议您先使用预构建的二进制文件以命令行方式运行它，以确保它与您的环境兼容，尤其是如果您在本地主机上运行Runner。
如果出现问题，这样调试起来会更容易。

该Runner可以在隔离的Docker容器中运行Job，因此您需要确保已安装Docker并且Docker守护进程正在运行。
虽然这不是严格必需的，因为Runner也可以直接在主机上运行Job，这取决于您的配置方式。
然而，建议使用Docker运行Job，因为它更安全且更易于管理。

在运行Runner之前，您需要使用以下命令将其注册到Gitea实例中：

```bash
./act_runner register --no-interactive --instance <instance> --token <token>
```

需要两个必需的参数：`instance` 和 `token`。

`instance`是您的Gitea实例的地址，如`http://192.168.8.8:3000`或`https://gitea.com`。
Runner和Job容器（由Runner启动以执行Job）将连接到此地址。
这意味着它可能与用于Web访问的`ROOT_URL`不同。
使用回环地址（例如 `127.0.0.1` 或 `localhost`）是一个不好的选择。
如果不确定使用哪个地址，通常选择局域网地址即可。

`token` 用于身份验证和标识，例如 `P2U1U0oB4XaRCi8azcngmPCLbRpUGapalhmddh23`。
它只能使用一次，并且不能用于注册多个Runner。
您可以从以下位置获取不同级别的`token`,从而创建出相应级别的`runner`

- 实例级别：管理员设置页面，例如 `<your_gitea.com>/admin/actions/runners`。
- 组织级别：组织设置页面，例如 `<your_gitea.com>/<org>/settings/actions/runners`。
- 存储库级别：存储库设置页面，例如 `<your_gitea.com>/<owner>/<repo>/settings/actions/runners`。

![register runner](/images/usage/actions/register-runner.png)

注册后，当前目录中将出现一个名为 `.runner` 的新文件，该文件存储了注册信息。
请不要手动编辑该文件。
如果该文件丢失或损坏，只需删除它然后重新注册即可。

最后，是时候启动Runner了：

```bash
./act_runner daemon
```

您可以在管理页面上看到新的Runner：

![view runner](/images/usage/actions/view-runner.png)

您可以通过访问[act runner](act-runner) 获取更多信息。

### 使用Actions

即使对于启用了Gitea实例的Actions，存储库仍默认禁用Actions。

要启用它，请转到存储库的设置页面，例如`your_gitea.com/<owner>/repo/settings`，然后启用`Enable Repository Actions`。

![enable actions](/images/usage/actions/enable-actions.png)

接下来的步骤可能相当复杂。
您需要学习Actions的[工作流语法](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)，并编写您想要的工作流文件。

不过，我们可以从一个简单的演示开始：

```yaml
name: Gitea Actions Demo
run-name: ${{ gitea.actor }} is testing out Gitea Actions 🚀
on: [push]

jobs:
  Explore-Gitea-Actions:
    runs-on: ubuntu-latest
    steps:
      - run: echo "🎉 The job was automatically triggered by a ${{ gitea.event_name }} event."
      - run: echo "🐧 This job is now running on a ${{ runner.os }} server hosted by Gitea!"
      - run: echo "🔎 The name of your branch is ${{ gitea.ref }} and your repository is ${{ gitea.repository }}."
      - name: Check out repository code
        uses: actions/checkout@v4
      - run: echo "💡 The ${{ gitea.repository }} repository has been cloned to the runner."
      - run: echo "🖥️ The workflow is now ready to test your code on the runner."
      - name: List files in the repository
        run: |
          ls ${{ gitea.workspace }}
      - run: echo "🍏 This job's status is ${{ job.status }}."
```

您可以将上述示例上传为一个以`.yaml`扩展名的文件，放在存储库的`.gitea/workflows/`目录中，例如`.gitea/workflows/demo.yaml`。
您可能会注意到，这与[GitHub Actions的快速入门](https://docs.github.com/en/actions/quickstart)非常相似。
这是因为Gitea Actions在尽可能兼容GitHub Actions的基础上进行设计。

请注意，演示文件中包含一些表情符号。
请确保您的数据库支持它们，特别是在使用MySQL时。
如果字符集不是`utf8mb4`，将出现错误，例如`Error 1366 (HY000): Incorrect string value: '\\xF0\\x9F\\x8E\\x89 T...' for column 'name' at row 1`。
有关更多信息，请参阅[数据库准备工作](../../installation/database-preparation.md#mysqlmariadb)。

或者，您可以从演示文件中删除所有表情符号，然后再尝试一次。

`on: [push]` 这一行表示当您向该存储库推送提交时，工作流将被触发。
然而，当您上传 YAML 文件时，它也会推送一个提交，所以您应该在"Actions"标签中看到一个新的任务。

![view job](/images/usage/actions/view-job.png)

做得好！您已成功开始使用Actions。
