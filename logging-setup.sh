#!/bin/bash
set -e

sudo mkdir -p /var/log/webapp-main

sudo touch /var/log/webapp-main/webapp.log

sudo cp /tmp/config.yaml /etc/google-cloud-ops-agent/config.yaml

sudo chown -R csye6225:csye6225 /etc/google-cloud-ops-agent/config.yaml

sudo chown -R csye6225:csye6225 /var/log/webapp-main/webapp.log

sudo systemctl restart google-cloud-ops-agent