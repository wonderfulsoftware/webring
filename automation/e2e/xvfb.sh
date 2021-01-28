#!/bin/sh

# By default, Xvfb included in `dorowu/ubuntu-desktop-lxde-vnc` does not allow external connections.
# See: https://github.com/fcwu/docker-ubuntu-vnc-desktop/blob/75c5f5549fb632bab2e12459a4ecb5ba0e2d52f7/rootfs/usr/local/bin/xvfb.sh

# By adding `-listen tcp -ac`, this allows other containers to use the X server for displaying GUI.
# See: https://github.com/theasp/docker-novnc/blob/master/conf.d/xvfb.conf

exec /usr/bin/Xvfb :1 -screen 0 1280x720x24 -listen tcp -ac