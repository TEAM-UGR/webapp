    
const { Sequelize } = require('sequelize');
const dbConfig = require('./dbConfig');

const initializeSequelize = (databaseName) => {
  return new Sequelize(databaseName, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    dialect: 'mysql',
    
  });
};

module.exports = initializeSequelize;
