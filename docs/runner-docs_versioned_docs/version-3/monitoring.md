---
sidebar_position: 7
---

# Monitoring and health

## Prometheus metrics

```yaml
metrics:
  enabled: true
  addr: "127.0.0.1:9101"
  readiness_grace: 30s
```

With `metrics.enabled`, the runner serves three endpoints on `metrics.addr`:

| Endpoint | Purpose |
| --- | --- |
| `/metrics` | Prometheus exposition of the runner's own metrics |
| `/healthz` | liveness: the process is up |
| `/readyz` | task admission: `503` while a [health check](#local-health-checks) reports the machine as unavailable, once polling has been failing for longer than `readiness_grace`, or after the runner has been deleted on the instance |

There is **no authentication** on this listener. The default address binds to localhost only; expose it more widely (`":9101"`) only behind a firewall or a scrape-only network.

All series are prefixed with `gitea_runner_`, among them:

| Metric | Meaning |
| --- | --- |
| `gitea_runner_info` | always `1`, with the version and runner name as labels |
| `gitea_runner_uptime_seconds` | seconds since the daemon started |
| `gitea_runner_capacity` / `gitea_runner_job_running` / `gitea_runner_job_capacity_utilization_ratio` | configured capacity, jobs in flight, and their ratio |
| `gitea_runner_job_total` | jobs by result (`success`, `failure`, `cancelled`, `skipped`, `unknown`) |
| `gitea_runner_job_duration_seconds` | job duration histogram |
| `gitea_runner_poll_fetch_total` / `gitea_runner_poll_fetch_duration_seconds` | task fetches by result (`task`, `empty`, `error`) and their latency |
| `gitea_runner_poll_backoff_seconds` | last polling backoff interval |
| `gitea_runner_report_log_total` / `gitea_runner_report_state_total` | log and state reports by result |
| `gitea_runner_report_log_buffer_rows` | log rows buffered but not yet sent |
| `gitea_runner_client_errors_total` | RPC errors by method |

Useful things to alert on: `gitea_runner_poll_fetch_total{result="error"}` rising (the instance is unreachable or the runner was deleted), a `capacity_utilization_ratio` pinned at `1` (the pool is too small), and a growing `report_log_buffer_rows` (log delivery is falling behind).

## Local health checks

Health checks let a runner take itself out of rotation when the machine it runs on is not fit for work — most commonly when the disk is full.

```yaml
health_check:
  enabled: false
  min_free_disk_space_mb: 1024
  script: ''
  interval: 30s
  timeout: 10s
```

- while a check fails, the runner stops fetching **new** tasks; jobs already running are unaffected and finish normally;
- no check runs while a job is active — the last result is reused until the runner is idle again;
- `min_free_disk_space_mb` is measured on the filesystem holding the runner's workspaces, and defaults to 1024 MiB when omitted or zero;
- `script` is any executable. A non-zero exit, a timeout, or a failure to start marks the runner unavailable. Its result is cached for `interval` and it is killed after `timeout`;
- recovery is automatic and logged (`runner local health recovered, resuming task polling`), and the state is reflected by `/readyz`.

## Logs

The runner logs to stderr; `log.level` controls the verbosity, with `debug` and `trace` adding `file:line` to each line. Under systemd the log ends up in the journal (`journalctl -u gitea-runner`), in Docker in `docker logs`.

The runner log is not the job log: step output is streamed to Gitea and is tuned with the `runner.log_report_*` settings, while things like [post-task script](hooks/post-task-script.md) output only ever appear in the runner log.

## Reporting a problem

`gitea-runner bug-report` prints the version, Go version, OS/architecture and CPU count — paste its output into an issue at [gitea/runner](https://gitea.com/gitea/runner/issues):

```bash
gitea-runner bug-report
```

```text
Runner version: 3.0.2
Go version:     go1.26.5
OS/Arch:        linux/amd64
NumCPU:         8
```

To reproduce a workflow locally, without a Gitea instance and without touching the runner's registration, use `gitea-runner exec` — see the [command line reference](reference/cli.md#exec).
