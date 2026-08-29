---
date: "2023-05-24T15:00:00+08:00"
slug: "runner"
sidebar_position: 20
aliases:
  - /zh-cn/act-runner
---

# Runner

本页面将介绍[Gitea Runner](https://gitea.com/gitea/runner)，这是Gitea Actions的Runner。

:::tip
详细的安装、配置和使用说明，请参阅 [Gitea Runner 文档](/runner/)。
:::

## 获取注册令牌

### Runner级别

您可以在不同级别上注册Runner，它可以是：

- 实例级别：Runner将为实例中的所有存储库运行Job。
- 组织级别：Runner将为组织中的所有存储库运行Job。
- 存储库级别：Runner将为其所属的存储库运行Job。

请注意，即使存储库具有自己的存储库级别Runner，它仍然可以使用实例级别或组织级别Runner。未来的版本可能提供更多对此进行更好控制的选项。

Runner级别决定了从哪里获取注册令牌。

- 实例级别：管理员设置页面，例如 `<your_gitea.com>/admin/actions/runners`。
- 组织级别：组织设置页面，例如 `<your_gitea.com>/<org>/settings/actions/runners`。
- 存储库级别：存储库设置页面，例如 `<your_gitea.com>/<owner>/<repo>/settings/actions/runners`。

如果您无法看到设置页面，请确保您具有正确的权限并且已启用 Actions。

注册令牌的格式是一个随机字符串 `D0gvfu2iHfUjNqCYVljVyRV14fISpJxxxxxxxxxx`。

注册令牌也可以通过 Gitea 的 [命令行](../../administration/command-line.md#actions-generate-runner-token) 获得:

```
gitea --config /etc/gitea/app.ini actions generate-runner-token
```

用户也可以使用 `GITEA_RUNNER_REGISTRATION_TOKEN` 或 `GITEA_RUNNER_REGISTRATION_TOKEN_FILE` 环境变量以在 Gitea 启动时设置全局的注册令牌，例如：

```
openssl rand -hex 24 > /some-dir/runner-token
export GITEA_RUNNER_REGISTRATION_TOKEN_FILE=/some-dir/runner-token
./gitea --config ...
```

来自环境变量的令牌在通过 Web 界面或 API 重置(重新创建新令牌)前将一直有效。

令牌可用于注册多个 Runner，直到使用 Web 界面中的令牌重置链接将其撤销并替换为新令牌。

获取注册令牌后，请参阅 [Gitea Runner 文档](/runner/) 了解如何安装、配置和运行您的 Runner。
