---
sidebar_position: 1
slug: /
---

# Gitea Runner

The [Gitea Runner](https://gitea.com/gitea/runner) executes the jobs of [Gitea Actions](/usage/actions/overview).
It polls a Gitea instance for queued jobs, runs their steps in a container or directly on the machine it is installed on, and streams the logs and the result back.

:::info Development version
These pages describe the `main` branch of `gitea.com/gitea/runner`, which is published as the `nightly` binaries and images.
Features documented here may not be part of a release yet. Pick a released version in the **Runner Version** dropdown for stable documentation.
:::

## Requirements

A runner needs a Gitea instance with Actions enabled, a [registration token](registration.md), and, for containerized jobs, a Docker daemon. Actions are enabled by default since Gitea 1.21; on older instances they have to be turned on:

```ini
[actions]
ENABLED=true
```

Other OCI engines that implement the Docker API may work, but are untested. Podman is not a supported configuration.

## Execution modes

A runner can run jobs in three different ways. The mode is not a global setting: it follows from the [labels](labels.md) the runner is registered with, so a single runner can offer both container and host labels.

| Mode | How jobs run | Docker daemon | Notes |
| --- | --- | --- | --- |
| Docker (recommended) | in a container created from the label's image | external, e.g. the host's `/var/run/docker.sock` | jobs are isolated from each other, but share the daemon |
| Docker-in-Docker | in a container created by a daemon that lives next to the runner | bundled in the `dind` / `dind-rootless` images | strongest isolation, more setup, needs `--privileged` |
| Host | directly on the machine, with the tools installed there | only needed for `docker://` actions and service containers | no isolation between jobs |

## Getting started

1. [Install the runner](installation/binary.md) as a binary, [in Docker](installation/docker.md), or [on Kubernetes](installation/kubernetes.md).
2. [Register it](registration.md) against your instance with a registration token.
3. [Configure it](configuration.md), and pick the [labels](labels.md) that decide which jobs it accepts.
4. Optionally set up a [shared cache](cache.md), [job hooks](hooks/job-hooks.md), a [post-task script](hooks/post-task-script.md), or [metrics and health checks](monitoring.md).

Every command and flag is listed in the [command line reference](reference/cli.md).

## Versioning and compatibility

The runner is released independently of Gitea and its version numbers are unrelated to the instance's. Gitea 1.21 or later is expected — older instances cannot accept the runner's label declaration — and individual features need a newer instance still, which is called out where they apply.

When moving between major runner versions, read [Upgrading](upgrade.md) first: `2.0.0` and `3.0.0` both contain breaking changes.
