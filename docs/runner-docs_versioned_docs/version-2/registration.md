---
sidebar_position: 2
---

# Registering a runner

A runner has to be registered before it can pick up jobs: registration is what tells the runner where to fetch jobs from, and what gives the Gitea instance a stable identity for the runner.

## Obtain a registration token

Registration tokens are issued by the Gitea instance and can be scoped to the whole instance, an organization/user, or a single repository. See [Actions runners](/usage/actions/runner) for where to find them in the UI and via the API.

One token can register any number of runners and stays valid until it is reset in the UI or through the API. Instance administrators can also hand Gitea a fixed token with `GITEA_RUNNER_REGISTRATION_TOKEN` / `GITEA_RUNNER_REGISTRATION_TOKEN_FILE` at startup, which is what makes disposable runners practical.

## Interactive registration

```bash
gitea-runner register
# or with a config file
gitea-runner -c config.yaml register
```

The runner asks for:

- the instance URL, e.g. `https://gitea.com/` or `http://192.168.8.8:3000/` — use the instance's `ROOT_URL`, not `localhost`, when Gitea and the runner are in different containers or hosts;
- the registration token;
- the runner name, defaulting to the hostname;
- the [labels](labels.md), defaulting to the built-in list, or to `runner.labels` when the config file sets it.

## Non-interactive registration

```bash
gitea-runner register --no-interactive \
  --instance <instance_url> \
  --token <registration_token> \
  --name <runner_name> \
  --labels <runner_labels>
```

The token can be kept off the command line, where it would show up in the process list and in shell history:

- `--token-file <path>` reads it from a file, e.g. a Docker or Kubernetes secret;
- the `GITEA_RUNNER_REGISTRATION_TOKEN` environment variable is used when neither flag is given.

## The registration file

A successful registration writes a `.runner` file (`runner.file` in the config) into the current working directory. It holds the runner's identity and its API credentials, so:

- do not edit it by hand, and do not copy it to a second machine;
- back it up or put it on a persistent volume, otherwise a recreated runner registers as a *new* runner and leaves a stale entry behind — and fails outright if the token has been reset in the meantime;
- if it is lost or corrupted, delete it and register again.

Each runner process needs its own registration file. Two processes sharing one file are indistinguishable to Gitea and cancel each other's jobs; this version does not detect that, so give every runner its own `runner.file` or its own working directory. Runner `3.0` refuses to start in that situation.

## Ephemeral runners

An ephemeral runner accepts exactly one job and then exits. Once a job has been assigned, its credentials are revoked, so it cannot poll for more work before the job's untrusted code runs; it can still report progress until the job finishes.

This is how organization-wide or instance-wide runners can be offered without trusting every repository that may use them, provided each runner is a fresh VM or container.

```bash
gitea-runner register --ephemeral
gitea-runner register --no-interactive --ephemeral --instance <instance_url> --token <registration_token>
```

With the Docker images, set `GITEA_RUNNER_EPHEMERAL=1` instead; no `/data` volume is needed, since the credentials are single-use:

```bash
docker run -d --name my_runner \
  -e GITEA_INSTANCE_URL=<instance_url> \
  -e GITEA_RUNNER_REGISTRATION_TOKEN=<registration_token> \
  -e GITEA_RUNNER_EPHEMERAL=1 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  docker.io/gitea/runner:2
```

Because a fresh registration is required for every job, ephemeral runners are usually started on demand from the `workflow_job` webhook, which fires when a job is queued.

`--ephemeral` is stricter than `daemon --once`: `--once` also stops after one job, but its credentials stay valid for as long as the runner is registered.

## Re-registering and unregistering

Running `register` again in a directory that already has a registration file asks whether to overwrite it. To retire a runner, delete it in the Gitea UI (or via the API) and remove its registration file; the daemon shuts itself down once the server no longer knows it.

Changing labels does not require re-registration — see [Labels](labels.md#registration-versus-config-labels).
