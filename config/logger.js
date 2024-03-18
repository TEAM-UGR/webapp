const { json } = require("sequelize");
const winston = require("winston");
require('dotenv').config(); 

const { format } = require("winston");
const logger = winston.createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: process.env.ENV === "dev" ? "webapp.log" : "/var/log/webapp-main/webapp.log",
    }),
  ],
});

module.exports = logger;
