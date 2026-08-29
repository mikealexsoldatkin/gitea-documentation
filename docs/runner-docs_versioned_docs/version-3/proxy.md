---
sidebar_position: 6
---

# Proxies

The runner reads the usual proxy variables from its own environment and passes them on to every job:

```sh
http_proxy=http://proxy.example:3128
https_proxy=http://proxy.example:3128
no_proxy=gitea.internal,.example.local
```

Set them where the process is started — `Environment=` in a systemd unit, `docker run -e`, or `env:` in Kubernetes. They are used for the runner's own requests and are given to jobs in both lower and upper case.

## What is exempted automatically

These are added to `no_proxy` for jobs, so they are always reached directly:

- the cache server
- `localhost`, `127.0.0.1` and `::1`
- the job's service containers
- the Docker daemon, when it is reached over `tcp://`

The Gitea instance is **not** added. Add it to `no_proxy` yourself if it should be reached directly.

## Overriding per job or per runner

| Scope | Where to set it |
| --- | --- |
| one step | the step's `env:` |
| one job | the job's `container.env` |
| the whole runner | `runner.envs` in the config; a `no_proxy` set there is added to the list above instead of replacing it |

Setting proxy variables at workflow or job level (outside `container.env`) has no effect.

## The Docker daemon needs its own setting

Images are pulled by the daemon, not by the runner, so the daemon needs its own proxy configuration. In the `dind` images the daemon shares the container's environment and picks the variables up; for any other daemon see [the Docker documentation](https://docs.docker.com/engine/daemon/proxy/). The runner logs a warning at startup when it has a proxy configured and the daemon does not.

Dockerfile actions are built with these variables passed as build arguments, so their `RUN` steps can reach the network.

## Credentials in proxy URLs

A password inside a proxy URL is masked in job logs, but any step can still read it: the step is given the proxy URL in its environment. Prefer a proxy that does not need credentials, or one that authenticates by source address.
