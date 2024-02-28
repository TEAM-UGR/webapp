#!/bin/bash
set -e
echo "======================= sudo yum update ================================"
sudo yum update -y

# echo "======================= install mysql server ================================"
# sudo yum install -y mysql-server

# echo "======================= enable mysqld ================================"
# sudo systemctl enable --now mysqld

# echo "======================= start mysqld ================================"
# sudo systemctl start mysqld.service

echo "======================= download node js ================================"
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -

echo "======================= install node js ================================"
sudo yum install -y nodejs

echo "======================= install unzip ================================"
sudo yum install -y unzip

# echo "======================= change password for sql ================================"
# sudo mysql --connect-expired-password -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';"