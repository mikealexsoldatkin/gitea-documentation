---
sidebar_position: 4
---

# Labels

Labels decide **which jobs a runner accepts** and **how it runs them**. A job's `runs-on` value is matched against the runner's label names; the first match wins and selects the execution environment for that job.

A label is written as:

```text
<name>[:<schema>[:<args>]]
```

| Part | Meaning |
| --- | --- |
| `name` | the name a workflow refers to in `runs-on`, e.g. `ubuntu-latest` |
| `schema` | either `docker` or `host`, defaulting to `host` when omitted |
| `args` | only used by the `docker` schema: the image the job runs in |

Two schemas are supported:

- `docker://<image>` — the job runs in a container created from `<image>`:

  ```text
  ubuntu-latest:docker://docker.gitea.com/runner-images:ubuntu-latest
  ```

- `host` — the job's steps run directly on the machine, with the tools installed there:

  ```text
  macos:host
  ```

So a runner registered with

```text
ubuntu-latest:docker://docker.gitea.com/runner-images:ubuntu-latest,macos:host
```

runs `runs-on: ubuntu-latest` jobs in the `runner-images:ubuntu-latest` container and `runs-on: macos` jobs directly on the host.

Names may themselves contain a colon, for example `pool:e57e18d4-10d4-406f-93bf-60f127221bdd`; only `host` and `docker` are treated as schemas.

If a job's `runs-on` matches none of the runner's labels, the job still runs, in the default `docker.gitea.com/runner-images:ubuntu-latest` image. Images maintained for this purpose are listed at [gitea/runner-images](https://gitea.com/gitea/runner-images); community images such as the [act images](https://github.com/nektos/act/blob/master/IMAGES.md) work too.

:::note
A runner that only exposes `host` labels still needs access to a Docker daemon whenever a job uses a `docker://` action or a service container. `host` labels only change where the job's own steps run.
:::

## Registration versus config labels

Labels are chosen at registration time (`--labels`, or the interactive prompt) and stored in the registration file. Afterwards they can be changed without re-registering, and the most explicit source wins:

```text
--labels / GITEA_RUNNER_LABELS   >   runner.labels in the config file   >   labels in the .runner file
```

- during `register`, `runner.labels` from the config file takes precedence and the `--labels` flag is ignored;
- `daemon --labels` (which defaults to `GITEA_RUNNER_LABELS`) overrides the labels of an already registered runner;
- whenever the resulting labels differ from those in the registration file, they are written back to it and re-declared to the instance on startup;
- labels that fail to parse are skipped with a warning instead of stopping the runner.

Labels can also be edited in the Gitea UI under the runner's settings.

## Choosing images

- Pick an image that already contains the tools your workflows expect. The default images are small; a job that installs a toolchain on every run is usually better served by a purpose-built image.
- Pin images by tag or digest for reproducible jobs. An image pinned by digest is never re-pulled, even with `container.force_pull` enabled.
- Use distinct names such as `linux_amd64:host` or `windows:host` for host labels, so a workflow written for GitHub's `ubuntu-latest` does not accidentally run unsandboxed on your machine.
