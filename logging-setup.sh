#!/bin/bash
set -e

echo "======================= Create folder structure for log file ================================"
sudo mkdir -p /var/log/webapp-main

echo "======================= Create log file ================================"
sudo touch /var/log/webapp-main/webapp.log

echo "======================= Copy config file to /tmp ================================"
sudo cp /tmp/config.yaml /etc/google-cloud-ops-agent/config.yaml

echo "======================= Change ownership of log file ================================"
sudo chown -R csye6225:csye6225 /var/log/webapp-main/webapp.log

echo "======================= Restart Ops agent ================================"
sudo systemctl restart google-cloud-ops-agent