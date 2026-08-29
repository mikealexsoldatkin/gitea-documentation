---
sidebar_position: 3
---

# Install on Kubernetes

Ready-to-adapt manifests live in [`examples/kubernetes`](https://gitea.com/gitea/runner/src/branch/main/examples/kubernetes) of the runner repository, and a Helm chart is maintained at [gitea/helm-actions](https://gitea.com/gitea/helm-actions).

## Choosing a manifest

| Example | Shape | Docker daemon |
| --- | --- | --- |
| `dind-docker.yaml` | `Deployment` with a native sidecar (`initContainer` with `restartPolicy: Always`, needs Kubernetes 1.29+) | privileged `docker:dind` sidecar, socket shared through an `emptyDir` |
| `statefulset-dind.yaml` | `StatefulSet` with `volumeClaimTemplates` | same as above |
| `rootless-docker.yaml` | `Deployment` with a single container | bundled rootless daemon of the `dind-rootless` image, reached over `tcp://localhost:2376` with TLS |

Prefer the `StatefulSet` variant when you scale past one replica: each pod then gets a stable identity and its own volume, so it keeps its `.runner` registration across restarts and reschedules instead of registering itself again as a new runner.

## Two volumes, two purposes

- `/data` — the runner's working directory, holding the `.runner` registration file and optionally the config file.
- the daemon's data root — `/var/lib/docker` for the `dind` sidecar, `/home/rootless/.local/share/docker` for `dind-rootless`. It holds the images pulled for jobs and is *not* under `/data`. Dropping it still works, but every recreated pod re-pulls all job images.

With the rootless image, both volumes must be writable by UID/GID 1000, which is what `securityContext.fsGroup: 1000` in the example is for.

## Registration token

The examples read the token from a `Secret`:

```yaml
env:
  - name: GITEA_INSTANCE_URL
    value: http://gitea-http.gitea.svc.cluster.local:3000
  - name: GITEA_RUNNER_REGISTRATION_TOKEN
    valueFrom:
      secretKeyRef:
        name: runner-secret
        key: token
```

The token stays valid for further registrations until it is reset, but each registration creates another runner entry. For pods that are recreated without their volume, use the instance-wide token configured on the Gitea side, and expect stale runner entries — or start an [ephemeral runner](../registration.md#ephemeral-runners) per job.

## Privileges

Docker-in-Docker needs `securityContext.privileged: true`, which lets a malicious job break out of the container. Weigh that against the alternatives:

- the rootless flavour, which reduces but does not remove the exposure;
- pointing the basic flavour at a daemon outside the cluster;
- keeping such runners on a dedicated node pool and only granting them to trusted repositories.
