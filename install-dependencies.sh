#!/bin/bash
set -e
sudo cp /tmp/webapp-a2-main.zip /home

sudo unzip /home/webapp-a2-main.zip -d /home

sudo cp /tmp/start-web-app.service /etc/systemd/system

sudo adduser csye6225 --shell /usr/sbin/nologin

sudo chown -R csye6225:csye6225 /home/webapp-main

sudo systemctl daemon-reload

sudo systemctl enable start-web-app.service
