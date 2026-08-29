---
sidebar_position: 2
---

# Post-task script

The post-task script is an optional host hook that runs **once after every task**, after the runner has finished its normal per-task cleanup. Typical uses are pruning Docker images, vacuuming ephemeral disks, or resetting VM state between jobs.

```yaml
runner:
  # Path to an executable on the host. Empty or omitted disables the hook.
  post_task_script: /usr/local/bin/gitea-post-task.sh
  # Hard limit on script runtime. Default when post_task_script is set: 5m.
  post_task_script_timeout: 2m
```

| Option | Default | Description |
| --- | --- | --- |
| `runner.post_task_script` | disabled | host path to the script or binary. Relative paths are resolved from the runner's working directory. |
| `runner.post_task_script_timeout` | `5m` when a script is set | maximum runtime before the runner kills the script and moves on. |

## When it runs

For each task, the order is:

1. the workflow runs (steps, actions, containers);
2. in-job cleanup (action `post:` steps, container stop and removal);
3. job outputs are reported to Gitea;
4. the bind-workdir workspace is removed, when `container.bind_workdir` is enabled;
5. **the post-task script**;
6. the final task acknowledgement to Gitea.

The script is **additive**: it does not replace any built-in cleanup. With `container.bind_workdir` enabled, the workspace directory has usually already been deleted before the script starts, but `GITEA_WORKSPACE` still names the path the job used.

## The runner stays offline until the script finishes

This is the most important operational detail. When the script starts, the runner **stops sending task heartbeats**, so from Gitea's perspective it is not available for new work until the script exits and the final task flush has been sent.

While the script runs:

- Gitea does not assign another task to this runner for the current job slot;
- the capacity slot stays occupied locally — with `capacity: 1`, no other task starts;
- a shutdown counts this phase as part of the in-flight task, so a slow script delays graceful shutdown.

If the script never exits, the runner stays in this state until `runner.post_task_script_timeout` elapses (default **5 minutes**), then kills it and proceeds. Set that timeout to what your housekeeping is allowed to take, and keep the script short and bounded.

## Environment variables

The script receives `runner.envs` / `runner.env_file` values plus:

| Variable | Description |
| --- | --- |
| `GITEA_TASK_ID` | numeric task ID |
| `GITEA_RUN_ID` | workflow run ID, when the server provides it |
| `GITEA_REPOSITORY` | repository slug (`owner/name`) |
| `GITEA_WORKSPACE` | workspace path the job used, which may already be deleted |
| `GITEA_JOB_RESULT` | `success`, `failure`, `cancelled`, `skipped` or `unknown` |

The environment is **not** a copy of the job container's. Even `PATH` is only present if `runner.envs` or `runner.env_file` defines it.

## Output and errors

- stdout and stderr go to the **runner process log**, prefixed with `post-task script stdout:` / `post-task script stderr:` — not to the job log;
- a non-zero exit is logged as a warning and does not change the job result already reported to Gitea;
- timeouts and start failures are warnings too; the runner still acknowledges the task.

## Interaction with other timeouts

| Timeout | Effect on the post-task script |
| --- | --- |
| `runner.post_task_script_timeout` | kills the script if it runs too long. The **only** timeout that bounds it. |
| `runner.timeout` | caps the task **up to** the script. The script detaches from the task deadline, so a job that nearly hit the runner timeout does not cut it short. |
| `runner.shutdown_timeout` | bounds how long a shutdown waits for the **task**. The script detaches from cancellation and may extend shutdown until its own timeout elapses. |

## Examples

Prune dangling Docker resources on Linux:

```sh
#!/bin/sh
set -eu
docker image prune -f
docker builder prune -f --filter 'until=24h'
```

On Windows, use a `.exe`, `.bat` or `.cmd` path; `.ps1` is not supported as the configured path, so wrap PowerShell in a batch file:

```bat
@echo off
powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "%~dp0post-task.ps1"
```

`.sh` files on Windows need a Unix shell on `PATH`, unless `post_task_script` points at the interpreter itself.

## Notes

- `gitea-runner exec` does not load the runner YAML and never runs this hook.
- Use idempotent operations: the script runs after success, failure and cancellation alike.
- Watch the runner log when testing failure modes — a hung script, a non-zero exit, a missing executable.
- Bind-workdir idle cleanup (`runner.workdir_cleanup_age`) is separate from this hook and only runs while the runner is idle.
- For work that has to happen inside the job environment, use [job hooks](job-hooks.md) instead.
