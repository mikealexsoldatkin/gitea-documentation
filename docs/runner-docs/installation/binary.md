---
sidebar_position: 1
---

# Install from a binary

The runner is a single static binary called `gitea-runner`. It has no dependencies apart from a Docker daemon for containerized jobs.

## Download

- released builds: [dl.gitea.com/gitea-runner](https://dl.gitea.com/gitea-runner/) or the [release page](https://gitea.com/gitea/runner/releases)
- development builds of the `main` branch: [dl.gitea.com/gitea-runner/nightly](https://dl.gitea.com/gitea-runner/nightly/)

Each file is published next to a `.sha256` checksum and an `.xz` compressed variant:

```bash
VERSION=nightly
curl -sSLO "https://dl.gitea.com/gitea-runner/$VERSION/gitea-runner-$VERSION-linux-amd64"
curl -sSLO "https://dl.gitea.com/gitea-runner/$VERSION/gitea-runner-$VERSION-linux-amd64.sha256"
sha256sum -c "gitea-runner-$VERSION-linux-amd64.sha256"
install -m 0755 "gitea-runner-$VERSION-linux-amd64" /usr/local/bin/gitea-runner
```

Check that the binary matches your platform:

```bash
gitea-runner --version
```

## Build from source

Building requires the Go version declared in the repository's `go.mod`:

```bash
git clone https://gitea.com/gitea/runner.git
cd runner
make build
```

## First run

```bash
gitea-runner generate-config > config.yaml   # optional, defaults are safe
gitea-runner -c config.yaml register         # see "Registering a runner"
gitea-runner -c config.yaml daemon
```

The `daemon` command runs in the foreground. It reads the registration file (`runner.file`, `.runner` by default) relative to its working directory, so keep the working directory stable across restarts.

## Run as a systemd service

Create an unprivileged user, install the binary, and register the runner as that user so the `.runner` file ends up in the service's working directory:

```bash
sudo useradd --system --home-dir /var/lib/gitea-runner --create-home gitea-runner
sudo install -d /etc/gitea-runner
sudo -u gitea-runner gitea-runner generate-config | sudo tee /etc/gitea-runner/config.yaml >/dev/null
cd /var/lib/gitea-runner
sudo -u gitea-runner gitea-runner register -c /etc/gitea-runner/config.yaml
```

Then install the unit as `/etc/systemd/system/gitea-runner.service`:

```ini
[Unit]
Description=Gitea Actions runner
Documentation=https://gitea.com/gitea/runner
After=network-online.target
Wants=network-online.target
# Uncomment when jobs use the local Docker daemon:
# After=docker.service
# Requires=docker.service

[Service]
Type=simple
ExecStart=/usr/local/bin/gitea-runner daemon --config /etc/gitea-runner/config.yaml
WorkingDirectory=/var/lib/gitea-runner
User=gitea-runner
Group=gitea-runner
Restart=on-failure
RestartSec=5s
# Allow running jobs to finish before the runner is stopped. Keep this in sync
# with runner.shutdown_timeout in the config.
TimeoutStopSec=3h

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now gitea-runner
```

If jobs use the host's Docker daemon, the `gitea-runner` user also needs access to the daemon socket. Adding it to the `docker` group grants that access and is [equivalent to root on the host](https://docs.docker.com/engine/security/#docker-daemon-attack-surface).

Environment variables for the process — most importantly [proxy variables](../proxy.md) — belong in `Environment=` lines or a drop-in file, not in the runner config.

## Run as a launchd daemon (macOS)

macOS uses `launchd` instead of systemd. Daemons run as `root` by default; an unprivileged `_gitea-runner` user can be created with `dscl`. Install the following as `/Library/LaunchDaemons/com.gitea.runner.plist` and adjust the paths to your installation:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.gitea.runner</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/gitea-runner</string>
        <string>daemon</string>
        <string>--config</string>
        <string>/etc/gitea-runner/config.yaml</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>WorkingDirectory</key>
    <string>/var/lib/gitea-runner</string>
    <key>StandardOutPath</key>
    <string>/var/lib/gitea-runner/runner.log</string>
    <key>StandardErrorPath</key>
    <string>/var/lib/gitea-runner/runner.err</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
        <key>HOME</key>
        <string>/var/lib/gitea-runner</string>
    </dict>
    <key>UserName</key>
    <string>_gitea-runner</string>
</dict>
</plist>
```

```bash
sudo launchctl load /Library/LaunchDaemons/com.gitea.runner.plist
```

On macOS and Windows hosts, jobs usually run with [host labels](../labels.md) and the tools installed on the machine.

## Windows

Install the `windows-amd64` binary and register it as a service with any service wrapper (for example `sc.exe` plus a wrapper such as [WinSW](https://github.com/winsw/winsw), or a scheduled task at boot). The runner itself has no service-installer subcommand.

Keep in mind for Windows hosts:

- `runner.post_task_script` accepts `.exe`, `.bat` and `.cmd` paths; `.ps1` is not supported as the configured path.
- host-mode jobs are terminated as a process tree, so tools that daemonize are not left behind.
