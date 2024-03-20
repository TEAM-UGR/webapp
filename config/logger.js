const { json } = require("sequelize");
const winston = require("winston");
require('dotenv').config(); 

const { format } = require("winston");
const logger = winston.createLogger({
  level: "debug",
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: process.env.ENV === "dev" ? "webapp.log" : "/var/log/webapp-main/webapp.log",
    }),
  ],
});

module.exports = logger;
