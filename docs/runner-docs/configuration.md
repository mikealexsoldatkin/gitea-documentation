---
sidebar_position: 3
---

# Configuration

The runner is configured with a single YAML file. It is optional: without one, the built-in defaults apply, which are the same as an empty YAML document and safe to run with.

```bash
gitea-runner generate-config > config.yaml
gitea-runner -c config.yaml register
gitea-runner -c config.yaml daemon
```

`-c` / `--config` is a global flag and is accepted by every command that loads configuration (`register`, `daemon`, `cache-server`). The generated file is fully commented and is reproduced in [Example configuration](reference/config-example.md).

:::warning No environment variable overrides
The runner process is configured only through the YAML file. Earlier releases let a few variables (`GITEA_DEBUG`, `GITEA_TRACE`, `GITEA_RUNNER_CAPACITY`, `GITEA_RUNNER_FILE`, `GITEA_RUNNER_ENVIRON`, `GITEA_RUNNER_ENV_FILE`) override parts of the config; those overrides have been removed.

The variables understood by the Docker images belong to their [entrypoint](installation/docker.md#entrypoint-environment-variables), not to the runner, and `GITEA_RUNNER_LABELS` / `GITEA_RUNNER_REGISTRATION_TOKEN` are read by the corresponding CLI flags only.
:::

Values with a duration type accept Go duration strings such as `30s`, `10m`, `3h`.

## `log`

Controls the runner's own log, not how step output is streamed to the UI.

| Option | Default | Description |
| --- | --- | --- |
| `log.level` | `info` | `trace`, `debug`, `info`, `warn`, `error`, `fatal` or `panic`. `trace` and `debug` add the caller's `file:line`. |

## `runner`

| Option | Default | Description |
| --- | --- | --- |
| `file` | `.runner` | path of the registration file. Each runner process needs its own. |
| `capacity` | `1` | jobs executed concurrently. With an empty `container.network`, every concurrent docker job takes a subnet from the daemon's address pool, so a high capacity can exhaust it (see `default-address-pools` in the daemon config). |
| `envs` | – | extra environment variables given to every job. |
| `env_file` | `.env` | same, read from a file; ignored when empty or missing. |
| `timeout` | `3h` | maximum job duration. Gitea has its own timeout (3h by default) and may stop the job earlier. |
| `shutdown_timeout` | `0s` | how long a shutdown waits for running jobs before cancelling them. |
| `insecure` | `false` | skip TLS verification of the Gitea instance. |
| `fetch_timeout` | `5s` | timeout of a single job fetch. |
| `fetch_interval` | `2s` | base polling interval. |
| `fetch_interval_max` | `5s` | upper bound of the exponential backoff applied while idle. `0`, or the same value as `fetch_interval`, disables the backoff. |
| `labels` | see [Labels](labels.md) | labels used at registration, and by `daemon` when the flag is absent. |
| `github_mirror` | – | replaces `https://github.com` when actions are pulled and the instance's `DEFAULT_ACTIONS_URL` points at GitHub. |
| `action_shallow_clone` | `true` | fetch only the requested ref of an action repository at depth 1 instead of its full history. |
| `set_act_env` | `true` | inject `ACT=true` into jobs. Set to `false` so workflows gated on `if: ${{ !env.ACT }}` behave as they do on GitHub. |
| `allocate_pty` | `false` | allocate a pseudo-TTY per step. Enable only when a job needs an interactive terminal; tools like `docker build` then write redrawing progress frames into the log. |
| `workdir_cleanup_age` | `24h` | age at which stale task workspaces and orphaned host-mode scratch directories are removed while idle. |
| `idle_cleanup_interval` | `10m` | cadence of the idle cleanup pass. Setting either this or `workdir_cleanup_age` to `0` disables all idle cleanup. |
| `post_task_script` | – | host script run after each task's cleanup, see [Post-task script](hooks/post-task-script.md). |
| `post_task_script_timeout` | `5m` | hard limit for that script. |
| `hooks.job_started` / `hooks.job_completed` | – | scripts run inside the job environment, see [Job hooks](hooks/job-hooks.md). |

Log and state reporting can be tuned when the UI updates too slowly or the instance sees too many requests:

| Option | Default | Description |
| --- | --- | --- |
| `log_report_interval` | `5s` | base interval of the periodic log flush. |
| `log_report_max_latency` | `3s` | maximum time a single log row waits. Only has an effect below `log_report_interval`. |
| `log_report_batch_size` | `100` | flush immediately once this many rows are buffered, so bursty output arrives promptly. |
| `state_report_interval` | `5s` | interval of task state reports. State is also sent on every step transition. |
| `report_close_timeout` | `10s` | per-attempt deadline for the final log and state flush of a finished job. |

### Idle cleanup

While no job is running, the runner cleans up after earlier ones:

- stale task workspaces older than `workdir_cleanup_age` are removed when `container.bind_workdir` is enabled. Only purely numeric subdirectories of `container.workdir_parent` are treated as workspaces, and the path is assumed not to be shared with another runner;
- orphaned host-mode scratch directories are removed on the same schedule;
- per-job docker networks left behind by jobs the runner did not live to tear down are removed. They are recognised by the `com.gitea.runner.uuid` label carrying this runner's uuid, so leftovers of other runners on the same daemon are left alone. Without this, each leaked network keeps holding a subnet of the daemon's address pool.

## `cache`

See [Caching](cache.md) for the full picture, including shared cache servers.

| Option | Default | Description |
| --- | --- | --- |
| `enabled` | `true` | run the built-in cache server used by `actions/cache` and friends. |
| `dir` | `$HOME/.cache/actcache` | where cache blobs are stored. Ignored with `external_server`. |
| `host` | – | address job containers use to reach this runner's cache server. Empty means auto-detect; `0.0.0.0` is not valid. |
| `port` | `0` | port of the built-in server, `0` picks a free one. |
| `external_server` | – | URL of a shared `cache-server` to use instead of a local one. |
| `external_secret` | – | shared secret, required with `external_server`; must be identical everywhere. Generate with `openssl rand -hex 32`. |
| `external_secret_file` | – | read that secret from a file instead. Setting both is an error. |
| `offline_mode` | `false` | reuse a cached action instead of fetching it on every job. A moved tag or updated branch then stays at the cached commit until the entry expires or is removed. |
| `v2` | `true` | serve the cache service v2 API used by `actions/cache@v4.2` and later. |

## `container`

Applies to jobs that run in containers.

| Option | Default | Description |
| --- | --- | --- |
| `network` | – | network the job container joins: `host`, `bridge`, or a custom network name. Empty means the runner creates one per job. `network_mode` is still accepted for old configs. |
| `network_create_options.enable_ipv4` / `enable_ipv6` | Docker defaults | only apply to auto-created networks. IPv6 additionally requires `dockerd --ipv6`. |
| `privileged` | `false` | run job containers privileged; required for Docker-in-Docker inside jobs. |
| `options` | – | extra `docker run` options, e.g. `--add-host=my.gitea.url:host-gateway`. A volume declared here replaces the one the runner mounts on the same container path, which is how the tool cache can be kept on the host (`--volume /host/toolcache:/opt/hostedtoolcache`); its source must also be allowed by `valid_volumes`. |
| `workdir_parent` | `/workspace` | parent directory of a job's working directory inside the container. A leading `/` is trimmed and re-added. |
| `valid_volumes` | `[]` | volumes and bind mounts a job may mount, as [glob](https://github.com/gobwas/glob) patterns. `[]` forbids all, `['**']` allows all. |
| `docker_host` | – | override the docker host. Empty auto-detects it, `-` auto-detects it but does not mount the socket into job containers. |
| `force_pull` | `false` | pull images even when present. Images pinned by digest are never re-pulled, and a failed pull with a local copy available only warns. |
| `force_rebuild` | `false` | rebuild local action images even when present. |
| `require_docker` | `false` | always require a reachable daemon, even for host-only labels. |
| `docker_timeout` | `0s` | how long to wait for the daemon to become reachable. |
| `bind_workdir` | `false` | bind-mount the workspace from the host instead of using a docker volume. Needed for jobs that use `docker compose` with bind mounts under Docker-in-Docker. The parent directory must then be mounted into the runner container and listed in `valid_volumes`. |

:::note Privileged mode and workflow container options
A workflow's own `jobs.<job_id>.container.options` are untrusted input. While `container.privileged` is disabled, the options that would break out of the container are stripped with a warning in the job log: `--pid`, `--ipc`, `--uts`, `--cgroupns`, `--userns`, `--cap-add`, `--security-opt`, `--device`, `--device-cgroup-rule`, `--gpus`, `--volumes-from`, `--runtime`, `--cgroup-parent` and `--sysctl`. They are honoured once privileged mode is enabled, because the operator has then opted into host access.
:::

## `host`

| Option | Default | Description |
| --- | --- | --- |
| `host.workdir_parent` | `$HOME/.cache/act/` | parent directory of a job's working directory for host-mode jobs. |

## `health_check` and `metrics`

Both are covered in [Monitoring](monitoring.md).

| Option | Default | Description |
| --- | --- | --- |
| `health_check.enabled` | `false` | pause fetching new tasks while the machine looks unhealthy. |
| `health_check.min_free_disk_space_mb` | `1024` | minimum free space on the filesystem holding the workspaces. |
| `health_check.script` | – | extra executable; a non-zero exit, a timeout or a start failure marks the runner unavailable. |
| `health_check.interval` | `30s` | how long a result is cached. |
| `health_check.timeout` | `10s` | maximum script runtime. |
| `metrics.enabled` | `false` | serve `/metrics`, `/healthz` and `/readyz`. |
| `metrics.addr` | `127.0.0.1:9101` | listen address. There is no authentication, so only expose it behind a firewall. |
| `metrics.readiness_grace` | `30s` | how long consecutive polling failures may last before `/readyz` returns 503. |

## Reloading

The runner reads its configuration at startup only. Restart the process after a change — with `shutdown_timeout` set, running jobs are given that much time to finish first.
