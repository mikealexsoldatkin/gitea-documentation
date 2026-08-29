---
sidebar_position: 2
---

# Install with Docker

The official images are published on [Docker Hub](https://hub.docker.com/r/gitea/runner/tags) as `docker.io/gitea/runner`.
Every release is tagged with its version, and the `2` tag follows the newest `2.x` release. `latest` points at the newest release of *any* series, so pin `2` (or an exact version) to stay on this one.

In the container the registration and the daemon are combined: the entrypoint registers the runner on first start (when no registration file exists yet) and then execs `gitea-runner daemon`.

## Image flavours

All flavours contain the same `gitea-runner` binary and differ only in how a Docker daemon is made available to jobs.

| Tag | Base image | Docker daemon | Supervisor | Runs as |
| --- | --- | --- | --- | --- |
| `2`, `2.3`, `<version>` | `alpine` | none, you provide one | `tini` | `root` |
| `2-dind`, `2.3-dind` | `docker:dind` | bundled, needs `--privileged` | `s6` | `root` |
| `2-dind-rootless`, `2.3-dind-rootless` | `docker:dind-rootless` | bundled, rootless | `s6` | `rootless` (UID 1000) |

The rootless flavour's UID is fixed at 1000 by the upstream base image, and its daemon always listens on `/run/user/1000/docker.sock`, so `--user 1001` does not work. To talk to a *host* rootless daemon under another UID, use the basic flavour and bind-mount that daemon's socket instead.

## Basic flavour

The default image ships no daemon of its own, so jobs that use `docker://` images need one from outside the container — usually the host's socket:

```bash
docker run -d --name my_runner \
  -e GITEA_INSTANCE_URL=<instance_url> \
  -e GITEA_RUNNER_REGISTRATION_TOKEN=<registration_token> \
  -e GITEA_RUNNER_NAME=<runner_name> \
  -v $PWD/data:/data \
  -v /var/run/docker.sock:/var/run/docker.sock \
  docker.io/gitea/runner:2
```

This flavour does not need `--privileged`. The trade-off is that jobs share the host's daemon and can therefore see its other containers and images. A job that can reach the socket can also read the reusable `GITEA_RUNNER_REGISTRATION_TOKEN` from the runner container's `docker inspect` output.

## Docker-in-Docker

The `dind` flavour bundles its own daemon, so no socket has to be mounted:

```bash
docker run -d --name my_runner --privileged \
  -e GITEA_INSTANCE_URL=<instance_url> \
  -e GITEA_RUNNER_REGISTRATION_TOKEN=<registration_token> \
  -v $PWD/data:/data \
  docker.io/gitea/runner:2-dind
```

`s6` starts `dockerd` first and the runner service waits for it before registering. Use `2-dind-rootless` to run both the daemon and the runner as an unprivileged user; rootless Docker's usual limitations around networking, cgroups and storage drivers apply.

## Volumes

Two different pieces of state are worth persisting, and neither implies the other:

- `/data` is the runner's working directory. It holds the `.runner` registration file and, optionally, the config file. Without it, a recreated container registers itself again as a new runner, leaving a stale entry in Gitea, and fails outright if the token has been reset in the meantime.
- the Docker daemon's data root holds the images pulled for jobs. It is **not** under `/data`: for `dind` it is `/var/lib/docker` inside the container, for `dind-rootless` it is `/home/rootless/.local/share/docker`. Give it its own volume, or every new container re-pulls the job images.

## Entrypoint environment variables

The entrypoint ([`scripts/run.sh`](https://gitea.com/gitea/runner/src/branch/main/scripts/run.sh)) understands:

| Variable | Meaning |
| --- | --- |
| `GITEA_INSTANCE_URL` | instance to register against, e.g. `https://gitea.example.com/` |
| `GITEA_RUNNER_REGISTRATION_TOKEN` | registration token; unset before the daemon starts |
| `GITEA_RUNNER_REGISTRATION_TOKEN_FILE` | file to read the token from, for Docker/Kubernetes secrets |
| `GITEA_RUNNER_NAME` | runner name, defaults to the container hostname |
| `GITEA_RUNNER_LABELS` | labels, passed to both `register` and `daemon` |
| `GITEA_RUNNER_EPHEMERAL` | any non-empty value registers the runner as [ephemeral](../registration.md#ephemeral-runners) |
| `GITEA_RUNNER_ONCE` | any non-empty value runs a single job, then exits |
| `GITEA_MAX_REG_ATTEMPTS` | registration attempts before giving up, default `10` |
| `RUNNER_STATE_FILE` | registration file name inside `/data`, default `.runner` |
| `CONFIG_FILE` | config file inside the container, passed as `--config` |

These are entrypoint variables, not runner settings: the runner process itself is configured only through the [config file](../configuration.md).

Mount the config file when you need one:

```bash
docker run -v $PWD/config.yaml:/config.yaml -e CONFIG_FILE=/config.yaml ...
```

A config file can be generated with the image itself:

```bash
docker run --rm --entrypoint="" docker.io/gitea/runner:2 gitea-runner generate-config > config.yaml
```

## docker compose

```yaml
services:
  runner:
    image: docker.io/gitea/runner:2
    restart: always
    environment:
      CONFIG_FILE: /config.yaml
      GITEA_INSTANCE_URL: "${INSTANCE_URL}"
      GITEA_RUNNER_REGISTRATION_TOKEN: "${REGISTRATION_TOKEN}"
      GITEA_RUNNER_NAME: "${RUNNER_NAME}"
      GITEA_RUNNER_LABELS: "${RUNNER_LABELS}"
    volumes:
      - ./config.yaml:/config.yaml
      - ./data:/data
      - /var/run/docker.sock:/var/run/docker.sock
```

When Gitea runs in the same compose project, depend on its health check so the runner does not try to register before the instance answers:

```yaml
    depends_on:
      gitea:
        condition: service_healthy
        restart: true
```

The rootless Docker-in-Docker variant needs a few extra options:

```yaml
services:
  runner:
    image: docker.io/gitea/runner:2-dind-rootless
    restart: always
    privileged: true
    security_opt:
      # for hosts running AppArmor (Ubuntu, Debian), whose default profile blocks
      # the user namespace changes the bundled daemon needs
      - apparmor=rootlesskit
    volumes:
      - ./data/runner:/data
    environment:
      - GITEA_INSTANCE_URL=<instance_url>
      - GITEA_RUNNER_REGISTRATION_TOKEN=<registration_token>
      - DOCKER_HOST=unix:///var/run/user/1000/docker.sock
      # slirp4netns gives significantly better network throughput than vpnkit
      - DOCKERD_ROOTLESS_ROOTLESSKIT_NET=slirp4netns
      - DOCKERD_ROOTLESS_ROOTLESSKIT_MTU=65520
```

## Cache from a dockerized runner

A runner in a container creates a separate network per job by default, so the address it detects for its own cache server is often unreachable from job containers and `actions/cache` fails with a connection timeout. Set `cache.host` and `cache.port` explicitly and publish that port, or put the job containers on a shared network — see [Caching](../cache.md#dockerized-runners).

More deployment examples live in the [`examples`](https://gitea.com/gitea/runner/src/branch/main/examples) directory of the runner repository.
