#!/bin/bash

sudo cp /tmp/webapp-a2-main.zip /home

sudo unzip /home/webapp-a2-main.zip -d /home/webapp-a2-main

sudo cp /tmp/start-web-app.service /etc/systemd/system

sudo chown -R csye6225:csye6225 /home/webapp-a2-main

sudo systemctl daemon-reload

sudo systemctl enable start-web-app.service
