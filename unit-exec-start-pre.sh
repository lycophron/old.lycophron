#/usr/bin/bash

/usr/bin/podman container exists old.lycophron || /usr/bin/podman create --conmon-pidfile=/var/run/user/1000/containers/myPID-old.lycophron-12345.pid -p 8000:8100 --name old.lycophron --rm --healthcheck-interval 1m --healthcheck-timeout 30s --healthcheck-start-period 0s --healthcheck-retries 3 --healthcheck-command "CMD-SHELL curl http://localhost:8100  || exit 1" old.lycophron
