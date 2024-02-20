#!/bin/bash

sudo yum update -y

sudo yum install -y mysql-server

sudo systemctl enable --now mysqld

curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -

sudo yum install -y nodejs

sudo yum install -y unzip
