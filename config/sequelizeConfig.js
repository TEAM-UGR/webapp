    
const { Sequelize } = require('sequelize');
const dbConfig = require('./dbConfig');
require('dotenv').config();

const initializeSequelize = (databaseName) => {
  return new Sequelize(databaseName, process.env.USER, process.env.PASSWORD, {
    host: process.env.HOST,
    dialect: 'mysql',
    
  });
};

module.exports = initializeSequelize;
