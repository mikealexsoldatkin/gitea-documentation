---
sidebar_position: 1
slug: /
---

# Gitea Runner

This page will introduce the [Gitea Runner](https://gitea.com/gitea/runner) in detail, which is the runner for Gitea Actions.

## Requirements

Currently the runner supports three modes in which it can be run.
1. Host: runner will run as an application on the host. This provides no encapsulation.
2. Docker (recommended): Runs jobs in a [Docker](https://docker.com) container. If you choose this mode, you need to [install Docker](https://docs.docker.com/engine/install/) first and make sure that the Docker daemon is running.
3. Docker-in-Docker (DinD): Puts the runner into rootless mode. It then runs in a Docker container with its own Docker daemon that has fewer privileges. It will spawn job containers from there. Best security but more complex setup.

Other OCI container engines which are compatible with Docker's API should also work, but are untested.

However, if you are sure that you want to run jobs directly on the host only, then Docker is not required.

There are multiple ways to install the runner.

## Installation with binary

### Download the binary

You can download the binary from the [release page](https://gitea.com/gitea/runner/releases).
However, if you want to use the latest nightly build, you can download it from the [download page](https://dl.gitea.com/gitea-runner/).

When you download the binary, please make sure that you have downloaded the correct one for your platform.
You can check it by running the following command if you are in a Unix-style OS.

```bash
chmod +x runner
./runner --version
```

If you see the version information, it means that you have downloaded the correct binary.

### Obtain a registration token

Registration tokens are managed by your Gitea instance. Refer to the [Gitea Actions documentation](/usage/actions/runner) for details on obtaining a registration token at the instance, organization, or repository level.

### Configuration

Configuration is done via a configuration file. It is optional, and the default configuration will be used when no configuration file is specified. You can generate a configuration file by running the following command:

```bash
./runner generate-config
```

The default configuration is safe to use without any modification, so you can just use it directly.

```bash
./runner generate-config > config.yaml
./runner --config config.yaml [command]
```

### Register the runner

Registration is required before running Gitea Runner, because the runner needs to know where to get jobs from. It is also important for the Gitea instance to identify the runner.

If this has been installed using the binary package, the runner can be registered by running the following command.

```bash
./runner register
```

Alternatively, you can use the `--config` option to specify the configuration file mentioned in the previous section.

```bash
./runner --config config.yaml register
```

You will be asked to input the registration information step by step. This includes:

- The Gitea instance URL, like `https://gitea.com/` or `http://192.168.8.8:3000/`.
- The registration token.
- The runner name, which is optional. If you leave it blank, the hostname will be used.
- The runner labels, which is optional. If you leave it blank, the default labels will be used.

You may be confused about the runner labels, which will be explained later.

If you want to register the runner in a non-interactive way, you can use arguments to do it.

```bash
./runner register --no-interactive --instance <instance_url> --token <registration_token> --name <runner_name> --labels <runner_labels>
```

When you have registered the runner, you can find a new file named `.runner` in the current directory.
This file stores the registration information.
Please do not edit it manually.
If this file is missing or corrupted, you can simply remove it and register again.

If you want to store the registration information in another place, you can specify it in the configuration file,
and don't forget to specify the `--config` option.

#### Ephemeral Runners

Ephemeral runners provide a security hardening mechanism for enabling organization- or instance-wide runners without requiring full user trust. Once a job is assigned within a spot VM or container, the runner's exposed credentials are automatically revoked—blocking it from polling further jobs before any untrusted code runs, while still allowing it to report progress until completion by either Gitea or the runner.

The updated commands for registering the runner as ephemeral are listed below. Refer to the previous section for detailed information on registering the runner.

```bash
./runner register --ephemeral
```

```bash
./runner --config config.yaml register --ephemeral
```

```bash
./runner register --no-interactive --ephemeral --instance <instance_url> --token <registration_token> --name <runner_name> --labels <runner_labels>
```

The runner must be registered each time it is intended to receive a job. After completing the single job it is designed to execute, the runner terminates.

To automate the registration and startup of new runners when a job is queued, use the `workflow_job` webhook.

### Start the runner from the command line

After you have registered the runner, you can run it with the following command:

```shell
./runner daemon
```

or

```bash
./runner daemon --config config.yaml
```

The runner will fetch jobs from the Gitea instance and run them automatically.

### Start the runner with Systemd

It is also possible to run Gitea Runner as a [systemd](https://en.wikipedia.org/wiki/Systemd) service. Create an unprivileged `runner` user on your system, and create the following file in `/etc/systemd/system/runner.service`. The paths in `ExecStart` and `WorkingDirectory` may need to be adjusted depending on where you installed the `runner` binary, its configuration file, and the home directory of the `runner` user.

```ini
[Unit]
Description=Gitea Actions runner
Documentation=https://gitea.com/gitea/runner
After=docker.service

[Service]
ExecStart=/usr/local/bin/runner daemon --config /etc/runner/config.yaml
ExecReload=/bin/kill -s HUP $MAINPID
WorkingDirectory=/var/lib/runner
TimeoutSec=0
RestartSec=10
Restart=always
User=runner

[Install]
WantedBy=multi-user.target
```

Then:

```bash
# load the new systemd unit file
sudo systemctl daemon-reload
# start the service and enable it at boot
sudo systemctl enable runner --now
```

If using Docker, the `runner` user should also be added to the `docker` group before starting the service. Keep in mind that this effectively gives `runner` root access to the system [[1]](https://docs.docker.com/engine/security/#docker-daemon-attack-surface).

### Start the runner with LaunchDaemon (macOS)

Mac uses `launchd` in place of systemd for registering daemon processes. By default, daemons run as the root user, so if desired an unprivileged `_runner` user can be created via the `dscl` tool. The following file should then be created in the directory `/Library/LaunchDaemon/com.gitea.runner.plist`. The paths for `WorkingDirectory`, `ProgramArguments`, `StandardOutPath`, `StandardErrPath`, and the `HOME` environment variable may need to be updated to reflect your installation. Also note that any executables outside of the example `PATH` shown will need to be explicitly included and will not be inherited from existing configurations.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.gitea.runner</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/runner</string>
        <string>daemon</string>
        <string>--config</string>
        <string>/etc/runner/config.yaml</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>WorkingDirectory</key>
    <string>/var/lib/runner</string>
    <key>StandardOutPath</key>
    <string>/var/lib/runner/runner.log</string>
    <key>StandardErrorPath</key>
    <string>/var/lib/runner/runner.err</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
        <key>HOME</key>
        <string>/var/lib/runner</string>
    </dict>
    <key>UserName</key>
    <string>_runner</string>
</dict>
</plist>
```

Then:

```bash
sudo launchctl load /Library/LaunchDaemon/com.gitea.runner.plist
```

You can also set up a Linux or Windows service to let the runner run automatically.

## Install with the docker image

### Pull the image

You can use the docker image from [Docker Hub](https://hub.docker.com/r/gitea/runner/tags).
Just like the binary, you can use the latest nightly build by using the `nightly` tag, while the `latest` tag is the latest stable release.

```bash
docker pull docker.io/gitea/runner:latest # for the latest stable release
```

If you want to use the newest or experimental features, you can also use the nightly image.
```bash
docker pull docker.io/gitea/runner:nightly # for the latest nightly build
```

### Configuration

Configuration is optional, but you can also generate a config file with docker:

```bash
docker run --entrypoint="" --rm -it docker.io/gitea/runner:latest runner generate-config > config.yaml
```

When you are using the docker image, you can specify the configuration file by using the `CONFIG_FILE` environment variable. Make sure that the file is mounted into the container as a volume:

```bash
docker run -v $PWD/config.yaml:/config.yaml -e CONFIG_FILE=/config.yaml ...
```

### Start the runner with docker

If you are using the docker image, behavior will be slightly different. Registration and running are combined into one step in this case, so you need to specify the registration information when running the runner.

A quick start with docker run along with a minimal parameter set is shown below. You need a `<registration_token>` (see [how to obtain a registration token](/usage/actions/runner)), and set a unique name for `<gitea_runner_name>` and for `<container_name>`.

```bash
docker run \
    -e GITEA_INSTANCE_URL=<instance_url> \
    -e GITEA_RUNNER_REGISTRATION_TOKEN=<registration_token> \
    -e GITEA_RUNNER_NAME=<gitea_runner_name> \
    --name <container_name> \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -d docker.io/gitea/runner:latest
```

You can add more parameters to use a custom config, add a `data` directory for non-volatile file storage, etc.

```bash
docker run \
    -v $PWD/config.yaml:/config.yaml \
    -v $PWD/data:/data \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -e CONFIG_FILE=/config.yaml \
    -e GITEA_INSTANCE_URL=<instance_url> \
    -e GITEA_RUNNER_REGISTRATION_TOKEN=<registration_token> \
    -e GITEA_RUNNER_NAME=<gitea_runner_name> \
    -e GITEA_RUNNER_LABELS=<runner_labels> \
    --name <container_name> \
    -d docker.io/gitea/runner:latest
```

You may notice that we have mounted `/var/run/docker.sock` into the container.
This is because with this setup, the runner will execute jobs in temporary Docker containers, so it needs to communicate with the Docker daemon.
As mentioned, you can remove it if you want to run jobs on the host directly.
To be clear, the "host" actually means the container that is running the runner now, instead of the host machine.

---

To enable ephemeral runners, set the environment variable `GITEA_RUNNER_EPHEMERAL=1` in the runner image. This setup doesn't use a `/data` volume because the credentials are single-use and not intended to be reused. You can find more details about this mode under [Ephemeral runners](#ephemeral-runners).

```bash
docker run \
    -e GITEA_INSTANCE_URL=<instance_url> \
    -e GITEA_RUNNER_REGISTRATION_TOKEN=<registration_token> \
    -e GITEA_RUNNER_EPHEMERAL=1 \
    -e GITEA_RUNNER_NAME=<runner_name> \
    --name my_runner \
    -d docker.io/gitea/runner:nightly
```

```bash
docker run \
    -v $PWD/config.yaml:/config.yaml \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -e CONFIG_FILE=/config.yaml \
    -e GITEA_INSTANCE_URL=<instance_url> \
    -e GITEA_RUNNER_REGISTRATION_TOKEN=<registration_token> \
    -e GITEA_RUNNER_EPHEMERAL=1 \
    -e GITEA_RUNNER_NAME=<runner_name> \
    -e GITEA_RUNNER_LABELS=<runner_labels> \
    --name my_runner \
    -d docker.io/gitea/runner:nightly
```

Mounting the host's Docker socket using `/var/run/docker.sock:/var/run/docker.sock` introduces a potential security vulnerability. If a job can access this socket, the reusable `GITEA_RUNNER_REGISTRATION_TOKEN` could be exposed through Docker inspect data.

### Start the runner using docker compose

You could also set up the runner using the following `docker-compose.yml`:

```yml
version: "3.8"
services:
  runner:
    image: docker.io/gitea/runner:nightly
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

When using docker, there is no requirement to enter the container and manually run `./runner daemon` command as shown below. Once the container has been started successfully, it will show up as an active runner in your Gitea instance.

---

To enable ephemeral runners, set the environment variable `GITEA_RUNNER_EPHEMERAL=1` in the runner image. This setup doesn't use a `/data` volume because the credentials are single-use and not intended to be reused. You can find more details about this mode under [Ephemeral runners](#ephemeral-runners).

```yml
version: "3.8"
services:
  runner:
    image: docker.io/gitea/runner:nightly
    environment:
      CONFIG_FILE: /config.yaml
      GITEA_INSTANCE_URL: "${INSTANCE_URL}"
      GITEA_RUNNER_REGISTRATION_TOKEN: "${REGISTRATION_TOKEN}"
      GITEA_RUNNER_NAME: "${RUNNER_NAME}"
      GITEA_RUNNER_LABELS: "${RUNNER_LABELS}"
      GITEA_RUNNER_EPHEMERAL: "1"
    volumes:
      - ./config.yaml:/config.yaml
      - /var/run/docker.sock:/var/run/docker.sock
```

Mounting the host's Docker socket using `/var/run/docker.sock:/var/run/docker.sock` introduces a potential security vulnerability. If a job can access this socket, the reusable `GITEA_RUNNER_REGISTRATION_TOKEN` could be exposed through Docker inspect data.

### More start examples
A couple more usage examples can be found in the [runner](https://gitea.com/gitea/runner/src/branch/main/examples) repository.

## Advanced Configurations

### Configuring cache when starting a runner using the docker image

If you do not intend to use `actions/cache` in your workflow, you can ignore this section.

If you use `actions/cache` without any additional configuration, it will return the following error:
> Failed to restore: getCacheEntry failed: connect ETIMEDOUT IP:PORT

The error occurs because the runner container and job container are on different networks, so the job container cannot access the runner container.

Therefore, it is essential to configure the cache action to ensure its proper functioning. Follow these steps:

- 1. Obtain the LAN IP address of the host machine where the runner container is running.
- 2. Find an available port number on the host machine where the runner container is running.
- 3. Configure the following settings in the configuration file:

```yaml
cache:
  enabled: true
  dir: ""
  # Use the LAN IP obtained in step 1
  host: "192.168.8.17"
  # Use the port number obtained in step 2
  port: 8088
```

- 4. When starting the container, map the cache port to the host machine:

```bash
docker run \
  --name gitea-docker-runner \
  -p 8088:8088 \
  -d docker.io/gitea/runner:nightly
```

### Labels

The labels of a runner are used to determine which jobs the runner can run, and how to run them.

The default labels are `ubuntu-latest:docker://node:16-bullseye,ubuntu-22.04:docker://node:16-bullseye,ubuntu-20.04:docker://node:16-bullseye,ubuntu-18.04:docker://node:16-buster`.
It is a comma-separated list, and each item is a label.

Let's take `ubuntu-22.04:docker://node:16-bullseye` as an example.
It means that the runner can run jobs with `runs-on: ubuntu-22.04`, and the job will be run in a docker container with the image `node:16-bullseye`.

If the default image is insufficient for your needs, and you have enough disk space to use a better and bigger one, you can change it to `ubuntu-22.04:docker://<the image you like>`.
You can find more useful images on [act images](https://github.com/nektos/act/blob/master/IMAGES.md).

If you want to run jobs on the host directly, you can change it to `ubuntu-22.04:host` or just `ubuntu-22.04`; `:host` is optional.
However, we suggest you use a special name like `linux_amd64:host` or `windows:host` to avoid misusing it.

Starting with Gitea 1.21, you can change labels by modifying `runners.labels` in the runner configuration file (if you don't have a configuration file, please refer to [configuration tutorials](#configuration)).
The runner will use these new labels as soon as you restart it, i.e., by calling `./runner daemon --config config.yaml`.
