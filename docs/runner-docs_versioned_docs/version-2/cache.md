---
sidebar_position: 5
---

# Caching

Every runner starts its own cache server, so `actions/cache` works without any configuration. Cache entries are local to that runner: two runners do not share a cache unless you make them.

Only the cache service v1 API is served in this version, so `actions/cache` has to be pinned to a version that still speaks it (up to `v4.1`), and artifacts need the `gitea-upload-artifact` / `gitea-download-artifact` forks. Runner `3.0` adds cache service v2, which the stock actions use.

## Where cache blobs are stored

```yaml
cache:
  enabled: true
  dir: /var/lib/gitea-runner/cache   # default: $HOME/.cache/actcache
```

The directory grows with use; entries are evicted as they expire, so give it a filesystem with room to spare and monitor it like any other build cache.

## Dockerized runners

When the runner itself runs in a container and creates a network per job, the address it detects for its own cache server is often unreachable from the job containers. `actions/cache` then fails with:

```text
Failed to restore: getCacheEntry failed: connect ETIMEDOUT IP:PORT
```

Pin the address and the port the job containers should use, and make that endpoint reachable:

1. take an address of the host that job containers can reach, and a free port on it;
2. configure them:

   ```yaml
   cache:
     enabled: true
     dir: ""
     host: "192.168.8.17"
     port: 8088
   ```

3. publish the port when starting the runner container:

   ```bash
   docker run -d --name gitea-runner -p 8088:8088 ... docker.io/gitea/runner:2
   ```

Putting the runner and the job containers on one shared `container.network` instead works too, and then the auto-detected address is reachable.

## Sharing a cache between runners

Run one dedicated cache server that every runner points at.

1. Config for the cache server host:

   ```yaml
   cache:
     dir: /data/actcache
     port: 8088
     external_secret: "replace-with-a-strong-random-secret"
     # external_secret_file: /run/secrets/cache-secret  # or keep it out of this file
   ```

2. Start it:

   ```bash
   gitea-runner -c cache-server-config.yaml cache-server
   ```

3. On every runner:

   ```yaml
   cache:
     external_server: "http://cache-host:8088/"
     external_secret: "replace-with-a-strong-random-secret"  # must match the server
   ```

The secret authenticates runners against the shared server and must be identical on all of them; generate one with `openssl rand -hex 32`. Setting both `external_secret` and `external_secret_file` is an error.

`cache-server` accepts `--dir`, `--host` and `--port`, which override the corresponding `cache.*` keys. Every other setting, `external_secret` included, has to come from the config file.

### Alternatives

- **Shared filesystem** — mount the same NFS/CIFS share on every runner and point `cache.dir` at it. Simpler, but repositories are less isolated from each other than behind a cache server.
- **Object storage** — mount S3 or MinIO as a FUSE filesystem, e.g. with [s3fs](https://github.com/s3fs-fuse/s3fs-fuse) or [goofys](https://github.com/kahing/goofys), and set `cache.dir` to the mount point.

## Action repository cache

Actions pulled by `uses:` are cached too, and by default refreshed on every job so a moved tag is picked up. To pin them to what has already been fetched:

```yaml
cache:
  offline_mode: true
```

A re-tagged `v6` or an updated branch then stays at the cached commit until its entry expires or is removed. Combined with `runner.action_shallow_clone` (on by default, fetching only the requested ref at depth 1), this keeps job startup fast on runners with limited bandwidth.
