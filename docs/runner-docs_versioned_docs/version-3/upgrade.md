---
sidebar_position: 8
---

# Upgrading

A runner upgrade is a binary or image replacement: stop the daemon, swap it, start it again. The registration file stays valid across versions, so a runner keeps its identity and does not have to be registered again.

```bash
sudo systemctl stop gitea-runner
sudo install -m 0755 gitea-runner-<version>-linux-amd64 /usr/local/bin/gitea-runner
sudo systemctl start gitea-runner
```

With `runner.shutdown_timeout` set, `stop` lets the jobs in flight finish first; without it, they are cancelled and Gitea reschedules them.

Config files are read leniently: keys the running version does not know are reported as a warning and ignored, so one file can be shared by runners of different versions. Compare your file with `gitea-runner generate-config` after an upgrade to pick up new options.

## 3.0

### Breaking

- **Container options from workflows are filtered.** While `container.privileged` is disabled, options in a job's `container.options` that would escape the container are stripped with a warning: `--pid`, `--ipc`, `--uts`, `--cgroupns`, `--userns`, `--cap-add`, `--security-opt`, `--device`, `--device-cgroup-rule`, `--gpus`, `--volumes-from`, `--runtime`, `--cgroup-parent`, `--sysctl`. Workflows that relied on them need a runner with privileged mode enabled.
- **One process per registration file.** The daemon takes an advisory lock on `<runner.file>.lock` and refuses to start when another process already uses that file. Setups that started several runners from one directory must give each its own `runner.file` (or its own working directory).
- **Cache service v2 is served and enabled by default.** `actions/cache@v4.2` and later, and the stock `actions/upload-artifact` / `download-artifact` from `v4.4.0` on, reach it through a patch the runner applies to the action's own bundle. Jobs are pointed at the runner's cache server as their results service, which then forwards artifact calls to Gitea. Set `cache.v2: false` to keep to v1.

### Also new

- [Job hooks](hooks/job-hooks.md) (`runner.hooks.job_started` / `job_completed`) running inside the job environment.
- [Proxy variables](proxy.md) propagated to jobs, service containers and Dockerfile action builds.
- Secrets are masked in the log even when a job prints them in an encoded form.
- The tool cache can be relocated, and runner-managed paths can be mounted over, via `container.options`.

## 2.0

### Breaking

- **`DOCKER_USERNAME` / `DOCKER_PASSWORD` are no longer implicit pull credentials.** They used to be attached to every image pull, which sent private-registry credentials to Docker Hub for public images. They are ordinary secrets now. Migrate to:
  - `container.credentials` (and service `credentials`) in the workflow for private images;
  - a `docker login` performed on the runner host, or a [job hook](hooks/job-hooks.md), for private `uses: docker://...` actions.
- **`container.force_pull` now defaults to `false`** in the generated example config, so images already present are reused unless you ask for a pull.
- **No environment variable overrides for the config.** `GITEA_DEBUG`, `GITEA_TRACE`, `GITEA_RUNNER_CAPACITY`, `GITEA_RUNNER_FILE`, `GITEA_RUNNER_ENVIRON` and `GITEA_RUNNER_ENV_FILE` are ignored; use a config file. The Docker images' [entrypoint variables](installation/docker.md#entrypoint-environment-variables) are unaffected.

### Also new

- [Post-task script](hooks/post-task-script.md) (`runner.post_task_script`) for host housekeeping between jobs.
- [Health checks](monitoring.md#local-health-checks) (`health_check.*`) that pause task admission on low disk space or a failing script.
- `register --token-file`, and `GITEA_RUNNER_LABELS` honoured by `daemon`, so labels can change without re-registering.
- `jobs.<job_id>.timeout-minutes` and `jobs.<job_id>.continue-on-error` support, job summaries, shallow action clones (`runner.action_shallow_clone`), `ssh://` action URLs, IPv4/IPv6 options for auto-created networks, `--platform` and `--pull` in `container.options`, `cache.external_secret_file`, a GitHub-style "Set up job" log section, and pre/post entrypoints of Docker actions.

## Downgrading

Downgrading a runner is possible — the registration file format has not changed — but a config file written for a newer version may carry keys the older one ignores, and features such as cache service v2 stop being served, so jobs that came to rely on them fail. Test a downgrade with a spare runner before doing it on a busy pool.
