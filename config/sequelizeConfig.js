    
const { Sequelize } = require('sequelize');
const dbConfig = require('./dbConfig');
require('dotenv').config();

const initializeSequelize = (databaseName) => {
  return new Sequelize(databaseName, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    dialect: 'mysql',
    
  });
};

module.exports = initializeSequelize;
