const winston = require("winston");
let appRoot = require("app-root-path");
const { format } = require("winston");
const logger = winston.createLogger({
    level: 'info',
    format: format.combine(
      format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
      }),
      format.printf((info) =>
          JSON.stringify({
              timestamp: info.timestamp,
              level: info.level,
              message: info.message,
          })
      )
  ),
    transports: [
        new winston.transports.File({
            filename: appRoot + "/var/log/webapp-main/webapp.log",
          }),
        ],
})

module.exports = logger;