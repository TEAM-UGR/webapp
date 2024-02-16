require("dotenv").config();
const { Sequelize } = require("sequelize");


const initializeSequelize = (databaseName) => {
  return new Sequelize(databaseName, process.env.USER, process.env.PASSWORD, {
    host: process.env.HOST,
    dialect: "mysql",
  });
};

const bootstrapDatabase = async () => {
  try {
    await Sequelize.sync({ alter: true });
  } catch (error) {
    console.error("Error bootstrapping database:", error);
    process.exit(1);
  }
};

module.exports = bootstrapDatabase;

module.exports = initializeSequelize;
